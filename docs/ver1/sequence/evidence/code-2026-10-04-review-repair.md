# Independent code review — bounded review repair, 2026-10-04

## Result and source boundary

No unresolved blocking code findings in the reviewed scope. One P2 presentation gap was reported and its correction rechecked. This is code/model review, not browser or human experience acceptance.

- Baseline: `c873641de5b067fa1c4e688cd678b75191ff02e8`.
- Reviewed: local `67cb20dd6154420e6aea0745cf6cac3033c760ec` plus the current uncommitted paragraph-formatting and short-review-selection corrections. Generated dist diffs were excluded from code review; standalone integrity was checked separately.
- Independently checked runtime source digest: `7bf3f63d0207ab75b2186698da75e81fac4416eac629890d4a6e4bd9606394b8`.
- Standalone HTML SHA-256: `9a65bf698b1017e7c9c6c360b4b0bbad38f43a944950470d8087da98a1d3b5f4`; manifest sourceRevision is `local`, not a pushed revision.
- Reviewed exporter SHA-256: `2802f1800e2820672bf752377669a8b8a962690233559b558e2b754602b7fa19`.
- Reviewed browser readability spec SHA-256: `04d13ccffb51ed187e1173b87f2d4aaf5e1719c815391bb3315b42f0732fae61`.

Read AGENTS, both Decision Lock files, current-spec and the three 2026-10-04 preflights. Current Notion originals were retrieved on 2026-10-04: [hub](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef), [Blueprint](https://app.notion.com/p/3e0fbe78bd3b817fa884ed993e6d8fee), [Story Spine](https://app.notion.com/p/3e0fbe78bd3b81a5831bdadbc8339b83), [Character Bible](https://app.notion.com/p/3e0fbe78bd3b8111bf09ea99d1f060b3), individual Kiso/TOWA/T-0WA/Saya pages and [Work protocol](https://app.notion.com/p/3e9fbe78bd3b81ae97e3f02510788629). Latest hub decisions and locks take precedence over historical wording.

## Corrected finding

**P2: actor paragraphs collapsed on the direct-month-end route.** `ver1/ver1-support-loop.js` formats Year4 replies using `\n\n`. FEED's `.post` preserves these breaks, but `scripted-scenario.js:576` emits the whole quoted reply in one `<p>` and the meeting style previously used normal whitespace. Actor-specific replies therefore remained one dense paragraph in monthly catch-up/reference despite the intended grouping.

The producer added `white-space:pre-line` to `.meetingObservations blockquote p` in `ver1/ver1-readable-ui.js:25`. Rechecked the scoped CSS, passing Node contract and new web/standalone direct-month-end test. The browser test checks the actual quote's computed whitespace, single common qualification, paragraph delimiters and unchanged saved response. Browser execution remains pending; this review confirms the code-level correction, not its rendered screenshot.

## Coverage and local checks

Reviewed meeting framing and annual record labeling; June warehouse-consignment specificity; display-only Year4 responses; resource typography; canonical CM recognition and July Kiso/Saya exchange; state-derived final event narration and folded standing notes; the separate short-review exporter and CI artifact path.

Exact final focused commands:

```sh
node --test tests/ver1-meeting-clarity.test.mjs tests/ver1-response-readability.test.mjs tests/ver1-towa-stakes.test.mjs
npx playwright test tests/ver1-cancelled-event-narrative.spec.js tests/ver1-short-review.spec.js --grep 'narrative model|renderer contract' --reporter=line --output=/tmp/adhoms-reviewer-final-node-results
node --check scripts/export-ver1-short-review.mjs
node scripts/build-standalone.mjs --check
git diff --check
```

Results: **11 Node tests + 11 non-browser Playwright contracts passed**. Syntax, standalone source/HTML integrity and whitespace checks passed. The Playwright subset contains no browser fixture and did not launch Chromium.

An additional independent Node/VM comparison loaded production state/disaster/final-event scripts from both baseline Git objects and the current checkout. It enumerated all **48** combinations of sumo schedule (keep/advance/cancel), TOWA schedule (keep/advance/reduce/cancel), forest evacuation (wait/start_now) and sumo evacuation (wait/start_now). Each run used the same remaining legal choices: no portable deployment, mobile standby, residents traffic priority, early closure, balanced initial allocation, distributed reroute, move_people shelter rebalance, hold portable redeployment, critical_sites logistics, manual override and forest personal allocation. All six phases were advanced normally through the model API, then finalized. **Complete finalized session JSON was byte-identical across baseline/current in every case.** Calling the new narrative projection after decisions in each of six phases also left every input JSON unchanged: **288 read-only checks passed**. This enumeration does not cover every resource or allocation combination.

Static and executed contracts confirm that missing/mismatching actor identity, choice or accepted status does not become assent; saved responses and existing IDs remain intact; fixed outcomes and numerical effect functions are unchanged. The new narrative does not disclose the university encounter or AI origin early.

Exporter review checked actual runtime FEED IDs, exact July dialogue selectors, normal event/meeting/optional/final controls, conditional manual-allocation controls, disposable empty browser context, no state seeding, escaped static output, three ordered scenes, selected-route disclosure and ending order. CI uploads the short-review directory produced by the actual-capture tests. The exporter rejects a stale standalone. These checks do not establish that the full browser capture has succeeded.

## Limits and status

- **Logic:** scoped PASS, including the invariance and non-mutation checks above.
- **UI:** browser execution pending. Local Chromium was already blocked by the established socket restriction; this reviewer made no launch, retry or bypass attempt.
- **Sequence:** code/selectors and bounded narrative provenance reviewed; no full browser-generated player-sequence or independent first-reader certification is claimed here.
- **Save/Resume:** Node JSON roundtrip and display non-mutation checks PASS; normal browser reload and legacy interaction paths remain pending browser QA.
- **Human Acceptance:** 未実施.

Full same-head browser/Sequence CI, authentic three-scene capture, 320/390px screenshots, offline navigation and browser storage non-interference are still required. Remote push is awaiting user approval; no push, commit, merge or deployment was performed by this reviewer. Broader causal architecture certification remains outside this bounded review.
