const { test, expect } = require('@playwright/test');

test.describe('ADHOMS Ver1 observation flow', () => {
  test('opens with field-trial context before the social FEED', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto('http://127.0.0.1:8000/');
    await expect(page).toHaveTitle('ADHOMS Ver.1 — 倶利伽羅町実証');
    await expect(page.getByText('FIELD TERMINAL', { exact: true })).toBeVisible();
    await expect(page.locator('.feedPrelude')).toBeVisible();
    await expect(page.locator('.feedPrelude')).toContainText('抽選で選ばれ、観測端末を配布された実証参加者');
    const firstPost = page.locator('#feedList .card').first();
    await expect(firstPost.getByRole('button', { name: '＋', exact: true })).toBeVisible();
    await expect(firstPost.getByRole('button', { name: '−', exact: true })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('authored FEED changes across all 12 months', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    const snapshots = [];
    const topics = [];
    for (let i = 0; i < 12; i += 1) {
      snapshots.push((await page.locator('#feedList').innerText()).slice(0, 1600));
      topics.push((await page.locator('.currentMonthMarker b').innerText()).trim());
      if (i < 11) {
        await page.getByRole('button', { name: '月末まで →' }).click();
        await page.locator('.meetingContinue').click();
      }
    }
    expect(new Set(snapshots).size).toBe(12);
    expect(new Set(topics).size).toBe(12);
    expect(topics).toEqual([
      '新年度の移動変化','山際の変化と野生動物','梅雨入りと排水','暑熱と生活圏','夏休みと地域活動','八朔相撲と豪雨期',
      '収穫期と物流','冬支度と高齢世帯','年末商業と移動','冬季交通と孤立','冬の維持負担','年度末の先送り'
    ]);
  });

  test('all visible human FEED actors show name age and role', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    for (let m = 0; m < 12; m += 1) {
      const cards = page.locator('#feedList .card');
      const count = await cards.count();
      expect(count).toBeGreaterThan(3);
      for (let i = 0; i < count; i += 1) {
        const text = await cards.nth(i).innerText();
        expect(text).toMatch(/\d{2}歳|年齢不詳|組織アカウント|SYSTEM/);
        if (!/組織アカウント|SYSTEM/.test(text)) {
          expect(text).toMatch(/主婦|会社員|店主|職員|係長|主査|農家|高校生|VTuber|動画配信者|医師|教員|記者|自治会|運転手|介護|研究者/);
        }
      }
      if (m < 11) {
        await page.getByRole('button', { name: '月末まで →' }).click();
        await page.locator('.meetingContinue').click();
      }
    }
  });

  test('authored monthly meetings are unique across all 12 months', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto('http://127.0.0.1:8000/');
    const meetings = [];
    const topics = [];
    const firstSpeakers = [];
    for (let i = 0; i < 12; i += 1) {
      await page.getByRole('button', { name: '月末まで →' }).click();
      await expect(page.locator('.meetingPrelude')).toBeVisible();
      await expect(page.locator('.characterBeat,.characterAside')).toHaveCount(0);
      for (const name of ['宮下 沙耶', '藤井 真', '水野 悠', '佐伯 直人']) {
        await expect(page.locator('.meetingThread .speaker', { hasText: name }).first()).toBeVisible();
      }
      meetings.push(await page.locator('#meetingBody').innerText());
      topics.push((await page.locator('.meetingContext .topic').innerText()).trim());
      firstSpeakers.push((await page.locator('.meetingThread .speaker').first().innerText()).trim());
      await page.locator('.meetingContinue').click();
    }
    expect(new Set(topics).size).toBe(12);
    expect(new Set(meetings).size).toBe(12);
    expect(new Set(firstSpeakers).size).toBeGreaterThanOrEqual(4);
    expect(pageErrors).toEqual([]);
  });

  // V1-04: removed the old repeated catchphrase assertion. Character voice is
  // reviewed as dialogue against individual Notion pages, not phrase frequency.

  test('year arc changes after first year instead of repeating the same year', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    const firstApril = await page.locator('#feedList').innerText();
    for (let i = 0; i < 12; i += 1) {
      await page.getByRole('button', { name: '月末まで →' }).click();
      await page.locator('.meetingContinue').click();
    }
    const secondApril = await page.locator('#feedList').innerText();
    expect(secondApril).not.toBe(firstApril);
    expect(secondApril).toMatch(/適応の反作用|前年の対策|2030-04/);
  });

  test('light simulation modules load and complete a five-year smoke path', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto('http://127.0.0.1:8000/');
    const result = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.smoke());
    expect(result.appliedSideEffects.length).toBeGreaterThanOrEqual(3);
    expect(result.result.humanSafety).toBeGreaterThanOrEqual(0);
    expect(result.result.humanSafety).toBeLessThanOrEqual(100);
    expect(result.result.livelihoodContinuity).toBeGreaterThanOrEqual(0);
    expect(pageErrors).toEqual([]);
  });
});
