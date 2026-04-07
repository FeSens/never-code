# Backend — Hono + tRPC API

## Structure
- Routes in `src/routes/` — one file per resource
- tRPC routers in `src/trpc/routers/` — one per domain
- Services in `src/services/` — business logic
- Middleware in `src/middleware/`

## Rules
- Validate all inputs with Zod schemas from `@never-code/shared`.
- Services receive dependencies via constructor args (testable).
- Database queries through Drizzle only.
- Unit test services, integration test routes with real DB.
