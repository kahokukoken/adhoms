const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const weatherPath = path.resolve(__dirname, '../../src/sim/rules/weather.js');

test('rain and snow reduce transport relation effectiveness instead of directly assigning outcomes', () => {
  assert.equal(fs.existsSync(weatherPath), true, 'weather rule must exist');
  const { createKurikaraBaseline } = require('../../src/sim/scenarios/kurikara-baseline');
  const { applyWeatherFriction } = require(weatherPath);
  const { applyTransportAccess } = require('../../src/sim/rules/transport');

  const dry = applyTransportAccess(createKurikaraBaseline({ busFrequency: 0.55 }));
  const wetWorld = applyWeatherFriction(createKurikaraBaseline({ busFrequency: 0.55 }), { rain: 0.8, snow: 0.2 });
  const wet = applyTransportAccess(wetWorld);

  const dryOlder = dry.entities.find(e => e.id === 'older');
  const wetOlder = wet.entities.find(e => e.id === 'older');
  assert.ok(wetOlder.state.travelBurden > dryOlder.state.travelBurden);

  const relation = wet.relations.find(r => r.id === 'older-bus');
  assert.ok(relation.state.weatherEffectiveness < 1);
  assert.equal(wetWorld.entities.find(e => e.id === 'older').state.travelBurden, undefined, 'weather alone must not assign travel outcome');
});

test('same weather pushes stressed capacity across overload threshold but not resilient capacity', () => {
  const { createKurikaraBaseline } = require('../../src/sim/scenarios/kurikara-baseline');
  const { applyWeatherFriction } = require(weatherPath);
  const { applyTransportAccess } = require('../../src/sim/rules/transport');

  const weather = { rain: 0.9, snow: 0.35 };
  const stressed = applyTransportAccess(applyWeatherFriction(createKurikaraBaseline({ busFrequency: 0.5, busCapacity: 1.25 }), weather));
  const resilient = applyTransportAccess(applyWeatherFriction(createKurikaraBaseline({ busFrequency: 0.5, busCapacity: 3.4 }), weather));

  const stressedBus = stressed.entities.find(e => e.id === 'bus-route-1');
  const resilientBus = resilient.entities.find(e => e.id === 'bus-route-1');
  assert.ok(stressedBus.state.serviceLoad > 1);
  assert.ok(resilientBus.state.serviceLoad < 1);
});
