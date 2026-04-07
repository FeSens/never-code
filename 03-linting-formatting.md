# Linting & Formatting as First-Class Citizens

> Opinionated setup using Biome + Lefthook for a TypeScript fullstack monorepo.

## Why Biome over ESLint + Prettier

| | ESLint + Prettier | Biome |
|---|---|---|
| Speed | Slow (~5s on medium project) | **10-100x faster** (Rust-based) |
| Config files | 2+ files, plugin hell | **1 file** |
| Formatting | Separate tool (Prettier) | **Built-in** |
| Import sorting | Plugin needed | **Built-in** |
| TypeScript | Plugin needed | **Native** |
| Maintenance | Dependency updates, plugin compat | **Single dependency** |

**The verdict:** Biome is the clear winner for new projects. It handles linting, formatting, and import sorting in one tool, with one config file, at 10-100x the speed of ESLint + Prettier.

## Biome Configuration

### `biome.json` (root)

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noBannedTypes": "error",
        "noExtraBooleanCast": "error",
        "noUselessTypeConstraint": "error",
        "useOptionalChain": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error",
        "useExhaustiveDependencies": "warn",
        "useHookAtTopLevel": "error"
      },
      "performance": {
        "noAccumulatingSpread": "error",
        "noDelete": "warn"
      },
      "style": {
        "noNonNullAssertion": "warn",
        "useConst": "error",
        "useImportType": "error",
        "useBlockStatements": "off",
        "noUnusedTemplateLiteral": "error"
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noConsoleLog": "warn",
        "noDebugger": "error",
        "noDoubleEquals": "error"
      },
      "nursery": {
        "useSortedClasses": "warn"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingCommas": "all",
      "semicolons": "always",
      "arrowParentheses": "always"
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  },
  "overrides": [
    {
      "include": ["*.test.ts", "*.test.tsx", "*.spec.ts"],
      "linter": {
        "rules": {
          "suspicious": {
            "noExplicitAny": "off"
          }
        }
      }
    },
    {
      "include": ["*.config.ts", "*.config.js"],
      "linter": {
        "rules": {
          "style": {
            "noDefaultExport": "off"
          }
        }
      }
    }
  ],
  "files": {
    "ignore": [
      "node_modules",
      "dist",
      ".next",
      "coverage",
      "playwright-report",
      "*.gen.ts",
      "drizzle/migrations"
    ]
  }
}
```

### Key Rules Explained

| Rule | Setting | Why |
|------|---------|-----|
| `noExplicitAny` | error | Forces proper typing; `unknown` is always better |
| `noUnusedImports` | error | Clean code, smaller bundles |
| `noUnusedVariables` | error | Dead code is confusing code |
| `useImportType` | error | `import type {}` for types — critical for bundlers |
| `noConsoleLog` | warn | Use a logger in production; `console.log` for debugging only |
| `noNonNullAssertion` | warn | `!` operator hides potential bugs; prefer proper null checks |
| `noDoubleEquals` | error | Always use `===` |

## Editor Configuration

### `.editorconfig`

```ini
root = true

[*]
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
charset = utf-8

[*.{ts,tsx,js,jsx,json,yml,yaml,md}]
indent_style = space
indent_size = 2

[Makefile]
indent_style = tab
```

### `.vscode/settings.json`

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### `.vscode/extensions.json`

```json
{
  "recommendations": [
    "biomejs.biome"
  ],
  "unwantedRecommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

## Git Hooks with Lefthook

### Why Lefthook over Husky

| | Husky + lint-staged | Lefthook |
|---|---|---|
| Config | 2 tools, 2 configs | **1 tool, 1 config** |
| Speed | Spawns Node process | **Native Go binary** |
| Parallel | Not built-in | **Built-in parallel** |
| Staged files | Via lint-staged | **Built-in `{staged_files}`** |
| Install | `npx husky install` | **`pnpm exec lefthook install`** |

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

**What happens:**
1. **Pre-commit**: Biome auto-fixes formatting + lint issues on staged files, then re-stages them. This means every commit is clean.
2. **Pre-push**: Type check + unit tests must pass before code reaches the remote. This catches issues before CI.

## CI Enforcement

In your GitHub Actions CI (see `05-cicd.md`):

```yaml
lint:
  name: Lint & Format
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v4
      with:
        node-version: "22"
        cache: pnpm
    - run: pnpm install --frozen-lockfile
    - run: pnpm exec biome ci .
```

`biome ci` is the CI-specific command — it checks everything and exits with a non-zero code on any issue. No auto-fixing.

## Claude Code Integration

See `04-claude-code-config.md` for the full setup. The key parts:

### PostToolUse Hook (auto-format on every file change)

In `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "biome check --write --no-errors-on-unmatched $CLAUDE_FILE_PATHS"
      }
    ]
  }
}
```

This means: every time Claude Code writes or edits a file, Biome automatically formats and fixes it. Claude never produces code that violates lint rules.

## Quick Reference: Scripts

```bash
# Format everything
pnpm format

# Check formatting (CI-safe, no writes)
pnpm format:check

# Lint everything
pnpm lint

# Lint + format check for CI
pnpm lint:ci   # runs: biome ci .

# Fix all auto-fixable issues
pnpm exec biome check --write .
```

## Migration from ESLint + Prettier

If you have an existing project:

```bash
# Biome can migrate your ESLint config
pnpm exec biome migrate eslint --write

# Biome can migrate your Prettier config
pnpm exec biome migrate prettier --write

# Then remove old deps
pnpm remove eslint prettier eslint-config-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```
