# TabSpace – Database Architecture Specification

## 1. System Overview

TabSpace is a personal and team digital workspace SaaS providing bookmark management, tagging, collections, rich Markdown notes, activity audit logging, and Chrome extension integration.

### Core Architecture Principles
- **PostgreSQL 18+ (Hosted on Neon)**: Source of truth for relational integrity, JSON metadata, full-text search, and transactional isolation.
- **Prisma 8 ORM (`@prisma/orm-postgres`)**: Type-safe contract-first schema definition, automated migration planning, and high-performance ORM runtime.
- **Tenant Isolation**: Every entity belongs directly to a `Workspace`. Cross-workspace queries are prohibited at the database constraint level and validated at the service layer.
- **External Identity Federation**: Firebase Authentication is used exclusively for client authentication (Google Sign-In). PostgreSQL maps identity through `User.firebaseUid`.
- **Zero Sensitive Data in DB**: No Google OAuth tokens, passwords, or raw extension API keys are ever stored in PostgreSQL.

---

## 2. Key Identifier Convention

All primary keys use **PostgreSQL native `uuid` with version 7** (`uuid(7)`):
- Time-ordered (k-sortable) to prevent index page fragmentation and preserve B-tree locality.
- 16-byte binary storage (55% more compact than 36-char string UUIDs or 25-char CUIDs).
- Native database equality operators (`=`) and sorting operations.
- Declared in Prisma 8 as:
  ```prisma
  id Uuid @id @onCreate(uuid(7))
  ```

---

## 3. Schema Models and Specifications

### 3.1 User Model
Represents an individual user authenticated through Firebase.
```prisma
model User {
  id                   Uuid                  @id @onCreate(uuid(7))
  firebaseUid          String                @unique
  email                String                @unique
  displayName          String?
  photoUrl             String?
  createdAt            DateTime              @default(now()) @onCreate(now())
  updatedAt            DateTime              @default(now()) @onCreate(now()) @onUpdate(now())

  ownedWorkspaces      Workspace[]           @relation("WorkspaceOwner")
  memberships          WorkspaceMember[]
  activities           Activity[]
  extensionCredentials ExtensionCredential[]
}
```

### 3.2 Workspace Model
The fundamental tenant boundary. Every bookmark, collection, tag, note, and activity belongs to a workspace.
```prisma
model Workspace {
  id                   Uuid                  @id @onCreate(uuid(7))
  name                 String
  slug                 String                @unique
  isPersonal           Boolean               @default(true)
  ownerId              Uuid
  owner                User                  @relation("WorkspaceOwner", fields: [ownerId], references: [id], onDelete: Restrict)
  createdAt            DateTime              @default(now()) @onCreate(now())
  updatedAt            DateTime              @default(now()) @onCreate(now()) @onUpdate(now())

  members              WorkspaceMember[]
  collections          Collection[]
  bookmarks            Bookmark[]
  tags                 Tag[]
  notes                Note[]
  activities           Activity[]
  extensionCredentials ExtensionCredential[]

  @@index([ownerId])
  @@index([createdAt])
}
```

### 3.3 WorkspaceMember Model
Manages workspace membership and role-based access control (RBAC).
```prisma
enum WorkspaceRole {
  @@type("pg/text@1")
  OWNER  = "OWNER"
  ADMIN  = "ADMIN"
  MEMBER = "MEMBER"
}

model WorkspaceMember {
  id          Uuid          @id @onCreate(uuid(7))
  workspaceId Uuid
  userId      Uuid
  role        WorkspaceRole @default(MEMBER)
  createdAt   DateTime      @default(now()) @onCreate(now())
  updatedAt   DateTime      @default(now()) @onCreate(now()) @onUpdate(now())

  workspace   Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
  @@index([userId])
  @@index([workspaceId, role])
}
```

