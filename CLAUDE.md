# Never Code — TypeScript Fullstack Monorepo

Next.js frontend, Hono + tRPC API, PostgreSQL + Drizzle ORM.

## Architecture

- `apps/web` — Next.js 15 App Router frontend
- `apps/api` — Hono REST + tRPC API server
- `packages/db` — Drizzle ORM schema, migrations, seed
- `packages/shared` — Shared types, Zod validators, utilities

## Commands

- `pnpm dev` — Start all apps
- `pnpm build` — Build all apps
- `pnpm check` — Lint + typecheck + unit tests (run before completing any task)
- `pnpm test:unit` — Unit tests only
- `pnpm test:integration` — Integration tests (needs DB)
- `pnpm test:e2e` — Playwright E2E tests
- `pnpm typecheck` — TypeScript type checking
- `pnpm lint` — Biome lint
- `pnpm format` — Biome format
- `pnpm db:generate` — Generate Drizzle migration
- `pnpm db:migrate` — Run migrations
- `pnpm db:studio` — Open Drizzle Studio

## Critical Rules

1. NEVER use `any`. Use `unknown` and narrow with type guards.
2. ALWAYS run `pnpm check` before considering a task complete.
3. ALWAYS write tests for new code. TDD preferred: write failing test first, then implement.
4. NEVER commit code that fails `pnpm check`.
5. NEVER disable lint rules with inline comments without explaining why.

## Coding Conventions

### TypeScript
- Strict mode is ON. Use `import type` for type-only imports.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Zod schemas in `packages/shared/src/validators/` for runtime validation.
- Path aliases: `@/*` maps to `./src/*` in each app.

### Naming
- Files: `kebab-case.ts` (e.g., `user-service.ts`)
- React components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Variables/functions: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Database tables: `snake_case` plural (`users`, `user_roles`)

### Error Handling
- Backend: throw typed errors caught by middleware. Never swallow errors.
- Frontend: error boundaries for React, `try/catch` only at async boundaries.
- Return proper HTTP status codes from API routes.

## Testing

- Unit tests: `tests/unit/` — `*.test.ts`
- Integration tests: `tests/integration/` — `*.test.ts`
- E2E tests: `tests/e2e/` — `*.spec.ts`
- Never mock the database in integration tests.
- Use factories from `tests/helpers/factories.ts` for test data.

## Before Completing Any Task

1. `pnpm typecheck` — zero errors
2. `pnpm test:unit` — all pass
3. `pnpm lint` — all pass
4. If API changes: `pnpm test:integration`
5. If UI changes: relevant E2E tests
