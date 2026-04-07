# never-code

The gold standard for agentic fullstack engineering.

A TypeScript fullstack monorepo template with an autonomous Claude Code harness. Blueprints enforce deterministic quality gates. Experiment loops iterate toward goals. Agents write code, machines verify it, humans trust the result.

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 15 (App Router) |
| Backend | Hono + tRPC |
| Database | PostgreSQL + Drizzle ORM |
| Shared | Zod validators, TypeScript types |
| Testing | Vitest (unit/integration) + Playwright (E2E) |
| Linting | Biome (lint + format) |
| Git hooks | Lefthook (pre-commit + pre-push) |
| CI | GitHub Actions (5-phase pipeline) |
| Monorepo | pnpm workspaces + Turborepo |

## Quick Start

```bash
# Clone the template
gh repo create my-app --template FeSens/never-code --clone
cd my-app

# Install
pnpm install

# Start database
docker compose up -d

# Run migrations + seed
pnpm db:migrate && pnpm db:seed

# Start development
pnpm dev
```

## The Harness

Claude Code slash commands that enforce structured workflows:

| Command | Pattern | What it does |
|---------|---------|-------------|
| `/implement` | Blueprint | Deterministic + agent nodes, TDD, 2-round retry cap |
| `/experiment` | Research Loop | Hypothesize, implement, evaluate, keep or discard (max 10 iterations) |
| `/parallel-implement` | Devbox | Dual worktree agents for backend + frontend in parallel |
| `/test-e2e` | Healer Loop | E2E against real backend, auto-diagnose + fix failures |
| `/tdd` | TDD | Strict red-green-refactor cycle |
| `/review` | Code Review | Audit changes against conventions |
| `/worktree-task` | Isolation | Dispatch any task to an isolated git worktree |

## Safety Guarantees

- **Immutable evaluation harness** — `biome.json`, tsconfig, coverage thresholds are read-only. Agents fix code, not rules.
- **2-round retry cap** — Max 2 fix attempts per failing gate. No infinite token-burning loops.
- **Git as undo** — Every experiment is a commit. Discard = `git reset`. Keep = advance.
- **experiments.tsv** — Append-only lab notebook logging every attempt.
- **Deterministic nodes** — Lint, format, typecheck, test runs always execute as-is. No LLM approximation.
- **Real backend E2E** — Playwright hits actual Hono API + PostgreSQL. No mocks.

## The Blueprint Loop

```
[DETERMINISTIC] Create branch
      ↓
[AGENT] Write failing tests
      ↓
[DETERMINISTIC] Confirm tests fail
      ↓
[AGENT] Implement feature
      ↓
[DETERMINISTIC] Lint → Typecheck → Test
      ↓
[KEEP or DISCARD]
```

## Project Structure

```
never-code/
├── apps/
│   ├── web/          Next.js frontend
│   └── api/          Hono + tRPC API
├── packages/
│   ├── db/           Drizzle schema + migrations
│   └── shared/       Types, validators, utilities
├── .claude/
│   ├── settings.json Auto-format hooks, permissions
│   └── commands/     /implement, /experiment, /tdd, etc.
├── CLAUDE.md         Root rules (always loaded)
├── experiments.tsv   Lab notebook
└── lefthook.yml      Git hooks
```

## Commands

```bash
pnpm dev              # Start all apps
pnpm build            # Build all apps
pnpm check            # Lint + typecheck + unit tests
pnpm test:unit        # Unit tests
pnpm test:integration # Integration tests (needs DB)
pnpm test:e2e         # Playwright E2E (starts servers automatically)
pnpm typecheck        # TypeScript checking
pnpm lint             # Biome lint
pnpm format           # Biome format
pnpm db:generate      # Generate Drizzle migration
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
```

## Inspired By

- [Karpathy's Autoresearch](https://github.com/karpathy/autoresearch) — autonomous experiment loops, git-as-undo, immutable evaluation harness
- [Stripe Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) — blueprint pattern (deterministic + agent nodes), 2-round CI cap, scoped context

## License

MIT
