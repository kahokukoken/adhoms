const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

test.describe('ADHOMS Ver1 final disaster player-facing UI', () => {
  test('identifies the local residents and explains their risk without raw scores', async ({ page }) => {
    await page.goto(URL);
    await page.evaluate(() => {
      S.year = 5; S.month = 12; S.week = 4;
      showEnding();
    });

    const overlay = page.locator('#ver1Choice');
    const status = overlay.locator('.ver1Status');
    await expect(status).toContainText('高倉千尋');
    await expect(status).toContainText('柴垣岳');
    await expect(status).toContainText('TOWA');
    await expect(status).not.toContainText(/(?:千尋|岳|TOWA)\s+\d/);

    await overlay.locator('[data-k="sumo_schedule"][data-v="keep"]').click();
    await expect(status).toContainText('柴垣岳');
    await expect(status).toContainText('危険');

    for (let phase = 0; phase < 5; phase += 1) await overlay.locator('#v1next').click();
    await expect(overlay.locator('h2')).toContainText('高倉千尋・柴垣岳・TOWA');
  });

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
