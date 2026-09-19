# ADHOMS Ver1 Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the formal Web Ver1 in which a first-time player can run the five-year 倶利伽羅町 observation-terminal demonstration through 60 deterministic monthly ticks and receive an explained A–D evaluation.

**Architecture:** Preserve the root public prototype as an archive while building the formal game in explicit `game/core`, `game/scenario`, `game/observation`, and `game/ui` modules rendered by `/ver1/`. The Core owns immutable ground truth and accepts only institutional commands; Scenario supplies conditions and shocks; Observation produces incomplete reports; UI renders those reports without direct write access to Core state.

**Tech Stack:** Browser-native ES modules, Node.js `node:test`, Playwright 1.55, HTML/CSS, localStorage, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-19-adhoms-ver1-design.md`

## Global Constraints

- The playable period is exactly 60 monthly ticks beginning in April 2029 and ending after March 2034.
- The intended first-run playtime is 45–60 minutes.
- Keep the approved smartphone portrait FEED layout as the primary surface; do not add character portraits or standing art.
- The fixed starting staff contains four people; the selected team leader changes advice and dialogue only, never physical ground truth.
- Player intervention is institutional and indirect; no command may directly set happiness, health, income, access, support, disaster outcome, or final grade.
- Use Entity, State, Relation, Perception, Action, Memory, Capability, Authority, and Legitimacy rather than phenomenon-specific correction systems.
- Separate ground truth from observations; UI text and observation records cannot mutate Core state.
- Distribute bidirectional observation terminals to lottery-selected residents and model selection, participation, refusal, dropout, usage, compensation, anonymity, privacy, and sampling bias.
- Remove follow controls, follower counts, and follow-based ranking completely. Keep plus, minus, bookmark, investigation registration, and source profiles as private 河北恒研 actions.
- Normal policy revision occurs quarterly; annual reviews occur after each twelve-month block; the mayoral election occurs in year four.
- The final-year climax is the fictional 倶利伽羅八朔相撲 plus a forest-park live event plus heavy rain. Organizer, history, venue, rules, visual identity, and participants remain original.
- A/B are successful demonstration outcomes; C/D are failed outcomes. The grade is derived from six explained dimensions, history, uncertainty, and residuals.
- Autosave after each valid month; incompatible or invalid saves must not replace the last valid state.
- Every Core change runs at least 100 seeds; a release candidate runs at least 1,000 seeds.
- Keep the root public prototype v0.7 unchanged and do not deploy Ver1 over it before release acceptance passes.

## Review Focus

- A corrupt or schema-incompatible save must be rejected with a visible diagnostic while the last valid state remains loadable; Task 5 pins this behavior.
- Extreme terminal dropout or an unbalanced sample must reduce coverage and raise uncertainty without changing ground truth; Task 4 pins this behavior.
- A FEED record, investigation report, or authored string that contains state-like fields must be unable to mutate Core state; Tasks 3 and 4 pin this boundary.
- Calendar boundaries must produce quarterly decisions, annual reviews, the year-four election, and the final-year three-pressure climax exactly once; Task 6 pins all boundary ticks.
- The same final-year rain shock must lead to different recovery evidence after different institutional histories without a scripted grade; Tasks 6 and 7 pin this causal behavior.

---

### Task 1: Deterministic Core Foundation

**Files:**
- Modify: `package.json`
- Create: `game/core/constants.mjs`
- Create: `game/core/rng.mjs`
- Test: `tests/core/rng.test.mjs`

**Interfaces:**
- Consumes: a signed or unsigned integer seed supplied at new-game setup.
- Produces: `createRng(seed)`, returning `{ next(), int(min, max), pick(items), snapshot() }`; `restoreRng(snapshot)`; `VERSIONS`, `CALENDAR`, and `LIMITS` constants.

- [ ] **Step 1: Add the unit-test entry point and write the failing RNG tests**

```json
{
  "scripts": {
    "test:unit": "node --test tests/core tests/scenario tests/observation",
    "test:e2e": "playwright test",
    "test": "npm run test:unit && npm run test:e2e",
    "validate:100": "node scripts/validate-ver1.mjs --runs 100",
    "validate:1000": "node scripts/validate-ver1.mjs --runs 1000"
  }
}
```

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng, restoreRng } from '../../game/core/rng.mjs';

test('same seed produces the same sequence', () => {
  const a = createRng(164);
  const b = createRng(164);
  assert.deepEqual(Array.from({ length: 20 }, () => a.next()), Array.from({ length: 20 }, () => b.next()));
});

test('snapshot resumes at the next draw', () => {
  const rng = createRng(2029);
  rng.next();
  const restored = restoreRng(rng.snapshot());
  assert.equal(restored.next(), rng.next());
});

test('integer draws remain inside inclusive bounds', () => {
  const rng = createRng(-1);
  for (let i = 0; i < 1000; i += 1) {
    const value = rng.int(3, 7);
    assert.ok(value >= 3 && value <= 7);
  }
});
```

- [ ] **Step 2: Run the RNG test and verify RED**

