Implement a feature by dispatching parallel worktree agents for backend and frontend.

Feature: $ARGUMENTS

## Strategy

Split the feature into independent backend and frontend work. Each runs in
an isolated worktree so they can't interfere with each other or with your
main working directory.

## Execution

### Step 1: Plan [AGENT]
1. Analyze the feature requirements.
2. Split into backend work (API, DB, services) and frontend work (pages, components).
3. Identify the shared contract (types, validators in packages/shared).

### Step 2: Shared Contract [AGENT - main branch]
4. If new types/validators are needed in `packages/shared`, implement them first.
5. Run `pnpm typecheck` to verify shared changes.
6. Commit shared changes.

### Step 3: Dispatch Parallel Agents
7. Dispatch TWO agents in parallel, both with `isolation: "worktree"`:

**Agent 1 — Backend:**
```
1. Run pnpm install
2. Implement backend changes (API routes, services, tRPC routers) using TDD:
   - Write failing tests first
   - Implement minimum code to pass
   - Run pnpm --filter @never-code/api test:unit
3. Run pnpm typecheck
4. Run pnpm exec biome check --write .
5. If any gate fails, fix it (max 2 attempts per gate)
6. Commit with message: "feat(api): <description>"
```

**Agent 2 — Frontend:**
```
1. Run pnpm install
2. Implement frontend changes (pages, components) using TDD:
   - Write failing tests first
   - Implement minimum code to pass
   - Run pnpm --filter @never-code/web test:unit
3. Run pnpm typecheck
4. Run pnpm exec biome check --write .
5. If any gate fails, fix it (max 2 attempts per gate)
6. Commit with message: "feat(web): <description>"
```

### Step 4: Merge & Verify [DETERMINISTIC]
8. Once both agents complete, merge their branches.
9. Run `pnpm check` on the merged result.
10. If E2E tests are relevant, run `/test-e2e`.
11. Log to experiments.tsv.
12. Create final commit.

## Rules
- Shared types/validators MUST be committed to main BEFORE dispatching agents.
- Each agent gets max 2 retry attempts per failing gate.
- If merge conflicts arise, resolve them manually.
