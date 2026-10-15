# 2026-09-27 所長端末ヘッダー

- User request supersedes the previous presentation of the full name in T-0WA's first FEED post. The post retains the exact greeting 「おはようございます、木曽所長。あなたの親愛なるAI、T-0WAです。」, then addresses the director by surname only.
- Header beside 河北恒研 shows 木曽朔, 29歳 / 河北恒研所長, 倶利伽羅町ADHOMS実証試験責任者. Age 29 is from the current Kiso character page. The old 「ADHOMS / 倶利伽羅町実証」 under the brand and the 「FIELD TERMINAL / VER1 / 倶利伽羅町実証」 below the population/生活 row are removed.
- Source `f558c6833f52fd75aa180f44f5f6becb047aa7ab`, draft PR #17. DL-003/013, V1-02/03/04/12/13. Existing unresolved character questions are unaffected.
- Ver1 QA run #186: **72 passed / 0 failed**, including new 320px and 375px no-overlap bounds, first FEED greeting, mobile/readability, save/resume and standalone routes. `node --check` and standalone build also succeeded.
- Standalone alias `ADHOMS-Ver1-Director-f558c683.html`, SHA-256 `dce3bc8173b890c19fc1467ad5f6c837600f4bb0c74b9bc33168c030e7f5f56f`. Earlier aliases retain their original bytes. V1-14 human experience is not accepted and later-year text has not been rereviewed in this change.
