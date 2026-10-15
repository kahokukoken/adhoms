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
}

async function resolveMilestone(page, index) {
  const overlay = page.locator('#ver1Choice');
  if (index === 14) await overlay.locator('[data-c="guided_watch"]').click();
  else if (index === 18) await overlay.locator('[data-c="food_source"]').click();
  else if (index === 21) await overlay.locator('[data-c="welfare_first"]').click();
  else if (index === 24) { await overlay.locator('#v1ok').click(); await acknowledgeDirective(page, 1); }
  else if (index === 36) { await overlay.locator('[data-s="repair"]').click(); await acknowledgeDirective(page, 2); }
  else if (index === 48) await acknowledgeDirective(page, 3);
}

test.describe('ADHOMS Ver1 five-year calendar boundary', () => {
  test('the Year 5 disaster occurs in August and recovery lasts through March', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(URL);

    for (let index = 1; index <= 51; index += 1) {
      await advanceOneMonth(page);
      await resolveMilestone(page, index);
    }
    await expect(page.locator('#bottomYm')).toHaveText('2033 / 07');

    await advanceOneMonth(page);
    const overlay = page.locator('#ver1Choice');
    await expect(page.locator('#bottomYm')).toHaveText('2033 / 08');
    await expect(overlay).toContainText('FINAL DAY / 朝');
    await expect(overlay).toContainText('八朔相撲');
    await expect(overlay).toContainText('TOWAイベント');

    for (let phase = 0; phase < 6; phase += 1) await overlay.locator('#v1next').click();
    await overlay.locator('#v1fin').click();
    await expect(overlay).toContainText('YEAR 5 / 復旧期間');
    await overlay.locator('#v1recover').click();
    await expect(page.locator('#bottomYm')).toHaveText('2033 / 09');

    for (const ym of ['2033 / 10','2033 / 11','2033 / 12','2034 / 01','2034 / 02','2034 / 03']) {
      await advanceOneMonth(page);
      await expect(page.locator('#bottomYm')).toHaveText(ym);
      await expect(overlay).not.toHaveClass(/on/);
    }
    await advanceOneMonth(page);
    await expect(overlay).toContainText('5 YEAR FIELD TRIAL COMPLETE');
  });
});
