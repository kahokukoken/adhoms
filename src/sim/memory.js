const { cloneWorld } = require('./world');

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function recordTravelExperience(world, { actorId, relationId, success, burden = 0 }) {
  const next = cloneWorld(world);
  const relation = next.relations.find(item => item.id === relationId && item.from === actorId);
  if (!relation) throw new Error('travel relation not found');

  const current = clamp01(relation.state.avoidanceMemory ?? 0);
  const burdenWeight = clamp01(burden);
  const avoidance = success
    ? current * 0.65
    : clamp01(current + 0.25 + 0.35 * burdenWeight);

  relation.state.avoidanceMemory = avoidance;
  next.memory.push({
    tick: next.tick,
    kind: 'travel-experience',
    actorId,
    relationId,
    success: Boolean(success),
    burden: burdenWeight,
    avoidanceMemory: avoidance,
  });

  return next;
}

module.exports = { recordTravelExperience };
