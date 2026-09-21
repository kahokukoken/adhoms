const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

async function reachAdministrativeResult(page) {
  await page.goto(URL);
  await page.evaluate(() => {
    S.year = 5; S.month = 12; S.week = 4;
    showEnding();
  });
  const overlay = page.locator('#ver1Choice');
  for (let phase = 0; phase < 6; phase += 1) await overlay.locator('#v1next').click();
  await overlay.locator('#v1fin').click();
  await expect(overlay).toContainText('YEAR 5 / 復旧期間');
  await page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem('adhoms.ver1.finalsession'));
    record.stage = 'result';
    localStorage.setItem('adhoms.ver1.finalsession', JSON.stringify(record));
  });
  await page.reload();
  await expect(overlay).toContainText('5 YEAR FIELD TRIAL COMPLETE');
  return overlay;
}

test.describe('ADHOMS Ver1 Kiso directive 4', () => {
  test('administrative evaluation leads to a persistent private TOWA conversation before the epilogue', async ({ page }) => {
    const overlay = await reachAdministrativeResult(page);

    await overlay.locator('#v1close').click();
    await expect(overlay).toContainText('木曽指令 第4号');
    await expect(overlay).toContainText('TOWA');
    await expect(overlay).toContainText('行政上の成功');
    await expect(overlay).toContainText('家族の店');
    await expect(overlay).not.toContainText('NML');

    const seen = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state().flags['directive:4:seen']);
    expect(seen).toBe(true);

    // The private debrief is part of the narrative state, not a disposable modal.
    await page.reload();
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('木曽指令 第4号');

    await overlay.locator('#v1directive4').click();
    await expect(overlay).toContainText('EPILOGUE');
    await expect(overlay).not.toContainText('木曽指令 第4号');

    const acknowledged = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state().flags['directive:4:ack']);
    expect(acknowledged).toBe(true);
  });
});
