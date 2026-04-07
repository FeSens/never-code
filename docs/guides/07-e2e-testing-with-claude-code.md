# E2E Testing with Claude Code

> How Claude Code runs, evaluates, and fixes Playwright E2E tests against a real backend.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Playwright  │────▶│  Next.js     │────▶│  Hono API    │
│  (headless)  │     │  :3000       │     │  :4000       │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                           ┌──────▼───────┐
                                           │  PostgreSQL   │
                                           │  :5432        │
                                           └──────────────┘
```

E2E tests hit the **real frontend**, which talks to the **real API**, which queries the **real database**. No mocks. No stubs. This catches integration bugs that unit tests miss.

## Reporter Strategy

```typescript
// playwright.config.ts
reporter: process.env.CI
  ? [["github"], ["json", { outputFile: "test-results/results.json" }]]
  : [["line"], ["json", { outputFile: "test-results/results.json" }]],
```

| Reporter | Purpose | Who reads it |
|----------|---------|-------------|
| `line` | Concise 1-line-per-test terminal output | Claude Code (stdout) |
| `json` | Structured failure data with stack traces | Claude Code (Read tool) |
| `github` | PR annotations | GitHub Actions |
| `html` | **Not used** — opens a browser, breaks in terminal | Humans only |

**Critical**: Always set `PLAYWRIGHT_HTML_OPEN=never` to prevent browser popups.

## Server Lifecycle

Playwright's `webServer` array handles everything automatically:

```typescript
webServer: [
  {
    command: "pnpm --filter @never-code/api dev",
    url: "http://localhost:4000/health",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    stdout: "pipe",
  },
  {
    command: "pnpm --filter @never-code/web dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
  },
],
```

**How it works:**
1. If servers are already running → reuse them (fast, no restart)
2. If not → Playwright starts both, waits for health checks, runs tests, kills servers
3. `stdout: "pipe"` → server logs visible to Claude Code if startup fails

**Database**: `globalSetup` runs `pnpm db:migrate && pnpm db:seed` before tests.

## How Claude Code Evaluates E2E Failures

### Step 1: Read terminal output (line reporter)

```
Running 3 tests using 1 worker
  ✓ home.spec.ts:4 displays heading (120ms)
  ✗ auth.spec.ts:8 user can sign in (2.4s)
  ✓ auth.spec.ts:15 shows error on invalid credentials (890ms)
```

The line reporter gives Claude immediate pass/fail context.

### Step 2: Read failure screenshots

Playwright saves screenshots on failure to `apps/web/test-results/<test-name>/`. Claude Code can read PNG files with the `Read` tool — it's multimodal and can analyze what the page actually shows vs what was expected.

### Step 3: Read JSON results for structured data

```bash
# Claude Code reads this file for detailed error info
cat apps/web/test-results/results.json | jq '.suites[].specs[].tests[].results[].errors'
```

The JSON includes:
- `errors[].message` — the assertion that failed
- `errors[].stack` — stack trace pointing to the failing line
- `attachments[]` — paths to screenshots and traces

### Step 4: Use ARIA snapshots for semantic debugging

Instead of relying on visual screenshots alone, ARIA snapshots give Claude a text representation of the page:

```typescript
test("navigation structure", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation")).toMatchAriaSnapshot(`
    - navigation "Main":
      - link "Home"
      - link "Dashboard"
      - link "Settings"
  `);
});
```

When this fails, Claude gets a text diff — far more useful than a screenshot for fixing locator issues.

## Locator Strategy

**Always prefer semantic locators** — they're more resilient and LLM-friendly:

```typescript
// GOOD — semantic, resilient
page.getByRole("button", { name: "Sign in" })
page.getByLabel("Email")
page.getByText("Welcome, Alice")
page.getByRole("heading", { level: 1 })

// BAD — fragile, meaningless to LLM
page.locator(".btn-primary")
page.locator("#email-input")
page.locator("div > span:nth-child(2)")
```

## Database Seeding for E2E

### Global Setup (before all tests)

```typescript
// tests/e2e/global-setup.ts
import { execSync } from "node:child_process";

export default async function globalSetup() {
  execSync("pnpm db:migrate && pnpm db:seed", {
    cwd: "../../..",
    stdio: "inherit",
  });
}
```

### Per-Test Cleanup (when needed)

For tests that mutate data, use API-driven cleanup:

```typescript
import { test, expect } from "@playwright/test";

test.afterEach(async ({ request }) => {
  // Clean up test data via API endpoint
  await request.post("http://localhost:4000/test/reset");
});
```

## Auth State Persistence

For apps with authentication, use Playwright's storage state:

```typescript
// playwright.config.ts
projects: [
  { name: "setup", testMatch: /.*\.setup\.ts/ },
  {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      storageState: "playwright/.auth/user.json",
    },
    dependencies: ["setup"],
  },
],

// tests/e2e/auth.setup.ts
import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("alice@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
```

## The Healer Pattern (Auto-Fix Loop)

The most effective pattern for Claude Code + E2E testing is the **healer loop**:

```
1. Run failing test
2. Read failure output + screenshot
3. Diagnose: is it a test issue or app issue?
4. Fix the code
5. Re-run ONLY the failing test
6. If still failing → goto 2 (max 5 iterations)
7. If passing → run full related suite to check for regressions
```

The `/test-e2e` slash command implements this pattern.

## Worktree Isolation for E2E

When dispatching agents with `isolation: "worktree"`:

```
Each worktree agent gets:
├── Fresh git worktree (isolated file state)
├── Needs `pnpm install` (no shared node_modules)
├── Needs `docker compose up -d` (if using DB)
├── Can run full E2E without affecting main workspace
└── Returns results as a branch
```

This means agents can run destructive E2E tests (reset DB, modify data) without interfering with your development.

## Practical Commands

```bash
# Run all E2E (auto-starts servers, seeds DB)
cd apps/web && PLAYWRIGHT_HTML_OPEN=never npx playwright test --reporter=line

# Run specific test file
cd apps/web && PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/e2e/home.spec.ts --reporter=line

# Run tests matching a name pattern
cd apps/web && PLAYWRIGHT_HTML_OPEN=never npx playwright test -g "sign in" --reporter=line

# Debug a failing test (see browser, pause on failure)
cd apps/web && npx playwright test tests/e2e/auth.spec.ts --debug

# Generate test code by recording actions
cd apps/web && npx playwright codegen http://localhost:3000

# View last test results
cd apps/web && npx playwright show-report
```

## Anti-Patterns

1. **Don't run full E2E suite on every change.** Run specific tests. Full suite in CI only.
2. **Don't use `waitForTimeout`.** Use `waitForSelector`, `expect().toBeVisible()`, or auto-wait.
3. **Don't test implementation details.** Test user-visible behavior.
4. **Don't mock the backend in E2E.** That's what unit/integration tests are for.
5. **Don't write E2E for everything.** Critical user flows only. Unit tests cover the rest.
