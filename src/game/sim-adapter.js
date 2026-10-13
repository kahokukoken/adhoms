function formatState(state) {
  return Object.entries(state || {})
    .map(([key, value]) => `${key}=${typeof value === 'number' ? Number(value.toFixed(2)) : value}`)
    .join(' / ');
}

function toFeedItems(world, { narrate } = {}) {
  const entities = new Map(world.entities.map(entity => [entity.id, entity]));

  return world.observations.map((observation, index) => {
    const source = entities.get(observation.source);
    const profile = source?.state || {};
    const groundState = JSON.parse(JSON.stringify(observation.groundSnapshot || {}));
    const defaultBody = formatState(groundState);
    const body = typeof narrate === 'function'
      ? String(narrate({
          observation: JSON.parse(JSON.stringify(observation)),
          source: source ? JSON.parse(JSON.stringify(source)) : null,
          groundState: JSON.parse(JSON.stringify(groundState)),
        }))
      : defaultBody;

    return {
      id: `sim-${world.tick}-${index}`,
      tick: observation.tick,
      year: world.calendar?.year,
      month: world.calendar?.month,
      sourceId: observation.source,
      subjectId: observation.subject,
      name: profile.name || observation.source || '観測主体',
      age: profile.age ?? '年齢不詳',
      role: profile.role || source?.type || '観測主体',
      confidence: observation.confidence,
      visibility: observation.visibility,
      distortion: observation.distortion ?? 0,
      body,
      groundState,
    };
  });
}

module.exports = { toFeedItems };
