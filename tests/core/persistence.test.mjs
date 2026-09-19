import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../game/core/state.mjs';
import { advanceMonth } from '../../game/core/advance.mjs';
import { applyCommand } from '../../game/core/commands.mjs';
import { saveGame, loadGame } from '../../game/core/persistence.mjs';
import { replayGame } from '../../game/core/replay.mjs';
import { memoryStorage, monthlyInput, resolvePendingPhases, setup } from '../helpers/ver1-fixtures.mjs';

test('save/load is equivalent after a completed month', () => {
  const storage = memoryStorage();
  const state = advanceMonth(
    createInitialState(setup),
    monthlyInput(0)
  ).state;
  saveGame(storage, state);
  assert.deepEqual(loadGame(storage), { ok: true, state });
});

test('incompatible save is rejected without overwriting last valid save', () => {
  const storage = memoryStorage();
  const state = createInitialState(setup);
  saveGame(storage, state);
  storage.setItem('adhoms.ver1.candidate', JSON.stringify({
    ...state,
    versions: { ...state.versions, schema: 99 }
  }));
  const loaded = loadGame(storage);
  assert.equal(loaded.ok, true);
  assert.deepEqual(loaded.state, state);
  assert.equal(
    loaded.diagnostics.at(-1).classification,
    'INCOMPATIBLE_SAVE'
  );
});

test('replay reproduces final state including rng snapshot', () => {
  let state = createInitialState(setup);
  for (let tick = 0; tick < 12; tick += 1) {
    state = resolvePendingPhases(advanceMonth(state, monthlyInput(tick)).state);
  }
  assert.deepEqual(replayGame(setup, state.actions), state);
});

test('malformed candidate values fall back to the last valid save', () => {
  const storage = memoryStorage();
  const state = createInitialState(setup);
  assert.equal(saveGame(storage, state).ok, true);
  storage.setItem('adhoms.ver1.candidate', 'null');

  const loaded = loadGame(storage);
  assert.equal(loaded.ok, true);
  assert.deepEqual(loaded.state, state);
  assert.equal(loaded.diagnostics.at(-1).classification, 'CORRUPT_SAVE');
});

test('corrupt canonical data recovers the previous valid state from compact replay backup', () => {
  const storage = memoryStorage();
  const previous = createInitialState(setup);
  assert.equal(saveGame(storage, previous).ok, true);
  const current = advanceMonth(previous, monthlyInput(0)).state;
  assert.equal(saveGame(storage, current).ok, true);
  storage.setItem('adhoms.ver1.valid', '{');

  const loaded = loadGame(storage);
  assert.equal(loaded.ok, true);
  assert.deepEqual(loaded.state, previous);
  assert.equal(loaded.diagnostics.at(-1).classification, 'CORRUPT_SAVE');
});

test('invalid causal state is rejected and storage exceptions remain recoverable', () => {
  const invalid = createInitialState(setup);
  delete invalid.rng;
  invalid.entities.residents['resident-0001'].health = Number.NaN;
  assert.equal(saveGame(memoryStorage(), invalid).ok, false);

  const unavailable = {
    getItem() { throw new Error('storage unavailable'); },
    setItem() { throw new Error('quota exceeded'); },
    removeItem() { throw new Error('storage unavailable'); }
  };
  assert.equal(saveGame(unavailable, createInitialState(setup)).ok, false);
  assert.equal(loadGame(unavailable).ok, false);
});

test('retained FEED actions persist through the validated save boundary', () => {
  const storage = memoryStorage();
  let state = createInitialState(setup);
  state = applyCommand(state, { type: 'TOGGLE_BOOKMARK', observationId: 'observation:1' }).state;
  state = applyCommand(state, { type: 'SET_ASSESSMENT', observationId: 'observation:1', value: 1 }).state;
  assert.equal(saveGame(storage, state).ok, true);
  const loaded = loadGame(storage).state;
  assert.deepEqual(loaded.player.bookmarks, ['observation:1']);
  assert.equal(loaded.player.assessments['observation:1'], 1);
});

test('replaces the canonical save without temporarily requiring two full snapshots', () => {
  const data = new Map();
  const quota = 3_200_000;
  const storage = {
    getItem: key => data.get(key) ?? null,
    setItem(key, value) {
      const next = new Map(data);
      next.set(key, String(value));
      const used = [...next.values()].reduce((sum, item) => sum + item.length, 0);
      if (used > quota) throw new Error('quota exceeded');
      data.set(key, String(value));
    },
    removeItem: key => data.delete(key)
  };
  const initial = createInitialState(setup);
  assert.equal(saveGame(storage, initial).ok, true);

  const later = structuredClone(initial);
  later.observations = Array.from({ length: 300 }, (_, index) => ({
    id: `large-observation:${index}`,
    text: '観測記録'.repeat(1000)
  }));
  assert.ok(JSON.stringify(later).length > JSON.stringify(initial).length);
  assert.equal(saveGame(storage, later).ok, true);
  assert.deepEqual(loadGame(storage).state, later);
  assert.equal(data.has('adhoms.ver1.candidate'), true);
});
