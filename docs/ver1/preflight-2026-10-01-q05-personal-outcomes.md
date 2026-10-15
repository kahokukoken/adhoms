# Q-05 Personal Outcomes Preflight — 2026-10-01

## Purpose
Resolve the last known Sequence blocker before user playtest by implementing the explicitly adopted final-rain outcomes for Machi and Kosei, then reconnect August → recovery months → administrative review/ending.

## Adopted canonical outcomes
- 高倉真知：高倉味噌店の樽・帳簿・家族を気にして避難が遅れかける。本人は生存、重傷なし。高倉味噌店の設備・蔵・在庫に大きな損失が残り、家業継続が危機になる。
- 柴垣晃生：八朔相撲会場で撤収・誘導に最後まで残り、経路使用不能によって取り残され、その過程で負傷。生存するが、すぐ競技へ戻れる状態ではない。

## Canonical sources
- User explicit adoption 2026-10-01.
- Notion Implementation Blueprint updated 2026-10-01.
- Notion Story Spine updated 2026-10-01.
- Machi/Kosei individual character pages updated 2026-10-01.
- DL-007, DL-014, DL-015 remain binding.

## Current implementation problem
- Final-day risk values vary with choices, but recovery prose treats them only as evacuation-risk labels.
- Current result does not contain canonical personal-outcome objects for Machi/Kosei.
- Recovery September–March does not state their actual post-disaster condition.
- Administrative review does not explicitly connect aggregate success to Machi’s business loss and Kosei’s injury.
- This leaves the reader unable to connect July preparation → August crisis → recovery → Directive 4.

## Impact surface
ver1-final-event.js, ver1-ui-bridge.js, ver1-continuity.js, year-5 authored recovery scenes, save/resume, ending tests, sequence review.

## Invariants
- Player choices still affect evacuation risk, aggregate human safety, logistics, routes and TOWA risk.
- Machi/Kosei adopted personal outcomes are fixed story convergence, not derived from risk score.
- Do not invent exact diagnosis, fracture, surgery, hospital duration, exact recovery date, exact monetary loss, or exact destroyed inventory counts.
- Do not change TOWA outcome beyond existing result-dependent handling.
- Ending order stays administrative review → private TOWA → Directive 4 → epilogue.
- Human Acceptance remains separate.

## Verification
1. Final result always records Machi alive/no serious injury/business major loss and Kosei alive/injured/stranded/not-ready-for-sport.
2. Recovery September tells the actual outcome instead of only risk labels.
3. Later recovery months reference current consequences without repeating the same paragraph.
4. Administrative review explicitly contrasts aggregate safety with Machi/Kosei individual residuals.
5. Save/resume preserves outcomes.
6. Weekly and month-only sequence readers can answer what happened to both people and what remains unresolved.
