# Causal Integrity Refactor Verification — 2026-09-30

## Scope
Implements the first structural response to the 2026-09-30 causal-integrity FAIL. This is not a Sequence PASS or Human Acceptance.

## Implemented
- Stopped legacy `S.pop/life/fisc/activity/trust/resilience` from drifting independently during routine week/month progression. The active causal authority for major choices, propagation, capabilities and final disaster remains `ADHOMS_LIGHT_STATE`.
- Explicitly separated player/research knowledge into `ver1-perception.js`. Completed investigation can appear as decision evidence; missing investigation is shown as uncertainty rather than invented knowledge.
- Extended canonical Memory with entity references and machine-readable provenance.
- Added provenance to Year-2 choices, Year-3 propagation, Year-4 strategy and optional BRINE/soba history.
- Added/retained structured Year-1 story memories for major characters through the existing Story History layer; render alone does not manufacture those memories.
- Moved optional autonomous world progress out of pure FEED rendering and onto time/migration reconciliation.
- Moved research completion out of pure FEED rendering and onto load/month progression reconciliation.
- Added causal-integrity browser checks covering Single State Authority, Perception-to-Decision, Character History Authority, Narrative Provenance and No Prose-as-State.
- User rename 2026-09-30: current ADHOMS names are 高倉真知 and 柴垣晃生. Internal compatibility IDs `chihiro` / `gaku` are retained. Readings are たかくら・まち / しばがき・こうせい.

## Deliberately not invented
- No new population/fiscal formula.
- No detailed all-resident simulation.
- No inferred injury/survival/recovery outcome for Q-05.
- No conversion of legacy internal IDs to new IDs.
- No pronunciation-based UI additions beyond canonical documentation.

## Evidence
At source `fa389b997f3b8023f7a65aa9b25b17a774efa4e0`, browser QA completed successfully after the causal-state/history refactor. Sequence contract intentionally remained FAIL because the build-bound independent narrative review was `UNREVIEWED`, while exact repetition remained PASS (1,152 displayed / 1,152 distinct).

Subsequent name/readings changes are protected by DL-015 and updated browser tests; the latest head should not be treated as verified until its browser QA completes.

## Current status
- Logic: PASS on the last completed causal-refactor browser run; latest-name head pending CI.
- UI: PASS on the last completed causal-refactor browser run; latest-name head pending CI.
- Save/Resume: PASS on the last completed causal-refactor browser run; latest-name head pending CI.
- Sequence: FAIL / current independent review required for the new source digest.
- Human Acceptance: 未実施.
- Causal Integrity: PARTIAL — the critical split-state mutation and render-side-effect defects are structurally addressed, but authored packet vs canonical history responsibility still requires review before this audit can become PASS.

## Next gate
Do not resume prose-heavy continuity repair merely to turn Sequence green. First confirm the latest browser QA, then perform a source-bound independent weekly/monthly reading of the current build. Remaining semantic failures must be classified as either missing canonical history/state, authored-scene responsibility, or unresolved source material (especially Q-05).
