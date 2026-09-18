const test = require('node:test');
const assert = require('node:assert/strict');

test('100-seed transport validation reports invariants and deterministic replay', () => {
  const { runTransportValidation } = require('../../src/sim/validation');

  const report = runTransportValidation({ seeds: 100 });

  assert.equal(report.runs, 100);
  assert.deepEqual(report.violations, []);
  assert.equal(report.invariants.relationStrengthBounded, true);
  assert.equal(report.invariants.noNegativeCounts, true);
  assert.equal(report.invariants.deterministicReplay, true);
  assert.equal(report.invariants.influencerDoesNotMutatePhysicalState, true);
  assert.ok(report.outcomeRange.minOlderAccess < report.outcomeRange.maxOlderAccess,
    'different seeded weather conditions should produce divergent access outcomes');
});

test('validation mismatches are classified before theory changes', () => {
  const { classifyMismatch } = require('../../src/sim/validation');

  for (const kind of ['input', 'relation', 'local-rule', 'delay', 'observation', 'implementation']) {
    assert.equal(classifyMismatch({ kind }).classification, kind);
  }
  assert.equal(classifyMismatch({ kind: 'unknown' }).classification, 'unclassified');
});
