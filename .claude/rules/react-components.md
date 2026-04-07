---
paths:
  - "apps/web/src/components/**"
  - "apps/web/src/app/**/*.tsx"
---

# React Component Rules

- Server Components are the DEFAULT. Only add `"use client"` when the component needs hooks, event handlers, or browser APIs.
- NEVER add `"use client"` to layout.tsx — layouts must be Server Components.
- ONE component per file. Named export (not default) for components. Default export only for page.tsx/layout.tsx.
- Props interface defined above the component, named `{ComponentName}Props`.
- Use `next/image` for images, `next/link` for internal links. NEVER use raw `<img>` or `<a>`.
- Styling: CSS classes from `globals.css` with CSS custom properties. NO CSS-in-JS, NO Tailwind, NO CSS modules.
- NEVER use `useEffect` for data fetching. Fetch in Server Components or use tRPC hooks.
- NEVER use `React.FC`. Use plain function declarations: `export function Button(props: ButtonProps)`.
- NEVER import from `next/router`. Use `next/navigation` (App Router).
