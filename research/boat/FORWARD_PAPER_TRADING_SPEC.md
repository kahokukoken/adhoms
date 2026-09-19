# BOATRACE Forward Paper-Trading Spec

Status: draft. Use only after parser Gate 0 and historical upper-bound Gate 2 pass.

## Purpose

Determine whether a historical closing-odds signal survives realistic pre-close execution.

## Snapshot schedule

For each candidate race:

```text
T-5m: collect odds and score model
T-3m: collect odds and rescore/update eligibility
T-1m: collect odds and freeze final paper decision
T+after result: collect closing odds, result, payout
```

## Decision freeze

Only bets selected before cutoff count. A closing-odds edge discovered after the result is not valid.

## Required saved fields

- race_id
- snapshot_time_type
- collected_at_utc
- local scheduled cutoff time
- bet_type
- selection
- odds_at_snapshot
- market_probability_at_snapshot
- model_probability
- model_probability_lower_bound
- edge_at_snapshot
- selected_flag
- rejection_reason
- simulated_purchase_time
- stake_yen
- closing_odds
- edge_at_closing
- payout_yen
- profit_yen

## Practical latency assumption

Minimum realistic delay for manual operation:

```text
page fetch + parse + model score + human decision + purchase = 30 to 90 seconds
```

Test scenarios:

- optimistic: 30 seconds
- base: 60 seconds
- conservative: 90 seconds

If only the optimistic case works, do not notify as usable.

## Pass condition

Notify only if:

- ROI remains positive under base latency
- max drawdown is realistic for 50,000 JPY
- edge survives from snapshot to closing
- enough bets exist for statistical meaning
- profit is not dominated by a few high-payout outliers
