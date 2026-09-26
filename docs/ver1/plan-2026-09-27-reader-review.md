# First-year reader review and consolidated correction

## Authority before implementation

- User 2026-09-27: content polish and production-owned checking; no further user proofreading requested during this pass.
- Locks: DL-001/002/003/005/006/007/009/010/013. No lock supersession, name resolution, new priority mechanic or reveal-order change.
- Requirements: V1-03/04/06/07/12/13/14. Existing source IDs, observation weights and creative choice flags remain.
- Sources retrieved 2026-09-27: [hub sections 21–25](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef), [Blueprint monthly flow / first year](https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee), [Character Bible](https://app.notion.com/p/3e0fbe78bd3b8111bf09ea99d1f060b3).
- Relevant individual originals: [Kiso](https://app.notion.com/p/3e0fbe78bd3b81d9981ac7aa0e884f6c), [BRINE](https://app.notion.com/p/3e0fbe78bd3b81ce98bde44c65dde0af), [Chihiro](https://app.notion.com/p/3e0fbe78bd3b8144bc53c45717300b91), [Gaku](https://app.notion.com/p/3e0fbe78bd3b8156a338d482f03a0064), [Minato](https://app.notion.com/p/3e0fbe78bd3b81faad84fd52b9eeaa8e), [Kubota](https://app.notion.com/p/3e0fbe78bd3b81008719d820ee592046), [Fujii](https://app.notion.com/p/3e0fbe78bd3b810391d7fbe947367a49), [Saeki](https://app.notion.com/p/3e0fbe78bd3b81c1ba0cf88d3ab965e3), [Miyashita](https://app.notion.com/p/3e0fbe78bd3b815998aef5b89724009e), [Mizuno](https://app.notion.com/p/3e0fbe78bd3b81e3a4dbf386314ae8f2).
- Q-01 surnames/instruments and Q-03 thresholds remain unresolved. Use only the agreed Toru identity and relationship; other members retain confirmed role attribution.

## Scope and independent input

Frozen source `8968cd4c`, HTML SHA-256 `4395d53ffea9d13ac1bca55c3b864702a5c61b2a4bfdfdd0fd2dcb41a316a7e8`.
Two independent AI readers received only the extracted first-year sequence (2029-04 through 2030-03), without source lore, known findings or each other's reports. Weekly route selected `live_test` and `shared_ingredients`; monthly route made no optional creation choice. This is a text review, not a human play-duration or enjoyment measurement. The extraction flattened closed quarterly details and supplied mock priority values, so feedback on that hidden control is not used as evidence of a normal-screen defect.

## Consolidated findings and decisions

| Finding | Decision and reason | Affected source / check |
| --- | --- | --- |
| Both readers: July/August and September/October replay the same completed or pending conversation. | Accept. Use short, dated continuations in the second month; retain unresolved choices and completed choice records. | `ver1-optional-creation-events.js`; both routes, save/reload, three choices plus autonomous later returns. |
| Monthly reader: Gaku and Ren appear as known people. Root also confirms missing Minato introduction. | Accept. Include skipped story beats in chronological month-end catch-up. Preserve each speaker's role in quotations. | `scripted-scenario.js`; April–June introductions, November mat, monthly route. |
| Weekly reader: already-delivered posts and small talk repeat immediately in meetings. | Accept. Default-visible catch-up contains important skipped observations; delivered quotations and daily small talk remain in a closed reference section. Keep meeting-entry week through reload. | `scripted-scenario.js`, `ver1-daily-session.js`; weeks 1/2/4, pending meeting reload and old-save fallback. |
| Monthly reader: April lunchbox and February oil delivery assume unseen prior posts. | Accept. Make the follow-up identify the shop/recipient without inserting a full old scene. | `ver1-weekly-scenes.js`, `ver1-observation-scenes.js`; read each follow-up on its own. |
| Weekly reader: staff repeatedly learn the same lesson. | Accept. April Saeki distinguishes a successful observation from a resolved case; January staff use the spring distinction to plan the next inquiry. | Same seasonal files; April and January feed-to-meeting readthrough; character originals. |
| Weekly reader: quarterly priority effect unclear. | Do not extend mechanics in this patch. Closed details and mock values were exposed by the packet; verify actual UI and preserve DL-006. | Record limitation; existing optional priority save test remains. |

## Verification and handoff

1. Reproduce missing introduction / repeated quotation on actual renderer; add focused browser regressions before editing behavior.
2. Apply the batch; compare stable IDs/weeks and creative branch returns; run syntax and standalone build checks.
3. Re-extract visible reading order with closed details respected; recheck changed scenes and downstream references, then focused independent review.
4. Run web/standalone browser gates and inspect 390×844 captures. Preserve all delivered frozen aliases.
5. Record exact source, CI result and matching standalone checksum. Draft PR only; V1-14 and later-year first-reader passes stay open. New handoff gives changes and minimum useful scene range, not another full-read request.
