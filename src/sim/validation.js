const { createSeededRng } = require('./rng');
const { createKurikaraBaseline } = require('./scenarios/kurikara-baseline');
const { applyWeatherFriction } = require('./rules/weather');
const { applyTransportAccess } = require('./rules/transport');
const { createEntity } = require('./model');
const { createWorld } = require('./world');
const { observe } = require('./perception');
const { propagate } = require('./information');

const CLASSIFICATIONS = new Set(['input', 'relation', 'local-rule', 'delay', 'observation', 'implementation']);

function classifyMismatch(mismatch = {}) {
  return {
    ...mismatch,
    classification: CLASSIFICATIONS.has(mismatch.kind) ? mismatch.kind : 'unclassified',
  };
}

function simulateSeed(seed) {
  const rng = createSeededRng(seed >>> 0);
  const rain = rng();
  const snow = rng() * 0.65;
  const baseline = createKurikaraBaseline({ seed });
  const weathered = applyWeatherFriction(baseline, { rain, snow });
  const result = applyTransportAccess(weathered);
  const older = result.entities.find(entity => entity.id === 'older');
  return {
    rain,
    snow,
    olderAccess: older.state.access,
    world: result,
  };
}

function influencerGroundTruthInvariant() {
  const world = createWorld({
    entities: [
      createEntity({ id: 'incident', type: 'incident', state: { severity: 0.5, roadBlocked: false }, capabilities: {} }),
      createEntity({ id: 'influencer', type: 'person', state: {}, capabilities: { reach: 1, verification: 0.1, noveltyBias: 1 } }),
    ],
  });
  const before = JSON.stringify(world.entities.find(entity => entity.id === 'incident').state);
  const observation = observe(world, { sourceId: 'incident', subjectId: 'incident' });
  propagate(world, observation, 'influencer');
  return JSON.stringify(world.entities.find(entity => entity.id === 'incident').state) === before;
}

function runTransportValidation({ seeds = 100 } = {}) {
  const violations = [];
  const accesses = [];
  let relationStrengthBounded = true;
  let noNegativeCounts = true;
  let deterministicReplay = true;

  for (let seed = 1; seed <= seeds; seed += 1) {
    const first = simulateSeed(seed);
    const replay = simulateSeed(seed);
    accesses.push(first.olderAccess);

    if (JSON.stringify({
      rain: first.rain,
      snow: first.snow,
      olderAccess: first.olderAccess,
    }) !== JSON.stringify({
      rain: replay.rain,
      snow: replay.snow,
      olderAccess: replay.olderAccess,
    })) {
      deterministicReplay = false;
      violations.push({ seed, invariant: 'deterministicReplay' });
    }

    for (const relation of first.world.relations) {
      if (!(relation.strength >= 0 && relation.strength <= 1)) {
        relationStrengthBounded = false;
        violations.push({ seed, invariant: 'relationStrengthBounded', relationId: relation.id });
      }
    }

    for (const entity of first.world.entities) {
      for (const [key, value] of Object.entries(entity.state || {})) {
        if ((key === 'population' || key.endsWith('Count')) && typeof value === 'number' && value < 0) {
          noNegativeCounts = false;
          violations.push({ seed, invariant: 'noNegativeCounts', entityId: entity.id, key });
        }
      }
    }
  }

  const influencerDoesNotMutatePhysicalState = influencerGroundTruthInvariant();
  if (!influencerDoesNotMutatePhysicalState) {
    violations.push({ invariant: 'influencerDoesNotMutatePhysicalState' });
  }

  return {
    runs: seeds,
    violations,
    invariants: {
      relationStrengthBounded,
      noNegativeCounts,
      deterministicReplay,
      influencerDoesNotMutatePhysicalState,
    },
    outcomeRange: {
      minOlderAccess: Math.min(...accesses),
      maxOlderAccess: Math.max(...accesses),
    },
  };
}

module.exports = { runTransportValidation, classifyMismatch };
