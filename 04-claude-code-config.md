# Claude Code Configuration — Advanced Harness

> Complete setup for `.claude/`, `CLAUDE.md`, hooks, custom commands, and settings.

## File Overview

```
project-root/
├── CLAUDE.md                       # Root rules (always loaded)
├── apps/
│   ├── web/
│   │   └── CLAUDE.md               # Frontend-specific rules
│   └── api/
│       └── CLAUDE.md               # Backend-specific rules
├── packages/
│   └── db/
│       └── CLAUDE.md               # Database-specific rules
└── .claude/
    ├── settings.json               # Project-level settings + hooks
    └── commands/
        ├── test.md                 # /test slash command
        ├── tdd.md                  # /tdd slash command
        ├── review.md               # /review slash command
        └── new-feature.md          # /new-feature slash command
```

## Root CLAUDE.md

```markdown
# Project: My App

TypeScript fullstack monorepo. Next.js frontend, Hono API, PostgreSQL + Drizzle ORM, tRPC for API contracts.

## Architecture

- `apps/web` — Next.js 15 App Router frontend
- `apps/api` — Hono REST/tRPC API server
- `packages/db` — Drizzle ORM schema, migrations, seed
- `packages/shared` — Shared types, Zod validators, utilities

## Commands

- `pnpm dev` — Start all apps in development
- `pnpm build` — Build all apps
- `pnpm test` — Run all tests
- `pnpm test:unit` — Unit tests only
- `pnpm test:integration` — Integration tests only (needs running DB)
- `pnpm test:e2e` — Playwright E2E tests
- `pnpm typecheck` — TypeScript type checking
- `pnpm lint` — Biome lint
- `pnpm format` — Biome format
- `pnpm db:generate` — Generate Drizzle migration
- `pnpm db:migrate` — Run migrations
- `pnpm db:studio` — Open Drizzle Studio

## Coding Conventions

### TypeScript
- Strict mode is ON. Never use `any` — use `unknown` and narrow.
- Use `import type` for type-only imports.
- Prefer `interface` over `type` for object shapes (extendable).
- Use Zod schemas in `packages/shared/src/validators/` for all runtime validation.
- Path aliases: `@/*` maps to `./src/*` in each app.

### Naming
- Files: `kebab-case.ts` (e.g., `user-service.ts`)
- React components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Variables/functions: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Database tables: `snake_case` (plural: `users`, `user_roles`)

### Error Handling
- Backend: throw typed errors that middleware catches. Never swallow errors.
- Frontend: use error boundaries for React errors. Use `try/catch` only at async boundaries.
- Always return proper HTTP status codes from API routes.

## Testing Requirements

- **ALWAYS write tests for new code.** No exceptions.
- **TDD preferred:** Write a failing test first, then implement.
- Unit tests go in `tests/unit/`, integration in `tests/integration/`, E2E in `tests/e2e/`.
- Run `pnpm test:unit` after every implementation change to verify.
- Never mock the database in integration tests — use the real test database.
- Test file naming: `*.test.ts` for unit/integration, `*.spec.ts` for E2E.

## Before Completing Any Task

1. Run `pnpm typecheck` — must pass with zero errors.
2. Run `pnpm test:unit` — must pass.
3. Run `pnpm lint` — must pass.
4. If you changed API routes, run `pnpm test:integration`.
5. If you changed UI flows, run relevant E2E tests.

## Git

- Write clear, concise commit messages.
- One logical change per commit.
- Never commit `.env` files or secrets.
```

## Frontend CLAUDE.md (`apps/web/CLAUDE.md`)

```markdown
# Frontend — Next.js App Router

## Structure
- Pages in `src/app/` using App Router conventions
- Components in `src/components/` — one component per file
- Hooks in `src/hooks/`
- tRPC client setup in `src/trpc/`

## Rules
- Use Server Components by default. Only add `"use client"` when needed (interactivity, hooks, browser APIs).
- Fetch data in Server Components using tRPC server caller, not client-side.
- Use `next/image` for all images. Never use raw `<img>`.
- Use `next/link` for all internal navigation.
- CSS: Tailwind CSS utility classes. No CSS modules or styled-components.
- State management: React state + context. No Redux. Use `nuqs` for URL state.

## Component Patterns
- Props interface defined above the component, named `{ComponentName}Props`.
- Prefer composition over prop drilling — use children and slots.
- Extract complex logic into custom hooks in `src/hooks/`.

## Testing
- Unit test components with Vitest + React Testing Library.
- Test behavior, not implementation — query by role, text, label.
- E2E tests in `tests/e2e/` for critical user flows.
```

## Backend CLAUDE.md (`apps/api/CLAUDE.md`)

```markdown
# Backend — Hono API

## Structure
- Routes in `src/routes/` — one file per resource (e.g., `users.ts`)
- Business logic in `src/services/` — one file per domain
- Middleware in `src/middleware/`
- Entry point: `src/index.ts`

## Rules
- All routes use Zod validation for request body/params/query.
- Return typed responses — use tRPC or explicit response types.
- Services receive dependencies via constructor injection (testable).
- Database queries go through Drizzle — never write raw SQL unless necessary.
- All async operations must have proper error handling.

## API Design
- RESTful conventions: GET for reads, POST for creates, PATCH for updates, DELETE for deletes.
- Return appropriate HTTP status codes (200, 201, 204, 400, 401, 403, 404, 500).
- All list endpoints support pagination.
- Use middleware for cross-cutting concerns (auth, logging, rate limiting).

## Testing
- Unit test services by mocking the database layer.
- Integration test routes with a real database.
- Run `pnpm test:unit` from this directory for fast feedback.
- Run `pnpm test:integration` when changing routes (needs running DB: `docker compose up -d`).
```

## Database CLAUDE.md (`packages/db/CLAUDE.md`)

```markdown
# Database — Drizzle ORM

## Structure
- Schema definitions in `src/schema/` — one file per table
- Migrations in `src/migrations/` — auto-generated, DO NOT edit manually
- Client export in `src/index.ts`

## Rules
- Always use Drizzle's schema builder for table definitions.
- After changing schema, run `pnpm db:generate` to create a migration.
- Run `pnpm db:migrate` to apply migrations.
- Table names: `snake_case`, plural (`users`, `user_roles`).
- Column names: `snake_case` (`created_at`, `updated_at`).
- Always add `createdAt` and `updatedAt` timestamps to tables.
- Use `uuid` for primary keys unless there's a specific reason not to.
- Define relations using Drizzle's `relations()` helper.
```

## `.claude/settings.json`

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm:*)",
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(node:*)",
      "Bash(tsc:*)",
      "Bash(turbo:*)",
      "Bash(biome:*)",
      "Bash(vitest:*)",
      "Bash(playwright:*)",
      "Bash(docker compose:*)",
      "Bash(docker:*)",
      "Bash(git:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(find:*)",
      "Bash(grep:*)",
      "Bash(wc:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(mkdir:*)",
      "Bash(cp:*)",
      "Bash(mv:*)",
      "Bash(echo:*)",
      "Bash(which:*)",
      "Bash(env:*)",
      "Bash(curl:*)",
      "Read",
      "Write",
      "Edit",
      "Glob",
      "Grep"
    ],
    "deny": []
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "biome check --write --no-errors-on-unmatched $CLAUDE_FILE_PATHS 2>/dev/null || true"
      }
    ]
  }
}
```

### Hooks Explained

#### PostToolUse: Auto-format on file changes

Every time Claude writes or edits a file, Biome automatically:
1. Formats the file (indentation, spacing, line width)
2. Fixes auto-fixable lint issues (unused imports, import sorting)
3. Silently succeeds even if the file type isn't supported by Biome

This means Claude's output is **always clean** — no manual formatting needed.

## Custom Slash Commands

### `.claude/commands/test.md`

```markdown
Run the test suite for the area of code I'm working on.

1. Determine which app/package I've been modifying (web, api, db, shared).
2. Run the appropriate test command:
   - If `apps/api`: `pnpm --filter api test:unit`
   - If `apps/web`: `pnpm --filter web test:unit`
   - If `packages/*`: `pnpm --filter <package> test`
3. If tests fail, analyze the failures and fix them.
4. Re-run until all tests pass.
```

### `.claude/commands/tdd.md`

```markdown
Implement the requested feature using Test-Driven Development.

Follow this strict cycle:
1. **RED**: Write a failing test that describes the expected behavior. Run it to confirm it fails.
2. **GREEN**: Write the minimum code to make the test pass. Run the test to confirm.
3. **REFACTOR**: Clean up the code while keeping tests green. Run tests again.

Repeat for each piece of functionality. Never write implementation code without a failing test first.

After all tests pass:
- Run `pnpm typecheck`
- Run `pnpm lint`
- Summarize what was implemented and tested.
```

### `.claude/commands/review.md`

```markdown
Review the changes I've made in this session.

1. Run `git diff` to see all changes.
2. For each changed file, check:
   - Does it follow the coding conventions in CLAUDE.md?
   - Are there tests for the new/changed code?
   - Are there any type safety issues?
   - Are there any security concerns (SQL injection, XSS, auth bypasses)?
   - Is error handling appropriate?
3. Run `pnpm typecheck` and report any errors.
4. Run `pnpm test:unit` and report any failures.
5. Run `pnpm lint` and report any issues.
6. Provide a summary of findings with specific suggestions.
```

### `.claude/commands/new-feature.md`

```markdown
Help me plan and implement a new feature.

Steps:
1. **Clarify**: Ask me what the feature should do. Ask follow-up questions until you understand the requirements.
2. **Plan**: Outline the implementation plan:
   - Which files need to change?
   - What new files are needed?
   - What tests will be written?
   - What's the order of operations?
3. **Implement with TDD**:
   - Write tests first for each component
   - Implement the minimum code to pass
   - Refactor for quality
4. **Verify**:
   - `pnpm typecheck` passes
   - `pnpm test:unit` passes
   - `pnpm lint` passes
   - If API changes: `pnpm test:integration` passes
5. **Summarize**: List all changes made and tests added.
```

## Advanced: Global User Settings

In `~/.claude/settings.json` (user-level, applies to all projects):

```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Read",
      "Glob",
      "Grep"
    ]
  }
}
```

Keep project-specific permissions in `.claude/settings.json` (committed to repo), and personal preferences in `~/.claude/settings.json`.

## Tips for Effective CLAUDE.md Rules

1. **Be specific, not vague.** "Use Zod for validation" > "Validate inputs."
2. **Include the commands.** Claude needs to know exactly what to run.
3. **State what NOT to do.** "Never use `any`" is clearer than "Use proper types."
4. **Keep it under 200 lines.** Claude reads the whole file — bloat dilutes important rules.
5. **Use directory-level files** for context-specific rules. Don't put frontend rules in the root CLAUDE.md.
6. **Update regularly.** As conventions evolve, update CLAUDE.md. Stale rules cause stale code.
