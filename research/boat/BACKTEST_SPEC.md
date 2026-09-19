# Boat Race Backtest Specification

Status: draft locked enough for parser/prototype work.

## Core principle

The model is judged by executable expected value, not by hit-rate aesthetics.

For each bet candidate:

```text
expected_return = p_model * decimal_odds
edge = expected_return - 1
```

A bet is eligible only when the model probability is calibrated and the edge clears a fixed threshold.

## Market probability handling

Boat race odds are pari-mutuel. The market probability derived from odds is noisy because of takeout, rounding, zero/blank odds, late money, and pool size.

Initial usage:

1. Use odds-implied probability as a feature and benchmark, not as truth.
2. Normalize within each bet pool when comparing relative market preference.
3. Treat `0.0` odds as unavailable or insufficient-pool, never as infinite edge.
4. Exclude returned/cancelled boats and races with abnormal payout conditions until a dedicated return-handling parser exists.

## Baselines

Run these before any ADHOMS-specific model:

1. Market-only baseline: top-n favorite by pool.
2. Inner-course baseline: systematic 1-course centered combinations.
3. Entry-stat baseline: racer grade, national win rate, local win rate, average start timing, motor 2/3 rate, boat 2/3 rate.
4. Before-info baseline: exhibition time, tilt, start exhibition, wind, wave, temperature.
5. Combined non-ADHOMS baseline.

ADHOMS features must beat these, not merely appear accurate.

## Candidate bet types

Initial order:

1. 2-ren-tan
2. 2-ren-puku
3. 3-ren-tan
4. 3-ren-puku
5. win/place only as low-liquidity diagnostic, not main target

Reason: win/place pages often contain zero odds or low-information values; 3-ren-tan has high variance; 2-ren pools are a cleaner first edge detector.

## Training design

Minimum anti-leak rules:

- No result-page fields in pre-race features except when evaluating after the race.
- No final weather after result if before-race weather snapshot differs; prefer `beforeinfo` weather for model input.
- Closing odds are allowed only for the historical upper-bound test.
- Live/paper execution must use pre-close snapshots captured before cutoff.
- Parameters fixed before each out-of-sample block.

Suggested walk-forward shape:

```text
train: rolling 180 days
validation: following 30 days
fixed test: final 90 days or a held-out venue/period block
```

## Selection rule

A bet candidate is selected only if all hold:

```text
edge >= fixed_edge_threshold
p_model_calibrated_lower_bound > market_implied_probability
odds_available == true
race_not_abnormal == true
stake_after_rounding >= 100 JPY
race_exposure <= race_cap
venue_day_exposure <= day_cap
```

Initial thresholds to compare:

- edge >= 3%
- edge >= 5%
- edge >= 8%
- edge >= 12%

No threshold may be chosen after seeing the test result. Thresholds must be evaluated as a grid with full reporting.

## Bankroll rules

Starting bankroll: 50,000 JPY.

Minimum ticket unit: 100 JPY.

Compare:

1. Flat 100 JPY per selected bet.
2. Flat 0.25% bankroll per selected bet, rounded down to 100 JPY.
3. Flat 0.5% bankroll per selected bet, rounded down to 100 JPY.
4. Quarter Kelly with 1% race cap.
5. Half Kelly with 1% race cap.

Kelly formula for decimal odds:

```text
b = decimal_odds - 1
q = 1 - p_model
kelly_fraction = (b * p_model - q) / b
```

If `kelly_fraction <= 0`, no bet.

## Required metrics

Report every run with:

- number of races evaluated
- number of bets selected
- stake total
- return total
- ROI
- hit rate
- average odds
- median odds
- closing-edge retention or CLV-like metric
- max drawdown
- longest losing streak
- ending bankroll
- ruin flag and estimated ruin probability via bootstrap
- venue contribution table
- bet-type contribution table
- month contribution table

## Failure conditions

Stop or downgrade the claim if:

- Profit disappears with pre-close odds.
- One venue or month contributes most profit.
- High ROI comes from fewer than 20 outsized hits.
- Drawdown exceeds a level that makes a 50,000 JPY bankroll unrealistic.
- Model calibration deteriorates out of sample.
- Performance depends on excluding losing periods after inspection.

## First executable experiment

Use a one-day parser smoke test:

```text
hd=20260918
jcd=23
rno=1..12
```

Then expand to all venues available on a chosen day, and only after parser stability is proven move to multi-month collection.
