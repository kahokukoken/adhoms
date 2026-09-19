# Parser Patch Plan

This file records the first hardening pass after manually checking official BOATRACE pages.

## Required patch A: numeric normalization

Add a `normalize_digits()` helper and apply it before regex matching. Required because rendered official text uses full-width digits in result rows and entrant rows.

Examples:

```text
１ -> 1
２ -> 2
３連単 -> 3連単
```

## Required patch B: payout row parsing

Result payout rows can contain continuation entries where the bet type is not repeated. The payout parser should maintain the last seen bet type for continuation rows.

## Required patch C: odds table parsing

The 3-ren-tan odds page is not always rendered as literal `1-2-3 5.7`; it can be columnar. Odds parsing needs fixture-driven validation before any historical backtest.

## Required patch D: smoke summary gate

Smoke-test status should require:

- all expected races fetched
- at least 6 entrants per normal race
- payouts found for result races
- odds rows found, or an explicit parser warning

## Current priority

Patch A and D first. Patch B and C need raw fixture review.
