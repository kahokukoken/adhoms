import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../game/core/state.mjs';
import { applyCommand } from '../../game/core/commands.mjs';
import { advanceMonth } from '../../game/core/advance.mjs';
import { selectTerminalPanel, observeMonth, summarizeCoverage } from '../../game/observation/terminal.mjs';
import { buildFeed } from '../../game/observation/feed.mjs';
import { monthlyInput, setup, withTerminalDropout } from '../helpers/ver1-fixtures.mjs';

test('lottery panel is deterministic and policy-sensitive', () => {
  const state = createInitialState(setup);
  assert.deepEqual(
    selectTerminalPanel(state),
    selectTerminalPanel(structuredClone(state))
  );
  assert.ok(selectTerminalPanel(state).members.length > 0);
});

test('dropout lowers coverage and raises uncertainty without changing truth', () => {
  const state = createInitialState(setup);
  const truth = structuredClone(state.entities);
  const observed = observeMonth(
    withTerminalDropout(state, 0.95),
    [{ type: 'ROAD_CLOSURE', districtId: 'east' }]
  );
  assert.ok(observed.summary.coverage < 0.1);
  assert.ok(observed.summary.uncertainty > 0.7);
  assert.deepEqual(state.entities, truth);
});

test('feed exposes internal actions but no follow mechanic', () => {
  const feed = buildFeed(createInitialState(setup), []);
  assert.deepEqual(
    feed.actions,
    ['plus', 'minus', 'bookmark', 'investigate', 'source-profile']
  );
  assert.equal(JSON.stringify(feed).includes('follow'), false);
});

test('observation payload cannot mutate core state', () => {
  const state = createInitialState(setup);
  const feed = buildFeed(state, [
    { text: '{"budget":999999}', evidenceRefs: [] }
  ]);
  feed.items[0].text = 'changed';
  assert.notEqual(state.gates.budget, 999999);
});

test('realized zero participation cannot report perfect observation quality', () => {
  const state = createInitialState({
    ...setup,
    terminalPolicy: { ...setup.terminalPolicy, coverage: 0 }
  });
  const advanced = advanceMonth(state, monthlyInput(0)).state;
  const observations = observeMonth(advanced, [{ id: 'event:zero', type: 'MONTH_ADVANCED', domain: 'system' }]);
  assert.equal(observations.summary.active, 0);
  assert.ok(advanced.metrics.observationQuality < 20);
  const recorded = applyCommand(advanced, {
    type: 'RECORD_OBSERVATIONS',
    items: observations.items,
    summary: observations.summary
  });
  assert.equal(recorded.ok, true);
  assert.equal(recorded.state.metrics.observationQuality, advanced.metrics.observationQuality);
});

test('district balance penalizes a concentrated sample with the same active count', () => {
  const populationByDistrict = Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f'].map(id => [id, 10]));
  const base = {
    populationAgents: 60,
    populationByDistrict,
    populationByAge: { youth: 20, adult: 20, older: 20 }
  };
  const member = (districtId, age) => ({ districtId, age, active: true });
  const balanced = summarizeCoverage({
    ...base,
    members: ['a', 'b', 'c', 'd', 'e', 'f'].map((district, index) => member(district, [18, 40, 75][index % 3]))
  }, []);
  const skewed = summarizeCoverage({
    ...base,
    members: ['a', 'a', 'a', 'a', 'a', 'b'].map((district, index) => member(district, [18, 40, 75][index % 3]))
  }, []);
  assert.equal(balanced.active, skewed.active);
  assert.ok(balanced.districtBalance > skewed.districtBalance);
  assert.ok(balanced.uncertainty < skewed.uncertainty);
});

test('bookmarked observations survive rolling FEED eviction', () => {
  const state = createInitialState(setup);
  state.observations = Array.from({ length: 300 }, (_, index) => ({ id: `observation:${index}` }));
  state.player.bookmarks = ['observation:299'];
  const summary = observeMonth(state, []).summary;
  const result = applyCommand(state, {
    type: 'RECORD_OBSERVATIONS',
    items: [{ id: 'observation:new' }],
    summary
  });
  assert.equal(result.ok, true);
  assert.equal(result.state.observations.length, 301);
  assert.equal(result.state.observations[0].id, 'observation:new');
  assert.ok(result.state.observations.some(item => item.id === 'observation:299'));

  state.player.bookmarks = state.observations.map(item => item.id);
  const allPinned = applyCommand(state, {
    type: 'RECORD_OBSERVATIONS',
    items: [{ id: 'observation:newest-summary' }],
    summary
  });
  assert.equal(allPinned.ok, true);
  assert.equal(allPinned.state.observations[0].id, 'observation:newest-summary');
  assert.ok(allPinned.state.observations.some(item => item.id === 'observation:299'));
});
