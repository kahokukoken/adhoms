const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

test.describe('ADHOMS Ver1 observation controls', () => {
  test('the retired follow control is absent from the player FEED', async ({ page }) => {
    await page.goto(URL);

    await expect(page.locator('.hint')).toHaveCount(0);
    await expect(page.locator('#feedList .a.fl')).toHaveCount(0);
    await expect(page.getByRole('button', { name: '＋ フォロー', exact: true })).toHaveCount(0);

    const firstActions = page.locator('#feedList .acts').first();
    await expect(firstActions.locator('button')).toHaveCount(3);
    const columns = await firstActions.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(3);
  });
});
