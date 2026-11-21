#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/5927a0bff08131ada7dcff7915c950a3959d0df66da25df52e99631fc4ddf9b8/contract';
import endContract from '../../snapshots/5927a0bff08131ada7dcff7915c950a3959d0df66da25df52e99631fc4ddf9b8/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/fd7495ee8cb22bc644a8fd176acf8d7666fec642e35e3cb880d79e2569a22c52/contract';
import startContract from '../../snapshots/fd7495ee8cb22bc644a8fd176acf8d7666fec642e35e3cb880d79e2569a22c52/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';

const contract = contractFromJson<End>(endContract);
const db = postgres({ contract });

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'BookmarkNote',
        constraint: 'BookmarkNote_bookmarkId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'BookmarkNote',
        constraint: 'BookmarkNote_noteId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'BookmarkTag',
        constraint: 'BookmarkTag_bookmarkId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'BookmarkTag',
        constraint: 'BookmarkTag_tagId_fkey',
        kind: 'foreignKey',
      }),
      this.addColumn({
        schema: 'public',
        table: 'BookmarkNote',
        column: col('workspaceId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
      }),
      this.dataTransform(contract, 'backfill-BookmarkNote-workspaceId', {
        backfillsColumn: { schema: 'public', table: 'BookmarkNote', column: 'workspaceId' },
        check: () => db.raw.sql`SELECT id FROM "BookmarkNote" WHERE "workspaceId" IS NULL LIMIT 1`.returnsRow({ id: {codecId: "pg/uuid@1"} }).build(),
        run: () => db.raw.sql`UPDATE "BookmarkNote" j SET "workspaceId" = b."workspaceId" FROM "Bookmark" b WHERE b.id = j."bookmarkId" AND j."workspaceId" IS NULL`.affectedCount().build(),
      }),
      this.setNotNull({ schema: 'public', table: 'BookmarkNote', column: 'workspaceId' }),
      this.addColumn({
        schema: 'public',
        table: 'BookmarkTag',
        column: col('workspaceId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
      }),
      this.dataTransform(contract, 'backfill-BookmarkTag-workspaceId', {
        backfillsColumn: { schema: 'public', table: 'BookmarkTag', column: 'workspaceId' },
        check: () => db.raw.sql`SELECT id FROM "BookmarkTag" WHERE "workspaceId" IS NULL LIMIT 1`.returnsRow({ id: {codecId: "pg/uuid@1"} }).build(),
        run: () => db.raw.sql`UPDATE "BookmarkTag" j SET "workspaceId" = b."workspaceId" FROM "Bookmark" b WHERE b.id = j."bookmarkId" AND j."workspaceId" IS NULL`.affectedCount().build(),
      }),
      this.setNotNull({ schema: 'public', table: 'BookmarkTag', column: 'workspaceId' }),
      this.addUnique({
        schema: 'public',
        table: 'Bookmark',
        constraint: 'Bookmark_id_workspaceId_key',
        columns: ['id', 'workspaceId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Note',
        constraint: 'Note_id_workspaceId_key',
        columns: ['id', 'workspaceId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Tag',
        constraint: 'Tag_id_workspaceId_key',
        columns: ['id', 'workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Bookmark',
        index: 'Bookmark_collectionId_workspaceId_idx_b77573d3',
        columns: ['collectionId', 'workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookmarkNote',
        index: 'BookmarkNote_bookmarkId_workspaceId_idx_410a4d97',
        columns: ['bookmarkId', 'workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookmarkNote',
        index: 'BookmarkNote_noteId_workspaceId_idx_27e13d70',
        columns: ['noteId', 'workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookmarkTag',
        index: 'BookmarkTag_bookmarkId_workspaceId_idx_410a4d97',
        columns: ['bookmarkId', 'workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookmarkTag',
        index: 'BookmarkTag_tagId_workspaceId_idx_5a3677fa',
        columns: ['tagId', 'workspaceId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Bookmark',
        foreignKey: {
          name: 'Bookmark_collectionId_workspaceId_fkey',
          columns: ['collectionId', 'workspaceId'],
          references: { schema: 'public', table: 'Collection', columns: ['id', 'workspaceId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BookmarkNote',
        foreignKey: {
          name: 'BookmarkNote_bookmarkId_workspaceId_fkey',
          columns: ['bookmarkId', 'workspaceId'],
          references: { schema: 'public', table: 'Bookmark', columns: ['id', 'workspaceId'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BookmarkNote',
        foreignKey: {
          name: 'BookmarkNote_noteId_workspaceId_fkey',
          columns: ['noteId', 'workspaceId'],
          references: { schema: 'public', table: 'Note', columns: ['id', 'workspaceId'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BookmarkTag',
        foreignKey: {
          name: 'BookmarkTag_bookmarkId_workspaceId_fkey',
          columns: ['bookmarkId', 'workspaceId'],
          references: { schema: 'public', table: 'Bookmark', columns: ['id', 'workspaceId'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BookmarkTag',
        foreignKey: {
          name: 'BookmarkTag_tagId_workspaceId_fkey',
          columns: ['tagId', 'workspaceId'],
          references: { schema: 'public', table: 'Tag', columns: ['id', 'workspaceId'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
