Review experiment history and failure logs to improve harness rules.

Inspired by Stanford Meta-Harness: raw logs > summaries for diagnosing failure modes.

## Steps

1. Read `experiments.tsv` — focus on discarded and crashed entries.
2. Read any failure logs in `logs/` directory.
3. Read all CLAUDE.md files (root + packages).
4. Read `.claude/rules/` files.
5. Compare rules against actual code:
   - `git log --oneline -30` for trajectory
   - Read 2-3 source files per package
6. Identify:
   - **Stale rules**: don't match actual code
   - **Missing rules**: failure patterns suggest a rule would help
   - **Vague rules**: too abstract to be actionable
   - **Contradictions**: rules that conflict across files
7. Propose specific updates. Show the diff for each.
8. Apply updates after user approval.
9. Commit: `docs: evolve harness — <summary>`

## The Meta-Harness Principle
The biggest gains come from failure modes invisible in summaries.
Read raw logs. Trace failures to specific decisions. Add targeted rules — not generic paranoia.
