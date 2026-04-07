# Frontend — Next.js App Router

## Structure
- Pages in `src/app/` using App Router conventions
- Components in `src/components/` — one component per file
- Hooks in `src/hooks/`
- tRPC client in `src/trpc/`

## Rules
- Server Components by default. Only `"use client"` when needed.
- Fetch data in Server Components, not client-side.
- `next/image` for images, `next/link` for navigation.
- Tailwind CSS for styling. No CSS modules.
- Test with Vitest + Testing Library. Test behavior, not implementation.
