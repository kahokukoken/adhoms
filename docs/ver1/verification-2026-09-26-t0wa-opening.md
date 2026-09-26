# T-0WA opening refinement — 2026-09-26

## Change boundary and source check

Touched locks: DL-011 (first staff FEED), DL-002 (varied post length), DL-003 (portrait FEED), DL-009 (withheld private origin). Requirements: V1-02, V1-04, V1-12, V1-13. V1-14 remains human experience review.

Latest explicit user instruction: the permanent “ADHOMSとは” explanation is unnecessary after the first monthly report. Move it into the first FEED post, spoken by T-0WA, beginning exactly “おはようございます、木曽所長。あなたの親愛なるAI、T-0WAです。”

Sources retrieved 2026-09-26:
- [Current Notion hub](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef), fixed axes, Decision Locks and sections 18–19. Section 19 records the user's refinement before implementation.
- [T-0WA individual original](https://app.notion.com/p/3e0fbe78bd3b8169b320f542aa4de217), official name, research role, fact/testimony distinction and private-origin reveal boundary.
- Repository AGENTS, Decision Lock registry and current-spec at PR #17 head `23b097322e0b85d76b8dda49a64e1820fb07312a`. Other staff voices retain the original text verified in the preceding entry change.

No conflicting lock: this refines DL-011's first speaker and moves the permanent explanatory card into that conversation. The requested greeting is explicit user-authored copy; it does not revise T-0WA's later personality growth or private-origin reveal. Q-01 and Q-03 are outside this change.

## Implementation and verification plan

1. Refine DL-011 with the first-speaker/greeting and one-time explanation requirements.
2. Remove the permanent about card from `index.html` and its dependency in `opening-flow.js`. Preserve the opening scene-setting, with T-0WA's spoken introduction moved to FEED.
3. Prepend a stable-ID T-0WA orientation post in `scripted-scenario.js`, keeping previous staff/scenario IDs and the first-April-only boundary. Continue naturally into Fujii's terminal check.
4. Update the existing entry/month-transition checks for the first speaker and disappearance after the first monthly report, including saved May and standalone. Verify mobile reading and existing save/weekly behavior with the established QA gate.
5. Build the standalone artifact and update the repository/Notion evidence. The local browser socket limitation remains; browser evidence comes from the existing GitHub Actions workflow.

## Evidence

Application revision: `1490b517f51694bd938d1ca78683eb07589d07e6`, draft PR #17. [Ver1 QA #161](https://github.com/kahokukoken/adhoms/actions/runs/36243466212): **58 passed / 0 failed in 47.7s**.

- The first FEED card is T-0WA, with the exact requested greeting and the moved ADHOMS purpose/player-role explanation. The existing eight staff cards follow, with no changed IDs. T-0WA's later reply now begins with a supplement rather than a repeated introduction.
- The permanent about card is removed. The opening scene-setting no longer depends on that card; T-0WA's earlier prelude quotation is replaced by a short contextual note about missing observations, keeping its spoken introduction in FEED.
- Web and standalone checks confirm the first speaker and greeting, absence of the old panel, May after the first report, and persisted May on reload. Existing startup, weekly scrolling, practice weights, research isolation and later-year exclusion also pass.
- Downloaded QA screenshots at 390×844 and inspected the opening, full T-0WA explanation/control area, and saved-May screen. The explanation uses paragraphs without truncation; May begins directly with that month's observations after the normal controls.
- Read the nine authored posts in display order. Independent read-only review found no actionable issue with the conversation order, stable IDs, opening dependency or first-April boundary.
- Local JavaScript syntax, standalone assembly, all 25 inlined scripts and `git diff --check` passed. The standalone has no external scripts and is byte-identical to the tested CI artifact. HTML SHA-256: `0a2be0ef1b90a3f8b2bd01144110d5053e27e72f4884f763cb1bac63e52c667d`.

This completes the requested refinement and its functional checks. V1-14's first-play pacing/comprehension remains human review; PR #17 stays draft and is not merged or released.
