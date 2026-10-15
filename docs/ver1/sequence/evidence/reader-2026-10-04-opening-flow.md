# Source-bound opening / bus reference review — 2026-10-04

Runtime source digest: `b0114a70e9e26cbadcfff20940dfc3ec11c116d60e92b53bbabeac98cb768e41`.
HTML SHA-256: `d6995cf1813f37e766529dc97c8429c24c8c43abbe0cebcfe6baa6b6dce982b8`.
Actual-control exports: [CI #289](https://github.com/kahokukoken/adhoms/actions/runs/37213751455), code `11cd612e576892808dd87d1e10cf7c545a4a2ce9`; baseline: CI #288 / c96286dd.

## Result and coverage

An independent reader received only the actual player text and preceding-version text, without source, specifications, implementation notes or other reviews. No new comprehension blocker, misleading restart or lost meaning was found.

- Read weekly Year 1 lines 1–190 and monthly Year 1 lines 1–141: the complete opening through the first April meeting.
- Read Year 3 March through its report/handoff: weekly lines 1467–1596, monthly lines 1382–1493.
- Read Year 4 April's bridge, four-week/catch-up discussion and meeting: weekly lines 1–201, monthly lines 1–203.
- Read all 64 lines / two hunks of each route's complete changes file. Independently generated Year 1/3/4 diffs match the supplied changes. The production comparison additionally verified every one of the ten year text files: only the three intended text replacements differ.
- Read the entire second scene of the actual short HTML. Other short scenes were compared, not freshly reread: all 46 blocks and the route are identical to the previous reviewed capture except `capture-12`'s removed bus clause and its recomputed text hash.

The reader understood purpose → FEED sources/limits → staff connection/control check → Misaki's concrete consultation → April review. The final Fujii handoff leads directly to the bus problem. Investigation/proposal duties and participant acceptance remain clear despite the removed repetition.

The later bus discussion continues resident experience: current work limits, direct contact reducing some coordination burden, remaining weekdays and an unresolved timetable inquiry. Deleting the unsupported dated attribution does not remove Misaki's present constraint or make a private lift into a bus-service change.

This is new bounded changed-context reading over the previously reviewed complete baseline, not a new full five-year blind read, not all-choice coverage, and not Human Acceptance.

## Existing compression limits

Two unchanged monthly recap omissions are nonblocking: Year 1's meeting reports Yamamoto's failed household drop-off swap although the selected recap shows only the later rota discussion; Year 4 recalls Kaito's substitute-finding question while the selected recap supplies Minato's scope answer and Kaito's acceptance. Both are intelligible as staff reporting intermediate events. They are not new fabricated events or failures introduced by this correction. A stricter requirement that every quoted question appear earlier on the monthly route would require a separate recap-selection change.

Full causal architecture remains PARTIAL; the bus-reference deletion does not adopt any new bus Memory/history. Human Acceptance remains 未実施.

## Verification separation and fingerprints

Two source-aware code reviews independently confirmed the exact production deltas, stable IDs/metadata and baseline-failing tests. Their scope is code/text; the fresh player reader's scope is actual rendered text. CI #289 passed **281 browser tests and56 Node tests**. Its recurrence check found **1152 unique displays / zero repeated groups**, but intentionally remained UNREVIEWED until this record bound the new digest. The next exact-head CI must confirm the gate after this evidence update.

The ordinary HTML, README and manifest downloaded from CI #289 are 3/3 byte-identical to the local revision-bound build. The staff-to-Misaki 390px screenshot and standalone second T-0WA screenshot were inspected with legible Japanese text and retained layout. Existing browser tests separately cover startup, month/weekly transitions and save/reload; no local browser restriction was bypassed.

| Evidence | SHA-256 |
|---|---|
| Independent actual-text report | `6de1a2527c91651c107baf2bcfcc743a2b77fe20d4ca8e9b520ff0fc207909d2` |
| Opening source-aware review | `0c6398f828d856b2db66e6fb97546b296ee78875cbc3b243e6cb22a5aecdd81d` |
| Bus source-aware review | `278e92a37a13cb12296fd3f3f267ddbf31780f2c0bb8f3fd151f2b618c680823` |
| Weekly changes | `53a8fc7ee708f3bfc2c2fce2d7855818e5f9a6a309ab5e45b901a68e574337d6` |
| Monthly changes | `b8b0257b3baf064fe365ded9c7cf701007c6b57d47d8a24068021a93938afb98` |
| CI #289 short capture | `724f82446b8cfc0e570aad27d07a37843338ae1d469e9d26c38bdc438ce86160` |

## Unchanged-text continuation after the directive persistence repair

Current runtime source digest `5801efe50797e9100e5f2ed2e0aa6742e235567afd18f56725a23bad6eeadc6c`; HTML SHA-256 `162711b60314746a42f91e96241fdcb6d2f992d88f69291131e241c183e03422`.

[CI #291](https://github.com/kahokukoken/adhoms/actions/runs/37215584128), code `2b47f26e3f72e3febbe2e7539e091a6025bfef90`, generated new normal-control exports after the durable pending-directive/host-lifecycle repair. All **ten weekly/monthly year text files are byte-identical to #289**. All **46 short capture blocks (including hashes and selectors) and the route are equal**, with no capture errors. Short capture hash, including new provenance, is `e7b21e964bf2682ecfb62e29c935627cecf30b0dddad83ca51f99451ce622f03`.

Therefore the existing actual-text review above remains applicable without presenting a redundant reread as new evidence. This continuation certifies equality only, not new all-choice/full-game reading. CI #291 passed285 browser and62 Node tests, including deterministic browser interruption cases, the formerly failing monthly reload, normal directive order and acknowledgement. [Repair verification](../../verification-2026-10-04-directive-durability.md) separates the runtime checks from reader judgment. Human Acceptance and all previously recorded limits remain unchanged.
