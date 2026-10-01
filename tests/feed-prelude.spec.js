const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

for (const [kind, url] of [
  ['web', 'http://127.0.0.1:8000/'],
  ['standalone', pathToFileURL(path.join(process.cwd(), 'dist/ADHOMS-Ver1.html')).href]
]) {
test(`${kind}: full FEED introduction only appears at the start of the trial`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);

  // DL-013 supersedes DL-012: user 2026-09-26 / hub section 22.
  await expect(page.locator('#readOpening, .openingTranscript')).toHaveCount(0);
  await expect(page.locator('.feedPrelude')).toHaveCount(0);
  const opening = page.locator('#feedList [data-onboarding]');
  await expect(opening).toHaveCount(10);
  for (const i of [0, 1]) await expect(opening.nth(i).locator('.who')).toContainText('T-0WA');
  await expect(opening.nth(0).locator('.post')).toContainText('2029年4月');
  await expect(opening.nth(0).locator('.post')).toContainText('5年間');
  await expect(opening.nth(1).locator('.post')).toContainText('抽選');
  await expect(opening.nth(1).locator('.post')).toContainText('投稿がないことは、問題がないことを意味しません');
  await page.screenshot({ path: testInfo.outputPath('feed-only-opening.png') });
  await opening.nth(1).scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('t0wa-second-post.png') });
  await expect(page.locator('.currentMonthMarker')).toBeVisible();
  await expect(page.locator('main .title, main .hint')).toHaveCount(0);
  await expect(page.locator('#feedList .post').filter({hasText:'まず「普通の一年」がどう揺れるか'})).toHaveCount(0);

  await page.getByRole('button', { name: '月末まで →' }).click();
  await page.locator('.meetingContinue').click();
  // Do not let Playwright's click auto-scroll hide a month-navigation bug:
  // the new entry must already sit below the sticky header after the scroll.
  await page.waitForTimeout(600);
  const entryPosition = await page.evaluate(() => ({
    top:document.querySelector('.filters').getBoundingClientRect().top,
    headerBottom:document.querySelector('header').getBoundingClientRect().bottom
  }));
  expect(entryPosition.top).toBeGreaterThanOrEqual(entryPosition.headerBottom);

  await expect(page.locator('.feedPrelude')).toHaveCount(0);
  await expect(page.locator('.currentMonthMarker')).toBeVisible();
  await expect(page.locator('.currentMonthMarker b')).toHaveText('山際の変化と野生動物');
  await expect(page.locator('#feedList .card').first()).toBeVisible();
  // DL-013 / section 22: neither the permanent explanation nor the first-day
  // conversation should return after the first report, including saved May.
  await expect(page.getByRole('heading', { name: 'ADHOMSとは', exact: true })).toHaveCount(0);
  await expect(page.locator('#feedList [data-onboarding]')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.feedPrelude')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'ADHOMSとは', exact: true })).toHaveCount(0);
  await expect(page.locator('#feedList [data-onboarding]')).toHaveCount(0);
  await expect(page.locator('.currentMonthMarker b')).toHaveText('山際の変化と野生動物');
  await page.screenshot({ path: testInfo.outputPath('after-first-report.png') });
  await expect(page.locator('main .title, main .hint')).toHaveCount(0);
  await expect(page.locator('#feedList .post').filter({hasText:'まず「普通の一年」がどう揺れるか'})).toHaveCount(0);

  // The user explicitly retired replay. Saved progress and the live month stay intact.
  await expect(page.locator('#readOpening, .openingTranscript')).toHaveCount(0);
  await expect(page.getByRole('button', {name:'初日の会話を読む',exact:true})).toHaveCount(0);
  const before = await page.evaluate(() => ({state:ADHOMS_LIGHT_STATE,year:S.year,month:S.month,week:S.week,likes:S.likes,minus:S.minus,filter:S.filter}));
  await page.reload();
  expect(await page.evaluate(() => ({state:ADHOMS_LIGHT_STATE,year:S.year,month:S.month,week:S.week,likes:S.likes,minus:S.minus,filter:S.filter}))).toEqual(before);
  await expect(page.locator('#bottomYm')).toHaveText('2029 / 05');
  await expect(page.locator('#feedList [data-onboarding], #readOpening')).toHaveCount(0);

  // The late-trial calendar has a separate month-advance path; its header
  // offset must keep the FEED filters visible across December→January.
  await page.evaluate(() => {
    S.year=5; S.month=12; S.week=4;
    ADHOMS_LIGHT_STATE.year=5; ADHOMS_LIGHT_STATE.month=12;
    updateTop(); renderFeed(); nextMonth();
  });
  await page.waitForTimeout(600);
  const lateEntryPosition = await page.evaluate(() => ({
    top:document.querySelector('.filters').getBoundingClientRect().top,
    headerBottom:document.querySelector('header').getBoundingClientRect().bottom
  }));
  expect(lateEntryPosition.top).toBeGreaterThanOrEqual(lateEntryPosition.headerBottom);
  await expect(page.locator('#readOpening, .openingTranscript')).toHaveCount(0);
});
}
