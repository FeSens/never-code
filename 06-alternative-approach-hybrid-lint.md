# Alternative: Hybrid Biome + ESLint Setup

> For teams that want Biome's speed for formatting but need ESLint's type-aware rules.

The guides in `03-linting-formatting.md` recommend **Biome-only**. This alternative adds ESLint for type-aware lint rules that Biome cannot yet replicate.

## When to Use This

Use the hybrid approach if you need these rules (Biome cannot do them yet):

| Rule | What it catches |
|------|----------------|
| `@typescript-eslint/no-floating-promises` | Unhandled promises (silent failures) |
| `@typescript-eslint/no-misused-promises` | Passing async functions where sync expected |
| `@typescript-eslint/await-thenable` | `await` on non-Promise values |
| `@typescript-eslint/no-unnecessary-condition` | Conditions that are always true/false |
| `@typescript-eslint/strict-boolean-expressions` | Truthy checks on non-boolean types |

These are real-bug-catchers. If your project has async code (it does), consider this setup.

## The Split

- **Biome**: formatting, import sorting, basic lint rules (fast, runs on every save)
- **ESLint**: type-aware rules only (slower, runs pre-commit and CI)

## Configuration

### `biome.json` — formatting only

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": false
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingCommas": "all",
      "semicolons": "always",
      "arrowParentheses": "always"
    }
  },
  "files": {
    "ignore": ["node_modules", "dist", ".next", "coverage"]
  }
}
```

### `eslint.config.js` — type-aware linting only

```js
// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".next/**",
      "coverage/**",
      "*.config.js",
      "*.config.ts",
    ],
  },

  eslint.configs.recommended,

  // The good stuff — type-aware rules Biome can't do
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Custom overrides
  {
    rules: {
      // Type safety (the reason ESLint exists in this setup)
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/strict-boolean-expressions": "warn",

      // Practical relaxations
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
      "@typescript-eslint/no-confusing-void-expression": "off",
    },
  },

  // React-specific
  {
    files: ["apps/web/**/*.{ts,tsx}", "packages/ui/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "jsx-a11y/alt-text": "error",
    },
  },

  // Test files — relax strict rules
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
```

### Updated `lefthook.yml`

```yaml
pre-commit:
  parallel: true
  commands:
    biome-format:
      glob: "*.{ts,tsx,js,jsx,json,css,md}"
      run: pnpm exec biome check --write --staged --no-errors-on-unmatched {staged_files}
      stage_fixed: true
    eslint:
      glob: "*.{ts,tsx}"
      run: pnpm exec eslint --fix {staged_files}
      stage_fixed: true

pre-push:
  parallel: false
  commands:
    typecheck:
      run: pnpm typecheck
    unit-tests:
      run: pnpm test:unit --reporter=dot
```

### Updated `package.json` scripts

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "check": "biome check . && eslint . --max-warnings 0 && tsc --noEmit",
    "check:fix": "biome check --write . && eslint . --fix"
  }
}
```

### Updated Claude Code hook

In `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "biome check --write --no-errors-on-unmatched $CLAUDE_FILE_PATHS 2>/dev/null; eslint --fix $CLAUDE_FILE_PATHS 2>/dev/null; exit 0"
      }
    ]
  }
}
```

### Updated CI job

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
    - run: pnpm exec eslint . --max-warnings 0
```

## Trade-offs

| | Biome-only (guide 03) | Hybrid (this guide) |
|---|---|---|
| Speed | Blazing fast | Biome fast, ESLint adds ~3-5s |
| Config files | 1 (`biome.json`) | 2 (`biome.json` + `eslint.config.js`) |
| Dependencies | 1 (`@biomejs/biome`) | ~5 (eslint, typescript-eslint, plugins) |
| Type-aware rules | None | Full suite |
| Bug-catching power | Good | Excellent |
| Maintenance | Minimal | Some plugin updates |

## Recommendation

- **Small projects, solo devs, fast iteration**: Biome-only (guide 03)
- **Production apps, teams, lots of async code**: Hybrid (this guide)

The type-aware rules catch real bugs that no other tool can find. The 3-5 second overhead on pre-commit is worth it for production applications.
