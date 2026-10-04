# Interrupted directive transition repair — 2026-10-04

[Preflight](preflight-2026-10-04-directive-durability.md). DL-007/014/020; V1-08/10/13. This corrects a real save/reload defect discovered while checking the opening cleanup; it does not change the story or adopt missing old history.

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
