# TabSpace – Migration Guide & Operational Runbook

This document details the database migration strategy, execution workflows, and recovery runbooks for TabSpace using **Prisma 8 (`@prisma/orm-postgres`)** and **Neon PostgreSQL**.

---

## 1. Golden Rules of TabSpace Migrations

1. **Always Use Named Migrations**: Never create anonymous migrations. Every planned migration must include a descriptive snake_case name via `--name <migration_name>` (e.g. `npx prisma migration plan --name init_tabspace_schema`).
2. **Never Drop or Reset a Production Database**: Prisma 8 provides verifiable contract-to-database forward progression.
3. **Use the Direct Connection for Migrations**: Neon connection poolers (PgBouncer) can interrupt transactional DDL operations. Migrations and contract initialization must execute using `DIRECT_URL`.
4. **Inspect Generated Migrations Before Applying**: Always review the rendered `migration.ts`, `ops.json`, and `migration.json` packages prior to running `db migrate`.
5. **Keep All Migration Files Committed in Git**: Never edit historical migration files directly once committed and deployed.

---

## 2. Environment Variables & Connection Routing

In `.env`:
```env
# Neon Pooled Connection (Used by application runtime in Route Handlers)
DATABASE_URL="postgresql://USER:PASSWORD@POOLER_HOST/DATABASE?sslmode=require"

# Neon Direct Connection (Used by migrations and DDL operations)
DIRECT_URL="postgresql://USER:PASSWORD@DIRECT_HOST/DATABASE?sslmode=require"
```

In `prisma.config.ts`:
Prisma CLI engine connects to the database specified in `ormConfig.db.connection`. For migration commands, the `--db` flag can be passed or `process.env['DIRECT_URL']` can be configured.

---

## 3. Migration Lifecycle & Daily Commands

### Step 1: Update the Contract Source
Edit `src/prisma/contract.prisma`.

### Step 2: Emit the Contract Artifacts
Generate the canonical `contract.json` and `contract.d.ts`:
```bash
npx prisma contract emit
```

### Step 3: Plan the Migration with a Name
Plan the migration package from the contract diff, providing a descriptive name:
```bash
npx prisma migration plan --name <migration_name>
```
*Example:*
```bash
npx prisma migration plan --name init_tabspace_schema
```
This generates a package under `migrations/app/<timestamp>_<migration_name>/` containing:
- `migration.json`: Manifest with content-addressed hash.
- `ops.json`: Transactional operations list.
- `migration.ts`: TypeScript authoring and execution file.

### Step 4: Preview Migration
Preview what will run without touching the database:
```bash
npx prisma db migrate --show --db "$DIRECT_URL"
```

### Step 5: Apply Migrations
Apply the planned migrations transactionally against the target database:
```bash
npx prisma db migrate --db "$DIRECT_URL"
```

### Step 6: Verify Database Match
Ensure the live database matches the contract and marker:
```bash
npx prisma db verify --db "$DIRECT_URL"
```

---

## 4. Production Deployment Workflow

In CI/CD (GitHub Actions / Vercel / Railway):
```bash
# 1. Install dependencies
npm ci

# 2. Verify contract artifacts are in sync with source
npx prisma contract emit

# 3. Check migration integrity
npx prisma migration check

# 4. Apply pending migrations using direct connection
npx prisma db migrate --db "$DIRECT_URL"

# 5. Verify live schema
npx prisma db verify --db "$DIRECT_URL"
```

---

## 5. Failure Recovery & Troubleshooting

### Hash Mismatch (`MIGRATION.HASH_MISMATCH`)
**Cause**: `migration.ts` was edited manually without re-emitting `ops.json` and `migration.json`.
**Resolution**: Run the migration file directly to self-emit:
```bash
node migrations/app/<migration-dir>/migration.ts
```

### Missing Marker (`CONTRACT.MARKER_MISSING`)
**Cause**: The database schema is in place, but `prisma_contract.marker` is missing.
**Resolution**: Sign the database with the current contract hash after verification:
```bash
npx prisma db sign --db "$DIRECT_URL"
```

### Unfilled Placeholder (`MIGRATION.UNFILLED_PLACEHOLDER`)
**Cause**: A migration contains a required field backfill or type conversion sentinel.
**Resolution**: Open `migration.ts`, replace `placeholder("<slot>")` with the query transform closure, run `node migrations/app/<migration-dir>/migration.ts`, and re-run `npx prisma db migrate`.
