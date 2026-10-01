const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// DL-007/014/020, V1-08/09/13: a proposed plan is not an actor's action.
// Removing the response boundary or using Relation alone to claim agreement
// must fail these tests. Run the real modules without a browser/UI dependency.
function model() {
  const window = {};
  const context = vm.createContext({ window, structuredClone });
  for (const file of ['ver1-state.js', 'ver1-events.js', 'ver1-propagation.js', 'ver1-disaster.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../ver1', file), 'utf8'), context);
  }
  return {
    state: () => ({ ...window.ADHOMS_VER1_STATE.createInitialState(), supportModelVersion: 1 }),
    E: window.ADHOMS_VER1_EVENTS,
    P: window.ADHOMS_VER1_PROPAGATION,
    D: window.ADHOMS_VER1_DISASTER,
    S: window.ADHOMS_VER1_STATE,
  };
}

function world(state) {
  return { town: state.town, districts: state.districts, relations: state.relations };
}

test('a Year2 proposal records intended participants without enacting its effects', () => {
  const { state, E } = model();
  const before = state();
  const proposed = E.proposeChoice(before, 'y2_flood', 'guided_watch');
  expect(world(proposed)).toEqual(world(before));
  expect(proposed.flags['y2_flood:guided_watch']).toBeUndefined();
  expect(proposed.memories.find(m => m.id === 'flood_guided_watch')).toBeUndefined();
  expect(proposed.proposals.y2_flood).toMatchObject({
    eventId: 'y2_flood', choiceId: 'guided_watch', status: 'proposed', response: null,
  });
  expect(proposed.proposals.y2_flood.actorIds.length).toBeGreaterThan(0);
  expect(before.proposals).toBeUndefined();
});

test('an actor response applies exactly the existing Year2 effect once with bounded consent', () => {
  const { state, E, S } = model();
  const before = state();
  const proposed = E.proposeChoice(before, 'y2_flood', 'guided_watch');
  const accepted = E.respondChoice(JSON.parse(JSON.stringify(proposed)), 'y2_flood');
  const expected = S.applyDelta(before, E.getEvent('y2_flood').choices.guided_watch.delta);
  expect(world(accepted)).toEqual(world(expected));
  expect(accepted.flags['y2_flood:guided_watch']).toBe(true);
  expect(accepted.proposals.y2_flood.response).toMatchObject({ status: 'accepted' });
  expect(accepted.proposals.y2_flood.response.actorIds.length).toBeGreaterThan(0);
  expect(accepted.proposals.y2_flood.response.constraints.length).toBeGreaterThan(0);
  expect(accepted.proposals.y2_flood.response.text).toBeTruthy();
  expect(E.respondChoice(accepted, 'y2_flood')).toEqual(accepted);
  expect(E.resolveChoice(accepted, 'y2_flood', 'early_close')).toEqual(accepted);
  expect(accepted.memories.filter(m => m.id === 'flood_guided_watch')).toHaveLength(1);
});

test('all legacy Year2 IDs retain their effects through the explicit accepted response', () => {
  const { state, E, S } = model();
  for (const [eventId, event] of Object.entries(E.all)) {
    for (const [choiceId, choice] of Object.entries(event.choices)) {
      const before = state();
      const next = E.resolveChoice(before, eventId, choiceId);
      expect(world(next)).toEqual(world(S.applyDelta(before, choice.delta)));
      expect(next.proposals[eventId].status).toBe('accepted');
      expect(next.memories.find(m => m.id === choice.memory.id).source).toEqual({
        type: 'choice', id: `${eventId}:${choiceId}`,
      });
    }
  }
});

test('pending proposals cannot create Year3 consequences and unknown events are rejected', () => {
  const { state, E, P } = model();
  const proposed = E.proposeChoice(state(), 'y2_flood', 'guided_watch');
  expect(P.applySideEffects(proposed).applied).toEqual([]);
  expect(() => E.proposeChoice(state(), 'unknown', 'unknown')).toThrow(/Unknown event/);
  expect(() => E.proposeChoice(state(), 'y2_flood', 'unknown')).toThrow(/Unknown choice/);
  expect(E.respondChoice(state(), 'y2_flood')).toEqual(state());
});

test('legacy Year2 flags preserve their history without manufactured actor consent', () => {
  const { state, E } = model();
  const legacy = state();
  delete legacy.supportModelVersion;
  legacy.flags['y2_flood:early_close'] = true;
  legacy.memories = [{ id: 'flood_early_close', year: 2, month: 6, note: 'original' }];
  expect(E.resolveChoice(legacy, 'y2_flood', 'early_close')).toEqual(legacy);
  expect(E.proposeChoice(legacy, 'y2_flood', 'guided_watch')).toEqual(legacy);
  expect(E.respondChoice(legacy, 'y2_flood')).toEqual(legacy);
});

