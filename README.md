<p align="center">
  <img src="public/tabspace-logo.jpg" alt="TabSpace Logo" width="160" />
</p>

<h1 align="center">TabSpace</h1>

<p align="center">
  Production-Grade Personal Digital Workspace and Resource Management Platform
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.6-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.3.0-20232a?style=for-the-badge&logo=react&logoColor=61dafb" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Strict" />
  <img src="https://img.shields.io/badge/Prisma-8.0.0--rc-2d3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma 8" />
  <img src="https://img.shields.io/badge/Neon-PostgreSQL_18-00e599?style=for-the-badge&logo=postgresql&logoColor=black" alt="Neon PostgreSQL 18" />
  <img src="https://img.shields.io/badge/Firebase-Authentication-ffca28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase Auth" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License MIT" />
</p>

---

## Overview

TabSpace is a high-performance personal digital workspace and research management SaaS. It empowers knowledge workers, developers, and researchers to save websites, GitHub repositories, and articles, organize them into collections, apply tags, author rich Markdown notes, link notes directly to resources, and perform instant workspace-scoped full-text search.

The platform is designed with a multi-tenant foundation. While initial onboarding focuses on personal workspaces, the underlying schema, isolation constraints, and role-based access control natively support team collaboration and shared workspaces with zero architectural changes.

---

## Multi-Tenant Workspace Architecture & RBAC

Every resource in TabSpace belongs to a `Workspace`. Cross-tenant data leakage is prevented at both the database constraint level and service boundaries.

### Workspace Types
- **Personal Workspaces**: Created automatically during initial user provisioning with `isPersonal: true`. The provisioning user is permanently assigned the `OWNER` role.
- **Team Workspaces**: Support collaborative workspaces where multiple members share bookmarks, collections, notes, and activity feeds.

### Role-Based Access Control (RBAC)

The `WorkspaceMember` relationship manages access through three discrete roles:

| Role | Administrative Rights | Resource Capabilities | Security Boundaries |
|---|---|---|---|
| **OWNER** | Full workspace authority. Can manage billing, configure workspace settings, delete the workspace, and transfer ownership. | Create, read, update, and delete all bookmarks, collections, tags, and notes across the workspace. | Cannot be removed from the workspace unless ownership is explicitly transferred to another member. |
| **ADMIN** | Member management authority. Can invite new members, update non-owner roles, and manage integration credentials. | Full read, write, and delete permissions for all workspace content. | Cannot delete the workspace, transfer ownership, or demote/remove the workspace owner. |
| **MEMBER** | Standard contributor rights. | Can create, organize, and edit bookmarks, notes, and collections within the authorized workspace. | Cannot invite users, modify workspace settings, or access credential/billing configurations. |

---

## Database Architecture & Verified Models

The database layer runs on **PostgreSQL 18 on Neon**, defined declaratively through **Prisma 8** (`@prisma/orm-postgres`). All primary keys utilize native PostgreSQL **UUIDv7** (`uuid(7)`), delivering time-ordered, k-sortable 16-byte binary identifiers that prevent B-tree index fragmentation and maximize write throughput.

The database schema consists of 11 verified tables:

1. **User**: Stores external identity mapped from Firebase Auth (`firebaseUid`), canonical email, display name, and avatar.
2. **Workspace**: The multi-tenant isolation root containing an owner reference, slug, and personal flag.
3. **WorkspaceMember**: Connects users to workspaces with unique composite constraints `(workspaceId, userId)` and role enforcement (`OWNER`, `ADMIN`, `MEMBER`).
4. **Collection**: Categorization folders for grouping bookmarks within a workspace. Enforces `(workspaceId, name)` uniqueness.
5. **Bookmark**: Stores links with original and normalized URLs, metadata, favicon, domain, and user annotations.
6. **Tag**: Categorization labels with case-insensitive unique naming per workspace via `(workspaceId, normalizedName)`.
7. **BookmarkTag**: Junction model establishing many-to-many relationships between bookmarks and tags.
8. **Note**: Rich Markdown personal knowledge documents with dashboard pinning and workspace scoping.
9. **BookmarkNote**: Junction model linking notes directly to relevant bookmarks.
10. **Activity**: Structured audit log tracking creation, modification, and deletion events for dashboard timelines.
11. **ExtensionCredential**: Secure storage for Chrome / browser extension tokens, persisting only SHA-256 cryptographic hashes.

---

## Indexing & Full-Text Search Strategy

