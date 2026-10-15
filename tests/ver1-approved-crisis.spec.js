const { test, expect } = require('@playwright/test');
const URL = process.env.ADHOMS_TEST_URL || 'http://127.0.0.1:8000/';

// DL-017: explicit user approval 2026-10-01 11:56:35 UTC.
// These test real engine transitions, not authored prose or copied effect formulas.
test.beforeEach(async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => {
    window.crisisSession = (allocation) => {
      const engine = ADHOMS_VER1_FINAL;
      let session = engine.createSession(ADHOMS_VER1_STATE.createInitialState());
      session = engine.applyDecision(session, 'sumo_schedule', 'keep');
      session = engine.applyDecision(session, 'towa_schedule', 'keep');
      session = engine.nextPhase(session);
      session = engine.applyDecision(session, 'forest_evacuation', 'wait');
      session = engine.nextPhase(session);
      if (allocation) session = engine.applyDecision(session, 'vehicle_allocation', allocation);
      session = engine.nextPhase(session);
      session = engine.applyDecision(session, 'shelter_rebalance', 'move_people');
      session = engine.nextPhase(session);
      session = engine.applyDecision(session, 'logistics_reallocate', 'critical_sites');
      return engine.nextPhase(session);
    };
  });
});

test('personal allocation is gated by the crisis phase and explicit manual override', async ({ page }) => {
  const result = await page.evaluate(() => {
    const e = ADHOMS_VER1_FINAL;
    const session = crisisSession('balanced');
    const before = JSON.stringify(session);
    let rejected = false;
    try { e.applyDecision(session, 'personal_vehicle_allocation', 'forest'); } catch { rejected = true; }
    const manual = e.applyDecision(session, 'priority_override', 'manual_override');
    const wrongPhase = { ...manual, phaseIndex: 2 };
    let phaseRejected = false;
    try { e.applyDecision(wrongPhase, 'personal_vehicle_allocation', 'forest'); } catch { phaseRejected = true; }
    return {
      listed: e.PHASES[5].decisions, unavailable: e.availableChoices(session, 'personal_vehicle_allocation'),
      available: e.availableChoices(manual, 'personal_vehicle_allocation'),
      wrongPhase: e.availableChoices(wrongPhase, 'personal_vehicle_allocation'),
      rejected, phaseRejected, unchanged: before === JSON.stringify(session),
      hasUnchosenTarget: Object.hasOwn(manual.decisions, 'personal_vehicle_allocation'),
      manualRisks: manual.people, originalRisks: session.people,
    };
  });
  expect(result.listed).toContain('personal_vehicle_allocation');
  expect(result.unavailable).toEqual([]);
  expect(result.available).toEqual(['festival', 'forest', 'vulnerable_households', 'balanced']);
  expect(result.wrongPhase).toEqual([]);
  expect(result.rejected).toBe(true);
  expect(result.phaseRejected).toBe(true);
  expect(result.unchanged).toBe(true);
  expect(result.hasUnchosenTarget).toBe(false);
  expect(result.manualRisks).toEqual(result.originalRisks);
});

for (const target of ['festival', 'forest', 'vulnerable_households', 'balanced']) {
  test(`personal allocation ${target} replaces the earlier risk contribution and keeps its history`, async ({ page }) => {
    const result = await page.evaluate((target) => {
      const e = ADHOMS_VER1_FINAL;
      const original = crisisSession('festival');
      const expected = crisisSession(target);
      const manual = e.applyDecision(original, 'priority_override', 'manual_override');
      const changed = e.applyDecision(manual, 'personal_vehicle_allocation', target);
      const repeated = e.applyDecision(changed, 'personal_vehicle_allocation', target);
      const system = e.applyDecision(changed, 'priority_override', 'system_priority');
      const restored = e.applyDecision(system, 'priority_override', 'manual_override');
      const finish = (s) => e.finalize(e.nextPhase(s));
      return { original, expected, changed, repeated, system, restored,
        expectedResult: finish(e.applyDecision(expected, 'priority_override', 'manual_override')).result,
        changedResult: finish(changed).result };
    }, target);
    expect(result.changed.people).toEqual(result.expected.people);
    expect(result.changed.derived).toEqual(result.expected.derived);
    expect(result.changed.state.town.legitimacy).toBe(Math.max(0, result.original.state.town.legitimacy - 1));
    expect(result.changed.decisions.vehicle_allocation).toBe('festival');
    expect(result.changed.decisions.personal_vehicle_allocation).toBe(target);
    expect(result.repeated).toEqual(result.changed);
    expect(result.system.people).toEqual(result.original.people);
    expect(result.system.state).toEqual(result.original.state);
    expect(result.system.decisions.personal_vehicle_allocation).toBe(target);
    expect(result.restored.people).toEqual(result.changed.people);
    expect(result.restored.state).toEqual(result.changed.state);
    expect(result.changedResult.humanSafety).toBe(result.expectedResult.humanSafety);
    expect(result.changedResult.people).toEqual(result.expectedResult.people);
    expect(result.changedResult.decisions).toMatchObject({ vehicle_allocation: 'festival', personal_vehicle_allocation: target });
  });
}

