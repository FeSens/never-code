---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript Rules

- Use `import type` for type-only imports. Enforced by Biome `useImportType`.
- NEVER use `any`. Use `unknown` and narrow with type guards or Zod parsing.
- Use `interface` for object shapes, `type` for unions/intersections/mapped types.
- Prefer explicit return types on exported functions.
- Use nullish coalescing (`??`) over logical OR (`||`) for defaults.
- Local imports in `apps/api` use `.js` extensions (ESM requirement). `apps/web` does not (Next.js handles resolution).
- Path alias `@/*` maps to `./src/*` in each app/package.
