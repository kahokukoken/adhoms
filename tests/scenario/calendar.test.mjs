import test from 'node:test';
import assert from 'node:assert/strict';
import { getRequiredPhases } from '../../game/scenario/calendar.mjs';
import { JA_COPY } from '../../game/scenario/copy.ja.mjs';
import { createInitialState } from '../../game/core/state.mjs';
import { advanceMonth } from '../../game/core/advance.mjs';
import { getScenarioInput } from '../../game/scenario/events.mjs';
import { resolvePendingPhases, setup } from '../helpers/ver1-fixtures.mjs';

test('calendar emits each gate exactly once per required boundary', () => {
  const phases = Array.from(
    { length: 60 },
    (_, tick) => getRequiredPhases({ tick })
  ).flat();
  assert.equal(phases.filter(value => value === 'quarterly-decision').length, 20);
  assert.equal(phases.filter(value => value === 'annual-review').length, 5);
  assert.equal(phases.filter(value => value === 'mayoral-election').length, 1);
  assert.equal(phases.filter(value => value === 'final-climax').length, 1);
});

test('fictional event uses the approved name and original-fiction disclaimer', () => {
  assert.equal(JA_COPY.events.hassaku.name, '倶利伽羅八朔相撲');
  assert.match(JA_COPY.credits.fiction, /架空/);
  assert.doesNotMatch(
    JSON.stringify(JA_COPY.events.hassaku),
    /大國魂|小諸|府中/
  );
});

test('normal final-year climax includes a physical heavy-rain shock', () => {
  let state = createInitialState(setup);
  while (state.tick < 53) state = resolvePendingPhases(advanceMonth(state, getScenarioInput(state)).state);
  const input = getScenarioInput(state);
  assert.ok(input.rainfallMm >= 210, `expected climax rain, received ${input.rainfallMm}`);
  assert.equal(input.specialEvents.some(event => event.type === 'CLIMAX_HEAVY_RAIN'), true);
});

test('opposite election mandates change subsequent resident and fiscal outcomes', () => {
  let state = createInitialState(setup);
  while (state.tick < 42) state = resolvePendingPhases(advanceMonth(state, getScenarioInput(state)).state);
  const baseInput = getScenarioInput(state);
  const elect = winner => advanceMonth(state, {
    ...baseInput,
    specialEvents: [{ type: 'MAYORAL_ELECTION', winner }]
  }).state;
  const progressive = elect('progressive-faction');
  const conservative = elect('conservative-faction');
  const progressiveNext = advanceMonth(progressive, getScenarioInput(progressive)).state;
  const conservativeNext = advanceMonth(conservative, getScenarioInput(conservative)).state;

  assert.notDeepEqual(progressiveNext.entities.residents, conservativeNext.entities.residents);
  assert.notDeepEqual(progressiveNext.metrics, conservativeNext.metrics);
  assert.notEqual(progressiveNext.gates.budget, conservativeNext.gates.budget);
});
