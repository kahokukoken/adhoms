# First-year reader review: continuity without repeated proofreading

## Scope and authority

User 2026-09-27 requested production-owned content checking after repeated user rereads. [Hub sections 24–25](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef) and [the pre-implementation plan](plan-2026-09-27-reader-review.md) record sources, locks, requirements, adopted findings and limits. No additional user review was requested during this pass.

Frozen input: source `8968cd4c8608d5b7fe5782823a3d4aa895f004d0`, carried unchanged in workflow HEAD `a558d8f80ea3e7125a1fc5dfbb54d8176fcf7db3`. Its delivered `ADHOMS-Ver1-Content-8968cd4c.html` remains unchanged, SHA-256 `4395d53ffea9d13ac1bca55c3b864702a5c61b2a4bfdfdd0fd2dcb41a316a7e8`.

## Independent reading and consolidated findings

Two isolated AI readers received the player-facing first-year text, 2029-04 through 2030-03, without design documents, known findings, code or each other's feedback:

- Weekly route: 66 scenes; `live_test` and `shared_ingredients` choices. Input SHA-256 `9bad87a260b7504b187803aba24b88780f1ae650ffbd3af132d2a1f3b5ce3dfc`.
- Month-only route: 28 scenes; no optional creation choice. Input SHA-256 `14e6544d57a412c854e237cbde9ceba44050710bcae8038cfee07d88ec367fb9`.

Both readers understood recurring residents' needs, Kiso's relationship with Toru/Chihiro, creation choices and the return to April's unsolved bus problem in March. Both identified full creative-scene replay as a temporal break. The monthly reader lacked Gaku/Ren introductions and context for the lunchbox/oil follow-ups; root also confirmed that Minato's introduction was skipped. The weekly reader found immediate meeting reprints tiring and staff learning the same lesson repeatedly.

The original text extraction flattened closed quarterly details and assigned fixture priority values. The resulting priority-control criticism was not accepted as evidence of a normal-screen defect. The revised extraction respects closed details and uses actual initial priorities. This limitation does not affect the quoted character/meeting findings.

Implemented together:

1. A monthly catch-up presents skipped character/history/research beats and substantive week-four continuations in chronological order, including speaker profiles. Already-delivered posts and optional daily small talk remain in a closed reference section. Initial staff onboarding remains excluded.
2. Capture the entry week before the month-end button advances it. Persist it with the routine UI snapshot; older pending-meeting saves default to essential catch-up. Preserve ordinary observation weights and calendar ownership.
3. August BRINE and October soba use short, dated continuations. An unresolved choice remains available; a resolved choice remains recorded once, with the existing later branch-specific return.
4. April Saeki distinguishes one successful trip from a solved problem. January staff apply the spring method rather than relearning it. Lunchbox/oil continuations identify the relevant people. July Toru now recalls the conversation already displayed above his post.

## Rechecks and technical review

The same readers rechecked only changed scenes and necessary continuations; this was a difference review, not a second blind pass. Monthly review caught one remaining February reference to unseen November history. Weekly review caught July's invitation still sounding undecided after the consultation. Both were fixed and checked again. No remaining contradiction was reported in the affected text.

Revised extracts: weekly SHA-256 `fd717fb2676093c541bd46956c7beb0f9f88c6fcdb3b29650e10aba74241355b`; monthly SHA-256 `9e348d8ac67083eca9627a017a0f370277ff6fd02917f74bb526aa285baface3`.

Independent code review found that the original month-end handler forced week 4 before `openMeeting`, defeating an entry-week capture placed there alone. Capture was moved before that handler. It also found that a legacy-save fixture was rewritten by `pagehide`; the fixture now removes the field before the next page's app initializes. The reviewer rechecked weeks 1/2/4, repeated opening, save/legacy resume, one-copy research and all six creation choices without state duplication; no required issue remained. Browser checks are separate below.

Local active-renderer comparison against `a558d8f`: all **1,473** existing IDs and weeks retained across 60 months; no duplicate IDs, six ordinary arrivals per week and eight distinct creative returns retained. Syntax/whitespace and standalone assembly pass. The month-end handler itself was exercised for weeks 1/2/4, including stable reopening. Discovery finds **72 browser tests in 25 files**.

## Browser and deliverable evidence

Initial [QA #177](https://github.com/kahokukoken/adhoms/actions/runs/36258140048) on `79141110`: **68 passed / 4 failed** (1.4m). All failures were in the new tests comparing captured `innerText` with the assertion’s default `textContent`; identical content differed only at block boundaries. The comparison now uses rendered text on both sides, including the assertions that an optional scene changes. No game code or expected story behavior was changed to obtain a pass.

Source: `e2f9adcf5f29e953f8033b925c4e4dd2b342da34`, draft PR #17. [QA #178](https://github.com/kahokukoken/adhoms/actions/runs/36258364549): **72 passed / 0 failed** (1.2m).

Verified deliverable: `dist/ADHOMS-Ver1-Reader-e2f9adcf.html`, SHA-256 `9ba8dcc4c0e7df2adc885fbd8cb009bfe3c858718f1677eae77ff34b818b499f`.

- Web and standalone: normal month-only April/May/June introduces Gaku/Minato/Ren; November shows Ren's mat before Gaku's visit. Skipped quotations remain chronological. Pending-meeting reload, old pending saves and week-two partial catch-up preserve the intended content.
- Weekly route: ordinary delivered quotations are closed at month end, remain available on demand and remain closed after reload. August/October show two new dialogue turns, preserving unresolved choices or a single resolved memory. Existing branch returns, research deduplication, startup and five-year functional progression pass.
- Inspected 390×844 CI images of the April catch-up, August BRINE continuation and October kitchen continuation. Japanese text and profiles wrap within the existing single column; these are scrolling views, not a claim that a full scene fits one screen. No horizontal overflow in either route.
- [Standalone artifact](https://github.com/kahokukoken/adhoms/actions/runs/36258364549/artifacts/10911143310) and [visual evidence](https://github.com/kahokukoken/adhoms/actions/runs/36258364549/artifacts/10911053480). Local HTML and README match the tested CI artifact byte for byte. The prior frozen Content-8968cd4c file retains its original checksum.

## Remaining scope and handoff

This pass covers first-year weekly and month-only text, plus affected continuations; it does not certify later-year narrative quality, human enjoyment or 45–60 minute duration. V1-14, Q-01 surname/instrument, Q-03 thresholds and later-year prose review remain open. No merge or formal release.

The next handoff asks for no full reread. If the user wants a brief comparison, the changed scenes are April's month-end introduction and August's short BRINE continuation. Routine defect discovery and regression checking remain the production side's work.
