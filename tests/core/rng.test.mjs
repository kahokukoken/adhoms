import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng, restoreRng } from '../../game/core/rng.mjs';

test('same seed produces the same sequence', () => {
  const a = createRng(164);
  const b = createRng(164);
  assert.deepEqual(
    Array.from({ length: 20 }, () => a.next()),
    Array.from({ length: 20 }, () => b.next())
  );
});

test('snapshot resumes at the next draw', () => {
  const rng = createRng(2029);
  rng.next();
  const restored = restoreRng(rng.snapshot());
  assert.equal(restored.next(), rng.next());
});

test('integer draws remain inside inclusive bounds', () => {
  const rng = createRng(-1);
  for (let i = 0; i < 1000; i += 1) {
    const value = rng.int(3, 7);
    assert.ok(value >= 3 && value <= 7);
  }
});
