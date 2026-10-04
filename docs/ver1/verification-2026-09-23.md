# Ver1 observation unit verification — 2026-09-23

Scope: V1-01–05, V1-12–13. Code and this record travel in the same PR #17 commit. The standalone README records its HTML SHA-256 and, in CI, the source commit.

## Evidence

- Baseline regressions observed: weekly advance added **0** post IDs; April meeting contained **5** sliders; week-2 reload returned to week 1. These failures were reproduced against `d42f8a9` before the behavioral changes.
- `npm run test:e2e -- --workers=2 --reporter=line`: **35 passed, 0 failed**, 33.3s (final run after the review fix). Includes the real five-year calendar, August disaster, recovery to March, directives, optional creation, pending-event/final persistence and standalone `file://` opening.
- `npx playwright test tests/ver1-observation-flow.spec.js --workers=1 --reporter=line`: **5 passed**, repeated with a Japanese font installed for visual inspection.
- `node --check` on active scenario, authored observation data and daily session scripts; `git diff --check` passed.
- `node scripts/apply-enhancements.mjs && node scripts/build-standalone.mjs` generated a single HTML file.
- 390×844 screenshots from normal UI operations were read: opening → first FEED cards → month-end conversation. Main body 16px; supporting text 13px; no horizontal overflow. Japanese glyphs verified after correcting the QA environment's missing font.
- Conversation reading: Saya distinguishes missing data from zero; Fujii responds with the terminal explanation problem; Saeki revises his assumption; Mizuno relates this to one-day transport help; Fujii changes the next question. This is a limited editorial review, not user acceptance of the full story.

The cloud inspection browser cannot open this environment's localhost. The visual evidence comes from repository browser tests and their rendered screenshots, inspected directly. CI retains these images under `adhoms-ver1-qa-evidence`.

## Review follow-up

A read-only review reproduced a July→August reload defect: routine metrics reset and July meeting completion was lost because the two calendar representations disagreed at save time. The new boundary test failed before the fix; the calendar bridge now updates both representations before reload. The final 35-test run includes this case. Meeting explanation paragraphs were also raised to the 16px body floor.

## Boundaries still open

- Seasonal dialogue is richer, but years 2–5 do not yet have fully history-dependent daily conversations.
- The full year-1 cast and attachment sequence, optional-making dialogue, delayed FEED effects, ending-order conflict and continuation thresholds remain in the canonical register.
- Quarter review retains routine observation priorities; it does not claim that every slider controls the lightweight disaster state.
- V1-14's 45–60 minute first play and story understanding require human experience review.
- The suite establishes functional regressions only; it does not make this a complete Ver1 or a released build.
