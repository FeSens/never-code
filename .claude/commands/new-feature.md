Plan and implement a new feature using TDD.

1. **Clarify**: Ask what the feature should do. Ask follow-ups until requirements are clear.
2. **Plan**: Outline implementation:
   - Files to change/create
   - Tests to write
   - Order of operations
3. **Implement with TDD**:
   - Write tests first
   - Implement minimum code to pass
   - Refactor for quality
4. **Verify**:
   - `pnpm typecheck` passes
   - `pnpm test:unit` passes
   - `pnpm lint` passes
   - If API changes: `pnpm test:integration`
5. **Summarize**: List all changes and tests added.
