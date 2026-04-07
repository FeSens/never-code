Collaborative TDD — human and agent pair programming.

Mode: $ARGUMENTS (default: "human-tests")

## Mode A: "human-tests" — Human writes test, agent implements

1. Ask the human to write or describe the failing test.
2. If described: write the test, show for approval.
3. [DETERMINISTIC] Run test — confirm it fails.
4. [AGENT] Implement minimum code to pass.
5. [DETERMINISTIC] All gates (biome, typecheck, tests).
6. [AGENT] Fix failures (max 2 attempts).
7. [DETERMINISTIC] Commit with trailers.

## Mode B: "agent-tests" — Agent writes test, human reviews

1. Ask the human to describe the desired behavior.
2. [AGENT] Write the test encoding that behavior.
3. Present test for approval. Wait for response.
4. [DETERMINISTIC] Run test — confirm it fails.
5. [AGENT] Implement minimum code to pass.
6. [DETERMINISTIC] All gates.
7. [DETERMINISTIC] Commit with trailers.

## Rules
- ALWAYS wait for human approval of tests before implementing.
- Test must fail before implementation starts.
- All blueprint gates apply.
