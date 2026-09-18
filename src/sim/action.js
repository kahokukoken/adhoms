const { cloneWorld } = require('./world');

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function chooseMobilityAction(world) {
  const next = cloneWorld(world);
  const relationsByActor = new Map();

  for (const relation of next.relations) {
    if (relation.type !== 'uses') continue;
    if (!relationsByActor.has(relation.from)) relationsByActor.set(relation.from, []);
    relationsByActor.get(relation.from).push(relation);
  }

  for (const actor of next.entities) {
    if (actor.type !== 'person') continue;
    const relations = relationsByActor.get(actor.id) || [];
    if (relations.length === 0) continue;

    const primary = relations[0];
    const access = clamp01(actor.state.access ?? 0.5);
    const burden = clamp01(actor.state.travelBurden ?? (1 - access));
    const avoidance = clamp01(primary.state.avoidanceMemory ?? 0);
    const relationAlternative = clamp01(primary.state.alternativeMobility ?? 0);
    const capabilityAlternative = actor.capabilities.drive ? 1 : (actor.capabilities.cycle ? 0.65 : 0);
    const alternative = Math.max(relationAlternative, capabilityAlternative);
    const servicePreference = access * (1 - 0.6 * avoidance) * (1 - 0.25 * burden);

    let choice = 'defer-trip';
    if (servicePreference >= 0.5) choice = 'use-service';
    else if (alternative >= 0.35) choice = 'alternative';

    actor.state.mobilityChoice = choice;
    actor.actions.push({
      tick: next.tick,
      type: 'mobility-choice',
      choice,
      access,
      burden,
      avoidance,
      alternative,
      relationId: primary.id,
    });
  }

  return next;
}

module.exports = { chooseMobilityAction };
