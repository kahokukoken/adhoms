import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../game/core/state.mjs';
import { applyCommand } from '../../game/core/commands.mjs';
import { advanceMonth } from '../../game/core/advance.mjs';
import { monthlyInput, resolvePendingPhases, setup } from '../helpers/ver1-fixtures.mjs';

test('priority command changes institutions but not resident outcomes directly', () => {
  let before = createInitialState(setup);
  for (let tick = 0; tick < 3; tick += 1) before = advanceMonth(before, monthlyInput(tick)).state;
  const result = applyCommand(before, {
    type: 'SET_PRIORITIES',
    priorities: {
      welfare: 80,
      market: 50,
      future: 60,
      technology: 40,
      environment: 70
    }
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.state.entities.residents, before.entities.residents);
  assert.notEqual(
    result.state.gates.administrativeCapacity,
    before.gates.administrativeCapacity
  );
});

test('institutional decisions require their phase and available capacity', () => {
  let state = createInitialState(setup);
  const early = applyCommand(state, { type: 'SET_PRIORITIES', priorities: setup.priorities });
  assert.equal(early.ok, false);
  assert.match(early.errors.join('; '), /quarterly/);

  for (let tick = 0; tick < 3; tick += 1) state = advanceMonth(state, monthlyInput(tick)).state;
  assert.equal(state.phase, 'quarterly-decision');
  const blockedAdvance = advanceMonth(state, monthlyInput(3));
  assert.equal(blockedAdvance.ok, false);
  assert.match(blockedAdvance.residuals.at(-1).errors.join('; '), /pending phase/);

  const constrained = structuredClone(state);
  constrained.gates.administrativeCapacity = 0;
  const unaffordable = applyCommand(constrained, {
    type: 'SET_PRIORITIES',
    priorities: { welfare: 80, market: 50, future: 60, technology: 40, environment: 70 }
  });
  assert.equal(unaffordable.ok, false);
  assert.deepEqual(unaffordable.state, constrained);
  assert.match(unaffordable.errors.join('; '), /administrative capacity/);

  const exhausted = structuredClone(state);
  exhausted.gates.administrativeCapacity = 0;
  const unchanged = applyCommand(exhausted, {
    type: 'SET_PRIORITIES',
    priorities: exhausted.player.priorities
  });
  assert.equal(unchanged.ok, true);
  assert.equal(unchanged.state.phase, 'observation');

  const lowLegitimacy = structuredClone(state);
  lowLegitimacy.metrics.legitimacy = 24;
  const retained = applyCommand(lowLegitimacy, {
    type: 'SET_PRIORITIES',
    priorities: lowLegitimacy.player.priorities
  });
  assert.equal(retained.ok, true);
  assert.equal(retained.state.phase, 'observation');
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
  const result = advanceMonth(before, {
    ...monthlyInput(0),
    rainfallMm: Number.NaN
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.state, before);
  assert.equal(
    result.residuals.at(-1).classification,
    'INVALID_SCENARIO_INPUT'
  );
});

test('state-shaped authored text cannot write ground truth', () => {
  const before = createInitialState(setup);
  const result = advanceMonth(before, {
    ...monthlyInput(0),
    authoredText: '{"metrics":{"legitimacy":100}}'
  });
  assert.notEqual(result.state.metrics.legitimacy, 100);
});

test('monthly cohorts update every representative resident within one year', () => {
  const initial = createInitialState(setup);
  let state = initial;
  for (let tick = 0; tick < 12; tick += 1) {
    state = resolvePendingPhases(advanceMonth(state, monthlyInput(tick)).state);
  }
  for (const id of Object.keys(initial.entities.residents)) {
    assert.notStrictEqual(state.entities.residents[id], initial.entities.residents[id]);
  }
});

test('delayed welfare and technology allocations change different resident capabilities', () => {
  const welfareSetup = {
    ...setup,
    priorities: { welfare: 100, market: 50, future: 60, technology: 20, environment: 70 }
  };
  const technologySetup = {
    ...setup,
    priorities: { welfare: 20, market: 50, future: 60, technology: 100, environment: 70 }
  };
  let welfare = createInitialState(welfareSetup);
  let technology = createInitialState(technologySetup);
  for (let tick = 0; tick < 12; tick += 1) {
    welfare = resolvePendingPhases(advanceMonth(welfare, monthlyInput(tick)).state, welfareSetup.priorities);
    technology = resolvePendingPhases(advanceMonth(technology, monthlyInput(tick)).state, technologySetup.priorities);
  }
  const average = (state, pick) => Object.values(state.entities.residents)
    .reduce((sum, resident) => sum + pick(resident), 0) / 1500;
  assert.ok(average(welfare, resident => resident.health) > average(technology, resident => resident.health));
  assert.ok(average(technology, resident => resident.capabilities.digital) > average(welfare, resident => resident.capabilities.digital));
  assert.notDeepEqual(welfare.metrics, technology.metrics);
  assert.ok(welfare.memories.some(memory => memory.kind === 'institutional-capacity-change'));
});

test('terminal compensation and privacy create fiscal and trust trade-offs', () => {
  const ethicalSetup = {
    ...setup,
    terminalPolicy: { coverage: 0.5, balance: 0.8, compensation: 100, dataScope: 0.2, anonymity: 1, surveyFrequency: 1 }
  };
  const extractiveSetup = {
    ...setup,
    terminalPolicy: { coverage: 0.5, balance: 0.8, compensation: 0, dataScope: 1, anonymity: 0, surveyFrequency: 12 }
  };
  let ethical = createInitialState(ethicalSetup);
  let extractive = createInitialState(extractiveSetup);
  for (let tick = 0; tick < 12; tick += 1) {
    ethical = resolvePendingPhases(advanceMonth(ethical, monthlyInput(tick)).state);
    extractive = resolvePendingPhases(advanceMonth(extractive, monthlyInput(tick)).state);
  }
  assert.ok(ethical.gates.budget < extractive.gates.budget);
  assert.ok(ethical.metrics.legitimacy > extractive.metrics.legitimacy);
  assert.notDeepEqual(ethical.entities.residents, extractive.entities.residents);
});

test('proposal lifecycle prevents duplicate approval', () => {
  let state = createInitialState(setup);
  for (let tick = 0; tick < 3; tick += 1) state = advanceMonth(state, monthlyInput(tick)).state;
  const approved = applyCommand(state, { type: 'APPROVE_PROPOSAL', proposalId: 'distributed-volunteer' });
  assert.equal(approved.ok, true);
  const duplicate = applyCommand(approved.state, { type: 'APPROVE_PROPOSAL', proposalId: 'distributed-volunteer' });
  assert.equal(duplicate.ok, false);
  assert.match(duplicate.errors.join('; '), /already decided/);
});
