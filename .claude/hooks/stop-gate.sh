#!/bin/bash
# Stop quality gate: blocks Claude from stopping if source files changed but pnpm check fails.
# Runs as a Stop hook — only triggers when .ts/.tsx files have been modified.

set -euo pipefail

cd "$CLAUDE_PROJECT_DIR"

# Check for modified source files (staged, unstaged, or untracked)
CHANGED=$(
  git diff --name-only 2>/dev/null
  git diff --cached --name-only 2>/dev/null
  git ls-files --others --exclude-standard 2>/dev/null
)

if ! echo "$CHANGED" | grep -qE '\.(ts|tsx)$'; then
  exit 0  # No source changes — skip quality gate
fi

OUTPUT=$(pnpm check 2>&1) || {
  echo "Cannot finish: quality gates failing. Fix before completing:" >&2
  echo "$OUTPUT" | tail -30 >&2
  exit 2
}

exit 0