test('personal allocation works when no earlier allocation was recorded, without inventing that history', async ({ page }) => {
  const result = await page.evaluate(() => {
    const e = ADHOMS_VER1_FINAL;
    const original = crisisSession();
    const manual = e.applyDecision(original, 'priority_override', 'manual_override');
    const changed = e.applyDecision(manual, 'personal_vehicle_allocation', 'forest');
    const system = e.applyDecision(changed, 'priority_override', 'system_priority');
    return { original, changed, system };
  });
  expect(result.changed.people.towa.risk).toBe(result.original.people.towa.risk - 2);
  expect(result.changed.people.gaku.risk).toBe(result.original.people.gaku.risk + 1);
  expect(result.changed.people.chihiro.risk).toBe(result.original.people.chihiro.risk + 1);
  expect(result.changed.decisions).not.toHaveProperty('vehicle_allocation');
  expect(result.system.people).toEqual(result.original.people);
});

test('TOWA fixed safety and evacuation-start provenance are independent of town-wide delay and exposure risk', async ({ page }) => {
  const records = await page.evaluate(() => {
    const e = ADHOMS_VER1_FINAL;
    return [undefined, 'wait', 'start_now'].flatMap((choice) => ['keep', 'cancel'].map((schedule) => {
      let s = e.createSession(ADHOMS_VER1_STATE.createInitialState());
      s = e.applyDecision(s, 'towa_schedule', schedule);
      s = e.nextPhase(s);
      if (choice) s = e.applyDecision(s, 'forest_evacuation', choice);
      s = e.applyDecision(s, 'traffic_priority', 'event_first');
      while (s.phaseIndex < 6) s = e.nextPhase(s);
      const finished = e.finalize(s);
      return { choice: choice || null, schedule, result: finished.result, delay: finished.derived.evacuationDelayMin };
    }));
  });
  for (const record of records) {
    expect(record.result.personalOutcomes.towa).toMatchObject({
      survived: true, seriousInjury: false,
      evacuationStart: record.choice === 'wait' ? 'delayed' : record.choice === 'start_now' ? 'immediate' : 'unrecorded',
      evacuationStartSource: 'forest_evacuation', evacuationStartChoice: record.choice,
    });
    expect(record.result.personalOutcomes.towa).not.toHaveProperty('evacuationDelayMin');
    expect(record.delay).toBeGreaterThan(0);
    expect(record.result.personalOutcomes.chihiro).toMatchObject({ survived: true, seriousInjury: false, businessLoss: 'major' });
    expect(record.result.personalOutcomes.gaku).toMatchObject({ survived: true, injured: true, immediateSportReturn: false });
  }
  expect(records[0].result.people.towa.risk).not.toBe(records[1].result.people.towa.risk);
});

