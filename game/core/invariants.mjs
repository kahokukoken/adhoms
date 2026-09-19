import { LIMITS, VERSIONS } from './constants.mjs';

const PRIORITY_KEYS = Object.freeze([
  'welfare', 'market', 'future', 'technology', 'environment'
]);
const VALID_PHASES = new Set([
  'setup', 'observation', 'quarterly-decision', 'annual-review',
  'mayoral-election', 'crisis-decision', 'evaluation', 'complete'
]);
const REQUIRED_METRICS = Object.freeze([
  'socialStability', 'adaptability', 'legitimacy',
  'fiscalSustainability', 'resilience', 'observationQuality'
]);
const REQUIRED_CAPACITIES = Object.freeze([
  'welfareService', 'economicSupport', 'learningCapacity',
  'digitalSupport', 'maintenanceSupport', 'observationEthics'
]);

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function validatePriorities(priorities) {
  if (!priorities || PRIORITY_KEYS.some(key => !Number.isFinite(priorities[key]))) {
    return ['priorities require five finite values'];
  }
  const total = PRIORITY_KEYS.reduce((sum, key) => sum + priorities[key], 0);
  const errors = [];
  if (total !== 300) errors.push('priorities must total 300');
  for (const key of PRIORITY_KEYS) {
    if (priorities[key] < 0 || priorities[key] > 100) {
      errors.push(`${key} must be between 0 and 100`);
    }
  }
  return errors;
}

export function validateTerminalPolicy(policy) {
  if (!policy || typeof policy !== 'object') return ['terminal policy is required'];
  const errors = [];
  for (const key of ['coverage', 'balance', 'dataScope', 'anonymity']) {
    if (!Number.isFinite(policy[key]) || policy[key] < 0 || policy[key] > 1) {
      errors.push(`${key} must be between 0 and 1`);
    }
  }
  if (!Number.isFinite(policy.compensation) || policy.compensation < 0 || policy.compensation > 100) {
    errors.push('compensation must be between 0 and 100');
  }
  if (!Number.isFinite(policy.surveyFrequency) || policy.surveyFrequency < 0.25 || policy.surveyFrequency > 12) {
    errors.push('surveyFrequency must be between 0.25 and 12');
  }
  return errors;
}

