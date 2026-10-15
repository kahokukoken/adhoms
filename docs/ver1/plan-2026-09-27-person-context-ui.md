# 人物導入と会議冒頭の修正（2026-09-27）

- Decision Locks: DL-001（意図しないスクロール禁止）、DL-002（投稿の長さ）、DL-003（スマートフォン縦表示）、DL-007（物語優先）、DL-013（T-0WAの初回FEED）。上書きなし。
- Sources, retrieved 2026-09-27: [現行ハブ](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef) §§23–25; [木曽朔（仮）](https://app.notion.com/p/3e0fbe78bd3b81d9981ac7aa0e884f6c); [世界観 Bible](https://app.notion.com/p/3e0fbe78bd3b8111bf09ea99d1f060b3); [Ver1 Blueprint](https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee). Latest explicit user feedback (this turn) takes precedence.
- Requirements: V1-02/03/04/06/12/13/14. Unresolved name/relationship questions Q01/Q03 remain; the existing player-visible 「木曽 朔」 and provisional source justify displaying 木曽朔 in the initial greeting, without settling other lore.
- `scripted-scenario.js` opening and monthly thread: full director name before the first 「朔」, resident role on first meeting mention. Validate first April, May, June, first-year monthly dialogue, and saved month opening.
- `scripted-scenario.js` FEED card/detail/meeting: keep name and age/role, remove redundant year/week/category/「今月の主要観測」 line and internal meeting eyebrow. Keep global month context for progression. Verify phone width and standalone.
- `meeting-scroll-fix.js`: reset the actual scroll container `.meetingCard` and stop scrolling the prelude into view. Regression in `tests/meeting-scroll.spec.js`, including second month. Preserve DL-001 feed position.
- Review scope: this turn's fixes only. Prior first-year narrative review remains documented separately; later years and human experience acceptance are open.
