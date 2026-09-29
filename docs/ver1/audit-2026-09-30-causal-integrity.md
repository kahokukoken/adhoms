# ADHOMS Ver1 — 機械的達成／因果整合監査 2026-09-30

対象：draft PR #17 `feature/ver1-light-sim`、head `d4297605c0d1617c5f03afadce0cb88a990aada6`。
目的：和界転生で発生した「測定可能な代理条件を満たしたが、本来の意図・連続性・作品体験が失われる」型の失敗が、ADHOMS Ver1にも発生していないかを逆向きに監査する。

本監査は Logic / UI / Sequence / Save-Resume / Human Acceptance の既存判定を置換しない。別軸として、**ユーザー意図 → canonical state/history → perception → action → player-visible narrative → next state** が実際に一本の因果鎖になっているかを確認する。

## 結論

**機械的達成／因果整合監査：FAIL。**

現在のVer1は「状態が存在し、選択が一部の後年表示・手札・最終豪雨へ効く」段階までは到達しているため、単なる固定ノベルではない。一方で、日常の48か月継続本文の主導権は canonical state ではなく authored month packet 側にあり、主要人物の5年間の履歴の大半はモデル状態ではなく手書き本文で保持されている。

さらに、画面上で変動する旧 `S` 状態と、Ver1の選択・最終豪雨で使う `ADHOMS_LIGHT_STATE` が並存しており、同じ「町の状態」として一貫していない。これは物語品質だけではなく、プレイヤーが観測している値と実際の因果計算が異なる問題である。

追加の後年本文修正を先に続けず、下記の構造問題を解消してからSequenceの残件へ戻る。

## 1. CRITICAL — 画面状態と因果状態が二重化している

### 実装
旧UIの `S` は以下を独自に保持する。

- `pop`
- `life`
- `fisc`
- `trust`
- `activity`
- `resilience`
- `values`

`index.html` の `drift()` は、週・月進行のたびに `S.values` と乱数からこれらを更新する。

一方、Ver1の主要イベント・後年副作用・協力手札・最終豪雨は `ADHOMS_LIGHT_STATE` を使用する。

`ver1-ui-bridge.js` の `syncLegacy()` が light state から旧UIへ同期するのは主に `trust` と `resilience` であり、人口・暮らし・財政・活力は同じcanonical stateから導出されていない。しかも旧 `drift()` はその後も独自に値を動かす。

最終豪雨の `createSession()` / `finalize()` は `ADHOMS_LIGHT_STATE` を使用し、旧UIの `S.life` / `S.fisc` / `S.pop` / `S.activity` を使用しない。

### 判定
プレイヤーがヘッダーで見ている「暮らし・財政・人口等」と、後の因果・最終評価を決めるcanonical stateが一致していない。

これは **CRITICAL**。同じ画面上で二つの世界状態を並存させたまま、片方を観測値、もう片方を結果計算に使っている。

### 必要な修正
active Ver1のstate authorityを一つにする。

既存正本に根拠がない新しい人口・財政計算を発明しない。旧表示値をcanonical stateへ正式に接続できない場合は、少なくとも「実際の因果状態」と誤認させる可変値として残さない。どの表示を残すかは現行Blueprint/正本から決める。

## 2. CRITICAL — 主要人物の状態がcanonical modelに存在しない

Implementation Blueprintは、実装上「地区・属性・主要人物・主要組織単位の状態値を中心」にする方針を持つ。

しかし `ver1-state.js` の初期状態は以下で構成される。

- town
- districts
- relations
- memories
- flags
- disaster

5年間を通して追跡する主要人物のstateは存在しない。人物別の年齢・役割・生活履歴の多くは `ver1-continuity-year2.js`〜`year5.js` の本文と `profile()` の年度計算で表現される。

最終豪雨でのみ `createSession()` 内に千尋・岳・TOWAの `risk/status` が一時的に作られるが、これは過去4年間の個人履歴stateではない。

### 判定
人物が「前年を生きた結果」を、モデルが保持して本文へ投影しているのではなく、作者が翌年本文へ書き継いでいる部分が大きい。