test('Year4 proposal alone creates neither agreements nor capabilities', () => {
  const { state, P, D } = model();
  const before = state();
  before.town.legitimacy = 3;
  before.relations.technical_lab = 2;
  const proposed = P.proposeYear4Strategy(before, 'deepen');
  expect(world(proposed)).toEqual(world(before));
  expect(proposed.agreements || {}).toEqual({});
  expect(proposed.proposals.y4_strategy.status).toBe('proposed');
  expect(D.availableEmergencyCommands(proposed)).not.toContain('deploy_drone_relay');
  expect(D.availableEmergencyCommands(proposed)).not.toContain('priority_fuel');
});

test('Year4 response secures only actual offers and is idempotent across serialization', () => {
  const { state, P, D } = model();
  const before = state();
  before.town.legitimacy = 3;
  before.relations.technical_lab = 2;
  const proposed = P.proposeYear4Strategy(before, 'deepen');
  const resolved = P.respondYear4Strategy(JSON.parse(JSON.stringify(proposed)));
  expect(Object.keys(resolved.state.agreements).sort()).toEqual([
    'fuel_outreach', 'lab_support', 'warehouse_outreach',
  ]);
  expect(resolved.state.agreements.lab_support).toMatchObject({
    actorId: 'technical_lab', status: 'accepted', source: { type: 'actor-response', id: 'y4_strategy:deepen' },
  });
  expect(resolved.state.flags['offer:lab_support:secured']).toBe(true);
  expect(resolved.state.proposals.y4_strategy.responses.some(r => r.status === 'declined')).toBe(true);
  expect(D.availableEmergencyCommands(resolved.state)).toEqual(expect.arrayContaining([
    'priority_fuel', 'open_warehouse', 'deploy_drone_relay',
  ]));
  expect(P.respondYear4Strategy(resolved.state).state).toEqual(resolved.state);
  expect(P.resolveYear4Strategy(resolved.state, 'authority').state).toEqual(resolved.state);
});

test('Year4 cannot invent capacity, resources or agreement when nobody offers cooperation', () => {
  const { state, P, D } = model();
  for (const strategy of ['deepen', 'authority', 'alternative']) {
    const before = state();
    const resolved = P.resolveYear4Strategy(before, strategy);
    expect(world(resolved.state)).toEqual(world(before));
    expect(resolved.state.agreements || {}).toEqual({});
    expect(resolved.state.proposals.y4_strategy.status).toBe('declined');
    expect(D.availableEmergencyCommands(resolved.state)).toEqual(D.availableEmergencyCommands(before));
  }
});

test('the legacy authority ID is a voluntary request with no flat reward or coercion penalty', () => {
  const { state, P, D } = model();
  const before = state();
  before.relations.technical_lab = 2;
  const resolved = P.resolveYear4Strategy(before, 'authority');
  expect(resolved.state.town).toEqual(before.town);
  expect(resolved.state.agreements.lab_support.status).toBe('accepted');
  expect(D.availableEmergencyCommands(resolved.state)).toContain('deploy_drone_relay');
  expect(resolved.state.flags['y4_strategy:authority']).toBe(true);
});

test('an offer withdrawn before the response is not recorded as an agreement', () => {
  const { state, P } = model();
  const before = state();
  before.relations.technical_lab = 2;
  const proposed = P.proposeYear4Strategy(before, 'deepen');
  proposed.relations.technical_lab = 1;
  const resolved = P.respondYear4Strategy(proposed);
  expect(resolved.state.agreements || {}).toEqual({});
  expect(resolved.state.town.distributedCapacity).toBe(before.town.distributedCapacity);
  expect(resolved.state.proposals.y4_strategy.responses.find(r => r.actorId === 'technical_lab').status).toBe('declined');
});

test('existing district refusal cannot be erased by a repair proposal', () => {
  const { state, P } = model();
  const before = state();
  before.districts.old_road.burdenMemory = 3;
  before.districts.old_road.localTrust = 1;
  const resolved = P.resolveYear4Strategy(before, 'repair');
  expect(resolved.state.districts.old_road).toEqual(before.districts.old_road);
  expect(resolved.state.proposals.y4_strategy.responses.find(r => r.actorId === 'old_road').status).toBe('declined');
  expect(resolved.state.agreements || {}).toEqual({});
});

