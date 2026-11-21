# TabSpace – Entity-Relationship (ER) Architecture

This document defines the relational database model for **TabSpace**, a personal digital workspace SaaS designed for personal workspaces today and collaborative team workspaces tomorrow.

---

## 1. Mermaid Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Workspace : "owns"
    User ||--o{ WorkspaceMember : "has"
    User ||--o{ Activity : "performs"
    User ||--o{ ExtensionCredential : "owns"

    Workspace ||--o{ WorkspaceMember : "contains"
    Workspace ||--o{ Collection : "owns"
    Workspace ||--o{ Bookmark : "owns"
    Workspace ||--o{ Tag : "owns"
    Workspace ||--o{ Note : "owns"
    Workspace ||--o{ Activity : "tracks"
    Workspace ||--o{ ExtensionCredential : "authorizes"

    Collection ||--o{ Bookmark : "contains (optional)"

    Bookmark ||--o{ BookmarkTag : "has"
    Tag ||--o{ BookmarkTag : "categorizes"

    Bookmark ||--o{ BookmarkNote : "links"
    Note ||--o{ BookmarkNote : "linked_to"

    User {
        uuid id PK "Native UUIDv7"
        string firebaseUid UK "Firebase Auth external UID"
        string email UK "Canonical lowercase email"
        string displayName "Optional display name"
        string photoUrl "Optional avatar URL"
        timestamptz createdAt "Default now()"
        timestamptz updatedAt "Auto-updated on modification"
    }

    Workspace {
        uuid id PK "Native UUIDv7"
        string name "Workspace display name"
        string slug "URL-friendly workspace slug"
        boolean isPersonal "True for personal workspace"
        uuid ownerId FK "References User.id (Restrict)"
        timestamptz createdAt "Default now()"
        timestamptz updatedAt "Auto-updated on modification"
    }

    WorkspaceMember {
        uuid id PK "Native UUIDv7"
        uuid workspaceId FK "References Workspace.id (Cascade)"
        uuid userId FK "References User.id (Cascade)"
        WorkspaceRole role "OWNER | ADMIN | MEMBER"
        timestamptz createdAt "Default now()"
        timestamptz updatedAt "Auto-updated on modification"
    }

    Collection {
        uuid id PK "Native UUIDv7"
        uuid workspaceId FK "References Workspace.id (Cascade)"
        string name "Unique per workspace"
        string description "Optional collection summary"
        string icon "Icon identifier or emoji"
        string color "Hex code or color token"
        timestamptz createdAt "Default now()"
        timestamptz updatedAt "Auto-updated on modification"
    }

    Bookmark {
        uuid id PK "Native UUIDv7"
        uuid workspaceId FK "References Workspace.id (Cascade)"
        uuid collectionId FK "Nullable (SetNull), references Collection"
        string url "Raw original bookmark URL"
        string normalizedUrl "Canonical normalized URL (UK per workspace)"
        string title "Page title"
        string description "Extracted or user summary"
        string favicon "Favicon URL"
        string domain "Extracted domain (e.g. github.com)"
        string userNotes "Personal user annotations"
        boolean isFavorite "Favorite flag"
        boolean isArchived "Archive flag"
        timestamptz createdAt "Default now()"
        timestamptz updatedAt "Auto-updated on modification"
    }

    Tag {
        uuid id PK "Native UUIDv7"
        uuid workspaceId FK "References Workspace.id (Cascade)"
        string name "Tag display name"
        string normalizedName "Lowercase trimmed (UK per workspace)"
        timestamptz createdAt "Default now()"
        timestamptz updatedAt "Auto-updated on modification"
    }

    BookmarkTag {
        uuid id PK "Native UUIDv7"
        uuid bookmarkId FK "References Bookmark.id (Cascade)"
        uuid tagId FK "References Tag.id (Cascade)"
        timestamptz createdAt "Default now()"
    }

    Note {
        uuid id PK "Native UUIDv7"
        uuid workspaceId FK "References Workspace.id (Cascade)"
        string title "Note title"
        string content "Markdown note content"
        boolean isPinned "Pinned to dashboard"
        boolean isArchived "Archived flag"
        timestamptz createdAt "Default now()"
        timestamptz updatedAt "Auto-updated on modification"
    }

    BookmarkNote {
        uuid id PK "Native UUIDv7"
        uuid bookmarkId FK "References Bookmark.id (Cascade)"
        uuid noteId FK "References Note.id (Cascade)"
        timestamptz createdAt "Default now()"
    }

    Activity {
        uuid id PK "Native UUIDv7"
        uuid workspaceId FK "References Workspace.id (Cascade)"
        uuid actorId FK "References User.id (Restrict)"
        ActivityAction action "Event enum"
        ActivityEntityType entityType "Target entity enum"
        uuid entityId "Target entity ID"
        jsonb metadata "Non-sensitive contextual payload"
        timestamptz createdAt "Default now()"
    }

    ExtensionCredential {
        uuid id PK "Native UUIDv7"
        uuid workspaceId FK "References Workspace.id (Cascade)"
        uuid userId FK "References User.id (Cascade)"
        string name "Device/Client name"
        string tokenHash UK "SHA-256 cryptographic hash of raw token"
        string tokenPrefix "First 8 chars for identification"
        timestamptz lastUsedAt "Timestamp of last API call"
        timestamptz expiresAt "Optional token expiration"
        timestamptz revokedAt "Revocation timestamp (NULL if active)"
        timestamptz createdAt "Default now()"
        timestamptz updatedAt "Auto-updated on modification"
    }
```

---

## 2. Relational Cardinalities and Invariants

| Relationship | Cardinality | Deletion Behavior | Enforcement Mechanism |
|---|---|---|---|
| `User` $\rightarrow$ `Workspace` (Owner) | 1 : N | `Restrict` | A user cannot be deleted while owning active workspaces. |
| `Workspace` $\rightarrow$ `WorkspaceMember` | 1 : N | `Cascade` | Deleting a workspace removes all member associations. |
| `User` $\rightarrow$ `WorkspaceMember` | 1 : N | `Cascade` | Deleting a user removes their memberships. |
| `Workspace` $\rightarrow$ `Collection` | 1 : N | `Cascade` | Deleting a workspace cascades to collections. |
| `Workspace` $\rightarrow$ `Bookmark` | 1 : N | `Cascade` | Deleting a workspace cascades to bookmarks. |
| `Collection` $\rightarrow$ `Bookmark` | 1 : N (optional) | `SetNull` | Deleting a collection retains bookmarks (moves to uncategorized/inbox). |
| `Workspace` $\rightarrow$ `Tag` | 1 : N | `Cascade` | Deleting a workspace cascades to tags. |
| `Bookmark` $\leftrightarrow$ `Tag` (`BookmarkTag`) | M : N | `Cascade` | Deleting bookmark or tag removes junction records. |
| `Workspace` $\rightarrow$ `Note` | 1 : N | `Cascade` | Deleting a workspace cascades to notes. |
| `Bookmark` $\leftrightarrow$ `Note` (`BookmarkNote`) | M : N | `Cascade` | Deleting bookmark or note removes link records. |
| `Workspace` $\rightarrow$ `Activity` | 1 : N | `Cascade` | Workspace audit logs are removed on workspace deletion. |
| `User` (Actor) $\rightarrow$ `Activity` | 1 : N | `Restrict` | Prevents removing audit trail while actor records exist. |
| `Workspace` $\rightarrow$ `ExtensionCredential`| 1 : N | `Cascade` | Tokens revoked when workspace is removed. |
| `User` $\rightarrow$ `ExtensionCredential` | 1 : N | `Cascade` | Tokens revoked when user is removed. |

---

## 3. Database Constraints Summary

1. **`User`**:
   - `firebaseUid`: Globally UNIQUE.
   - `email`: Globally UNIQUE (enforced lowercase).
2. **`WorkspaceMember`**:
   - `(workspaceId, userId)`: UNIQUE (one membership per user per workspace).
3. **`Collection`**:
   - `(workspaceId, name)`: UNIQUE (no duplicate collection names in a workspace).
   - `(id, workspaceId)`: UNIQUE (used for composite foreign key validation).
4. **`Bookmark`**:
   - `(workspaceId, normalizedUrl)`: UNIQUE (no duplicate normalized URLs in the same workspace; identical URLs allowed across different workspaces).
   - `(collectionId, workspaceId)`: Composite FK referencing `Collection(id, workspaceId)` ensures bookmarks can never reference collections belonging to a different workspace.
5. **`Tag`**:
   - `(workspaceId, normalizedName)`: UNIQUE (prevents duplicate tags like "react" and "React" in the same workspace).
6. **`BookmarkTag`**:
   - `(bookmarkId, tagId)`: UNIQUE (cannot tag the same bookmark twice with the same tag).
7. **`BookmarkNote`**:
   - `(bookmarkId, noteId)`: UNIQUE (cannot link the same note twice to the same bookmark).
8. **`ExtensionCredential`**:
   - `tokenHash`: Globally UNIQUE (stored as SHA-256 hex digest, raw token never stored).
