# Frontend — Next.js 15 App Router

## Structure

```
src/
├── app/            App Router pages and layouts
│   ├── layout.tsx  Root layout (Server Component)
│   ├── page.tsx    Home page
│   └── globals.css Global styles
├── components/
│   ├── ui/         Primitives (Button, Input, Card)
│   └── features/   Feature-specific components
├── hooks/          Custom React hooks
├── lib/            Client utilities
└── trpc/           tRPC client setup
```

## Server Components vs Client Components

- **Server Components are the default.** Every component is a Server Component unless it has `"use client"` at the top.
- Add `"use client"` ONLY when the component needs: `useState`, `useEffect`, event handlers (`onClick`, `onChange`), browser APIs (`window`, `document`), or React context consumers.
- NEVER add `"use client"` to a layout or page unless it genuinely needs client interactivity.
- If only a small part of a page needs interactivity, extract that part into a separate Client Component and keep the page as a Server Component.

## Data Fetching

- Fetch data in Server Components using `async` functions or tRPC server caller. NOT in client-side `useEffect`.
- For mutations, use tRPC mutations via `@trpc/react-query` in Client Components.
- NEVER use `fetch()` to call your own API from a Server Component. Use the tRPC server caller or direct database access instead.

## Component Patterns

Follow the established pattern (see `src/components/ui/button.tsx`):

```tsx
// 1. Imports (type imports use `import type`)
import type { ButtonHTMLAttributes } from "react";

// 2. Props interface — named {ComponentName}Props
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

// 3. Named export function (NEVER default export for components)
export function Button({ variant = "primary", ...props }: ButtonProps) {
  return <button data-variant={variant} {...props} />;
}
```

Rules:
- ONE component per file.
- Named exports only. Default exports only for `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` (Next.js convention).
- Props interface defined above the component.
- Destructure props in the function signature.

## Styling

- Pure CSS in `globals.css`. CSS custom properties (variables) for theming.
- CSS class names use `kebab-case`.
- NO CSS-in-JS, NO Tailwind (not installed), NO CSS modules.
- Use the existing CSS variables: `--bg`, `--fg`, `--accent`, `--muted`, `--code-bg`, `--border`.

## Images and Links

- Use `next/image` for all images. NEVER use raw `<img>`.
- Use `next/link` for all internal navigation. NEVER use raw `<a>` for internal links.

## Metadata

- Export `metadata` from `page.tsx` or `layout.tsx` for SEO. Use the `Metadata` type from `next`.
- The root layout already has base metadata. Pages should add page-specific metadata.

## Testing

### Unit Tests (Vitest + Testing Library)

Location: `tests/unit/` mirroring `src/` structure.

Follow the established pattern:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });
});
```

Rules:
- Import from `vitest` explicitly (describe, it, expect). Globals are enabled but explicit imports are preferred.
- Import `render` and `screen` from `@testing-library/react`.
- Query by role first (`getByRole`), then by text (`getByText`), then by label (`getByLabel`). NEVER query by CSS class or test ID unless no semantic alternative exists.
- Test behavior, not implementation. Don't assert on internal state or DOM structure.
- One `describe` block per component/page. Nested `describe` for sub-behaviors.

### E2E Tests (Playwright)

Location: `tests/e2e/` — `*.spec.ts` files.

Rules:
- Use `getByRole`, `getByLabel`, `getByText` locators. NEVER use CSS selectors.
- ALWAYS set `PLAYWRIGHT_HTML_OPEN=never` when running tests.
- Run specific tests: `PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/e2e/<file> --reporter=line`
- E2E tests hit the REAL backend + database. No mocks.

## Common Mistakes to Avoid

- NEVER import from `@never-code/api` internals. Only import the `AppRouter` type via `@never-code/api/trpc`.
- NEVER use `useEffect` for data fetching. Use Server Components or tRPC hooks.
- NEVER add `"use client"` to `layout.tsx` — it breaks streaming and layouts must be Server Components.
- NEVER hardcode colors. Use CSS variables from `globals.css`.
- NEVER use `dangerouslySetInnerHTML` unless sanitizing HTML first.
