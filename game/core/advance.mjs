import { restoreRng } from './rng.mjs';
import { validateState } from './invariants.mjs';
import { getCalendar } from './state.mjs';
import { applyDueEffects, applySharedTransitions } from './transitions.mjs';
import { cloneForAdvance } from './clone.mjs';
import { getRequiredPhases } from '../scenario/calendar.mjs';
import { observationQualityFromSummary, selectTerminalPanel, summarizeCoverage } from './sampling.mjs';

const INPUT_NUMBERS = Object.freeze([
  'tick', 'temperatureC', 'rainfallMm', 'snowCm',
  'economicDemand', 'wildlifePressure'
]);

export function validateScenarioInput(state, input) {
  const errors = [];
  if (!input || typeof input !== 'object') return ['scenario input must be an object'];
  for (const key of INPUT_NUMBERS) {
    if (!Number.isFinite(input[key])) errors.push(`${key} must be finite`);
  }
  if (input.tick !== state.tick) errors.push('scenario tick must match state tick');
  if (input.rainfallMm < 0) errors.push('rainfallMm must be non-negative');
  if (input.snowCm < 0) errors.push('snowCm must be non-negative');
  return errors;
}

function failedAdvance(state, classification, errors) {
  const diagnostic = {
    id: `residual:${state.tick}:${classification}`,
    tick: state.tick,
    classification,
    errors: [...errors],
    resolved: false
  };
  return {
    ok: false,
    state,
    events: [],
    residuals: [...state.residuals, diagnostic]
  };
}

export function advanceMonth(state, scenarioInput) {
  const currentValidation = validateState(state);
  if (!currentValidation.ok) return failedAdvance(state, 'STATE_INVARIANT', currentValidation.errors);
  if (state.pendingPhases.length) return failedAdvance(state, 'PENDING_PHASE', ['pending phase must be resolved before advancing']);
  const inputErrors = validateScenarioInput(state, scenarioInput);
  if (inputErrors.length) return failedAdvance(state, 'INVALID_SCENARIO_INPUT', inputErrors);

  const candidate = cloneForAdvance(state);
  const rng = restoreRng(candidate.rng);
  const events = [];
  applyDueEffects(candidate, events);
  applySharedTransitions(candidate, scenarioInput, rng, events);
  candidate.actions.push({
    type: 'ADVANCE_MONTH',
    tick: state.tick,
    scenarioInput: structuredClone(scenarioInput)
  });
  candidate.tick += 1;
  candidate.calendar = getCalendar(candidate.tick);
  candidate.rng = rng.snapshot();
  const observationSummary = summarizeCoverage(selectTerminalPanel(candidate));
  candidate.metrics.observationQuality = observationQualityFromSummary(
    observationSummary,
    candidate.player.terminalPolicy.coverage
  );
  candidate.history.push({
    tick: candidate.tick,
    eventIds: events.map(item => item.id),
    metricSnapshot: structuredClone(candidate.metrics),
    gateSnapshot: structuredClone(candidate.gates)
  });
  if (candidate.tick === 60) candidate.complete = true;
  candidate.pendingPhases = getRequiredPhases({ tick: state.tick })
    .flatMap(phase => phase === 'final-climax' ? ['crisis-decision'] : [phase])
    .filter(phase => ['annual-review', 'crisis-decision'].includes(phase) || (phase === 'quarterly-decision' && candidate.tick < 60));
  candidate.phase = candidate.pendingPhases[0] ?? (candidate.complete ? 'evaluation' : 'observation');

  const validation = validateState(candidate);
  if (!validation.ok) return failedAdvance(state, 'STATE_INVARIANT', validation.errors);
  return {
    ok: true,
    state: candidate,
    events,
    residuals: candidate.residuals
  };
}
