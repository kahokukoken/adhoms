const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rngPath = path.resolve(__dirname, '../../src/sim/rng.js');
const tickPath = path.resolve(__dirname, '../../src/sim/tick.js');
const worldPath = path.resolve(__dirname, '../../src/sim/world.js');

test('same seed and same state produce the same next world', () => {
  assert.equal(fs.existsSync(rngPath), true, 'src/sim/rng.js must exist');
  assert.equal(fs.existsSync(tickPath), true, 'src/sim/tick.js must exist');
  const { createWorld } = require(worldPath);
  const { advanceMonth } = require(tickPath);

  const a = createWorld({ seed: 777, entities: [], relations: [] });
  const b = createWorld({ seed: 777, entities: [], relations: [] });

  const nextA = advanceMonth(a, { stochasticSignals: ['clear', 'rain'] });
  const nextB = advanceMonth(b, { stochasticSignals: ['clear', 'rain'] });

  assert.deepEqual(nextA, nextB);
  assert.equal(nextA.tick, 1);
  assert.equal(nextA.calendar.month, 5);
});

test('different seeds affect stochastic choice but not deterministic calendar progression', () => {
  const { createWorld } = require(worldPath);
  const { advanceMonth } = require(tickPath);

  const a = advanceMonth(createWorld({ seed: 1, entities: [], relations: [] }), { stochasticSignals: Array.from({ length: 16 }, (_, i) => `s${i}`) });
  const b = advanceMonth(createWorld({ seed: 99, entities: [], relations: [] }), { stochasticSignals: Array.from({ length: 16 }, (_, i) => `s${i}`) });

  assert.equal(a.tick, 1);
  assert.equal(b.tick, 1);
  assert.deepEqual(a.calendar, b.calendar);
  assert.notEqual(a.lastSignal, b.lastSignal);
});

test('advanceMonth is immutable', () => {
  const { createWorld } = require(worldPath);
  const { advanceMonth } = require(tickPath);
  const world = createWorld({ seed: 5, entities: [], relations: [] });

  const next = advanceMonth(world, {});

  assert.equal(world.tick, 0);
  assert.equal(world.calendar.month, 4);
  assert.equal(next.tick, 1);
  assert.notEqual(next, world);
});