### 3.4 Collection Model
Organizational folder for grouping bookmarks within a workspace.
```prisma
model Collection {
  id          Uuid       @id @onCreate(uuid(7))
  workspaceId Uuid
  name        String
  description String?
  icon        String?
  color       String?
  createdAt   DateTime   @default(now()) @onCreate(now())
  updatedAt   DateTime   @default(now()) @onCreate(now()) @onUpdate(now())

  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  bookmarks   Bookmark[]

  @@unique([workspaceId, name])
  @@unique([id, workspaceId])
  @@index([workspaceId, createdAt])
  @@fullTextIndex([name], name: "collection_name_search")
}
```

### 3.5 Bookmark Model
Stores saved links, normalized URLs, metadata, notes, and organizational associations.
```prisma
model Bookmark {
  id            Uuid           @id @onCreate(uuid(7))
  workspaceId   Uuid
  collectionId  Uuid?
  url           String
  normalizedUrl String
  title         String
  description   String?
  favicon       String?
  domain        String
  userNotes     String?
  isFavorite    Boolean        @default(false)
  isArchived    Boolean        @default(false)
  createdAt     DateTime       @default(now()) @onCreate(now())
  updatedAt     DateTime       @default(now()) @onCreate(now()) @onUpdate(now())

  workspace     Workspace      @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  collection    Collection?    @relation(fields: [collectionId, workspaceId], references: [id, workspaceId], onDelete: SetNull)
  tags          BookmarkTag[]
  notes         BookmarkNote[]

  @@unique([workspaceId, normalizedUrl])
  @@index([workspaceId, createdAt])
  @@index([workspaceId, collectionId])
  @@index([workspaceId, isFavorite, createdAt])
  @@index([workspaceId, isArchived, createdAt])
  @@index([workspaceId, domain])
  @@fullTextIndex([[title, domain], [description, userNotes]], name: "bookmark_search")
}
```

### 3.6 Tag Model
Tags for flexible categorization across bookmarks within a workspace.
```prisma
model Tag {
  id             Uuid          @id @onCreate(uuid(7))
  workspaceId    Uuid
  name           String
  normalizedName String
  createdAt      DateTime      @default(now()) @onCreate(now())
  updatedAt      DateTime      @default(now()) @onCreate(now()) @onUpdate(now())

  workspace      Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  bookmarks      BookmarkTag[]

  @@unique([workspaceId, normalizedName])
  @@index([workspaceId, name])
  @@fullTextIndex([name], name: "tag_name_search")
}
```

### 3.7 BookmarkTag (Junction Model)
Many-to-many relationship between bookmarks and tags.
```prisma
model BookmarkTag {
  id         Uuid     @id @onCreate(uuid(7))
  bookmarkId Uuid
  tagId      Uuid
  createdAt  DateTime @default(now()) @onCreate(now())

  bookmark   Bookmark @relation(fields: [bookmarkId], references: [id], onDelete: Cascade)
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([bookmarkId, tagId])
  @@index([tagId])
  @@index([bookmarkId])
}
```

### 3.8 Note Model
Markdown personal knowledge entries.
```prisma
model Note {
  id          Uuid           @id @onCreate(uuid(7))
  workspaceId Uuid
  title       String
  content     String
  isPinned    Boolean        @default(false)
  isArchived  Boolean        @default(false)
  createdAt   DateTime       @default(now()) @onCreate(now())
  updatedAt   DateTime       @default(now()) @onCreate(now()) @onUpdate(now())

  workspace   Workspace      @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  bookmarks   BookmarkNote[]

  @@index([workspaceId, updatedAt])
  @@index([workspaceId, isPinned, updatedAt])
  @@fullTextIndex([[title], content], name: "note_search")
}
```

### 3.9 BookmarkNote (Junction Model)
Many-to-many relationship linking notes to bookmarks.
```prisma
model BookmarkNote {
  id         Uuid     @id @onCreate(uuid(7))
  bookmarkId Uuid
  noteId     Uuid
  createdAt  DateTime @default(now()) @onCreate(now())

  bookmark   Bookmark @relation(fields: [bookmarkId], references: [id], onDelete: Cascade)
  note       Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)

  @@unique([bookmarkId, noteId])
  @@index([noteId])
  @@index([bookmarkId])
}
```

