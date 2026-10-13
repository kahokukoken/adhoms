const test = require('node:test');
const assert = require('node:assert/strict');

function buildInstitutionalWorld({ authority = 0.8, legitimacy = 0.75 } = {}) {
  const { createEntity, createRelation } = require('../../src/sim/model');
  const { createWorld } = require('../../src/sim/world');

  return createWorld({
    entities: [
      createEntity({
        id: 'town-office',
        type: 'institution',
        state: { legitimacy },
        capabilities: { authority: { transport: authority }, budget: 1 },
      }),
      createEntity({
        id: 'bus-route-1',
        type: 'transport-service',
        state: { frequency: 0.45, reliability: 0.82, capacity: 1.8, serviceLoad: 0 },
        capabilities: { carriesPassengers: true },
      }),
      createEntity({
        id: 'resident',
        type: 'person',
        state: {},
        capabilities: { drive: false, cycle: false },
      }),
    ],
    relations: [
      createRelation({
        id: 'town-governs-bus',
        from: 'town-office',
        to: 'bus-route-1',
        type: 'governs',
        strength: 0.85,
        state: { domain: 'transport' },
      }),
      createRelation({
        id: 'resident-bus',
        from: 'resident',
        to: 'bus-route-1',
        type: 'uses',
        strength: 0.9,
        state: { distance: 0.5, scheduleFit: 0.85, alternativeMobility: 0.05 },
      }),
    ],
  });
}

test('player policy creates an institutional action instead of directly changing resident outcome', () => {
  const { createInstitutionalAction, applyInstitutionalAction } = require('../../src/sim/institution');

  const world = buildInstitutionalWorld();
  const action = createInstitutionalAction({
    actorId: 'town-office',
    targetId: 'bus-route-1',
    domain: 'transport',
    type: 'service-support',
    intensity: 0.7,
  });
  const next = applyInstitutionalAction(world, action);

  assert.equal(world.entities.find(e => e.id === 'resident').state.access, undefined);
  assert.equal(next.entities.find(e => e.id === 'resident').state.access, undefined,
    'institutional action must not directly assign resident access');

  const service = next.entities.find(e => e.id === 'bus-route-1');
  assert.ok(service.state.institutionalSupport > 0);
  assert.equal(world.entities.find(e => e.id === 'bus-route-1').state.institutionalSupport, undefined);
  assert.equal(next.memory.at(-1).kind, 'institutional-action');
});

test('same policy has different downstream effect through Authority and Legitimacy', () => {
  const { createInstitutionalAction, applyInstitutionalAction } = require('../../src/sim/institution');
  const { applyTransportAccess } = require('../../src/sim/rules/transport');

  const action = createInstitutionalAction({
    actorId: 'town-office',
    targetId: 'bus-route-1',
    domain: 'transport',
    type: 'service-support',
    intensity: 0.8,
  });

  const strong = applyTransportAccess(applyInstitutionalAction(
    buildInstitutionalWorld({ authority: 0.9, legitimacy: 0.9 }), action
  ));
  const weak = applyTransportAccess(applyInstitutionalAction(
    buildInstitutionalWorld({ authority: 0.45, legitimacy: 0.4 }), action
  ));

  const strongSupport = strong.entities.find(e => e.id === 'bus-route-1').state.institutionalSupport;
  const weakSupport = weak.entities.find(e => e.id === 'bus-route-1').state.institutionalSupport;
  const strongAccess = strong.entities.find(e => e.id === 'resident').state.access;
  const weakAccess = weak.entities.find(e => e.id === 'resident').state.access;

  assert.ok(strongSupport > weakSupport);
  assert.ok(strongAccess > weakAccess,
    'authority/legitimacy should affect resident access only through downstream service conditions');
});

test('institutional action requires an Authority relation to its target', () => {
  const { createInstitutionalAction, applyInstitutionalAction } = require('../../src/sim/institution');
  const world = buildInstitutionalWorld();
  world.relations = world.relations.filter(r => r.type !== 'governs');

  const action = createInstitutionalAction({
    actorId: 'town-office',
    targetId: 'bus-route-1',
    domain: 'transport',
    type: 'service-support',
    intensity: 1,
  });

  assert.throws(() => applyInstitutionalAction(world, action), /authority relation/i);
});

test('implementation outcome feeds back into Legitimacy through memory, not a direct player setting', () => {
  const { recordInstitutionalOutcome } = require('../../src/sim/institution');
  const world = buildInstitutionalWorld({ legitimacy: 0.7 });

  const failed = recordInstitutionalOutcome(world, {
    institutionId: 'town-office',
    expected: 0.8,
    observed: 0.35,
    salience: 0.9,
  });
  const recovered = recordInstitutionalOutcome(failed, {
    institutionId: 'town-office',
    expected: 0.6,
    observed: 0.75,
    salience: 0.5,
  });

  const before = world.entities.find(e => e.id === 'town-office').state.legitimacy;
  const afterFailure = failed.entities.find(e => e.id === 'town-office').state.legitimacy;
  const afterRecovery = recovered.entities.find(e => e.id === 'town-office').state.legitimacy;

  assert.ok(afterFailure < before);
  assert.ok(afterRecovery > afterFailure);
  assert.ok(recovered.memory.filter(m => m.kind === 'institutional-outcome').length >= 2);
  assert.equal(world.entities.find(e => e.id === 'town-office').state.legitimacy, 0.7);
});
