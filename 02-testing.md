# Testing as a First-Class Citizen

> Opinionated testing setup for a TypeScript fullstack monorepo with Claude Code.

## The Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Test runner | **Vitest** | Native ESM, TS-first, Vite-powered, blazing fast |
| E2E | **Playwright** | Multi-browser, auto-wait, best API, trace viewer |
| Mocking | **Vitest built-in** | `vi.mock()`, `vi.fn()`, `vi.spyOn()` — no extra deps |
| Coverage | **v8 (via Vitest)** | Fast native coverage, no instrumentation overhead |
| Factories | **Custom factory functions** | Lightweight, type-safe, no magic |
| DB testing | **Real database + migrations** | Never mock your database. Use test containers or local Postgres |

## Test Organization

```
apps/api/
├── src/
│   ├── routes/
│   │   └── users.ts
│   └── services/
│       └── user-service.ts
└── tests/
    ├── unit/
    │   └── services/
    │       └── user-service.test.ts
    ├── integration/
    │   └── routes/
    │       └── users.test.ts
    └── helpers/
        ├── factories.ts        # Test data factories
        ├── setup.ts            # Global test setup
        └── db.ts               # Test database utilities

apps/web/
├── src/
│   └── components/
│       └── user-card.tsx
├── tests/
│   ├── unit/
│   │   └── components/
│   │       └── user-card.test.tsx
│   └── e2e/
│       ├── auth.spec.ts
│       └── dashboard.spec.ts
```

**Naming conventions:**
- Unit/Integration: `*.test.ts` or `*.test.tsx`
- E2E: `*.spec.ts`
- Helpers: no test suffix

## Vitest Configuration

### `tooling/vitest/base.config.ts`

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types/**",
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    reporters: ["default"],
    testTimeout: 10_000,
    hookTimeout: 30_000,
  },
});
```

### `apps/api/vitest.config.ts`

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "../../tooling/vitest/base.config";
import tsconfigPaths from "vite-tsconfig-paths";

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [tsconfigPaths()],
    test: {
      environment: "node",
      include: ["tests/unit/**/*.test.ts"],
      setupFiles: ["tests/helpers/setup.ts"],
    },
  })
);
```

### `apps/api/vitest.integration.config.ts`

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "../../tooling/vitest/base.config";
import tsconfigPaths from "vite-tsconfig-paths";

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [tsconfigPaths()],
    test: {
      environment: "node",
      include: ["tests/integration/**/*.test.ts"],
      setupFiles: ["tests/helpers/setup.ts"],
      pool: "forks",       // Isolate integration tests
      poolOptions: {
        forks: {
          singleFork: true, // Sequential — DB tests can't run in parallel
        },
      },
      testTimeout: 30_000,
    },
  })
);
```

### `apps/web/vitest.config.ts`

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "../../tooling/vitest/base.config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
      environment: "jsdom",
      include: ["tests/unit/**/*.test.{ts,tsx}"],
      setupFiles: ["tests/helpers/setup.ts"],
      css: false, // Don't process CSS in tests
    },
  })
);
```

## Playwright Configuration

### `apps/web/playwright.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["github"]]
    : [["html", { open: "on-failure" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

## Package.json Scripts

### `apps/api/package.json` (scripts section)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run --config vitest.config.ts",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:watch": "vitest --config vitest.config.ts",
    "test:coverage": "vitest run --coverage"
  }
}
```

### `apps/web/package.json` (scripts section)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run --config vitest.config.ts",
    "test:watch": "vitest --config vitest.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Test Patterns

### Unit Test Example

```typescript
// tests/unit/services/user-service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "@/services/user-service";
import { createMockDb } from "../helpers/db";

describe("UserService", () => {
  let service: UserService;
  let db: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    db = createMockDb();
    service = new UserService(db);
  });

  describe("getById", () => {
    it("returns user when found", async () => {
      const mockUser = { id: "1", name: "Alice", email: "alice@test.com" };
      db.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.getById("1");

      expect(result).toEqual(mockUser);
    });

    it("returns null when not found", async () => {
      db.query.users.findFirst.mockResolvedValue(undefined);

      const result = await service.getById("nonexistent");

      expect(result).toBeNull();
    });
  });
});
```

### Integration Test Example

```typescript
// tests/integration/routes/users.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createApp } from "@/index";
import { getTestDb, resetDb } from "../helpers/db";

