import assert from 'node:assert/strict';
import { availableParallelism } from 'node:os';
import { isDeepStrictEqual } from 'node:util';
import { isMainThread, parentPort, workerData, Worker } from 'node:worker_threads';
import { advanceMonth } from '../game/core/advance.mjs';
import { applyCommand } from '../game/core/commands.mjs';
import { evaluateRun } from '../game/core/evaluation.mjs';
import { loadGame, saveGame } from '../game/core/persistence.mjs';
import { replayGame } from '../game/core/replay.mjs';
import { createInitialState } from '../game/core/state.mjs';
import { validateState } from '../game/core/invariants.mjs';
import { getScenarioInput } from '../game/scenario/events.mjs';
import { observeMonth } from '../game/observation/terminal.mjs';

const LEADERS = Object.freeze(['miyashita', 'fujii', 'mizuno', 'saeki']);
const STRATEGIES = Object.freeze([
  Object.freeze({
    id: 'adaptive',
    priorities: Object.freeze({ welfare: 20, market: 80, future: 100, technology: 0, environment: 100 }),
    terminalPolicy: Object.freeze({ coverage: 1, balance: 1, compensation: 100, dataScope: 0.4, anonymity: 1, surveyFrequency: 1 }),
    proposals: Object.freeze([])
  }),
  Object.freeze({
    id: 'conservative',
    priorities: Object.freeze({ welfare: 60, market: 60, future: 60, technology: 60, environment: 60 }),
    terminalPolicy: Object.freeze({ coverage: 0.8, balance: 0.8, compensation: 60, dataScope: 0.45, anonymity: 0.9, surveyFrequency: 1 }),
    proposals: Object.freeze(['drainage-maintenance'])
  }),
  Object.freeze({
    id: 'market-first',
    priorities: Object.freeze({ welfare: 30, market: 100, future: 60, technology: 100, environment: 10 }),
    terminalPolicy: Object.freeze({ coverage: 0.25, balance: 0.4, compensation: 10, dataScope: 0.8, anonymity: 0.4, surveyFrequency: 6 }),
    proposals: Object.freeze([])
  }),
  Object.freeze({
    id: 'welfare-first',
    priorities: Object.freeze({ welfare: 100, market: 35, future: 55, technology: 35, environment: 75 }),
    terminalPolicy: Object.freeze({ coverage: 0.2, balance: 0.7, compensation: 40, dataScope: 0.5, anonymity: 0.8, surveyFrequency: 1 }),
    proposals: Object.freeze(['distributed-volunteer', 'multi-site-shelter'])
  }),
  Object.freeze({
    id: 'observation-light',
    priorities: Object.freeze({ welfare: 100, market: 100, future: 50, technology: 50, environment: 0 }),
    terminalPolicy: Object.freeze({ coverage: 0, balance: 0, compensation: 0, dataScope: 0.2, anonymity: 0, surveyFrequency: 1 }),
    proposals: Object.freeze([])
  }),
  Object.freeze({
    id: 'blind-but-resilient',
    priorities: Object.freeze({ welfare: 20, market: 80, future: 100, technology: 0, environment: 100 }),
    terminalPolicy: Object.freeze({ coverage: 0, balance: 0, compensation: 0, dataScope: 1, anonymity: 0, surveyFrequency: 12 }),
    proposals: Object.freeze([])
  })
]);

function memoryStorage() {
  const records = new Map();
  return {
    getItem: key => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, String(value)),
    removeItem: key => records.delete(key)
  };
}

function generatedSetup(seed, strategy) {
  return {
    seed,
    leaderId: LEADERS[(seed - 1) % LEADERS.length],
    priorities: strategy.priorities,
    terminalPolicy: strategy.terminalPolicy
  };
}

function requireCommand(state, command) {
  const result = applyCommand(state, command);
  assert.equal(result.ok, true, result.errors?.join('; '));
  return result.state;
}

function executeStrategy(setup, strategy) {
  let state = createInitialState(setup);
  const eventCounts = new Map();
  while (state.tick < 60) {
    const result = advanceMonth(state, getScenarioInput(state));
    assert.equal(result.ok, true, result.residuals.at(-1)?.errors?.join('; '));
    for (const event of result.events) eventCounts.set(event.type, (eventCounts.get(event.type) ?? 0) + 1);
    const observation = observeMonth(result.state, result.events);
    state = requireCommand(result.state, {
      type: 'RECORD_OBSERVATIONS',
      items: [],
      summary: observation.summary
    });
    if (state.phase === 'quarterly-decision') {
      for (const proposalId of strategy.proposals) {
        if (!state.actions.some(action => action.proposalId === proposalId)) {
          state = requireCommand(state, { type: 'APPROVE_PROPOSAL', proposalId });
        }
      }
      state = requireCommand(state, { type: 'SET_PRIORITIES', priorities: strategy.priorities });
    }
    if (state.phase === 'annual-review') state = requireCommand(state, { type: 'ACKNOWLEDGE_PHASE', phase: 'annual-review' });
    if (state.phase === 'crisis-decision') state = requireCommand(state, { type: 'RESPOND_TO_CRISIS', choice: setup.seed % 2 ? 'distributed-response' : 'preserve-reserve' });
  }
  return { state, eventCounts };
}

