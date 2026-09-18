const { cloneWorld } = require('../world');

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function applyTransportAccess(world) {
  const next = cloneWorld(world);
  const entities = new Map(next.entities.map(entity => [entity.id, entity]));
  const useRelations = next.relations.filter(relation => relation.type === 'uses');
  const loads = new Map();

  for (const relation of useRelations) {
    const person = entities.get(relation.from);
    const service = entities.get(relation.to);
    if (!person || person.type !== 'person' || !service || service.type !== 'transport-service') continue;

    const frequency = clamp01(service.state.frequency ?? 0);
    const reliability = clamp01(service.state.reliability ?? 1);
    const scheduleFit = clamp01(relation.state.scheduleFit ?? 1);
    const alternativeMobility = clamp01(relation.state.alternativeMobility ?? 0);
    const distance = clamp01(relation.state.distance ?? 0);
    const weatherEffectiveness = clamp01(relation.state.weatherEffectiveness ?? 1);
    const avoidanceMemory = clamp01(relation.state.avoidanceMemory ?? 0);
    const memoryEffectiveness = 1 - 0.45 * avoidanceMemory;
    const distanceFactor = 1 - 0.4 * distance;
    const servicePath = frequency * reliability * scheduleFit * distanceFactor * clamp01(relation.strength ?? 1) * weatherEffectiveness * memoryEffectiveness;
    const access = clamp01(alternativeMobility + (1 - alternativeMobility) * servicePath);

    person.state.access = access;
    person.state.travelBurden = 1 - access;

    const demand = (1 - alternativeMobility) * scheduleFit * clamp01(relation.strength ?? 1);
    const effectiveDemand = demand / Math.max(0.05, weatherEffectiveness);
    loads.set(service.id, (loads.get(service.id) || 0) + effectiveDemand);
  }

  for (const [serviceId, demand] of loads.entries()) {
    const service = entities.get(serviceId);
    const capacity = Math.max(0.001, Number(service.state.capacity ?? 1));
    service.state.serviceLoad = demand / capacity;
  }

  next.memory.push({
    tick: next.tick,
    kind: 'transport-access',
    serviceLoads: Object.fromEntries(loads),
  });

  return next;
}

module.exports = { applyTransportAccess };
