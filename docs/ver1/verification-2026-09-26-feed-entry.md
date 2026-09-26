# Feed entry and staff onboarding — 2026-09-26

## Change boundary and source check

Touched locks: DL-001 (downward reading/startup), DL-002 (varied length), DL-003 (portrait FEED), DL-005 (internal weights), DL-007 (story), DL-009 (withheld origin), new DL-011 (staff onboarding).
Requirements: V1-02–04, V1-12–13; V1-14 remains human review.

Latest explicit user instruction: startup must not jump to the bottom; separate from the opening explanation, begin the FEED with staff introductions, terminal checks and conversational instruction before residents.

Read on 2026-09-26:
- [Current hub](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef): source priority, fixed axes, development gates, locks and new section 18.
- [Blueprint](https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee): first-year baseline, monthly rhythm, lightweight story scope.
- [Character Bible](https://app.notion.com/p/3e0fbe78bd3b8111bf09ea99d1f060b3) and individual originals: [Fujii](https://app.notion.com/p/3e0fbe78bd3b810391d7fbe947367a49), [Saeki](https://app.notion.com/p/3e0fbe78bd3b81c1ba0cf88d3ab965e3), [Miyashita](https://app.notion.com/p/3e0fbe78bd3b815998aef5b89724009e), [Mizuno](https://app.notion.com/p/3e0fbe78bd3b81e3a4dbf386314ae8f2), [T-0WA](https://app.notion.com/p/3e0fbe78bd3b8169b320f542aa4de217): roles, voices, no private origin reveal.
- GitHub Decision Locks JSON/Markdown, current-spec and AGENTS at PR #17 head `83ce04f`.

No conflicting lock identified. Q-01/Q-03 remain unresolved and outside this change. Work is isolated from previous checkouts with uncommitted changes.

## Implementation and verification plan

1. Reproduce startup and save-load behavior in web and standalone browser tests. Rendering currently treats restoring a later saved week as a weekly advance; verify the actual viewport, not source text.
2. Make scrolling belong to the explicit week action; leave startup/restoration/filter/action redraws without a new-week jump. Retain actual week advance and month navigation.
3. Add first-April-only internal staff FEED cards in the existing renderer. Preserve all existing scenario IDs for saved observations; tutorial practice must not queue unrelated town research.
4. Verify chronological delivery, fresh/reloaded startup, staff order, real +/- and detail actions, save/resume, no repeat next month/year, mobile readability and the standalone build.
5. Run the full existing GitHub browser QA, read screenshots and rendered conversation, then update the current-spec matrix and Notion with actual evidence.

Local browser launch is blocked by the execution environment's socket restriction. Browser reproduction and QA use the existing GitHub Actions Ver1 QA workflow; no passing-browser claim is based on local execution.

## Evidence

Pending the initial regression run. This record does not claim a completed fix or human experience acceptance.
