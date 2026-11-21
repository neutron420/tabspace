import { connection } from "next/server";
import { Pool, type PoolClient } from "pg";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function missing(): never {
  throw new ApiError(
    404,
    "RESOURCE_NOT_FOUND",
    "Resource not found in this workspace.",
  );
}
export function invalid(message: string): never {
  throw new ApiError(400, "VALIDATION_ERROR", message);
}
function denied(): never {
  throw new ApiError(403, "FORBIDDEN", "Access denied.");
}
function unauthorized(): never {
  throw new ApiError(401, "UNAUTHORIZED", "A valid bearer token is required.");
}
type Identity =
  | { uid: string; email?: string; name?: string; picture?: string }
  | { hash: string };
async function identify(req: Request): Promise<Identity> {
  const token = /^Bearer ([^\s]+)$/i.exec(
    req.headers.get("authorization") ?? "",
  )?.[1];
  if (!token || token.length > 16000) unauthorized();
  if (token.startsWith("tab_live_"))
    return { hash: createHash("sha256").update(token).digest("hex") };
  const {
    FIREBASE_PROJECT_ID: projectId,
    FIREBASE_CLIENT_EMAIL: clientEmail,
    FIREBASE_PRIVATE_KEY,
  } = process.env;
  if (!projectId || !clientEmail || !FIREBASE_PRIVATE_KEY)
    throw new ApiError(
      503,
      "SERVICE_UNAVAILABLE",
      "Authentication is not configured.",
    );
  const app =
    getApps().find((app) => app.name === "tabspace") ??
    initializeApp(
      {
        credential: cert({
          projectId,
          clientEmail,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      },
      "tabspace",
    );
  try {
    return await getAuth(app).verifyIdToken(token, true);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (
      [
        "auth/id-token-expired",
        "auth/id-token-revoked",
        "auth/invalid-id-token",
        "auth/argument-error",
        "auth/user-disabled",
        "auth/user-not-found",
      ].includes(code ?? "")
    )
      unauthorized();
    throw new ApiError(
      503,
      "SERVICE_UNAVAILABLE",
      "Authentication is temporarily unavailable.",
    );
  }
}
export type Context = {
  db: PoolClient;
  userId: string;
  workspaceId: string;
  role: string;
  extension: boolean;
};
export type Result = { data: unknown; status?: number; meta?: unknown };
export type Handler = (
  ctx: Context,
  request: Request,
  id?: string,
) => Promise<Result>;
let pool: Pool | undefined;
async function provision(
  db: PoolClient,
  identity: Exclude<Identity, { hash: string }>,
) {
  if (!identity.email)
    invalid("The verified account requires an email address.");
  // Serialize first sign-ins for this UID, including requests from different server instances.
  await db.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
    identity.uid,
  ]);
  const existing = await db.query(
    'SELECT id FROM "User" WHERE "firebaseUid"=$1',
    [identity.uid],
  );
  const fields = [
    identity.uid,
    identity.email,
    identity.name ?? null,
    identity.picture ?? null,
  ];
  if (existing.rowCount) {
    await db.query(
      'UPDATE "User" SET email=$2,"displayName"=$3,"photoUrl"=$4,"updatedAt"=now() WHERE "firebaseUid"=$1',
      fields,
    );
    return existing.rows[0].id as string;
  }
  const userId = randomUUID();
  await db.query(
    'INSERT INTO "User" ("firebaseUid",email,"displayName","photoUrl",id) VALUES ($1,$2,$3,$4,$5)',
    [...fields, userId],
  );
  await createWorkspace(
    db,
    userId,
    "Personal Workspace",
    "personal-" + userId,
    true,
  );
  return userId;
}
export async function createWorkspace(
  db: PoolClient,
  userId: string,
  name: string,
  slug: string,
  personal = false,
) {
  const id = randomUUID();
  const { rows } = await db.query(
    'INSERT INTO "Workspace" (id,name,slug,"ownerId","isPersonal") VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [id, name, slug, userId, personal],
  );
  await db.query(
    'INSERT INTO "WorkspaceMember" (id,"workspaceId","userId",role) VALUES ($1,$2,$3,\'OWNER\')',
    [randomUUID(), id, userId],
  );
  return rows[0];
}
async function context(
  db: PoolClient,
  identity: Identity,
  request: Request,
  sync: boolean,
): Promise<Context> {
  const header = request.headers.get("x-workspace-id");
  if (header !== null) z.uuid().parse(header);
  let userId: string;
  let scoped = header;
  if ("hash" in identity) {
    if (sync) denied();
    const { rows } = await db.query(
      'UPDATE "ExtensionCredential" SET "lastUsedAt"=now() WHERE "tokenHash"=$1 AND "revokedAt" IS NULL AND ("expiresAt" IS NULL OR "expiresAt">now()) RETURNING "userId","workspaceId"',
      [identity.hash],
    );
    if (!rows.length) unauthorized();
    userId = rows[0].userId;
    if (header && header !== rows[0].workspaceId) denied();
    scoped = rows[0].workspaceId;
  } else if (sync) userId = await provision(db, identity);
  else {
    const { rows } = await db.query(
      'SELECT id FROM "User" WHERE "firebaseUid"=$1',
      [identity.uid],
    );
    if (!rows.length)
      throw new ApiError(
        409,
        "PROFILE_SYNC_REQUIRED",
        "Sync your profile first.",
      );
    userId = rows[0].id;
  }
  const { rows } = await db.query(
    `SELECT m.role,w.id FROM "WorkspaceMember" m JOIN "Workspace" w ON w.id=m."workspaceId"
    WHERE m."userId"=$1 AND ($2::uuid IS NULL OR w.id=$2)
    ORDER BY w."isPersonal" DESC,w."createdAt",w.id LIMIT 1 FOR SHARE OF m`,
    [userId, scoped],
  );
  if (!rows.length) denied();
  return {
    db,
    userId,
    workspaceId: rows[0].id,
    role: rows[0].role,
    extension: "hash" in identity,
  };
}
export function route(handler: Handler, sync = false) {
  return async (
    request: Request,
    params: { params: Promise<{ id?: string }> },
  ) => {
    // Protected responses always depend on the incoming request.
    await connection();
    const headers = { "Cache-Control": "private, no-store" };
    try {
      const identity = await identify(request);
      const id = (await params.params).id;
      if (id !== undefined) z.uuid().parse(id);
      if (!process.env.DATABASE_URL)
        throw new ApiError(
          503,
          "SERVICE_UNAVAILABLE",
          "Database is not configured.",
        );
      if (!pool) {
        pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          max: 5,
          connectionTimeoutMillis: 5000,
        });
        pool.on("error", () => console.error("Idle PostgreSQL connection failed"));
      }
      const db = await pool.connect();
      let discard = false;
      try {
        await db.query("BEGIN");
        const ctx = await context(db, identity, request, sync);
        const { status = 200, ...result } = await handler(ctx, request, id);
        await db.query("COMMIT");
        return Response.json({ success: true, ...result }, { status, headers });
      } catch (err) {
        try {
          await db.query("ROLLBACK");
        } catch {
          discard = true;
        }
        throw err;
      } finally {
        db.release(discard);
      }
    } catch (err) {
      const code = (err as { code?: string }).code;
      let error = new ApiError(
        500,
        "INTERNAL_SERVER_ERROR",
        "The request could not be completed.",
      );
      if (err instanceof ApiError) error = err;
      else if (err instanceof z.ZodError || err instanceof SyntaxError)
        error = new ApiError(
          400,
          "VALIDATION_ERROR",
          "Invalid request fields or JSON.",
        );
      else if (code === "23505")
        error = new ApiError(409, "CONFLICT", "This resource already exists.");
      else if (code === "23503")
        error = new ApiError(
          400,
          "INVALID_RELATION",
          "A linked resource is unavailable in this workspace.",
        );
      else console.error("TabSpace API failure", code ?? "unknown");
      return Response.json(
        {
          success: false,
          error: { code: error.code, message: error.message, details: null },
        },
        { status: error.status, headers },
      );
    }
  };
}
