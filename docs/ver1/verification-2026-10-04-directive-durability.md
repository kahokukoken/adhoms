# Interrupted directive transition repair — 2026-10-04

[Preflight](preflight-2026-10-04-directive-durability.md). DL-007/014/020; V1-08/10/13. This corrects a real save/reload defect discovered while checking the opening cleanup; it does not change the story or adopt missing old history.

## Verified runtime

Code `2b47f26e3f72e3febbe2e7539e091a6025bfef90`, [CI #291](https://github.com/kahokukoken/adhoms/actions/runs/37215584128): **285 browser tests and62 Node tests pass**. This includes the original failed monthly portable-preparation test, all three immediate-reload regressions, acknowledged-save cleanup→Year5, normal directive progression, save/optional/final flows and the opening handoff assertions. The source-bound Sequence job intentionally remained UNREVIEWED until the new exports were compared.

Fresh actual-control exports are byte-identical to the independently reviewed #289 text in **all ten year/route files**. All **46 short blocks and its route** are exactly equal. No new blind reread is claimed or needed for identical text; the prior review's scope/limitations remain. The downloaded game HTML, README and manifest are3/3 byte-identical to the revision-bound local build. Independent code/VM review passed12/12 checks; report SHA-256 `8032d9c7196838f66aa43a49a8ae2af398ab2b115799fc83d63749ee1ecdfead`.

Logic/UI/Save-Resume PASS within the tested paths; prior bounded Sequence reading applies to the verified identical text. Final evidence-only exact-head CI must confirm the updated source gate before handoff. Human Acceptance未実施; causal architecturePARTIAL. Existing old saves whose directive flag was already lost are not retrospectively reconstructed; this repair makes current/future triggers durable and restores genuinely recorded pending directives. The pre-CI checkpoint below is historical.

## Failure and causal correction

[CI #290](https://github.com/kahokukoken/adhoms/actions/runs/37214530829), f7a77413, passed its current Sequence gate but failed the monthly portable-preparation reload test: **280 browser tests passed / 1 timeout** waiting for `#v1directive`. The page had the saved Year4 proposal but no pending directive. The previous full run passed, making this a timing-dependent defect rather than grounds to waive the failure.

- All three directive triggers now save the existing pending flag synchronously; only presentation is deferred. A transient Set prevents the observer from bypassing the original zero/220ms display delays. It is not persisted and cannot fabricate an old missing directive.
- When a legitimate pending directive is ready, the existing UI host factory recreates a container removed by normal idle cleanup. Ordinary idle/acknowledged states still have no empty overlay. An unrelated open overlay is not replaced.
- An already-acknowledged handler cannot close the next directive if a stale second click arrives. The existing order, text and state keys remain unchanged.

## Local verification before CI

- Three interrupted-trigger tests failed before the durable-queue fix. The missing-host test and stale-second-ack test separately failed before their minimal corrections.
- **62/62 Node tests pass**. The six new production-script tests cover synchronous persistence, deferred/observer timing, serialize/restore, acknowledgement, idle/missing host, unrelated overlay and stale acknowledgement.
- Independent code review: **12/12 focused checks pass** (six independent VM probes plus the six new tests), including real overlay-cleanup→Year5 and no idle host creation. No blocking finding.
- Browser suite parses/discovers **285 tests**. Four new browser cases cover each directive's held-timer immediate reload and normal month advancement after actual cleanup. The original failing portable test is unchanged; no longer wait or weakened assertion.
- Standalone build/check and `git diff --check`: PASS. Runtime digest `5801efe50797e9100e5f2ed2e0aa6742e235567afd18f56725a23bad6eeadc6c`; HTML SHA-256 `162711b60314746a42f91e96241fdcb6d2f992d88f69291131e241c183e03422`.

**Logic: local scoped PASS. UI: pending CI. Save/Resume: deterministic model PASS, browser pending. Sequence: fresh export comparison pending; the older source-bound gate is not promoted yet. Human Acceptance: 未実施.** The authored text did not change; fresh normal-control route exports and all short-scene blocks must match the reviewed #289 outputs before its reading judgment is reused. This is not a claim that the entire game is bug-free. Frozen c96286dd and the existing mobile Site remain unchanged pending verified handoff.
