const { test, expect } = require('@playwright/test');

test.describe('ADHOMS TGS Playtest', () => {
  test('opens with field-trial context before the social FEED', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('http://127.0.0.1:8000/');
    await expect(page).toHaveTitle('ADHOMS Ver.1 TGS Playtest v0.7');
    await expect(page.getByText('FIELD TERMINAL', { exact: true })).toBeVisible();
    await expect(page.locator('.feedPrelude')).toBeVisible();
    await expect(page.locator('.feedPrelude')).toContainText(/2029年4月|実証|倶利伽羅町/);

    const firstPost = page.locator('#feedList .card').first();
    await expect(firstPost.getByRole('button', { name: '＋', exact: true })).toBeVisible();
    await expect(firstPost.getByRole('button', { name: '−', exact: true })).toBeVisible();
    expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('visible FEED actually changes on each month advance', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    const snapshots = [];

    for (let i = 0; i < 4; i += 1) {
      snapshots.push((await page.locator('#feedList').innerText()).slice(0, 1400));
      if (i < 3) {
        await page.getByRole('button', { name: '月末まで →' }).click();
        await page.locator('.meetingContinue').click();
      }
    }

    expect(new Set(snapshots).size).toBe(4);
    expect(snapshots[0]).toMatch(/2029-04|4月|新年度|交通/);
    expect(snapshots[1]).toMatch(/2029-05|5月|野生動物|山際/);
    expect(snapshots[2]).toMatch(/2029-06|6月|梅雨|排水|冠水/);
    expect(snapshots[3]).toMatch(/2029-07|7月|暑熱|高温|電力/);
  });

  test('human FEED actors show name, age, and role or social position', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    const cards = page.locator('#feedList .card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(3);

    for (let i = 0; i < Math.min(count, 8); i += 1) {
      const text = await cards.nth(i).innerText();
      expect(text).toMatch(/\d{2}歳|年齢不詳|組織アカウント|SYSTEM/);
      if (!/組織アカウント|SYSTEM/.test(text)) {
        expect(text).toMatch(/主婦|会社員|店主|職員|農家|学生|VTuber|動画配信者|医師|教員|記者|自治会|無職|自営業|運転手|介護|看護|公務員/);
      }
    }

    await expect(page.getByText(/クリカ.*年齢不詳|年齢不詳.*クリカ/).first()).toBeVisible();
    await expect(page.getByText(/グレート・ノト.*年齢不詳|年齢不詳.*グレート・ノト/).first()).toBeVisible();
  });

  test('monthly meeting starts naturally and visibly changes month to month', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('http://127.0.0.1:8000/');
    const meetings = [];
    const topics = [];

    for (let i = 0; i < 4; i += 1) {
      await page.getByRole('button', { name: '月末まで →' }).click();
      await expect(page.locator('.meetingPrelude')).toBeVisible();
      await expect(page.locator('.characterBeat')).toHaveCount(0);
      for (const name of ['宮下 沙耶', '藤井 真', '水野 悠', '佐伯 直人']) {
        await expect(page.locator('.meetingThread .speaker', { hasText: name }).first()).toBeVisible();
      }
      meetings.push(await page.locator('#meetingBody').innerText());
      topics.push((await page.locator('.meetingContext .topic').innerText()).trim());
      await page.locator('.meetingContinue').click();
    }

    expect(new Set(topics).size).toBe(4);
    expect(new Set(meetings).size).toBe(4);
    expect(meetings[0]).toMatch(/新年度|移動|転入/);
    expect(meetings[1]).toMatch(/野生動物|山際|耕作放棄地/);
    expect(meetings[2]).toMatch(/梅雨|排水|冠水/);
    expect(meetings[3]).toMatch(/暑熱|高温|電力/);
    expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('staff personalities include established quirks, hobbies, and dialect without duplicate blocks', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    const seen = [];

    for (let i = 0; i < 8; i += 1) {
      await page.getByRole('button', { name: '月末まで →' }).click();
      await expect(page.locator('.characterBeat')).toHaveCount(0);
      seen.push(await page.locator('.meetingThread').innerText());
      await page.locator('.meetingContinue').click();
    }

    const all = seen.join('\n');
    expect(all).toMatch(/それだけでは結論になりません|単純比較は条件差を補正してからです/);
    expect(all).toMatch(/ちょ、ちょっと待って|一個ずつ/);
    expect(all).toMatch(/しとる|なんや/);
    expect(all).toMatch(/閉店告知|閉店のお知らせ|古地図|閉店/);
    expect(all).toMatch(/かわいい|長くなるので省きます|ここから長くなる/);
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
