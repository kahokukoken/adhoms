const { createEntity, createRelation } = require('../model');
const { createWorld } = require('../world');

function createKurikaraBaseline({ busFrequency = 0.6, busCapacity = 2.4, seed = 202904 } = {}) {
  const entities = [
    createEntity({
      id: 'bus-route-1',
      type: 'transport-service',
      state: { frequency: busFrequency, reliability: 0.9, capacity: busCapacity, serviceLoad: 0 },
      capabilities: { carriesPassengers: true },
    }),
    createEntity({ id: 'commuter', type: 'person', state: {}, capabilities: { drive: true, cycle: true } }),
    createEntity({ id: 'older', type: 'person', state: {}, capabilities: { drive: false, cycle: false } }),
    createEntity({ id: 'student', type: 'person', state: {}, capabilities: { drive: false, cycle: true } }),
  ];

  const relations = [
    createRelation({
      id: 'commuter-bus', from: 'commuter', to: 'bus-route-1', type: 'uses', strength: 0.75,
      state: { distance: 0.7, scheduleFit: 0.8, alternativeMobility: 0.6 },
    }),
    createRelation({
      id: 'older-bus', from: 'older', to: 'bus-route-1', type: 'uses', strength: 0.9,
      state: { distance: 0.5, scheduleFit: 0.65, alternativeMobility: 0.1 },
    }),
    createRelation({
      id: 'student-bus', from: 'student', to: 'bus-route-1', type: 'uses', strength: 0.95,
      state: { distance: 0.6, scheduleFit: 0.95, alternativeMobility: 0.2 },
    }),
  ];

  return createWorld({ seed, entities, relations });
}

module.exports = { createKurikaraBaseline };
