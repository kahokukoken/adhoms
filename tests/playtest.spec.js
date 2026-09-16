const { test, expect } = require('@playwright/test');

test.describe('ADHOMS TGS Playtest v0.7', () => {
  test('renders the FIELD TERMINAL and supports core FEED interactions', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('http://127.0.0.1:8000/');

    await expect(page).toHaveTitle('ADHOMS Ver.1 TGS Playtest v0.7');
    await expect(page.getByText('FIELD TERMINAL', { exact: true })).toBeVisible();
    await expect(page.getByText('PUBLIC PROTOTYPE v0.7', { exact: true })).toBeVisible();
    await expect(page.getByText('SOCIAL FEED — 倶利伽羅町', { exact: true })).toBeVisible();
    await expect(page.locator('.card')).not.toHaveCount(0);

    await page.getByRole('button', { name: '住民', exact: true }).click();
    await expect(page.locator('.card.resident').first()).toBeVisible();
    await page.getByRole('button', { name: 'ALL', exact: true }).click();

    const firstPost = page.locator('[data-id="p1"]');
    await firstPost.getByRole('button', { name: /気になる/ }).click();
    await expect(firstPost.getByRole('button', { name: /気になる/ })).toHaveClass(/on/);

    await firstPost.getByRole('button', { name: /調査/ }).click();
    await expect(firstPost.getByRole('button', { name: /調査/ })).toHaveClass(/on/);

    await firstPost.getByRole('button', { name: /フォロー/ }).click();
    await expect(firstPost.getByRole('button', { name: /フォロー/ })).toHaveClass(/on/);

    await firstPost.getByRole('button', { name: /詳細/ }).click();
    await expect(page.locator('#ov')).toHaveClass(/on/);
    await page.locator('#ov .close').click();

    await page.getByRole('button', { name: '1週進む →' }).click();
    await expect(page.locator('#bottomMn')).toHaveText('第2週');

    expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('opens monthly review, carries research forward, and can reach the five-year ending', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('http://127.0.0.1:8000/');

    await page.locator('[data-id="p1"] .bm').click();
    await page.getByRole('button', { name: '月末まで →' }).click();
    await expect(page.locator('#meeting')).toHaveClass(/on/);
    await expect(page.getByText('今月の主要観測', { exact: true })).toBeVisible();
    await page.locator('.meetingContinue').click();

    await expect(page.locator('#bottomYm')).toHaveText('2029 / 05');

    // Progress month-by-month using the public controls until the ending appears.
    for (let i = 0; i < 70; i += 1) {
      if (await page.getByText('5 YEAR FIELD TRIAL COMPLETE', { exact: true }).isVisible().catch(() => false)) break;

      await page.getByRole('button', { name: '月末まで →' }).click();
      if (await page.locator('#meeting').evaluate(el => el.classList.contains('on'))) {
        await page.locator('.meetingContinue').click();
      }
    }

    await expect(page.getByText('5 YEAR FIELD TRIAL COMPLETE', { exact: true })).toBeVisible();
    await expect(page.getByText(/倶利伽羅町 実証評価 [A-D]/)).toBeVisible();
    expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });
});
