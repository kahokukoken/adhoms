# ADHOMS

**Adaptive Homeostasis Management System**

## Public prototype (archived baseline)

The currently published root page remains the **ADHOMS Ver.1 TGS Playtest v0.7** prototype:

https://kahokukoken.github.io/adhoms/

Its entry point is `index.html`. It is retained as a regression baseline and has not been replaced by the formal Ver1 work.
The local test server applies the prototype's existing enhancement bundle in memory, matching its established build step without editing the archived source file.

## Formal Ver1 (development only)

The formal five-year implementation is available locally at `/ver1/`. It is not the current public deployment and is not release-approved yet.

- Stage: fictional 倶利伽羅町
- Duration: 60 monthly turns over five years
- Core: deterministic representative-agent simulation with institutional command boundaries
- Observation: lottery-distributed bidirectional resident terminals with explicit sampling bias and uncertainty
- Player flow: setup, monthly FEED, quarterly decisions, annual reports, year-four election, final-year compound pressure, explained A–D evaluation
- FEED actions: positive/negative internal assessment, bookmark, investigation, and source profile; there is no follow/follower mechanic
- Save model: versioned, checksummed, transactional browser save with deterministic replay

The final-year compound pressure combines the fictional **倶利伽羅八朔相撲**, 倶利伽羅森林公園ライブ, and heavy rain. All municipalities, organizations, people, and events in the work are fictional and unrelated to real entities.

## Run locally

Requires Node.js 22 or later.

```bash
npm ci
npx playwright install chromium
node scripts/test-server.mjs
```

Open:

- Archived prototype: `http://127.0.0.1:8000/`
- Formal Ver1 development build: `http://127.0.0.1:8000/ver1/`

## Verification

```bash
npm run test:unit
npm run test:e2e
npm run validate:100
```

The explicit release-candidate seed gate is:

```bash
npm run validate:1000
```

The validator checks 60-month completion, state invariants, relation bounds, non-negative institutional resources, calendar events, forbidden grade mutation, save/load equivalence, deterministic replay, and explained A–D reports across diverse strategies and seeds.

Passing these commands does not deploy or approve a release. Deployment remains a separate decision after manual playthrough and acceptance review.

## Project structure

- `game/core/` — deterministic state, commands, advancement, persistence, replay, and evaluation
- `game/scenario/` — fictional 倶利伽羅町 entities, calendar, authored copy, and pressures
- `game/observation/` — terminal-panel selection, biased observations, FEED DTOs, and investigations
- `game/ui/` — formal Ver1 browser flow and rendering
- `ver1/` — formal Ver1 entry point and portrait interface styles
- `tests/` — Core, Scenario, Observation, archived-prototype, formal-flow, and release-gate tests

---

河北恒研 / KAHOKU KOKEN
