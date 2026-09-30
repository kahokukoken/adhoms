# ADHOMS Ver1 Decision Locks

This file is a **change barrier**, not a design summary.

A decision marked `locked` is presumed binding in every implementation task. It is not superseded by:
- an older branch or prototype;
- a framework/default UI convention;
- an existing test that encodes old behavior;
- an assistant inference such as “X-like means newest-first”;
- implementation convenience;
- a later document that merely omits the decision.

A lock changes only when the user explicitly changes that decision. When that happens:
1. mark the old lock `superseded`;
2. name the replacement lock;
3. update Notion first;
4. update the machine-readable registry and affected tests in the same implementation unit.

Machine-readable source: [decision-locks.json](decision-locks.json).

## Mandatory pre-change check

Before editing behavior, narrative, UI, data shape, or copy:
1. Read `docs/ver1/decision-locks.json`.
2. List the lock IDs touched by the proposed change.
3. If the proposed change conflicts with a lock, **stop implementation**. Do not reinterpret the lock. Resolve it only from a new explicit user decision.
4. If an old test conflicts with a lock, the test is stale and must be updated; the lock does not bend to the test.
5. Add or update a regression check for any lock that can be machine-tested.

## Current locks

| ID | Area | Binding decision |
| --- | --- | --- |
| DL-001 | FEED reading order | Downward chronological reading; new weekly observations append below already-read content. Startup and saved-week restoration must not trigger the new-week scroll. |
| DL-002 | FEED post length | Variable by speaker/content; no uniform two-line/short-post constraint. |
| DL-003 | UI direction | Portrait smartphone, one-column FEED remains the primary direction. |
| DL-004 | Follow | No Follow mechanic in current Ver1. |
| DL-005 | +/- | Internal observation weight, not popularity/approval. |
| DL-006 | Monthly flow | No mandatory monthly sliders. |
| DL-007 | Scope | Story/characters/causality first, lightweight simulation. |
| DL-008 | Ending order | Admin review → private TOWA/Kiso → Directive 4 → epilogue. |
| DL-009 | T-0WA reveal | Full naming/voice origin remains hidden in Ver1. |
| DL-010 | BRINE names | Surname/instrument conflict remains unresolved. User 2026-09-27 / hub section 23 requires individual dialogue: use the shared given name 透 and documented university/repair relationship without choosing either disputed full-name/role set. BRINE is the band name. |
| DL-011 | Staff FEED onboarding | Superseded by DL-012 on 2026-09-26, user instruction / hub section 21. The separate opening explanation is retired. |
| DL-012 | FEED-only onboarding | Superseded by DL-013 on 2026-09-26, user instruction / hub section 22. The later-month replay control is retired. |
| DL-013 | FEED-only onboarding without replay | All opening explanation is delivered in the first two T-0WA posts, beginning with the user's exact greeting, then staff conversation before residents. No standalone prelude or permanent ADHOMS explanation. Practice stays internal and does not queue research; no mandatory clicks or repeats in later live months/years. |

DL-013 removes the “初日の会話を読む” control and its transcript. Later-month saves retain their progress without replaying the first-day conversation or inserting it into the live monthly FEED. The redundant permanent SOCIAL FEED title/weight instructions and recurring ADHOMS year-context-only cards stay removed.


## Why this exists

The project already suffered a regression where “X-like one-column FEED” was incorrectly generalized into “newest-first FEED” and where authored posts were compressed into a uniformly short style, despite earlier decisions to read downward and allow long posts. This registry exists so omissions and familiar UI conventions cannot silently erase a decided premise.

## DL-014 — 初期化・週次・会議・保存の固定回帰契約

ユーザー2026-09-28の明示指示。既存ロックを置換せず、[固定契約とテスト対応](regression-contract.md)を追加する。Cold Start、通常週6件、会議冒頭、月境界、新規／再開の分離、BRINE／蕎麦二段階、削除要素の非復活、機械的反復の検出を固定。Logic・UI・Sequence・Save/Resumeを別判定し、Human Acceptanceは自動完走で代替しない。

### DL-014のSequence具体化 — 最新ユーザー指示 2026-09-28
2〜5年目は週送り／月末直行の両方で、前年の経験・年齢/役割・関係・施策/Memoryが積み重なること。全文ユニークだけではPASSにしない。同季節の再訪は許容し、初回相談・同じ問題/結論の再演はFAIL。独立初読には設計資料や既知の問題を渡さず、ゲーム表示順だけを渡す。Human Acceptanceは内部AIレビューと区別して未実施を維持する。


## DL-015 — ADHOMS側の人物名変更（2026-09-30）

ユーザーの明示指示により、現行ADHOMS Ver1では以下を正本名とする。

- **高倉 千尋 → 高倉 真知**
- **柴垣 岳 → 柴垣 晃生**

旧名は現行の本文・UI・テスト・人物正本へ復活させない。過去の固定HTMLや過去時点の検証記録は履歴証拠として旧名のまま保持してよい。

保存互換のため、内部ID `chihiro` / `gaku` は原則変更しない。内部IDを表示名とみなさない。

**晃生の読みはこの指示では未確定。** 読み仮名を推測で追加しない。