Run: `node --test tests/core/rng.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `game/core/rng.mjs`.

- [ ] **Step 3: Implement version constants and a serializable xorshift32 RNG**

```js
export const VERSIONS = Object.freeze({ schema: 1, rules: 'ver1.0.0', scenario: 'kurikara-1.0.0' });
export const CALENDAR = Object.freeze({ startYear: 2029, startMonth: 4, totalTicks: 60 });
export const LIMITS = Object.freeze({ residentsMin: 1000, residentsMax: 2000, relationMin: -1, relationMax: 1 });
```

```js
const normalize = seed => (Number(seed) >>> 0) || 0x6d2b79f5;
export function createRng(seed) {
  let state = normalize(seed);
  return {
    next() { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; state >>>= 0; return state / 0x100000000; },
    int(min, max) { return min + Math.floor(this.next() * (max - min + 1)); },
    pick(items) { if (!items.length) throw new RangeError('pick requires items'); return items[this.int(0, items.length - 1)]; },
    snapshot() { return { algorithm: 'xorshift32', state }; }
  };
}
export const restoreRng = snapshot => createRng(snapshot.state);
```

- [ ] **Step 4: Run unit tests and verify GREEN**

Run: `npm run test:unit`

Expected: PASS with three RNG tests and no warnings.

- [ ] **Step 5: Commit the foundation**

```bash
git add package.json game/core/constants.mjs game/core/rng.mjs tests/core/rng.test.mjs
git commit -m "feat: add deterministic Ver1 core foundation"
```

### Task 2: Versioned Game State and Representative Population

**Files:**
- Create: `game/core/state.mjs`
- Create: `game/core/invariants.mjs`
- Create: `game/scenario/kurikara.mjs`
- Create: `tests/helpers/ver1-fixtures.mjs`
- Test: `tests/core/state.test.mjs`

**Interfaces:**
- Consumes: `createInitialState({ seed, leaderId, priorities, terminalPolicy })` with five priorities totaling 300 and a valid four-person leader ID.
- Produces: JSON-serializable `GameState`; `validateState(state)` returning `{ ok, errors }`; `getCalendar(tick)` returning `{ year, month, trialYear }`; shared deterministic test fixtures `setup`, `monthlyInput`, `memoryStorage`, and `withTerminalDropout`.

- [ ] **Step 1: Write failing creation, bounds, and immutability tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, getCalendar } from '../../game/core/state.mjs';
import { validateState } from '../../game/core/invariants.mjs';

const setup = { seed: 164, leaderId: 'miyashita', priorities: { welfare: 60, market: 60, future: 60, technology: 60, environment: 60 }, terminalPolicy: { coverage: .2, balance: .7, compensation: 40, dataScope: .5, anonymity: .8, surveyFrequency: 1 } };

test('creates 1500 weighted residents without real personal data', () => {
  const state = createInitialState(setup);
  assert.equal(Object.keys(state.entities.residents).length, 1500);
  assert.equal(state.tick, 0);
  assert.deepEqual(getCalendar(0), { year: 2029, month: 4, trialYear: 1 });
  assert.equal(JSON.stringify(state).includes('follow'), false);
  assert.deepEqual(validateState(state), { ok: true, errors: [] });
});

test('rejects unconstrained priorities and unknown leaders', () => {
  assert.throws(() => createInitialState({ ...setup, leaderId: 'unknown' }), /leader/);
  assert.throws(() => createInitialState({ ...setup, priorities: { ...setup.priorities, welfare: 100 } }), /total 300/);
});

test('representative residents and relations stay within owned bounds', () => {
  const state = createInitialState(setup);
  for (const resident of Object.values(state.entities.residents)) assert.ok(resident.weight > 0);
  for (const relation of Object.values(state.relations)) assert.ok(relation.strength >= -1 && relation.strength <= 1);
});
```

Create `tests/helpers/ver1-fixtures.mjs` with the exact `setup` object above plus:

```js
export const monthlyInput = (tick, overrides = {}) => ({ tick, temperatureC: 18, rainfallMm: 80, snowCm: 0, economicDemand: .5, wildlifePressure: .2, authoredText: '', ...overrides });
export const memoryStorage = () => { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) }; };
export const withTerminalDropout = (state, dropout) => ({ ...structuredClone(state), player: { ...state.player, terminalPolicy: { ...state.player.terminalPolicy, forcedDropoutForTest: dropout } } });
```

- [ ] **Step 2: Run state tests and verify RED**

Run: `node --test tests/core/state.test.mjs`

Expected: FAIL because `state.mjs` does not exist.

- [ ] **Step 3: Implement the 倶利伽羅町 scenario and state factory**

Implement a fixed scenario containing six fictional districts, households, roads, rail access, clinics, schools, care sites, drainage, forest park, the original 倶利伽羅八朔相撲 association, four staff members, mayor, factions, media, and institutions. Generate exactly 1,500 synthetic residents from the seeded RNG with age, household, district, occupation, income condition, health, mobility, capabilities, relations, perceptions, actions, memories, and positive population weight. Store domains under:

```js
{
  versions, seed, rng, tick, calendar,
  entities: { residents, households, districts, institutions, facilities, staff, actors },
  relations, memories, actions: [], residuals: [], observations: [], history: [],
  player: { leaderId, priorities, terminalPolicy, bookmarks: [], investigations: [] },
  metrics: { socialStability, adaptability, legitimacy, fiscalSustainability, resilience, observationQuality },
  gates: { authority, administrativeCapacity, budget },
  pendingEffects: [], phase: 'observation', complete: false
}
```

