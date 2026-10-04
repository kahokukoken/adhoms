# ADHOMS adopted-history integration rereview

2026-10-01 13:24 UTC. Read-only implementation review against b7cc74b4, followed by independent browser probes of the consolidated correction. No repository source, build, commit, or push was performed by this reviewer.

## Result

No remaining actual blocker found in this bounded rereview. The three previously reported omitted references are corrected in both the source application and the rebuilt standalone.

- Year4 March W1 廻斗, `continuity-y4-m3-w1-kaito-2`: removing `dl19_minato_inquiry_handoff` now asks to confirm what Minato handed over rather than asserting receipt.
- Year3 February W4 蓮, `continuity-y3-m2-w4-ren-5`: removing `dl19_ren_minato_test` now leaves the reason for stopping unconfirmed rather than declaring weight as the cause. The related Saeki meeting line is covered by the regression rerun.
- Year5 May W3 湊, `continuity-y5-m5-w3-minato-4`: removing `dl19_minato_next_contact` now leaves direct-contact success unconfirmed rather than asserting it.

All six independent source/standalone probes returned `has=false`, changed visible text, and byte-identical canonical state before/after pure rendering. Evidence: `/tmp/adhoms-final-omitted-reference-rechecks.json`.

## Verification

- **49 tests passed, 24.4 seconds**: `ver1-adopted-character-history`, `ver1-causal-integrity`, `ver1-current-character-names`, and `ver1-reference-display`, two workers, own same-shell HTTP server. Log: `/tmp/adhoms-review-final-tests.log`.
- Includes all 27 adopted-history cases: actual transition/first-render recording, weekly/month-end equivalence, entry-week preservation, repeat/idempotence, restored and invalid/foreign saved weeks, cold isolation, malformed predecessors, metadata, research timing/deduplication, corroborating references, the three omissions, and five additional later-arc examples.
- Independent repeat probes confirm: corrupt pending-meeting saves stay at week 1 without late facts; early/late June research requests produce one July report using reached history; staff corroborations change with missing Memory; every captured January→February primary write already has the February calendar. No page errors. Evidence: `/tmp/adhoms-independent-history-final-probes.log` and `/tmp/adhoms-independent-history-probes.json`.
- Static structure check: **23 events, 136 explicit guarded reads**, no unknown guard IDs, invalid known/unknown branch shapes, or dependencies later than the displayed scene. Evidence: `/tmp/adhoms-final-guard-structure.json`.
- Compared **1,564 Year2–5 FEED/dialogue/research values** with b7cc74b4. After approved name normalization, known-route prose changes only in the three approved Year2 March coordinator-uncertainty corrections: Gaku W4, Mizuno meeting, and research. Evidence: `/tmp/adhoms-final-known-route-comparison.json`.
- Mobile/reference/name/save checks pass. Visually inspected the final 320px header and 390px expanded quarterly-record screenshots: readable text, intact controls, explicit reference/current distinctions and record-only explanation. Screenshots: `/tmp/adhoms-review-final-results/`.
- `git diff --check` passes. Final-event, disaster, and propagation source files have no diff from b7cc74b4; the causal suite confirms legacy display values cannot change the final disaster outcome.

## Tested artifact identity

Standalone SHA-256 measured: `6c0f594474d929fb03bf67dc9f3be9690b4aee1a745d0f5994be507c7faf5653`.
Manifest sourceDigest: `d4dba208a9c1d5f7c050eb1cd3bc516ff86579029ae1c1135a828400fb57415a`.

## Gates and limits

- Logic: PASS for the scoped engine/history/reference checks
- UI: PASS for the scoped browser/mobile checks
- Save/Resume: PASS for the scoped valid/legacy/corrupt/session-isolation cases
- Sequence: the previously reported history-reference blockers are resolved; this is not an independent full five-year first-reader certification
- Human Acceptance: 未実施

The parent owns the complete browser suite, actual-control reading exports, build consistency gate, frozen delivery verification, and release decision. This rereview does not adopt additional prose, add new state/capability effects, or infer who coordinated Kosei's rest.