export function validateState(state) {
  const errors = [];
  if (!state || typeof state !== 'object') return { ok: false, errors: ['state must be an object'] };
  if (state.versions?.schema !== VERSIONS.schema) errors.push('schema version mismatch');
  if (state.versions?.rules !== VERSIONS.rules) errors.push('rules version mismatch');
  if (state.versions?.scenario !== VERSIONS.scenario) errors.push('scenario version mismatch');
  if (!Number.isInteger(state.tick) || state.tick < 0 || state.tick > 60) errors.push('tick must be an integer from 0 to 60');
  if (!Number.isFinite(state.seed)) errors.push('seed must be finite');
  if (!isRecord(state.initialSetup) || state.initialSetup?.seed !== state.seed) {
    errors.push('initial setup is invalid');
  } else {
    errors.push(...validatePriorities(state.initialSetup.priorities));
    errors.push(...validateTerminalPolicy(state.initialSetup.terminalPolicy));
    if (!state.entities?.staff?.[state.initialSetup.leaderId]) errors.push('initial leader is not in the staff roster');
  }
  if (!VALID_PHASES.has(state.phase)) errors.push('phase is invalid');
  if (!Array.isArray(state.pendingPhases) || state.pendingPhases.some(phase => !VALID_PHASES.has(phase))) {
    errors.push('pending phases are invalid');
  } else if (state.pendingPhases.length && state.phase !== state.pendingPhases[0]) {
    errors.push('phase must match the first pending phase');
  } else if (!state.pendingPhases.length && !['observation', 'evaluation'].includes(state.phase)) {
    errors.push('non-observation phase requires a pending phase');
  }
  if (state.rng?.algorithm !== 'xorshift32' || !Number.isInteger(state.rng?.state) || state.rng.state < 0 || state.rng.state > 0xffffffff) {
    errors.push('rng snapshot is invalid');
  }

  for (const key of ['memories', 'actions', 'residuals', 'observations', 'history', 'pendingEffects']) {
    if (!Array.isArray(state[key])) errors.push(`${key} must be an array`);
  }
  if (Array.isArray(state.history) && Number.isInteger(state.tick) && state.history.length !== state.tick) {
    errors.push('history length must match tick');
  }
  if (state.complete !== (state.tick === 60)) errors.push('complete flag must match final tick');
  if (state.phase === 'evaluation' && !state.complete) errors.push('evaluation phase requires completion');
  if (!state.calendar || !Number.isInteger(state.calendar.year) || !Number.isInteger(state.calendar.month) || state.calendar.month < 1 || state.calendar.month > 12) {
    errors.push('calendar is invalid');
  }

  for (const key of ['residents', 'households', 'districts', 'institutions', 'facilities', 'staff', 'actors']) {
    if (!isRecord(state.entities?.[key])) errors.push(`${key} entities are required`);
  }
  if (!isRecord(state.relations)) errors.push('relations are required');

  const residentCount = Object.keys(state.entities?.residents ?? {}).length;
  if (residentCount < LIMITS.residentsMin || residentCount > LIMITS.residentsMax) {
    errors.push('resident agent count is outside limits');
  }

  for (const [id, resident] of Object.entries(state.entities?.residents ?? {})) {
    if (!isRecord(resident)) {
      errors.push(`${id} resident record is invalid`);
      continue;
    }
    if (!Number.isFinite(resident.weight) || resident.weight <= 0) errors.push(`${id} has invalid weight`);
    if (!Number.isFinite(resident.age) || resident.age < 0) errors.push(`${id} has invalid age`);
    for (const [key, value] of Object.entries({
      health: resident.health,
      incomeCondition: resident.incomeCondition,
      physicalCapability: resident.capabilities?.physical,
      digitalCapability: resident.capabilities?.digital,
      socialCapability: resident.capabilities?.social,
      institutionalTrust: resident.perceptions?.institutionalTrust
    })) {
      if (!Number.isFinite(value) || value < 0 || value > 1) errors.push(`${id} has invalid ${key}`);
    }
    if (!Array.isArray(resident.actions) || !Array.isArray(resident.memories)) {
      errors.push(`${id} requires action and memory arrays`);
    }
    if (!state.entities?.households?.[resident.householdId]) {
      errors.push(`${id} references missing household ${resident.householdId}`);
    }
    if (!state.entities?.districts?.[resident.districtId]) {
      errors.push(`${id} references missing district ${resident.districtId}`);
    }
  }
  for (const [id, household] of Object.entries(state.entities?.households ?? {})) {
    if (!isRecord(household)) {
      errors.push(`${id} household record is invalid`);
      continue;
    }
    if (!Array.isArray(household.memberIds)) errors.push(`${id} requires memberIds`);
    if (!state.entities?.districts?.[household.districtId]) errors.push(`${id} references missing district ${household.districtId}`);
    if (!Number.isFinite(household.transportAccess) || household.transportAccess < 0 || household.transportAccess > 1) {
      errors.push(`${id} has invalid transport access`);
    }
    for (const residentId of Array.isArray(household.memberIds) ? household.memberIds : []) {
      if (!state.entities?.residents?.[residentId]) errors.push(`${id} references missing resident ${residentId}`);
    }
  }
  for (const [id, relation] of Object.entries(state.relations ?? {})) {
    if (!isRecord(relation)) {
      errors.push(`${id} relation record is invalid`);
      continue;
    }
    if (!Number.isFinite(relation.strength) || relation.strength < LIMITS.relationMin || relation.strength > LIMITS.relationMax) {
      errors.push(`${id} has invalid relation strength`);
    }
    const knownIds = state.entities && Object.values(state.entities)
      .some(group => isRecord(group) && Object.hasOwn(group, relation.fromId));
    const knownTarget = state.entities && Object.values(state.entities)
      .some(group => isRecord(group) && Object.hasOwn(group, relation.toId));
    if (!knownIds || !knownTarget) errors.push(`${id} has a missing relation endpoint`);
  }
  errors.push(...validatePriorities(state.player?.priorities));
  errors.push(...validateTerminalPolicy(state.player?.terminalPolicy));
  if (!Array.isArray(state.player?.bookmarks)) errors.push('bookmarks must be an array');
  if (!Array.isArray(state.player?.investigations)) errors.push('investigations must be an array');
  if (!state.player?.assessments || typeof state.player.assessments !== 'object') errors.push('assessments must be an object');
  if (!state.entities?.staff?.[state.player?.leaderId]) errors.push('leader is not in the staff roster');

  for (const [id, facility] of Object.entries(state.entities?.facilities ?? {})) {
    if (!isRecord(facility)) {
      errors.push(`${id} facility record is invalid`);
      continue;
    }
    if (!Number.isFinite(facility.condition) || facility.condition < 0 || facility.condition > 1) {
      errors.push(`${id} has invalid facility condition`);
    }
    if (!state.entities?.districts?.[facility.districtId]) errors.push(`${id} references missing district ${facility.districtId}`);
  }
  if (!state.entities?.facilities?.['lakeside-drainage']) errors.push('required facility lakeside-drainage is missing');

  for (const key of REQUIRED_METRICS) {
    const value = state.metrics?.[key];
    if (!Number.isFinite(value) || value < 0 || value > 100) errors.push(`${key} metric must be between 0 and 100`);
  }
  for (const key of ['authority', 'administrativeCapacity', 'budget']) {
    const value = state.gates?.[key];
    if (!Number.isFinite(value) || value < 0) errors.push(`${key} must be non-negative`);
  }
  for (const key of REQUIRED_CAPACITIES) {
    const value = state.institutionalCapacity?.[key];
    if (!Number.isFinite(value) || value < 0 || value > 1) errors.push(`${key} institutional capacity must be between 0 and 1`);
  }
  if (!isRecord(state.institutionalCapacity) || Object.keys(state.institutionalCapacity).length !== REQUIRED_CAPACITIES.length) {
    errors.push('institutional capacity is incomplete');
  }

  const validEffectKinds = new Set([
    'facility-maintenance', 'relation-support', 'distributed-capacity',
    'crisis-recovery', 'priority-allocation', 'terminal-policy', 'seasonal-memory'
  ]);
  for (const [index, effect] of (Array.isArray(state.pendingEffects) ? state.pendingEffects : []).entries()) {
    if (!isRecord(effect)) {
      errors.push(`pending effect ${index} is invalid`);
      continue;
    }
    if (!validEffectKinds.has(effect.kind)) errors.push(`pending effect ${index} has invalid kind`);
    if (!Number.isInteger(effect.remainingMonths) || effect.remainingMonths < 1) {
      errors.push(`pending effect ${index} has invalid remaining months`);
    }
    if (effect.kind === 'priority-allocation') errors.push(...validatePriorities(effect.priorities));
    if (effect.kind === 'terminal-policy') errors.push(...validateTerminalPolicy(effect.policy));
    if (['facility-maintenance', 'relation-support', 'distributed-capacity', 'crisis-recovery', 'seasonal-memory'].includes(effect.kind) && !Number.isFinite(effect.magnitude)) {
      errors.push(`pending effect ${index} requires a finite magnitude`);
    }
    if (effect.kind === 'facility-maintenance' && !state.entities?.facilities?.[effect.facilityId]) {
      errors.push(`pending effect ${index} references missing facility ${effect.facilityId}`);
    }
  }

  try {
    JSON.stringify(state);
  } catch {
    errors.push('state must be JSON serializable');
  }
  return { ok: errors.length === 0, errors };
}
