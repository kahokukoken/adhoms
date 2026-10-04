# Three-scene review preparation and bounded repairs — 2026-10-04

## Status at local verification

Implementation is prepared, but fresh browser/sequence verification and review-artifact generation are **pending**. This is not a release or Human Acceptance. Source digest `7bf3f63d0207ab75b2186698da75e81fac4416eac629890d4a6e4bd9606394b8`; current standalone HTML SHA-256 `9a65bf698b1017e7c9c6c360b4b0bbad38f43a944950470d8087da98a1d3b5f4`.

Preflights: [repair](preflight-2026-10-04-review-repair.md), [cancellation narration](preflight-2026-10-04-cancelled-events.md), [short review](preflight-2026-10-04-short-review.md). No Decision Lock is superseded. Requirements V1-04/08/09/10/12/13/14; DL-003/006/007/008/009/014/017/019/020.

## Changes and evidence

- **Final-day causal narration:** noon, evening and personal-crisis text reads the recorded event schedule and matching organizer's accepted response. Cancelled/advanced events no longer unconditionally claim an unchanged concentrated audience. Withdrawal/guide staff and the fixed personal outcomes remain. Missing/mismatching legacy assent stays unknown.
- **Meeting repetition:** the annual principle appears at April's meeting rather than being printed before the same year's every conversation. The specific topic, complete dialogue, monthly catch-up and annual report remain.
- **Participant replies:** Year4 combined replies display one paragraph per existing actor answer and one shared non-coercion statement. Original saved replies are untouched. The paragraph breaks also survive direct-month-end catch-up.
- **Final readability:** prepared-resource explanations and the final T-0WA declaration use the established 16px body size. Repeated standing authority/unsupported-bonus qualifications remain available in a closed support-details section; current replies, missing resources, capacity, forecasts and allocation tradeoffs stay visible.
- **Scope clarity:** Year4 June identifies Murata's particular consignment/time slot, separately from disaster warehouse agreements. Year5's ordinary monthly-record count explains the separate August disaster record only when a real final result exists.
- **Character stakes:** the existing Year3 CM scene now identifies the earlier performer 永遠 as canon specifies. A short Year5 July Kiso/Saya exchange shows his concern for the three people before the crisis. The university encounter remains in the private ending and the AI's naming/voice origin remains withheld. These are editorial realization of fixed canon, not new canonical history or state effects.
- **Short review exporter:** normal controls through one disclosed route produce three read-only excerpts: April meeting → May response; Year4 April participant/history progression including the complete Minato/Kaito handoff; July personal concern → final allocation/recovery/ordered ending. Output is separate script-free offline HTML. It does not create a game mode, checkpoint or executable substitute for the normal game.

## Verification completed locally

- `node --test tests/*.test.mjs`: **51 passed / 0 failed**, including eleven new renderer/data contracts. Fail-first runs captured the missing behavior before edits.
- `playwright test tests/ver1-cancelled-event-narrative.spec.js --grep 'narrative model'`: **6 passed / 0 failed**, executes actual model and production renderer without a browser.
- `playwright test tests/ver1-short-review.spec.js --grep 'renderer contract'`: **5 passed / 0 failed**, escaping, static/no-save output, source/provenance validation and actual runtime selectors.
- Existing proposal-model tests: **17 non-browser cases passed**. Two browser cases did not start because Chromium is unavailable; these are not product failures or passes.
- Independent code review: **22 focused checks passed**. All **48** schedule/evacuation combinations produced complete finalized session JSON identical to c873641d. **288** narrative projections left their input unchanged. [Review evidence](sequence/evidence/code-2026-10-04-review-repair.md).
- `build-standalone.mjs --check`: PASS against the stated digest. Existing frozen delivered aliases are byte-identical to c873641d. Syntax and whitespace checks pass.

## Pending verification, kept separate

- Logic: targeted local checks PASS; complete aggregate CI pending.
- UI: fresh browser/mobile verification pending. Local Chromium startup is unavailable in this environment.
- Save/Resume: model serialization/non-mutation PASS; fresh browser resume suite pending.
- Sequence: fresh normal-controls weekly/monthly exports and changed-context reader review pending. Existing source-bound gate intentionally does not accept the changed source until review evidence is recorded.
- Short review: implementation/static contracts PASS; authentic capture, source-matched HTML delivery, 320/390 screenshots, offline navigation and save-isolation browser tests pending.
- Human Acceptance: **未実施**. No claim of 45–60-minute duration, universal enjoyment or all-choice narrative coverage.

## Remaining boundaries

The full causal-architecture audit remains PARTIAL. These repairs neither adopt every authored paragraph as canonical history nor implement a detailed population engine. Q-01/Q-03 stay open. Some monthly recaps, organizational exposition, backstage detail and the longer-term development of TOWA's role remain editorial work; the new short excerpts are not proof that all of it is resolved. Fixed outcomes, simulation effects, save identities and ordinary progression remain intact. PR #17 remains draft; no main merge or production deployment is part of this work.
