# 2026-09-27 BRINE・蕎麦の二回目の選択

## Diagnosis and change

- The old UI used the first event's `selectedChoice` in both months. After the first decision, the August/October continuation showed 「記録済み」 and no controls. This explains the user's 10月 observation.
- August BRINE now offers distinct choices to compare two recorded endings, ask listeners at another small live show, or await the members' recording. October soba offers a kitchen service-flow check, return-order questions to regulars, or leaving the cooking to Murata and Chihiro.
- Second-stage flags, memories and relation changes are separate from the original July/September decision. A reader who skipped the first scene can still choose at the second; if both are skipped, autonomous progress remains. September/November FEED reflects the second decision, preceded by a concrete summary of the first decision when one exists. Stable earlier IDs and first-choice flags are retained.
- Source `e2e479d52e34218245faee6cb29cb2f47774a2fa`, draft PR #17. DL-003/007/009/010; V1-07/08/13. Q01/Q03 unchanged.

## Verification

- `node --check` on touched JS, assembled standalone build.
- Ver1 QA run #190: **75 passed / 0 failed**. Browser checks cover web and standalone July→August→September, September→October→November; independent second-stage selection and reload; first-month skip and late participation; old memories not duplicated; the week-four return posts at the actual arrival week.
- Standalone `ADHOMS-Ver1-Continuations-e2e479d5.html`, SHA-256 `2855b8d358a748003aab0effff93e9d80352ece3910080b835dec756ad869aa5`. Earlier aliases are unchanged.
- Independent AI first-reader difference review covered July/August BRINE and September/October soba plus their later outcomes. It found both second choices connected and no clear contradictions; it flagged the BRINE live-show handoff and the compare-takes note. Added an August recap confirming the first live show took place and changed the note to ask how both takes sounded, without selecting one. The revised scene passed QA #191. This functional pass is not V1-14 human experience acceptance; later-year narrative remains open.
