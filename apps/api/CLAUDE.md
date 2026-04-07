# Backend — Hono + tRPC API

## Structure

```
src/
├── index.ts          Entry point — starts HTTP server on :4000
├── app.ts            Hono app factory — middleware, routes, tRPC mount
├── routes/           Hono route handlers (non-tRPC endpoints)
│   └── health.ts     GET /health
├── trpc/
│   ├── trpc.ts       tRPC initialization (router, publicProcedure, middleware)
│   ├── context.ts    Request context (database connection)
│   ├── router.ts     Root router — composes all sub-routers
│   └── routers/      Domain-specific routers (one file per domain)
│       └── user.ts
├── services/         Business logic (one class per domain)
│   └── user-service.ts
└── middleware/        Hono middleware
    └── error-handler.ts
```

## Hono Routes

For non-tRPC endpoints (webhooks, health checks, file uploads):

```typescript
import { Hono } from "hono";

export const healthRoute = new Hono().get("/", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});
```

Rules:
- One route file per resource in `src/routes/`.
- Export a named `Hono` instance. NEVER export a default.
- Mount routes in `app.ts` via `app.route("/path", routeHandler)`.
- Return proper HTTP status codes: 200 (ok), 201 (created), 204 (no content), 400 (bad input), 401 (unauthenticated), 403 (forbidden), 404 (not found), 500 (server error).

## tRPC Procedures

Follow the established pattern in `src/trpc/routers/user.ts`:

```typescript
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users } from "@never-code/db/schema";
import { createUserSchema } from "@never-code/shared/validators";
import { publicProcedure, router } from "../trpc.js";

export const userRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => { ... }),

  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => { ... }),
});
```

Rules:
- One router file per domain in `src/trpc/routers/`.
- ALWAYS validate inputs with Zod. Use schemas from `@never-code/shared/validators` when they exist.
- Compose routers in `src/trpc/router.ts`.
- Use `.query()` for reads, `.mutation()` for writes. NEVER use `.mutation()` for reads.
- Access the database via `ctx.db`. NEVER import the db client directly in routers.
- For complex business logic, delegate to a service class. Keep routers thin.

## Services

Follow the established pattern in `src/services/user-service.ts`:

```typescript
import type { Database } from "@never-code/db";

export class UserService {
  constructor(private db: Database) {}

  async getById(id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user ?? null;
  }
}
```

Rules:
- One service class per domain.
- Receive `Database` (and other dependencies) via constructor injection. This makes services testable.
- Return `null` for "not found" (not `undefined`, not throwing).
- Throw errors for unexpected failures. The error-handler middleware catches them.
- NEVER import `process.env` in services. Pass config via constructor.

## Context

The tRPC context is defined in `src/trpc/context.ts`:

```typescript
export type Context = {
  db: Database;
};
```

Rules:
- Use `type` not `interface` for Context (required by `@hono/trpc-server`'s index signature constraint).
- Add new dependencies (auth, logger, etc.) to the Context type. NEVER access globals from procedures.

## Error Handling

- The `error-handler.ts` middleware catches unhandled errors and returns structured JSON.
- In tRPC procedures, errors are automatically caught and returned as tRPC errors.
- For expected errors (not found, validation), throw with a message. For unexpected errors, let them bubble.
- NEVER swallow errors with empty `catch` blocks.
- NEVER return error details from production (stack traces, internal paths).

## Import Conventions

```typescript
// External packages first
import { z } from "zod";
import { eq } from "drizzle-orm";

// Workspace packages
import { users } from "@never-code/db/schema";
import { createUserSchema } from "@never-code/shared/validators";

// Local imports (with .js extension for ESM)
import { publicProcedure, router } from "../trpc.js";
```

- Biome auto-sorts imports. Don't manually reorder.
- Local imports use `.js` extensions (required by ESM + TypeScript with `verbatimModuleSyntax`).
- Use `import type` for type-only imports (enforced by Biome `useImportType` rule).

## Testing

### Unit Tests

Location: `tests/unit/` — test services in isolation with mocked database.

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { UserService } from "@/services/user-service";

function createMockDb() {
  return {
    query: { users: { findMany: vi.fn(), findFirst: vi.fn() } },
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn() }) }),
  };
}
```

Rules:
- Mock the database layer. NEVER start a real database for unit tests.
- Use `vi.fn()` for mocks, `vi.spyOn()` for spying on existing methods.
- Test service methods, not tRPC procedures (services contain the logic).
- Use factories from `tests/helpers/factories.ts` for test data.

### Integration Tests

Location: `tests/integration/` — test HTTP endpoints with the real app.

```typescript
import { createApp } from "@/app";

describe("GET /health", () => {
  const app = createApp();

  it("returns ok status", async () => {
    const res = await app.request("/health");
    const body = (await res.json()) as { status: string };
    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
  });
});
```

Rules:
- Use `app.request()` (Hono's built-in test utility). NO need for `supertest`.
- Cast `res.json()` with `as` since Hono returns `unknown`. This is one of the few acceptable uses of type assertion.
- For tests needing a database: ensure Docker is running, use `tests/helpers/setup.ts` for migration.
- NEVER mock the database in integration tests. Use a real test database.
