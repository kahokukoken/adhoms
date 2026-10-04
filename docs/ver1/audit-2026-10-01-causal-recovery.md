# ADHOMS causal integrity audit at 7c0f5429

Date: 2026-10-01 UTC. Baseline: `7c0f54295dbbdc079e6b9be1f3332b4f5f86d5b3`.

## Conclusion

**Causal integrity remains PARTIAL, not PASS.** Three narrow state/provenance defects were reproduced and handed into this repair session. The optional-history migration correction is implemented and verified in my owned files. The parent is correcting the two other runtime defects and handling integrated verification. Character-history ownership, misleading inert observation-priority controls, and unlabelled legacy metric snapshots remain bounded gaps; none requires a detailed population simulator.

The six new Year-1 entity-addressable memories are a useful foundation. They do not yet provide canonical history for most later character experiences. Passing the currently named “Character History Authority”, “Narrative Provenance”, and “No Prose-as-State” tests does not establish those broader requirements.

Q-05 is **resolved by DL-016**. Machi/Kosei names and readings are **resolved by DL-015**. Old audit prose describing Q-05 as open is historical, not a current blocker.

## Authority and limits

Read `AGENTS.md`, Decision Locks JSON/Markdown, `current-spec.md`, regression contract, causal-integrity audit, refactor preflight/verification, and Q-05 preflight before implementation. Relevant locks are DL-005/006/007/008/009/010/014/015/016; relevant requirements are V1-04/05/06/07/08/09/10/11/13/14.

Primary source originals supplied by the parent:

- [Implementation Blueprint](https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee): preserved result as-of `2026-10-01T11:07:05.735Z`, fetched by source worker during this session. Its lightweight state model and state-update rules require major-character Relation/Memory, observable causal changes, and a scenario-controlled lightweight simulation. Its personal-outcome section incorporates the adopted Q-05 decision.
- [Current hub](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef): preserved result as-of `2026-09-30T08:41:46.934Z`, fetched by source worker during this session. Apply the later explicit DL-015/016 decisions over stale historical sections. Accepted design, Year-1/2/4/5 goals, and V1-07/08/10 sections were reviewed.
- Full [Work protocol](https://app.notion.com/p/3e9fbe78bd3b81ae97e3f02510788629) currently unavailable with Notion internal 500. Repository AGENTS/regression-contract preserve the verified protocol requirements. No new full-protocol or individual-character-page verification is claimed.

The audit inspected source and exercised actual browser code. Some probes seed a valid saved boundary instead of replaying all five years; each finding below states that scope. Source locations below refer to baseline 7c0f5429, before concurrent parent fixes. No human-experience acceptance or new medical/biographical interpretation is claimed.

## Findings

### P1 — A. Year-3 propagation changes canonical trust while the displayed trust remains stale

**Chain broken:** canonical next state → player-visible metric.

**Source:** `ver1/ver1-ui-bridge.js:139–147,167–181`; `ver1/ver1-propagation.js:55–62,116–129`.

`showY3()` applies/saves side effects but does not call `syncLegacy()` or repaint the resulting FEED. The `hard_warning` propagation reduces `town.trust` by one. The header reads `S.trust`, last synchronized before propagation.

**Runtime reproduction:** resolve the real `y2_flood/hard_warning` choice; save at trial Year 2 March; reload; call the actual `nextMonth()`; await the Year-3 side-effects overlay. Canonical trust changes `1 → 0` but header remains `47`; reload changes header to `35` without another choice. This is a real same-save presentation inconsistency, not a proposed new metric formula.

**Minimal correction:** synchronize the existing derived header and rerender after canonical side effects. Test immediate state, overlay dismissal, and reload equivalence. Parent owns this fix.

**Existing coverage:** causal-integrity “routine time progress” only advances two Year-1 weeks, so no propagation occurs. “Legacy summary metrics cannot change final outcome” proves legacy values are ignored, not that the player sees current canonical values. Neither would fail for this defect.

### P1 — B. Closing the completed epilogue destroys the sole final-outcome history and allows the disaster to restart

**Chain broken:** final result → persistent character/history source → future display/resume.

**Source:** `ver1/ver1-ui-bridge.js:119–137,303–315`; `ver1/ver1-calendar-bridge.js:52–77,79–109`; `ver1/ver1-continuity.js:78–80`.

`#v1epclose` calls `clearFinalRecord()`. Recovery text reads `ADHOMS_VER1_DEBUG.final().session.result` as its only final-result source. No final result or completed-ending marker is retained elsewhere in canonical state. March progression without a recovery record falls through to legacy year-limit handling and `showEnding()`.

**Runtime reproduction:** restore a same-run valid March epilogue with a real finalized result; click “FEEDへ戻る”. The result becomes null and the recovery resolver changes from known personal consequences to “最終確認が…揃っていません”. Calling the actual next-month function restarts phase 0 of the final day; observed canonical month ends at 12 because legacy cap code also runs.

**Minimal correction:** persist an explicit completed stage with the final result, close only the overlay, and make the completed run's calendar controls terminal/read-only. Preserve completed-state reload and Machi/Kosei results. Parent owns this fix. No new fate or story choice is required.

**Existing coverage:** Q-05 save/resume checks only the recovery stage. Directive-4 test stops when epilogue becomes visible and never clicks its return button. Final-stage persistence checks reopening in-progress stages; neither checks post-completion history or progression.

### P1 — C. Legacy optional-history migration turns bookkeeping flags into fictional player-choice provenance

**Chain broken:** saved actual choice/world event → canonical Memory provenance.

**Source:** `ver1/ver1-history-migration.js:11–12,44–50`; actual flag writes in `ver1/ver1-optional-creation-events.js:158–169,181–188`.

The migration's generic prefix search returns the first `optional:brine:*` key. Normal flag insertion order is `seen` before the chosen action, so a saved live-test history receives `{type:'optional-choice',id:'brine:seen'}`. Autonomous `seen/world` history is likewise misclassified. If a follow-up flag happens to precede the real first-stage flag, the first-stage source is left missing.

**Runtime reproduction:** real optional choice → strip only the newer source/entity metadata to represent the old save shape → reload. Incorrect `brine:seen` source is persisted. The same prefix defect applies to soba.

**Implemented minimal correction:** match first-stage choices against the existing optional-event catalog, independently of flag insertion order. Exactly one recognized choice yields choice provenance; no recognized choice plus a `world` flag yields autonomous provenance; conflicting choices remain unknown. Repair the known previously-written `seen/world` bogus source only when existing flags unambiguously establish the real source. Preserve all other historical sources, notes, tags, dates, IDs and choices.

**New files/coverage:** `tests/ver1-history-migration-regressions.spec.js` has 11 load-path cases: BRINE/soba, autonomous vs chosen, second reload, unknown/ambiguous flags, follow-up ordering, valid/unknown existing source preservation, and already-persisted bad-source repair. Preflight: `docs/ver1/preflight-2026-10-01-history-migration.md`.

**TDD evidence:** 7 failing assertions/1 pass first; then 2 failing persisted-source repair assertions/1 preservation pass. After correction, 29/29 targeted migration/causal/creation tests pass. This is no claim that all history migration is complete: unknown histories remain unknown, and generic follow-up migration was not expanded in this bounded fix.

**Existing coverage gap:** the old causal migration test seeds only `optional:brine:live_test`, omitting `seen`, so it exercises a flag shape different from real saves.

### P1 — D. Most later character experiences still live only in authored packets

**Chain unclosed:** visible lived event → canonical character history → later scene.

**Source:** `ver1/ver1-story-history.js:16–40`; only six structured `memory` entries in `ver1/ver1-observation-scenes.js:939,951,961,973,994,1015`; `ver1/ver1-continuity.js:110–116`; `ver1/ver1-continuity-year2.js:2100,2144–2151,2202,2232,2277,2300,2455,2498`.

The new Story History layer records six Year-1 introductory facts. It never records a Year-2–5 ordinary character event. Example: Year-1 February says Gaku rested after digging out Kitamura's shed; this particular beat has no Memory (`observation-scenes.js:919–927`). Year-2 February explicitly recalls that fatigue, records his protected rest day and the absence of further requests; Year-2 March carries the resulting coordination burden onward. None of those later events is represented in Gaku's canonical history.

**Runtime check:** at Year-2 February, the actual rendered Gaku post says “実際にその日の依頼は来なかった”. `memoriesFor('gaku')` returns only his childhood-introduction memory. Opening and finishing the actual monthly meeting does not add character history (8 total memories before and after in the probe).

This is not a demand that every sentence become simulated or every resident get parameters. It is the precise still-open audit gate: a later scene treats an important experience as established because another authored paragraph exists.

**Minimal correction boundary:** choose the small set of consequential fixed character events already accepted by canonical material, give those events stable descriptors/entity/date/source IDs, record them on real time transitions, and let later dependent assertions consume that history. Fixed canon can remain deterministic. Do not record new events merely because rendering ran. If an event has no approved source, leave it unresolved rather than designing a biography. A bounded record of this gap is acceptable until this work is authorized and sourced.

**Existing coverage:** “Character History Authority” first tests an invented test memory's entity indexing; the story tests cover only those six Year-1 introductions/backfill. “No Prose-as-State” asserts rendering is mutation-free. It does not test that a played event is recorded on transition or that later prose requires its source. Existing tests can all pass while this gap persists.

### P2 — E. Quarterly observation-priority controls persist but have no active consumer

**Chain missing:** advertised observation-priority action → perception/next state.

**Source:** `scripted-scenario.js:526–529,577–578`; `index.html:82,87`; `ver1/ver1-daily-session.js:22,45–50,58–61`.

The UI invites players to revise quarterly observation priorities. Sliders commit into `S.values`; daily-session preserves them. With `drift()` now a no-op, active implementation references to `S.values` are only controls/save/restore. No active FEED selection, ordering, research, evidence, event choice or canonical-world rule reads the new values.

This is distinct from requiring sliders to modify the world. A perception-only control could be valid, but this control currently does neither. Do not restore independent random drift to give it an effect.

**Minimal correction boundary:** make its limited “record-only” meaning truthful, or connect it to a sourced observation-only behavior. Selection of that behavior needs canonical support; do not invent a new game mechanic.

**Existing coverage:** `ver1-observation-flow.spec.js` checks optionality, value persistence and draft resume, not whether changing a priority changes the declared observation behavior. DL-006/V1-05 should not be declared causally verified by those assertions.

### P2 — F. Legacy population/life/fiscal values remain unlabelled historical snapshots

**Source:** `index.html:23,34,81–82`; `ver1/ver1-daily-session.js:4,33–34`; `ver1/ver1-ui-bridge.js:139–147`.

Stopping random drift removed an important defect. It did not give population, life or fiscal numbers canonical ownership. They remain initialized constants or values restored from an older daily save, shown beside the canonical-derived trust figure without a snapshot date or explanatory scope. Different legacy daily saves can show different values for an identical light state, and they remain unchanged through the disaster.

**Minimal correction boundary:** do not add an unsourced formula. Either explicitly present these as dated context snapshots where permitted by current design, or remove their misleading current-metric presentation. This is narrower than a new population/fiscal model.

**Existing coverage:** the “legacy metrics cannot change final outcome” test confirms their causal irrelevance. The festival persistence test deliberately preserves manually altered legacy values. Those tests do not certify that the displayed figures mean what the player would assume.

### P1 sequence/provenance gap — G. TOWA hospital setting has no confirmed medical transition

**Source:** `ver1/ver1-final-event.js:270–275,287–309,342–349`; `ver1/ver1-ui-bridge.js:263–268,280–284`; `ver1/ver1-continuity.js:83–87`.

`people.towa.status` is calculated solely from evacuation risk. There is no TOWA medical/outcome object. Yet `privateScenePlace()` maps `critical/danger` directly to “病院の面会スペース”, while September only says her condition remains under confirmation. Runtime reproduces risk 4/critical → hospital, with `personalOutcomes.towa` absent.

**Authority nuance:** the hub's existing V1-10 record explicitly permits result-dependent hospital/recovery/shelter/backstage settings. The hospital itself is not an unauthorized invention. What is absent is a source-backed causal explanation establishing why TOWA is there after seven months. A risk label cannot establish injury, admission, treatment, or recovery. DL-016 supplies Machi/Kosei outcomes and does not supply a TOWA diagnosis.

**Minimal correction boundary:** preserve the approved ending order and private conversation; avoid implying a medical outcome from risk alone. Use only a canonical non-medical transition/setting that current source can support, or obtain a specific decision if medical history is required. Parent owns this repair; this audit does not invent that history.

**Existing coverage:** `ver1-directive4.spec.js:61–74` manually sets `status='danger'` and expects hospital. It enforces the current mapping, not factual provenance or a readable August→March transition.

## Coverage by required causal gate

| Gate | What is truly covered | What remains |
| --- | --- | --- |
| Single State Authority | Week/month random drift removed; final derives from light state | A immediate synchronization; F legacy snapshots; completed history retention B |
| Narrative Provenance | Choice/propagation/strategy Memory has source metadata; optional migration now tested with real flags | D later authored experiences; G risk-to-medical implication |
| Counterfactual Continuity | Flood/wildlife/snow branch text, optional relations, cooperation resources and final calculations respond to histories | Tests mostly require different text or keywords, not all downstream claims' causal validity; fixed convergence remains allowed |
| Perception-to-Decision | Completed topic research is shown as evidence; absence explicitly says uncertainty; render does not complete research | E priority controls have no perception effect; coverage is only three Year-2 decision contexts, not all future actions |
| Character History Authority | Entity-indexed Memory; six fixed Year-1 facts; optional two-stage history; DL-016 final outcomes | D later experience/role/history; B final outcome survival after ending |
| No Prose-as-State | FEED rendering is read-only for world and research | Does not prove consequential authored events have a canonical transition or later provenance |

Perception need not unlock a new choice for this lightweight design: changed information/uncertainty at judgment satisfies the stated narrow gate. I found no reason to replace the existing real Year-2→Year-3→Year-4→disaster causal path with a larger simulator.

## Verification record

- Browser runtime evidence: `adhoms-causal-runtime-evidence.json` (A/B/G), `adhoms-causal-migration-evidence.json` (C/D), beside this report.
- Probes used the real source app served locally and valid same-run save boundaries. They did not edit game files during the read-only audit.
- Initial targeted baseline run: 31 passed, 3 text/visibility failures. These were traced by parent to missing local fontconfig, not game logic; do not count them as repository defects. The integrated recovery corrections were subsequently checked in a full run: 146 passed. This latter result is parent-supplied verification, not an independent full-suite claim by this worker.
- Narrow migration correction: 29 passed in 15.1s with `FONTCONFIG_FILE=/tmp/adhoms-fonts.conf` and `PLAYWRIGHT_BROWSERS_PATH=/tmp/adhoms-playwright`. Includes 11 new migration, 14 existing causal-integrity, and 4 existing creation-continuity cases. The latter includes current prebuilt standalone compatibility checks; no standalone was rebuilt by this worker, so no corrected-standalone claim follows.
- Both edited JavaScript files pass `node --check`; scoped `git diff --check` passes.
- Logs: `adhoms-causal-existing-tests.log`, `adhoms-migration-red.log`, `adhoms-migration-red2.log`, `adhoms-migration-green.log`.
- Parent owns final combined browser, standalone manifest, UI screenshots, Sequence digest/review, CI, and publication status. No commit, push, merge or deploy was done by this worker.

## Status separation

At audited baseline: Logic **FAIL for A/B/C** despite narrower existing checks passing; UI **FAIL for A** and misleading state presentation remains bounded; Save/Resume **FAIL for B/C**; Sequence retains source-bound independent-review status and must not be promoted by this audit; Human Acceptance **未実施**; Causal Integrity **PARTIAL**.

For this worker's delivered migration change only: targeted Logic/Save-Resume **PASS**; no new UI behavior; integrated UI/Sequence/standalone status belongs to parent verification. The broad causal audit remains **PARTIAL** until D/E/F/G are resolved or explicitly bounded in the current acceptance record.