### B-Tree Indexes
- Composite foreign key and filter indexes on `Bookmark(workspaceId, createdAt)`, `Bookmark(workspaceId, isFavorite, createdAt)`, and `Bookmark(workspaceId, isArchived, createdAt)` for zero-latency dashboard filtering.
- Unique index on `Bookmark(workspaceId, normalizedUrl)` ensuring duplicate bookmarks cannot be added to the same workspace while allowing identical URLs across distinct workspaces.
- Composite index on `Note(workspaceId, isPinned, updatedAt)` powering the pinned dashboard notes widget.

### PostgreSQL GIN Full-Text Search
TabSpace utilizes PostgreSQL native Generalized Inverted Index (GIN) full-text search with dictionary weighting:
- **Bookmark Search Index**: Covers `title` and `domain` (Weight A/B), and `description` and `userNotes` (Weight C/D).
- **Note Search Index**: Covers `title` (Weight A) and `content` (Weight B).
- **Collection & Tag Indexes**: Fast prefix and keyword search across collections and tags.

All full-text searches include mandatory `WHERE workspaceId = :workspaceId` clauses, guaranteeing zero data leakage across workspaces without requiring third-party search infrastructure.

---

## Safe URL Normalization Engine

To prevent bookmark duplication and clean tracking noise, URLs undergo safe algorithmic normalization before storage:

1. **Protocol & Host Case Normalization**: Lowercases scheme and hostname.
2. **Tracking Parameter Removal**: Strips marketing telemetry parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `fbclid`, `gclid`, `mc_eid`, `ref`, `_ga`).
3. **Functional Parameter Preservation**: Retains all semantic parameters required for application state (e.g., YouTube video IDs `v=`, search queries `q=`, pagination `page=`, article identifiers).
4. **Parameter Key Sorting**: Alphabetically sorts remaining query parameters so that order variations resolve identically.
5. **Trailing Slash Trimming**: Normalizes directory paths while preserving root paths.
6. **Domain Extraction**: Resolves clean domain strings without `www.` prefixes for grouping and aggregation.

---

## Security Architecture & SSRF Defenses

- **Zero Database Secrets**: No Google OAuth tokens, passwords, or raw extension API keys are stored in the database.
- **Extension Key Hashing**: Browser extension tokens are generated with high-entropy cryptographic randomness (64+ characters, prefixed with `tab_live_`). Only the SHA-256 digest is persisted.
- **Server-Side Request Forgery (SSRF) Protection**: Webpage metadata scrapers validate target URLs against blocked networks:
  - Loopback addresses (`127.0.0.1`, `localhost`, `::1`).
  - Private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
  - Carrier-grade NAT (`100.64.0.0/10`) and link-local addresses (`169.254.0.0/16`).
  - Cloud metadata endpoints (`169.254.169.254`, `metadata.google.internal`).
  - DNS pre-resolution checks prior to connection, strict timeouts (3s connect, 5s read), and redirect validation.

---

## Technology Stack

- **Frontend & App Framework**: Next.js 16.4.6 (App Router), React 19.3.0, Tailwind CSS 4.
- **Language**: TypeScript Strict Mode.
- **Database**: PostgreSQL 18.7 hosted on Neon Serverless.
- **ORM & Data Layer**: Prisma 8 (`@prisma/orm-postgres` 8.0.0-rc.24, `@prisma/cli-engine`).
- **Authentication**: Firebase Authentication (Client SDK) with server-side ID token verification via `firebase-admin`.
- **Validation**: Zod.

---

## Getting Started

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/your-username/tabspace.git
cd tabspace
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Neon PostgreSQL (Application Runtime - Pooled Connection)
DATABASE_URL="postgresql://user:password@ep-pooler.region.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Neon PostgreSQL (Migrations & DDL - Direct Unpooled Connection)
DIRECT_URL="postgresql://user:password@ep-direct.region.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin (Server Only)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Migration & Verification

TabSpace enforces named migrations tracked in version control.

```bash
# Validate contract syntax and emit canonical JSON / TypeScript type artifacts
npx prisma contract emit

# Preview pending migrations
npx prisma db migrate --show

# Apply migrations transactionally to the database
npx prisma db migrate --advance-ref db

# Verify live database schema and marker against contract
npx prisma db verify
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Documentation Index

Comprehensive technical documentation is maintained in the `docs/` directory:

- [Database Architecture Specification](docs/DATABASE_ARCHITECTURE.md)
- [Entity-Relationship Diagram & Invariants](docs/ER_DIAGRAM.md)
- [Indexing Strategy & Optimization](docs/INDEXING_STRATEGY.md)
- [Migration Guide & Operational Runbook](docs/MIGRATION_GUIDE.md)
- [Authentication & Identity Federation](docs/AUTHENTICATION.md)
- [API Route Specifications](docs/API_DOCUMENTATION.md)
- [Security Architecture & Threat Model](docs/SECURITY.md)

---

## License

This project is licensed under the MIT License.
