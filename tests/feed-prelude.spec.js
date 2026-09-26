const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

for (const [kind, url] of [
  ['web', 'http://127.0.0.1:8000/'],
  ['standalone', pathToFileURL(path.join(process.cwd(), 'dist/ADHOMS-Ver1.html')).href]
]) {
test(`${kind}: full FEED introduction only appears at the start of the trial`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);

  await expect(page.locator('.feedPrelude')).toBeVisible();
  await expect(page.locator('.currentMonthMarker')).toBeVisible();

  await page.getByRole('button', { name: '月末まで →' }).click();
  await page.locator('.meetingContinue').click();

  await expect(page.locator('.feedPrelude')).toBeHidden();
  await expect(page.locator('.currentMonthMarker')).toBeVisible();
  await expect(page.locator('.currentMonthMarker b')).toHaveText('山際の変化と野生動物');
  await expect(page.locator('#feedList .card').first()).toBeVisible();
  // DL-011 / section 19: neither the permanent explanation nor the first-day
  // conversation should return after the first report, including saved May.
  await expect(page.getByRole('heading', { name: 'ADHOMSとは', exact: true })).toHaveCount(0);
  await expect(page.locator('#feedList [data-onboarding]')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.feedPrelude')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'ADHOMSとは', exact: true })).toHaveCount(0);
  await expect(page.locator('#feedList [data-onboarding]')).toHaveCount(0);
  await expect(page.locator('.currentMonthMarker b')).toHaveText('山際の変化と野生動物');
  await page.screenshot({ path: testInfo.outputPath('after-first-report.png') });
});
}
