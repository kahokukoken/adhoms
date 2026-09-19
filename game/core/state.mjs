import { CALENDAR, VERSIONS } from './constants.mjs';
import { createRng } from './rng.mjs';
import { validatePriorities, validateState } from './invariants.mjs';
import { KURIKARA_SCENARIO, createKurikaraEntities } from '../scenario/kurikara.mjs';

export function getCalendar(tick) {
  const absoluteMonth = CALENDAR.startMonth - 1 + tick;
  return {
    year: CALENDAR.startYear + Math.floor(absoluteMonth / 12),
    month: absoluteMonth % 12 + 1,
    trialYear: Math.floor(tick / 12) + 1
  };
}

function assertTerminalPolicy(policy) {
  const ratioKeys = ['coverage', 'balance', 'dataScope', 'anonymity'];
  if (!policy || ratioKeys.some(key => !Number.isFinite(policy[key]) || policy[key] < 0 || policy[key] > 1)) {
    throw new RangeError('terminal policy ratios must be between 0 and 1');
  }
  if (!Number.isFinite(policy.compensation) || policy.compensation < 0) {
    throw new RangeError('terminal compensation must be non-negative');
  }
  if (!Number.isFinite(policy.surveyFrequency) || policy.surveyFrequency <= 0) {
    throw new RangeError('survey frequency must be positive');
  }
}

export function createInitialState({ seed, leaderId, priorities, terminalPolicy }) {
  if (!Object.hasOwn(KURIKARA_SCENARIO.staff, leaderId)) {
    throw new RangeError('leader must be in the fixed staff roster');
  }
  const priorityErrors = validatePriorities(priorities);
  if (priorityErrors.length) throw new RangeError(priorityErrors.join('; '));
  assertTerminalPolicy(terminalPolicy);

  const rng = createRng(seed);
  const generated = createKurikaraEntities(rng);
  const mayorTraits = ['consensus', 'decisive', 'cautious', 'growth-oriented'];
  generated.entities.actors.mayor.trait = rng.pick(mayorTraits);

  const state = {
    versions: structuredClone(VERSIONS),
    scenarioId: KURIKARA_SCENARIO.id,
    initialSetup: structuredClone({ seed: Number(seed), leaderId, priorities, terminalPolicy }),
    seed: Number(seed),
    rng: rng.snapshot(),
    tick: 0,
    calendar: getCalendar(0),
    entities: generated.entities,
    relations: generated.relations,
    memories: [],
    actions: [],
    residuals: [],
    observations: [],
    history: [],
    player: {
      leaderId,
      priorities: structuredClone(priorities),
      terminalPolicy: structuredClone(terminalPolicy),
      bookmarks: [],
      investigations: [],
      assessments: {}
    },
    metrics: {
      socialStability: 62,
      adaptability: 52,
      legitimacy: 58,
      fiscalSustainability: 61,
      resilience: 55,
      observationQuality: 50
    },
    gates: {
      authority: 60,
      administrativeCapacity: 55,
      budget: 100
    },
    institutionalCapacity: {
      welfareService: 0.5,
      economicSupport: 0.5,
      learningCapacity: 0.5,
      digitalSupport: 0.5,
      maintenanceSupport: 0.5,
      observationEthics: 0.5
    },
    pendingEffects: [{
      id: 'priority:initial',
      kind: 'priority-allocation',
      remainingMonths: 2,
      priorities: structuredClone(priorities)
    }, {
      id: 'terminal-policy:initial',
      kind: 'terminal-policy',
      remainingMonths: 1,
      policy: structuredClone(terminalPolicy)
    }],
    pendingPhases: [],
    phase: 'observation',
    complete: false
  };

  const validation = validateState(state);
  if (!validation.ok) throw new Error(`invalid initial state: ${validation.errors.join('; ')}`);
  return state;
}
