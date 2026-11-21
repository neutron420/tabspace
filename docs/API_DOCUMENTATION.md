# TabSpace – API Documentation & Route Specifications

All API routes are implemented as **Next.js 16 App Router Route Handlers** under `src/app/api/`. Every protected route requires authentication via the `Authorization: Bearer <token>` header or an extension credential.

---

## 1. Global Response Standards

### 1.1 Success Response Structure
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "hasMore": true
  }
}
```

### 1.2 Error Response Structure
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested bookmark was not found in this workspace",
    "details": null
  }
}
```

---

## 2. API Endpoints Catalog

### 2.1 Authentication & Profile
- `GET /api/auth/me`: Returns the authenticated user, their current active workspace, and all workspace memberships.
- `POST /api/auth/sync`: Syncs the verified Firebase user with PostgreSQL. Provisions user record and initial personal workspace in a database transaction if first sign-in.

### 2.2 Workspaces
- `GET /api/workspaces`: Lists all workspaces the authenticated user is a member of.
- `POST /api/workspaces`: Creates a new team workspace; assigns the caller as `OWNER`.
- `GET /api/workspaces/[id]`: Fetches workspace details and member list (requires membership).
- `PATCH /api/workspaces/[id]`: Updates workspace settings (name, slug) (requires `OWNER` or `ADMIN`).

### 2.3 Collections
- `GET /api/collections`: Lists collections in the active workspace, with bookmark counts.
- `POST /api/collections`: Creates a collection (`name`, `description`, `icon`, `color`).
- `PATCH /api/collections/[id]`: Updates collection properties.
- `DELETE /api/collections/[id]`: Deletes collection; sets bookmarks `collectionId` to `null` (safe `onDelete: SetNull`).

### 2.4 Bookmarks
- `GET /api/bookmarks`: Paginated bookmark list with filters:
  - Query parameters: `collectionId`, `tag`, `isFavorite`, `isArchived`, `domain`, `page`, `limit`.
- `POST /api/bookmarks`: Adds a bookmark. Automatically extracts title, domain, favicon, and executes URL normalization. Associates tags.
- `GET /api/bookmarks/[id]`: Returns a single bookmark with tags, linked notes, and collection.
- `PATCH /api/bookmarks/[id]`: Updates bookmark properties (`title`, `userNotes`, `isFavorite`, `isArchived`, `collectionId`, `tagIds`).
- `DELETE /api/bookmarks/[id]`: Deletes a bookmark and associated junction records.

### 2.5 Tags
- `GET /api/tags`: Lists all tags in the workspace with bookmark counts.
- `POST /api/tags`: Creates or retrieves an existing tag (normalized).
- `DELETE /api/tags/[id]`: Deletes a tag from the workspace and detaches from bookmarks.

### 2.6 Notes
- `GET /api/notes`: Lists notes in the workspace, with optional pinned filter and pagination.
- `POST /api/notes`: Creates a Markdown note (`title`, `content`, `bookmarkIds`, `isPinned`).
- `PATCH /api/notes/[id]`: Updates note content, title, or linked bookmarks.
- `DELETE /api/notes/[id]`: Deletes a note.

### 2.7 Search
- `GET /api/search?q=<query>`: Executes workspace-scoped PostgreSQL full-text search across bookmarks, notes, collections, and tags using ranking.

### 2.8 Activities
- `GET /api/activities`: Returns workspace audit log / recent activity feed.
