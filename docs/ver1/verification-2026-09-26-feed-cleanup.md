# Saved entry, opening access and FEED cleanup — 2026-09-26

## Sources and boundary

Touched locks: DL-001, DL-003, DL-005, DL-011. Requirements: V1-02, V1-03, V1-11, V1-12, V1-13. V1-14 remains human review.

User evidence: screenshots at 22:06 JST show **2029年5月**, the permanent SOCIAL FEED title/weight instructions, and repeated ADHOMS baseline-year cards. The user explicitly requests removal of those displays/cards and reports that T-0WA's opening is missing.

Read on 2026-09-26: repository AGENTS, Decision Locks and current-spec; [current Notion hub](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef), sections 18–20. T-0WA's unchanged conversation is the previously verified individual-character text, with its private origin still withheld.

Root cause: the saved light-state calendar resumes May. The opening is intentionally limited to first April, and there was no player-facing way to reread it. Renaming the file did not address saved-calendar restoration; the earlier delivery diagnosis was not established. The baseline card was seeded from a row-index ID after variable story/history/research rows, allowing stale copies when those rows changed. It is not an observation and is removed as requested.

## Bounded implementation

1. Remove the pictured permanent title/weight instructions and recurring ADHOMS year-context card. Anchor the first-April prelude independently of the removed title.
2. Add a later-month “初日の会話を読む” entry that opens the original nine cards as an explicitly dated, read-only transcript, beginning with T-0WA. Do not mutate the live calendar, choices or observations; close returns to the current FEED.
3. Preserve actual first-April practice controls and stable observation IDs. Do not insert the transcript into May or other live monthly FEEDs.
4. Check web/standalone fresh entry, saved May → opening transcript → current FEED, persistence, missing redundant content, and mobile screenshots using the existing CI gate.

No conflict with locks: DL-011 forbids automatic repetition, not a player-requested reread. No change to first-post wording, reveal timing or simulation scope.

## Evidence

Independent review found that both the normal month-navigation scroll and the late-trial December–March calendar path put the new entry under the sticky header. Both paths now subtract header height. The web/standalone regression measures the actual button/header positions after scrolling settles, before Playwright can auto-scroll a click target, including December→January.

Application revision: `ecfe8953d24a5e12a6427555feef37a231604c7c`. [Ver1 QA #165](https://github.com/kahokukoken/adhoms/actions/runs/36244758899): **58 passed / 0 failed in 36.7s**.

- Web and standalone: fresh first-April T-0WA opening, removal of the redundant title/hint and baseline card, April→May, saved-May reload, explicit nine-card transcript, and return to the same May state all passed.
- The transcript has no current-week badge or live practice controls. Tests compare the lightweight state, calendar, week, weights and filter before/after rereading and confirm May remains saved after another reload.
- Both month-scroll paths keep the entry below the sticky header before any automation-driven repositioning. Existing weekly navigation, practice, research, story and save checks also passed.
- Inspected the CI 390×844 standalone screenshots: May shows the visible “初日の会話を読む” button above the filters with no permanent title/instructions; the transcript visibly begins with T-0WA and the exact requested greeting. Its close control and bottom “現在のFEEDへ戻る” return preserve the live FEED.
- The local standalone is byte-identical to the tested CI artifact. HTML SHA-256: `f178fa1bc6af6012b7023043c6ed52739c494546fa4eda668262a6ff254cd976`. Local syntax checks, 25 inlined scripts and `git diff --check` passed.

No save is reset or migrated by this change. PR #17 remains draft; V1-14 human first-play acceptance and formal release remain open.
