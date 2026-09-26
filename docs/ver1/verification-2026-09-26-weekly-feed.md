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

Status: implementation in progress; no verification claim yet.