`getCalendar(tick)` uses a zero-based offset from April 2029 and never reads the wall clock. `validateState` checks versions, tick 0–60, entity counts, finite numbers, relation bounds, non-negative count-like fields, five-priority total, known phases, and JSON serialization.

- [ ] **Step 4: Run state tests and the existing prototype tests**

Run: `npm run test:unit && npm run test:e2e`

Expected: all new unit tests and all existing public-prototype Playwright tests PASS.

- [ ] **Step 5: Commit the state model**

```bash
git add game/core/state.mjs game/core/invariants.mjs game/scenario/kurikara.mjs tests/helpers/ver1-fixtures.mjs tests/core/state.test.mjs
git commit -m "feat: model Kurikara representative population"
```

### Task 3: Institutional Commands and Transactional Monthly Advancement

**Files:**
- Create: `game/core/commands.mjs`
- Create: `game/core/advance.mjs`
- Create: `game/core/transitions.mjs`
- Test: `tests/core/advance.test.mjs`

**Interfaces:**
- Consumes: `applyCommand(state, command)` where commands are `SET_PRIORITIES`, `SET_TERMINAL_POLICY`, `APPROVE_PROPOSAL`, `REJECT_PROPOSAL`, or `REGISTER_INVESTIGATION`.
- Produces: `{ ok, state, errors }`; `advanceMonth(state, scenarioInput)` returning `{ ok, state, events, residuals }` without mutating its input.

- [ ] **Step 1: Write failing causal and transaction tests**

```js
test('priority command changes institutions but not resident outcomes directly', () => {
  const before = createInitialState(setup);
  const result = applyCommand(before, { type: 'SET_PRIORITIES', priorities: { welfare: 80, market: 50, future: 60, technology: 40, environment: 70 } });
  assert.equal(result.ok, true);
  assert.deepEqual(result.state.entities.residents, before.entities.residents);
  assert.notEqual(result.state.gates.administrativeCapacity, before.gates.administrativeCapacity);
});

test('monthly advance is deterministic, immutable, and applies delayed effects', () => {
  const a = createInitialState(setup);
  const b = structuredClone(a);
  const a1 = advanceMonth(a, monthlyInput(a.tick));
  const b1 = advanceMonth(b, monthlyInput(b.tick));
  assert.deepEqual(a1, b1);
  assert.equal(a.tick, 0);
  assert.equal(a1.state.tick, 1);
  assert.ok(a1.state.pendingEffects.some(effect => effect.remainingMonths > 0));
});

test('failed invariant keeps the last valid state and records a classified residual', () => {
  const before = createInitialState(setup);
  const result = advanceMonth(before, { ...monthlyInput(0), rainfallMm: Number.NaN });
  assert.equal(result.ok, false);
  assert.deepEqual(result.state, before);
  assert.equal(result.residuals.at(-1).classification, 'INVALID_SCENARIO_INPUT');
});

test('state-shaped authored text cannot write ground truth', () => {
  const before = createInitialState(setup);
  const result = advanceMonth(before, { ...monthlyInput(0), authoredText: '{"metrics":{"legitimacy":100}}' });
  assert.notEqual(result.state.metrics.legitimacy, 100);
});
```

- [ ] **Step 2: Run the causal tests and verify RED**

Run: `node --test tests/core/advance.test.mjs`

Expected: FAIL because `applyCommand` and `advanceMonth` are missing.

- [ ] **Step 3: Implement command validation and shared transitions**

Each command clones state, validates phase, calendar gate, budget, Authority, Legitimacy, and administrative capacity, records the action, and queues effects with `remainingMonths`. `transitions.mjs` updates residents, households, facilities, relations, memory, finance, mobility, health access, infrastructure, environment, information trust, and political relationships through shared state and relations. It must not contain grade letters, authored FEED strings, or direct setters for resident outcomes.

`advanceMonth` must:

1. validate input and current state;
2. clone the state and restore RNG;
3. apply due effects and shared local rules;
4. apply scenario conditions through the same rules;
5. append actions, memories, history, and classified residuals;
6. advance the calendar by one tick;
7. validate the candidate;
8. return the candidate only when valid.

Use this transaction shape in `advance.mjs`:

```js
export function advanceMonth(state, scenarioInput) {
  const inputErrors = validateScenarioInput(state, scenarioInput);
  if (inputErrors.length) return failedAdvance(state, 'INVALID_SCENARIO_INPUT', inputErrors);
  const candidate = structuredClone(state);
  const rng = restoreRng(candidate.rng);
  const events = [];
  applyDueEffects(candidate, events);
  applySharedTransitions(candidate, scenarioInput, rng, events);
  candidate.actions.push({ type: 'ADVANCE_MONTH', tick: state.tick, scenarioInput: structuredClone(scenarioInput) });
  candidate.tick += 1;
  candidate.calendar = getCalendar(candidate.tick);
  candidate.rng = rng.snapshot();
  candidate.history.push({ tick: candidate.tick, eventIds: events.map(event => event.id) });
  const validation = validateState(candidate);
  if (!validation.ok) return failedAdvance(state, 'STATE_INVARIANT', validation.errors);
  return { ok: true, state: candidate, events, residuals: candidate.residuals };
}
```

