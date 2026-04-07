Run an autonomous experiment loop to iteratively improve code toward a goal.

Inspired by Karpathy's autoresearch: hypothesize → modify → evaluate → keep or discard → repeat.

Goal: $ARGUMENTS

## The Loop (max 10 iterations)

For each iteration:

### 1. Observe [DETERMINISTIC]
- Run `git status` and `git log --oneline -5` to understand current state.
- Run `pnpm check` to establish the current baseline. Record results.

### 2. Hypothesize [AGENT]
- Based on the goal, current code, and previous attempts in `experiments.tsv`, propose ONE specific change.
- Write a one-line hypothesis: "If I [change], then [expected improvement] because [reasoning]."

### 3. Implement [AGENT]
- Make the change. Keep it small and focused (one hypothesis per iteration).
- Commit: `git add -A && git commit -m "experiment: <hypothesis>"`

### 4. Evaluate [DETERMINISTIC]
- Run `pnpm exec biome check --write .` — auto-format.
- Run `pnpm typecheck` — record pass/fail.
- Run `pnpm test:unit` — record pass/fail.
- Run `pnpm lint` — record pass/fail.
- If the change touched UI files (`apps/web/src/app/**` or `apps/web/src/components/**`):
  - Take screenshot: `cd apps/web && npx playwright screenshot --wait-for-timeout=2000 "http://localhost:3000" /tmp/experiment-screenshot.png`
  - Read the screenshot with the Read tool.
  - Evaluate: does the visual result match the hypothesis? Any regressions?

### 5. Decide [AGENT]
- **KEEP** if: all gates pass AND the change moves toward the goal.
- **DISCARD** if: any gate fails OR the change doesn't help.
- If discarding: `git reset --hard HEAD~1`

### 6. Log [DETERMINISTIC]
Append to `experiments.tsv`:
```
echo "$(date -Iseconds)\t$(git rev-parse --short HEAD)\t<kept|discarded>\t<typecheck>\t<tests>\t<lint>\t<hypothesis>" >> experiments.tsv
```

### 7. Reflect [AGENT]
- What worked? What didn't?
- What should the NEXT iteration try?
- If stuck for 3 consecutive discards: try a radically different approach.

### 8. Continue or Stop
- If goal is achieved: STOP and summarize all iterations.
- If max iterations (10) reached: STOP, summarize progress, report what's left.
- Otherwise: GOTO step 1.

## Rules
- ONE change per iteration. Small, testable hypotheses.
- NEVER modify read-only files to make gates pass.
- After 3 consecutive discards, CHANGE STRATEGY radically.
- All output from commands goes to stdout — read it, don't guess.
- The `experiments.tsv` log is sacred. Never delete entries.
