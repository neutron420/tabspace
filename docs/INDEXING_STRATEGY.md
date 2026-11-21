# TabSpace – Indexing Strategy & Query Optimization

This document catalogs every database index, constraint index, and full-text search index in the TabSpace PostgreSQL database, detailing the rationale and the specific queries each optimizes.

---

## 1. Index Catalog

| Table | Index Columns | Type | Target Query / Workflow |
|---|---|---|---|
| `User` | `firebaseUid` | B-tree (UNIQUE) | Firebase ID token verification and user lookup during authentication (`findUnique({ firebaseUid })`). |
| `User` | `email` | B-tree (UNIQUE) | User profile lookup, invitation resolution, and duplicate email prevention. |
| `Workspace` | `ownerId` | B-tree | Finding all workspaces owned by a given user (`findMany({ where: { ownerId } })`). |
| `Workspace` | `slug` | B-tree (UNIQUE) | Resolving workspace by URL slug (`findUnique({ slug })`). |
| `Workspace` | `createdAt` | B-tree | Admin/analytics queries sorting workspaces by creation date. |
| `WorkspaceMember` | `workspaceId, userId` | B-tree (UNIQUE) | Fast verification of user membership and role inside a workspace (`findUnique({ workspaceId, userId })`). |
| `WorkspaceMember` | `userId` | B-tree | Finding all workspaces that a user belongs to (`findMany({ where: { userId } })`). |
| `WorkspaceMember` | `workspaceId, role` | B-tree | Listing all members with administrative/owner rights within a workspace. |
| `Collection` | `workspaceId, name` | B-tree (UNIQUE) | Prevents duplicate collection names within the same workspace. |
| `Collection` | `id, workspaceId` | B-tree (UNIQUE) | Serves as target for composite foreign key from `Bookmark(collectionId, workspaceId)`, preventing cross-tenant collection assignment. |
| `Collection` | `workspaceId, createdAt` | B-tree | Listing workspace collections sorted chronologically. |
| `Collection` | `to_tsvector('english', name)` | GIN (`@@fullTextIndex`) | Workspace-scoped full-text search over collection names. |
| `Bookmark` | `workspaceId, normalizedUrl` | B-tree (UNIQUE) | Prevents duplicate bookmarks with identical normalized URLs inside the same workspace while allowing duplicate URLs across different workspaces. |
| `Bookmark` | `workspaceId, createdAt` | B-tree | Primary chronological feed of bookmarks for the dashboard with pagination (`orderBy: createdAt desc`). |
| `Bookmark` | `workspaceId, collectionId` | B-tree | Filtering bookmarks by collection within a workspace. |
| `Bookmark` | `workspaceId, isFavorite, createdAt` | B-tree (Composite) | Powers the "Favorites" filter tab (`where: { workspaceId, isFavorite: true }, orderBy: { createdAt: desc }`). |
| `Bookmark` | `workspaceId, isArchived, createdAt` | B-tree (Composite) | Powers the "Archive" filter tab (`where: { workspaceId, isArchived: true }, orderBy: { createdAt: desc }`). |
| `Bookmark` | `workspaceId, domain` | B-tree | Domain aggregation and filtering bookmarks by host (e.g. all `github.com` bookmarks). |
| `Bookmark` | `[[title, domain], [description, userNotes]]` | GIN (`@@fullTextIndex`) | Workspace-scoped weighted full-text search over bookmark title, domain (weight A/B), description, and user notes (weight C/D). |
| `Tag` | `workspaceId, normalizedName` | B-tree (UNIQUE) | Prevents duplicate tags (e.g. "React" vs "react") within the same workspace. |
| `Tag` | `workspaceId, name` | B-tree | Autocomplete and tag cloud rendering within a workspace. |
| `Tag` | `to_tsvector('english', name)` | GIN (`@@fullTextIndex`) | Full-text search over tag names. |
| `BookmarkTag` | `bookmarkId, tagId` | B-tree (UNIQUE) | Prevents duplicate tagging of the same bookmark. |
| `BookmarkTag` | `tagId` | B-tree | Finding all bookmarks tagged with a specific tag (`where: { tagId }`). |
| `BookmarkTag` | `bookmarkId` | B-tree | Eager loading all tags associated with a bookmark. |
| `Note` | `workspaceId, updatedAt` | B-tree | Chronological list of notes recently edited in a workspace (`orderBy: updatedAt desc`). |
| `Note` | `workspaceId, isPinned, updatedAt` | B-tree (Composite) | Dashboard pinned notes widget (`where: { workspaceId, isPinned: true }, orderBy: { updatedAt: desc }`). |
| `Note` | `[[title], content]` | GIN (`@@fullTextIndex`) | Workspace-scoped weighted full-text search over note title (weight A) and content (weight B). |
| `BookmarkNote` | `bookmarkId, noteId` | B-tree (UNIQUE) | Prevents duplicate links between the same bookmark and note. |
| `BookmarkNote` | `noteId` | B-tree | Finding all bookmarks linked to a note. |
| `BookmarkNote` | `bookmarkId` | B-tree | Finding all notes linked to a bookmark. |
| `Activity` | `workspaceId, createdAt` | B-tree | Recent activity stream on workspace dashboard (`where: { workspaceId }, orderBy: { createdAt: desc }`). |
| `Activity` | `actorId, createdAt` | B-tree | User activity audit trail. |
| `Activity` | `workspaceId, entityType, entityId` | B-tree (Composite) | Audit history for a specific entity (e.g. all changes to a specific bookmark). |
| `ExtensionCredential` | `tokenHash` | B-tree (UNIQUE) | Fast authentication lookup for Chrome Extension requests by SHA-256 token hash. |
| `ExtensionCredential` | `workspaceId, userId` | B-tree | Listing active browser extension tokens in workspace settings. |
| `ExtensionCredential` | `userId, revokedAt` | B-tree | Finding and managing non-revoked active credentials for a user. |

---

## 2. Full-Text Search Strategy

### 2.1 Why PostgreSQL Full-Text Search with GIN?
- **Zero external infrastructure**: Avoids running Elasticsearch, Meilisearch, or Algolia for V1.
- **Strict Tenant Isolation**: Because the search document and indexes are native to PostgreSQL, searches are executed with `WHERE workspace_id = $workspaceId`, ensuring cross-tenant data leaks are mathematically impossible.
- **Transactional consistency**: Any created, updated, or deleted bookmark or note is immediately searchable without eventual consistency latency.

### 2.2 Weighted Ranking and Relevancy
PostgreSQL `ts_rank` evaluates relevance using four weight classes:
- **Weight A (1.0)**: Highest importance — Bookmark Title, Note Title.
- **Weight B (0.4)**: High importance — Bookmark Domain, Tag Names, Collection Names.
- **Weight C (0.2)**: Medium importance — Bookmark Description.
- **Weight D (0.1)**: Low importance — User Notes, Markdown Content body.

In Prisma 8, this is defined declaratively using `@@fullTextIndex`:
```prisma
@@fullTextIndex([[title, domain], [description, userNotes]], name: "bookmark_search")
```
Prisma 8 automatically builds the GIN index with `setweight(to_tsvector(...))` and exposes `.using.bookmark_search(q)` on the typed ORM collection.
