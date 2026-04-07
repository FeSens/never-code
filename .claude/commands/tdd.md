Implement the requested feature using strict Test-Driven Development.

Follow this cycle for each piece of functionality:

1. **RED**: Write a failing test that describes expected behavior. Run it to confirm it fails.
2. **GREEN**: Write the minimum code to make the test pass. Run the test to confirm.
3. **REFACTOR**: Clean up while keeping tests green. Run tests again.

After all tests pass:
- Run `pnpm typecheck`
- Run `pnpm lint`
- Summarize what was implemented and tested.

Feature to implement: $ARGUMENTS
