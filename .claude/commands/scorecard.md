Display agent performance metrics from the experiment log.

## Steps

1. Read `experiments.tsv`.
2. Calculate and display:

```
=== Agent Scorecard ===
Total experiments: <N>
├── Kept: <N> (<percent>%)
├── Discarded: <N> (<percent>%)
└── Crashed: <N> (<percent>%)

Keep rate: <percent>%
Current streak: <N> kept in a row

Features shipped: <unique descriptions>
Avg experiments per feature: <total / features>
```

3. If keep rate < 70%: suggest `/evolve-harness`.
4. If streak > 10: celebrate.
