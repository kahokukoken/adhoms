const { test, expect } = require('@playwright/test');

test.describe('ADHOMS TGS Playtest', () => {
  test('renders the FIELD TERMINAL and uses +/- observation controls', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('http://127.0.0.1:8000/');

    await expect(page).toHaveTitle('ADHOMS Ver.1 TGS Playtest v0.7');
    await expect(page.getByText('FIELD TERMINAL', { exact: true })).toBeVisible();
    await expect(page.getByText('SOCIAL FEED — 倶利伽羅町', { exact: true })).toBeVisible();

    const firstPost = page.locator('[data-id="p1"]');
    await expect(firstPost.getByRole('button', { name: '＋', exact: true })).toBeVisible();
    await expect(firstPost.getByRole('button', { name: '−', exact: true })).toBeVisible();
    await expect(firstPost.getByRole('button', { name: /気になる/ })).toHaveCount(0);
    await expect(firstPost.getByRole('button', { name: /調査/ })).toHaveCount(0);

    await firstPost.getByRole('button', { name: '＋', exact: true }).click();
    await expect(firstPost.getByRole('button', { name: '＋', exact: true })).toHaveClass(/on/);

    await firstPost.getByRole('button', { name: '−', exact: true }).click();
    await expect(firstPost.getByRole('button', { name: '−', exact: true })).toHaveClass(/on/);

    expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('monthly review is an actual staff conversation with named characters', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('http://127.0.0.1:8000/');
    await page.locator('[data-id="p1"]').getByRole('button', { name: '＋', exact: true }).click();
    await page.getByRole('button', { name: '月末まで →' }).click();

    await expect(page.locator('#meeting')).toHaveClass(/on/);
    for (const name of ['宮下', '藤井', '水野', '佐伯']) {
      await expect(page.getByText(name, { exact: false })).toBeVisible();
    }
    await expect(page.locator('.meetingThread .bubble')).toHaveCount(6);
    await expect(page.getByText(/藤井.*宮下|宮下.*藤井|佐伯.*水野|水野.*佐伯/).first()).toBeVisible();
    await expect(page.getByText('ADHOMS', { exact: false })).toBeVisible();

    await page.locator('.meetingContinue').click();
    await expect(page.locator('#bottomYm')).toHaveText('2029 / 05');
    expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('can reach the five-year ending', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('http://127.0.0.1:8000/');

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