- [ ] **Step 4: Run Core and full regression suites**

Run: `npm run test:unit && npm run test:e2e`

Expected: all tests PASS; the root prototype remains unchanged.

- [ ] **Step 5: Commit the monthly Core loop**

```bash
git add game/core/commands.mjs game/core/advance.mjs game/core/transitions.mjs tests/core/advance.test.mjs
git commit -m "feat: add institutional monthly simulation loop"
```

### Task 4: Observation-Terminal Sampling and FEED Records

**Files:**
- Create: `game/observation/terminal.mjs`
- Create: `game/observation/feed.mjs`
- Create: `game/observation/investigations.mjs`
- Test: `tests/observation/terminal.test.mjs`

**Interfaces:**
- Consumes: read-only Core state and `player.terminalPolicy`.
- Produces: `selectTerminalPanel(state)`, `observeMonth(state, events)`, and `resolveInvestigations(state)`; returned observation objects contain source, confidence, distortion, scope, text key, and evidence references but no mutable Core reference.

- [ ] **Step 1: Write failing sampling-boundary tests**

```js
test('lottery panel is deterministic and policy-sensitive', () => {
  const state = createInitialState(setup);
  assert.deepEqual(selectTerminalPanel(state), selectTerminalPanel(structuredClone(state)));
  assert.ok(selectTerminalPanel(state).members.length > 0);
});

test('dropout lowers coverage and raises uncertainty without changing truth', () => {
  const state = createInitialState(setup);
  const truth = structuredClone(state.entities);
  const observed = observeMonth(withTerminalDropout(state, .95), [{ type: 'ROAD_CLOSURE', districtId: 'east' }]);
  assert.ok(observed.summary.coverage < .1);
  assert.ok(observed.summary.uncertainty > .7);
  assert.deepEqual(state.entities, truth);
});

test('feed exposes internal actions but no follow mechanic', () => {
  const feed = buildFeed(createInitialState(setup), []);
  assert.deepEqual(feed.actions, ['plus', 'minus', 'bookmark', 'investigate', 'source-profile']);
  assert.equal(JSON.stringify(feed).includes('follow'), false);
});

test('observation payload cannot mutate core state', () => {
  const state = createInitialState(setup);
  const feed = buildFeed(state, [{ text: '{"budget":999999}', evidenceRefs: [] }]);
  feed.items[0].text = 'changed';
  assert.notEqual(state.gates.budget, 999999);
});
```

- [ ] **Step 2: Run observation tests and verify RED**

Run: `node --test tests/observation/terminal.test.mjs`

Expected: FAIL because observation modules are missing.

- [ ] **Step 3: Implement lottery, participation, reporting, and investigations**

Select terminal recipients from all 1,500 representative residents using seed plus stable resident ID. Calculate acceptance, refusal, usage, and dropout from compensation, anonymity, privacy concern, survey frequency, digital access, age, district, trust, and burden. Convert eligible Core events into incomplete resident posts, questionnaires, incident reports, official notices, media items, staff investigations, and monthly summaries. Each item records `observedTick`, `sourceId`, `sourceType`, `districtId`, `domain`, `confidence`, `distortion`, `evidenceRefs`, and an authored `textKey`; only `textKey` is rendered into prose by UI copy.

Keep the boundary explicit:

```js
export function observeMonth(state, events) {
  const panel = selectTerminalPanel(state);
  const items = events.flatMap(event => visibleSources(panel, event).map(source => Object.freeze({
    id: `${state.tick}:${event.id}:${source.id}`,
    observedTick: state.tick,
    sourceId: source.id,
    sourceType: source.type,
    districtId: source.districtId,
    domain: event.domain,
    confidence: confidenceFor(source, event),
    distortion: distortionFor(source, event),
    evidenceRefs: Object.freeze([event.id]),
    textKey: textKeyFor(source, event)
  })));
  return Object.freeze({ items: Object.freeze(items), summary: Object.freeze(summarizeCoverage(panel, items)) });
}

export const FEED_ACTIONS = Object.freeze(['plus', 'minus', 'bookmark', 'investigate', 'source-profile']);
```

- [ ] **Step 4: Run all unit and prototype tests**

Run: `npm run test:unit && npm run test:e2e`

Expected: all tests PASS and no source file under `game/observation` imports from `game/core/transitions.mjs`.

- [ ] **Step 5: Commit the observation layer**

```bash
git add game/observation tests/observation/terminal.test.mjs
git commit -m "feat: add biased observation terminal feed"
```

### Task 5: Autosave, Compatibility Checks, and Deterministic Replay

**Files:**
- Create: `game/core/persistence.mjs`
- Create: `game/core/replay.mjs`
- Test: `tests/core/persistence.test.mjs`

**Interfaces:**
- Consumes: valid `GameState`, action log, and a storage adapter with `getItem`, `setItem`, and `removeItem`.
- Produces: `saveGame(storage, state)`, `loadGame(storage)`, `clearSave(storage)`, and `replayGame(initialSetup, actionLog)`.

- [ ] **Step 1: Write failing round-trip, corruption, and replay tests**

