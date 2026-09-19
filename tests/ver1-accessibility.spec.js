const { test, expect } = require('@playwright/test');

for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  test(`Ver1 remains usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const errors = [];
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:8000/ver1/');
    await expect(page.locator('.terminal-shell')).toBeVisible();
    await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
    for (let index = 0; index < 2; index += 1) {
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    }
    await page.getByRole('button', { name: '5年間の実証を開始' }).click();
    await expect(page.getByRole('button', { name: '翌月へ' })).toBeVisible();
    await page.locator('body').press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
