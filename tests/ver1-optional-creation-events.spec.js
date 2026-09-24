const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

async function advanceOneMonth(page) {
  await page.getByRole('button', { name: '月末まで →', exact: true }).click();
  await page.locator('.meetingContinue').click();
}

test.describe('ADHOMS Ver1 optional creation events', () => {
  test('BRINE/GENKAN appears as an optional year-one observation and persists its single choice', async ({ page }) => {
    await page.goto(URL);
    await advanceOneMonth(page); // May
    await advanceOneMonth(page); // June
    await advanceOneMonth(page); // July

    const card = page.locator('.ver1OptionalCard[data-optional-event="brine"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('BRINE');
    await expect(card).toContainText('GENKAN');
    await expect(card).toContainText('玄関');
    await expect(card).toContainText('T-0WA');
    await expect(card).toContainText('何か足りない');
    await expect(card.locator('.ver1OptionalLine')).toHaveCount(4);
    await expect(card.locator('[data-optional-choice]')).toHaveCount(3);
    await expect(card).not.toContainText(/universal|live_test|observe_only/);

    // The subevent is optional and non-blocking; month-end progression remains available.
    await expect(page.getByRole('button', { name: '月末まで →', exact: true })).toBeVisible();

    // Reload while unresolved: the observation card remains discoverable in its active window.
    await page.reload();
    await expect(card).toBeVisible();
    await card.locator('[data-optional-choice="live_test"]').click();

    const state = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(state.flags['optional:brine:seen']).toBe(true);
    expect(state.flags['optional:brine:live_test']).toBe(true);
    expect(state.memories.filter(memory => memory.id === 'optional_brine_genkan')).toHaveLength(1);
    expect(state.relations.brine).toBeGreaterThan(0);

    await expect(card).toContainText('記録済み');
    await expect(card.locator('[data-optional-choice]')).toHaveCount(0);
    await page.reload();
    await expect(card).toContainText('記録済み');
    const afterReload = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(afterReload.memories.filter(memory => memory.id === 'optional_brine_genkan')).toHaveLength(1);
  });

  test('miso dipping soba offers the documented cold/hot prototype without blocking the calendar', async ({ page }) => {
    await page.goto(URL);
    for (let i = 0; i < 5; i += 1) await advanceOneMonth(page); // September

    const card = page.locator('.ver1OptionalCard[data-optional-event="miso"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('味噌だれつけ蕎麦');
    await expect(card).toContainText('冷／温');
    await expect(card).toContainText('厨房');
    await expect(card).toContainText('高倉 千尋');
    await expect(card).toContainText('昼に十杯');
    await expect(card.locator('.ver1OptionalLine')).toHaveCount(4);
    await expect(card.locator('[data-optional-choice]')).toHaveCount(3);
    await expect(card).not.toContainText(/shared_ingredients|service_flow|observe_only/);

    await card.locator('[data-optional-choice="shared_ingredients"]').click();
    const state = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(state.flags['optional:miso:seen']).toBe(true);
    expect(state.flags['optional:miso:shared_ingredients']).toBe(true);
    expect(state.memories.filter(memory => memory.id === 'optional_miso_soba')).toHaveLength(1);
    expect(state.relations.miso_shop).toBeGreaterThan(0);

    await expect(card).toContainText('記録済み');
    await expect(page.getByRole('button', { name: '月末まで →', exact: true })).toBeVisible();
  });
});


  test('world continues when BRINE is left optional and records neutral autonomous progress', async ({ page }) => {
    await page.goto(URL);
    await advanceOneMonth(page); // May
    await advanceOneMonth(page); // June
    await advanceOneMonth(page); // July
    await expect(page.locator('.ver1OptionalCard[data-optional-event="brine"]')).toBeVisible();

    const before = await page.evaluate(() => ({
      relation: ADHOMS_LIGHT_STATE.relations.brine || 0,
      memories: ADHOMS_LIGHT_STATE.memories.filter(memory => memory.id === 'optional_brine_genkan').length,
    }));

    await advanceOneMonth(page); // August
    await expect(page.locator('.ver1OptionalCard[data-optional-event="brine"]')).toBeVisible();
    await advanceOneMonth(page); // September, window expired

    await expect(page.locator('.ver1OptionalCard[data-optional-event="brine"]')).toHaveCount(0);
    const after = await page.evaluate(() => ({
      world: ADHOMS_LIGHT_STATE.flags['optional:brine:world'],
      seen: ADHOMS_LIGHT_STATE.flags['optional:brine:seen'],
      relation: ADHOMS_LIGHT_STATE.relations.brine || 0,
      memories: ADHOMS_LIGHT_STATE.memories.filter(memory => memory.id === 'optional_brine_genkan'),
    }));
    expect(after.world).toBe(true);
    expect(after.seen).toBe(true);
    expect(after.relation).toBe(before.relation);
    expect(after.memories).toHaveLength(before.memories + 1);
    expect(after.memories[0].note).toContain('直接関与しなくても');
  });
