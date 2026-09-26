# Duplicate research and opening replay removal

## Pre-change authority and scope

- User 2026-09-26 23:55 JST reports identical FEED reports also repeated in meetings and explicitly removes “初日の会話を読む”. Screenshot: three identical May transport reports.
- Locks: DL-001/003/005; DL-012 superseded by **DL-013**, recorded in Notion section 22 before implementation. Keep the first-April T-0WA/staff conversation; remove later-month replay. No change to reveal boundaries, voices, Q-01 or Q-03.
- Sources retrieved 2026-09-26: [current hub](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef), sections 16 and 18–22; [Blueprint](https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee), FEED/monthly observation and first-year UI. No new character text is needed.
- Requirements: V1-02/04 opening, V1-03 FEED, V1-11 observation/research, V1-12 mobile, V1-13 save/resume. V1-14 remains human experience review. No unresolved conflict for this change.

## Reproduction and implementation plan

The real authored action, renderer and meeting functions reproduce the screenshot: adding + to `scenario-0-0`, `scenario-0-1` and `scenario-0-2` queues three identical investigations. Advancing to May produces three FEED reports and three copies in the meeting. Investigation identity is incorrectly the source post ID; meeting deduplication by report ID cannot catch it.

1. Aggregate identical research for the same topic and observation period, retaining all source post IDs and individual observation weights. Different topics, results or periods remain separate.
2. Normalize existing saved duplicates, retain completion history and migrate report weights/bookmarks to the surviving report. Reconcile generated report cards so already-rendered duplicates cannot remain.
3. Remove the replay button, handler, transcript-only rendering and styles. Preserve first-April onboarding and saved progress.
4. Verify multiple source observations, old pending/completed saves, FEED/meeting uniqueness, distinct investigations, ordinary saves, mobile and standalone. Update the matrix and draft PR with actual evidence.

Status: implementation and functional verification pending.
