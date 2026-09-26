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

Pending implementation and verification.
