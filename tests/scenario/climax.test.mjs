import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../game/core/state.mjs';
import { applyCommand } from '../../game/core/commands.mjs';
import { advanceMonth } from '../../game/core/advance.mjs';
import { getScenarioInput } from '../../game/scenario/events.mjs';
import { resolvePendingPhases, setup } from '../helpers/ver1-fixtures.mjs';

const STRATEGIES = Object.freeze({
  'distributed-resilience': Object.freeze({
    priorities: Object.freeze({
      welfare: 65,
      market: 45,
      future: 70,
      technology: 45,
      environment: 75
    }),
    proposalAction: 'APPROVE_PROPOSAL'
  }),
  'centralized-efficiency': Object.freeze({
    priorities: Object.freeze({
      welfare: 40,
      market: 90,
      future: 65,
      technology: 75,
      environment: 30
    }),
    proposalAction: 'REJECT_PROPOSAL'
  })
});

function requireCommand(state, command) {
  const result = applyCommand(state, command);
  assert.equal(result.ok, true, result.errors?.join('; '));
  return result.state;
}

function prepareToClimax({ strategy, ...initialSetup }) {
  const selected = STRATEGIES[strategy];
  let state = createInitialState(initialSetup);
  while (state.tick < 53) {
    const result = advanceMonth(state, getScenarioInput(state));
    assert.equal(result.ok, true);
    state = result.state;
    if (state.phase === 'quarterly-decision') {
      for (const proposalId of ['distributed-volunteer', 'drainage-maintenance', 'multi-site-shelter']) {
        if (state.actions.some(action => action.proposalId === proposalId)) continue;
        state = requireCommand(state, { type: selected.proposalAction, proposalId });
      }
    }
    state = resolvePendingPhases(state, selected.priorities);
  }

  return state;
}

function runToClimax({ strategy, rainSeed, ...initialSetup }) {
  const state = prepareToClimax({ strategy, ...initialSetup });

  const scenarioInput = getScenarioInput(state, { rainSeed });
  const result = advanceMonth(state, scenarioInput);
  assert.equal(result.ok, true);
  return {
    state: result.state,
    events: {
      rainfallMm: scenarioInput.rainfallMm,
      emitted: result.events
    }
  };
}

test('climax adds distinct compound damage before facilities have collapsed', () => {
  const state = prepareToClimax({
    ...setup,
    strategy: 'distributed-resilience'
  });
  assert.ok(Object.values(state.entities.facilities).every(facility => facility.condition > 0));

  const input = getScenarioInput(state, { rainSeed: 77 });
  const withoutClimax = advanceMonth(state, { ...input, specialEvents: [] });
  const withClimax = advanceMonth(state, input);
  assert.equal(withoutClimax.ok, true);
  assert.equal(withClimax.ok, true);
  assert.notDeepEqual(withClimax.state.entities.facilities, withoutClimax.state.entities.facilities);
  assert.ok(withClimax.state.metrics.resilience < withoutClimax.state.metrics.resilience);
});

test('same rain shock produces different recovery from different histories', () => {
  const prepared = runToClimax({
    ...setup,
    strategy: 'distributed-resilience',
    rainSeed: 77
  });
  const brittle = runToClimax({
    ...setup,
    strategy: 'centralized-efficiency',
    rainSeed: 77
  });
  assert.equal(prepared.events.rainfallMm, brittle.events.rainfallMm);
  assert.notDeepEqual(prepared.state.metrics, brittle.state.metrics);
  assert.ok(
    prepared.state.metrics.resilience > brittle.state.metrics.resilience
  );
  assert.deepEqual(
    prepared.events.emitted
      .filter(event => event.type.startsWith('CLIMAX_'))
      .map(event => event.type),
    ['CLIMAX_HASSAKU_SUMO', 'CLIMAX_FOREST_LIVE', 'CLIMAX_HEAVY_RAIN']
  );
});

test('distributed crisis response preserves input and improves physical recovery next month', () => {
  let state = runToClimax({
    ...setup,
    strategy: 'distributed-resilience',
    rainSeed: 77
  }).state;
  state = requireCommand(state, { type: 'SET_PRIORITIES', priorities: STRATEGIES['distributed-resilience'].priorities });
  assert.equal(state.phase, 'crisis-decision');

  const beforeDistributed = structuredClone(state);
  const distributed = requireCommand(state, { type: 'RESPOND_TO_CRISIS', choice: 'distributed-response' });
  assert.deepEqual(state, beforeDistributed);

  const beforeReserve = structuredClone(state);
  const reserve = requireCommand(state, { type: 'RESPOND_TO_CRISIS', choice: 'preserve-reserve' });
  assert.deepEqual(state, beforeReserve);

  const recovered = advanceMonth(distributed, getScenarioInput(distributed)).state;
  const untreated = advanceMonth(reserve, getScenarioInput(reserve)).state;
  const exposedKinds = new Set(['drainage', 'park', 'cultural-ground', 'rail']);
  const averageExposed = candidate => Object.values(candidate.entities.facilities)
    .filter(facility => exposedKinds.has(facility.kind))
    .reduce((sum, facility, _, list) => sum + facility.condition / list.length, 0);

  assert.ok(averageExposed(recovered) > averageExposed(untreated));
  assert.ok(recovered.metrics.resilience > untreated.metrics.resilience);
  assert.ok(recovered.memories.some(memory => memory.kind === 'crisis-physical-recovery'));
});
