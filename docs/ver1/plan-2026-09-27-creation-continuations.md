# BRINE・蕎麦の二回目の選択（2026-09-27）

- Locks: DL-003（スマホ縦FEED）、DL-007（人物と結果が先）、DL-009（T-0WAの私的由来は保持）、DL-010（BRINEのフルネーム／担当未確定）。競合なし。
- Sources checked 2026-09-27: [現行ハブ](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef) §§23–27, [Ver1 Blueprint](https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee), repo `docs/ver1/current-spec.md` V1-07/08/13. Q01/Q03 unresolved.
- User observed that July→August BRINE and September→October soba only offered a choice on the first encounter. This is reproducible: `renderOptionalCard()` used `selectedChoice(eventId)` for both months, so the second encounter showed the original decision's completed label without controls.
- V1-07/08/13: create distinct second-month choices from the continuation dialogue, save independent flags and memories without duplicating first-month decisions, and show their consequences in September/November FEED. First-month choices remain stable for old saves. Readers who skipped the first month may still choose at the second. If both are skipped, the autonomous world still progresses.
- Verify web and standalone, persisted reload, no duplicate memories, downstream branch, month-only route, mobile width. Human V1-14 remains open.
