# Ver1 V1-10 verification — 2026-09-24

Scope: recovery-to-ending reveal order and persistence.

Canonical order used: recovery → five-year administrative review (including T-0WA continuation declaration) → private TOWA/Kiso conversation → quiet Directive 4 → epilogue.

## Implemented evidence

- Administrative review explicitly separates aggregate public evaluation from individual/livelihood residual loss.
- T-0WA continuation declaration occurs inside the administrative review.
- Private TOWA/Kiso scene reveals the university-festival encounter and “永遠”, including the earlier “有名だから勧めるなら雑誌でいい” exchange.
- TOWA connects that encounter to her later biodiversity framing.
- TOWA notices the terminal voice feels unusual, but the T-0WA name/voice origin remains unrevealed in Ver1.
- Private-scene location derives from the final result: hospital, recovery site, shelter withdrawal, or backstage.
- Directive 4 follows the private scene and records the residual between aggregate/admin success and continuity of individual lives, family businesses, and life bases.
- Final stages are separately resumable: result, private, directive4, epilogue.

## Regression evidence

Verified revision: `66aef52ebf1c50e890c9cab99a0857fdf02f418a`.

GitHub Actions Ver1 QA #143, run `35971904655`:
- **41 passed / 0 failed** in 43.7s;
- standalone build and static browser run passed;
- `adhoms-ver1-review` artifact generated;
- `adhoms-ver1-qa-evidence` artifact generated.

An initial run failed only because an older exact-text assertion expected the standalone “5 YEAR FIELD TRIAL COMPLETE” label. The UI was changed to keep that label stable while showing ADMINISTRATIVE REVIEW separately, then the full suite passed.

## Remaining boundary

This is functional and reveal-order verification, not V1-14 human first-play acceptance. Q-03 continuation thresholds and Q-04 timing remain unresolved.