和界転生で問題になった「DB/設定は存在するが、作品の連続性は別途人力で再現している」構造と同型の危険がある。

## 3. CRITICAL — 48か月の継続本文はstate-drivenよりauthored-driven

後年4ファイルを静的集計した。

| 対象 | 固有の通常投稿ID | 直接的なstate placeholder |
| --- | ---: | ---: |
| Year 2 | 288 | 5 |
| Year 3 | 288 | 5 |
| Year 4 | 288 | 7 |
| Year 5 | 288 | 14 |
| 合計 | **1,152** | **31** |

placeholderは `{{flood}}`、`{{wildlife}}`、`{{snow}}`、`{{strategy}}`、`{{cooperation}}`、`{{brine}}`、`{{soba}}`、`{{recovery}}` 等。

この数だけで動的比率を厳密に表すものではない。別途history/research行、プロフィール、終盤計算もstate依存する。ただし通常24投稿/月の骨格は `packet()` が fiscal year + month だけで選び、主要本文の大部分は固定されている。

### 判定
現在は「stateから物語が出る」より、
**年×月の物語を先に決め、その一部へstate履歴を差し込む**
方式が支配的。

DL-007の「story/characters/causality first, lightweight simulation」自体には反しない。しかしこの比重のまま本文を増やし続けると、ADHOMSが物語を生成する基盤ではなく「台本へ過去選択を注釈する装置」になる。

したがって、これ以上の年別本文追加をSequence修正の主手段にしない。

## 4. HIGH — Perception → Action の因果が弱い

FEEDの＋は観測重みであり、研究対象なら調査をqueueする。ここは正本どおり。

ただし現在の研究結果はtopicごとのauthored resultを基本とし、後年もpacket内のauthored researchを使用する。調査結果を受けたこと自体は `ADHOMS_LIGHT_STATE` の世界状態や、後の主要意思決定の選択可能性へ原則接続しない。

Year 2の冠水・獣害・雪害イベントは固定月で提示され、プレイヤーがそれ以前に何を＋で追ったかに関係なく、同じ選択肢へ到達する。

### 判定
「誰の声を重く見て何を調べたか」はプレイヤーのPerceptionを変えるが、そのPerceptionがActionの情報条件へ十分接続されていない。

観測しなくても同じ判断画面へ到達できるため、ADHOMSの Perception → Action の鎖がゲーム上では弱い。

新しいゲームメカニクスを勝手に追加するのではなく、Blueprintの「FEED・観測端末・行政資料・現地調査から状態を読む」「調査対象／施策候補を登録」「同じ通知でも読む／読まない・理解／誤解が発生」という既存方針との実装差として扱う。

## 5. HIGH — 日常FEEDで起きたことがnext stateへ戻らない

年別本文には、

- 誰が負担を引き受けた
- 断れるようになった
- 引継ぎが成立／未成立
- 送迎・店舗・訪問・地域協力の条件が変わった

など、多数の生活上の変化が描かれる。

しかし通常FEEDを読む／月次会議を終えるだけでは、それらの多くは `ADHOMS_LIGHT_STATE` のRelation/Memory/地区負担等へ書き戻されない。

そのため、

canonical state → 本文

の参照は一部存在するが、

本文で実際に起きた出来事 → canonical state → 次の出来事

の閉ループになっていない箇所が多い。

現在の翌年本文が前年度を覚えて見えるのは、モデルが覚えているからではなく、翌年のauthored packetに続きを書いたため、というケースがある。

## 6. CONDITIONAL PASS — 年2選択→年3副作用→年4手札→最終豪雨は実際に因果接続されている

ここは機械的な見せかけだけではない。

- Year 2の選択はlight stateへdelta/Memory/flagを記録
- Year 3で選択別副作用をstateへ適用
- Year 4でRelation/Burden Memoryから協力提案・抵抗を算出
- 関係値等から利用可能Emergency Commandを決定
- 最終豪雨で過去stateから避難遅延、経路寿命、物流時間、避難所容量を導出
- 最終評価へ反映

