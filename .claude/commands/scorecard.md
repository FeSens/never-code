Display agent performance metrics from the experiment log.

## Steps

1. Read `experiments.tsv`.
2. Calculate and display:

```
=== Agent Scorecard ===
Total experiments: <N>
├── Kept: <N> (<percentage>%)
├── Discarded: <N> (<percentage>%)
└── Crashed: <N> (<percentage>%)

Keep rate: <percentage>%
Current streak: <N> kept in a row

Features shipped: <count unique descriptions>
Avg experiments per feature: <total / features>

Last 5 experiments:
  <timestamp> <status> <description>
```

3. If keep rate < 70%: suggest running `/evolve-harness`.
4. If current streak > 10: celebrate.
