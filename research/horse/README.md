# ADHOMS JRA Betting Backtest

## Objective

Test whether a historically bounded JRA betting strategy could have turned **¥50,000 into ¥1,000,000** from roughly September 2025 to September 2026 without hindsight, leakage, one-off jackpot dependence, or obvious overfitting.

Bet types to compare on a common probability model and fixed bankroll policy:

- win (単勝)
- place (複勝)
- quinella place / wide (ワイド)
- quinella (馬連)
- exacta (馬単)
- trio (3連複)
- trifecta (3連単)

## Hard success gate

A result is not considered usable unless all of the following hold:

1. Starting bankroll: ¥50,000.
2. Evaluation period is strictly time-ordered and approximately Sep 2025–Sep 2026.
3. Features for each race are restricted to information available before the bet cutoff.
4. Staking rule and ticket-selection rule are fixed before the test segment.
5. Final bankroll reaches at least ¥1,000,000.
6. No bankruptcy under the same bankroll path.
7. Result is not dominated by a single extreme payout or a tiny number of bets.
8. Maximum drawdown, hit rate, bet count, ROI, and bankroll path are reported.
9. Robustness is checked by removing the largest winners and by walk-forward / multiple-start-date tests where possible.
10. A strategy that only works with final confirmed odds but cannot be executed at realistic pre-race latency is not considered production-ready.

## Data requirement

The preferred authoritative route is JRA-VAN Data Lab / JV-Link, because it exposes race detail, runner information, payouts, vote counts, and odds records, including the bet types needed for this comparison. A local SQLite conversion route such as JVLinkToSQLite can make the data practical for model training and backtesting.

For the requested test, the key missing runtime dependency is a locally accessible JRA-VAN-derived database (or equivalent licensed dataset) covering at least 2016–2026, with 2025–2026 race information and odds/payout tables. The connected ChatGPT runtime currently has no direct JV-Link session or local JRA-VAN database mounted.

## External evidence snapshot (2026-09-19)

A public GitHub project, `leo-miura-robot/keiba_prediction_ai`, documents a leakage-audited JRA 2016–2026 pipeline using 2025 as test and 2026 as latest holdout. Its README reports that a final-odds ideal-condition model achieved approximately:

- win: 2025 ROI 78.23%, 2026 ROI 82.72%, combined 79.59%
- place: 2025 ROI 88.23%, 2026 ROI 89.21%, combined 88.52%

A later place-market diagnostic reports one 15-year challenger subset with combined 2025–2026 ROI 104.803% on 127 bets, but the same document explicitly keeps the prior champion and treats 2025/2026 as diagnostic only. That is nowhere near sufficient evidence for the ¥50,000→¥1,000,000 gate, and the sample is too small to treat the edge as established.

Useful references:

- JRA payout rates: https://www.jra.go.jp/kouza/baken/
- JRA-VAN Data Lab developer community: https://developer.jra-van.jp/
- JVLinkToSQLite listing: https://jra-van.jp/dlb/sft/lib/jvl_tosqlite.html
- Public comparison repository: https://github.com/leo-miura-robot/keiba_prediction_ai

## Current status

**No bet type has passed the success gate.**

The next executable step is to obtain a time-ordered JRA-VAN-derived database in the runtime, then run the common-probability / common-bankroll backtest across all seven bet types. Until that dataset is accessible, public evidence can be monitored for useful model and market-structure findings, but it cannot substitute for the requested ADHOMS bankroll test.
