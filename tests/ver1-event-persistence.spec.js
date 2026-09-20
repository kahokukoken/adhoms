const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

async function advanceToMonthIndex(page, targetIndex) {
  for (let index = 1; index <= targetIndex; index += 1) {
    await page.getByRole('button', { name: '月末まで →', exact: true }).click();
    await page.locator('.meetingContinue').click();
  }
}

test.describe('ADHOMS Ver1 pending Year 2 event persistence', () => {
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
});
