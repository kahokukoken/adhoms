const { test, expect } = require('@playwright/test');

test.describe('ADHOMS TGS Playtest', () => {
  test('renders the FIELD TERMINAL, +/- controls, and local VTuber in FEED', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('http://127.0.0.1:8000/');
    await expect(page).toHaveTitle('ADHOMS Ver.1 TGS Playtest v0.7');
    await expect(page.getByText('FIELD TERMINAL', { exact: true })).toBeVisible();
    await expect(page.getByText('SOCIAL FEED — 倶利伽羅町', { exact: true })).toBeVisible();

    const firstPost = page.locator('[data-id="p1"]');
    await expect(firstPost.getByRole('button', { name: '＋', exact: true })).toBeVisible();
    await expect(firstPost.getByRole('button', { name: '−', exact: true })).toBeVisible();
    await expect(page.getByText('クリカ', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/LOCAL VTUBER|配信/).first()).toBeVisible();

    expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('monthly review changes with month while preserving established staff voices', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('http://127.0.0.1:8000/');
    await page.locator('[data-id="p1"]').getByRole('button', { name: '＋', exact: true }).click();
    await page.getByRole('button', { name: '月末まで →' }).click();

    for (const name of ['宮下 沙耶', '藤井 真', '水野 悠', '佐伯 直人']) {
      await expect(page.locator('.meetingThread .speaker', { hasText: name }).first()).toBeVisible();
    }
    const aprilText = await page.locator('#meetingBody').innerText();
    await expect(page.locator('.meetingThread')).toContainText('ちょ、ちょっと待って');
    await expect(page.locator('.meetingThread')).toContainText('単純比較');
    await expect(page.locator('.meetingThread')).toContainText('不確実性');

    await page.locator('.meetingContinue').click();
    await expect(page.locator('#bottomYm')).toHaveText('2029 / 05');
    await page.getByRole('button', { name: '月末まで →' }).click();
    const mayText = await page.locator('#meetingBody').innerText();

    expect(mayText).not.toBe(aprilText);
    await expect(page.locator('#meetingBody')).toContainText(/5月|野生動物|維持|山際|耕作放棄地/);
    await page.locator('.meetingContinue').click();
    await expect(page.locator('#bottomYm')).toHaveText('2029 / 06');

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
