#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/fd7495ee8cb22bc644a8fd176acf8d7666fec642e35e3cb880d79e2569a22c52/contract';
import endContract from '../../snapshots/fd7495ee8cb22bc644a8fd176acf8d7666fec642e35e3cb880d79e2569a22c52/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Activity',
        columns: [
          col('action', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('actorId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('entityId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('entityType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('metadata', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Activity_action_check_5f86cb67',
            sql`"action" IN ('BOOKMARK_CREATED', 'BOOKMARK_UPDATED', 'BOOKMARK_DELETED', 'BOOKMARK_FAVORITED', 'BOOKMARK_UNFAVORITED', 'BOOKMARK_ARCHIVED', 'COLLECTION_CREATED', 'COLLECTION_UPDATED', 'COLLECTION_DELETED', 'NOTE_CREATED', 'NOTE_UPDATED', 'NOTE_DELETED', 'TAG_CREATED', 'TAG_DELETED', 'MEMBER_INVITED', 'MEMBER_REMOVED', 'ROLE_UPDATED')`,
          ),
          checkExpression(
            'Activity_entityType_check_e3a3eac4',
            sql`"entityType" IN ('BOOKMARK', 'COLLECTION', 'NOTE', 'TAG', 'WORKSPACE', 'MEMBER')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Bookmark',
        columns: [
          col('collectionId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('domain', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('favicon', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('isArchived', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('isFavorite', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('normalizedUrl', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('url', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userNotes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BookmarkNote',
        columns: [
          col('bookmarkId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('noteId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BookmarkTag',
        columns: [
          col('bookmarkId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('tagId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Collection',
        columns: [
          col('color', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('icon', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ExtensionCredential',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('expiresAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('lastUsedAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('revokedAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('tokenHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('tokenPrefix', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('userId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Note',
        columns: [
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('isArchived', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('isPinned', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Tag',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('normalizedName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('displayName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('firebaseUid', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('photoUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Workspace',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('isPersonal', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ownerId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'WorkspaceMember',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('MEMBER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('userId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'WorkspaceMember_role_check_50a44636',
            sql`"role" IN ('OWNER', 'ADMIN', 'MEMBER')`,
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Bookmark',
        constraint: 'Bookmark_workspaceId_normalizedUrl_key',
        columns: ['workspaceId', 'normalizedUrl'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'BookmarkNote',
        constraint: 'BookmarkNote_bookmarkId_noteId_key',
        columns: ['bookmarkId', 'noteId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'BookmarkTag',
        constraint: 'BookmarkTag_bookmarkId_tagId_key',
        columns: ['bookmarkId', 'tagId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Collection',
        constraint: 'Collection_workspaceId_name_key',
        columns: ['workspaceId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Collection',
        constraint: 'Collection_id_workspaceId_key',
        columns: ['id', 'workspaceId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'ExtensionCredential',
        constraint: 'ExtensionCredential_tokenHash_key',
        columns: ['tokenHash'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Tag',
        constraint: 'Tag_workspaceId_normalizedName_key',
        columns: ['workspaceId', 'normalizedName'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_firebaseUid_key',
        columns: ['firebaseUid'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Workspace',
        constraint: 'Workspace_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'WorkspaceMember',
        constraint: 'WorkspaceMember_workspaceId_userId_key',
        columns: ['workspaceId', 'userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Activity',
        index: 'Activity_actorId_createdAt_idx_0e9f1adf',
        columns: ['actorId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Activity',
        index: 'Activity_actorId_idx_a58f6b4b',
        columns: ['actorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Activity',
        index: 'Activity_workspaceId_createdAt_idx_5ff7e893',
        columns: ['workspaceId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Activity',
        index: 'Activity_workspaceId_entityType_entityId_idx_86ca1627',
        columns: ['workspaceId', 'entityType', 'entityId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Activity',
        index: 'Activity_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Bookmark',
        index: 'Bookmark_collectionId_idx_b344fc1a',
        columns: ['collectionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Bookmark',
        index: 'Bookmark_workspaceId_collectionId_idx_17a81e7f',
        columns: ['workspaceId', 'collectionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Bookmark',
        index: 'Bookmark_workspaceId_createdAt_idx_5ff7e893',
        columns: ['workspaceId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Bookmark',
        index: 'Bookmark_workspaceId_domain_idx_9708931d',
        columns: ['workspaceId', 'domain'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Bookmark',
        index: 'Bookmark_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Bookmark',
        index: 'Bookmark_workspaceId_isArchived_createdAt_idx_5815ab25',
        columns: ['workspaceId', 'isArchived', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Bookmark',
        index: 'Bookmark_workspaceId_isFavorite_createdAt_idx_b7ed85f1',
        columns: ['workspaceId', 'isFavorite', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Bookmark',
        index: 'bookmark_search_d46bcede',
        expression: sql`(setweight(to_tsvector('english', coalesce("title", '')), 'A') || setweight(to_tsvector('english', coalesce("domain", '')), 'A') || setweight(to_tsvector('english', coalesce("description", '')), 'B') || setweight(to_tsvector('english', coalesce("userNotes", '')), 'B'))`,
        extras: { type: 'gin' },
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookmarkNote',
        index: 'BookmarkNote_bookmarkId_idx_1962ac1f',
        columns: ['bookmarkId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookmarkNote',
        index: 'BookmarkNote_noteId_idx_0612c5b1',
        columns: ['noteId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookmarkTag',
        index: 'BookmarkTag_bookmarkId_idx_1962ac1f',
        columns: ['bookmarkId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookmarkTag',
        index: 'BookmarkTag_tagId_idx_86854244',
        columns: ['tagId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Collection',
        index: 'Collection_workspaceId_createdAt_idx_5ff7e893',
        columns: ['workspaceId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Collection',
        index: 'Collection_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Collection',
        index: 'collection_name_search_139e2a64',
        expression: sql`to_tsvector('english', "name")`,
        extras: { type: 'gin' },
      }),
      this.createIndex({
        schema: 'public',
        table: 'ExtensionCredential',
        index: 'ExtensionCredential_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ExtensionCredential',
        index: 'ExtensionCredential_userId_revokedAt_idx_eae4cbef',
        columns: ['userId', 'revokedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ExtensionCredential',
        index: 'ExtensionCredential_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ExtensionCredential',
        index: 'ExtensionCredential_workspaceId_userId_idx_6210ae03',
        columns: ['workspaceId', 'userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Note',
        index: 'Note_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Note',
        index: 'Note_workspaceId_isPinned_updatedAt_idx_44bacf54',
        columns: ['workspaceId', 'isPinned', 'updatedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Note',
        index: 'Note_workspaceId_updatedAt_idx_9c279e2a',
        columns: ['workspaceId', 'updatedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Note',
        index: 'note_search_d687e9fe',
        expression: sql`(setweight(to_tsvector('english', coalesce("title", '')), 'A') || setweight(to_tsvector('english', coalesce("content", '')), 'B'))`,
        extras: { type: 'gin' },
      }),
      this.createIndex({
        schema: 'public',
        table: 'Tag',
        index: 'Tag_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Tag',
        index: 'Tag_workspaceId_name_idx_f500a748',
        columns: ['workspaceId', 'name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Tag',
        index: 'tag_name_search_139e2a64',
        expression: sql`to_tsvector('english', "name")`,
        extras: { type: 'gin' },
      }),
      this.createIndex({
        schema: 'public',
        table: 'Workspace',
        index: 'Workspace_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Workspace',
        index: 'Workspace_ownerId_idx_e2d0c1ef',
        columns: ['ownerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WorkspaceMember',
        index: 'WorkspaceMember_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WorkspaceMember',
        index: 'WorkspaceMember_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WorkspaceMember',
        index: 'WorkspaceMember_workspaceId_role_idx_8dc1760e',
        columns: ['workspaceId', 'role'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Activity',
        foreignKey: {
          name: 'Activity_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Activity',
        foreignKey: {
          name: 'Activity_actorId_fkey',
          columns: ['actorId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Bookmark',
        foreignKey: {
          name: 'Bookmark_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Bookmark',
        foreignKey: {
          name: 'Bookmark_collectionId_fkey',
          columns: ['collectionId'],
          references: { schema: 'public', table: 'Collection', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BookmarkNote',
        foreignKey: {
          name: 'BookmarkNote_bookmarkId_fkey',
          columns: ['bookmarkId'],
          references: { schema: 'public', table: 'Bookmark', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BookmarkNote',
        foreignKey: {
          name: 'BookmarkNote_noteId_fkey',
          columns: ['noteId'],
          references: { schema: 'public', table: 'Note', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BookmarkTag',
        foreignKey: {
          name: 'BookmarkTag_bookmarkId_fkey',
          columns: ['bookmarkId'],
          references: { schema: 'public', table: 'Bookmark', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BookmarkTag',
        foreignKey: {
          name: 'BookmarkTag_tagId_fkey',
          columns: ['tagId'],
          references: { schema: 'public', table: 'Tag', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Collection',
        foreignKey: {
          name: 'Collection_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ExtensionCredential',
        foreignKey: {
          name: 'ExtensionCredential_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ExtensionCredential',
        foreignKey: {
          name: 'ExtensionCredential_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Note',
        foreignKey: {
          name: 'Note_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Tag',
        foreignKey: {
          name: 'Tag_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Workspace',
        foreignKey: {
          name: 'Workspace_ownerId_fkey',
          columns: ['ownerId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WorkspaceMember',
        foreignKey: {
          name: 'WorkspaceMember_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WorkspaceMember',
        foreignKey: {
          name: 'WorkspaceMember_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
