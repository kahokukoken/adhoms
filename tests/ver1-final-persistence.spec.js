const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

test.describe('ADHOMS Ver1 final disaster persistence', () => {
  test('reload resumes the active disaster phase and its selected decisions', async ({ page }) => {
    await page.goto(URL);
    await page.evaluate(() => {
      S.year = 5; S.month = 12; S.week = 4;
      showEnding();
    });

    const overlay = page.locator('#ver1Choice');
    await overlay.locator('[data-k="sumo_schedule"][data-v="keep"]').click();
    await overlay.locator('#v1next').click();
    await expect(overlay).toContainText('FINAL DAY / 昼');

    await page.reload();
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('FINAL DAY / 昼');

    await page.evaluate(() => {
      const record = JSON.parse(localStorage.getItem('adhoms.ver1.finalsession'));
      window.__finalPersistenceProbe = record;
    });
    const record = await page.evaluate(() => window.__finalPersistenceProbe);
    expect(record.stage).toBe('active');
    expect(record.session.phaseIndex).toBe(1);
    expect(record.session.decisions.sumo_schedule).toBe('keep');
  });

  test('result, directive 4, and epilogue survive reload, then closing clears final-session resume', async ({ page }) => {
    await page.goto(URL);
    await page.evaluate(() => {
      S.year = 5; S.month = 12; S.week = 4;
      showEnding();
    });

    const overlay = page.locator('#ver1Choice');
    for (let i = 0; i < 6; i += 1) {
      await overlay.locator('#v1next').click();
    }
    await overlay.locator('#v1fin').click();
    await expect(overlay).toContainText('5 YEAR FIELD TRIAL COMPLETE');

    await page.reload();
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('5 YEAR FIELD TRIAL COMPLETE');

    await overlay.locator('#v1close').click();
    await expect(overlay).toContainText('木曽指令 第4号');
    await expect(overlay).toContainText('T-0WA');

    // The private debrief is a persistent narrative state until acknowledged.
    await page.reload();
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('木曽指令 第4号');
    expect(await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state().flags['directive:4:seen'])).toBe(true);

    await overlay.locator('#v1directive4').click();
    await expect(overlay).toContainText('EPILOGUE');
    expect(await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state().flags['directive:4:ack'])).toBe(true);

    await page.reload();
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('EPILOGUE');
    await expect(overlay).not.toContainText('木曽指令 第4号');

    await overlay.locator('#v1epclose').click();
    await expect(overlay).not.toHaveClass(/on/);
    expect(await page.evaluate(() => localStorage.getItem('adhoms.ver1.finalsession'))).toBeNull();

    await page.reload();
    await expect(page.locator('#ver1Choice')).toHaveCount(0);
  });
});
