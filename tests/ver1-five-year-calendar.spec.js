const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

async function advanceOneMonth(page) {
  await page.getByRole('button', { name: '月末まで →', exact: true }).click();
  await page.locator('.meetingContinue').click();
}

async function resolveMilestone(page, index) {
  const overlay = page.locator('#ver1Choice');
  if (index === 14) {
    await expect(overlay).toContainText('局地冠水');
    await overlay.locator('[data-c="guided_watch"]').click();
  } else if (index === 18) {
    await expect(overlay).toContainText('獣害');
    await overlay.locator('[data-c="food_source"]').click();
  } else if (index === 21) {
    await expect(overlay).toContainText('雪害');
    await overlay.locator('[data-c="welfare_first"]').click();
  } else if (index === 24) {
    await expect(overlay).toContainText('YEAR 3 / SIDE EFFECTS');
    await overlay.locator('#v1ok').click();
  } else if (index === 36) {
    await expect(overlay).toContainText('YEAR 4 / RELATION');
    await overlay.locator('[data-s="repair"]').click();
  }
}

test.describe('ADHOMS Ver1 five-year calendar boundary', () => {
  test('the field trial continues through Jan-Mar 2034 and does not end in December 2033', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(URL);

    for (let index = 1; index <= 56; index += 1) {
      await advanceOneMonth(page);
      await resolveMilestone(page, index);
    }

    await expect(page.locator('#bottomYm')).toHaveText('2033 / 12');

    // A five-year April-based field trial must include Jan-Mar 2034.
    await advanceOneMonth(page);
    await expect(page.locator('#bottomYm')).toHaveText('2034 / 01');
    await expect(page.locator('#ver1Choice')).not.toContainText('FINAL DAY');
  });
});
