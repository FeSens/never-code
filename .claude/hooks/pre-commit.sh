#!/bin/bash
# Pre-commit quality gate: blocks git commit if pnpm check fails.
# Runs as a PreToolUse hook on Bash commands matching "git commit".

set -euo pipefail

cd "$CLAUDE_PROJECT_DIR"

OUTPUT=$(pnpm check 2>&1) || {
  echo "Quality gate failed — fix before committing:" >&2
  echo "$OUTPUT" >&2
  exit 2
}

exit 0
