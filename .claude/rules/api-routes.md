---
paths:
  - "apps/api/src/**"
---

# API Rules

- tRPC routers are THIN. Validate input → call service → return result. Business logic lives in `src/services/`.
- ALWAYS validate inputs with Zod schemas from `@never-code/shared/validators`. NEVER inline schemas that could be shared.
- Use `TRPCError` with proper codes (`NOT_FOUND`, `BAD_REQUEST`, `UNAUTHORIZED`) instead of generic `Error`.
- Services receive dependencies via constructor (DI). NEVER import database client directly in routers.
- Services return `null` for not-found. Routers throw `TRPCError` for HTTP error responses.
- Use `.query()` for reads, `.mutation()` for writes. NEVER use mutation for reads.
- Context uses `type` not `interface` (required by @hono/trpc-server index signature).
- NEVER let raw database errors reach clients. Catch and translate in services.
