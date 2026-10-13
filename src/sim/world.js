const { deepClone } = require('./model');

function createWorld({
  seed = 1,
  entities = [],
  relations = [],
  tick = 0,
  memory = [],
  observations = [],
  residuals = [],
  calendar = { year: 2029, month: 4 },
  lastSignal = null,
} = {}) {
  return deepClone({
    seed,
    entities,
    relations,
    tick,
    memory,
    observations,
    residuals,
    calendar,
    lastSignal,
  });
}

function cloneWorld(world) {
  return deepClone(world);
}

module.exports = { createWorld, cloneWorld };
