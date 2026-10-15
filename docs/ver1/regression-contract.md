# DL-014 — Fixed regression contract

Authority: user 2026-09-28; [Work protocol](https://app.notion.com/p/3e9fbe78bd3b81ae97e3f02510788629), current hub. Additive to DL-001–013; no existing decision is superseded. Old tests, code, branches and Revision History are not authority to weaken these conditions.

## Invariants

- Cold Start is 2029 April, week 1, first FEED post T-0WA's introduction, document scroll 0. Initial rendering and resume do not count as a weekly advance.
- Do not put 木曽周弥 into the T-0WA introduction as a poster name. Header displays 木曽周弥, age (29 at start), 河北恒研所長 and 倶利伽羅町ADHOMS実証試験責任者.
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
| Narrative recurrence | `npm run test:sequence`: actual standalone rendered ordinary FEED across Years 2–5, same author/body detection plus source-bound independent narrative-review status, nonzero on either failure or unreviewed build. Not Human Acceptance |
| Delivery | `tests/ver1-delivery.spec.js`: frozen bytes, stale-source detection, generated HTML/manifest equality |

Report Logic, UI, Sequence, Save/Resume independently as PASS/FAIL. Human Acceptance remains 未実施 until actually performed. Do not use automated five-year completion as a completion claim or request another full user reread.

## DL-014 / 2〜5年目のSequence継続条件（ユーザー 2026-09-28）

同じ季節・生活習慣の再登場は許容する。前年の人物経験・関係・選択が次年の状況を変えることが条件。同文を言い換えても同じ問題→初回相談→同じ解決へ戻る場合はFAIL。

- `tests/ver1-sequence-continuity.spec.js`：実表示の選択/Memory/Relation、役割と年齢、当年調査、月末途中経過、復旧結果、保存/新規分離。
- `scripts/export-ver1-reading.mjs`：週送りと月末直行の実プレイ表示順を出力。独立初読担当に設計や既知の問題を渡さない。
- Exact repeat auditは補助ゲート。内部通読で人物・出来事・関係・選択の積み重ねを説明できることまで確認し、Human Acceptanceは未実施のまま別管理。
- 毎週スタッフ1人・返信2件という旧テストの固定配列は後年の合格条件ではない。通常6件を固定し、月内の複数話者・返信・スタッフ観測を維持する。場面に合わない研究員発言の挿入をテストのために強制しない（Work protocol「毎月同じ発言順・同じ論理展開へ退行しない」）。

- 改稿した別観測に旧保存IDを再利用しない。旧版の＋／−と調査の出典は、元の投稿者と本文のまま保持する。
- 内部読者の既知FAILを完全文一致監査のPASSで隠さない。`internal-review.json` とビルドのdigestが違う場合は未確認としてSequenceを停止する。

- DL-018/current Character Bible supersedes only the old provisional literal name 木曽朔 with fixed 木曽周弥（きそ・しゅうや）. Header position, age, role and first-post rules stay unchanged.

## DL-021（2026-10-14） — 新規起動の順序を後発ユーザー指示で更新

- **新規ゲームCold Start**：本編カレンダーの2029年4月ではなく、T-0WAによるSIP課題PD・石川県知事連名メール受信が**最初に可視・操作できるFEED**。防災訓練最終確認テスト1か月（4週・4会議）→国・県への報告書提出→審査と条件付き承認→初めて本編2029年4月を操作できる。
- 従来の本ファイル冒頭「Cold Start is 2029 April」の記述は**旧DL-014時点の履歴上の契約であり、現在の新規起動条件ではない**。その導入FEEDとDL-013のT-0WA挨拶は本編移行後の2029年4月初回FEEDとして保持。既存Ver1本文テストは、その本編画面を対象にする。
- 新規画面では本編のボタン、週・月送り、キーボード操作はできない。受信→スタッフ→毎週FEED・会議→提出→承認の順序をブラウザで検査。
- 正規の既存本編セーブと、チュートリアル途中保存は別ケースとして検査する。既存本編セーブを初回へ戻さず、旧任意開始offer状態だけを適切に移行する。

## DL-022 — スマホ確認版の旧セーブ不要・新規開始優先（2026-10-15）

- **公開版更新時の例外**：旧本編保存や任意スタート版の予備実証保存を引き継ぐ必要はない。新リリースを最初に開くと `adhoms.ver1.*` にある以前のゲーム状態を一度初期化し、必須の連名メールから開始する。更新後に生じた週次・会議・報告の進捗は再読込しても保持する。
- 関係のないlocalStorageキーは削除しない。旧本編が再開できることを「スマホ新規公開の合格条件」としない。代わりに旧データが新規FEEDを飛ばさないことを検証する。
