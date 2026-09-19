# BOAT RACE source audit — 2026-09-19

## Observed primary/provider sources

1. BOAT RACE official downloads
   https://www.boatrace.jp/owpc/pc/extra/data/download.html
   Links nationwide daily program B and result K archives. This supplies a
   results/program baseline, not historical pre-close odds snapshots.
   Annual job requested: 2025-09-01 through 2026-08-31.

2. Official national/local rating definition
   https://www.boatrace.jp/owsp/sp/extra/enjoy/guide/level2/l2_01_01_05.html
   National win-rate is an average placing-score rating, NOT the probability of
   first place. baseline.py deliberately calls it national_rating.

3. Official F/L refund explanation
   https://www.boatrace.jp/owsp/sp/extra/enjoy/guide/level1/l1_01_01_05.html
   Tickets involving non-starting boats are refunded. Refunded tickets must not
   be counted as zero-payout losses. A disqualification after starting is distinct.

4. Turnmark API provider documentation
   https://github.com/turnmark/api/blob/gh-pages/README.md
   https://github.com/turnmark/api/blob/gh-pages/docs/v1/schema.md
   README read at blob 2be54c61446da88ff29363f0d9f3811efd8c00d5.
   Provider says coverage starts 2026-01-01, unofficial, possible missing/errors.
   Schema offers program, preview, odds and results. Odds basic fields list
   date/stadium_number/race_number; they do not establish an observed_at timestamp
   or historical before-deadline snapshot series. Therefore do NOT load these odds
   into decision-time features as though time provenance were demonstrated.
   This is a schema audit, not a proof that the provider has no other data/history.

5. Other odds candidates (not validated for this project)
   https://github.com/lamrongol/BoatraceOdds/blob/gh-pages/README.md
   Provider says roughly 30-minute updates, unofficial, accuracy/completeness not
   guaranteed. A file's current content or a retrospectively rebuilt daily JSON is
   not proof of what a human could see at a historical decision timestamp.
   https://boatracedata.com/race/2026-07-13/23/3
   Search-visible page displays one-minute-before to final odds for some winning
   combinations. Coverage, all losing combinations, observation timestamps and
   stable archive availability have not been established. Winning-only hindsight
   examples cannot support a betting strategy backtest.

## Mathematical safeguards

Official payout amounts are already net of takeout. Positive net ROI does NOT
require subtracting another 25% from those payouts. Conversely, p_model greater
than normalized inverse-odds market probability does not by itself imply positive
expected return: require p_model * conservative_final_decimal_payout > 1 plus
execution/cost margin. Unit tests check settlement without double takeout.

Displayed pari-mutuel odds are not contractually locked at simulated purchase.
Earlier/final price ratios are slippage measurements, not equivalent to bookmaker
closing-line value. No price-edge claim is permitted without timestamped quotes.

## Completion gates (all still required after a baseline run)

- Check official result samples and systematic payout/finishing-order consistency.
- Preserve B-only/K-only races and quantify missingness, refunds and abnormal races.
- Verify model input publication/observation times; separate B inputs from K labels.
- Train with strictly older data; calibrate probabilities before outcome-based tuning.
- Pre-register strategy/thresholds and hold-out periods; correct for repeated searches.
- Replay notification delay, price movement, order rounding, reserved funds and limits.
- Estimate uncertainty with dependence-aware resampling and a separately specified
  operational stop/ruin definition; never infer ruin probability from one cash path.
- Never notify profitability from a fixed baseline or a selected winning period.

No real-money transaction has been performed. This record is not a profit promise.
