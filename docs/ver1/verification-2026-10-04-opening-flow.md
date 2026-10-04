# Opening flow and bus reference — 2026-10-04

Follow-up to the immutable c96286dd review delivery; draft PR #17. [Opening preflight](preflight-2026-10-04-opening-flow.md) and [bus correction](verification-2026-10-04-bus-retrospective.md).

## Bounded implementation

- DL-013/014/020; V1-02/03/04/11/12/13: remove the premature observation-start sentence from T-0WA's first post and the duplicated read/investigate/propose sentence from the second. Purpose/authority remains in post one; sources/limits and returned responses remain in post two. All staff voices and control guidance remain, and the existing final Fujii introduction leads directly to Misaki's bus problem.
- The same revision removes one unsupported Year 4 retrospective attribution; it adds no history and changes no participant action, response, Memory or state.
- Exactly three production text fields changed. All ten onboarding IDs/order, all 288 Year 4 rows/metadata, renderer logic, save schema, calendar, controls and layout remain unchanged.

## Pre-CI verification

- Both opening regressions failed against the baseline, then passed with the correction. The bus-reference regression likewise ran RED→GREEN.
- Complete Node suite: **56 passed / 0 failed**.
- Browser suite discovery: **281 tests in 43 files**, no parse errors. Discovery is not execution.
- Added real web/standalone assertions: first two T-0WA posts; final onboarding row `onboarding-handoff`; immediately next resident is Misaki's bus consultation; May and reload have no recurring onboarding. New handoff screenshots are captured by the existing browser test.
- Full-source diff checks confirm only those three authored fields changed; model bus diagnostic confirms six-history state/serialized-restore parity.
- Standalone build and `--check`: PASS. Source digest `b0114a70e9e26cbadcfff20940dfc3ec11c116d60e92b53bbabeac98cb768e41`; HTML SHA-256 `d6995cf1813f37e766529dc97c8429c24c8c43abbe0cebcfe6baa6b6dce982b8`.
- Frozen c96286dd playable and three-scene artifacts retain their previous hashes.

At this commit, fresh CI execution and actual-render changed-context review are pending. The old source-bound review is intentionally not promoted by the Node checks. **Logic: local scoped PASS; UI: pending CI; Sequence: pending current runtime review; Save/Resume: model PASS, browser pending; Human Acceptance: 未実施.** Wider causal architecture remains PARTIAL. No new user full-game reread is requested.
