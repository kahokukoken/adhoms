# BOATRACE Execution Boundary

The ADHOMS BOATRACE track separates four concepts:

1. Prediction accuracy
2. Closing-odds historical expected value
3. Pre-close executable expected value
4. Real-money operational feasibility

Only the fourth supports real-money decisions.

## Why closing odds are not enough

BOATRACE is pari-mutuel. Odds can move near cutoff as late money enters the pool. A historical page that shows closing odds cannot prove that the same price was available when a user could still place a bet.

Therefore:

```text
closing-odds ROI > 0
```

means only:

```text
continue to forward paper-trading
```

It does not mean:

```text
start betting
```

## Forward paper-trading minimum

For each candidate race:

- collect odds at T-5m
- collect odds at T-3m
- collect odds at T-1m
- collect final closing odds
- record whether the model selected the bet before the cutoff
- settle only bets selected before cutoff

## Human execution assumption

The test must include practical latency:

- page retrieval delay
- model scoring delay
- decision delay
- manual purchase delay
- 100 JPY stake rounding

If the signal requires instant execution at the final second, it is not considered realistic for this project.
