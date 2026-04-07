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

### Test Selection Guide
- **Unit tests** (`pnpm test:unit`): After ANY logic change. Always run.
- **Integration tests** (`pnpm test:integration`): After API route or database changes.
- **E2E tests** (`/test-e2e` or `pnpm test:e2e`): After UI changes, auth flows, or user journey changes. Run SPECIFIC tests, not the full suite.

### E2E Tests (Playwright)
- E2E tests run against a REAL backend (Hono API on :4000) and REAL database.
- Playwright config auto-starts both servers. DB is auto-migrated/seeded.
- Run specific tests: `cd apps/web && PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/e2e/<file> --reporter=line`
- Always set `PLAYWRIGHT_HTML_OPEN=never` when running E2E.
- On failure: read terminal output first, then screenshots in `apps/web/test-results/`.
- For structured failure data: read `apps/web/test-results/results.json`.
- Use `getByRole`, `getByLabel`, `getByText` locators. NEVER use CSS selectors.
- For complex UI assertions, use `toMatchAriaSnapshot()` for LLM-friendly diffs.

## Worktree Agents
- Subagents dispatched with `isolation: "worktree"` get a fresh copy of the repo.
- Each worktree agent must run `pnpm install` before any work.
- Worktree agents should run `docker compose up -d` if they need the database.
- Results are returned as branches that can be merged or cherry-picked.

## Before Completing Any Task

1. `pnpm typecheck` — zero errors
2. `pnpm test:unit` — all pass
3. `pnpm lint` — all pass
4. If API changes: `pnpm test:integration`
5. If UI changes: relevant E2E tests (`/test-e2e`)
