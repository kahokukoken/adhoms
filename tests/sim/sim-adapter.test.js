const test = require('node:test');
const assert = require('node:assert/strict');

test('FEED adapter derives cards from simulation observations, not month-indexed script text', () => {
  const { createEntity } = require('../../src/sim/model');
  const { createWorld } = require('../../src/sim/world');
  const { observe } = require('../../src/sim/perception');
  const { toFeedItems } = require('../../src/game/sim-adapter');

  const lowWorld = createWorld({
    calendar: { year: 2029, month: 5 },
    entities: [
      createEntity({ id: 'resident-a', type: 'person', state: { name: '山田 花', age: 72, role: '主婦' }, capabilities: {} }),
      createEntity({ id: 'bus-route-1', type: 'transport-service', state: { access: 0.31, serviceLoad: 1.18 }, capabilities: {} }),
    ],
  });
  lowWorld.observations.push(observe(lowWorld, {
    sourceId: 'resident-a', subjectId: 'bus-route-1', confidence: 0.8, visibility: 0.35,
  }));

  const highWorld = createWorld({
    calendar: { year: 2029, month: 5 },
    entities: [
      createEntity({ id: 'resident-a', type: 'person', state: { name: '山田 花', age: 72, role: '主婦' }, capabilities: {} }),
      createEntity({ id: 'bus-route-1', type: 'transport-service', state: { access: 0.74, serviceLoad: 0.72 }, capabilities: {} }),
    ],
  });
  highWorld.observations.push(observe(highWorld, {
    sourceId: 'resident-a', subjectId: 'bus-route-1', confidence: 0.8, visibility: 0.35,
  }));

  const low = toFeedItems(lowWorld);
  const high = toFeedItems(highWorld);

  assert.equal(low.length, 1);
  assert.equal(low[0].name, '山田 花');
  assert.equal(low[0].age, 72);
  assert.equal(low[0].role, '主婦');
  assert.equal(low[0].subjectId, 'bus-route-1');
  assert.notEqual(low[0].body, high[0].body, 'same month must render different FEED text when simulation state differs');
  assert.match(low[0].body, /0\.31|1\.18/);
  assert.match(high[0].body, /0\.74|0\.72/);
});

test('authored narration cannot overwrite simulation state through the adapter', () => {
  const { createEntity } = require('../../src/sim/model');
  const { createWorld } = require('../../src/sim/world');
  const { observe } = require('../../src/sim/perception');
  const { toFeedItems } = require('../../src/game/sim-adapter');

  const world = createWorld({
    entities: [
      createEntity({ id: 'source', type: 'person', state: { name: '観測者', age: 40, role: '住民' }, capabilities: {} }),
      createEntity({ id: 'road', type: 'infrastructure', state: { passable: false }, capabilities: {} }),
    ],
  });
  world.observations.push(observe(world, { sourceId: 'source', subjectId: 'road' }));
  const before = JSON.stringify(world.entities);

  const items = toFeedItems(world, { narrate: () => '道路は通行可能です' });

  assert.equal(JSON.stringify(world.entities), before);
  assert.equal(items[0].groundState.passable, false);
});
