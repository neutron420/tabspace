import { createHash, randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { ApiError, missing, type Handler } from "./api";

const input = z.strictObject({
  name: z.string().trim().min(1).max(120),
  expiresAt: z.iso.datetime({ offset: true }).nullable().optional(),
});

export const listCredentials: Handler = async (ctx) => {
  if (ctx.extension) throw new ApiError(403, "FORBIDDEN", "Sign in to manage credentials.");
  const { rows } = await ctx.db.query(
    `SELECT id,name,"tokenPrefix","lastUsedAt","expiresAt","revokedAt","createdAt"
     FROM "ExtensionCredential" WHERE "workspaceId"=$1 AND "userId"=$2 ORDER BY "createdAt" DESC,id DESC`,
    [ctx.workspaceId, ctx.userId],
  );
  return { data: rows };
};

export const createCredential: Handler = async (ctx, request) => {
  if (ctx.extension) throw new ApiError(403, "FORBIDDEN", "Sign in to manage credentials.");
  const { name, expiresAt } = input.parse(await request.json());
  if (expiresAt && Date.parse(expiresAt) <= Date.now())
    throw new ApiError(400, "VALIDATION_ERROR", "Expiration must be in the future.");
  const secret = randomBytes(32).toString("hex");
  const tokenPrefix = secret.slice(0, 8);
  const token = `tab_live_${tokenPrefix}_${secret}`;
  const { rows } = await ctx.db.query(
    `INSERT INTO "ExtensionCredential" (id,"workspaceId","userId",name,"tokenHash","tokenPrefix","expiresAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id,name,"tokenPrefix","expiresAt","createdAt"`,
    [randomUUID(), ctx.workspaceId, ctx.userId, name,
      createHash("sha256").update(token).digest("hex"), tokenPrefix, expiresAt ?? null],
  );
  return { status: 201, data: { ...rows[0], token } };
};

export const revokeCredential: Handler = async (ctx, _request, id) => {
  if (ctx.extension) throw new ApiError(403, "FORBIDDEN", "Sign in to manage credentials.");
  const { rows } = await ctx.db.query(
    `UPDATE "ExtensionCredential" SET "revokedAt"=coalesce("revokedAt",now()),"updatedAt"=now()
     WHERE id=$1 AND "workspaceId"=$2 AND "userId"=$3 RETURNING id,"revokedAt"`,
    [id, ctx.workspaceId, ctx.userId],
  );
  if (!rows.length) missing();
  return { data: rows[0] };
};
