# BOATRACE Backtest Gate Checklist

This checklist prevents accidental profit claims from early parser or closing-odds artifacts.

## Gate 0: parser smoke test

Required before any ROI interpretation:

- [ ] all 12 races fetched for target venue-day
- [ ] six entrants parsed for each normal race
- [ ] before-info rows parsed for each lane when available
- [ ] result finish order parsed for completed races
- [ ] payout rows parsed for completed races
- [ ] odds rows parsed and manually spot-checked against official page
- [ ] raw HTML fixture saved for reproducibility
- [ ] parser warnings reported, not silently ignored

## Gate 1: non-ADHOMS baselines

Run first:

- [ ] market favorite baseline
- [ ] inner-course baseline
- [ ] entry-stat baseline
- [ ] before-info baseline

ADHOMS model work is useful only if it beats these under the same data cut.

## Gate 2: historical closing-odds upper bound

Allowed claim if positive:

> A historical closing-odds signal exists and deserves execution testing.

Not allowed:

> This could have been bought profitably.

## Gate 3: forward paper trading

Required snapshots:

- [ ] T-5 minutes
- [ ] T-3 minutes
- [ ] T-1 minute
- [ ] final closing odds

Required evidence:

- [ ] positive ROI survives pre-close odds
- [ ] late odds movement does not erase the edge
- [ ] drawdown is realistic for 50,000 JPY
- [ ] result is not dominated by one venue/month/tiny set of high-payout hits

## Gate 4: bankroll simulation

Report:

- [ ] ending bankroll
- [ ] ROI
- [ ] max drawdown
- [ ] longest losing streak
- [ ] ruin flag / bootstrap ruin estimate
- [ ] venue/month/bet-type contribution

## Current status

As of this checklist: Gate 0 is in progress. No betting recommendation exists.
