# Shared Package — Types, Validators, Utilities

## Structure

```
src/
├── index.ts          Barrel export (re-exports everything)
├── types/
│   └── index.ts      TypeScript interfaces and types
├── validators/
│   └── index.ts      Zod schemas + inferred types
└── utils/
    └── index.ts      Pure utility functions
```

## Rules

### Zero Runtime Dependencies (except Zod)

This package MUST have no runtime dependencies other than `zod`. It is imported by both frontend and backend — heavy dependencies here bloat both bundles.

- NEVER add `lodash`, `date-fns`, or any utility library. Write the function yourself.
- NEVER import from `@never-code/db`, `@never-code/api`, or `@never-code/web`. This package is at the bottom of the dependency graph.

### Types

Define interfaces for domain entities in `src/types/index.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Rules:
- Use `interface` for object shapes (extendable).
- Use `type` for unions, intersections, and mapped types.
- All types must be serializable (no functions, classes, or symbols).
- Export every type. If it's not exported, it doesn't belong here.

### Validators

Zod schemas live in `src/validators/index.ts`. Every schema has a companion inferred type:

```typescript
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

Rules:
- ALWAYS export both the schema AND the inferred type.
- Name schemas as `{action}{Entity}Schema` (e.g., `createUserSchema`, `updatePostSchema`).
- Name inferred types as `{Action}{Entity}Input` (e.g., `CreateUserInput`).
- Include human-readable error messages in validators (`.email("Invalid email")`).
- Use `.partial()` for update schemas: `export const updateUserSchema = createUserSchema.partial()`.
- Pagination schema is shared: `paginationSchema` with `page` and `pageSize` fields.

### Utilities

Pure functions in `src/utils/index.ts`:

```typescript
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}
```

Rules:
- Every function must be pure (no side effects, no mutations).
- Every function must have explicit return types.
- NEVER use `any`. Use `unknown` and narrow.
- Keep utilities small and focused. If a function grows beyond ~20 lines, it may belong in a service.

### Exports

The package uses `exports` in `package.json` for subpath imports:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./validators": "./src/validators/index.ts",
    "./types": "./src/types/index.ts"
  }
}
```

Consumers import via:
```typescript
import { createUserSchema } from "@never-code/shared/validators";
import type { User } from "@never-code/shared/types";
import { formatDate } from "@never-code/shared";
```

Rules:
- When adding a new subpath, update BOTH `exports` in `package.json` AND the barrel `src/index.ts`.
- Use subpath imports (`@never-code/shared/validators`) for clarity. Avoid importing everything from the root.

## Testing

- Test validators with edge cases: empty strings, null, boundary values, invalid formats.
- Test utilities with pure input/output assertions.
- Tests go in a `tests/` directory if added. Currently uses `--passWithNoTests`.
