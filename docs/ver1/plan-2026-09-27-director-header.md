# 所長端末のヘッダー（2026-09-27）

- Locks: DL-003（スマートフォン縦FEED）、DL-013（T-0WA初回投稿の冒頭固定）。今回の明示指示が、前版のT-0WA末尾フルネームだけを上書きする。挨拶そのものは維持。
- Sources fetched 2026-09-27: [現行ハブ](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef) §26、[木曽 朔（仮）個別ページ](https://app.notion.com/p/3e0fbe78bd3b81d9981ac7aa0e884f6c)「Ver1開始時 29歳」「河北恒研 初代所長」、[Character Bible](https://app.notion.com/p/3e0fbe78bd3b8111bf09ea99d1f060b3)。木曽の名前は仮採用のまま、現在のゲーム内表記として使用。
- Requirements: V1-02/03/04/12/13。Q01/Q03に変更なし。
- Visible changes: `index.html` header displays 河北恒研 beside 木曽朔 / 29歳・河北恒研所長 / 倶利伽羅町ADHOMS実証試験責任者. Remove old brand subline and FIELD TERMINAL line. `scripted-scenario.js` first T-0WA post returns to surname address only. `tests/playtest.spec.js` checks both visible header and absent duplicate.
- Verify 320px and 375px portrait layout, first post, save/reload, standalone, preserved earlier alias. Human first-read quality remains V1-14.
