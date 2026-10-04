# Local bus-reference repair — 2026-10-04

This is a separate local revision after the frozen `c96286dd` handoff. It is not yet pushed or a new user delivery. See [preflight](preflight-2026-10-04-bus-retrospective.md).

## Change and reason

DL-007/014/019/020; V1-03/04/08/13. In Year 4 April week 1, Misaki now says:

> 朝の連絡役、今年も私でいいかと聞かれました。仕事中は返せません。送迎を頼む人から直接連絡してもらう日を、今月は作りたいです。

The only production change removes 「去年の終わりに書いた通り、」. The inspected Year 3 year-end sequence does not contain that explicit earlier post. Her present constraint and current request remain. This does not create or adopt new history and does not treat any optional Year-1 proposal as a prerequisite for autonomous resident activity.

## Fresh local evidence

- Regression `tests/ver1-bus-retrospective.test.mjs`: the unsupported-reference assertion failed against the old row, then passed after the deletion. The second test checks actual packet/render output, read-only state and serialized input restoration.
- Complete `node --test tests/*.test.mjs`: **53 passed / 0 failed**.
- `node --check ver1/ver1-continuity-year4.js` and `git diff --check`: PASS.
- Deep comparison of the entire parsed Year 4 packet against local HEAD: exactly the one phrase deletion; every other field unchanged. IDs, reply targets, speaker, dates, counts, dialogue and neighboring month packets remain identical.
- Re-run of the real support/history/continuity-model bus diagnostic: **6 histories, 36 boundary snapshots, 12 three-way comparisons**. Weekly/month-end equivalence, serialized restoration and read-only rendering pass. Comparison against the pre-fix results finds exactly **18 displays of the same changed row**, with all other snapshot fields and prior proposal/reply records identical. This is model/renderer verification, not a browser playthrough.
- Standalone assembly and `--check` pass in a separate staging directory. Source digest: `13c907086d39e4427782d6d1feb633fd9b199a1531be8f6ba121823bb82ee187`. HTML SHA-256: `b85d828d1cc115f1a5e05a115d510144769e041c94bf91aaf9f3aaf914190202`.
- The delivered playable c96286dd file still hashes to `23cb3e830c51b81f661b89d77b85e3806edd36bc05e2d7d59963d43a24af232b`; its reading pack remains `d257ff9a61d958822e279e86756d5c7d44506eb1f53a4f861f672198bbb4cbee`. No delivered alias or mobile-preview input was rebuilt.

## Status and remaining scope

- **Logic:** scoped local PASS.
- **UI:** NOT RUN for this revision. The already-confirmed local browser restriction was respected; no retry or bypass.
- **Sequence:** model/text difference checks PASS; independent changed-context review PASS for Year 3 March → Year 4 April weeks/meeting. The reviewer independently confirmed all 288 Year 4 rows and metadata are unchanged except this clause, and the regression fails against the baseline. The browser Sequence aggregate has not run, and the source-bound c96286dd gate is not promoted to this intermediate digest.
- **Save/Resume:** serialized model restoration PASS; browser storage/navigation NOT RUN for this revision.
- **Human Acceptance:** 未実施.
- **Causal architecture:** remains PARTIAL. The wider Year 2/4 bus-history ownership question is not resolved by this deletion and does not justify inventing new Memory.

No full-game reread is requested. This local patch touches only the first Misaki post in Year 4 April and quotations of that same row. Opening-sequence review is a separate task and is not bundled here.
