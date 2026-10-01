# Causal recovery corrections — 2026-10-01

## Findings and scope

Baseline source 7c0f54295dbbdc079e6b9be1f3332b4f5f86d5b3, [QA #278](https://github.com/kahokukoken/adhoms/actions/runs/36854874556). The exact-repeat test passes (1,152 distinct posts) and browser QA passes, but that does not establish narrative continuity.

Two new independent AI first-readers received only CI-exported player-visible weekly/monthly sequences for all five years, including choices, disaster, recovery and ending. Both identified two blockers:

1. TOWA's confirmed personal outcome is absent after the crisis; September leaves it pending and the private scene jumps to a hospital.
2. The personal-priority choice does not identify competing needs or connect a manual change to resource redistribution. Its existing implementation only lowers legitimacy.

Their full reports are in `sequence/evidence/reader-2026-10-01-{weekly,monthly}-independent.md`. They are AI production reviews, not Human Acceptance.

A concurrent production recheck at 0155df1 / 84a0487 marked the previous build PASS after checking prior Machi/Kosei findings. That report is preserved unchanged. The fresh independent findings are additional evidence outside its narrower recheck; they supersede the overall gate result. No claim is made that the earlier recheck never occurred.

## Causal corrections

- Year 3 propagation previously changed canonical trust from 1 to 0 while the header stayed 47 until reload corrected it to 35. `showY3` now synchronizes the canonical projection and rerenders after applying the side effects.
- Closing the epilogue previously deleted the authoritative final result, making recovery text unknown and permitting March progression to restart the disaster. Closing now retains a session-owned `complete` record. Calendar progression cannot restart the final. Old completed saves whose results were already deleted are also prevented from restarting, without inventing the missing history.
- TOWA's `danger/critical` labels derive only from evacuation risk. They no longer select a hospital location. Existing livelihood/relation-dependent non-medical venues remain. This does not fabricate or confirm TOWA's medical/safety outcome.
- Optional-history migration corrections and test evidence are recorded in the accompanying migration preflight.

## Verification so far

- New initial regressions: six expected failures (three defects × web/standalone) before fixes; then ten focused tests passed including adjacent final persistence and ending-order checks.
- Legacy-completed-save cases: two expected failures before the calendar guard; included in the full corrected suite.
- Full browser suite after recovery corrections: **146 passed (1.8 minutes)** on Chromium 140 / Playwright 1.55, web and standalone.
- First local run had 11 visibility/text failures caused by the runner's font configuration producing zero-height glyphs. A local-only Fontconfig file selecting installed DejaVu/Noto CJK fonts and a writable cache restored actual text rendering; all 146 tests passed without changing game layout or weakening assertions.
- Inspected 390×844 cold-start and meeting screenshots: Japanese text renders, meeting title starts at the top and controls remain accessible.
- Source/HTML digest checks and remote CI will be added after final integration. No frozen alias has been edited.

## Source verification limits

Hub and Blueprint were retrieved 2026-10-01 11:22–11:23 UTC. Preserved result timestamps are 2026-09-30T08:41:46.934Z for the hub and 2026-10-01T11:07:05.735Z for Blueprint. Latest explicit DL-015/016 and updated Blueprint outcomes override obsolete historical Q-05 references. Work protocol and fresh individual-character fetches returned Notion internal 500; no successful new full read or Notion update is claimed. Repository instructions and the last verified protocol snapshot were followed.

## Status

- Logic: corrected paths pass locally; final integration/remote CI pending
- UI: local corrected paths pass; final integration pending
- Save/Resume: corrected paths pass locally; final integration pending
- Sequence: **FAIL**; the two substantive narrative/action blockers require resolution and source-bound rereview
- Human Acceptance: **未実施**
- Causal integrity: **PARTIAL**, not a completed architectural audit
- Release: draft PR #17; no merge/deployment

No new TOWA outcome or personal-priority gameplay rule has been adopted in these corrections. Those specific decisions remain pending. No full user reread is requested.

## Integrated local result

All **159 browser tests passed (2.0 minutes)** after the migration and malformed-completion correction. Independent code review found one additional incomplete `complete` record edge; two regression failures demonstrated it and the corrected branch now remains terminal without inventing outcomes. The reviewer reverified 10 recovery tests and separate null-result probes with no remaining scoped findings; migration review independently passed 29 targeted cases.

Both 60-month reader exports completed without browser errors. All ten annual text files plus route metrics are byte-identical to the packets reread after the non-medical venue correction. Both readers still return FAIL on the two unresolved blockers; the source-bound gate remains a real failure, not an expected-pass waiver.

- Source digest: `09a83f695ed0c01949843f3e10b1139084a64c2844c6c11adbe507862265861c`
- HTML SHA-256: `7c752db9baf574b90259d87f857bcb8d7e81fbd3e1d479130effffd9ec692882`
- `build-standalone --check`: PASS
- Sequence: FAIL, current review matched, exact-repeat PASS, 1,152 distinct / 0 repeated groups
- Mobile private-conversation screenshot inspected at 390×844; document width is 390 and the corrected venue is readable. Cold-start and meeting screenshots also inspected.
- Scoped Logic/UI/Save-Resume: PASS locally; remote exact-head CI pending
- Broader bounded gaps: later authored character experiences are not all canonical Memory; quarterly observation-priority controls currently only record values; population/life/fiscal header values remain legacy context snapshots. Do not infer a complete causal-architecture PASS from the fixed defects or test total.