describe("GET /api/users", () => {
  let app: ReturnType<typeof createApp>;
  let db: ReturnType<typeof getTestDb>;

  beforeAll(async () => {
    db = getTestDb();
    app = createApp(db);
  });

  beforeEach(async () => {
    await resetDb(db);
  });

  afterAll(async () => {
    await db.$client.end();
  });

  it("returns empty array when no users", async () => {
    const res = await app.request("/api/users");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns all users", async () => {
    await db.insert(users).values([
      { name: "Alice", email: "alice@test.com" },
      { name: "Bob", email: "bob@test.com" },
    ]);

    const res = await app.request("/api/users");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can sign in", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("alice@test.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("Welcome, Alice")).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("wrong@test.com");
    await page.getByLabel("Password").fill("wrong");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });
});
```

## Test Helpers

### `tests/helpers/factories.ts`

```typescript
// Simple factory pattern — no library needed
import type { NewUser, User } from "@my-app/db";

let counter = 0;

export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  counter++;
  return {
    name: `User ${counter}`,
    email: `user-${counter}@test.com`,
    ...overrides,
  };
}

export function buildUsers(count: number, overrides: Partial<NewUser> = {}): NewUser[] {
  return Array.from({ length: count }, () => buildUser(overrides));
}
```

### `tests/helpers/db.ts`

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import * as schema from "@my-app/db";

const TEST_DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/testdb";

let db: ReturnType<typeof drizzle>;

export function getTestDb() {
  if (!db) {
    db = drizzle(TEST_DATABASE_URL, { schema });
  }
  return db;
}

export async function resetDb(db: ReturnType<typeof drizzle>) {
  // Truncate all tables in reverse dependency order
  await db.execute(sql`TRUNCATE TABLE users CASCADE`);
}

export async function migrateTestDb() {
  const db = getTestDb();
  await migrate(db, { migrationsFolder: "../../packages/db/src/migrations" });
}
```

### `tests/helpers/setup.ts`

```typescript
import { beforeAll } from "vitest";
import { migrateTestDb } from "./db";

beforeAll(async () => {
  await migrateTestDb();
});
```

## Coverage Thresholds

Set in `vitest.config.ts`:

```
statements: 80%
branches:   75%
functions:  80%
lines:      80%
```

**Why these numbers:**
- 80% is high enough to catch gaps, low enough to not force useless tests on trivial code.
- Branches at 75% because edge cases in error handling are sometimes not worth testing.
- These are **enforced in CI** — builds fail if thresholds aren't met.

## TDD Workflow with Claude Code

The CLAUDE.md rules (see `04-claude-code-config.md`) enforce:

1. **Write test first** — Claude Code is instructed to write failing tests before implementation
2. **Run tests after every change** — hooks auto-run `vitest` on file changes
3. **Pre-commit enforcement** — `lefthook` runs unit tests before any commit
4. **Pre-push enforcement** — full test suite runs before pushing

### Test Pyramid

```
         /\
        /  \        E2E (Playwright)
       / 10 \       - Critical user flows only
      /------\      - Slow, expensive
     /        \     Integration (Vitest)
    /   25     \    - API routes, DB queries
   /------------\   - Real database, no mocks
  /              \  Unit (Vitest)
 /      65       \  - Services, utilities, components
/________________\  - Fast, isolated, mockable
```

Percentages are approximate targets — not hard rules. The key insight: **most tests should be unit tests** because they're fast and cheap.

## Anti-Patterns to Avoid

1. **Don't mock the database** in integration tests. Use a real test database.
2. **Don't test implementation details** — test behavior. If you refactor internals, tests shouldn't break.
3. **Don't write E2E tests for everything** — only critical user flows. Unit/integration tests cover the rest.
4. **Don't use `any` in tests** — tests should be type-safe too.
5. **Don't share state between tests** — each test gets a clean slate via `beforeEach`.
6. **Don't test framework code** — don't test that React renders a div. Test your logic.
