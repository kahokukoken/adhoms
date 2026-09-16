const { test, expect } = require('@playwright/test');

test('uses fictional local creators KURICA and GREAT NOTO without old Yuusha Noto label', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/');
  await expect(page.getByText('クリカ', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('グレート・ノト', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('勇者ノト', { exact: false })).toHaveCount(0);
});

test('creator roles diverge across monthly feed posts', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/');
  await expect(page.locator('body')).toContainText('クリカ');
  await expect(page.locator('body')).toContainText('地域');
  await expect(page.locator('body')).toContainText('グレート・ノト');
  await expect(page.locator('body')).toContainText(/現地|突撃|配信|立入|炎上/);
});
