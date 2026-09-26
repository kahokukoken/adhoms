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

Red run: [Ver1 QA #158](https://github.com/kahokukoken/adhoms/actions/runs/36241487047), commit `3b56cac6502b8c96d681e51dc9a26aac7328049c`: **54 passed / 3 failed**. Both web and standalone saved-week reloads moved from the top to **scrollY 3337**. Fresh startup checks passed. The third expected failure confirmed the missing staff-first FEED.

Root cause: `renderFeed` compared the saved week restored by `ver1-daily-session.js` with the startup week and scheduled a new-arrival scroll. Rendering does not indicate user intent.

Implementation: scrolling now belongs to the actual week-advance action and captures its month/week before the animation callback. The header is excluded from the target reading area. Eight internal first-April posts introduce Fujii, Saeki, Miyashita, T-0WA and Mizuno, explain reading/weight/detail/monthly controls through replies, and hand off to Tanaka's bus observation. Existing scenario IDs stay unchanged. Practice is a separate topic and excluded from town-research scheduling and monthly observation totals.

Green run: [Ver1 QA #159](https://github.com/kahokukoken/adhoms/actions/runs/36241702749), application revision `d2963125296ee8829918010872bdda57e879077c`: **57 passed / 0 failed in 46.8s**. This includes the formerly failing web and standalone saved-week startup checks, existing weekly scroll behavior, staff order, actual +/-/detail operations, saved practice weights, and later-month/year exclusion. The full five-year/event/persistence suite also passed.

Downloaded the CI build and verified it is byte-identical to the local standalone HTML. SHA-256: `79b6ba4122d5398525f331b27708bd2561804d92a0df09cb41c359bfffe43661`. Inspected CI screenshots at 390×844: opening stays at the top; Fujii is the first FEED card; Saeki's complete 123-character post and controls are readable without truncation. Read all eight authored messages in display order (52–126 characters each).

Independent read-only review found no actionable bugs after tracing the layered render/save wrappers, stable IDs, first-April gating and practice isolation. The browser may still restore a user's own prior reading position; application-triggered new-week jumps on load are removed. Existing category filters remain intentional.

Local syntax checks, standalone assembly and `git diff --check` passed. PR #17 remains draft. V1-14's human judgment of pacing, attachment and comprehension remains open; functional verification is not experience acceptance.
