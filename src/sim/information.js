function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function propagate(world, observation, actorId) {
  const actor = world.entities.find(entity => entity.id === actorId);
  if (!actor) throw new Error(`unknown information actor: ${actorId}`);

  const reach = clamp01(actor.capabilities.reach ?? 0.2);
  const verification = clamp01(actor.capabilities.verification ?? 0.5);
  const noveltyBias = clamp01(actor.capabilities.noveltyBias ?? 0);
  const addedDistortion = noveltyBias * (1 - verification) * 0.8;
  const distortion = clamp01((observation.distortion ?? 0) + addedDistortion);
  const visibility = clamp01(observation.visibility + (1 - observation.visibility) * reach * 0.8);
  const confidence = clamp01(observation.confidence * (0.55 + 0.45 * verification) * (1 - 0.4 * distortion));

  return {
    ...observation,
    propagatedBy: actorId,
    visibility,
    confidence,
    distortion,
  };
}

module.exports = { propagate };
