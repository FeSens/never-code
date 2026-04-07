# CI/CD & Developer Experience

> Complete CI pipeline, git hooks, scripts, and infrastructure for a TypeScript fullstack monorepo.

## GitHub Actions CI Pipeline

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: "22"
  PNPM_VERSION: "9"
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb

jobs:
  # ──────────────────────────────────────────────
  # Phase 1: Fast checks (parallel, no services)
  # ──────────────────────────────────────────────
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec biome ci .

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit --reporter=verbose
      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: unit-coverage
          path: coverage/

  # ──────────────────────────────────────────────
  # Phase 2: Integration tests (needs database)
  # ──────────────────────────────────────────────
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: [typecheck, lint]
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:migrate
      - run: pnpm test:integration --reporter=verbose

  # ──────────────────────────────────────────────
  # Phase 3: E2E + Build (needs everything)
  # ──────────────────────────────────────────────
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm db:migrate
      - run: pnpm db:seed
      - run: pnpm test:e2e
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [typecheck, lint]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

### CI Pipeline Flow

```
    ┌───────────┐  ┌──────────┐  ┌────────────┐
    │ Typecheck  │  │   Lint   │  │ Unit Tests │   Phase 1 (parallel)
    └─────┬─────┘  └─────┬────┘  └──────┬─────┘
          │              │               │
          ├──────────────┤               │
          │              │               │
    ┌─────▼─────┐  ┌────▼─────┐         │
    │Integration│  │  Build   │         │         Phase 2
    └─────┬─────┘  └──────────┘         │
          │                             │
          ├─────────────────────────────┤
          │                             │
    ┌─────▼─────┐
    │ E2E Tests │                                 Phase 3
    └───────────┘
```

**Key design decisions:**
- Phase 1 runs in parallel — fast feedback on simple errors
- Integration and Build only run after type check + lint pass
- E2E is last — most expensive, only runs after everything else passes
- `concurrency` cancels in-progress runs on new pushes — saves CI minutes

## Git Hooks with Lefthook

### `lefthook.yml`

```yaml
# Install: pnpm add -D lefthook && pnpm exec lefthook install

pre-commit:
  parallel: true
  commands:
    biome-check:
      glob: "*.{ts,tsx,js,jsx,json,css,md}"
      run: pnpm exec biome check --write --staged --no-errors-on-unmatched {staged_files}
      stage_fixed: true

pre-push:
  parallel: false
  commands:
    typecheck:
      run: pnpm typecheck
    unit-tests:
      run: pnpm test:unit --reporter=dot
```

### Setup

```bash
pnpm add -D lefthook
pnpm exec lefthook install
```

Lefthook installs itself via a `prepare` script — add to root `package.json`:

```json
{
  "scripts": {
    "prepare": "lefthook install"
  }
}
```

## Developer Scripts (Root package.json)

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "test:unit": "turbo test:unit",
    "test:integration": "turbo test:integration",
    "test:e2e": "pnpm --filter web test:e2e",
    "test:watch": "turbo test:watch",
    "test:coverage": "turbo test:coverage",
    "lint": "biome lint .",
    "lint:ci": "biome ci .",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "typecheck": "turbo typecheck",
    "db:generate": "pnpm --filter @my-app/db generate",
    "db:migrate": "pnpm --filter @my-app/db migrate",
    "db:push": "pnpm --filter @my-app/db push",
    "db:studio": "pnpm --filter @my-app/db studio",
    "db:seed": "pnpm --filter @my-app/db seed",
    "clean": "turbo clean && rm -rf node_modules",
    "prepare": "lefthook install"
  }
}
```

## Docker Compose (Local Development)

### `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Optional: Redis for caching/sessions
  # redis:
  #   image: redis:7-alpine
  #   ports:
  #     - "6379:6379"

volumes:
  postgres_data:
```

### Quick start

```bash
# Start infrastructure
docker compose up -d

# Run migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed

# Start development
pnpm dev
```

## Environment Variable Management

### `.env.example` (committed to git)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp

# Auth
NEXTAUTH_SECRET=change-this-to-a-random-32-char-string
NEXTAUTH_URL=http://localhost:3000

# App
NODE_ENV=development
```

### `.gitignore` additions

```
.env
.env.local
.env.*.local
!.env.example
```

### Env validation (`packages/shared/src/env.ts`)

```typescript
import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function getEnv(): Env {
  if (!env) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      const formatted = result.error.flatten().fieldErrors;
      throw new Error(`Invalid env vars: ${JSON.stringify(formatted)}`);
    }
    env = result.data;
  }
  return env;
}
```

## Drizzle ORM Setup

### `packages/db/drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### `packages/db/package.json` (scripts)

```json
{
  "scripts": {
    "generate": "drizzle-kit generate",
    "migrate": "drizzle-kit migrate",
    "push": "drizzle-kit push",
    "studio": "drizzle-kit studio",
    "seed": "tsx src/seed.ts"
  }
}
```

## Claude Code Permissions for Development

The `.claude/settings.json` (see `04-claude-code-config.md`) allows Claude Code to run:
- All pnpm/npm/node commands
- Docker and Docker Compose
- Git operations
- File operations (read, write, edit, search)
- Biome, Vitest, Playwright
- TypeScript compiler

This means Claude Code can:
1. Start the database: `docker compose up -d`
2. Run migrations: `pnpm db:migrate`
3. Run the full test suite: `pnpm test`
4. Check types: `pnpm typecheck`
5. Fix lint issues: `pnpm lint`
6. Build the project: `pnpm build`

No permission prompts for routine development tasks.

## Branch Protection (GitHub)

Recommended settings for `main` branch:

- **Require a pull request before merging**
- **Require status checks to pass**: typecheck, lint, unit-tests, integration-tests, build
- **Require branches to be up to date before merging**
- **Do not allow bypassing the above settings**

This ensures: nothing reaches `main` that doesn't pass type check, lint, and all tests.
