# BOATRACE Model Roadmap

Status: roadmap only. No profit claim.

## Phase 0: Parser and baseline

Goal: prove the data pipeline is deterministic.

1. Fetch official public pages.
2. Normalize race, entrant, before-info, odds, result, payout rows.
3. Run non-ADHOMS baselines:
   - market favorite
   - inner-course candidates
   - simple entry-stat model
   - simple before-info model

Exit condition: parser passes Gate 0 and baseline summaries are reproducible.

## Phase 1: Closing-odds upper-bound model

Goal: determine whether any signal exists even under the easiest historical condition.

Candidate features:

- lane/course
- racer grade
- national/local win and 2/3 rates
- average ST
- F/L count
- motor 2/3 rate
- boat 2/3 rate
- exhibition time
- tilt
- start exhibition course/ST
- wind speed
- wave height
- temperature/water temperature
- market implied probability

Candidate models:

- calibrated logistic regression / multinomial baseline
- gradient-boosted trees if data volume is enough
- ADHOMS state-transition features only after baselines are stable

Exit condition: positive ROI survives fixed out-of-sample using closing odds, with enough sample size and no single venue/month dependency.

## Phase 2: Forward paper-trading odds capture

Goal: prove the signal survives executable prices.

Required snapshots:

- T-5m
- T-3m
- T-1m
- closing

Core measurement:

```text
edge_retention = edge_at_closing / edge_at_snapshot
```

If edge collapses near cutoff, do not proceed.

## Phase 3: Bankroll and risk

Goal: determine whether 50,000 JPY is a realistic bankroll.

Compare:

- flat 100 JPY
- flat 0.25% bankroll
- flat 0.5% bankroll
- quarter Kelly with hard caps
- half Kelly with hard caps

Report:

- ending bankroll
- ROI
- max drawdown
- longest losing streak
- ruin probability
- venue/month/bet-type contribution

## Phase 4: ADHOMS-specific state model

Only after baseline gates pass, add state-transition features:

- racer recent-state changes
- local-water adaptation
- motor adaptation over series days
- fatigue / travel proxy
- pressure proxy by grade/race class
- public-market overreaction proxy

ADHOMS features must improve executable out-of-sample ROI, not merely hit rate.
