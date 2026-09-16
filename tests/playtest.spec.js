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
    await expect(page.locator('.feedPrelude')).toContainText(/まず|今週|FEED|観測/);

    const firstPost = page.locator('[data-id="p1"]');
    await expect(firstPost.getByRole('button', { name: '＋', exact: true })).toBeVisible();
    await expect(firstPost.getByRole('button', { name: '−', exact: true })).toBeVisible();
    await expect(page.getByText('クリカ', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/LOCAL VTUBER|配信/).first()).toBeVisible();

    expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('monthly meeting starts with a natural prelude and has no duplicate sub-lines', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    await page.getByRole('button', { name: '月末まで →' }).click();

    await expect(page.locator('.meetingPrelude')).toBeVisible();
    await expect(page.locator('.meetingPrelude')).toContainText(/月末|月例報告会|今月/);
    await expect(page.locator('.characterBeat')).toHaveCount(0);
    await expect(page.locator('.meetingThread .bubble').first()).toBeVisible();
  });

  test('monthly review changes topic, dialogue, and choreography across consecutive months', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('http://127.0.0.1:8000/');
    const meetings = [];
    const topics = [];
    const firstSpeakers = [];

    for (let i = 0; i < 4; i += 1) {
      await page.getByRole('button', { name: '月末まで →' }).click();
      for (const name of ['宮下 沙耶', '藤井 真', '水野 悠', '佐伯 直人']) {
        await expect(page.locator('.meetingThread .speaker', { hasText: name }).first()).toBeVisible();
      }
      meetings.push(await page.locator('#meetingBody').innerText());
      topics.push((await page.locator('.meetingContext .topic').innerText()).trim());
      firstSpeakers.push((await page.locator('.meetingThread .speaker').first().innerText()).trim());
      await page.locator('.meetingContinue').click();
    }

    expect(new Set(topics).size).toBe(4);
    expect(new Set(meetings).size).toBe(4);
    expect(new Set(firstSpeakers).size).toBeGreaterThanOrEqual(3);
    expect(meetings[0]).toMatch(/新年度|移動|転入/);
    expect(meetings[1]).toMatch(/野生動物|山際|耕作放棄地/);
    expect(meetings[2]).toMatch(/梅雨|排水|冠水/);
    expect(meetings[3]).toMatch(/暑熱|高温|電力/);
    expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('staff personalities include previously established quirks and hobbies without separate duplicate blocks', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    const seen = [];

    for (let i = 0; i < 6; i += 1) {
      await page.getByRole('button', { name: '月末まで →' }).click();
      await expect(page.locator('.characterBeat')).toHaveCount(0);
      seen.push(await page.locator('.meetingThread').innerText());
      await page.locator('.meetingContinue').click();
    }

    const all = seen.join('\n');
    expect(all).toMatch(/それだけでは結論になりません|単純比較は条件差を補正してからです/);
    expect(all).toMatch(/ちょ、ちょっと待って|一個ずつ/);
    expect(all).toMatch(/閉店告知|閉店のお知らせ|閉店/);
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
