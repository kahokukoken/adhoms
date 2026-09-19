# Parser review — 2026-09-19

A synthetic regression found that a ticket-specific `3連単 不成立` line incorrectly
cancelled the entire race, making valid single-win payouts into refunds. Removed
the generic non-header cancellation rule. Header-level whole-race cancellation
and F/L/K refunds remain separate. Unknown ticket-specific settlement stays
unknown rather than inventing a payout.

Local red-green evidence: before the fix, a 150-yen winning single bet was wrongly
returned as 100 yen. After the fix all 17 unit tests passed. These tests establish
code behavior, not real-race profitability.

The first annual workflow 35409472561 is pinned to commit
5abda8aa31d1471fec403609f249cf9788e77ace, which precedes this correction. Its numerical
results must be rechecked against the corrected parser before being trusted.
Raw daily archives from its artifact can be reused for that check. Do not launch
duplicate annual downloads solely for this two-line correction.

An independent official-page comparison set has been collected for 2025-09-01,
Shimonoseki, races 1-12: exacta and trifecta results and paid amounts. The first
race also has program IDs, national ratings, closing time, win/trio/quinella
amounts. This is for checking the archive parser, never for choosing a model.
Sources:
https://www.boatrace.jp/owpc/pc/race/resultlist?hd=20250901&jcd=19
https://www.boatrace.jp/owpc/pc/race/raceresult?hd=20250901&jcd=19&rno=1
https://www.boatrace.jp/owpc/pc/race/racelist?hd=20250901&jcd=19&rno=1
