import { randomUUID } from "node:crypto";
import { z } from "zod";
import { invalid, missing, type Context, type Handler } from "./api";
import { metadata } from "./bookmark-url";

const title = z.string().trim().min(1).max(500);
const detail = z.string().max(10000).nullable();
const ids = z
  .array(z.uuid())
  .max(100)
  .transform((values) => [...new Set(values)]);
const collection = z.strictObject({
  name: title,
  description: detail.optional(),
  icon: z.string().max(200).nullable().optional(),
  color: z.string().max(60).nullable().optional(),
});
const bookmark = z.strictObject({
  url: z.string().max(4096),
  title: title.optional(),
  description: detail.optional(),
  userNotes: detail.optional(),
  collectionId: z.uuid().nullable().optional(),
  tagIds: ids.optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});
const note = z.strictObject({
  title,
  content: z.string().max(200000),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  bookmarkIds: ids.optional(),
});
type Model = "Bookmark" | "Note" | "Tag" | "Collection";
type Fields = Record<string, unknown>;
function names(fields: Fields) {
  return Object.keys(fields).map((k) => '"' + k + '"');
}
async function audit(ctx: Context, model: Model, id: string, action: string) {
  await ctx.db.query(
    'INSERT INTO "Activity" (id,"workspaceId","actorId",action,"entityType","entityId") VALUES ($1,$2,$3,$4,$5,$6)',
    [
      randomUUID(),
      ctx.workspaceId,
      ctx.userId,
      model.toUpperCase() + "_" + action,
      model.toUpperCase(),
      id,
    ],
  );
}
// Callers pass only keys from strict schemas or server-generated fields.
async function save(
  ctx: Context,
  model: Model,
  id: string | undefined,
  fields: Fields,
) {
  if (id) {
    const set = names(fields).map((name, i) => name + "=$" + (i + 3));
    set.push('"updatedAt"=now()');
    const { rows } = await ctx.db.query(
      `UPDATE "${model}" SET ${set.join(",")} WHERE id=$1 AND "workspaceId"=$2 RETURNING *`,
      [id, ctx.workspaceId, ...Object.values(fields)],
    );
    if (!rows.length) missing();
    return rows[0];
  }
  const values = { id: randomUUID(), workspaceId: ctx.workspaceId, ...fields };
  const slots = Object.keys(values).map((_, i) => "$" + (i + 1));
  return (
    await ctx.db.query(
      `INSERT INTO "${model}" (${names(values)}) VALUES (${slots}) RETURNING *`,
      Object.values(values),
    )
  ).rows[0];
}
function remove(model: Model): Handler {
  return async (ctx, _req, id) => {
    const result = await ctx.db.query(
      `DELETE FROM "${model}" WHERE id=$1 AND "workspaceId"=$2`,
      [id, ctx.workspaceId],
    );
    if (!result.rowCount || !id) missing();
    await audit(ctx, model, id, "DELETED");
    return { data: { id } };
  };
}
export const deleteBookmark = remove("Bookmark"),
  deleteNote = remove("Note"),
  deleteTag = remove("Tag"),
  deleteCollection = remove("Collection");

