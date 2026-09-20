const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

async function advanceOneMonth(page) {
  await page.getByRole('button', { name: '月末まで →', exact: true }).click();
  await page.locator('.meetingContinue').click();
}

async function acknowledgeDirective(page, number) {
  const overlay = page.locator('#ver1Choice');
  await expect(overlay).toContainText(`木曽指令 第${number}号`);
  await overlay.locator('#v1directive').click();
  await expect(overlay).not.toHaveClass(/on/);
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
    await acknowledgeDirective(page, 1);
  } else if (index === 36) {
    await expect(overlay).toContainText('YEAR 4 / RELATION');
    await overlay.locator('[data-s="repair"]').click();
    await acknowledgeDirective(page, 2);
  } else if (index === 48) {
    await acknowledgeDirective(page, 3);
  }
}

test.describe('ADHOMS Ver1 five-year calendar boundary', () => {
  test('the April-based field trial runs all 60 months before the final disaster', async ({ page }) => {
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

    await advanceOneMonth(page);
    await expect(page.locator('#bottomYm')).toHaveText('2034 / 02');
    await expect(page.locator('#ver1Choice')).not.toContainText('FINAL DAY');

    await advanceOneMonth(page);
    await expect(page.locator('#bottomYm')).toHaveText('2034 / 03');
    await expect(page.locator('#ver1Choice')).not.toContainText('FINAL DAY');

    const beforeFinal = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(beforeFinal.year).toBe(5);
    expect(beforeFinal.month).toBe(3);

    // Completing March ends the 60-month trial and only then opens the final disaster.
    await advanceOneMonth(page);
    await expect(page.locator('#ver1Choice')).toHaveClass(/on/);
    await expect(page.locator('#ver1Choice')).toContainText('FINAL DAY / 朝');
  });
});