```js
test('save/load is equivalent after a completed month', () => {
  const storage = memoryStorage();
  const state = advanceMonth(createInitialState(setup), monthlyInput(0)).state;
  saveGame(storage, state);
  assert.deepEqual(loadGame(storage), { ok: true, state });
});

test('incompatible save is rejected without overwriting last valid save', () => {
  const storage = memoryStorage();
  const state = createInitialState(setup);
  saveGame(storage, state);
  storage.setItem('adhoms.ver1.candidate', JSON.stringify({ ...state, versions: { ...state.versions, schema: 99 } }));
  const loaded = loadGame(storage);
  assert.equal(loaded.ok, true);
  assert.deepEqual(loaded.state, state);
  assert.equal(loaded.diagnostics.at(-1).classification, 'INCOMPATIBLE_SAVE');
});

test('replay reproduces final state including rng snapshot', () => {
  let state = createInitialState(setup);
  for (let tick = 0; tick < 12; tick += 1) state = advanceMonth(state, monthlyInput(tick)).state;
  assert.deepEqual(replayGame(setup, state.actions), state);
});
```

- [ ] **Step 2: Run persistence tests and verify RED**

Run: `node --test tests/core/persistence.test.mjs`

Expected: FAIL because persistence and replay modules are missing.

- [ ] **Step 3: Implement two-slot transactional local persistence**

Write a candidate record with checksum, schema/rules/scenario versions, save timestamp, and state payload; parse and validate it; then promote it to `adhoms.ver1.valid`. `loadGame` first validates the candidate, records diagnostics for invalid candidates, and falls back to the last valid record. Replay starts from setup and submits recorded commands at their recorded ticks before monthly advancement; it compares final digest, RNG state, history length, and residual classifications.

Use two explicit slots and never delete the valid slot before candidate validation:

```js
const VALID_KEY = 'adhoms.ver1.valid';
const CANDIDATE_KEY = 'adhoms.ver1.candidate';

export function saveGame(storage, state) {
  const validation = validateState(state);
  if (!validation.ok) return { ok: false, errors: validation.errors };
  const record = makeSaveRecord(state);
  storage.setItem(CANDIDATE_KEY, JSON.stringify(record));
  const checked = parseSaveRecord(storage.getItem(CANDIDATE_KEY));
  if (!checked.ok) return checked;
  storage.setItem(VALID_KEY, JSON.stringify(record));
  storage.removeItem(CANDIDATE_KEY);
  return { ok: true };
}

export function loadGame(storage) {
  const candidate = parseSaveRecord(storage.getItem(CANDIDATE_KEY));
  if (candidate.ok) return { ok: true, state: candidate.state, diagnostics: [] };
  const valid = parseSaveRecord(storage.getItem(VALID_KEY));
  return valid.ok ? { ok: true, state: valid.state, diagnostics: candidate.diagnostics } : valid;
}
```

- [ ] **Step 4: Run unit tests twice to prove clean repeatability**

Run: `npm run test:unit && npm run test:unit`

Expected: both runs PASS with identical test counts.

- [ ] **Step 5: Commit persistence and replay**

```bash
git add game/core/persistence.mjs game/core/replay.mjs tests/core/persistence.test.mjs
git commit -m "feat: add transactional saves and replay"
```

### Task 6: Five-Year Cadence, Election, and Three-Pressure Climax

**Files:**
- Create: `game/scenario/calendar.mjs`
- Create: `game/scenario/events.mjs`
- Create: `game/scenario/copy.ja.mjs`
- Test: `tests/scenario/calendar.test.mjs`
- Test: `tests/scenario/climax.test.mjs`

**Interfaces:**
- Consumes: current tick, calendar, scenario entities, infrastructure/relationship state, and seeded RNG.
- Produces: `getRequiredPhases(state)`, `getScenarioInput(state)`, and original Japanese copy keyed by observation IDs.

- [ ] **Step 1: Write failing cadence and climax tests**

```js
test('calendar emits each gate exactly once', () => {
  const phases = Array.from({ length: 60 }, (_, tick) => getRequiredPhases({ tick })).flat();
  assert.equal(phases.filter(x => x === 'quarterly-decision').length, 20);
  assert.equal(phases.filter(x => x === 'annual-review').length, 5);
  assert.equal(phases.filter(x => x === 'mayoral-election').length, 1);
  assert.equal(phases.filter(x => x === 'final-climax').length, 1);
});

test('fictional event uses the approved name and original-fiction disclaimer', () => {
  assert.equal(JA_COPY.events.hassaku.name, '倶利伽羅八朔相撲');
  assert.match(JA_COPY.credits.fiction, /架空/);
  assert.doesNotMatch(JSON.stringify(JA_COPY.events.hassaku), /大國魂|小諸|府中/);
});

test('same rain shock produces different recovery from different histories', () => {
  const prepared = runToClimax({ ...setup, strategy: 'distributed-resilience', rainSeed: 77 });
  const brittle = runToClimax({ ...setup, strategy: 'centralized-efficiency', rainSeed: 77 });
  assert.equal(prepared.events.rainfallMm, brittle.events.rainfallMm);
  assert.notDeepEqual(prepared.state.metrics, brittle.state.metrics);
  assert.ok(prepared.state.metrics.resilience > brittle.state.metrics.resilience);
});
```

