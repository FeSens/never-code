# Database — Drizzle ORM

## Structure
- Schema in `src/schema/` — one file per table
- Migrations in `src/migrations/` — auto-generated, DO NOT edit
- Client export in `src/index.ts`

## Rules
- After schema changes: `pnpm db:generate` then `pnpm db:migrate`
- Tables: `snake_case` plural. Columns: `snake_case`.
- Always add `created_at` and `updated_at` timestamps.
- Use `uuid` for primary keys.
