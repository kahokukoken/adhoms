const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

async function advanceOneMonth(page) {
  await page.getByRole('button', { name: '月末まで →', exact: true }).click();
  await page.locator('.meetingContinue').click();
}

async function advanceToMonthIndex(page, targetIndex, startIndex = 1) {
  for (let index = startIndex; index <= targetIndex; index += 1) {
    await advanceOneMonth(page);
  }
}

test.describe('ADHOMS Ver1 pending event persistence', () => {
  test('an unresolved Year 2 choice survives reload and resolves exactly once', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(URL);
    await advanceToMonthIndex(page, 14);

    const overlay = page.locator('#ver1Choice');
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('局地冠水');

    const beforeReload = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(beforeReload.flags['seen:y2_flood']).toBe(true);
    expect(beforeReload.flags['y2_flood:guided_watch']).not.toBe(true);

    // Reload before making a choice. The unresolved event must not disappear.
    await page.reload();
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('局地冠水');

    await overlay.locator('[data-c="guided_watch"]').click();
    await expect(overlay).not.toHaveClass(/on/);

    const resolved = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(resolved.flags['y2_flood:guided_watch']).toBe(true);
    expect(resolved.memories.filter(memory => memory.id === 'flood_guided_watch')).toHaveLength(1);
    const legitimacyAfterChoice = resolved.town.legitimacy;

    // Once resolved, reload must not reopen or double-apply the same event.
    await page.reload();
    await expect(page.locator('#ver1Choice')).toHaveCount(0);
    const afterSecondReload = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(afterSecondReload.memories.filter(memory => memory.id === 'flood_guided_watch')).toHaveLength(1);
    expect(afterSecondReload.town.legitimacy).toBe(legitimacyAfterChoice);
  });

  test('Year 3 report and unresolved Year 4 strategy survive reload without double application', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto(URL);
    const overlay = page.locator('#ver1Choice');

    for (let index = 1; index <= 24; index += 1) {
      await advanceOneMonth(page);
      if (index === 14) {
        await expect(overlay).toContainText('局地冠水');
        await overlay.locator('[data-c="guided_watch"]').click();
      } else if (index === 18) {
        await expect(overlay).toContainText('獣害');
        await overlay.locator('[data-c="food_source"]').click();
      } else if (index === 21) {
        await expect(overlay).toContainText('雪害');
        await overlay.locator('[data-c="welfare_first"]').click();
      }
    }

    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('YEAR 3 / SIDE EFFECTS');
    await expect(overlay).toContainText('現地誘導が成功体験となり');

    // The report itself is an unresolved acknowledgement step until the player confirms it.
    await page.reload();
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('YEAR 3 / SIDE EFFECTS');
    await expect(overlay).toContainText('現地誘導が成功体験となり');
    await overlay.locator('#v1ok').click();

    const y3State = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(y3State.flags.y3_ack).toBe(true);
    expect(y3State.memories.filter(memory => memory.id === 'y3_flood_guided_watch_spillover')).toHaveLength(1);

    await page.reload();
    await expect(page.locator('#ver1Choice')).toHaveCount(0);

    await advanceToMonthIndex(page, 36, 25);
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('YEAR 4 / RELATION');

    // Reload before choosing a relationship strategy; it must remain pending.
    await page.reload();
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('YEAR 4 / RELATION');
    await overlay.locator('[data-s="repair"]').click();

    const y4State = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(y4State.flags['y4_strategy:repair']).toBe(true);
    expect(y4State.memories.filter(memory => memory.id === 'y4_strategy_repair')).toHaveLength(1);
    const trustAfterChoice = y4State.town.trust;

    await page.reload();
    await expect(page.locator('#ver1Choice')).toHaveCount(0);
    const afterReload = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(afterReload.memories.filter(memory => memory.id === 'y4_strategy_repair')).toHaveLength(1);
    expect(afterReload.town.trust).toBe(trustAfterChoice);
  });
});
