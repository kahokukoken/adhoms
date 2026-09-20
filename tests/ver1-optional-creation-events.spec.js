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
