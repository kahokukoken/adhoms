import assert from 'node:assert/strict';
import { advanceMonth } from '../../game/core/advance.mjs';
import { applyCommand } from '../../game/core/commands.mjs';
import { createInitialState } from '../../game/core/state.mjs';
import { getScenarioInput } from '../../game/scenario/events.mjs';
import { observeMonth } from '../../game/observation/terminal.mjs';

export const setup = Object.freeze({
  seed: 164,
  leaderId: 'miyashita',
  priorities: Object.freeze({
    welfare: 60,
    market: 60,
    future: 60,
    technology: 60,
    environment: 60
  }),
  terminalPolicy: Object.freeze({
    coverage: 0.2,
    balance: 0.7,
    compensation: 40,
    dataScope: 0.5,
    anonymity: 0.8,
    surveyFrequency: 1
  })
});

export const monthlyInput = (tick, overrides = {}) => ({
  tick,
  temperatureC: 18,
  rainfallMm: 80,
  snowCm: 0,
  economicDemand: 0.5,
  wildlifePressure: 0.2,
  authoredText: '',
  ...overrides
});

export const memoryStorage = () => {
  const data = new Map();
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: key => data.delete(key)
  };
};

export const withTerminalDropout = (state, dropout) => ({
  ...structuredClone(state),
  player: {
    ...state.player,
    terminalPolicy: {
      ...state.player.terminalPolicy,
      surveyFrequency: Math.min(12, 1 + dropout / 0.05)
    }
  }
});

export function completeRun(config = setup) {
  let state = createInitialState(config);
  while (state.tick < 60) {
    const result = advanceMonth(state, getScenarioInput(state));
    assert.equal(result.ok, true, result.residuals.at(-1)?.errors?.join('; '));
    const observations = observeMonth(result.state, result.events);
    const recorded = applyCommand(result.state, {
      type: 'RECORD_OBSERVATIONS',
      items: observations.items,
      summary: observations.summary
    });
    assert.equal(recorded.ok, true, recorded.errors.join('; '));
    state = resolvePendingPhases(recorded.state, config.priorities);
  }
  return state;
}

export function resolvePendingPhases(state, priorities = state.player.priorities) {
  let candidate = state;
  while (candidate.pendingPhases.length) {
    const phase = candidate.pendingPhases[0];
    const command = phase === 'quarterly-decision'
      ? { type: 'SET_PRIORITIES', priorities }
      : phase === 'crisis-decision'
        ? { type: 'RESPOND_TO_CRISIS', choice: 'distributed-response' }
        : { type: 'ACKNOWLEDGE_PHASE', phase };
    const result = applyCommand(candidate, command);
    assert.equal(result.ok, true, result.errors.join('; '));
    candidate = result.state;
  }
  return candidate;
}