In `tests/scenario/climax.test.mjs`, define `runToClimax` by creating the initial state, advancing ticks 0–52 with `getScenarioInput`, and submitting one of two fixed quarterly command sequences. `distributed-resilience` uses priorities `{ welfare: 65, market: 45, future: 70, technology: 45, environment: 75 }` and approves distributed-volunteer, drainage-maintenance, and multi-site-shelter proposals. `centralized-efficiency` uses `{ welfare: 40, market: 90, future: 65, technology: 75, environment: 30 }` and rejects those three proposals. At tick 53 pass the same `rainSeed` to both scenario inputs and return that advancement result.

- [ ] **Step 2: Run scenario tests and verify RED**

Run: `node --test tests/scenario/calendar.test.mjs tests/scenario/climax.test.mjs`

Expected: FAIL because scenario calendar and events are missing.

- [ ] **Step 3: Implement calendar inputs and shared-resource pressure**

Quarterly decisions occur after ticks 3, 6, 9, and 12 of each trial year; annual review is presented at the same boundary after each year’s fourth quarterly decision, without advancing an extra month. The election occurs during trial year four and changes mayor/faction relations, delegated Authority, and implementation friction. In final-year late summer, 倶利伽羅八朔相撲 and the forest-park live event draw on roads, volunteers, emergency staff, shelters, communication, and municipal attention while heavy rain loads drainage, transport, and evacuation. Outcomes emerge from capacity, relations, preparation memory, and current conditions; the scenario never assigns success, failure, or grade.

Encode gates as a list so overlapping annual and quarterly gates are both preserved:

```js
export function getRequiredPhases({ tick }) {
  const phases = [];
  if ((tick + 1) % 3 === 0) phases.push('quarterly-decision');
  if ((tick + 1) % 12 === 0) phases.push('annual-review');
  if (tick === 42) phases.push('mayoral-election');
  if (tick === 53) phases.push('final-climax');
  return phases;
}

export function getScenarioInput(state) {
  const calendar = getCalendar(state.tick);
  const weather = seasonalWeather(state.seed, state.tick);
  return Object.freeze({ tick: state.tick, calendar, ...weather, pressures: pressureInputs(state, calendar) });
}
```

- [ ] **Step 4: Run unit and regression suites**

Run: `npm run test:unit && npm run test:e2e`

Expected: all tests PASS and each special event appears once in the five-year history.

- [ ] **Step 5: Commit the five-year scenario**

```bash
git add game/scenario tests/scenario/calendar.test.mjs tests/scenario/climax.test.mjs
git commit -m "feat: add five-year Kurikara scenario cadence"
```

### Task 7: Explained Six-Dimension Final Evaluation

**Files:**
- Create: `game/core/evaluation.mjs`
- Modify: `tests/helpers/ver1-fixtures.mjs`
- Test: `tests/core/evaluation.test.mjs`

**Interfaces:**
- Consumes: a complete tick-60 state with history, actions, memories, uncertainty, and residuals.
- Produces: `evaluateRun(state)` returning `{ grade, success, dimensions, evidence, uncertainty, tradeoffs, unresolvedResiduals }`; the test fixture `completeRun(config)` that advances exactly 60 valid monthly inputs and submits the fixed neutral quarterly command at required gates.

- [ ] **Step 1: Write failing derivation and explanation tests**

```js
test('evaluation derives six dimensions and explains evidence', () => {
  const report = evaluateRun(completeRun(setup));
  assert.deepEqual(Object.keys(report.dimensions).sort(), ['adaptability','fiscalSustainability','legitimacy','observationQuality','resilience','socialStability']);
  assert.match(report.grade, /^[A-D]$/);
  assert.equal(report.success, ['A', 'B'].includes(report.grade));
  assert.ok(report.evidence.length >= 6);
  assert.ok(report.tradeoffs.length > 0);
});

test('evaluation rejects incomplete runs and cannot be commanded directly', () => {
  assert.throws(() => evaluateRun(createInitialState(setup)), /60 months/);
  assert.equal(applyCommand(createInitialState(setup), { type: 'SET_GRADE', grade: 'A' }).ok, false);
});

test('high uncertainty limits confidence without silently changing the grade', () => {
  const state = completeRun(setup);
  state.metrics.observationQuality = 10;
  const report = evaluateRun(state);
  assert.ok(report.uncertainty.level >= .5);
  assert.ok(report.evidence.some(item => item.qualifier === 'low-confidence'));
});
```

Extend `tests/helpers/ver1-fixtures.mjs` with `completeRun(config = setup)`: call `createInitialState(config)`, loop while `state.tick < 60`, submit `{ type: 'SET_PRIORITIES', priorities: config.priorities }` whenever `getRequiredPhases(state)` contains `quarterly-decision`, call `advanceMonth(state, getScenarioInput(state))`, assert `result.ok`, and return the tick-60 state.

- [ ] **Step 2: Run evaluation tests and verify RED**

Run: `node --test tests/core/evaluation.test.mjs`

Expected: FAIL because `evaluation.mjs` is missing.

- [ ] **Step 3: Implement evidence-based evaluation**

Normalize each dimension from Core metrics and history; apply explicit documented bands for A, B, C, and D; require no catastrophic invariant breach for A/B; keep observation quality as its own dimension rather than pretending uncertainty is truth. Select evidence from recorded causal chains, memories, recovery duration, fiscal path, election legitimacy, terminal coverage, and residuals. Return stable evidence IDs so the UI can render Japanese explanations without altering the result.