function assertReleaseInvariants(state, eventCounts) {
  const validation = validateState(state);
  assert.equal(validation.ok, true, validation.errors.join('; '));
  assert.equal(state.tick, 60);
  assert.equal(state.complete, true);
  assert.equal(eventCounts.get('MAYORAL_ELECTION'), 1);
  for (const type of ['CLIMAX_HASSAKU_SUMO', 'CLIMAX_FOREST_LIVE', 'CLIMAX_HEAVY_RAIN']) {
    assert.equal(eventCounts.get(type), 1, `${type} must occur once`);
  }
  assert.ok(Object.keys(state.entities.residents).length >= 1000);
  for (const value of Object.values(state.gates)) assert.ok(value >= 0, 'gate values must stay non-negative');
  for (const value of Object.values(state.metrics)) assert.ok(value >= 0 && value <= 100, 'metrics must stay within 0..100');
  assert.equal(applyCommand(state, { type: 'SET_GRADE', grade: 'A' }).ok, false);

  const report = evaluateRun(state);
  assert.match(report.grade, /^[A-D]$/);
  assert.equal(report.success, report.grade === 'A' || report.grade === 'B');
  assert.equal(Object.keys(report.dimensions).length, 6);
  assert.ok(report.evidence.length >= 6);
  assert.ok(report.tradeoffs.length > 0);

  const storage = memoryStorage();
  assert.equal(saveGame(storage, state).ok, true);
  assert.deepEqual(loadGame(storage), { ok: true, state });
  return report;
}

function validateSeeds(seeds) {
  const result = { completed: 0, failures: 0, deterministicReplayFailures: 0, grades: [], failureDetails: [] };
  for (const seed of seeds) {
    const strategy = STRATEGIES[(seed - 1) % STRATEGIES.length];
    const setup = generatedSetup(seed, strategy);
    try {
      const { state, eventCounts } = executeStrategy(setup, strategy);
      const report = assertReleaseInvariants(state, eventCounts);
      const replayed = replayGame(setup, state.actions);
      if (!isDeepStrictEqual(replayed, state)) result.deterministicReplayFailures += 1;
      result.grades.push(report.grade);
      result.completed += 1;
    } catch (error) {
      result.failures += 1;
      if (result.failureDetails.length < 5) result.failureDetails.push({ seed, message: error.message });
    }
  }
  return result;
}

function readRuns(argv) {
  const index = argv.indexOf('--runs');
  const value = index === -1 ? 100 : Number(argv[index + 1]);
  if (!Number.isInteger(value) || value <= 0 || value > 10_000) throw new RangeError('--runs must be an integer from 1 to 10000');
  return value;
}

async function runWorkers(runs) {
  const workerCount = Math.min(runs, Math.max(1, Math.min(6, availableParallelism())));
  const assignments = Array.from({ length: workerCount }, () => []);
  for (let seed = 1; seed <= runs; seed += 1) assignments[(seed - 1) % workerCount].push(seed);
  return Promise.all(assignments.map(seeds => new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), { workerData: { seeds } });
    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', code => { if (code !== 0) reject(new Error(`validator worker exited ${code}`)); });
  })));
}

if (!isMainThread) {
  parentPort.postMessage(validateSeeds(workerData.seeds));
} else {
  const runs = readRuns(process.argv);
  const partials = await runWorkers(runs);
  const summary = {
    completed: partials.reduce((sum, item) => sum + item.completed, 0),
    failures: partials.reduce((sum, item) => sum + item.failures, 0),
    deterministicReplayFailures: partials.reduce((sum, item) => sum + item.deterministicReplayFailures, 0),
    grades: [...new Set(partials.flatMap(item => item.grades))].sort(),
    failureDetails: partials.flatMap(item => item.failureDetails).slice(0, 5)
  };
  process.stdout.write(`${JSON.stringify(summary)}\n`);
  if (summary.failures || summary.deterministicReplayFailures) process.exitCode = 1;
}