async function replaceLinks(
  ctx: Context,
  kind: "tags" | "bookmarks",
  id: string,
  links: string[] | undefined,
) {
  if (!links) return;
  const [table, parent, other] =
    kind === "tags"
      ? ["BookmarkTag", "bookmarkId", "tagId"]
      : ["BookmarkNote", "noteId", "bookmarkId"];
  await ctx.db.query(
    `DELETE FROM "${table}" WHERE "${parent}"=$1 AND "workspaceId"=$2`,
    [id, ctx.workspaceId],
  );
  await ctx.db.query(
    `INSERT INTO "${table}" (id,"workspaceId","${parent}","${other}") SELECT gen_random_uuid(),$1,$2,link FROM unnest($3::uuid[]) link`,
    [ctx.workspaceId, id, links],
  );
}
export const writeBookmark: Handler = async (ctx, req, id) => {
  const input = await req.json();
  let fields: Fields;
  let links: string[] | undefined;
  let action = id ? "UPDATED" : "CREATED";
  if (id) {
    const { tagIds, ...patch } = bookmark
      .omit({ url: true })
      .partial()
      .parse(input);
    fields = patch;
    links = tagIds;
    if (patch.isFavorite !== undefined)
      action = patch.isFavorite ? "FAVORITED" : "UNFAVORITED";
    else if (patch.isArchived) action = "ARCHIVED";
  } else {
    const { tagIds, url, ...rest } = bookmark.parse(input);
    fields = { ...(await metadata(url)), ...rest };
    links = tagIds;
  }
  const row = await save(ctx, "Bookmark", id, fields);
  await replaceLinks(ctx, "tags", row.id, links);
  await audit(ctx, "Bookmark", row.id, action);
  return { data: row, status: id ? 200 : 201 };
};
export const readBookmark: Handler = async (ctx, _req, id) => {
  const { rows } = await ctx.db.query(
    `SELECT b.*,to_jsonb(c) AS collection,
    coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY t.name) FROM "BookmarkTag" j JOIN "Tag" t ON t.id=j."tagId" AND t."workspaceId"=j."workspaceId" WHERE j."bookmarkId"=b.id AND j."workspaceId"=b."workspaceId"),'[]') AS tags,
    coalesce((SELECT jsonb_agg(to_jsonb(n) ORDER BY n.id) FROM "BookmarkNote" j JOIN "Note" n ON n.id=j."noteId" AND n."workspaceId"=j."workspaceId" WHERE j."bookmarkId"=b.id AND j."workspaceId"=b."workspaceId"),'[]') AS notes
    FROM "Bookmark" b LEFT JOIN "Collection" c ON c.id=b."collectionId" AND c."workspaceId"=b."workspaceId" WHERE b.id=$1 AND b."workspaceId"=$2`,
    [id, ctx.workspaceId],
  );
  if (!rows.length) missing();
  return { data: rows[0] };
};
export const writeNote: Handler = async (ctx, req, id) => {
  const { bookmarkIds, ...fields } = (id ? note.partial() : note).parse(
    await req.json(),
  );
  const row = await save(ctx, "Note", id, fields);
  await replaceLinks(ctx, "bookmarks", row.id, bookmarkIds);
  await audit(ctx, "Note", row.id, id ? "UPDATED" : "CREATED");
  return { data: row, status: id ? 200 : 201 };
};
export const writeCollection: Handler = async (ctx, req, id) => {
  const fields = (id ? collection.partial() : collection).parse(
    await req.json(),
  );
  const row = await save(ctx, "Collection", id, fields);
  await audit(ctx, "Collection", row.id, id ? "UPDATED" : "CREATED");
  return { data: row, status: id ? 200 : 201 };
};
export const writeTag: Handler = async (ctx, req) => {
  const { name } = z.strictObject({ name: title }).parse(await req.json());
  const newId = randomUUID();
  const row = (
    await ctx.db.query(
      `INSERT INTO "Tag" (id,"workspaceId",name,"normalizedName") VALUES ($1,$2,$3,$4)
    ON CONFLICT ("workspaceId","normalizedName") DO UPDATE SET name="Tag".name RETURNING *`,
      [newId, ctx.workspaceId, name, name.normalize("NFKC").toLowerCase()],
    )
  ).rows[0];
  if (row.id === newId) await audit(ctx, "Tag", row.id, "CREATED");
  return { data: row, status: row.id === newId ? 201 : 200 };
};
export const collections: Handler = async (ctx) => ({
  data: (
    await ctx.db.query(
      `SELECT c.*,count(b.id)::int AS "bookmarkCount" FROM "Collection" c LEFT JOIN "Bookmark" b ON b."collectionId"=c.id AND b."workspaceId"=c."workspaceId" WHERE c."workspaceId"=$1 GROUP BY c.id ORDER BY c.name,c.id`,
      [ctx.workspaceId],
    )
  ).rows,
});
export const tags: Handler = async (ctx) => ({
  data: (
    await ctx.db.query(
      `SELECT t.*,count(j.id)::int AS "bookmarkCount" FROM "Tag" t LEFT JOIN "BookmarkTag" j ON j."tagId"=t.id AND j."workspaceId"=t."workspaceId" WHERE t."workspaceId"=$1 GROUP BY t.id ORDER BY t.name,t.id`,
      [ctx.workspaceId],
    )
  ).rows,
});

