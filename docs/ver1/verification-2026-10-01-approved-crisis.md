# Approved crisis outcome and action — 2026-10-01

## Authority and implementation

User approved the two-point proposal at **2026-10-01 11:56:35 UTC**, responding 「OK.進めて」. DL-017 records:
- TOWA survives without serious injury; evacuation delay remains choice-dependent
- Personal priority connects to existing four-way vehicle redistribution and its other-location risk tradeoff

No exact individual delay, diagnosis, hospitalization, new resource total or additional simulation variable was invented. `forest_evacuation` alone sources TOWA's delayed/immediate/unrecorded start; aggregate delay and exposure risk stay separate.

The earlier `vehicle_allocation` remains history. A distinct `personal_vehicle_allocation` is available only in the personal-crisis phase under manual override. Its effective contribution replaces the earlier allocation once, preserving replay order, clamping and the existing legitimacy consequence. System-priority restoration and repeated selections do not stack effects. UI confirmation is blocked until a manual target is chosen; older saves without such a target say unrecorded rather than inventing an action.

The scene now states each person's situation, the prior allocation, shared vehicle constraint and tradeoff. Recovery records the selected direction; TOWA's approved outcome appears at immediate result, September, administrative review and private conversation. Machi/Kosei outcomes and `chihiro`/`gaku` compatibility IDs stay intact.

## Verification

- Engine regression RED:9 initial failures, plus1 contradictory-safety migration failure before correction
- UI regression RED:3 initial failures, plus1 unrecorded-allocation history failure before correction
- Final full browser suite: **173 passed (2.0 minutes)**
- New engine/UI cases against rebuilt standalone directly: **14 passed (3.6 seconds)**
- Independent code review: no remaining blocking findings;14 focused cases pass;1,536 floor-sensitive schedule/allocation/reduction combinations match single-effect replay, system restoration and idempotence
- 320px/390px crisis screens inspected, no horizontal overflow, four targets and confirm reachable;390×844 actual manual-route recovery inspected
- Weekly and monthly actual-control exports:60 months each, no browser errors; alternate actual-control route also60 months, changing personal priority to manual and selecting forest allocation
- Eight Year1–4 packets are byte-identical to the originally read full routes
- Both original independent readers reread full final Year5 and alternate manual route from August to ending. They confirm both blockers resolved and no new blocking contradiction. Full reports: `sequence/evidence/reader-2026-10-01-{weekly,monthly}-approved.md`

Source digest: `54f074dad269b4b4b1fe7f12dba60f5c2df02c3d9727bdfd95f0754157012a76`.
HTML SHA-256: `a86afd989bc74bb3ee5755dd6f9758f6f7f7d52704c0744dceeb26165b510a8d`.
`build-standalone --check` passes. Remote exact-head CI is tracked on draft PR17; its generated artifact, with manifest, is the current distribution route. Historical frozen aliases are unchanged.

## Separate gates and limits

- Logic: PASS for corrected paths and full local regression suite
- UI: PASS for inspected mobile paths and browser assertions
- Save/Resume: PASS, including old incomplete/missing decisions and retained final outcomes
- Sequence: PASS for the source-bound independent-reader scope above; other branches are not represented as human-read
- Human Acceptance: **未実施**
- Causal integrity: **PARTIAL**, not a full architecture PASS; later authored character histories, record-only quarterly priorities and legacy header context metrics remain the explicitly bounded gaps in the separate audit
- Release: draft only; no merge/deploy

Nonblocking editorial comments remain recorded, including historical/current allocation wording, motive labeling, some didactic summaries and abrupt resource terminology. The new PASS does not erase earlier genuine FAIL evidence or certify play duration, enjoyment or all possible routes.

Live Notion fetch/documentation/update access still fails with internal500. Full current hub/Blueprint originals were preserved from earlier successful retrieval; explicit user approval and repository locks are recorded. Fresh full Work protocol/individual-character reads and Notion synchronization are not claimed. This is a source-service limitation, not a new unresolved approval.
