---
paths:
  - "packages/db/src/schema/**"
  - "packages/db/drizzle.config.ts"
---

# Database Migration Rules

When you modify any schema file in `packages/db/src/schema/`:

1. Export the new/changed table from `src/schema/index.ts`.
2. Run `pnpm db:generate` to create a migration.
3. READ the generated SQL file in `src/migrations/`. Verify it does what you expect.
4. Check for destructive operations: DROP TABLE, DROP COLUMN, ALTER TYPE. Flag them.
5. Run `pnpm db:migrate` to apply.

- NEVER edit files in `src/migrations/` directly. Regenerate if wrong.
- NEVER run `pnpm db:push` for anything except throwaway prototyping.
- For column renames: add new column → copy data → drop old column. Never rely on auto-rename detection.
- ALWAYS add `createdAt` and `updatedAt` timestamps with timezone to new tables.
- ALWAYS use `uuid` primary keys with `.defaultRandom()`.
