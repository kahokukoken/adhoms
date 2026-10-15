# Final bounded editorial cleanup — 2026-10-04

[Preflight](preflight-2026-10-04-final-copy.md). DL-007/008/009/014/017/019/020; V1-04/09/10/13/14.

## Exact changes and invariants

- Year5 July Saeki recap preserves Fujii's observation that another call **seemed about to happen**, rather than stating that it happened: 呼ばれていました → 呼ばれそうになっていました.
- March's default private location retains the canonically allowed ステージ裏 and removes only the unsupported 撤収後の modifier. No performance or teardown is invented.

Only two production string fields changed. Source-aware comparison confirms every other byte in the two files is equal. All 12 Year5 packets, 1,725 scalar leaves and288 weekly IDs differ only at July dialogue[4][1]. A42-case actual-renderer comparison preserves alternate locations, both70 cutoffs, precedence, results, directive flags and ending transitions. No save key, model effect, historical adoption, event-purpose branch or other authored expansion is introduced. This fixes visible overstatement; it does not certify whole causal architecture.

## Functional checks

Code `3a85481120b3a071cea6063f1e851f0a80457be9`, [CI #293](https://github.com/kahokukoken/adhoms/actions/runs/37217495431): browser-qa succeeded, **285 browser tests and66 Node tests, zero failures**. Sequence exact-repeat check found1152 unique displays / zero repeated groups; the source-bound review was deliberately UNREVIEWED until the fresh text was read.

- Four new production packet/renderer tests: old code fails3 assertions, corrected code passes4/4. Full local Node suite66/66. Independent Ver1 Node subset26/26.
- The focused JSON/input parity check is not itself real browser Save/Resume. The existing complete browser suite separately checks save/reload, interrupted directives, normal/week/month and final-stage progression.
- Source digest `710690960c6776f1243e9d60c082c7f8dfaee567b707424e95fd3052539fbac8`.
- HTML SHA-256 `efd3d4b2b41540f82327cf8fb14342c643c6d61ff7ae8a19e2109924b0d84130`.
- Downloaded CI game HTML, README and manifest match the revision-bound local build3/3; standalone --check passes. Prior frozen3da7cbe8 game/reading hashes are unchanged.

## Actual-text comparison and reading

All10 year/route exports were compared with the delivered CI292 text: the eight Year1–4 files are byte-identical. WeeklyYear5 has only the July recap and March heading replacements; monthlyYear5 has only July because its actual result selects the unchanged recovery-site venue. Both route metrics are equal. The short capture route and45/46 blocks are equal; only capture-44's March heading/hash differs. No short text was hand-edited, and no new sample state was constructed.

Fresh independent changed-context reading and its exact coverage are recorded in [source-bound reader evidence](sequence/evidence/reader-2026-10-04-final-copy.md). Final evidence-only exact-head CI must pass before delivery. This is not a new blind five-year read or all-choice narrative coverage.

## Completion boundary

Logic/UI/Save-Resume PASS within the285 tested browser paths and66 Node contracts; scoped Sequence depends on the source-bound reading record plus final exact-head gate. Human Acceptance **未実施** and architecture-wide audit **PARTIAL** remain. The current requested repair batch ends with these two corrections. TOWA's independent biodiversity purpose already exists; an optional results-presentation/awareness thematic branch lacks a defined authoritative condition and was not added. That future design question does not block this existing playable build.

Existing old saves whose directive flag had already been lost remain unmodified; missing facts are not reconstructed. No merge or production release is implied. The new immutable game/reading files are handed off only after final CI/artifact checks; the earlier delivered files retain their bytes.
