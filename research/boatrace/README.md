# BOAT RACE research — baseline v0.1

Status: research implementation; no evidence of a profitable strategy yet.
User goal: test a 50,000 JPY bankroll over approximately one year, with realistic
execution and strict historical information boundaries. This directory contains
only the first data/baseline stage, not a completed ADHOMS betting model.

## Frozen protocol (2026-09-19, before annual execution)

Period: 2025-09-01 through 2026-08-31, inclusive. Six non-optimized controls:
boat 1 win; highest nationally rated entrant win (ties -> lower boat number);
fixed 1-2 exacta; fixed 1-2 quinella; fixed 1-2-3 trifecta; fixed 1-2-3 trio.
No selection from final odds, final popularity, actual start time, actual entrance,
weather observed after the start, or results. Program and result parsers are separate.
These six controls were specified without tuning on this annual outcome dataset.
This does NOT reserve this year as an untouched test set for later model tuning.

Official-source entrypoint:
https://www.boatrace.jp/owpc/pc/extra/data/download.html
Daily source: https://www1.mbrace.or.jp/od2/B/YYYYMM/bYYMMDD.lzh and
https://www1.mbrace.or.jp/od2/K/YYYYMM/kYYMMDD.lzh
The user-facing download page links the national program and result downloads.
The reader pattern was checked against the public MIT-licensed parser project
https://github.com/miyamamoto/boatrace-lzh (no third-party code vendored).
Synthetic unit tests are not real-race observations.

## Accounting

Two separate outputs: (1) unlimited-capital 100 JPY/order turnover benchmark;
(2) 50,000 JPY simulated cash, 100 JPY/order, daily spending cap = smaller of
1,000 JPY and 2% of opening cash, rounded down to a multiple of 100 JPY.
Preselect in scheduled closing-time/race-ID order. Reserve all daily stakes before
settlement. No same-day reinvestment, loans, top-ups, or actual purchases.

ROI = (paid amounts including refunds - submitted stakes)/submitted stakes.
Return rate = 1 + ROI. Official payouts already incorporate takeout: DO NOT
subtract another 25%. F/L/K refunds are not losses; S disqualification is not a
refund. Missing settlement is explicitly unknown. Known-only turnover metrics
may have selection bias. Cash output with unknown payouts uses a disclosed
missing-as-loss scenario, NOT a verified actual path. Drawdown is end-of-day only.
Risk of ruin is null: one equity path cannot establish a ruin probability.
A 2% cap can stop new orders below 5,000 JPY even without hard bankruptcy.

## Scope and limits

Archive availability is not proof of contemporaneous publication timestamps.
No historical time-stamped pre-close odds or execution-latency series is bundled.
Pari-mutuel displayed odds are not locked at purchase. For future value selection,
a normalized market probability gap alone is insufficient: require calibrated
probability times a conservative FINAL payout estimate to exceed 1, after costs.
A final/earlier odds ratio is a slippage diagnostic, not a locked-in bookmaker CLV.

Unknown dates, B-only/K-only races, late entrant changes, incomplete fields and
missing settlements are audited, not silently removed. Six-entrant program rows
with known closing time only; this is a pre-result availability rule. Abnormal
result rows are quarantined but their planned orders remain in the missing count.
Annual completeness requires every requested day to succeed. Profit notification
eligibility is always false at this stage, irrespective of baseline performance.

## Reproduction

Python 3.12; lhafile==0.3.1 for archive decompression.

```sh
python -m unittest discover -s research/boatrace -p 'test_*.py' -v
python -m pip install lhafile==0.3.1
python research/boatrace/run_baseline.py --start 2025-09-01 --end 2026-08-31
```

One-shot GitHub workflow: `.github/workflows/boatrace-baseline.yml`.
No recurring schedule, no betting accounts, no betting API, contents read-only.
Artifacts contain archive hashes, date coverage, per-order settlement ledgers,
monthly/venue summaries and daily cash curves. Raw archives are retained only in
the research artifact, not committed to the public source tree.

Next gates: authenticate historical pre-close odds snapshots; validate parser
against official result pages; train/calibrate a probability model using earlier
periods; freeze hypotheses; test in disjoint future/held-out periods; quantify
latency, final-odds slippage, tax/cost assumptions, drawdown and risk-of-ruin.
