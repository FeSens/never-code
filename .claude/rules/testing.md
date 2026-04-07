---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
---

# Testing Rules

- Import `describe`, `it`, `expect`, `vi` explicitly from `vitest` (even though globals are enabled).
- Name tests as behaviors: `it("returns null when user not found")` not `it("test getById")`.
- Use `vi.fn()` for mocks, `vi.spyOn()` for spying. Reset between tests with `vi.clearAllMocks()`.
- NEVER import heavy dependencies (database client, HTTP server) in unit tests. That makes it an integration test.
- Use factories from `tests/helpers/factories.ts` for test data. NEVER hardcode test objects inline.
- Cast `res.json()` responses with `as` in integration tests — this is one of the few acceptable type assertions.
- For Playwright: use `getByRole` > `getByLabel` > `getByText`. NEVER use CSS selectors.
- NEVER use `page.waitForTimeout()` in Playwright. Use auto-waiting locators and `expect().toBeVisible()`.
