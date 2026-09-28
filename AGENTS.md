# ADHOMS development entry point

## Stop-first rule: Decision Locks

Before reading or changing implementation details, read:
1. `docs/ver1/decision-locks.json`
2. `docs/ver1/decision-locks.md`
3. `docs/ver1/current-spec.md`
4. the linked current Notion originals, including relevant individual character pages.

**Locked decisions are a change barrier.** If a proposed implementation conflicts with a lock, stop that change. Do not reinterpret the lock to fit framework conventions, old code, old tests, branch history, or implementation convenience. A lock can be superseded only by a new explicit user decision; record the supersession in Notion and the registry before implementing the replacement.

Search summaries, branch names, old TGS documents and passing tests are not specification authority. Silence or omission in a later document does not cancel a locked decision.

## Required workflow

1. Record touched Decision Lock IDs first, then source URLs, retrieval date, applicable sections, requirement IDs and unresolved conflicts in the implementation plan. Latest explicit user instructions take precedence. Do not ask again for already granted approval.
2. Preserve Ver1's accepted scope: story, character attachment and Ver2 continuity, supported by lightweight simulation. Detailed population simulation is a separate research scope.
3. Do not silently resolve inconsistent names, character relationships, reveal timing or ending conditions. Use the unresolved-question register; continue independent work where possible.
4. Map each change to both relevant `DL-xxx` locks and `V1-xx` requirements, source file, visible scene and meaningful verification. Update superseded tests with the decision's source, rather than preserving outdated behavior. Add a machine-checkable regression test whenever a lock can be tested.
5. Verify affected behavior, mobile readability, save/resume and the generated standalone build. Read the scene in normal UI order. Automated completion is not evidence of narrative quality or a 45–60 minute first play.
6. Update the Notion hub and repository matrix with commit/test evidence. Report implementation, functional verification, human experience review and release separately; retain unfinished story work.

## Mandatory Work preflight and regression contract

When work is performed by an autonomous Work session, also read the full protocol before changing code:
- Notion: https://app.notion.com/p/3e9fbe78bd3b81ae97e3f02510788629
- Title: `ADHOMS Ver1 — Work開発プロトコル v1.0`

Before any code edit, record all seven fields: **purpose, reproduction steps, canonical source, current implementation, impact surface, invariants, verification method**. If any field is missing, do not start implementation.

For every fix, classify the cause, reproduce the failure first where feasible, make the smallest causal correction, then verify the adjacent week/month/meeting/save paths. Treat the following as high-priority fixed regressions unless a newer explicit user decision supersedes them:

- Cold start begins at 2029-04 with T-0WA onboarding and the FEED at its intended start position.
- Weekly FEED density must not collapse back to a two-post pattern where the current design requires six normal weekly additions.
- Month-end meetings open at their beginning and are not pushed downward or partially scrolled.
- Month boundaries do not mix FEED history, meeting state, or scroll position.
- BRINE and soba optional-event choices remain continuous into their second-stage events and later consequences.
- Fresh start and save/resume are separate cases; saved state must never leak into a cold start.
- Removed UI/meta elements must not reappear merely because older code or tests contain them.

Report **Logic PASS/FAIL, UI PASS/FAIL, Sequence PASS/FAIL, Save/Resume PASS/FAIL, Human Acceptance: 未実施** separately (latest user 2026-09-28). Never collapse them into one “complete” status. Automated five-year completion is not Human Acceptance.

The full fixed contract and six required test mappings are in `docs/ver1/regression-contract.md` (DL-014). Run both browser QA and `npm run test:sequence`; a known content failure remains a failure, never an expected-pass waiver. Before handing over a standalone file, run `node scripts/build-standalone.mjs --check` and record its manifest. Old frozen aliases must retain their bytes.

## Review ownership and stable handoff

User 2026-09-27 / hub section 24: repeated full checks are burdensome. Narrative editing and defect discovery belong to the production side before a user handoff.

- Check character knowledge, relationships, motives, voice, introduction order and later consequences against the current originals. Then use an independent first-reader review supplied only with the actual player-visible sequence, without design notes or prior findings. Record what the reader understood and where the text left gaps; do not treat simulated feedback as a guarantee of human enjoyment.
- State the months/years/routes reviewed. Include weekly and month-only routes where relevant. Do not label unreviewed later content as verified.
- Consolidate findings, record accepted/rejected feedback with reasons, fix them in a batch, and recheck changed scenes plus affected continuations. Passing browser tests does not replace this content gate.
- Request user review at coherent milestones, not after every small fix. Freeze the delivered version while the user reads. For the next version, supply concise changes, reasons, affected scenes, and the smallest useful rereading excerpt/range.
- Keep V1-14's human experience judgment distinct. It does not assign the user repeated full-game proofreading or routine regression testing. Do not claim internal reader reviews are complete until they have actually run.

Keep delivered aliases fixed. The first-year review is recorded in `docs/ver1/verification-2026-09-27-reader-review.md`; its verified delivery is `ADHOMS-Ver1-Reader-e2f9adcf.html`. The earlier `ADHOMS-Ver1-Content-8968cd4c.html` retains its original bytes. This handoff asks for no full reread. Do not infer that later-year narrative review or human acceptance is complete.

Primary hub: https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef

If Notion is unavailable, identify the last verified snapshot and limitation. Do not invent missing decisions or silently revert to an older design. Never publish another user's unrelated working-tree changes.
