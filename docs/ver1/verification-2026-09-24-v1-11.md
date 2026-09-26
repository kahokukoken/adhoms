# Ver1 V1-11 verification — 2026-09-24

Scope: active authored FEED research linkage, observation weighting, poster context, and save/reload.

## Problem found

The visible Ver1 FEED uses `scenario-*` IDs, while the older automatic-research map was keyed to obsolete demo IDs such as `p1` and `p11`. The old + handler therefore changed observation weight but did not queue research for the posts the player actually saw. The authored renderer also excluded old dynamic report IDs.

## Implemented evidence

- Research is now selected by the current authored scenario topic, not an obsolete post ID.
- ＋ remains an internal observation-weight action. On a researchable current post it additionally queues a topic-specific automatic investigation.
- − remains an internal lower-priority weight and cancels the + weight on that post.
- Follow remains absent from authored cards.
- When research becomes due it is emitted as a normal `research-*` FEED card from “河北恒研・調査報告”.
- Completed research is included in the monthly meeting observation summary instead of disappearing behind a hidden state flag.
- Research records include the source poster context and persist through `adhoms.ver1.daily.v1`.
- Detail view shows poster name, profile and source text and explains that ＋ is observational weighting, not agreement.

## Regression evidence

Verified revision: `9da159044a6f609873505c9b7f2a12b8a2634a40`.

GitHub Actions Ver1 QA #148, run `35997305916`:
- **44 passed / 0 failed** in 41.0s;
- standalone assembly/build/server passed;
- `adhoms-ver1-review` artifact generated;
- `adhoms-ver1-qa-evidence` artifact generated.

The first V1-11 run exposed three test failures. Two were test-fixture mistakes (the April “朝のバス” post is Tanaka Misaki, not Yamamoto Daisuke). The third revealed that a completed report was visible in FEED but not guaranteed into the monthly meeting excerpt. The meeting summary was strengthened to always include due research, then the full 44-test suite passed.

## Remaining boundary

V1-14 is not satisfied by these tests. A first-time human must play the review build without developer explanation and confirm:
- completion in the 45–60 minute target;
- recognition/attachment to the main people and town;
- understanding that choices return later rather than producing only immediate score changes;
- comprehension of the ending’s administrative-success / lived-loss distinction.

Q-01 BRINE individual names and Q-03 continuation thresholds remain unresolved design items and were not guessed here.
