# Boat Race Next Decision Gate

Status: 2026-09-19. Research track created. No profit claim.

## Immediate next step

Build a parser smoke test for one venue-day before adding any prediction model.

Locked smoke-test target:

```text
venue: 唐津 / jcd=23
hd: 20260918
rno: 1..12
pages: racelist, beforeinfo, odds3t, odds2tf, raceresult
```

Success means the parser can output normalized rows for:

- races
- entrants
- before_info
- odds_snapshots
- results
- payouts

## Decision gate A: parser validity

Proceed only if:

1. All 12 races are fetched and parsed without manual row repair.
2. Entrant count is 6 per normal race, or abnormality is explicitly flagged.
3. Result order and payout rows match official result pages.
4. Odds selections are normalized into canonical strings, for example `1-3-2` for trifecta and `1=3` for quinella.
5. Zero odds are preserved as unavailable/low-pool flags, not converted into profitable signals.

## Decision gate B: historical upper-bound test

After parser validity, run closing-odds-only historical backtests.

Interpretation:

- Passing this gate does not prove executable profit.
- Failing this gate is strong evidence to stop or redesign.

Required output:

- ROI by bet type
- bet count
- max drawdown
- venue/month contribution
- hit-rate and average odds
- sensitivity to edge thresholds

## Decision gate C: forward paper-trading

Only if closing-odds upper-bound results are positive, start pre-close odds capture.

Required live snapshots:

- T-5 minutes
- T-3 minutes
- T-1 minute
- final closing odds

Passing condition:

- Positive ROI remains under pre-close executable prices.
- Edge does not vanish from late odds movement.
- Drawdown remains realistic for 50,000 JPY.

## Prohibited shortcuts

Do not claim profitability from:

- closing odds alone
- a single day, venue, or month
- a small number of large trifecta hits
- thresholds chosen after seeing results
- result-page weather or start data leaked into pre-race prediction
- manual removal of losing races without a locked rule

## Research claim wording

Allowed now:

> BOATRACE has a technically testable public-data path and is the next priority market.

Not allowed yet:

> BOATRACE is profitable.

Not allowed yet:

> ADHOMS can turn 50,000 JPY into 1,000,000 JPY with boat racing.
