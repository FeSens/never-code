Implement a feature using the Blueprint pattern (deterministic + agent nodes).

Feature: $ARGUMENTS

## Blueprint (follow this EXACTLY)

### Phase 1: Setup [DETERMINISTIC]
1. Run `git checkout -b feature/$(echo "$ARGUMENTS" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | head -c 50)` to create a feature branch.
2. Run `pnpm install` to ensure dependencies are current.

### Phase 2: Plan [AGENT]
3. Read existing code relevant to the feature.
4. Write a brief implementation plan: which files to change, which tests to write.
5. Identify the minimal set of files to touch (simplicity rule).

### Phase 3: TDD Red [AGENT]
6. Write failing tests FIRST that describe the expected behavior.
7. [DETERMINISTIC] Run `pnpm test:unit` — confirm the new tests FAIL (red phase).

### Phase 4: TDD Green [AGENT]
8. Write the minimum implementation code to make tests pass.
9. [DETERMINISTIC] Run `pnpm exec biome check --write .` — auto-format.
10. [DETERMINISTIC] Run `pnpm typecheck` — if errors:
    - [AGENT] Fix type errors (attempt 1)
    - [DETERMINISTIC] Run `pnpm typecheck` again
    - [AGENT] Fix type errors (attempt 2, FINAL)
    - If still failing after 2 attempts: STOP and report to human.

### Phase 5: Verify [DETERMINISTIC]
11. Run `pnpm test:unit` — if failures:
    - [AGENT] Fix test failures (attempt 1)
    - [DETERMINISTIC] Run `pnpm test:unit` again
    - [AGENT] Fix test failures (attempt 2, FINAL)
    - If still failing: STOP and report to human.
12. Run `pnpm lint` — must pass (auto-fix already ran).

### Phase 6: Integration [CONDITIONAL]
13. If you changed API routes or database schema:
    - [DETERMINISTIC] Run `pnpm test:integration`
    - [AGENT] Fix failures if any (max 2 attempts)
14. If you changed UI pages or components:
    - [DETERMINISTIC] Run relevant E2E tests via `/test-e2e`
    - [AGENT] Fix failures if any (max 2 attempts)

### Phase 6b: Visual Verification [CONDITIONAL — UI changes only]
15. If you changed any file in `apps/web/src/app/` or `apps/web/src/components/`:
    - [DETERMINISTIC] Start dev server if not running: `pnpm --filter @never-code/web dev &` (wait for ready)
    - [DETERMINISTIC] Take screenshot of each affected page:
      ```
      cd apps/web && npx playwright screenshot --wait-for-timeout=2000 "http://localhost:3000<path>" /tmp/visual-check.png
      ```
    - [AGENT] Read the screenshot with the Read tool. Inspect for:
      - **Layout**: alignment, spacing, overflow, responsive issues
      - **Content**: text readable, nothing cut off, no missing sections
      - **Styling**: colors match theme, fonts correct, no visual glitches
      - **Consistency**: matches the terminal/dark aesthetic of the rest of the site
    - [AGENT] If issues found: fix and re-screenshot (max 2 attempts)
    - If no issues: proceed.

### Phase 7: Record [DETERMINISTIC]
16. Run `pnpm check` one final time as the ultimate gate.
17. Log results to `experiments.tsv`:
    ```
    echo "$(date -Iseconds)\t$(git rev-parse --short HEAD)\tkept\tpass\tpass\tpass\t$ARGUMENTS" >> experiments.tsv
    ```
18. Commit all changes: `git add -A && git commit -m "feat: <description>"`
19. Summarize: what was implemented, what tests were added, files changed.

## Hard Rules
- MAX 2 retry attempts on any failing gate. Then STOP.
- NEVER modify read-only files (biome.json, base tsconfig, etc.) to pass gates.
- Prefer fewer files, fewer lines, fewer deps.
