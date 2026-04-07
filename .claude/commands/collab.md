Collaborative TDD — human and agent work together.

Mode: $ARGUMENTS (default: "human-tests")

## Mode A: "human-tests" (Human writes test, agent implements)

1. Ask the human to write or describe the failing test.
2. If described in words: write the test file, show it for approval.
3. [DETERMINISTIC] Run the test — confirm it fails.
4. [AGENT] Implement the minimum code to pass.
5. [DETERMINISTIC] Run all gates (biome, typecheck, tests).
6. [AGENT] Fix failures (max 2 attempts).
7. [DETERMINISTIC] Commit with trailers.

## Mode B: "agent-tests" (Agent writes test, human reviews)

1. Ask the human to describe the desired behavior.
2. [AGENT] Write the test encoding that behavior.
3. Present the test to the human. Wait for approval or modifications.
4. [DETERMINISTIC] Run the test — confirm it fails.
5. [AGENT] Implement the minimum code to pass.
6. [DETERMINISTIC] Run all gates.
7. [DETERMINISTIC] Commit with trailers.

## Rules
- ALWAYS wait for human approval of tests before implementing.
- Follow TDD strictly — test must fail before implementation.
- All blueprint gates apply (lint, typecheck, tests, visual if UI).
