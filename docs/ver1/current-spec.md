# Ver1 current specification and implementation map

Rechecked against Notion originals on **2026-09-24**. Historical audit baseline: PR #17, `d42f8a9`. Notion remains the design authority; this file records implementation evidence and the reading route.

## Source order

| Source | Scope |
| --- | --- |
| [Current development hub](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef) | Scope, supersession, acceptance IDs, unresolved questions, gates |
| [Implementation Blueprint](https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee) | Lightweight model; year-by-year causality; FEED; year 1 daily life |
| [Story Spine](https://app.notion.com/p/3e0fbe78bd3b81a5831bdadbc8339b83) | Convergence, directives, ending and reveal order |
| [Character Bible](https://app.notion.com/p/3e0fbe78bd3b8111bf09ea99d1f060b3) | Fixed relationships; provisional names; individual pages |
| [Places](https://app.notion.com/p/3e0fbe78bd3b81e08ee8d090a66e4b4f) | Geography and organizations; fetch when editing locations |
| [Operating rules](https://app.notion.com/p/3ddfbe78bd3b81c583c7d14c462bcffc) | Source ownership and change management |
| [Revision history](https://app.notion.com/p/3ddfbe78bd3b81cc8e8ae08fab2c3d1d) | Decision history; Rev.0.14 records this reconciliation |

## Accepted design

Ver1 is a five-year story in Kurikara. The player is Kiso, directing a field trial; the player observes people rather than controlling them. Fixed story convergence and essential conversations are connected by a small set of state variables, relations and memories. The aim is to understand ADHOMS, know the town and its people, and leave consequences and questions for Ver2. Full detailed resident simulation is not a prerequisite.

- Year 1: meet the town, childhood friends and staff; daily work, family businesses, BRINE/GENKAN and miso dipping soba; seeds for later characters. No Kiso directive yet.
- Year 2: knowing a warning does not ensure action; snow, local flooding and wildlife; directive 1.
- Year 3: benefits, displaced burdens, compensation and revision; directive 2.
- Year 4: past choices change cooperation and available resources; politics and succession; directive 3.
- Year 5: sumo, TOWA's event and multi-phase rain; conflicting personal stakes; recovery. Administrative evaluation, a private TOWA conversation and quiet directive 4 leave NML unresolved.

FEED receives observations from lottery-selected residents with terminals, plus institutional reports, staff research and public media. It is incomplete and biased. Plus/minus are internal observation weights. No follow mechanic. Monthly observation, quarterly review and annual reporting replace mandatory monthly sliders. Weekly detail must be optional without hiding essential story from monthly play.

## Acceptance map

| ID | Acceptance | Baseline state / implementation owner |
| --- | --- | --- |
| V1-01 | Lightweight story scope; no TGS branding | Partial; `index.html`, `ver1/*` |
| V1-02 | Opening explains lottery terminals, trial, player and T-0WA | Missing; `opening-flow.js` |
| V1-03 | Weekly/monthly new observations and replies; 2–5 major cards plus background | Missing; `scripted-scenario.js` |
| V1-04 | Character voices; meetings respond, disagree and follow up | Partial; `scripted-scenario.js` |
| V1-05 | Monthly observation, quarterly judgment, annual report | Missing; mandatory monthly sliders |
| V1-06 | Year 1 attachment, daily-life relationships and Ver2 seeds | Functional path verified; named year-one beats and future seeds are in FEED; human story-experience review remains |
| V1-07 | Optional BRINE/soba making, dialogue and later consequences | Functional path verified; authored making dialogue, choice persistence and non-intervention world progress are implemented; downstream consequences belong to V1-08 |
| V1-08 | Years 2–4 choices return as delayed reactions and available actions | Partial; events/propagation/milestones; FEED linkage remains |
| V1-09 | Multi-phase rain and personal stakes depend on history | Representative functional path verified; narrative review remains |
| V1-10 | Recovery, administrative evaluation, private conversation, directive 4 | Partial; ending-order conflict Q-02 |
| V1-11 | Internal +/-; no follow; details/save/research | Partial; observation controls; research path needs audit |
| V1-12 | Readable mobile text and reachable controls | Missing; small font sizes |
| V1-13 | Resume same week, observations, choices and pending meeting | Partial; event saves exist; daily UI not preserved |
| V1-14 | First play 45–60 min with story/causality understood | Unverified; automated playthrough is insufficient |

## Unresolved questions

- Q-01: BRINE's Hasegawa Toru/Vo-Gt in Character Bible versus Umino Toru/Ba and Buriya Ryo/Vo in later Blueprint. No explicit rename decision. Use band name for independent work.
- Q-02: Spine places T-0WA's continuation declaration in the administrative meeting, before the private TOWA scene; current PR puts it later. Preserve source authority; assistant implementation reports are not user approval.
- Q-03: Administrative grades, internal convergence and character survival/carryover conditions are different. Exact thresholds are not yet fixed.
- Q-04: Optional weekly detail versus required story and 45–60 minute duration needs experience review.

## Latest implementation: 2026-09-23

| IDs | Change and evidence | Remaining limit |
| --- | --- | --- |
| V1-01–02 | TGS branding removed from active screen; lottery terminals, Kiso and Type-0 Work Assistant introduced. Opening test and mobile screenshot. | Entire story is not complete. |
| V1-03 | 4 major seasonal posts + 2 background posts + 1 context post at week 1; 2 authored follow-ups each additional week (13/month). Existing observations retained. Month-end summary includes later observations even when weeks are skipped. | Seasonal text still repeats in later years; historical variations remain V1-08 work. |
| V1-04 | Kurika voice rewritten; 12 monthly staff conversations respond to one another; personality badges and repeated-slogan requirement removed. Character originals read. | Full cast/story dialogue and user experience review remain. |
| V1-05 | Normal monthly meeting has no sliders; optional quarter-end priorities; March annual observation summary. Tests verify default retention and unfinished draft commit. | Consequential institutional decisions still belong to existing event scenes; routine priorities are not wired to every lightweight-model outcome. |
| V1-12 | Main text 16px, supporting labels 13px; 390×844 screenshots with Japanese font; no horizontal overflow on entry. | Other devices and full human play remain unverified. |
| V1-13 | Same week, +/- weights, pending meeting, quarter-edit draft and priorities resume; light state retains calendar authority. Existing optional/event/final persistence tests pass. | Old saves cannot recover UI data never previously stored. |

Verification details: [2026-09-23 evidence](verification-2026-09-23.md). Baseline table above remains a historical audit.

## Latest implementation: 2026-09-24 — V1-06–07

Verified code revision: `f72f623527c97dfc0e7813bc65d124e084300311`, PR #17, Ver1 QA run #132.

| IDs | Change and evidence | Remaining limit |
| --- | --- | --- |
| V1-06 | Added authored year-one FEED beats for Chihiro, Gaku, Minato and the kosen inventor; introduced the high-side field-lab/life-zone cluster; seeded the circular sensor mat/ENJIN origin; added an early public TOWA biodiversity clue without exposing T-0WA's private origin. Story beats are restricted by trial year rather than calendar year. | Automated checks establish presence, ordering boundaries and regression safety, not whether a first-time player has enough attachment to the cast. |
| V1-07 | Expanded BRINE/GENKAN and miso dipping-soba from selection cards into short making conversations. Ignoring the optional event now lets the world continue with a neutral autonomous Memory and no Relation bonus; choosing a path still records the selected Memory/Relation. BRINE individual names remain unresolved per Q-01 and are not used. | Later FEED consequences and Ver2 carryover effects are V1-08 work; exact BRINE member names remain Q-01. |

CI: **37 passed / 0 failed** in 38.5s. Standalone `ADHOMS-Ver1.html` and QA evidence were generated by run #132. Details: [2026-09-24 V1-06–07 evidence](verification-2026-09-24-v1-06-07.md).

Next implementation unit is V1-08: make years 2–4 choices return through delayed FEED/conversation and available actions. V1-10, V1-11's remaining audit and V1-14 remain unfinished; no merge, release or full-story acceptance claim.
