const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

function event(state, events, type, domain, details = {}) {
  events.push({
    id: `${state.tick}:${type}:${events.length}`,
    tick: state.tick,
    type,
    domain,
    ...details
  });
}

export function applyDueEffects(state, events) {
  const remaining = [];
  for (const effect of state.pendingEffects) {
    const next = { ...effect, remainingMonths: effect.remainingMonths - 1 };
    if (next.remainingMonths > 0) {
      remaining.push(next);
      continue;
    }
    if (effect.kind === 'facility-maintenance') {
      const facility = state.entities.facilities[effect.facilityId];
      if (facility) facility.condition = Math.min(1, facility.condition + effect.magnitude);
    }
    if (effect.kind === 'relation-support') {
      for (const [id, relation] of Object.entries(state.relations)) {
        if (relation.kind === 'place-attachment') {
          state.relations[id] = { ...relation, strength: Math.min(1, relation.strength + effect.magnitude) };
        }
      }
    }
    if (effect.kind === 'distributed-capacity') {
      state.gates.administrativeCapacity = clamp(state.gates.administrativeCapacity + effect.magnitude * 100);
    }
    if (effect.kind === 'crisis-recovery') {
      state.gates.administrativeCapacity = clamp(state.gates.administrativeCapacity + effect.magnitude * 60);
      const exposedKinds = new Set(['drainage', 'park', 'cultural-ground', 'rail']);
      for (const facility of Object.values(state.entities.facilities)) {
        if (exposedKinds.has(facility.kind)) {
          facility.condition = Math.min(1, facility.condition + effect.magnitude);
        }
      }
      state.memories.push({
        id: `memory:crisis-recovery:${state.tick}:${effect.id}`,
        tick: state.tick,
        kind: 'crisis-physical-recovery',
        sourceEffectId: effect.id,
        magnitude: effect.magnitude
      });
    }
    if (effect.kind === 'priority-allocation') {
      const mapping = {
        welfareService: 'welfare',
        economicSupport: 'market',
        learningCapacity: 'future',
        digitalSupport: 'technology',
        maintenanceSupport: 'environment'
      };
      for (const [capacity, priority] of Object.entries(mapping)) {
        state.institutionalCapacity[capacity] = Math.max(0, Math.min(1,
          state.institutionalCapacity[capacity] * 0.65 + effect.priorities[priority] / 100 * 0.35
        ));
      }
      state.memories.push({
        id: `memory:capacity:${state.tick}:${effect.id}`,
        tick: state.tick,
        kind: 'institutional-capacity-change',
        sourceEffectId: effect.id,
        capacities: { ...state.institutionalCapacity }
      });
    }
    if (effect.kind === 'terminal-policy') {
      const policy = effect.policy;
      state.institutionalCapacity.observationEthics = Math.max(0, Math.min(1,
        policy.anonymity * 0.45 +
        (1 - policy.dataScope) * 0.2 +
        Math.min(1, policy.compensation / 100) * 0.2 +
        (1 - Math.min(1, policy.surveyFrequency / 12)) * 0.15
      ));
      state.memories.push({
        id: `memory:terminal-policy:${state.tick}:${effect.id}`,
        tick: state.tick,
        kind: 'terminal-policy-experience',
        sourceEffectId: effect.id,
        ethics: state.institutionalCapacity.observationEthics
      });
    }
    if (effect.kind === 'seasonal-memory') {
      state.institutionalCapacity.learningCapacity = Math.min(
        1,
        state.institutionalCapacity.learningCapacity + effect.magnitude * 0.002
      );
      state.memories.push({
        id: `memory:learned:${state.tick}:${effect.id}`,
        tick: state.tick,
        kind: 'learned-seasonal-signal',
        sourceTick: effect.sourceTick,
        strength: effect.magnitude
      });
    }
    event(state, events, 'DELAYED_EFFECT_APPLIED', 'institution', { effectId: effect.id, kind: effect.kind });
  }
  state.pendingEffects = remaining;
}

function updateFacilities(state, input, events) {
  const rainPressure = Math.max(0, input.rainfallMm - 80) / 5000;
  const snowPressure = input.snowCm / 9000;
  for (const facility of Object.values(state.entities.facilities)) {
    const exposure = facility.kind === 'drainage' ? rainPressure * 1.4 : rainPressure + snowPressure;
    const maintenance = state.institutionalCapacity.maintenanceSupport * 0.005;
    facility.condition = Math.max(0, Math.min(1, facility.condition - 0.0015 + maintenance - exposure));
  }
  if (input.rainfallMm >= 120) event(state, events, 'HEAVY_RAIN_PRESSURE', 'environment', { rainfallMm: input.rainfallMm });
  if (input.snowCm >= 30) event(state, events, 'SNOW_ACCESS_PRESSURE', 'mobility', { snowCm: input.snowCm });
}

