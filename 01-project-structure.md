# TypeScript Fullstack Project Structure

> Opinionated guide for a monorepo TypeScript fullstack app optimized for Claude Code.

## The Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Package manager | **pnpm** | Fast, disk-efficient, strict dependency isolation |
| Monorepo | **pnpm workspaces + Turborepo** | Zero-config workspaces, Turbo for task orchestration and caching |
| Frontend | **Next.js 15 (App Router)** | RSC, API routes, best ecosystem, great DX |
| Backend | **Hono** | Lightweight, edge-first, type-safe, works everywhere |
| API contract | **tRPC** | End-to-end type safety, no codegen, instant refactors |
| ORM | **Drizzle** | Type-safe, SQL-first, fast migrations |
| Database | **PostgreSQL** | Battle-tested, rich feature set |
| Runtime | **Node 22** | LTS, native TypeScript support improving |

## Folder Structure

```
my-app/
├── .claude/                    # Claude Code configuration
│   ├── commands/               # Custom slash commands
│   └── settings.json           # Project-level settings
├── .github/
│   └── workflows/
│       └── ci.yml
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # UI components
│   │   │   ├── hooks/          # React hooks
│   │   │   ├── lib/            # Client utilities
│   │   │   └── trpc/           # tRPC client setup
│   │   ├── tests/
│   │   │   └── e2e/            # Playwright E2E tests
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   └── CLAUDE.md           # Frontend-specific rules
│   └── api/                    # Hono backend
│       ├── src/
│       │   ├── routes/         # API route handlers
│       │   ├── services/       # Business logic
│       │   ├── middleware/     # Auth, logging, etc.
│       │   └── index.ts
│       ├── tests/
│       │   ├── unit/
│       │   └── integration/
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       └── CLAUDE.md           # Backend-specific rules
├── packages/
│   ├── db/                     # Drizzle schema + migrations
│   │   ├── src/
│   │   │   ├── schema/         # Table definitions
│   │   │   ├── migrations/     # Generated migrations
│   │   │   └── index.ts        # Drizzle client export
│   │   ├── drizzle.config.ts
│   │   └── tsconfig.json
│   ├── shared/                 # Shared types, utils, validators
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── validators/     # Zod schemas (shared FE/BE)
│   │   │   └── utils/
│   │   └── tsconfig.json
│   └── ui/                     # Shared UI component library (optional)
│       ├── src/
│       └── tsconfig.json
├── tooling/                    # Shared configs
│   ├── typescript/
│   │   └── base.json           # Base tsconfig
│   ├── vitest/
│   │   └── base.config.ts      # Base vitest config
│   └── biome/
│       └── biome.json          # Shared Biome config
├── CLAUDE.md                   # Root-level Claude Code rules
├── biome.json                  # Root Biome config (extends tooling/)
├── docker-compose.yml
├── lefthook.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json               # Root tsconfig with references
```

## Root Configuration Files

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

### `package.json` (root)

```json
{
  "name": "my-app",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "test:unit": "turbo test:unit",
    "test:integration": "turbo test:integration",
    "test:e2e": "turbo test:e2e",
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
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "lefthook": "^1.7.0",
    "turbo": "^2.3.0",
    "typescript": "^5.7.0"
  },
  "engines": {
    "node": ">=22",
    "pnpm": ">=9"
  },
  "packageManager": "pnpm@9.15.0"
}
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "test:unit": {
      "cache": true
    },
    "test:integration": {
      "dependsOn": ["^build"],
      "cache": false
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "cache": false
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

## TypeScript Configuration

### `tooling/typescript/base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "incremental": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist", ".next", "coverage"]
}
```

Key settings explained:
- `strict: true` — non-negotiable. Catches entire classes of bugs.
- `noUncheckedIndexedAccess: true` — forces you to handle `undefined` from array/object access.
- `verbatimModuleSyntax: true` — enforces explicit `type` imports, critical for bundlers.
- `moduleResolution: "bundler"` — modern resolution that works with all modern bundlers.

### `apps/web/tsconfig.json`

```json
{
  "extends": "../../tooling/typescript/base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "next-env.d.ts", "*.ts", "*.tsx"],
  "exclude": ["node_modules"]
}
```

### `apps/api/tsconfig.json`

```json
{
  "extends": "../../tooling/typescript/base.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "tests", "*.ts"]
}
```

## Environment Variables

### `packages/shared/src/env.ts`

```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return result.data;
}
```

### `.env.example`

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp
NEXTAUTH_SECRET=your-secret-here-at-least-32-characters-long
NEXTAUTH_URL=http://localhost:3000
```

## Docker Compose (Local Dev)

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

volumes:
  postgres_data:
```

## Why These Choices for Claude Code

1. **pnpm workspaces** — Claude Code can navigate the monorepo with `@my-app/shared` imports that are self-documenting
2. **Turborepo** — Claude Code can run `pnpm test` and Turbo handles the dependency graph; cache means re-runs are instant
3. **tRPC** — When Claude modifies an API endpoint, the frontend breaks at compile time, not runtime. Claude catches issues immediately with `pnpm typecheck`
4. **Drizzle** — Schema-as-code means Claude can read and modify the schema without context-switching to SQL files
5. **Biome** — Single tool for lint + format; Claude Code hooks can auto-fix on every file write
6. **Directory-level CLAUDE.md** — Different rules for frontend vs backend vs shared code, so Claude gets the right context automatically
