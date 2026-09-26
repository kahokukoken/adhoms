# Ver1 current specification and implementation map

Latest targeted update: **2026-09-26**, DL-001 startup clarification and DL-011 staff FEED onboarding. See the final section and its verification record; historical baseline tables below are retained.

Rechecked against Notion originals on **2026-09-24**. Historical audit baseline: PR #17, `d42f8a9`. Notion remains the design authority; this file records implementation evidence and the reading route.

## Source order

**Before using this table, read [Decision Locks](decision-locks.md) and [machine-readable registry](decision-locks.json). A locked premise survives omission elsewhere and can only be replaced by an explicit user decision recorded as a supersession.**

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
| V1-08 | Years 2–4 choices return as delayed reactions and available actions | Functional path verified; delayed Year-2 reactions, Year-3 propagated FEED, Year-4 cooperation/resistance and prepared-capability hand are linked |
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

## Latest implementation: 2026-09-24 — V1-08

Verified code revision: `cddeb3a3a6d48860933da16ec3f28ab3cc1ef4b6`, PR #17, Ver1 QA run #137.

| ID | Change and evidence | Remaining limit |
| --- | --- | --- |
| V1-08 | Year-2 flood/wildlife/snow decisions now return roughly two months later as choice-specific FEED and monthly-conversation reactions. Year-3 propagated side effects return to ordinary FEED after the yearly report. Year-4 surfaces cooperation offers and resistance from Relation/Burden Memory; deepening a concrete offer secures relation thresholds used by emergency-command gates. The final disaster shows the prepared-capability hand generated by prior history. | This verifies the canonical causal path for the current event set. It does not claim every future optional event or every character conversation has bespoke downstream text. |

CI: **40 passed / 0 failed** in 42.1s. Standalone and QA evidence were generated by run #137. Details: [2026-09-24 V1-08 evidence](verification-2026-09-24-v1-08.md).

Next implementation unit is V1-10: align recovery → administrative evaluation / T-0WA continuation declaration → private TOWA conversation → directive 4 with the Story Spine. V1-11's remaining research audit and V1-14 remain unfinished; no merge, release or full-story acceptance claim.


## Latest implementation: 2026-09-24 — V1-10

Verified code revision: `66aef52ebf1c50e890c9cab99a0857fdf02f418a`, PR #17, Ver1 QA run #143.

- Administrative review now contains the T-0WA continuation declaration and explicitly separates aggregate administrative success from lived losses.
- The following private TOWA/Kiso scene reveals the university-festival encounter and the name “永遠” for the first time, while keeping the T-0WA naming/voice origin hidden.
- The private scene location varies with the final result (hospital / recovery site / shelter / backstage).
- Directive 4 now follows the private conversation, records the individual/family-business/life-base residual, and still avoids prematurely naming the later NML concept.
- Final-session persistence now preserves result → private → directive4 → epilogue as distinct resumable stages.

CI: **41 passed / 0 failed** in 43.7s. Standalone and QA evidence were generated by run #143. Details: [2026-09-24 V1-10 evidence](verification-2026-09-24-v1-10.md).

Next implementation unit: V1-11 research/save/poster-information linkage. V1-14 remains a human first-play acceptance gate; automation cannot substitute for that experience review.


## Latest implementation: 2026-09-24 — V1-11

Verified code revision: `9da159044a6f609873505c9b7f2a12b8a2634a40`, PR #17, Ver1 QA run #148.

- The active authored FEED no longer depends on obsolete `p1` / `p11` research IDs. Research definitions are keyed by the current scenario topic.
- Pressing ＋ still means observation weight, not agreement. For researchable observations it additionally queues an automatic Kahoku Koken investigation without reintroducing Follow.
- Completed research returns later as an ordinary FEED card and is guaranteed into that month’s meeting summary.
- The research queue, completion state, weighted observation, and poster context survive reload through the existing daily-session save.
- Poster age/role/context are visible on cards and the detail sheet.

CI: **44 passed / 0 failed** in 41.0s. Standalone `ADHOMS-Ver1.html` and QA evidence were generated by run #148. Details: [2026-09-24 V1-11 evidence](verification-2026-09-24-v1-11.md).

Automated functional acceptance is now complete through V1-01–13 for the current scoped paths. **V1-14 remains intentionally unclaimed**: a human first-play must verify 45–60 minute completion, comprehension of the town/characters, and whether delayed consequences are understandable without developer knowledge.


## Decision Lock regression fix: 2026-09-25 — DL-001 / DL-002

Functional revision verified: `32b58f614541b9e7a55fdbf1df93c92162a842a8`, PR #17, Ver1 QA #155.

- **DL-001 FEED reading order**: monthly FEED is chronological top-to-bottom. Weekly advance appends the new week below existing observations and moves the reading position to the first newly arrived observation. Newest-first ordering is now a failing Decision Lock regression.
- **DL-002 FEED post length**: posts are not normalized to a two-line/short style. Short resident/influencer posts coexist with longer official/expert/context-heavy posts; long text is not line-clamped.
- Browser regression checks verify both ordering/navigation and short/long text coexistence.
- QA #155 completed successfully and produced the standalone review artifact. This does not replace V1-14 human experience review.

Details: [2026-09-25 Decision Lock feed verification](verification-2026-09-25-decision-locks-feed.md).
## Latest implementation: 2026-09-26 — entry position and staff conversation

Application revision: `d2963125296ee8829918010872bdda57e879077c`, draft PR #17, [Ver1 QA #159](https://github.com/kahokukoken/adhoms/actions/runs/36241702749): **57 passed / 0 failed**.

- **DL-001 / V1-03・13**: saved-week restoration no longer schedules a weekly scroll. Only the explicit week-advance action moves to new arrivals, below the sticky header. Fresh web/standalone entry and saved-week reload were tested separately.
- **DL-011 / V1-02・04**: before the first resident observation, eight internal staff posts introduce Fujii, Saeki, Miyashita, T-0WA and Mizuno through terminal checks and conversation. They guide the player through downward reading, internal +/- weights, details, optional weekly progress and monthly discussion.
- **DL-005 / V1-11・13**: tutorial practice does not queue town research or enter monthly observation summaries. Existing scenario IDs and saved weights are preserved. The introduction appears only in the first April.
- **V1-12**: 390×844 CI screenshots reviewed; varied-length staff text and controls are readable. Standalone HTML matched the tested CI artifact byte for byte.

Evidence: [2026-09-26 entry verification](verification-2026-09-26-feed-entry.md). Human pacing/character attachment remains V1-14; no merge or release acceptance is implied.
