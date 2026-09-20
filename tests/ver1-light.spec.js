const { test, expect } = require('@playwright/test');

async function closeVer1Choice(page, selector) {
  const overlay = page.locator('#ver1Choice');
  if (await overlay.evaluate(el => el.classList.contains('on')).catch(() => false)) {
    await overlay.locator(selector).first().click();
  }
}

test.describe('ADHOMS Ver1 lightweight simulation', () => {
  test('modules load after authored FEED and expose debug smoke test', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:8000/');
    await expect(page.locator('.currentMonthMarker')).toBeVisible();
    const hasDebug = await page.evaluate(() => !!window.ADHOMS_VER1_DEBUG);
    expect(hasDebug).toBe(true);
    const smoke = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.smoke());
    expect(smoke.appliedSideEffects.length).toBeGreaterThanOrEqual(3);
    expect(smoke.result.administrativeSuccess).toBeDefined();
    expect(errors).toEqual([]);
  });

  test('Year 2 choices persist into Year 3 and Year 4', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    await page.evaluate(() => {
      window.ADHOMS_VER1_DEBUG.reset();
    }).catch(() => {});
    await page.waitForLoadState('load');

    await page.evaluate(() => {
      S.year = 2; S.month = 12; S.week = 4;
      window.ADHOMS_LIGHT_STATE.year = 2;
      window.ADHOMS_LIGHT_STATE.month = 12;
    });
    await page.evaluate(() => nextMonth());
    await expect(page.locator('#ver1Choice')).toHaveClass(/on/);
    await closeVer1Choice(page, '#v1ok');

    const state3 = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(state3.flags.y3_seen).toBe(true);

    await page.evaluate(() => {
      S.year = 3; S.month = 12; S.week = 4;
      window.ADHOMS_LIGHT_STATE.year = 3;
      window.ADHOMS_LIGHT_STATE.month = 12;
    });
    await page.evaluate(() => nextMonth());
    await expect(page.locator('#ver1Choice')).toHaveClass(/on/);
    await closeVer1Choice(page, '[data-s]');

    const state4 = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(state4.flags.y4_seen).toBe(true);
  });

  test('final disaster shows cascading phases and no A-D grade', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    await page.evaluate(() => {
      S.year = 5; S.month = 12; S.week = 4;
      showEnding();
    });
    await expect(page.locator('#ver1Choice')).toHaveClass(/on/);
    await expect(page.getByText(/FINAL DAY/)).toBeVisible();

    for (let i = 0; i < 6; i += 1) {
      const next = page.locator('#v1next');
      if (await next.count()) await next.click();
    }
    await page.locator('#v1fin').click();
    await expect(page.getByText('5 YEAR FIELD TRIAL COMPLETE', { exact: true })).toBeVisible();
    await expect(page.getByText(/行政評価と、生活の損失は同じではない/)).toBeVisible();
    await expect(page.getByText(/実証評価 [A-D]/)).toHaveCount(0);
  });
});