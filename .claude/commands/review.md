Review changes made in this session.

1. Run `git diff` to see all changes.
2. For each changed file, check:
   - Follows CLAUDE.md conventions?
   - Has tests for new/changed code?
   - Type safety issues (any, non-null assertions)?
   - Security concerns (injection, auth bypasses)?
   - Error handling appropriate?
3. Run `pnpm typecheck` — report errors.
4. Run `pnpm test:unit` — report failures.
5. Run `pnpm lint` — report issues.
6. Provide summary: **Issues** | **Suggestions** | **Good**.
