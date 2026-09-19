import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRun } from '../../game/core/evaluation.mjs';
import { applyCommand } from '../../game/core/commands.mjs';
import { createInitialState } from '../../game/core/state.mjs';
import { completeRun, setup } from '../helpers/ver1-fixtures.mjs';

const EXPECTED_DIMENSIONS = [
  'adaptability',
  'fiscalSustainability',
  'legitimacy',
  'observationQuality',
  'resilience',
  'socialStability'
];

test('derives a complete explained evaluation from the 60-month state', () => {
  const report = evaluateRun(completeRun());

  assert.deepEqual(Object.keys(report.dimensions), EXPECTED_DIMENSIONS);
  assert.match(report.grade, /^[A-D]$/);
  assert.equal(report.success, report.grade === 'A' || report.grade === 'B');
  assert.ok(report.evidence.length >= 6);
  assert.ok(report.tradeoffs.length > 0);
  assert.ok(Object.isFrozen(report));
});

test('rejects incomplete and direct grade-setting attempts', () => {
  const state = createInitialState(setup);
  assert.throws(() => evaluateRun(state), /60 months/);
  assert.equal(applyCommand(state, { type: 'SET_GRADE', grade: 'A' }).ok, false);
});

test('reports low confidence when observation quality is poor', () => {
  const state = completeRun();
  state.metrics.observationQuality = 10;

  const report = evaluateRun(state);
  assert.ok(report.uncertainty.level >= 0.5);
  assert.ok(report.evidence.some(item => item.qualifier === 'low-confidence'));
});

test('combined observation blindness and weak resilience produces a D failure', () => {
  const state = completeRun({
    ...setup,
    priorities: { welfare: 0, market: 100, future: 100, technology: 100, environment: 0 },
    terminalPolicy: { coverage: 0, balance: 0, compensation: 0, dataScope: 1, anonymity: 0, surveyFrequency: 12 }
  });
  const report = evaluateRun(state);
  assert.equal(report.grade, 'D');
  assert.equal(report.success, false);
});

test('evaluation evidence and scores depend on causal history', () => {
  const state = completeRun();
  const baseline = evaluateRun(state);
  const erased = structuredClone(state);
  erased.history = erased.history.map(entry => ({
    ...entry,
    metricSnapshot: Object.fromEntries(Object.keys(entry.metricSnapshot).map(key => [key, 0]))
  }));
  erased.actions = erased.actions.filter(action => action.type === 'ADVANCE_MONTH');
  erased.memories = [];
  const withoutHistory = evaluateRun(erased);
  assert.notDeepEqual(withoutHistory.dimensions, baseline.dimensions);
  assert.notDeepEqual(withoutHistory.evidence, baseline.evidence);
  assert.notDeepEqual(withoutHistory.tradeoffs, baseline.tradeoffs);
});

test('caller-supplied observation summary cannot rewrite final evaluation', () => {
  const state = completeRun();
  const baseline = evaluateRun(state);
  const recorded = applyCommand(state, {
    type: 'RECORD_OBSERVATIONS',
    items: [],
    summary: { coverage: 0, districtBalance: 0, ageBalance: 0, uncertainty: 1 }
  });
  assert.equal(recorded.ok, true);
  assert.deepEqual(evaluateRun(recorded.state), baseline);
});
