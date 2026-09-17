const { cloneWorld } = require('../world');

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function applyWeatherFriction(world, { rain = 0, snow = 0 } = {}) {
  const next = cloneWorld(world);
  const rainLoad = clamp01(rain);
  const snowLoad = clamp01(snow);
  const effectiveness = clamp01(1 - 0.35 * rainLoad - 0.45 * snowLoad);

  for (const relation of next.relations) {
    if (relation.type !== 'uses') continue;
    relation.state.weatherEffectiveness = effectiveness;
  }

  next.memory.push({
    tick: next.tick,
    kind: 'weather-friction',
    rain: rainLoad,
    snow: snowLoad,
    effectiveness,
  });

  return next;
}

module.exports = { applyWeatherFriction };
