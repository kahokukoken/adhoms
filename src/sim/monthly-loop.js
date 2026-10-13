const { applyInstitutionalAction, recordInstitutionalOutcome } = require('./institution');
const { applyWeatherFriction } = require('./rules/weather');
const { applyTransportAccess } = require('./rules/transport');
const { chooseMobilityAction } = require('./action');
const { recordTravelExperience } = require('./memory');
const { advanceMonth } = require('./tick');

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function averagePersonAccess(world) {
  const people = world.entities.filter(entity => entity.type === 'person' && Number.isFinite(entity.state.access));
  if (people.length === 0) return 0;
  return people.reduce((sum, person) => sum + person.state.access, 0) / people.length;
}

function runTransportMonth(world, { institutionalAction = null, weather = {} } = {}) {
  const baseline = applyTransportAccess(world);
  const baselineAccess = averagePersonAccess(baseline);

  let next = baseline;
  if (institutionalAction) {
    next = applyInstitutionalAction(next, institutionalAction);
  }

  next = applyWeatherFriction(next, weather);
  next = applyTransportAccess(next);
  next = chooseMobilityAction(next);
  next = applyTransportAccess(next);

  const useRelations = next.relations.filter(relation => relation.type === 'uses');
  for (const relation of useRelations) {
    const person = next.entities.find(entity => entity.id === relation.from);
    if (!person || person.type !== 'person') continue;
    next = recordTravelExperience(next, {
      actorId: person.id,
      relationId: relation.id,
      success: clamp01(person.state.access ?? 0) >= 0.5,
      burden: clamp01(person.state.travelBurden ?? 1),
    });
  }

  if (institutionalAction) {
    const actionMemory = [...next.memory].reverse().find(entry =>
      entry.kind === 'institutional-action' &&
      entry.actorId === institutionalAction.actorId &&
      entry.targetId === institutionalAction.targetId
    );
    const implementation = clamp01(actionMemory?.implementation ?? 0);
    const expected = clamp01(baselineAccess + 0.12 * implementation);
    const observed = averagePersonAccess(next);
    next = recordInstitutionalOutcome(next, {
      institutionId: institutionalAction.actorId,
      expected,
      observed,
      salience: clamp01(institutionalAction.intensity),
    });
  }

  return advanceMonth(next);
}

module.exports = { runTransportMonth, averagePersonAccess };