Use named dimensions and a transparent grade band:

```js
const DIMENSIONS = ['socialStability', 'adaptability', 'legitimacy', 'fiscalSustainability', 'resilience', 'observationQuality'];
const gradeFor = score => score >= 78 ? 'A' : score >= 64 ? 'B' : score >= 48 ? 'C' : 'D';

export function evaluateRun(state) {
  if (state.tick !== 60) throw new Error('evaluation requires 60 months');
  const dimensions = Object.fromEntries(DIMENSIONS.map(key => [key, normalizeMetric(state.metrics[key])]));
  const score = DIMENSIONS.reduce((sum, key) => sum + dimensions[key], 0) / DIMENSIONS.length;
  let grade = gradeFor(score);
  if (hasCatastrophicInvariant(state) && ['A', 'B'].includes(grade)) grade = 'C';
  return Object.freeze({
    grade,
    success: grade === 'A' || grade === 'B',
    dimensions: Object.freeze(dimensions),
    evidence: Object.freeze(selectCausalEvidence(state, dimensions)),
    uncertainty: Object.freeze(evaluateUncertainty(state)),
    tradeoffs: Object.freeze(selectTradeoffs(state)),
    unresolvedResiduals: Object.freeze(state.residuals.filter(item => !item.resolved))
  });
}
```

- [ ] **Step 4: Run the complete unit suite**

Run: `npm run test:unit`

Expected: all unit tests PASS with A/B success and C/D failure assertions.

- [ ] **Step 5: Commit evaluation**

```bash
git add game/core/evaluation.mjs tests/helpers/ver1-fixtures.mjs tests/core/evaluation.test.mjs
git commit -m "feat: derive explained Ver1 evaluation"
```

### Task 8: Formal Portrait Web UI and Complete Player Flow

**Files:**
- Create: `ver1/index.html`
- Create: `ver1/styles.css`
- Create: `game/ui/app.mjs`
- Create: `game/ui/render-feed.mjs`
- Create: `game/ui/render-dialogs.mjs`
- Create: `game/ui/forecast.mjs`
- Test: `tests/ver1-flow.spec.js`
- Test: `tests/ver1-accessibility.spec.js`

**Interfaces:**
- Consumes: Core command/result functions, Observation records, Scenario Japanese copy, persistence, and evaluation report.
- Produces: the `/ver1/` setup → monthly observation → quarterly decision → annual review → election → climax → final evaluation flow.

- [ ] **Step 1: Write the failing formal-flow Playwright test**

```js
test('first-time player completes all 60 months without follow mechanics', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/ver1/');
  await expect(page.getByText(/抽選された住民.*観測端末/)).toBeVisible();
  await expect(page.getByRole('button', { name: /フォロー/ })).toHaveCount(0);
  await page.getByLabel('チームリーダー').selectOption('miyashita');
  await page.getByRole('button', { name: '5年間の実証を開始' }).click();
  for (let tick = 0; tick < 60; tick += 1) {
    await page.getByRole('button', { name: '翌月へ' }).click();
    if (await page.getByRole('dialog', { name: '四半期判断' }).isVisible().catch(() => false)) await page.getByRole('button', { name: '判断を確定' }).click();
    if (await page.getByRole('dialog', { name: '年次報告' }).isVisible().catch(() => false)) await page.getByRole('button', { name: '報告を閉じる' }).click();
  }
  await expect(page.getByText('5 YEAR FIELD TRIAL COMPLETE')).toBeVisible();
  await expect(page.getByText(/実証評価 [A-D]/)).toBeVisible();
  await expect(page.getByText(/A・B：実証成功|C・D：実証失敗/)).toBeVisible();
});
```

Add separate tests that: reload after tick 17 and resume at tick 17; confirm plus/minus/bookmark/investigation/source-profile actions; verify positive numeric changes use blue and negative changes red; inspect the five-year forecast line chart; confirm the year-four election and all three final pressures are visible; run at 390×844 and 1280×900 viewports; tab through every interactive control; and assert zero browser console errors.

- [ ] **Step 2: Run the formal UI tests and verify RED**

Run: `npx playwright test tests/ver1-flow.spec.js tests/ver1-accessibility.spec.js`

Expected: FAIL with 404 for `/ver1/`.

- [ ] **Step 3: Implement the approved portrait interface**

Reuse the visual language of the existing FIELD TERMINAL: 520px portrait shell, sticky header, chronological FEED, reply hierarchy, lower month/year action area, and load-more beside the FEED. Put the title, premise, lottery-terminal explanation, and setup guidance into the FEED flow. Render only observation DTOs and dispatch only validated commands. Quarterly dialogs expose constrained priorities and proposals; annual dialogs include staff advice and an SVG five-year forecast with uncertainty band; final report renders all six dimensions, causal evidence, trade-offs, uncertainty, residuals, and the fiction disclaimer. Staff dialogue changes with leader choice while Core results stay identical for identical commands and seed.

Route every player action through the command boundary and save only after a valid month:

```js
async function onNextMonth() {
  const result = advanceMonth(gameState, getScenarioInput(gameState));
  if (!result.ok) return renderDiagnostic(result.residuals.at(-1));
  gameState = result.state;
  observations = observeMonth(gameState, result.events);
  saveGame(localStorage, gameState);
  renderFeed(observations, uiState);
  for (const phase of getRequiredPhases({ tick: gameState.tick - 1 })) await openPhaseDialog(phase, gameState);
  if (gameState.tick === 60) renderEvaluation(evaluateRun(gameState));
}

function onInstitutionalDecision(command) {
  const result = applyCommand(gameState, command);
  if (!result.ok) return renderCommandErrors(result.errors);
  gameState = result.state;
  renderCurrentScreen();
}
```

- [ ] **Step 4: Run UI, unit, and root-prototype regression tests**

Run: `npm test`

Expected: all formal Ver1, Core, and archived prototype tests PASS.

- [ ] **Step 5: Commit the formal player flow**

```bash
git add ver1 game/ui tests/ver1-flow.spec.js tests/ver1-accessibility.spec.js
git commit -m "feat: add complete Ver1 web player flow"
```

### Task 9: Seed Validation and Release Gates

**Files:**
- Create: `scripts/validate-ver1.mjs`
- Create: `tests/ver1-release.spec.js`
- Create: `.github/workflows/ver1-validation.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: run count from `--runs`, deterministic setup generators, and the complete Ver1 runtime.
- Produces: a non-zero process exit on any invariant, replay mismatch, calendar failure, invalid relation, negative count, forbidden mutation, missing evaluation, or unacceptable grade/explanation structure.

- [ ] **Step 1: Write the failing validator contract test**

```js
test('validator completes 100 diverse seeded runs', () => {
  const result = spawnSync(process.execPath, ['scripts/validate-ver1.mjs', '--runs', '100'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const summary = JSON.parse(result.stdout);
  assert.equal(summary.completed, 100);
  assert.equal(summary.failures, 0);
  assert.equal(summary.deterministicReplayFailures, 0);
  assert.deepEqual(summary.grades.sort(), ['A', 'B', 'C', 'D']);
});
```

- [ ] **Step 2: Run release tests and verify RED**

Run: `npx playwright test tests/ver1-release.spec.js && npm run validate:100`

Expected: FAIL because the validator and workflow are missing.

- [ ] **Step 3: Implement validation and CI without changing public deployment**

Generate valid but varied leader, priority, and terminal-policy setups; run scripted conservative, adaptive, market-first, welfare-first, and observation-light strategies across seeds. For every run validate 60-month completion, deterministic replay, relation bounds, non-negative count-like state, save/load equivalence, one election, one climax, no forbidden command, and a fully explained A–D report. Print one JSON summary only. GitHub Actions runs unit tests, Playwright tests, and 100 seeds on every `ver1-production` push; the 1,000-seed command remains the explicit release-candidate gate. README labels root as archived prototype and `/ver1/` as development-only until acceptance.

The validator exits on the accumulated failure count:

```js
const runs = readRuns(process.argv);
const summary = { completed: 0, failures: 0, deterministicReplayFailures: 0, grades: [] };
for (let seed = 1; seed <= runs; seed += 1) {
  try {
    const setup = generatedSetup(seed);
    const state = executeStrategy(setup, strategyFor(seed));
    assertReleaseInvariants(state);
    if (!deepEqual(replayGame(setup, state.actions), state)) summary.deterministicReplayFailures += 1;
    summary.grades.push(evaluateRun(state).grade);
    summary.completed += 1;
  } catch (error) {
    summary.failures += 1;
  }
}
summary.grades = [...new Set(summary.grades)];
process.stdout.write(`${JSON.stringify(summary)}\n`);
process.exitCode = summary.failures || summary.deterministicReplayFailures ? 1 : 0;
```

- [ ] **Step 4: Run fresh completion verification**

Run: `npm ci && npm run test:unit && npm run test:e2e && npm run validate:100 && git diff --check`

Expected: dependency install exits 0; all tests PASS; validator reports 100 completed, 0 failures, 0 replay failures; diff check emits no output.

- [ ] **Step 5: Run the release-candidate seed gate before any release claim**

Run: `npm run validate:1000`

Expected: JSON reports 1,000 completed runs with 0 invariant or replay failures. If runtime makes this impractical in the current session, do not call Ver1 complete; record the exact unfinished gate.

- [ ] **Step 6: Commit release validation**

```bash
git add scripts/validate-ver1.mjs tests/ver1-release.spec.js .github/workflows/ver1-validation.yml README.md
git commit -m "test: add Ver1 release validation gates"
```

## Final Verification Checklist

- [ ] Re-read every acceptance criterion in the design spec and map it to a passing test or a documented manual test.
- [ ] Run `npm ci && npm run test:unit && npm run test:e2e && npm run validate:1000 && git diff --check` from a clean checkout.
- [ ] Manually complete one fresh 60-month run at 390×844 and record elapsed time, comprehension problems, and any clipped controls.
- [ ] Confirm the root v0.7 files and current public deployment have not changed.
- [ ] Confirm no `follow`, `follower`, real-event logo, real organizer, or copied real-event description appears anywhere under `game/` or `ver1/`.
- [ ] Confirm the exact final climax name is `倶利伽羅八朔相撲` and the credits include the fiction disclaimer.
- [ ] Only after all automated and manual gates pass, prepare a separate release decision; do not deploy as part of this plan.