function politicalMandate(state) {
  const progressive = state.relations['political:mayor:progressive-faction']?.strength ?? 0;
  const conservative = state.relations['political:mayor:conservative-faction']?.strength ?? 0;
  return progressive - conservative;
}

function updateResidents(state, input) {
  const facilities = Object.values(state.entities.facilities);
  const averageCondition = facilities.reduce((sum, item) => sum + item.condition, 0) / facilities.length;
  const weatherStress = Math.max(0, input.temperatureC - 30) / 200 + input.snowCm / 3000;
  const updated = { ...state.entities.residents };
  const residents = Object.values(state.entities.residents);
  const cohort = state.tick % 12;
  const capacity = state.institutionalCapacity;
  const mandate = politicalMandate(state);
  const rememberedStress = state.memories.slice(-18).filter(memory =>
    memory.kind === 'monthly-condition' && (memory.rainfallBand === 'high' || memory.snowBand === 'high')
  ).length / 1800;
  for (let index = cohort; index < residents.length; index += 12) {
    const resident = residents[index];
    const access = state.entities.households[resident.householdId].transportAccess;
    const healthDelta = ((averageCondition - 0.6) * 0.002 + (capacity.welfareService - 0.5) * 0.004 + mandate * 0.0003 - weatherStress - rememberedStress) * 12;
    const incomeDelta = (capacity.economicSupport - 0.5) * 0.018 - mandate * 0.003;
    const digitalDelta = (capacity.digitalSupport - 0.5) * 0.08;
    const trustDelta = ((access - 0.5) * 0.001 + (capacity.welfareService - 0.5) * 0.0015 + (capacity.observationEthics - 0.5) * 0.0015 + mandate * 0.00025) * 12;
    updated[resident.id] = {
      ...resident,
      health: Math.max(0, Math.min(1, resident.health + healthDelta)),
      incomeCondition: Math.max(0, Math.min(1, resident.incomeCondition + incomeDelta)),
      capabilities: {
        ...resident.capabilities,
        digital: Math.max(0, Math.min(1, resident.capabilities.digital + digitalDelta)),
        social: Math.max(0, Math.min(1, resident.capabilities.social + (capacity.learningCapacity - 0.5) * 0.03))
      },
      perceptions: {
        ...resident.perceptions,
        institutionalTrust: Math.max(
      0,
      Math.min(1, resident.perceptions.institutionalTrust + trustDelta)
        )
      },
      actions: [...resident.actions, { tick: state.tick, type: weatherStress > 0.02 ? 'adapt-access' : 'maintain-routine' }].slice(-6),
      memories: [...resident.memories, { tick: state.tick, kind: 'service-experience', healthDelta, trustDelta }].slice(-6)
    };
    const relationId = `resident-district:${resident.id}`;
    const relation = state.relations[relationId];
    if (relation) {
      state.relations[relationId] = {
        ...relation,
        strength: Math.max(-1, Math.min(1, relation.strength + (capacity.welfareService + capacity.economicSupport - 1) * 0.006))
      };
    }
  }
  state.entities.residents = updated;
}

function deriveMetrics(state, input) {
  const residents = Object.values(state.entities.residents);
  const facilities = Object.values(state.entities.facilities);
  const relations = Object.values(state.relations);
  const averageHealth = residents.reduce((sum, item) => sum + item.health, 0) / residents.length;
  const averageIncome = residents.reduce((sum, item) => sum + item.incomeCondition, 0) / residents.length;
  const averageTrust = residents.reduce((sum, item) => sum + item.perceptions.institutionalTrust, 0) / residents.length;
  const averageFacility = facilities.reduce((sum, item) => sum + item.condition, 0) / facilities.length;
  const averageAttachment = relations
    .filter(item => item.kind === 'place-attachment')
    .reduce((sum, item, _, list) => sum + item.strength / list.length, 0);
  state.metrics.socialStability = clamp(averageHealth * 55 + averageAttachment * 45);
  state.metrics.adaptability = clamp(35 + state.institutionalCapacity.learningCapacity * 35 + state.institutionalCapacity.digitalSupport * 20 + state.pendingEffects.length);
  state.metrics.legitimacy = clamp(averageTrust * 70 + state.gates.authority * 0.3);
  state.metrics.fiscalSustainability = clamp(state.gates.budget * 0.65 + averageIncome * 35);
  state.metrics.resilience = clamp(averageFacility * 65 + state.institutionalCapacity.maintenanceSupport * 25 + state.institutionalCapacity.learningCapacity * 10 - input.wildlifePressure * 4);
}

