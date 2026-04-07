# Landing Page Design

## Overview

A single-page landing for the Never Code repo. Dark theme, monospace, terminal aesthetic. Explains what the repo is, the tech stack, and the agentic harness.

## Content Sections

### 1. Hero
- Title: "Never Code"
- Tagline: "The gold standard for agentic fullstack engineering"

### 2. What Is This
- 2-3 sentences: TypeScript fullstack monorepo with an autonomous Claude Code harness. Blueprints, experiment loops, immutable quality gates. Agents write code, machines verify it, humans trust the result.

### 3. The Stack
- Grid of tech: Next.js, Hono, tRPC, Drizzle, PostgreSQL, Vitest, Playwright, Biome
- Each item shows name only, styled as inline code blocks

### 4. The Harness
- List of slash commands with one-line descriptions:
  - `/implement` — Blueprint pattern: deterministic + agent nodes, TDD, 2-round cap
  - `/experiment` — Autonomous iteration: hypothesize → implement → evaluate → keep/discard
  - `/parallel-implement` — Dual worktree agents for backend + frontend
  - `/test-e2e` — E2E against real backend with healer loop
  - `/tdd` — Strict red-green-refactor cycle
  - `/review` — Audit changes against conventions

### 5. The Loop
- Text/ASCII representation of the blueprint:
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

### 6. Footer
- "Built by agents, verified by machines, trusted by humans."

## Technical Decisions

- **Server Component** — no `"use client"`, zero JS to browser
- **Pure CSS** — dark bg (`#0a0a0a`), green accent (`#00ff88`), white text, monospace font
- **Semantic HTML** — `main`, `section`, `h1`-`h3`, `ul`, `code`, `pre`
- **No dependencies added**

## Files Changed

1. `apps/web/src/app/page.tsx` — full page content
2. `apps/web/src/app/globals.css` — dark theme styles
3. `apps/web/tests/e2e/home.spec.ts` — updated E2E test for new sections

## Testing

- E2E: verify heading "Never Code" visible, "The Stack" section visible, at least one slash command visible
- Unit: not needed (no logic, pure markup)
