const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const perceptionPath = path.resolve(__dirname, '../../src/sim/perception.js');
const informationPath = path.resolve(__dirname, '../../src/sim/information.js');

test('クリカ and グレート・ノト propagate the same incident differently without changing ground truth', () => {
  assert.equal(fs.existsSync(perceptionPath), true, 'perception module must exist');
  assert.equal(fs.existsSync(informationPath), true, 'information module must exist');

  const { createEntity } = require('../../src/sim/model');
  const { createWorld } = require('../../src/sim/world');
  const { observe } = require(perceptionPath);
  const { propagate } = require(informationPath);

  const world = createWorld({
    entities: [
      createEntity({ id: 'incident-1', type: 'incident', state: { severity: 0.55, roadBlocked: false }, capabilities: {} }),
      createEntity({ id: 'kurika', type: 'person', state: { name: 'クリカ' }, capabilities: { reach: 0.65, verification: 0.9, noveltyBias: 0.2 } }),
      createEntity({ id: 'great-noto', type: 'person', state: { name: 'グレート・ノト' }, capabilities: { reach: 0.95, verification: 0.35, noveltyBias: 0.9 } }),
    ],
    relations: [],
  });
  const beforeIncident = JSON.stringify(world.entities.find(e => e.id === 'incident-1').state);

  const baseObservation = observe(world, { sourceId: 'incident-1', subjectId: 'incident-1', confidence: 0.85, visibility: 0.2 });
  const kurika = propagate(world, baseObservation, 'kurika');
  const great = propagate(world, baseObservation, 'great-noto');

  assert.ok(great.visibility > kurika.visibility, 'higher reach should amplify visibility more');
  assert.ok(great.distortion > kurika.distortion, 'lower verification + novelty bias should increase distortion');
  assert.ok(kurika.confidence > great.confidence, 'verification should preserve confidence better');
  assert.equal(JSON.stringify(world.entities.find(e => e.id === 'incident-1').state), beforeIncident, 'information actors must not mutate physical incident state');
});

test('observation keeps source, subject and ground-state snapshot', () => {
  const { createEntity } = require('../../src/sim/model');
  const { createWorld } = require('../../src/sim/world');
  const { observe } = require(perceptionPath);
  const world = createWorld({
    entities: [createEntity({ id: 'road-1', type: 'infrastructure', state: { passable: true, waterLevel: 0.3 }, capabilities: {} })],
    relations: [],
  });

  const observation = observe(world, { sourceId: 'resident-7', subjectId: 'road-1', confidence: 0.7, visibility: 0.4 });

  assert.equal(observation.source, 'resident-7');
  assert.equal(observation.subject, 'road-1');
  assert.deepEqual(observation.groundSnapshot, { passable: true, waterLevel: 0.3 });
  assert.equal(observation.distortion, 0);
});
