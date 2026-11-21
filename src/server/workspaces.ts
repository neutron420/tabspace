import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ApiError, createWorkspace, missing, type Handler } from "./api";

const settings = z.strictObject({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
});
export const listWorkspaces: Handler = async (ctx) => {
  const result = await ctx.db.query(
    `SELECT w.*, m.role FROM "Workspace" w JOIN "WorkspaceMember" m ON m."workspaceId"=w.id
    WHERE m."userId"=$1 AND ($2::uuid IS NULL OR w.id=$2) ORDER BY w."isPersonal" DESC,w."createdAt",w.id`,
    [ctx.userId, ctx.extension ? ctx.workspaceId : null],
  );
  return { data: result.rows };
};
export const profile: Handler = async (ctx, req) => {
  const user = (
    await ctx.db.query('SELECT * FROM "User" WHERE id=$1', [ctx.userId])
  ).rows[0];
  const memberships = (await listWorkspaces(ctx, req)).data;
  const activeWorkspace = (
    await ctx.db.query('SELECT * FROM "Workspace" WHERE id=$1', [
      ctx.workspaceId,
    ])
  ).rows[0];
  return { data: { user, activeWorkspace, memberships } };
};
export const newWorkspace: Handler = async (ctx, req) => {
  if (ctx.extension)
    throw new ApiError(403, "FORBIDDEN", "Sign in to create a workspace.");
  const { name, slug } = settings
    .partial({ slug: true })
    .parse(await req.json());
  return {
    status: 201,
    data: await createWorkspace(
      ctx.db,
      ctx.userId,
      name,
      slug ?? "team-" + randomUUID(),
    ),
  };
};
export const workspace: Handler = async (ctx, req, id) => {
  if (ctx.extension && id !== ctx.workspaceId) missing();
  const row = (
    await ctx.db.query(
      'SELECT w.*,m.role FROM "Workspace" w JOIN "WorkspaceMember" m ON m."workspaceId"=w.id WHERE w.id=$1 AND m."userId"=$2 FOR SHARE OF m',
      [id, ctx.userId],
    )
  ).rows[0];
  if (!row) missing();
  if (req.method === "PATCH") {
    if (!["OWNER", "ADMIN"].includes(row.role) || ctx.extension)
      throw new ApiError(
        403,
        "FORBIDDEN",
        "Workspace administrator access is required.",
      );
    const fields = settings.partial().parse(await req.json());
    return {
      data: (
        await ctx.db.query(
          'UPDATE "Workspace" SET name=coalesce($2,name),slug=coalesce($3,slug),"updatedAt"=now() WHERE id=$1 RETURNING *',
          [id, fields.name, fields.slug],
        )
      ).rows[0],
    };
  }
  const members = (
    await ctx.db.query(
      'SELECT m."userId",m.role,u."displayName",u."photoUrl" FROM "WorkspaceMember" m JOIN "User" u ON u.id=m."userId" WHERE m."workspaceId"=$1 ORDER BY m."createdAt",m.id',
      [id],
    )
  ).rows;
  return { data: { ...row, members } };
};
