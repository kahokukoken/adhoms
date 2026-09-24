const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

test.describe('ADHOMS Ver1 V1-11 authored research linkage', () => {
  test('plus on a current scenario post starts topic research and persists it', async ({ page }) => {
    await page.goto(URL);
    const post = page.locator('#feedList .card[data-id^="scenario-"]').filter({ hasText: '朝のバス' }).first();
    await expect(post).toBeVisible();

    const id = await post.getAttribute('data-id');
    await post.getByRole('button', { name: '＋', exact: true }).click();

    const queued = await page.evaluate((sourceId) => {
      const item = S.research.find(x => x.id === sourceId);
      return item && {
        title:item.title, topic:item.topic, due:item.due,
        sourceWho:item.sourceWho, sourceProfile:item.sourceProfile
      };
    }, id);
    expect(queued).toEqual(expect.objectContaining({
      title:'新年度の移動条件を確認',
      topic:'新年度の移動変化',
      sourceWho:'田中 美咲'
    }));
    expect(queued.sourceProfile).toContain('主婦');

    await page.reload();
    await expect(page.locator(`[data-id="${id}"]`).getByRole('button', { name:'＋', exact:true })).toHaveClass(/on/);
    expect(await page.evaluate((sourceId) => S.research.filter(x => x.id === sourceId).length, id)).toBe(1);
  });

  test('due research returns as a normal FEED report and survives reload', async ({ page }) => {
    await page.goto(URL);
    const post = page.locator('#feedList .card[data-id^="scenario-"]').filter({ hasText: '朝のバス' }).first();
    await post.getByRole('button', { name: '＋', exact: true }).click();

    await page.getByRole('button', { name:'月末まで →', exact:true }).click();
    await page.locator('.meetingContinue').click();
    await expect(page.locator('#bottomYm')).toHaveText('2029 / 05');

    const report = page.locator('#feedList [data-research-beat="true"]');
    await expect(report).toHaveCount(1);
    await expect(report).toContainText('河北恒研・調査報告');
    await expect(report).toContainText('新年度の移動条件を確認');
    await expect(report).toContainText('通勤・通学のピーク');
    expect(await page.evaluate(() => S.research[0].done)).toBe(true);
    expect(await page.evaluate(() => S.research[0].completedMonth)).toBe(1);

    await page.reload();
    await expect(page.locator('#feedList [data-research-beat="true"]')).toContainText('新年度の移動条件を確認');

    await page.getByRole('button', { name:'月末まで →', exact:true }).click();
    await expect(page.locator('.meetingObservations')).toContainText('河北恒研・調査報告');
  });

  test('current cards expose poster context and no follow control', async ({ page }) => {
    await page.goto(URL);
    const post = page.locator('#feedList .card[data-id^="scenario-"]').filter({ hasText: '朝のバス' }).first();
    await expect(post.getByRole('button', { name:/フォロー/ })).toHaveCount(0);
    await expect(post).toContainText('38歳 / 主婦 / 子育て世帯');

    await post.getByRole('button', { name:'⌕ 詳細', exact:true }).click();
    const sheet = page.locator('#sheetBody');
    await expect(sheet).toContainText('田中 美咲');
    await expect(sheet).toContainText('38歳 / 主婦 / 子育て世帯');
    await expect(sheet).toContainText('＋は同意ではなく観測上の重み付け');
  });
});
