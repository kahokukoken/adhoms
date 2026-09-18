const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const transportPath = path.resolve(__dirname, '../../src/sim/rules/transport.js');
const scenarioPath = path.resolve(__dirname, '../../src/sim/scenarios/kurikara-baseline.js');

test('bus service changes affect residents differently through relations, not resident-type branches', () => {
  assert.equal(fs.existsSync(transportPath), true, 'transport rule must exist');
  assert.equal(fs.existsSync(scenarioPath), true, 'Kurikara baseline must exist');
  const { applyTransportAccess } = require(transportPath);
  const { createKurikaraBaseline } = require(scenarioPath);

  const healthy = createKurikaraBaseline({ busFrequency: 0.8 });
  const reduced = createKurikaraBaseline({ busFrequency: 0.25 });

  const healthyResult = applyTransportAccess(healthy);
  const reducedResult = applyTransportAccess(reduced);

  const byId = world => Object.fromEntries(world.entities.filter(e => e.type === 'person').map(e => [e.id, e.state]));
  const h = byId(healthyResult);
  const r = byId(reducedResult);

  assert.ok(r.commuter.access < h.commuter.access);
  assert.ok(r.older.access < h.older.access);
  assert.ok(r.student.access < h.student.access);

  const commuterLoss = h.commuter.access - r.commuter.access;
  const olderLoss = h.older.access - r.older.access;
  const studentLoss = h.student.access - r.student.access;

  assert.ok(olderLoss > commuterLoss, 'older resident should be more exposed because alternatives are weaker');
  assert.ok(studentLoss > commuterLoss, 'student should be more exposed because schedule fit is tighter');
  assert.notEqual(olderLoss, studentLoss, 'different relation structures should produce different losses');
});

test('transport rule records access, travel burden, service load and memory without mutating input', () => {
  const { applyTransportAccess } = require(transportPath);
  const { createKurikaraBaseline } = require(scenarioPath);
  const world = createKurikaraBaseline({ busFrequency: 0.5 });
  const before = JSON.stringify(world);

  const next = applyTransportAccess(world);

  assert.equal(JSON.stringify(world), before);
  for (const person of next.entities.filter(e => e.type === 'person')) {
    assert.equal(typeof person.state.access, 'number');
    assert.equal(typeof person.state.travelBurden, 'number');
  }
  const bus = next.entities.find(e => e.id === 'bus-route-1');
  assert.equal(typeof bus.state.serviceLoad, 'number');
  assert.ok(next.memory.some(entry => entry.kind === 'transport-access'));
});