test('legacy outcome enrichment preserves valid results and never fabricates missing decisions', async ({ page }) => {
  const result = await page.evaluate(() => {
    const e = ADHOMS_VER1_FINAL;
    const legacy = { humanSafety: 67, people: { towa: { risk: 4, status: 'critical' } },
      personalOutcomes: { chihiro: { survived: true, seriousInjury: false, note: 'retained legacy note' },
        gaku: { survived: true, stranded: true, injured: true, immediateSportReturn: false },
        extra: { retained: true } } };
    const before = structuredClone(legacy);
    const migrated = e.ensurePersonalOutcomes(legacy, { forest_evacuation: 'wait' });
    const after = structuredClone(migrated);
    const second = e.ensurePersonalOutcomes(migrated, { forest_evacuation: 'wait' });
    const unknown = e.ensurePersonalOutcomes({ humanSafety: 60, personalOutcomes: { gaku: before.personalOutcomes.gaku } });
    const persisted = e.ensurePersonalOutcomes({ decisions: { forest_evacuation: 'start_now' } });
    const invalid = e.ensurePersonalOutcomes({ decisions: { forest_evacuation: 'invalid' } });
    return { before, after, second, unknown, persisted, invalid, nullResult: e.ensurePersonalOutcomes(null) };
  });
  expect(result.after.humanSafety).toBe(result.before.humanSafety);
  expect(result.after.people).toEqual(result.before.people);
  expect(result.after.personalOutcomes.chihiro.note).toBe('retained legacy note');
  expect(result.after.personalOutcomes.gaku).toMatchObject(result.before.personalOutcomes.gaku);
  expect(result.after.personalOutcomes.extra).toEqual({ retained: true });
  expect(result.after.personalOutcomes.towa.evacuationStart).toBe('delayed');
  expect(result.second).toEqual(result.after);
  expect(result.unknown.personalOutcomes.towa.evacuationStart).toBe('unrecorded');
  expect(result.unknown).not.toHaveProperty('decisions');
  expect(result.persisted.personalOutcomes.towa.evacuationStart).toBe('immediate');
  expect(result.invalid.personalOutcomes.towa.evacuationStart).toBe('unrecorded');
  expect(result.nullResult).toBeNull();
});

test('reload retains both vehicle decisions, their effects, and final TOWA outcome', async ({ page }) => {
  const before = await page.evaluate(() => {
    showEnding();
    const e = ADHOMS_VER1_FINAL;
    let s = e.applyDecision(crisisSession('festival'), 'priority_override', 'manual_override');
    s = e.applyDecision(s, 'personal_vehicle_allocation', 'forest');
    const record = ADHOMS_VER1_DEBUG.final();
    record.session = s;
    record.stage = 'active';
    ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession', record);
    return s;
  });
  await page.reload();
  const after = await page.evaluate(() => ADHOMS_VER1_DEBUG.final().session);
  expect(after.decisions).toEqual(before.decisions);
  expect(after.people).toEqual(before.people);
  expect(after.state).toEqual(before.state);
  const outcome = await page.evaluate(() => {
    const record = ADHOMS_VER1_DEBUG.final();
    record.session = ADHOMS_VER1_FINAL.finalize(ADHOMS_VER1_FINAL.nextPhase(record.session));
    record.stage = 'recovery';
    ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession', record);
    return record.session.result;
  });
  await page.reload();
  const resumed = await page.evaluate(() => ADHOMS_VER1_DEBUG.final().session.result);
  expect(resumed).toEqual(outcome);
  expect(resumed.decisions).toMatchObject({ vehicle_allocation: 'festival', personal_vehicle_allocation: 'forest' });
  expect(resumed.personalOutcomes.towa).toMatchObject({ survived: true, seriousInjury: false, evacuationStart: 'delayed' });
});

test('legacy migration enforces TOWA fixed safety while retaining valid evacuation evidence and notes', async ({ page }) => {
  const result = await page.evaluate(() => {
    const legacy = { humanSafety: 51, decisions: { vehicle_allocation: 'festival' },
      personalOutcomes: { towa: { survived: false, seriousInjury: true, note: 'legacy context',
        evacuationStart: 'delayed', evacuationStartSource: 'forest_evacuation', evacuationStartChoice: 'wait' } } };
    return ADHOMS_VER1_FINAL.ensurePersonalOutcomes(legacy);
  });
  expect(result.personalOutcomes.towa).toEqual({ survived: true, seriousInjury: false, note: 'legacy context',
    evacuationStart: 'delayed', evacuationStartSource: 'forest_evacuation', evacuationStartChoice: 'wait' });
  expect(result.humanSafety).toBe(51);
  expect(result.decisions).toEqual({ vehicle_allocation: 'festival' });
});
