const { cloneWorld } = require('./world');
const { createSeededRng } = require('./rng');

function nextCalendar(calendar) {
  if (calendar.month === 12) return { year: calendar.year + 1, month: 1 };
  return { year: calendar.year, month: calendar.month + 1 };
}

function advanceMonth(world, inputs = {}) {
  const next = cloneWorld(world);
  next.tick += 1;
  next.calendar = nextCalendar(world.calendar);

  if (Array.isArray(inputs.stochasticSignals) && inputs.stochasticSignals.length > 0) {
    const rng = createSeededRng((world.seed + world.tick) >>> 0);
    const index = Math.floor(rng() * inputs.stochasticSignals.length);
    next.lastSignal = inputs.stochasticSignals[index];
  }

  return next;
}

module.exports = { advanceMonth, nextCalendar };
