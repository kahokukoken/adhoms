const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

test.describe('ADHOMS Ver1 final disaster player-facing UI', () => {
  test('uses Japanese labels and visibly marks the selected choice', async ({ page }) => {
    await page.goto(URL);
    await page.evaluate(() => {
      S.year = 5; S.month = 12; S.week = 4;
      showEnding();
    });

    const overlay = page.locator('#ver1Choice');
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).not.toContainText('sumo_schedule');
    await expect(overlay).not.toContainText('portable_shelter');

    const keep = overlay.locator('[data-k="sumo_schedule"][data-v="keep"]');
    const cancel = overlay.locator('[data-k="sumo_schedule"][data-v="cancel"]');
    await expect(keep).toContainText('八朔相撲');
    await expect(keep).toContainText('予定どおり実施');
    await expect(cancel).toContainText('中止');
    await expect(keep).toHaveAttribute('aria-pressed', 'false');

    await keep.click();
    await expect(overlay.locator('[data-k="sumo_schedule"][data-v="keep"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(overlay.locator('[data-k="sumo_schedule"][data-v="keep"]')).toHaveClass(/selected/);

    await overlay.locator('[data-k="sumo_schedule"][data-v="cancel"]').click();
    await expect(overlay.locator('[data-k="sumo_schedule"][data-v="cancel"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(overlay.locator('[data-k="sumo_schedule"][data-v="keep"]')).toHaveAttribute('aria-pressed', 'false');
  });
});