function applyElection(state, special, events) {
  const winnerId = special.winner;
  const loserId = winnerId === 'progressive-faction'
    ? 'conservative-faction'
    : 'progressive-faction';
  state.relations[`political:mayor:${winnerId}`] = {
    id: `political:mayor:${winnerId}`,
    fromId: 'mayor',
    toId: winnerId,
    kind: 'political-mandate',
    strength: 0.68
  };
  state.relations[`political:mayor:${loserId}`] = {
    id: `political:mayor:${loserId}`,
    fromId: 'mayor',
    toId: loserId,
    kind: 'political-mandate',
    strength: -0.22
  };
  state.gates.authority = clamp(state.gates.authority + 3);
  event(state, events, 'MAYORAL_ELECTION', 'politics', { winnerId });
}

function applyClimaxPressure(state, input, events) {
  const pressure = input.pressures;
  const institutionalCapacity =
    state.gates.administrativeCapacity / 100 * 0.25 +
    state.gates.authority / 100 * 0.15 +
    pressure.volunteerReadiness * 0.2 +
    pressure.drainageCondition * 0.22 +
    pressure.shelterDistribution * 0.18;
  const overload = Math.max(0, pressure.sharedCapacityDemand - institutionalCapacity);
  for (const facility of Object.values(state.entities.facilities)) {
    const exposure = ['drainage', 'park', 'cultural-ground', 'rail'].includes(facility.kind) ? 1 : 0.45;
    facility.condition = Math.max(0, facility.condition - overload * exposure * 0.18);
  }
  state.memories.push({
    id: `memory:climax:${state.tick}`,
    tick: state.tick,
    kind: 'shared-capacity-overload',
    overload,
    institutionalCapacity,
    demand: pressure.sharedCapacityDemand
  });
  for (const special of input.specialEvents) {
    if (!special.type.startsWith('CLIMAX_')) continue;
    event(state, events, special.type, special.domain, { overload });
  }
}

function applySpecialEvents(state, input, events) {
  const specials = input.specialEvents ?? [];
  for (const special of specials) {
    if (special.type === 'MAYORAL_ELECTION') applyElection(state, special, events);
  }
  if (specials.some(special => special.type.startsWith('CLIMAX_'))) {
    applyClimaxPressure(state, input, events);
  }
}

export function applySharedTransitions(state, input, rng, events) {
  updateFacilities(state, input, events);
  updateResidents(state, input);
  const policy = state.player.terminalPolicy;
  const observationCost = policy.coverage * policy.compensation / 100 * 0.8;
  const institutionalCost = (
    state.institutionalCapacity.welfareService * 1.1 +
    state.institutionalCapacity.learningCapacity * 0.8 +
    state.institutionalCapacity.digitalSupport * 0.7 +
    state.institutionalCapacity.maintenanceSupport
  ) * 0.12;
  state.gates.budget = Math.max(0, state.gates.budget + input.economicDemand * (0.45 + state.institutionalCapacity.economicSupport * 0.5) - 0.25 - observationCost - institutionalCost - politicalMandate(state) * 0.03);
  state.gates.administrativeCapacity = clamp(state.gates.administrativeCapacity + 1.25);
  state.pendingEffects.push({
    id: `seasonal-memory:${state.tick}`,
    kind: 'seasonal-memory',
    remainingMonths: 2,
    magnitude: rng.next(),
    sourceTick: state.tick
  });
  state.memories.push({
    id: `memory:${state.tick}`,
    tick: state.tick,
    kind: 'monthly-condition',
    rainfallBand: input.rainfallMm >= 120 ? 'high' : 'normal',
    snowBand: input.snowCm >= 30 ? 'high' : 'normal'
  });
  applySpecialEvents(state, input, events);
  deriveMetrics(state, input);
  event(state, events, 'MONTH_ADVANCED', 'system');
}
