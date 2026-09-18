const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const modelPath = path.resolve(__dirname, '../../src/sim/model.js');
const worldPath = path.resolve(__dirname, '../../src/sim/world.js');

test('simulation model exposes canonical Entity and Relation contracts', () => {
  assert.equal(fs.existsSync(modelPath), true, 'src/sim/model.js must exist');
  const { createEntity, createRelation } = require(modelPath);

  const entity = createEntity({
    id: 'resident-1',
    type: 'person',
    state: { age: 42, access: 0.8 },
    capabilities: { drive: true },
  });
  assert.deepEqual(entity, {
    id: 'resident-1',
    type: 'person',
    state: { age: 42, access: 0.8 },
    capabilities: { drive: true },
    perception: {},
    actions: [],
    memory: [],
  });

  const relation = createRelation({
    id: 'r1',
    from: 'resident-1',
    to: 'bus-route-1',
    type: 'uses',
    strength: 0.7,
  });
  assert.equal(relation.from, 'resident-1');
  assert.equal(relation.to, 'bus-route-1');
  assert.equal(relation.type, 'uses');
  assert.equal(relation.strength, 0.7);
  assert.deepEqual(relation.state, {});
});

test('world clone has no shared mutable state', () => {
  assert.equal(fs.existsSync(worldPath), true, 'src/sim/world.js must exist');
  const { createWorld, cloneWorld } = require(worldPath);

  const world = createWorld({
    seed: 123,
    entities: [{ id: 'a', type: 'person', state: { access: 1 }, capabilities: {}, perception: {}, actions: [], memory: [] }],
    relations: [{ id: 'r', from: 'a', to: 'b', type: 'uses', strength: 0.5, state: {} }],
  });
  const cloned = cloneWorld(world);

  cloned.entities[0].state.access = 0.1;
  cloned.relations[0].state.friction = 0.9;
  cloned.memory.push({ tick: 1, kind: 'test' });

  assert.equal(world.entities[0].state.access, 1);
  assert.equal(world.relations[0].state.friction, undefined);
  assert.equal(world.memory.length, 0);
  assert.equal(cloned.tick, 0);
  assert.deepEqual(cloned.observations, []);
  assert.deepEqual(cloned.residuals, []);
});
