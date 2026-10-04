const { test, expect } = require('@playwright/test');

test('uses fictional local creators Kurika and Great Noto without old Yuusha Noto label', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/');
  await expect(page.getByText('クリカ', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('グレート・ノト', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('勇者ノト', { exact: false })).toHaveCount(0);
});

test('creator roles are behaviorally distinct in authored FEED', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/');
  const feed = page.locator('#feedList');
  await expect(feed).toContainText('クリカ');
  await expect(feed).toContainText(/観測端末|抽選|聞きたい/);
  await expect(feed).toContainText('グレート・ノト');
  await expect(feed).toContainText(/突撃|止められてる|やめろ|飛び入り/);
});
