# FEED comprehension and character continuity

## Authority and intended reading experience

User 2026-09-27 00:27 JST accepts UI/flow and requests content polishing: observations feel abstract/disconnected; BRINE appears without explaining its members' relationship to Kiso; a band name speaking as one person feels unnatural.

Touched locks: DL-001/002/003/005/007/009/010/013. Requirements: V1-03/04/06/07/11/12/13/14. [Hub section 23](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef) records this scope before changes. Read on 2026-09-27: the hub; [Blueprint](https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee); [Spine](https://app.notion.com/p/3e0fbe78bd3b81a5831bdadbc8339b83); [Bible](https://app.notion.com/p/3e0fbe78bd3b8111bf09ea99d1f060b3); individual pages for Kiso, BRINE, Chihiro, Gaku, Saya, Minato, Fujii, Mizuno, Saeki, Kubota, Kurika and T-0WA.

Use existing flows and stable post/choice IDs. Make the person, place, immediate purpose and obstacle visible before the research interpretation. Follow recurring people and objects across weeks and into the meeting. Keep varied lengths and daily jokes. Preserve character voices and private reveal boundaries.

DL-010/Q-01: the common given name **透**, university-classmate connection and equipment repairs are present in both source routes. Use those without resolving the disputed Hasegawa/Vo-Gt versus Umino/Ba identity. No invented surnames or instrument assignment for Toru; band name alone is retired as an individual speaker. Q-01 and Q-03 remain open.

## Work and verification route

1. Ground the twelve seasonal observation threads, staff replies, meetings and research reports in concrete, recurring circumstances. Avoid making every resident recite the model's conclusion.
2. Introduce Kiso's friends before their events. Seed Toru's repair visit and invitation before July; recap their relationship in the optional event for saved entry and month-only readers. Connect Murata's kitchen with Chihiro's miso supply and Kiso's involvement.
3. Keep post IDs, six ordinary weekly arrivals and all existing choice/memory keys. Follow-up posts reflect the chosen approach or autonomous continuation.
4. Read the rendered order (ordinary weekly and month-only routes), verify branch text, saves, mobile and standalone, then deliver a new review build. Automated results establish functional safety; the user's reading response remains V1-14.

## Implemented reading route

- `scripted-scenario.js`: 48 main seasonal observations, twelve research result bodies and the first-year meeting frame now refer to people and known circumstances. Choice-aware story rows select text from existing saved flags.
- `ver1/ver1-observation-scenes.js`: twelve monthly conversations, seasonal follow-ups, first-year introductions and seven new story posts connect recurring people. The June week-four invitation is included for month-only readers; optional July entry recaps it.
- `ver1/ver1-weekly-scenes.js`: staff replies and resident continuations follow the actual question and earlier action. Corrected inconsistent shift times, already-completed actions, a repeated first-post claim and a teacher apparently handling another school's belongings.
- `ver1/ver1-optional-creation-events.js`: individual speakers and shared history lead into BRINE/GENKAN; Murata owns/cooks, Chihiro supplies miso, and Kiso participates in the existing kitchen. Three choices plus autonomous progress have distinct later FEED text for each event.

## Local evidence

- Actual active-renderer comparison against `743cae0897cb4c85b61016b04fa85173cb3d0540`: all **1,466** prior post IDs and weeks retained across 60 months; no duplicate IDs. Every ordinary weekly advance still adds six posts.
- All eight creation-return variants inspected. Music/food story observations do not start seasonal research; existing report deduplication code was not changed.
- The first year's actual rendered sequence, including monthly meetings, was exported and read. Corrected chronology and reply mismatches found during that read.
- Changed JavaScript syntax, standalone assembly and whitespace checks passed. Playwright discovery: **68 tests in 24 files**.
- Browser execution, mobile screenshots and the exact deliverable comparison are recorded below. Automated passes do not establish first-play comprehension or V1-14 acceptance.

Initial browser run [QA #173](https://github.com/kahokukoken/adhoms/actions/runs/36253859114) on `0faa9f623d2d9465ea5674565a0a7d350090bf23`: **66 passed, 2 failed**. The new web/standalone continuity and saved-choice paths passed. Existing checks caught a lost Great Noto creator cue and only three distinct meeting-opening speakers. Restored his impulsive project announcement and let Mizuno open the February shop discussion, with Fujii reporting the posted notice. No test was relaxed.

Independent read-only review found no critical/important issue. Corrected its minor repeated-completion findings in June/November meetings and made the soba planning dialogue conditional before the player chooses a role.

## Verified review build

Source revision: `8968cd4c8608d5b7fe5782823a3d4aa895f004d0`, draft PR #17. [Ver1 QA #174](https://github.com/kahokukoken/adhoms/actions/runs/36254096080): **68 passed / 0 failed** (1.2m).

- Web and standalone: month-only April → June exposes Toru and the university/repair connection before July; the June meeting includes the invitation. July recaps the relationship and speaks through individuals.
- Real creation choices return through the September BRINE post and November Murata post, including the month-end observations. Selected branch and post weight survive reload. Existing research deduplication, startup, calendar, full five-year route and persistence regressions pass.
- Japanese 390×844 screenshots inspected: BRINE conversation, choice-specific Murata follow-up and April meeting. Text wraps within the single column; existing controls remain reachable. The long BRINE card is read by scrolling; no new layout or condensed copy was introduced.
- [Standalone artifact](https://github.com/kahokukoken/adhoms/actions/runs/36254096080/artifacts/10909438747) and [visual evidence](https://github.com/kahokukoken/adhoms/actions/runs/36254096080/artifacts/10909383719). Local HTML and README match the CI output byte for byte.
- Deliverable: `dist/ADHOMS-Ver1-Content-8968cd4c.html` (also `dist/ADHOMS-Ver1.html`). HTML SHA-256: `4395d53ffea9d13ac1bca55c3b864702a5c61b2a4bfdfdd0fd2dcb41a316a7e8`.

Status: this content revision and its functional review build are complete. Q-01's disputed surname/instrument and Q-03 remain unresolved. Seasonal prose still recurs in later years. V1-14 remains a human first-play acceptance gate; this is not a merge or formal release.
