# Approved crisis engine preflight — 2026-10-01

Touched locks: DL-007, DL-008, DL-009, DL-014, DL-015, DL-016, DL-017. Requirements: V1-09, V1-10, V1-13, V1-14. Owner files: `ver1/ver1-final-event.js`, `tests/ver1-approved-crisis.spec.js`, this preflight. UI/continuity and lock registry are coordinated separately.

## 1. Purpose
Implement the user's 2026-10-01 11:56:35 UTC approval: TOWA survives without serious injury; evacuation-start delay remains choice-dependent; personal priority connects to the existing four-way vehicle allocation, its local risk tradeoff, and legitimacy cost. Connect canonical decision history to modeled risk and explicit personal outcome without adding a new resource model.

## 2. Reproduction steps
Create a final-day session, reach noon, select forest evacuation wait or start_now, then reach personal_crisis. Manual override currently only changes legitimacy and offers no actionable vehicle redistribution. Finalize either route: personalOutcomes contains Machi/Kosei but no TOWA. Existing ensurePersonalOutcomes only adds an entirely missing object, so an old valid result containing two people cannot gain TOWA or recorded evacuation evidence. Add failing tests for these defects before implementation.

## 3. Canonical source
Latest explicit user approval (2026-10-01 11:56:35 UTC) and DL-017, with DL-016's already adopted Machi/Kosei outcomes. Hub https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef (preserved full snapshot 2026-09-30T08:41:46.934Z), Blueprint https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee (preserved full snapshot 2026-10-01T11:07:05.735Z), read 2026-10-01. Applicable sections: year-five graph, individual crisis, lightweight model, fixed versus variable outcomes, source precedence and regression protocol. Current live Notion returns 500 as verified by coordinating parent; updates are explicitly deferred, not claimed successful. Local AGENTS, decision-locks.json/md, current-spec, regression-contract and causal-integrity audit were read. The new user decision supersedes only the former unresolved TOWA outcome and missing personal-priority consequence; other unresolved questions stay open.

## 4. Current implementation / cause
`priority_override=manual_override` applies only a legitimacy decrement and ethics incident. `vehicle_allocation` is an earlier decision with the approved four existing effects. Rebuilding decisions from decisionBase provides an idempotent base, but naive additional allocation would double-stack benefits/costs. Outcomes currently omit TOWA and migration short-circuits when personalOutcomes exists. Correct the decision-effect link and canonical result provenance, not prose alone.

## 5. Impact surface
Personal-crisis available actions; risk projection and resulting safety/continuity; final result decisions and personalOutcomes; legacy result enrichment; active/final save and reload. The parent implements UI labels, selection feedback and recovery/ending continuity using these fields. No standalone generation by this worker while the parent edits UI.

## 6. Invariants
Keep internal IDs chihiro/gaku. Keep DL-016 outcomes, ending order and hidden T-0WA origin. Keep earlier vehicle_allocation history and separate personal_vehicle_allocation. Effective personal allocation replaces the original allocation contribution, never stacks; system_priority restores original effects; repeated choices are idempotent. Personal allocation is available only in personal_crisis with manual_override; unavailable actions throw without mutation. Manual override without a target preserves no invented target. TOWA evacuationStart comes only from forest_evacuation: wait=delayed, start_now=immediate, absent/unrecognized=unrecorded. Town-wide evacuationDelayMin is never labeled as an individual delay. Preserve valid legacy results and unknown extension fields; never fabricate a missing decision, diagnosis, recovery date, resource total or quantified personal loss.

## 7. Verification method
RED then GREEN in real browser-loaded engine tests. Test all four replacement choices, missing earlier allocation, switch/reselect, phase rejection, legitimacy idempotence, source-derived TOWA outcome over distinct risk/aggregate-delay routes, legacy migration with partial/missing outcomes and save/reload with both allocations. Run adjacent final decisions/persistence/Q-05/causal-recovery tests using server and Playwright in the same exec invocation; use FONTCONFIG_FILE=/tmp/adhoms-fonts.conf and PLAYWRIGHT_BROWSERS_PATH=/tmp/adhoms-playwright. Parent owns full suite, mobile UI, standalone --check, build-bound sequence audit and independent reading. Report Logic/UI/Sequence/Save-Resume separately; Human Acceptance remains 未実施.

## Execution evidence
- Before engine edits: `tests/ver1-approved-crisis.spec.js` — 9 expected failures from unavailable personal allocation / absent TOWA outcomes. Log: `/tmp/adhoms-crisis-engine-red.log`.
- Initial engine correction: same 9 tests passed. Log: `/tmp/adhoms-crisis-engine-green.log`.
- Review correction: added a conflicting legacy TOWA safety test; confirmed RED (false survival / true severe injury survived migration), then normalized only the two DL-017 fixed TOWA fields. Valid evacuation evidence, notes, aggregate metrics and recorded decisions are retained.
- Final targeted run: 33 tests passed / 0 failed in 14.6s, covering approved-crisis, final-decisions, final-persistence, Q-05 personal outcomes, causal-recovery regressions, final-ui and crisis-narrative. Log: `/tmp/adhoms-crisis-adjacent-final.log`. Existing standalone cases in this run do not establish newly generated standalone fidelity; parent owns the final rebuild/check and full suite.
- `node --check ver1/ver1-final-event.js` and `git diff --check` passed.
- Scoped Logic PASS and Save/Resume PASS. Integrated targeted UI assertions PASS; visual/mobile review remains with parent. Sequence remains pending the build-bound independent review/audit, Human Acceptance 未実施. No commit, merge, deploy, standalone generation or frozen-alias modification by this worker.
