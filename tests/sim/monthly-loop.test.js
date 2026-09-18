const test = require('node:test');
const assert = require('node:assert/strict');

function institutionalScenario() {
  const { createEntity, createRelation } = require('../../src/sim/model');
  const { createWorld } = require('../../src/sim/world');

  return createWorld({
    seed: 202904,
    calendar: { year: 2029, month: 4 },
    entities: [
      createEntity({
        id: 'town-office',
        type: 'institution',
        state: { legitimacy: 0.72 },
        capabilities: { authority: { transport: 0.8 }, budget: 1 },
      }),
      createEntity({
        id: 'bus',
        type: 'transport-service',
        state: { frequency: 0.48, reliability: 0.86, capacity: 1.6, serviceLoad: 0 },
        capabilities: {},
      }),
      createEntity({ id: 'r1', type: 'person', state: {}, capabilities: { drive: false, cycle: false } }),
      createEntity({ id: 'r2', type: 'person', state: {}, capabilities: { drive: true, cycle: false } }),
    ],
    relations: [
      createRelation({ id: 'gov-bus', from: 'town-office', to: 'bus', type: 'governs', strength: 0.85, state: { domain: 'transport' } }),
      createRelation({ id: 'r1-bus', from: 'r1', to: 'bus', type: 'uses', strength: 0.9, state: { distance: 0.6, scheduleFit: 0.8, alternativeMobility: 0.05 } }),
      createRelation({ id: 'r2-bus', from: 'r2', to: 'bus', type: 'uses', strength: 0.85, state: { distance: 0.7, scheduleFit: 0.75, alternativeMobility: 0.65 } }),
    ],
  });
}

test('monthly social loop carries policy, weather, resident action, memory and legitimacy into the next month', () => {
  const { createInstitutionalAction } = require('../../src/sim/institution');
  const { runTransportMonth } = require('../../src/sim/monthly-loop');

  const action = createInstitutionalAction({
    actorId: 'town-office', targetId: 'bus', domain: 'transport', type: 'service-support', intensity: 0.65,
  });

  const start = institutionalScenario();
  const next = runTransportMonth(start, {
    institutionalAction: action,
    weather: { rain: 0.9, snow: 0 },
  });

  assert.deepEqual(next.calendar, { year: 2029, month: 5 });
  assert.equal(next.tick, 1);
  assert.ok(next.memory.some(m => m.kind === 'institutional-action'));
  assert.ok(next.memory.some(m => m.kind === 'travel-experience'));
  assert.ok(next.memory.some(m => m.kind === 'institutional-outcome'));
  assert.ok(next.entities.find(e => e.id === 'r1').actions.some(a => a.type === 'mobility-choice'));
  assert.ok(next.relations.find(r => r.id === 'r1-bus').state.avoidanceMemory >= 0);
});

test('repeated difficult months can erode legitimacy and change later policy implementation', () => {
  const { createInstitutionalAction } = require('../../src/sim/institution');
  const { runTransportMonth } = require('../../src/sim/monthly-loop');

  const action = createInstitutionalAction({
    actorId: 'town-office', targetId: 'bus', domain: 'transport', type: 'service-support', intensity: 0.9,
  });

  let world = institutionalScenario();
  const initialLegitimacy = world.entities.find(e => e.id === 'town-office').state.legitimacy;

  world = runTransportMonth(world, { institutionalAction: action, weather: { rain: 1, snow: 0.4 } });
  const firstImplementation = world.memory.filter(m => m.kind === 'institutional-action').at(-1).implementation;
  world = runTransportMonth(world, { institutionalAction: action, weather: { rain: 1, snow: 0.5 } });
  world = runTransportMonth(world, { institutionalAction: action, weather: { rain: 0.9, snow: 0.6 } });
  const laterImplementation = world.memory.filter(m => m.kind === 'institutional-action').at(-1).implementation;
  const laterLegitimacy = world.entities.find(e => e.id === 'town-office').state.legitimacy;

  assert.ok(laterLegitimacy < initialLegitimacy,
    'repeated underperformance should reduce legitimacy');
  assert.ok(laterImplementation < firstImplementation,
    'lower legitimacy should reduce later implementation of the same nominal policy');
});
