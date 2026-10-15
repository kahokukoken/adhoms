# Bounded review repair — 2026-10-04

## Authority and boundaries

User: 「じゃあ可能な限り進めて。止まったら報告」 after the current partial story/causality status and missing three-scene review delivery were explained. Continue existing Ver1 repairs and the separate short review artifact; keep PR #17 draft. No merge, production deployment, broad engine replacement or new unresolved character facts.

Touched locks: DL-003/006/007/008/009/014/017/019/020. Requirements: V1-04/08/09/10/12/13/14. Current source is c873641de5b067fa1c4e688cd678b75191ff02e8, verified against remote on 2026-10-04. Local generated dist differences predate this work and will be rebuilt from source; frozen delivered aliases remain immutable.

Current originals fetched 2026-10-04 14:23–14:26 UTC:
- [Hub](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef), §§2–8, 37–39: scope, support/consent and portable-preparation corrections.
- [Blueprint](https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee): lightweight canonical state/history and participant support.
- [Story Spine](https://app.notion.com/p/3e0fbe78bd3b81a5831bdadbc8339b83): Year3 recognition, final rain, evaluation/private/directive order.
- [Character Bible](https://app.notion.com/p/3e0fbe78bd3b8111bf09ea99d1f060b3) and individual [Kiso](https://app.notion.com/p/3e0fbe78bd3b81d9981ac7aa0e884f6c), [T-0WA](https://app.notion.com/p/3e0fbe78bd3b8169b320f542aa4de217), [TOWA](https://app.notion.com/p/3e0fbe78bd3b8137b271e8dd38df19c0), [Saya](https://app.notion.com/p/3e0fbe78bd3b815998aef5b89724009e): current roles, voices and reveal limits. The individual Kiso page's provisional sister name is superseded by the current Bible; 綾乃 remains his sister.
- [Work protocol](https://app.notion.com/p/3e9fbe78bd3b81ae97e3f02510788629), full text, particularly §§2–7/11.

No unresolved Q-01/Q-03 decision is made. Causal audit remains PARTIAL. Wording fixes below are expressly editorial/clarity repairs, not certification of the state architecture.

## Seven-field preflight

1. **Purpose:** reduce needless repeated framing during monthly reading and make the exact scope of established agreements and final-year records understandable. Provide a short authentic three-scene excerpt instead of another complete playthrough assignment.
2. **Reproduction:** in normal weekly/monthly routes, open consecutive meetings: the same annual principle is printed every month before the specific conversation. In Year4 June, after the conditional warehouse agreement, the sentence 「まだ相談中の倉庫を確保済みに数えません」 makes the particular commercial consignment sound like the entire disaster agreement is absent. In Year5 March the report displays eleven monthly records without explaining that August was the separate disaster sequence.
3. **Canonical source:** hub §§2/3/7 and protocol's no-mechanical-repetition rule; DL-020 separates agreements from individual actions; DL-008/017 distinguish disaster/recovery/ending. No facts or capabilities need new authority for these fixes.
4. **Current implementation:** `scripted-scenario.js` `openMeeting` always emits `arc.meeting`; its annual counter counts ordinary `S.meetingDone` entries. `ver1-continuity-year4.js` June dialogue uses an unqualified warehouse sentence. Final disaster session stage/result already establishes whether the August sequence actually occurred.
5. **Impact surface:** meeting layout/read order, annual recap copy, Year4 June dialogue, standalone assembly. Separate exporter owns short-review HTML and must not add a mode to the product or write normal saves. Any further defect will receive a specific preflight addendum before implementation.
6. **Invariants:** retain substantive dialogue and required month-only catch-up, chronological FEED, six ordinary weekly arrivals, actual assent/provenance, no invented equipment/medical/recovery outcomes, no early university/T-0WA-origin reveal, existing IDs/choices/saves, old immutable artifacts.
7. **Verification:** reproduce formatting failures with direct execution of the production meeting renderer and focused browser regressions; then run Node tests, complete CI browser suite, fresh normal-controls weekly/monthly exports, source-bound independent reader recheck, short-review responsive/offline/read-only checks and standalone `--check`. Local Chromium currently cannot launch because socket creation is denied (EPERM); browser QA will run on the existing authorized CI and, where accessible, cloud browser. Never report unrun local UI as PASS.

## Initial implementation units

- Reduce annual-principle repetition to the opening meeting of each trial year; preserve the complete current-month conversation and year-end report.
- Identify the Year4 June unconfirmed item as Murata's particular consignment/time slot, without asserting a warehouse agreement exists on every route.
- Explain Year5's separate August disaster record only when a real final result exists; never backfill an absent meeting or decision.
- Export and independently read a three-scene, script-free review file with the representative route explicit.

Any TOWA or causal-state work remains under active investigation and will be added below only with its exact canonical basis and reproduction.

## Addendum: reply readability and resource typography

- **Purpose:** allow actual organizational conditions and refusals to be read without six copies of the same qualification; make final-day resource information legible.
- **Reproduction:** current exact-head normal-route exports show the Year4 April response card repeating 「他の組織や住民にも従うよう求める返答ではない」 for each accepting actor. `.ver1Capability` is still 11px and includes capacity explanations and T-0WA's ending declaration.
- **Canonical source:** DL-003/007/014/020, V1-04/08/09/10/12/13; hub §§2/7 and participant-response scope. Preserve every actor-specific condition and assent result.
- **Implementation:** `ver1-support-loop.js` rows currently prints the saved combined `proposal.response.text`; `ver1-readable-ui.js` omitted `.ver1Capability` from established readable sizes.
- **Impact:** read-only FEED/monthly catch-up formatting for current and old responses, all final capability/declaration panels. No state, numeric, ID, authority or agreement change.
- **Invariants:** never rewrite persisted responses, deduplicate only the exact common sentence, retain it once if present, keep all actor-specific text and order, leave generic legacy response unchanged when the common sentence is absent.
- **Verification:** production support-loop Node VM tests for current/legacy/absent responses, unchanged saved state; browser tests for separate paragraphs and 16px resource text at 320/390, ending/save interactions; CI full regression and reader delta review.

## Addendum: existing TOWA recognition and pre-crisis stakes

- **Purpose:** make the already canonical CM recognition and Kiso's personal concern legible before the final allocation choice, without revealing the university encounter or AI origin early.
- **Reproduction:** Year3 December currently says only 「この声は、知ってる」; Year5 July's preparatory meeting speaks about all three places entirely through staff, so Kiso's concern about TOWA remains a tease until the crisis/ending.
- **Canonical source:** Story Spine Year3 explicitly has Kiso identify the former performer 永遠 by the CM voice; Kiso's individual Ver1 arc and Blueprint 「人物による判断ノイズ」 explicitly establish concern for TOWA, Machi and Kosei. DL-009 withholds their university encounter and the AI naming/voice origin until their appointed reveals.
- **Implementation:** clarify the existing Year3 December meeting line and add one short Kiso/Saya response exchange in the existing Year5 July preparatory meeting. These are present-scene dialogue, not new remembered events or consent.
- **Impact:** monthly meeting reading on both routes; no FEED IDs, history registry, state/choice/delta/save changes.
- **Invariants:** no early university story, AI origin, new communication with TOWA, new relationship stage, diagnosis, resources or implied rescue guarantee. Kiso may express concern, not dictate agency decisions.
- **Verification:** fail-first data-level dialogue tests and non-reveal guards; actual route reader recheck of Year3 December → Year5 July → personal crisis → private ending. This is editorial realization of fixed canon, not a causal-state architecture fix.

## Actual-reader correction: retained allocation label

- **Purpose/reproduction:** the authentic three-scene reader noticed that, after balanced → forest manual reallocation, the personal-crisis panel still labeled the retained evening allocation 「現在の車両配分」. The later allocation-history line was correct, but the two labels appeared contradictory.
- **Canonical source:** DL-017's separately preserved evening/personal decisions and existing allocation history; V1-09/10/13. No new allocation rule.
- **Current implementation/impact:** `personalCrisisMarkup` reads the original `vehicle_allocation` intentionally; its heading falsely suggests that value is always current. Change only that heading to 「夕方に決めた車両配分」; keep the actual current-history line, values, source records and save behavior.
- **Invariants:** preserve both decisions and every effect, do not rewrite the original allocation, retain choice-specific action responses.
- **Verification:** fail-first production-renderer test after actual balanced → forest choice; browser test retains the pre-choice context check using the corrected heading; final pack and affected before/after excerpt recheck.
