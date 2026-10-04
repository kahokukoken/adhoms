# Preflight — 起動・週次FEED・会議・保存の回帰防止

作成: 2026-09-28。実装変更前。基準コード: `b0ade054063706425769b8db18f5062c55f92b78` (PR #17)。
対象: DL-001/002/003/005/006/007/009/010/013、V1-02/03/04/07/08/12/13/14。

## 1. 目的
新規開始では2029年4月のT-0WAから下へ読み、週ごとの声を読み進め、月末会議の冒頭を読んで翌月へ進めること。保存再開は進行と選択を保持し、Cold Startへ残留状態を混ぜない。修正済みソースと配布版を取り違えない。

## 2. 再現手順
修正前コードと配布HTMLを別々に検査する。空のブラウザコンテキストで起動→第2/3/4週→月末→5月。各操作の前後に年月・週・投稿ID/本文・増分・window.scrollY・会議の矩形/scrollTop・保存を記録する。途中位置からリロード、保存を残した別タブ、明示リセット、lightstate欠損/破損かつdaily残留、週送り直後の会議/月送りも独立ケースにする。7月BRINE→8月二段階目→9月結果、9月蕎麦→10月二段階目→11月結果を通常操作と再読込で通す。未再現の症状は未再現と記録し、失敗を捏造しない。

## 3. 正本根拠
2026-09-28原文取得:
- [現行ハブ](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef): §1–8、16–29。§27が§26の氏名表示を置換。§22のDL-013が読み返しボタンを廃止。§21の6投稿を今回ユーザーが固定契約として明示。
- [Work開発プロトコルv1.0](https://app.notion.com/p/3e9fbe78bd3b81ae97e3f02510788629): 全文、特に§2–7、9–10。
- [Blueprint](https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee): 軽量化、月次観測、Year1/任意イベント、Relation/Memory持越し。
- [Character Bible](https://app.notion.com/p/3e0fbe78bd3b8111bf09ea99d1f060b3)、[木曽](https://app.notion.com/p/3e0fbe78bd3b81d9981ac7aa0e884f6c)、[T-0WA](https://app.notion.com/p/3e0fbe78bd3b8169b320f542aa4de217)、[千尋](https://app.notion.com/p/3e0fbe78bd3b8144bc53c45717300b91)、[BRINE](https://app.notion.com/p/3e0fbe78bd3b81ce98bde44c65dde0af): 開始29歳、口調、固定関係、私的開示の境界。Q-01の姓/楽器、Q-03の閾値は確定しない。
- GitHub `AGENTS.md`、`docs/ver1/decision-locks.json`、`decision-locks.md`、`current-spec.md`を原文確認。履歴見出しと古い状態表は現行仕様に優先しない。
- 本ターンのユーザー指示の全Regression Contractが最優先。

## 4. 現状実装
- `index.html`: S初期値、advanceWeek/toMonthEnd/finishMeeting/nextMonth、fixed会議、旧基礎レンダラ。後続スクリプトが差し替える構造。
- `scripted-scenario.js`: seedScenarioPosts/monthPosts/scriptedFeed、pendingWeekScroll、rememberMeetingEntry/scriptedMeeting。週次素材は`ver1-weekly-scenes.js`。既存通常週は6投稿設計。
- `ver1-ui-bridge.js`: lightstate読込とカレンダー同期、finalsession、reset、nextMonthのラッパー。
- `ver1-daily-session.js`: daily.v1へ週・反応・既読会議・調査・重点・会議途中を保存。カレンダー不一致でも一部mapを復元する。lightstateが新規か保存復帰かの識別がない。
- `meeting-scroll-fix.js`: openMeeting後の2フレームで各scrollTopを0へ。ブラウザ自体の文書スクロール復元は制御していない。
- `ver1-calendar-bridge.js`: 5年8月と復旧期間の遷移。`ver1-optional-creation-events.js`: 二段階選択とMemory。
- `scripts/build-standalone.mjs`: scriptをinline化。dist全消去が固定配布版を消す可能性。前回は古いActionsリンクを再案内したことを確認済み。

## 5. 影響範囲
起動→週→会議→翌月→保存復帰の全経路。カレンダーの主従、保存の孤立断片、遅延スクロール、会議のoverflow/fixed位置、任意イベントの初回/追跡/結果。共通月送りを使う四半期・年度境界・5年8月にも隣接確認。保存IDや既存固定HTMLは保全。後年の同文反復は既知未修正として別のSequence検査で検出し、数値テストで隠さない。

## 6. 不変条件
Cold Start=2029/04第1週・先頭T-0WA・抽選端末説明・scrollY=0。木曽朔/29歳/両肩書はヘッダー、T-0WA導入へフルネームを戻さない。通常週6投稿を維持、既存ID順と多様な文長、反応と調査を保持。会議タイトルを最初から表示、FEEDから独立、再開も冒頭。月跨ぎで既読/選択を失わず前月会議を残さない。BRINE/蕎麦の2段階と不参加時の自律進行を保持。廃止ラベル/読み返し/ADHOMSとは/毎月スライダー/Followを復活させない。新規と復帰を区別し、保存漏れを防ぐ。機械的同文反復をSequenceの失敗として記録。未確定名/終幕/数値仕様を決めない。

## 7. 検証方法
- 修正前に6つの固定契約テストを作り実行。新規と復帰は別テスト。実配布HTMLとWeb双方、390×844とデスクトップで状態/矩形を採取する。
- Cold Start / Weekly Density / Meeting Anchor / Month Boundary / Fresh vs Resume / Optional Continuity。既存の週次・既読・四半期・研究・豪雨境界テストを共有状態への影響に絞って併用。
- 意図的に保存を欠損させるテストと、底まで読んだ後のreload/resetを追加。既存の「reload前にscrollTo(0)する」テストだけに頼らない。
- ブラウザで冒頭、追加投稿、会議の開いた瞬間、5月、保存会議、二段階イベントを画面と表示順で確認。人間の受入とは区別。
- buildの固定版保全と配布ソースrevision/hash一致を検証。渡すファイルはテストしたものと同一にする。
- Logic / UI / Sequence / Save/Resumeを別判定。Human Acceptanceは未実施。後年反復を未修正のままPASSにしない。全編再読を依頼しない。

## 実行順
1. 修正前の固定契約実行・失敗の原因分類。
2. 失敗を作った状態の所有者で最小修正、契約と隣接テスト再実行。
3. 配布経路と規則へ再発防止を組み込み、独立コードレビューと実画面検査。
4. Notion/GitHubへ原因・証拠・残件を記録、固定配布物と区分別結果を報告。

## 実行中に確認した追加範囲

GitHub現行headは7c74987d（AGENTSのWorkプロトコル追記のみ）。原文を再確認し保全。独立レビューで同じ保存関数の旧タブ書込、終盤の復旧記録、不正Memoryを追加再現し、契約範囲内で修正した。最新ユーザー契約をDL-014として追記。結果はverification-2026-09-28-state-regression.mdを参照。