export function list(model: "Bookmark" | "Note" | "Activity"): Handler {
  return async (ctx, req) => {
    const p = new URL(req.url).searchParams;
    const page = z.coerce
      .number()
      .int()
      .min(1)
      .max(1000000)
      .parse(p.get("page") ?? 1);
    const limit = z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .parse(p.get("limit") ?? 20);
    const values: unknown[] = [ctx.workspaceId];
    const conditions = ['r."workspaceId"=$1'];
    function filter(expression: string, value: unknown) {
      values.push(value);
      conditions.push(expression.replace("?", "$" + values.length));
    }
    for (const key of model === "Bookmark"
      ? ["isFavorite", "isArchived"]
      : model === "Note"
        ? ["isPinned", "isArchived"]
        : []) {
      if (p.has(key))
        filter(
          'r."' + key + '"=?',
          z.enum(["true", "false"]).parse(p.get(key)) === "true",
        );
    }
    if (model === "Bookmark") {
      if (p.has("collectionId"))
        filter('r."collectionId"=?', z.uuid().parse(p.get("collectionId")));
      if (p.has("domain")) filter("r.domain=?", p.get("domain")?.toLowerCase());
      if (p.has("tag"))
        filter(
          'EXISTS (SELECT 1 FROM "BookmarkTag" j JOIN "Tag" t ON t.id=j."tagId" WHERE j."bookmarkId"=r.id AND j."workspaceId"=r."workspaceId" AND ? IN (t.id::text,t."normalizedName"))',
          p.get("tag")?.normalize("NFKC").toLowerCase(),
        );
    }
    const date = model === "Note" ? "updatedAt" : "createdAt";
    const from = `FROM "${model}" r WHERE ${conditions.join(" AND ")}`;
    const { rows } = await ctx.db.query(
      `SELECT (SELECT count(*)::int ${from}) AS total, coalesce((SELECT jsonb_agg(p ORDER BY p."${date}" DESC,p.id DESC) FROM (SELECT r.* ${from} ORDER BY r."${date}" DESC,r.id DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}) p),'[]') AS data`,
      [...values, limit, (page - 1) * limit],
    );
    return {
      data: rows[0].data,
      meta: {
        page,
        limit,
        total: rows[0].total,
        hasMore: page * limit < rows[0].total,
      },
    };
  };
}
export const search: Handler = async (ctx, req) => {
  const query = new URL(req.url).searchParams.get("q")?.trim();
  if (!query || query.length > 300)
    invalid("Search requires 1 to 300 characters.");
  const specs = [
    [
      "Bookmark",
      "title",
      [
        ["title", "A"],
        ["domain", "A"],
        ["description", "B"],
        ["userNotes", "B"],
      ],
    ],
    [
      "Note",
      "title",
      [
        ["title", "A"],
        ["content", "B"],
      ],
    ],
    ["Collection", "name", []],
    ["Tag", "name", []],
  ] as const;
  const selections = specs.map(([table, label, fields]) => {
    const vector = fields.length
      ? fields
          .map(
            ([field, weight]) =>
              `setweight(to_tsvector('english',coalesce("${field}",'')),'${weight}')`,
          )
          .join(" || ")
      : "to_tsvector('english',name)";
    return `SELECT id,'${table}' AS type,"${label}" AS title,ts_rank((${vector}),q) AS rank FROM "${table}", query WHERE "workspaceId"=$1 AND (${vector}) @@ q`;
  });
  const { rows } = await ctx.db.query(
    `WITH query AS (SELECT websearch_to_tsquery('english',$2) AS q) ${selections.join(" UNION ALL ")} ORDER BY rank DESC,id LIMIT 100`,
    [ctx.workspaceId, query],
  );
  return { data: rows };
};
