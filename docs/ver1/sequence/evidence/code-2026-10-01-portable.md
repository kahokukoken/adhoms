# ADHOMS portable-shelter independent code review

Date: 2026-10-01 UTC
Baseline: `ed8a44ea043a7474ed60090f9f9fab281a7ee173`
Final reviewed source digest: `093d564bab6fd5ea2c6f98c12b169c1cd7fd7e54ab2b42a232f346b19b621e2a`
Final standalone SHA-256: `a755de719971dedd878396f1aa22fc9dfa261c8ee35de49d1790386d0c700bb6`

## Result

No remaining blocker in the bounded preparation → secured equipment → deployment/redeployment repair. This is an independent code/provenance and focused browser review, not a full narrative acceptance or release certification.

- Logic: PASS for the reviewed causal path and counterfactual matrix
- UI: PASS for the focused preparation, response, final-decision and historical-incident markers; earlier independent 320px overflow check retained
- Sequence: full independent first-reader narrative judgment is outside this code review; the changed factual assertions were provenance-checked
- Save/Resume: PASS for the tested current, pending, resolved and recognized legacy cases
- Human Acceptance: 未実施

## Findings found and verified corrected

### 1. Continuing legacy saves could secure equipment but not deploy it

Reproduction: remove `supportModelVersion` from an otherwise valid continuing state; choose Year2 guided_watch / food_source / trunk_first; apply Year3; make a new Year4 deepen proposal and receive its answer. The old implementation recorded secured120 but distributedCapacity2 failed the legacy >=3 deployment gate.

Correction: authenticated preparation is now checked outside the current-model branch. The historical >=3 fallback remains only for legacy saves and does not duplicate the command. Actual newly secured preparation also receives the stock/current-deployed UI regardless of the legacy marker. Independent browser and model repros pass.

### 2. Active legacy sessions retained an undeployed baseline as usable capacity

Reproduction: an old session with distributedCapacity3 had portable baseline120; full deployment produced240. Merely continuing the old session preserved that phantom baseline.

Correction: `migratePortableCapacity` acts only on active, result-free, recognizable records. It requires the exact old base formula and current=base+recorded deployment; then removes the base and records a version/migration marker. It does not replay decisions or create actor replies. Terminal results and incomplete/inconsistent records are preserved. Independent browser checks: first reload240→120/base0; second reload remains120; old replies stay absent; an explicit new partial choice yields60 and records only that new reply.

### 3. A late wording change asserted actor assent for choice-only old saves

Found on intermediate digest `2d9c087bd9d5a259ca9b41bb716ad68b85e263020881d6ea642917b1e6099774`. `decisionText` selects Year2 branches from flags or Memory, but the changed guided_watch/trunk_first sentences asserted that the road actor accepted or decided. A flags-only legacy state with no proposal/response reproduced those assertions.

Correction: final text states only “記録では現地誘導の案が選ばれた。” and “記録では幹線を先に除雪する案が選ばれた。” New-run accepted responses separately identify the executing actors. Independent flags-only and Memory-only rendering checks pass, and the producer added a regression test. No actor assent is inferred from those two legacy choice records.

## Code and provenance trace

- `proposeYear4Strategy`: deepen/authority explicitly request portable preparation and include shelter_team in proposed actorIds. A proposal alone creates neither stock nor usable space.
- `respondYear4Strategy`: factory transport and warehouse storage/handoff must actually accept from offers present at proposal and reply. The shelter-team answer records secured or incomplete equipment/site preparation, a source reference and concrete missing conditions. Old proposals without the request do not gain assent.
- `availableEmergencyCommands`: requires matching accepted factory/warehouse records, the completed strategy response and authenticated shelter-team preparation. Relations, school grounds, generic preparation scores and secured flags alone cannot satisfy the current-model gate.
- `deriveDisasterState`: portable usable capacity starts at0. Existing fixed capacity and other nonportable formulas are unchanged.
- `applyDecision` / replay: none/partial/full yield0/60/120, exclusive and idempotent. Night relocation uses the same deployed equipment and adds no stock. No deployment means relocation offers only hold.
- `finalize`: shelterTotal uses deployed portable space; scoring therefore changes with deployment, while fixed personal outcomes remain unchanged.
- UI/save bridge: transition-owned responses feed the existing chronology and persist; render does not manufacture preparation. Recognized active legacy migration is persisted during final-session rendering. The incident label clarifies historical observations without changing their event data.
- Transport wording distinguishes established evacuation transport from additional portable-equipment haulage; it adds no vehicle count or numerical effect. March/private-scene and prior-learning wording changes do not alter causal state or ending order.

## Verification evidence

### Exact final digest

1. Focused Playwright suite: **39/39 PASS**, 10.0 seconds
   - `tests/ver1-portable-shelter.spec.js`
   - `tests/ver1-proposal-model.spec.js`
   - `tests/ver1-final-persistence.spec.js`
   - `tests/ver1-light.spec.js`
   - Environment: FONTCONFIG_FILE=/tmp/adhoms-fonts.conf; PLAYWRIGHT_BROWSERS_PATH=/tmp/adhoms-playwright
   - Output directory: `/tmp/review-portable-qa`
2. Independent exhaustive real-module matrix: **640 combinations PASS** = 4 flood choices ×5 wildlife choices ×4 snow choices ×4 Year4 strategies ×2 current/legacy markers. Exactly60 combinations secure and enable portable equipment; all640 start final portable usable capacity at0. shelter_team is present in proposal actorIds exactly for deepen/authority. No proposal creates stock before response.
3. Independent flags-only and Memory-only legacy rendering: the two corrected continuity sentences assert recorded choices only, with no road-actor acceptance claim.
4. `node scripts/build-standalone.mjs --check`: **PASS**, source and HTML match the final manifest.

### Prior matrix and browser coverage retained

- Initial current-model matrix:320 combinations,30 deployable preparation outcomes
- Expanded current/legacy matrix:640 combinations,60 outcomes, repeated on the final digest
- Focused adjacent suite before later text changes:33/33 PASS; expanded intermediate freeze suite:38/38 PASS; final39/39 supersedes both for these files
- Negative provenance cases: missing preparation, missing factory agreement, unrelated warehouse source, missing shelter response, wrong actor/source/site/stock and unresolved proposal
- Weekly and direct-monthly preparation reply paths, reload before/after response, partial/full changes, final night relocation, two reloads after legacy migration
- Independent 320px legacy-with-new-preparation UI: stock120/deployed0 and full deployment available; card scrollWidth=clientWidth286, no horizontal overflow

## Limits

The exhaustive matrix calls actual model functions; it is not640 full browser playthroughs. Browser preparation tests seed earlier state and then exercise real controls/reloads; the neighboring light test exercises normal Year2→Year4 progression. This review does not substitute for the producer's full browser suite, source-bound weekly/month-only reader passes, exact-head CI, or human first-play evaluation. Completed results and unrecognizable/incomplete legacy baselines deliberately remain historical rather than reconstructing missing history. Broader simulation/character-history architecture is not certified here.

No repository source files were edited by this reviewer. The requested review report is the only authored deliverable.
