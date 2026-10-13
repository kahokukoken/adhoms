const test = require('node:test');
const assert = require('node:assert/strict');

test('repeated transport failures persist and reduce later effective access', () => {
  const { createKurikaraBaseline } = require('../../src/sim/scenarios/kurikara-baseline');
  const { recordTravelExperience } = require('../../src/sim/memory');
  const { applyTransportAccess } = require('../../src/sim/rules/transport');

  const initial = createKurikaraBaseline({ busFrequency: 0.6 });
  const before = applyTransportAccess(initial);
  const beforeOlder = before.entities.find(e => e.id === 'older').state.access;

  const once = recordTravelExperience(initial, {
    actorId: 'older',
    relationId: 'older-bus',
    success: false,
    burden: 0.9,
  });
  const twice = recordTravelExperience(once, {
    actorId: 'older',
    relationId: 'older-bus',
    success: false,
    burden: 0.8,
  });
  const after = applyTransportAccess(twice);
  const afterOlder = after.entities.find(e => e.id === 'older').state.access;

  assert.ok(afterOlder < beforeOlder, 'failure memory should reduce later effective access');
  const relation = twice.relations.find(r => r.id === 'older-bus');
  assert.ok(relation.state.avoidanceMemory > 0);
  assert.equal(initial.relations.find(r => r.id === 'older-bus').state.avoidanceMemory, undefined);
});

test('successful experience can partially decay avoidance without erasing history', () => {
  const { createKurikaraBaseline } = require('../../src/sim/scenarios/kurikara-baseline');
  const { recordTravelExperience } = require('../../src/sim/memory');

  const initial = createKurikaraBaseline();
  const failed = recordTravelExperience(initial, {
    actorId: 'older', relationId: 'older-bus', success: false, burden: 1,
  });
  const recovered = recordTravelExperience(failed, {
    actorId: 'older', relationId: 'older-bus', success: true, burden: 0.1,
  });

  const failedAvoidance = failed.relations.find(r => r.id === 'older-bus').state.avoidanceMemory;
  const recoveredAvoidance = recovered.relations.find(r => r.id === 'older-bus').state.avoidanceMemory;
  assert.ok(recoveredAvoidance < failedAvoidance);
  assert.ok(recoveredAvoidance > 0);
  assert.equal(recovered.memory.length, initial.memory.length + 2);
});

test('residual capture stores observed minus predicted without changing world rules', () => {
  const { createKurikaraBaseline } = require('../../src/sim/scenarios/kurikara-baseline');
  const { captureResidual } = require('../../src/sim/residual');

  const initial = createKurikaraBaseline();
  const snapshot = JSON.stringify(initial.relations);
  const next = captureResidual(initial, {
    subject: 'older.access',
    predicted: 0.7,
    observed: 0.42,
    classification: 'observation',
  });

  assert.equal(next.residuals.length, initial.residuals.length + 1);
  assert.equal(next.residuals.at(-1).value, -0.28);
  assert.equal(next.residuals.at(-1).classification, 'observation');
  assert.equal(JSON.stringify(next.relations), snapshot, 'residual capture must not auto-fit relations');
  assert.equal(initial.residuals.length, 0);
});
