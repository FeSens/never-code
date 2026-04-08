Persistent execution loop. DO NOT STOP until every acceptance criterion passes or you hit an unrecoverable blocker.

Task: $ARGUMENTS

## Phase 1: Requirements [AGENT]

Before writing any code, define EXACTLY what "done" means.

1. Break the task into **stories** — small, independently testable units of work.
2. For each story, write **acceptance criteria** as concrete assertions:
   ```
   Story 1: <title>
   - [ ] AC1: <specific, testable condition>
   - [ ] AC2: <specific, testable condition>
   ```
3. Order stories by dependency (implement foundations first).
4. Present the stories to the user for approval. DO NOT proceed until approved.

## Phase 2: Setup [DETERMINISTIC]

5. `git checkout -b feature/$(echo "$ARGUMENTS" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | head -c 50)`
6. `pnpm install`

## Phase 3: The Loop

For EACH story, execute this cycle. DO NOT move to the next story until the current one is fully green.

```
LOOP (per story):
│
├─ 3a. TDD Red [AGENT]
│   Write tests that encode the acceptance criteria.
│   [DETERMINISTIC] Run tests → confirm they FAIL.
│
├─ 3b. Implement [AGENT]
│   Write minimum code to pass.
│   [DETERMINISTIC] biome check --write .
│
├─ 3c. Gate [DETERMINISTIC]
│   Run ALL of these. Every single one. No skipping.
│   ┌─ pnpm typecheck
│   ├─ pnpm test:unit
│   ├─ pnpm lint
│   ├─ pnpm build — catches bundler-specific errors (webpack, etc.)
│   ├─ IF API changes: pnpm test:integration
│   ├─ IF UI changes: pnpm test:e2e (specific file)
│   ├─ IF UI changes: screenshot → Read → visual inspect
│   └─ IF UI changes: browser smoke test — open each affected page, verify no runtime errors
│
├─ 3d. Fix or Discard [AGENT]
│   IF any gate fails:
│     attempt fix (max 2 tries per gate)
│     IF still failing after 2: git reset --hard HEAD~1
│     Log as "discarded" in experiments.tsv
│     Re-hypothesize a different approach
│     GOTO 3b (NOT 3a — tests are already written)
│
├─ 3e. Commit [DETERMINISTIC]
│   git add -A
│   git commit -m "feat(<scope>): <story title>
│
│   Constraint: <any constraint that shaped this>
│   Rejected: <approaches tried and abandoned>
│   Confidence: <high|medium|low>"
│
├─ 3f. Log [DETERMINISTIC]
│   echo "$(date -Iseconds)\t$(git rev-parse --short HEAD)\tkept\tpass\tpass\tpass\t<story>" >> experiments.tsv
│
└─ 3g. Checkpoint [AGENT]
    Mark story as done. Print progress:
    "✓ Story 1/N complete. Moving to Story 2."
    CONTINUE to next story. DO NOT STOP.
```

## Phase 4: Integration Verification [DETERMINISTIC]

After ALL stories are complete:

7. `pnpm check` — the ultimate gate. Everything must pass.
8. If UI was touched:
   - Screenshot every affected page.
   - Read each screenshot. Verify visual quality.
9. If API was touched:
   - `pnpm test:integration`
10. Run relevant E2E tests: `cd apps/web && PLAYWRIGHT_HTML_OPEN=never npx playwright test --reporter=line`

## Phase 5: Deslop [AGENT]

11. Review ALL changes made during the loop:
    - `git diff main...HEAD --stat` — see the full scope
    - For each changed file: is there anything that can be removed?
    - Delete dead code, redundant abstractions, unnecessary comments.
    - Simplify anything over-engineered.
12. [DETERMINISTIC] `pnpm check` — verify deslop didn't break anything.
13. If changes were made: commit as `refactor: simplify <description>`

## Phase 6: Final Record [DETERMINISTIC]

14. Run `pnpm check` one final time.
15. Log final result to experiments.tsv.
16. Print summary:
    - Stories completed: N/N
    - Commits: list each
    - Files changed: count
    - Tests added: count
    - Approaches discarded: count

## Hard Rules

- **DO NOT STOP** between stories. The loop continues until all stories pass or you hit an unrecoverable blocker.
- **2-round cap per gate, not per story.** If a gate fails after 2 fix attempts, discard THAT APPROACH (git reset) and try a different one. You get unlimited approaches per story, but only 2 fix attempts per approach.
- **NEVER modify read-only files.** Fix source code, not config.
- **Commit after every passing story.** Not at the end. Each story = one commit. This preserves rollback granularity.
- **Log EVERY attempt** (kept and discarded) to experiments.tsv.
- **Commit trailers are mandatory** (Constraint, Rejected, Confidence). They preserve decision context.
- **Deslop pass is mandatory.** AI-generated code tends to over-abstract. Fight it.
- **If truly stuck** (3 consecutive discards on the SAME story with different approaches): STOP, summarize what you tried, ask the human. This is the ONLY reason to stop.
