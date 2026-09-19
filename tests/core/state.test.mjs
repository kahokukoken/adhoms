import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, getCalendar } from '../../game/core/state.mjs';
import { validateState } from '../../game/core/invariants.mjs';
import { setup } from '../helpers/ver1-fixtures.mjs';

test('creates 1500 weighted residents without real personal data', () => {
  const state = createInitialState(setup);
  assert.equal(Object.keys(state.entities.residents).length, 1500);
  assert.equal(state.tick, 0);
  assert.deepEqual(getCalendar(0), { year: 2029, month: 4, trialYear: 1 });
  assert.equal(JSON.stringify(state).includes('follow'), false);
  assert.deepEqual(validateState(state), { ok: true, errors: [] });
});

test('rejects unconstrained priorities and unknown leaders', () => {
  assert.throws(
    () => createInitialState({ ...setup, leaderId: 'unknown' }),
    /leader/
  );
  assert.throws(
    () => createInitialState({
      ...setup,
      priorities: { ...setup.priorities, welfare: 100 }
    }),
    /total 300/
  );
});

test('representative residents and relations stay within owned bounds', () => {
  const state = createInitialState(setup);
  for (const resident of Object.values(state.entities.residents)) {
    assert.ok(resident.weight > 0);
  }
  for (const relation of Object.values(state.relations)) {
    assert.ok(relation.strength >= -1 && relation.strength <= 1);
  }
});

test('rejects incomplete causal state and non-finite resident values', () => {
  const state = createInitialState(setup);
  delete state.history;
  delete state.player.terminalPolicy;
  state.entities.residents['resident-0001'].health = Number.NaN;
  const validation = validateState(state);
  assert.equal(validation.ok, false);
  assert.match(validation.errors.join('; '), /history|terminal policy|health/);
});

test('rejects broken entity and relation references before simulation', () => {
  const missingHousehold = createInitialState(setup);
  delete missingHousehold.entities.households['household-0001'];
  const householdValidation = validateState(missingHousehold);
  assert.equal(householdValidation.ok, false);
  assert.match(householdValidation.errors.join('; '), /household-0001/);

  const missingRelations = createInitialState(setup);
  delete missingRelations.relations;
  const relationValidation = validateState(missingRelations);
  assert.equal(relationValidation.ok, false);
  assert.match(relationValidation.errors.join('; '), /relations/);

  const nullResident = createInitialState(setup);
  nullResident.entities.residents['resident-0001'] = null;
  assert.doesNotThrow(() => validateState(nullResident));
  assert.equal(validateState(nullResident).ok, false);

  const missingFacilities = createInitialState(setup);
  missingFacilities.entities.facilities = {};
  const facilityValidation = validateState(missingFacilities);
  assert.equal(facilityValidation.ok, false);
  assert.match(facilityValidation.errors.join('; '), /lakeside-drainage/);

  const invalidMembers = createInitialState(setup);
  invalidMembers.entities.households['household-0001'].memberIds = {};
  assert.doesNotThrow(() => validateState(invalidMembers));
  assert.equal(validateState(invalidMembers).ok, false);

  const invalidEffect = createInitialState(setup);
  invalidEffect.pendingEffects = [null];
  assert.doesNotThrow(() => validateState(invalidEffect));
  assert.equal(validateState(invalidEffect).ok, false);
});
