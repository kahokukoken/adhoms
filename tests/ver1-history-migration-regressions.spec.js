const { test, expect } = require('@playwright/test');
const URL = process.env.ADHOMS_TEST_URL || 'http://127.0.0.1:8000/';

// DL-007/014, V1-07/08/13: bookkeeping flags cannot become choice provenance.
// Removing the whitelist in migration must fail these real load-path assertions.
async function legacyOptionalMemory(page, eventId, flags, source = null) {
  await page.goto(URL);
  await page.evaluate(({ eventId, flags, source }) => {
    const event = ADHOMS_VER1_OPTIONAL.events[eventId];
    const state = ADHOMS_VER1_STATE.createInitialState();
    state.sessionId = ADHOMS_VER1_SESSION.id;
    state.year = 1;
    state.month = event.months[1];
    state.flags = flags;
    state.memories = [{
      id: event.memoryId, year: 1, month: event.months[0], valence: 0,
      scope: 'culture', tags: ['legacy'], note: 'Unchanged historical note', source
    }];
    ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate', state);
  }, { eventId, flags, source });
  await page.reload();
  return page.evaluate(eventId => ADHOMS_LIGHT_STATE.memories.find(memory =>
    memory.id === ADHOMS_VER1_OPTIONAL.events[eventId].memoryId), eventId);
}

for (const [eventId, choice] of [['brine', 'live_test'], ['miso', 'service_flow']]) {
  test(`${eventId}: legacy seen flag cannot mask the actual first-stage choice`, async ({ page }) => {
    const flags = { [`optional:${eventId}:seen`]: true, [`optional:${eventId}:${choice}`]: true };
    const memory = await legacyOptionalMemory(page, eventId, flags);
    expect(memory.source).toEqual({ type: 'optional-choice', id: `${eventId}:${choice}` });
    expect(memory.note).toBe('Unchanged historical note');
    expect(memory.tags).toEqual(['legacy']);
    await page.reload();
    expect(await page.evaluate(id => ADHOMS_LIGHT_STATE.memories.find(m => m.id === id), memory.id)).toEqual(memory);
  });

  test(`${eventId}: autonomous legacy progress keeps world provenance`, async ({ page }) => {
    const memory = await legacyOptionalMemory(page, eventId, {
      [`optional:${eventId}:seen`]: true, [`optional:${eventId}:world`]: true
    });
    expect(memory.source).toEqual({ type: 'world-progress', id: eventId });
  });
}

test('legacy bookkeeping and unknown flags do not invent an optional choice', async ({ page }) => {
  const memory = await legacyOptionalMemory(page, 'brine', {
    'optional:brine:seen': true, 'optional:brine:unrecognized_history': true
  });
  expect(memory.source).toBeNull();
  expect(memory.entities).toEqual(['kiso', 'toru']);
});

test('ambiguous historical choices are retained without guessing provenance', async ({ page }) => {
  const memory = await legacyOptionalMemory(page, 'brine', {
    'optional:brine:seen': true, 'optional:brine:live_test': true, 'optional:brine:universal': true
  });
  expect(memory.source).toBeNull();
});

test('valid existing provenance is preserved even when legacy flags are incomplete', async ({ page }) => {
  const source = { type: 'optional-choice', id: 'brine:live_test' };
  const memory = await legacyOptionalMemory(page, 'brine', { 'optional:brine:seen': true }, source);
  expect(memory.source).toEqual(source);
});

test('first-stage provenance does not depend on continuation flag insertion order', async ({ page }) => {
  const memory = await legacyOptionalMemory(page, 'brine', {
    'optional:brine:followup:compare_takes': true,
    'optional:brine:seen': true,
    'optional:brine:live_test': true
  });
  expect(memory.source).toEqual({ type: 'optional-choice', id: 'brine:live_test' });
});

for (const [flags, expected] of [
  [{ 'optional:brine:seen': true, 'optional:brine:live_test': true }, { type: 'optional-choice', id: 'brine:live_test' }],
  [{ 'optional:brine:seen': true, 'optional:brine:world': true }, { type: 'world-progress', id: 'brine' }]
]) {
  test(`repairs prior bookkeeping provenance only from confirmed ${expected.type} evidence`, async ({ page }) => {
    const memory = await legacyOptionalMemory(page, 'brine', flags, { type: 'optional-choice', id: 'brine:seen' });
    expect(memory.source).toEqual(expected);
    expect(memory.note).toBe('Unchanged historical note');
  });
}

test('unrecognized existing historical provenance is not overwritten', async ({ page }) => {
  const source = { type: 'historical-import', id: 'original-record' };
  const memory = await legacyOptionalMemory(page, 'brine', {
    'optional:brine:seen': true, 'optional:brine:live_test': true
  }, source);
  expect(memory.source).toEqual(source);
});
