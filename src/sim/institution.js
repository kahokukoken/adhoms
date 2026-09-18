const { cloneWorld } = require('./world');

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function createInstitutionalAction({ actorId, targetId, domain, type, intensity = 1, metadata = {} }) {
  if (!actorId || !targetId || !domain || !type) throw new Error('institutional action requires actor, target, domain and type');
  return {
    actorId,
    targetId,
    domain,
    type,
    intensity: clamp01(intensity),
    metadata: JSON.parse(JSON.stringify(metadata)),
  };
}

function applyInstitutionalAction(world, action) {
  const next = cloneWorld(world);
  const actor = next.entities.find(entity => entity.id === action.actorId);
  const target = next.entities.find(entity => entity.id === action.targetId);
  if (!actor || actor.type !== 'institution') throw new Error('institution actor not found');
  if (!target) throw new Error('institutional action target not found');

  const authorityRelation = next.relations.find(relation =>
    relation.from === action.actorId &&
    relation.to === action.targetId &&
    relation.type === 'governs' &&
    (!relation.state.domain || relation.state.domain === action.domain)
  );
  if (!authorityRelation) throw new Error('authority relation required for institutional action');

  const authority = clamp01(actor.capabilities?.authority?.[action.domain] ?? 0);
  const legitimacy = clamp01(actor.state.legitimacy ?? 0);
  const budget = clamp01(actor.capabilities?.budget ?? 1);
  const channel = clamp01(authorityRelation.strength ?? 0);
  const implementation = clamp01(action.intensity) * authority * legitimacy * budget * channel;

  if (action.type === 'service-support') {
    target.state.institutionalSupport = clamp01((target.state.institutionalSupport ?? 0) + implementation);
  }

  actor.actions.push({ tick: next.tick, ...JSON.parse(JSON.stringify(action)), implementation });
  next.memory.push({
    tick: next.tick,
    kind: 'institutional-action',
    actorId: action.actorId,
    targetId: action.targetId,
    domain: action.domain,
    type: action.type,
    requestedIntensity: action.intensity,
    implementation,
    authority,
    legitimacy,
    channel,
  });

  return next;
}

function recordInstitutionalOutcome(world, { institutionId, expected, observed, salience = 1 }) {
  const next = cloneWorld(world);
  const institution = next.entities.find(entity => entity.id === institutionId);
  if (!institution || institution.type !== 'institution') throw new Error('institution not found');

  const expectedValue = clamp01(expected);
  const observedValue = clamp01(observed);
  const salienceValue = clamp01(salience);
  const gap = observedValue - expectedValue;
  const before = clamp01(institution.state.legitimacy ?? 0.5);
  const change = gap * salienceValue * 0.2;
  institution.state.legitimacy = clamp01(before + change);

  next.memory.push({
    tick: next.tick,
    kind: 'institutional-outcome',
    institutionId,
    expected: expectedValue,
    observed: observedValue,
    salience: salienceValue,
    gap,
    legitimacyBefore: before,
    legitimacyAfter: institution.state.legitimacy,
  });

  return next;
}

module.exports = {
  createInstitutionalAction,
  applyInstitutionalAction,
  recordInstitutionalOutcome,
};