test('new-run resource gates require accepted actor records, never levels or secured flags alone', () => {
  const { state, D } = model();
  const current = state();
  current.town.distributedCapacity = 4;
  for (const id of Object.keys(current.relations)) current.relations[id] = 4;
  current.flags['offer:lab_support:secured'] = true;
  current.agreements = { lab_support: { actorId: 'technical_lab', status: 'proposed' } };
  expect(D.availableEmergencyCommands(current)).toEqual(['issue_warning', 'close_route', 'reassign_buses']);
});

test('childcare cooperation cannot authorize school grounds on another actor behalf', () => {
  const { state, P, D } = model();
  const before = state();
  before.relations.childcare = 2;
  const resolved = P.resolveYear4Strategy(before, 'deepen');
  expect(resolved.state.relations.school).toBe(0);
  expect(resolved.state.agreements?.school_support).toBeUndefined();
  expect(D.availableEmergencyCommands(resolved.state)).not.toContain('open_school_ground');
  expect(resolved.state.proposals.y4_strategy.responses.some(r => r.actorId === 'childcare')).toBe(true);
});

test('an accepted-looking resource record must match the completed actor response source', () => {
  const { state, P, D } = model();
  const before = state();
  before.relations.technical_lab = 2;
  const resolved = P.resolveYear4Strategy(before, 'deepen').state;
  resolved.agreements.lab_support.source.id = 'unrelated-history';
  expect(D.availableEmergencyCommands(resolved)).not.toContain('deploy_drone_relay');
});

test('a response with no recorded original offer cannot reconstruct consent', () => {
  const { state, P } = model();
  const before = state();
  before.relations.technical_lab = 2;
  const proposed = P.proposeYear4Strategy(before, 'deepen');
  delete proposed.proposals.y4_strategy.offeredIds;
  const resolved = P.respondYear4Strategy(proposed).state;
  expect(resolved.agreements || {}).toEqual({});
  expect(resolved.town).toEqual(before.town);
});

test('legacy resource state remains playable without fabricating agreement history', () => {
  const { state, D, P } = model();
  const legacy = state();
  delete legacy.supportModelVersion;
  legacy.relations.technical_lab = 2;
  legacy.town.distributedCapacity = 3;
  legacy.flags['y4_strategy:authority'] = true;
  expect(D.availableEmergencyCommands(legacy)).toEqual(expect.arrayContaining([
    'deploy_drone_relay', 'deploy_mobile_command', 'deploy_portable_shelter',
  ]));
  expect(P.resolveYear4Strategy(legacy, 'authority').state).toEqual(legacy);
  expect(legacy.agreements).toBeUndefined();
});

test('a continuing legacy save may use a newly accepted agreement without losing its historical gates', () => {
  const { state, P, D } = model();
  const legacy = state();
  delete legacy.supportModelVersion;
  legacy.town.legitimacy = 3;
  legacy.town.distributedCapacity = 3;
  const next = P.resolveYear4Strategy(legacy, 'authority').state;
  expect(next.supportModelVersion).toBeUndefined();
  expect(next.relations.warehouse).toBe(0);
  expect(D.availableEmergencyCommands(next)).toEqual(expect.arrayContaining([
    'open_warehouse', 'priority_fuel', 'deploy_mobile_command', 'deploy_portable_shelter',
  ]));
});

test('DL020 lab communications without transport cannot provide a mobile command vehicle',async({page})=>{
 await page.goto("http://127.0.0.1:8000/");
 const commands=await page.evaluate(()=>{let s=ADHOMS_VER1_STATE.createInitialState();s.relations.technical_lab=2;s.town.distributedCapacity=3;s=ADHOMS_VER1_PROPAGATION.resolveYear4Strategy(s,'authority').state;return ADHOMS_VER1_DISASTER.availableEmergencyCommands(s);});
 expect(commands).toContain('deploy_drone_relay');
 expect(commands).not.toContain('deploy_mobile_command');
});

test('DL020 a school site or warehouse agreement does not manufacture portable shelter equipment',async({page})=>{
 await page.goto("http://127.0.0.1:8000/");
 const commands=await page.evaluate(()=>{let s=ADHOMS_VER1_STATE.createInitialState();s.relations.school=2;s.town.legitimacy=3;s.town.distributedCapacity=3;s=ADHOMS_VER1_PROPAGATION.resolveYear4Strategy(s,'authority').state;return ADHOMS_VER1_DISASTER.availableEmergencyCommands(s);});
 expect(commands).toContain('open_school_ground');expect(commands).toContain('open_warehouse');
 expect(commands).not.toContain('deploy_portable_shelter');
});
