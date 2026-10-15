# FEED-only opening and weekly conversations — 2026-09-26

## Authority and scope recorded before implementation

- Locks: DL-001/002/003/005/007/009; **DL-011 superseded by DL-012**. User 2026-09-26 22:29 JST explicitly moves the remaining opening description into T-0WA FEED, optionally split, and requests more weekly posts. Notion hub section 21 records this before code changes.
- Requirements: V1-02/03/04/11/12/13. Initial plan: two T-0WA cards, then existing staff conversation; ordinary weekly arrivals rise from two to six across all 12 months (144 additions). Six is an implementation target, not a permanent user-locked number.
- [Hub](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef): sections 16–21, updated instruction and save/replay behavior.
- [Blueprint](https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee): lightweight scope, observations, optional weekly reading, daily-life attachment.
- [Character Bible](https://app.notion.com/p/3e0fbe78bd3b8111bf09ea99d1f060b3): roles and reveal boundaries.
- [T-0WA](https://app.notion.com/p/3e0fbe78bd3b8169b320f542aa4de217), [Fujii](https://app.notion.com/p/3e0fbe78bd3b810391d7fbe947367a49), [Miyashita](https://app.notion.com/p/3e0fbe78bd3b815998aef5b89724009e), [Mizuno](https://app.notion.com/p/3e0fbe78bd3b81e3a4dbf386314ae8f2), [Saeki](https://app.notion.com/p/3e0fbe78bd3b81c1ba0cf88d3ab965e3): individual voices and work responsibilities.
- Retrieved 2026-09-26. Q-01 BRINE names and Q-03 continuation thresholds remain unresolved and outside this change; no new character identities, private origin or ending decisions.

## Implementation and verification plan

1. Remove the independent prelude scripts. Preserve all explanatory information across the two T-0WA cards and existing staff tutorial. Keep existing onboarding IDs and the read-only saved-month transcript.
2. Add seasonal weekly dialogue using explicit new IDs, appended after legacy seed rows so saved weights retain their meaning. Daily small talk must not start unrelated topic research; substantive observation remains researchable.
3. Check all month/week arrival counts, replies, identity stability, chronological appends, save/reload, month-end summary and 390×844 readability on web and standalone. Review generated UI screenshots and dialogue in display order.
4. Record actual CI/artifact evidence. V1-14 pacing/attachment remains human experience review. Keep PR #17 draft; no merge or release.

## Delivered changes and mapping

| Locks / requirements | Source and visible behavior | Evidence |
| --- | --- | --- |
| DL-012 / V1-02・04 | `scripted-scenario.js`; two opening T-0WA cards followed by staff conversation; ten-card read-only replay. Removed `opening-flow.js` and `feed-prelude-visibility.js`, their script tags and obsolete style selectors. | Web/standalone entry and saved-May replay; no standalone prelude; exact greeting, trial length, lottery and incomplete-observation information. |
| DL-001・002・007 / V1-03・04 | `ver1/ver1-weekly-scenes.js`; 144 additions with short daily exchanges, longer field notes and replies, four extra ordinary posts per week advance. | All 60 months / 180 weekly groups have six ordinary posts, at least four speakers, at least two replies and a staff observation. Special story/history/research beats remain additional. |
| DL-005 / V1-11・13 | Explicit new IDs appended after legacy rows; everyday and terminal-guidance posts do not trigger unrelated research. | 736 legacy rows retain ID/text/week in local comparison; browser tests preserve old/new weights and research across reload. |
| DL-003 / V1-12 | Existing one-column mobile layout; no new permanent explanation panel. | 390×844 screenshots: T-0WA first/second posts, staff follow-up, saved-May entry and replay, monthly conversation; no horizontal overflow in changed flow. |

## Verification

- Application changes: `5576c711cce92348e4008a72e7b01e9ee37f3d38`.
- Verified revision including scroll-test settlement: `bd240112701f283c12ebff0e0e535f4255324aa5`.
- [Ver1 QA #169](https://github.com/kahokukoken/adhoms/actions/runs/36246948998): **62 passed / 0 failed**, 1.1m, job 108417793341.
- [Standalone artifact](https://github.com/kahokukoken/adhoms/actions/runs/36246948998/artifacts/10907538566) and [QA evidence](https://github.com/kahokukoken/adhoms/actions/runs/36246948998/artifacts/10907369150) downloaded. HTML and README match the local distribution byte for byte.
- Delivered alias: `dist/ADHOMS-Ver1-Weekly-bd240112.html`, identical to `dist/ADHOMS-Ver1.html`.
- HTML SHA-256: `9e6a3561ed1f385f2a7c3efefd8d4223e8606516ae04168b0e6ea600390f94d0`.
- Inline JS syntax, script/test syntax, duplicate-body and stable-ID checks passed. Build contains no external scripts or prelude code.
- Independent read-only review found one minor topic-routing issue: Saeki's terminal-instruction follow-up incorrectly inherited transport research. Marked it non-researchable and verified that ＋ leaves the research queue unchanged. No Critical/Important findings remained.
- CI #167: 61 passed / 1 failed; the saved-week reload check observed scrollY 79. CI #168 added an explicit pre-reload position check and isolated the failure **before reload** (60 passed / 2 failed, scrollY 64). The test was interrupting a long smooth weekly jump after a fixed 600ms wait. It now waits for the actual `scrollend`, returns to zero and confirms that input before reloading. The original post-reload top-position assertion is unchanged; #169 passed both web and standalone. No application startup behavior was changed to mask this test setup issue.

## Review limits

The first-day conversation and added seasonal threads were read in display order against character roles; screenshots establish readability and the presence of the requested FEED. Seasonal additions recur in later years alongside separate story/history variations. This is not a claim of bespoke text for every person in all five years. V1-14 first-play pacing, attachment and narrative acceptance remain human review. PR #17 stays draft; no merge or formal release.
