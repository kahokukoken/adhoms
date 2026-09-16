const { test, expect } = require('@playwright/test');

test('uses fictional local creators Kurika and Great Noto without old Yuusha Noto label', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/');
  await expect(page.getByText('クリカ', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('グレート・ノト', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('勇者ノト', { exact: false })).toHaveCount(0);
});

test('creator roles are behaviorally distinct in FEED', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/');
  await expect(page.locator('body')).toContainText('クリカ');
  await expect(page.locator('body')).toContainText('地元民、情報求む');
  await expect(page.locator('body')).toContainText('グレート・ノト');
  await expect(page.locator('body')).toContainText(/危ないからやめろ|通報・批判|切り抜かれて拡散/);
});
