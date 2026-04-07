Run Playwright E2E tests against the real backend.

If $ARGUMENTS is provided, run only matching tests:
  `cd apps/web && PLAYWRIGHT_HTML_OPEN=never npx playwright test --reporter=line $ARGUMENTS`

If no arguments, determine which E2E tests are relevant based on files
modified in this session. Run only those, not the entire suite.

## Before running
- Ensure Docker is running (`docker compose up -d`) for the database.
- The playwright config auto-starts both the API server (:4000) and web app (:3000).
- DB is auto-migrated and seeded via `globalSetup`.

## After running
1. If tests PASS: report success briefly.
2. If tests FAIL:
   - Read terminal output (line reporter) for immediate context.
   - If screenshots were captured, read them from `apps/web/test-results/`.
   - For structured details, read `apps/web/test-results/results.json`.
   - Analyze root cause: selector issue, timing, or actual bug?
   - Fix the issue (test code or app code as appropriate).
   - Re-run ONLY the failing test(s) to verify.
   - Repeat until green or you need human input.

## Locator rules
- ALWAYS use `getByRole`, `getByLabel`, `getByText` locators.
- NEVER use CSS selectors or `data-testid` unless no semantic alternative exists.
- For complex assertions, use `toMatchAriaSnapshot()` for LLM-friendly diffs.

## Environment
- `PLAYWRIGHT_HTML_OPEN=never` — prevents browser opening in terminal.
- Tests run headless by default. Never change this.
