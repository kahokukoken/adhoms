# Narrative continuity recheck: corrected final and manual routes

## Judgment

**PASS for the two previously blocking narrative-continuity findings on the two supplied routes.** Both B1 (TOWA's missing outcome/ending bridge) and B2 (the unexplained personal-priority conflict) are now resolved at the text level. I found no new blocking contradiction in the material reread.

This is an **AI reader rereview, not Human Acceptance**. Human Acceptance remains **unperformed**. The pass is not a claim that every route, mechanic, or presentation detail has passed, nor that the optional editorial concerns in the original review have disappeared.

## Exact scope

Read only the supplied player-visible text and used my prior reading/earlier reports for continuity:

- **Route A, maintain allocation:** `final reader-packets / monthly-year5.md`, read in full, April 2033 through March 2034 and the complete ending
- **Route B, manual reallocation:** `alternate manual reader-packets / monthly-year5.md`, read from August 2033 through March 2034 and the complete ending

No repository code, design documents, implementation claims, or other reader's findings were consulted. No game or state was changed. Years 1–4 were not reread in this pass. Route B's April–July text was not reread. Line references below refer to these snapshots.

Snapshot SHA-256:

- A: `618d4a52ce333519bae8217a238d9241aedf4b392c119b0d6654b9363339eaff`
- B: `30334665e8d1489c3f628d89f7c643c7a3a937f9920fb5ede37102586da2914d`

## B1 resolved: TOWA's outcome is confirmed before the ending

**August 2033, recovery opening** now supplies the previously missing individual result, in both routes (A line 622; B line 660):

> TOWA：生存。重傷なし。森林公園の避難開始を待機する判断が、避難の遅れとして残りました。当日の危険度と、確認された身体の状態は別に記録します。

This is an actual condition, not an inference from the danger rating. It also connects a recorded earlier choice, delaying forest-park evacuation, to a remaining delay without claiming that delay necessarily caused an injury.

**September 2033, Fujii's opening report** independently carries the confirmed state forward (A line 636; B line 674):

> TOWAさんも生存し、重傷はありません。森林公園の避難開始を待機した判断が、避難の遅れとして残りました。

The former conditional placeholder about confirming her condition according to the result is gone. The reader no longer waits seven months for the story to imply that she survived.

**March 2034, administrative review** includes TOWA alongside the other individual results (A line 1470; B line 1508). **The subsequent conversation** occurs at `復旧現場脇の仮設休憩所` and expressly states (A line 1485; B line 1523):

> TOWAは豪雨を生き延び、重傷は負わなかった。あの時の避難の記録を残し、実証評価会議のあと、木曽と向き合う。

That establishes both the survival bridge and the scene's place in time. A detailed rescue account would be additional dramatization, not a remaining requirement for this original blocker.

## B2 resolved: the priority choice now has a concrete resource and situated stakes

**July 2033 in Route A** still provides the useful preparation: 真知 is reluctant to leave the shop's barrels/ledgers and worries about family contact; 晃生 may remain at the venue for other people; forest-park and sumo operations have distinct contact chains.

**August 2033, personal crisis**, now turns that setup into three concrete situations in both routes (lines 573–580):

- 真知 is at the miso-shop situation, with evacuation nearly delayed by her concern for the barrels, ledgers, and family; the residential side needs vehicles
- 晃生 remains on the sumo side for withdrawal/guidance, where the route obstruction affects those still present
- TOWA is on the forest-park side; her evacuation is part of the crowd's movement, and the previously selected waiting decision has left a delay

The current baseline is named:

> 現在の車両配分：相撲会場へ重点配分（夕方の判断）

The shared constraint and cost are then made explicit:

> 配分を維持するか、ここで同じ車両を配り直します。

> 一地点への重点配分は、その地点の避難を助ける一方、他の二地点への車両を手薄にします。

> 追加の車両が増える判断ではありません。

These additions supply the missing facts needed to understand the decision: the people/places involved, their immediate movement problems, the scarce resource, the existing allocation, and who may be left with fewer vehicles. The choice is no longer merely an unexplained collision between three names and an abstract town priority.

### Route A: maintained allocation

The recorded choice maintains system priority. The recovery result confirms (line 623):

> 個人危機での車両配分：相撲会場へ重点配分を維持

This matches the evening baseline and the choice. TOWA's danger rating is not silently promoted into an injury; her actual survival/no-severe-injury result is separately stated. 晃生's subsequent account links being stranded and injured to the unusable sumo-side route.

### Route B: manual reallocation

The sequence records the actual destination selected, rather than merely saying that priority was changed:

> 選択：個人危機での車両再配分：森林公園へ重点配分

The updated crisis screen records (line 613):

> 今回の配分：相撲会場へ重点配分 → 森林公園へ重点配分

The visible tradeoff matches that direction: before the change, 晃生 is `注意` and TOWA is `危険`; afterward 晃生 is `危険` and TOWA is `注意`, with 真知 remaining `注意`. The recovery record preserves the same sumo-to-forest-park change (line 661).

Both routes retain the same confirmed physical outcomes: 真知 survives without severe injury but loses major business assets; 晃生 survives with an injury preventing immediate competition; TOWA survives without severe injury. That is **not a contradiction**: the text explicitly says the changed risk estimates do not determine injury or death. Different risk profiles do not require different realized injuries in every recorded route. This review does not establish whether the numeric model is correct.

The manual route also reports Relation continuity 95 versus Route A's 100. The prior warning about reduced legitimacy makes a downside to the manual route legible, although these numbers alone do not prove the underlying calculation.

## New contradiction check

No new blocking factual reversal was found:

- Neither route resurrects a person previously declared dead
- TOWA's confirmed status agrees across August, September, administrative review, and private conversation
- 真知's shop is not silently restored to full supply during recovery
- 晃生 does not return immediately to competition or his old work capacity
- The manual allocation is not forgotten in the recovery result
- The earlier evacuation delay is not erased merely because vehicles are subsequently redirected

The remaining open recovery decisions are deliberately current and owned. In March, 真知 still decides whether/how to continue the business, and 晃生 still decides his return according to his body. They do not need complete recovery before the trial ends.

## Optional editorial concerns, separate from the pass

1. **Historical allocation labeled “current” after the manual change.** Route B line 610 still says `現在の車両配分：相撲会場へ重点配分（夕方の判断）`, immediately above the explicit new-allocation arrow. The parenthetical and `今回の配分` make the intended chronology recoverable, so this is not a remaining blocker. `変更前の車両配分` or `夕方に決めた配分` would be clearer.
2. **Manual action versus assigned motive.** The button says `手動で優先順位を変更`; the following narration states `個人的関係を理由に優先順位を手動変更。` A reader could choose the forest park because its displayed risk is worse. If this mode specifically means a personal override, make that explicit in the choice label; otherwise, avoid automatically asserting the player's motive. This is an agency/wording concern, not a factual outcome contradiction.
3. **Previously reported optional concerns remain separate.** Portable-shelter/mobile-command terminology still arrives abruptly, the resource-unlock history remains more abstract than the everyday story, and repeated summaries/unfinished minor threads could be edited. None reinstates B1 or B2. No requirement to rewrite the unchanged years is implied by this pass.

## Conclusion and limits

The previously missing outcome and decision context are now present in the actual supplied text, and the alternate action's immediate tradeoff and later record are traceable. **B1: resolved. B2: resolved. No new blocking continuity contradiction observed.**

This supersedes my earlier FAIL only for these corrected snapshots and these two tested routes. It does not cover other targets for manual reallocation, other final-day choices, different prior-year histories, unseen UI content, full mechanical behavior, or human reader acceptance.