という経路が実装されている。

したがって「全てが固定台本」という判定は誤り。

ただし `SIDE_EFFECT_RULES` やYear 4 strategyの効果はかなり固定的で、例えばrepairは町全体trust/legitimacyを上げ、全地区のburdenを一括で減らす。これはVer1軽量モデルとして許容できる簡略化だが、創発挙動そのものとは区別する。

## 7. PASS — Workの検査プロトコルは今回、誤PASSを防いでいる

現在のSequence CIは全文一致0件だけではPASSにならない。source digestに紐づいた独立reader reviewがFAILならSequenceもFAILになる。

このため、1,152投稿を全文ユニークにした後でも「個人危機→復旧生活の断絶」を検出し、完成扱いしていない。

ここは和界転生時の失敗と異なる重要な防波堤。

問題は検査がないことではなく、**検査で発見した断絶を、さらに大量のauthored prose追加だけで埋めると再び同型問題へ戻る**点にある。

## 8. Q-05は現在のまま未確定で正しい

千尋・岳の豪雨当日の具体事故、負傷／取り残され、家業／避難／家族危機、九月→翌三月の確定状態は正本未確定。

現在の `people.status` は避難上のrisk分類であり、負傷・生存・死亡・治療・回復を意味しない。

Workがriskから個別結果を捏造せずSequence FAILを維持した判断は正しい。

## 次の作業順序

### A. 新しい後年本文の追加を一旦止める
Q-05以外のSequence FAILを、文章量で埋めない。

### B. active Ver1のstate authorityを一本化する
`S` と `ADHOMS_LIGHT_STATE` の責務を洗い出し、プレイヤー表示・判断・最終評価が同じcanonical stateから説明できるようにする。

### C. 「主要人物／主要組織の履歴」がどこに存在すべきか正本照合
専用の感情・性格パラメータを増やすのではなく、既存のEntity / Relation / Memory原則とVer1軽量範囲で、人物の事実上の履歴をcanonical state側で保持できる最小構造を定める。

### D. authored packetを「結果の正本」から「場面骨格」へ下げる
固定してよい到達点・人物・季節・会話目的はauthoredで維持する。
一方、過去の選択、現在のRelation/Memory、負担、利用可能資源、未解決状態に依存する事実を、根拠なしに本文へ直書きしない。

### E. Perception→Actionの接続を監査・補強
＋／調査をしたかどうかで、少なくとも「プレイヤーが判断時に知っている根拠・不確実性」が変わることを既存正本の範囲で成立させる。新規メカニクスは正本根拠なしに追加しない。

### F. 因果整合テストを追加
最低限、以下を次の実装前ゲートにする。

1. **Single State Authority Test**
   プレイヤー表示値と主要判断／最終評価が別々の可変stateから出ていない。

2. **Narrative Provenance Test**
   state依存の事実を本文が断定する場合、対応するflag/Memory/Relation/結果が存在する。固定Story Spineの到達点は別扱い。

3. **Counterfactual Continuity Test**
   同年月で異なる履歴を与えた時、意味上変わるべき場面が単語差し替えだけでなく因果的に変わる。

4. **Perception-to-Decision Test**
   調査の有無が、既存仕様で期待される判断材料・不確実性へ反映される。

5. **Character History Authority Test**
   年齢以外の役割・過去経験・負担・関係の変化を「年度番号だけ」で確定しない。状態／履歴または固定正本に根拠を持つ。

6. **No Prose-as-State Test**
   後の場面が参照する重要な出来事を、前の本文に書かれただけで成立済みとみなさない。

## 現時点の扱い

- Logic：既存PASSを維持
- UI：既存PASSを維持
- Save/Resume：既存PASSを維持
- Sequence：既存FAILを維持
- Human Acceptance：未実施
- **機械的達成／因果整合監査：FAIL**

このFAILは「Ver1を詳細シミュレーションへ戻す」という意味ではない。
DL-007の軽量モデルを維持したまま、**軽量であっても一つのcanonical state/historyから因果が通ること**を要求する。
