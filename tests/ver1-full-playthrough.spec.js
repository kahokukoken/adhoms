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

async function chooseOneOptionPerDecision(page) {
  const overlay = page.locator('#ver1Choice');
  const keys = await overlay.locator('[data-k]').evaluateAll((buttons) =>
    [...new Set(buttons.map((button) => button.dataset.k))]
  );

  for (const key of keys) {
    const option = overlay.locator(`[data-k="${key}"]`).first();
    await option.click();
    await expect(overlay.locator(`[data-k="${key}"][aria-pressed="true"]`)).toHaveCount(1);
  }

  return keys;
}

async function expectNoHorizontalOverflow(page) {
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fits).toBe(true);
}

test.describe('ADHOMS Ver1 complete player path', () => {
  test('mobile UI completes 60 months, the final disaster, result, and epilogue', async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL);

    for (let index = 1; index <= 59; index += 1) {
      await advanceOneMonth(page);
      await resolveMilestone(page, index);
    }

    await expect(page.locator('#bottomYm')).toHaveText('2034 / 03');
    await expectNoHorizontalOverflow(page);

    // Completing the 60th month opens the final disaster through the normal UI path.
    await advanceOneMonth(page);
    const overlay = page.locator('#ver1Choice');
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('FINAL DAY / 朝');
    await expectNoHorizontalOverflow(page);

    // Six decision phases precede convergence. Pick one available choice for every
    // decision key in each phase, then advance with the player-facing controls.
    for (let phase = 0; phase < 6; phase += 1) {
      const keys = await chooseOneOptionPerDecision(page);
      expect(keys.length).toBeGreaterThan(0);
      await expect(overlay).not.toContainText(/sumo_schedule|towa_schedule|traffic_priority|priority_override/);
      await expectNoHorizontalOverflow(page);
      await overlay.locator('#v1next').click();
    }

    await expect(overlay).toContainText('FINAL DAY / 収束');
    await overlay.locator('#v1fin').click();

    await expect(overlay).toContainText('5 YEAR FIELD TRIAL COMPLETE');
    await expect(overlay).toContainText('行政評価と、生活の損失は同じではない。');
    await expectNoHorizontalOverflow(page);
    await overlay.locator('#v1close').click();

    await expect(overlay).toContainText('EPILOGUE');
    await expect(overlay).toContainText('T-0WA');
    await expect(overlay).toContainText('個人の生活に残った損失');
    await expectNoHorizontalOverflow(page);
    await overlay.locator('#v1epclose').click();
    await expect(overlay).not.toHaveClass(/on/);
  });
});
