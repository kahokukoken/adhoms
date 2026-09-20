# ADHOMS Phase 2 Simulation Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the current TGS playtest as a stable presentation build while creating the first real ADHOMS simulation vertical slice underneath a separate Phase 2 branch.

**Architecture:** Keep the authored TGS FEED and meetings as a presentation layer and test oracle. Add a deterministic simulation core with Entity / State / Relation / Perception / Action / Memory as explicit data structures. The first vertical slice models transport access, resident routines, service capacity, weather friction, information propagation, and memory across monthly ticks; authored scenes can read simulation state but do not directly set core outcomes.

**Tech Stack:** Browser JavaScript, Node.js test runner, Playwright for end-to-end QA, deterministic seeded simulation logic.

**Spec:** Notion `ADHOMS Core Model — Rev.0.1` + `ADHOMS Game Design — Rev.0.1`.

## Global Constraints

- Public TGS playtest on `main` is frozen as the accepted presentation baseline.
- Phase 2 implementation happens on `phase2-simulation-core` until a separate integration decision.
- Do not add phenomenon-specific correction constants when an effect can emerge from existing primitives and relations.
- Preserve causal chains, interaction, delay, feedback, history and residuals.
- Player actions modify institutions, priorities or constraints; they do not directly overwrite individual outcomes.
- Simulation must be deterministic under a fixed seed and reproducible in tests.
- Game scripting may select which observations to show, but must not fabricate simulation state.

---

### Task 1: Simulation kernel and canonical data contracts

**Files:**
- Create: `src/sim/model.js`
- Create: `src/sim/world.js`
- Create: `tests/sim/model.test.js`

**Interfaces:**
- Produces `createEntity`, `createRelation`, `createWorld`, `cloneWorld`.
- World contains `entities`, `relations`, `tick`, `memory`, `observations`, `residuals`.

- [ ] Write failing tests proving entities have id/type/state/capabilities, relations have from/to/type/strength, and a world can be cloned without shared mutable state.
- [ ] Run the tests and verify RED.
- [ ] Implement the smallest constructors and clone logic.
- [ ] Run the tests and verify GREEN.
- [ ] Commit.

### Task 2: Deterministic monthly tick

**Files:**
- Create: `src/sim/rng.js`
- Create: `src/sim/tick.js`
- Create: `tests/sim/tick.test.js`

**Interfaces:**
- Produces `createSeededRng(seed)` and `advanceMonth(world, inputs)`.

- [ ] Write failing tests showing equal seeds + equal state yield equal next state and different seeds only affect stochastic choices, not deterministic rules.
- [ ] Run RED.
- [ ] Implement seeded RNG and monthly tick shell.
- [ ] Run GREEN.
- [ ] Commit.

### Task 3: Transport-access vertical slice

**Files:**
- Create: `src/sim/rules/transport.js`
- Create: `src/sim/scenarios/kurikara-baseline.js`
- Create: `tests/sim/transport.test.js`

**Interfaces:**
- Consumes world entities/relations.
- Produces changes in `access`, `travelBurden`, `serviceLoad`, and memory entries.

- [ ] Write failing tests for three resident types: commuter, older resident, student.
- [ ] Verify that changing one bus-service relation affects them differently without resident-specific hard-coded outcomes.
- [ ] Implement local rules using route frequency, distance, schedule fit and alternative mobility relations.
- [ ] Run GREEN.
- [ ] Commit.

### Task 4: Weather friction and compound effects

**Files:**
- Create: `src/sim/rules/weather.js`
- Modify: `src/sim/rules/transport.js`
- Create: `tests/sim/weather-transport.test.js`

**Interfaces:**
- Weather alters relation effectiveness rather than directly assigning success/failure.

- [ ] Write failing tests showing rain/snow increase travel friction and can push an already-stressed route across a service threshold.
- [ ] Implement weather-to-relation friction.
- [ ] Verify the same weather has different outcomes under different baseline capacities.
- [ ] Commit.

### Task 5: Perception, FEED observation and information propagation

**Files:**
- Create: `src/sim/perception.js`
- Create: `src/sim/information.js`
- Create: `tests/sim/perception.test.js`

**Interfaces:**
- Produces observations with source, subject, confidence, visibility and distortion.
- Influencers change propagation, not ground truth.

- [ ] Write failing tests where クリカ and グレート・ノト amplify the same incident differently.
- [ ] Ensure neither actor mutates the underlying incident state directly.
- [ ] Implement perception and propagation rules.
- [ ] Run GREEN.
- [ ] Commit.

### Task 6: Memory, path dependence and residuals

**Files:**
- Create: `src/sim/memory.js`
- Create: `src/sim/residual.js`
- Create: `tests/sim/memory-residual.test.js`

**Interfaces:**
- Memory records prior states/actions with decay or persistence.
- Residual records `observed - predicted` with classification metadata, without auto-fitting.

- [ ] Write failing tests for persistent route avoidance after repeated failures.
- [ ] Write failing tests showing residuals accumulate but do not automatically alter rules.
- [ ] Implement memory and residual capture.
- [ ] Run GREEN.
- [ ] Commit.

### Task 7: Bridge simulation output into the existing FEED shell

**Files:**
- Create: `src/game/sim-adapter.js`
- Modify only Phase 2 copies of FEED/scenario integration files.
- Create: `tests/playtest-phase2.spec.js`

**Interfaces:**
- Produces UI-ready observations from simulation state.
- Authored copy can wrap or narrate observations but cannot overwrite world state.

- [ ] Write failing browser test proving month advance changes FEED because the simulation changed, not because a month-indexed script was selected.
- [ ] Add adapter and a Phase 2 debug readout hidden from ordinary play.
- [ ] Verify the accepted TGS UI structure remains recognizable.
- [ ] Commit.

### Task 8: First falsification harness

**Files:**
- Create: `src/sim/validation.js`
- Create: `tests/sim/validation.test.js`
- Create: `docs/validation/phase2-transport-baseline.md`

**Interfaces:**
- Runs repeated seeded scenarios and reports invariants, divergences and residuals.

- [ ] Define invariants: no negative population counts, relation strength bounded, deterministic replay, no direct influencer mutation of physical state.
- [ ] Run at least 100 seeded simulations of the transport/weather slice.
- [ ] Record where outputs diverge from intended causal behavior.
- [ ] Classify each mismatch as input / relation / local rule / delay / observation / implementation before changing the theory.
- [ ] Commit.

## Phase 2 Exit Criteria

Phase 2 vertical slice is complete when a one-year Kurikara simulation can be replayed from a seed, transport/weather/information interactions produce different outcomes from different starting relations, FEED observations derive from state, residuals are recorded, and the existing public TGS build remains untouched on `main`.