import { createRng } from '../core/rng.mjs';
import { getCalendar } from '../core/state.mjs';

const TEMPERATURE = Object.freeze([5, 6, 9, 15, 20, 24, 28, 30, 25, 19, 13, 8]);
const RAIN_BASE = Object.freeze([80, 70, 85, 95, 105, 145, 125, 90, 80, 75, 75, 80]);

function seasonalWeather(seed, tick, rainSeed) {
  const calendar = getCalendar(tick);
  const randomSeed = rainSeed === undefined
    ? (Number(seed) ^ Math.imul(tick + 1, 0x45d9f3b))
    : Number(rainSeed);
  const rng = createRng(randomSeed);
  const index = calendar.month - 1;
  const finalClimax = tick === 53;
  return {
    temperatureC: TEMPERATURE[index] + rng.int(-2, 2),
    rainfallMm: finalClimax
      ? 210 + rng.int(0, 50)
      : Math.max(0, RAIN_BASE[index] + rng.int(-25, 35)),
    snowCm: calendar.month === 1 || calendar.month === 2
      ? rng.int(10, 75)
      : 0,
    economicDemand: 0.42 + rng.next() * 0.28,
    wildlifePressure: calendar.month >= 5 && calendar.month <= 11
      ? 0.25 + rng.next() * 0.35
      : 0.12 + rng.next() * 0.18
  };
}

function averagePlaceAttachment(state) {
  const values = Object.values(state.relations)
    .filter(relation => relation.kind === 'place-attachment')
    .map(relation => relation.strength);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pressureInputs(state, tick, rainfallMm) {
  if (tick !== 53) {
    return {
      sharedCapacityDemand: 0,
      volunteerReadiness: averagePlaceAttachment(state),
      drainageCondition: state.entities.facilities['lakeside-drainage'].condition,
      shelterDistribution: 0.5
    };
  }
  const distributed = state.actions.some(action =>
    action.type === 'APPROVE_PROPOSAL' && action.proposalId === 'multi-site-shelter'
  );
  return {
    sharedCapacityDemand: 0.52 + rainfallMm / 600,
    volunteerReadiness: averagePlaceAttachment(state),
    drainageCondition: state.entities.facilities['lakeside-drainage'].condition,
    shelterDistribution: distributed ? 0.78 : 0.38
  };
}

function specialEventsFor(state) {
  if (state.tick === 42) {
    const rng = createRng(Number(state.seed) ^ 0x51ec710);
    return [{
      type: 'MAYORAL_ELECTION',
      winner: rng.next() >= 0.5 ? 'progressive-faction' : 'conservative-faction'
    }];
  }
  if (state.tick === 53) {
    return [
      { type: 'CLIMAX_HASSAKU_SUMO', domain: 'culture' },
      { type: 'CLIMAX_FOREST_LIVE', domain: 'logistics' },
      { type: 'CLIMAX_HEAVY_RAIN', domain: 'environment' }
    ];
  }
  return [];
}

export function getScenarioInput(state, overrides = {}) {
  const calendar = getCalendar(state.tick);
  const weather = seasonalWeather(state.seed, state.tick, overrides.rainSeed);
  return Object.freeze({
    tick: state.tick,
    calendar: Object.freeze(calendar),
    ...weather,
    pressures: Object.freeze(pressureInputs(state, state.tick, weather.rainfallMm)),
    specialEvents: Object.freeze(specialEventsFor(state)),
    authoredText: ''
  });
}
