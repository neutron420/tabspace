# TabSpace – Security Architecture & Threat Model

This document outlines the security controls, tenant isolation guarantees, SSRF mitigation, and secret management policies implemented in TabSpace.

---

## 1. Multi-Tenant Isolation Model

1. **Mandatory Workspace Scoping**:
   - Every read and write query in repositories MUST include `workspaceId` in its `WHERE` predicate.
   - For example:
     ```typescript
     db.orm.public.Bookmark.where({ id, workspaceId }).delete();
     ```
2. **Composite Foreign Key Enforcement**:
   - `Bookmark` enforces collection membership via composite foreign key `(collectionId, workspaceId) REFERENCES Collection(id, workspaceId)`. This prevents assigning a bookmark in Workspace A to a collection in Workspace B at the database constraint level.
3. **Role-Based Access Control (RBAC)**:
   - `OWNER`: Full administrative rights, workspace deletion, billing, member removal.
   - `ADMIN`: Manage collections, bookmarks, notes, invite members, update metadata.
   - `MEMBER`: Create, read, update, delete their bookmarks, notes, collections, and tags.

---

## 2. Server-Side Request Forgery (SSRF) Prevention

When TabSpace fetches webpage metadata (title, description, favicon) from user-submitted URLs, an SSRF engine is enforced:

1. **Blocked Hostnames & IP Ranges**:
   - `localhost`, `127.0.0.1`, `::1`
   - RFC 1918 Private Ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
   - Carrier-Grade NAT (`100.64.0.0/10`)
   - Link-local addresses (`169.254.0.0/16`, `fe80::/10`)
   - Cloud metadata endpoints (`169.254.169.254`, `metadata.google.internal`)
2. **Protocol Allowlist**:
   - Only `http:` and `https:` schemes are permitted. `file:`, `ftp:`, `gopher:`, `data:` are rejected.
3. **DNS Rebinding Protection**:
   - DNS lookup is performed first; the resolved IP address is verified against blocked ranges prior to issuing the HTTP request.
4. **Timeouts & Size Caps**:
   - Strict connection timeout (3,000 ms) and read timeout (5,000 ms).
   - Maximum response payload capped at 2 MB to prevent decompression/memory exhaustion attacks.
5. **Redirect Validation**:
   - Max 3 redirects; each redirect target is re-validated through the SSRF filter.

---

## 3. Extension Credential Security

1. **High-Entropy Token Generation**:
   - Tokens are 32-byte cryptographically secure random bytes generated via `crypto.randomBytes(32).toString('hex')`.
   - Token structure: `tab_live_<prefix>_<random>` (total 64+ hex characters).
2. **Irreversible Storage**:
   - Raw tokens are displayed to the user exactly ONCE at creation time.
   - Only the SHA-256 hash (`crypto.createHash('sha256').update(rawToken).digest('hex')`) is saved in `ExtensionCredential.tokenHash`.
3. **Revocation & Expiration**:
   - Every extension API request checks `revokedAt IS NULL` and `(expiresAt IS NULL OR expiresAt > NOW())`.
   - Extensions can be revoked immediately from the workspace dashboard.

---

## 4. Secret Management & Error Sanitization

1. **Server-Only Credentials**:
   - `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, and `DIRECT_URL` are strictly excluded from client bundles (no `NEXT_PUBLIC_` prefix).
2. **Safe Error Responses**:
   - Internal database errors, stack traces, and SQL queries are logged server-side only. Clients receive standardized error codes (`INTERNAL_SERVER_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`).
