Dispatch a task to run in an isolated git worktree.

The task will run in a fresh copy of the repo so it can't interfere with
the main working directory. Use this for:
- Implementing features in parallel
- Running full test suites without blocking your work
- Exploratory changes you might discard

## How to use
Dispatch an Agent with `isolation: "worktree"`. The agent prompt MUST include:

1. `pnpm install` as the first step (worktrees need fresh node_modules)
2. `docker compose up -d` if database access is needed
3. The actual task to perform
4. `pnpm check` as verification before finishing

## Example dispatch
```
Agent(
  isolation: "worktree",
  prompt: "1. Run pnpm install
           2. Run docker compose up -d
           3. [YOUR TASK HERE]
           4. Run pnpm check to verify
           5. Commit your changes with a descriptive message"
)
```

Task to dispatch: $ARGUMENTS
