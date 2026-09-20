const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

async function expectMonth(page, index) {
  const expected = {
    year: Math.floor((index + 3) / 12) + 1,
    month: ((index + 3) % 12) + 1,
    index,
  };
  await expect.poll(() => page.evaluate(() => ({
    year: S.year, month: S.month, index: monthIndex(),
  }))).toEqual(expected);
  await expect(page.locator('#bottomYm')).toHaveText(
    `${2028 + expected.year} / ${String(expected.month).padStart(2, '0')}`
  );
}

test.describe('ADHOMS Ver1 lightweight simulation', () => {
  test('modules load after authored FEED and expose debug smoke test', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(URL);
    await expect(page.locator('.currentMonthMarker')).toBeVisible();
    expect(await page.evaluate(() => !!window.ADHOMS_VER1_DEBUG)).toBe(true);
    const smoke = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.smoke());
    expect(smoke.appliedSideEffects.length).toBeGreaterThanOrEqual(3);
    expect(smoke.result.administrativeSuccess).toBeDefined();
    expect(errors).toEqual([]);
  });

  test('Year 2 choices preserve the calendar and persist into Year 3 and Year 4', async ({ page }) => {
    test.setTimeout(90000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // Playwright provides a fresh browser context. Do not race debug.reset()
    // (which calls location.reload()) against the next page.evaluate().
    await page.goto(URL);
    const choices = {
      14: ['y2_flood', 'guided_watch'],
      18: ['y2_wildlife', 'survey'],
      21: ['y2_snow', 'welfare_first'],
    };
    await expectMonth(page, 0);

    for (let index = 1; index <= 36; index += 1) {
      await page.getByRole('button', { name: '月末まで →', exact: true }).click();
      await page.locator('.meetingContinue').click();
      await expectMonth(page, index);

      if (choices[index]) {
        const [eventId, choiceId] = choices[index];
        await expect(page.locator('#ver1Choice')).toHaveClass(/on/);
        await page.locator(`#ver1Choice [data-c="${choiceId}"]`).click();
        await expect(page.locator('#ver1Choice')).not.toHaveClass(/on/);
        // Choosing a policy must never change the current month.
        await expectMonth(page, index);
        expect(await page.evaluate(key => window.ADHOMS_VER1_DEBUG.state().flags[key],
          `${eventId}:${choiceId}`)).toBe(true);
      }

      if (index === 14 || index === 21) {
        // Exercise real save/load both before and after the calendar-year boundary.
        const before = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
        await page.reload();
        await expect(page.locator('.currentMonthMarker')).toBeVisible();
        await expectMonth(page, index);
        expect(await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state())).toEqual(before);
      }

      if (index === 24) {
        await expect(page.locator('#ver1Choice')).toHaveClass(/on/);
        await page.locator('#v1ok').click();
        const state = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
        expect(state.flags.y3_seen).toBe(true);
        expect(state.flags['resolved:y3_flood_guided_watch_spillover']).toBe(true);
        expect(state.flags['resolved:y3_wildlife_survey_gain']).toBe(true);
        expect(state.flags['resolved:y3_snow_welfare_spillover']).toBe(true);
      }

      if (index === 36) {
        await expect(page.locator('#ver1Choice')).toHaveClass(/on/);
        await page.locator('#ver1Choice [data-s="repair"]').click();
        const state = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
        expect(state.flags.y4_seen).toBe(true);
        expect(state.flags['y4_strategy:repair']).toBe(true);
        expect(state.memories.filter(m => ['flood_guided_watch', 'wildlife_survey', 'snow_welfare_first'].includes(m.id))).toHaveLength(3);
        await expectMonth(page, index);
      }
    }
    expect(errors).toEqual([]);
  });

  test('final disaster shows cascading phases and no A-D grade', async ({ page }) => {
    await page.goto(URL);
    await page.evaluate(() => {
      S.year = 5; S.month = 12; S.week = 4;
      showEnding();
    });
    await expect(page.locator('#ver1Choice')).toHaveClass(/on/);
    await expect(page.getByText(/FINAL DAY/)).toBeVisible();
    for (let i = 0; i < 6; i += 1) {
      await page.locator('#v1next').click();
    }
    await page.locator('#v1fin').click();
    await expect(page.getByText('5 YEAR FIELD TRIAL COMPLETE', { exact: true })).toBeVisible();
    await expect(page.getByText(/行政評価と、生活の損失は同じではない/)).toBeVisible();
    await expect(page.getByText(/実証評価 [A-D]/)).toHaveCount(0);
  });
});
