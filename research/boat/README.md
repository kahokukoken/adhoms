# ADHOMS Boat Race Profitability Research

Status: 2026-09-19 source reconnaissance and validation design. No real-money recommendation yet.

## Objective

Find whether Japanese boat race markets contain a reproducible, executable edge for a 50,000 JPY starting bankroll.

The research target is not "predict the winner". The target is:

> model probability > market-implied probability by enough margin to survive takeout, odds movement, latency, stake rounding, drawdown, and overfitting checks.

## Current source map

Official BOATRACE pages expose a useful minimum public dataset using the same key tuple:

- `hd`: race date in `YYYYMMDD`
- `jcd`: venue code
- `rno`: race number

Observed URL templates:

- Daily payout index: `https://www.boatrace.jp/owpc/pc/race/pay?hd=YYYYMMDD`
- Entry list: `https://www.boatrace.jp/owpc/pc/race/racelist?hd=YYYYMMDD&jcd=CC&rno=N`
- Before-race information: `https://www.boatrace.jp/owpc/pc/race/beforeinfo?hd=YYYYMMDD&jcd=CC&rno=N`
- 3-ren-tan odds: `https://www.boatrace.jp/owpc/pc/race/odds3t?hd=YYYYMMDD&jcd=CC&rno=N`
- 3-ren-puku odds: `https://www.boatrace.jp/owpc/pc/race/odds3f?hd=YYYYMMDD&jcd=CC&rno=N`
- 2-ren-tan / 2-ren-puku odds: `https://www.boatrace.jp/owpc/pc/race/odds2tf?hd=YYYYMMDD&jcd=CC&rno=N`
- Win / place odds: `https://www.boatrace.jp/owpc/pc/race/oddstf?hd=YYYYMMDD&jcd=CC&rno=N`
- Result: `https://www.boatrace.jp/owpc/pc/race/raceresult?hd=YYYYMMDD&jcd=CC&rno=N`

## Important limitation

Historical odds pages are best treated as closing odds, not executable pre-close prices. The official page labels the 3-ren-tan page as closing odds and explains that closing odds are displayed after the sales-ticket aggregation is complete.

Therefore historical backtests using these pages are an upper-bound filter, not proof of executable profit.

The execution proof must be a forward paper-trading run that captures odds snapshots before cutoff, for example 5 minutes / 3 minutes / 1 minute before scheduled cutoff.

## Research phases

### M0: Source map

Done enough to start a parser prototype.

Minimum pages to parse first:

1. `racelist`
2. `beforeinfo`
3. `odds3t`
4. `odds2tf`
5. `raceresult`

### M1: Parser prototype

Build deterministic parsers that output normalized CSV/JSONL rows.

Initial target:

- 1 venue-day
- all 12 races
- entrants, before-race information, odds, result, payout, weather

### M2: Historical closing-odds upper-bound test

Use closing odds to test whether any simple model can beat the market after conservative filters.

If no positive signal exists even against closing odds, stop; executable profit is unlikely.

### M3: Forward paper-trading execution test

Capture live public odds snapshots before cutoff and simulate actual selectable bets.

Required snapshots:

- T-5 minutes
- T-3 minutes
- T-1 minute
- final closing odds when available

### M4: Bankroll simulation

Starting bankroll: 50,000 JPY.

Stake rules to compare:

- flat 100 JPY minimum unit
- flat fraction with 1% race cap
- quarter Kelly with hard cap
- half Kelly with hard cap

No full Kelly for early deployment unless drawdown and calibration survive multiple independent periods.

## Notification gate

Notify only if all are true:

1. Positive ROI survives fixed out-of-sample and walk-forward validation.
2. The edge remains after replacing closing odds with pre-close executable odds.
3. Sample size is large enough; no single venue, season, racer, motor pattern, or tiny time window dominates the profit.
4. Maximum drawdown is tolerable for a 50,000 JPY bankroll.
5. Ruin probability is low under stake rounding and realistic bet frequency.
6. The result does not depend on post-result information, data leakage, or manual selection.

Until then, the status remains: research only, no profit claim.
