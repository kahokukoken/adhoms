const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { test, expect } = require('@playwright/test');

const standalone = path.join(process.cwd(), 'dist', 'ADHOMS-Ver1.html');

test.describe('ADHOMS Ver1 standalone artifact', () => {
  test('opens directly as one HTML file without a local server', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto(pathToFileURL(standalone).href);

    await expect(page.locator('[data-pretrial-opening="sip-governor-mail"]')).toBeVisible();
    expect(await page.evaluate(()=>document.querySelector('.phone').inert)).toBe(true);
    await expect(page.locator('#adhomsPretrialLaunch')).toHaveCount(0);
    await page.locator('#adhomsIntroNext').click();
    await page.locator('#adhomsStaffNext').click();
    await expect(page.locator('#adhomsPretrialOverlay')).toContainText('第1週・FEED');
    await expect(page.locator('#feedList .a.fl')).toHaveCount(0);
    await expect(page.locator('#bottomYm')).toHaveText('2029 / 04');
    expect(await page.evaluate(() => !!window.ADHOMS_VER1_DEBUG)).toBe(true);
    expect(pageErrors).toEqual([]);
  });
});
