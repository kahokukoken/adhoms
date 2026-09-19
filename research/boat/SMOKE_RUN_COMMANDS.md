# BOATRACE Smoke Run Commands

## Parser smoke test

```bash
python research/boat/parser_smoke_test.py \
  --hd 20260918 \
  --jcd 23 \
  --out research/boat/out/karatsu_20260918
```

Expected output files:

```text
research/boat/out/karatsu_20260918/races.jsonl
research/boat/out/karatsu_20260918/entrants.jsonl
research/boat/out/karatsu_20260918/before_info.jsonl
research/boat/out/karatsu_20260918/odds_snapshots.jsonl
research/boat/out/karatsu_20260918/results.jsonl
research/boat/out/karatsu_20260918/payouts.jsonl
research/boat/out/karatsu_20260918/fetch_log.jsonl
research/boat/out/karatsu_20260918/errors.jsonl
research/boat/out/karatsu_20260918/smoke_summary.json
```

## Baseline backtest

```bash
python research/boat/baseline_backtest.py \
  --input research/boat/out/karatsu_20260918 \
  --out research/boat/out/karatsu_20260918/baseline_summary.json
```

## Interpretation

Do not interpret baseline ROI until parser output has passed Gate 0.

Even after Gate 0, this remains a closing-odds upper-bound experiment. It is not executable-profit evidence.
