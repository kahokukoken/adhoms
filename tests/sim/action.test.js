const test = require('node:test');
const assert = require('node:assert/strict');

test('mobility action emerges from access, burden, memory and capabilities without person-type branches', () => {
  const { createEntity, createRelation } = require('../../src/sim/model');
  const { createWorld } = require('../../src/sim/world');
  const { chooseMobilityAction } = require('../../src/sim/action');

  const world = createWorld({
    entities: [
      createEntity({ id: 'a', type: 'person', state: { access: 0.8, travelBurden: 0.2 }, capabilities: { drive: false, cycle: false } }),
      createEntity({ id: 'b', type: 'person', state: { access: 0.3, travelBurden: 0.7 }, capabilities: { drive: true, cycle: false } }),
      createEntity({ id: 'c', type: 'person', state: { access: 0.25, travelBurden: 0.75 }, capabilities: { drive: false, cycle: false } }),
    ],
    relations: [
      createRelation({ id: 'a-bus', from: 'a', to: 'bus', type: 'uses', strength: 0.9, state: { alternativeMobility: 0.05, avoidanceMemory: 0.05 } }),
      createRelation({ id: 'b-bus', from: 'b', to: 'bus', type: 'uses', strength: 0.9, state: { alternativeMobility: 0.7, avoidanceMemory: 0.25 } }),
      createRelation({ id: 'c-bus', from: 'c', to: 'bus', type: 'uses', strength: 0.9, state: { alternativeMobility: 0.05, avoidanceMemory: 0.6 } }),
    ],
  });

  const next = chooseMobilityAction(world);

  assert.equal(next.entities.find(e => e.id === 'a').state.mobilityChoice, 'use-service');
  assert.equal(next.entities.find(e => e.id === 'b').state.mobilityChoice, 'alternative');
  assert.equal(next.entities.find(e => e.id === 'c').state.mobilityChoice, 'defer-trip');
  assert.equal(next.entities.find(e => e.id === 'a').actions.at(-1).type, 'mobility-choice');
  assert.equal(world.entities.find(e => e.id === 'a').state.mobilityChoice, undefined);
});

test('mobility choice changes downstream service demand rather than directly changing capacity', () => {
  const { createEntity, createRelation } = require('../../src/sim/model');
  const { createWorld } = require('../../src/sim/world');
  const { chooseMobilityAction } = require('../../src/sim/action');
  const { applyTransportAccess } = require('../../src/sim/rules/transport');

  const world = createWorld({
    entities: [
      createEntity({ id: 'bus', type: 'transport-service', state: { frequency: 0.5, reliability: 0.9, capacity: 1.2 }, capabilities: {} }),
      createEntity({ id: 'p1', type: 'person', state: { access: 0.25, travelBurden: 0.75 }, capabilities: { drive: true } }),
      createEntity({ id: 'p2', type: 'person', state: { access: 0.8, travelBurden: 0.2 }, capabilities: {} }),
    ],
    relations: [
      createRelation({ id: 'p1-bus', from: 'p1', to: 'bus', type: 'uses', strength: 1, state: { scheduleFit: 1, distance: 0.4, alternativeMobility: 0.8 } }),
      createRelation({ id: 'p2-bus', from: 'p2', to: 'bus', type: 'uses', strength: 1, state: { scheduleFit: 1, distance: 0.4, alternativeMobility: 0 } }),
    ],
  });

  const chosen = chooseMobilityAction(world);
  const next = applyTransportAccess(chosen);
  const service = next.entities.find(e => e.id === 'bus');

  assert.equal(chosen.entities.find(e => e.id === 'p1').state.mobilityChoice, 'alternative');
  assert.equal(service.state.capacity, 1.2);
  assert.ok(service.state.serviceLoad < 1.5, 'alternative choice should reduce realized service demand');
});
