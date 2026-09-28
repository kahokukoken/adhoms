# DL-014 — Fixed regression contract

Authority: user 2026-09-28; [Work protocol](https://app.notion.com/p/3e9fbe78bd3b81ae97e3f02510788629), current hub. Additive to DL-001–013; no existing decision is superseded. Old tests, code, branches and Revision History are not authority to weaken these conditions.

## Invariants

- Cold Start is 2029 April, week 1, first FEED post T-0WA's introduction, document scroll 0. Initial rendering and resume do not count as a weekly advance.
- Do not put 木曽朔 into the T-0WA introduction as a poster name. Header displays 木曽朔, age (29 at start), 河北恒研所長 and 倶利伽羅町ADHOMS実証試験責任者.
- First-time readers can understand that lottery-selected residents have observation terminals.
- Preserve six ordinary additions for each normal weekly advance. Do not regress to two. Count story/history/research additions separately.
- Same text, same person and mechanically repeated scene structure are regressions. Exact repeated prose has an automated failing gate; semantic repetition still requires source-grounded reader review.
- Monthly meeting title and opening appear from the top. The meeting is independent of FEED layout and opens without inherited scroll, including resumed meetings.
- Month boundaries do not mix FEED history, meeting state, read/event state or scroll. Explicit weekly advances may move to the new week's first post.
- BRINE and 味噌だれつけ蕎麦 preserve initial choice → following month second choice → later result. Non-intervention remains possible.
- Cold Start and resume are separate test cases. Saved state does not leak into Cold Start; valid legacy saves migrate. Orphan, malformed and foreign-run fragments cannot become the new run. A stale tab cannot overwrite a replaced run.
- Do not restore `ADHOMS / 倶利伽羅町実証`, `FIELD TERMINAL VER1 / 倶利伽羅町実証`, `初日の会話を読む` or its transcript. Do not reinsert `ADHOMSとは` after the meeting.
- Frozen delivered HTML aliases remain immutable. Current delivery must match the tested source digest and HTML digest.

## Required tests

| Contract | Executable evidence |
| --- | --- |
| Cold Start | `tests/ver1-regression-contract.spec.js`: empty context, reset from saved/scrolled May, missing/malformed primary, foreign fragments; web and standalone |
| Weekly Density | Same file: April increments recorded by week, exact six ordinary posts and stable prior IDs; `ver1-weekly-conversations.spec.js`: all 60 months |
| Meeting Anchor | Same file: bottom of long FEED → title, scrolled meeting → reload, May meeting; viewport geometry and screenshots |
| Month Boundary | Same file: week/meeting/month/next week navigation race, prior reactions and completed meeting, no onboarding repeat; foreign recovery at Year 5 July; existing five-year boundary suite covers Jan/March/August |
| Fresh vs Resume | Same file: saved week/weight, legacy migration through two reloads, independent new run, stale tab; existing quarterly draft/final-event persistence |
| Optional Continuity | `ver1-creation-continuity.spec.js`: July choice → August second choice + reload → September result; September choice → October second choice + reload → November result, flags and unique memories |
| Narrative recurrence | `npm run test:sequence`: actual standalone rendered ordinary FEED across Years 2–5, same author/body detection, nonzero on failure. Does not claim semantic or human acceptance |
| Delivery | `tests/ver1-delivery.spec.js`: frozen bytes, stale-source detection, generated HTML/manifest equality |

Report Logic, UI, Sequence, Save/Resume independently as PASS/FAIL. Human Acceptance remains 未実施 until actually performed. Do not use automated five-year completion as a completion claim or request another full user reread.
