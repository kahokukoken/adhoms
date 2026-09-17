const { test, expect } = require('@playwright/test');

test('full FEED introduction only appears at the start of the trial', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/');

  await expect(page.locator('.feedPrelude')).toBeVisible();
  await expect(page.locator('.currentMonthMarker')).toBeVisible();

  await page.getByRole('button', { name: '月末まで →' }).click();
  await page.locator('.meetingContinue').click();

  await expect(page.locator('.feedPrelude')).toBeHidden();
  await expect(page.locator('.currentMonthMarker')).toBeVisible();
  await expect(page.locator('.currentMonthMarker b')).toHaveText('山際の変化と野生動物');
  await expect(page.locator('#feedList .card').first()).toBeVisible();
});
