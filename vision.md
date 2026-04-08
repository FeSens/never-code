# Vision: Never Code

The gold standard template for agentic fullstack engineering.

## What This Is

A production-quality TypeScript monorepo template where the AI harness is the product. You clone it, strip the demo landing page, and start building — with an autonomous development loop, immutable quality gates, and structured workflows already wired in.

Nobody else has this. Fullstack templates ignore AI tooling. AI setups are thin on the stack. We're the intersection.

## Who It's For

Developers who use Claude Code (or similar AI agents) as their primary coding tool and want a repo that's purpose-built for that workflow — not retrofitted.

## What Makes Someone Say "This Is Amazing"

1. You clone it, run `/ralph add user authentication`, and walk away. Come back to working auth with tests, types, and clean code.
2. Every commit the agent makes passes lint, typecheck, and tests — automatically, always.
3. The agent can see what it built (screenshots), knows the rules (scoped CLAUDE.md), and cleans up after itself (deslop).
4. The experiment log shows you exactly what was tried, what worked, what was discarded.

## Roadmap

### Phase 1 (Complete)
- [x] Auth scaffold (email/password, sessions, protected routes)
- [x] API error handling middleware with typed error responses
- [x] Database seed with realistic data + reset command
- [x] `/onboard` command — auto-generate CLAUDE.md context from existing code
- [x] Healthcheck dashboard page (shows API status, DB connection, test results)
- [x] Self-maintaining CLAUDE.md — `/evolve-harness` reviews logs and proposes rule updates
- [x] `/deploy` command — one-command deployment with env validation
- [x] Protected zones — read-only files list in CLAUDE.md (immutable harness)
- [x] Agent scorecard — `/scorecard` tracks kept/discarded ratio from experiments.tsv
- [x] `/collab` — human writes test, agent implements. Or vice versa.

### Phase 2 (Current)

#### Quick Wins
- [ ] Wire auth forms to tRPC — login/register pages call the API, show validation errors and loading states, E2E test for full auth flow
- [ ] `npx create-never-code` CLI — one-command bootstrap (clone, install, Docker, migrate, seed, check)
- [ ] AGENTS.md cross-agent compatibility — same repo works with Codex, Cursor, Copilot
- [ ] Session handoff artifacts — `/wrap-up` and `/resume` commands for session persistence
- [ ] Component library basics — Input, Form, Card, Modal in dark terminal aesthetic

#### Big Bets
- [ ] Agent cost tracker — token usage per session/command/feature, displayed in scorecard and dashboard
- [ ] Evaluator agent — separate agent reviews diffs for semantic issues beyond lint/typecheck
- [ ] Real-time agent dashboard — WebSocket page showing active agents, pass/fail, experiment history

#### Moonshots
- [ ] Codebase-context MCP server — indexes codebase patterns, teaches agents your team's style
- [ ] Multi-agent campaign orchestrator — decomposes goals into parallel worktree agents with writer/reviewer roles

### Research Incorporated
- [x] Karpathy autoresearch — experiment loop, git-as-undo, NEVER STOP
- [x] Stripe Minions — blueprint pattern, deterministic nodes, 2-round CI cap
- [x] oh-my-claudecode — commit trailers, deslop pass, ralph persistence
- [x] Stanford Meta-Harness — raw failure logs, evidence-based rules, lean gates