### 3.10 Activity Model
Audit trail for dashboard updates and team visibility.
```prisma
enum ActivityAction {
  @@type("pg/text@1")
  BOOKMARK_CREATED     = "BOOKMARK_CREATED"
  BOOKMARK_UPDATED     = "BOOKMARK_UPDATED"
  BOOKMARK_DELETED     = "BOOKMARK_DELETED"
  BOOKMARK_FAVORITED   = "BOOKMARK_FAVORITED"
  BOOKMARK_UNFAVORITED = "BOOKMARK_UNFAVORITED"
  BOOKMARK_ARCHIVED    = "BOOKMARK_ARCHIVED"
  COLLECTION_CREATED   = "COLLECTION_CREATED"
  COLLECTION_UPDATED   = "COLLECTION_UPDATED"
  COLLECTION_DELETED   = "COLLECTION_DELETED"
  NOTE_CREATED         = "NOTE_CREATED"
  NOTE_UPDATED         = "NOTE_UPDATED"
  NOTE_DELETED         = "NOTE_DELETED"
  TAG_CREATED          = "TAG_CREATED"
  TAG_DELETED          = "TAG_DELETED"
  MEMBER_INVITED       = "MEMBER_INVITED"
  MEMBER_REMOVED       = "MEMBER_REMOVED"
  ROLE_UPDATED         = "ROLE_UPDATED"
}

enum ActivityEntityType {
  @@type("pg/text@1")
  BOOKMARK   = "BOOKMARK"
  COLLECTION = "COLLECTION"
  NOTE       = "NOTE"
  TAG        = "TAG"
  WORKSPACE  = "WORKSPACE"
  MEMBER     = "MEMBER"
}

model Activity {
  id          Uuid               @id @onCreate(uuid(7))
  workspaceId Uuid
  actorId     Uuid
  action      ActivityAction
  entityType  ActivityEntityType
  entityId    Uuid
  metadata    Json?
  createdAt   DateTime           @default(now()) @onCreate(now())

  workspace   Workspace          @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  actor       User               @relation(fields: [actorId], references: [id], onDelete: Restrict)

  @@index([workspaceId, createdAt])
  @@index([actorId, createdAt])
  @@index([workspaceId, entityType, entityId])
}
```

### 3.11 ExtensionCredential Model
Provides secure API credentials for Chrome / Chromium browser extensions.
```prisma
model ExtensionCredential {
  id          Uuid      @id @onCreate(uuid(7))
  workspaceId Uuid
  userId      Uuid
  name        String
  tokenHash   String    @unique
  tokenPrefix String
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  revokedAt   DateTime?
  createdAt   DateTime  @default(now()) @onCreate(now())
  updatedAt   DateTime  @default(now()) @onCreate(now()) @onUpdate(now())

  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([workspaceId, userId])
  @@index([userId, revokedAt])
}
```

---

## 4. URL Normalization Architecture

To ensure duplicate detection while preserving essential application state (such as YouTube `v=` parameters, GitHub pull request numbers, and documentation anchors), the safe URL normalization engine follows these rules:

1. **Protocol & Host Lowercased**: `HTTPS://GitHub.com/` $\rightarrow$ `https://github.com/`.
2. **Trailing Slash Removal**: Paths without files have trailing slashes trimmed: `/docs/` $\rightarrow$ `/docs` (except root `/`).
3. **Tracking Parameter Stripping**: Strip marketing noise parameters only:
   - `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
   - `fbclid`, `gclid`, `mc_eid`, `ref`, `ref_src`, `_ga`
4. **Parameter Preservation**: Keep all semantic query parameters:
   - Search parameters (`q`, `query`)
   - Resource IDs (`v`, `id`, `p`, `articleId`)
   - Pagination parameters (`page`, `offset`, `limit`)
5. **Alphabetical Sorting of Query Params**: Normalizes parameter order so `?b=2&a=1` and `?a=1&b=2` resolve identically.
6. **Domain Extraction**: Resolves hostname without leading `www.` for easy filtering (e.g. `www.github.com` $\rightarrow$ `github.com`).
