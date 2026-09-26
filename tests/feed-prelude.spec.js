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

  await expect(page.locator('.feedPrelude')).toBeVisible();
  await expect(page.locator('.currentMonthMarker')).toBeVisible();
  await expect(page.locator('main .title, main .hint')).toHaveCount(0);
  await expect(page.locator('#feedList .post').filter({hasText:'まず「普通の一年」がどう揺れるか'})).toHaveCount(0);

  await page.getByRole('button', { name: '月末まで →' }).click();
  await page.locator('.meetingContinue').click();
  // Do not let Playwright's click auto-scroll hide a month-navigation bug:
  // the new entry must already sit below the sticky header after the scroll.
  await page.waitForTimeout(600);
  const entryPosition = await page.evaluate(() => ({
    top:document.getElementById('readOpening').getBoundingClientRect().top,
    headerBottom:document.querySelector('header').getBoundingClientRect().bottom
  }));
  expect(entryPosition.top).toBeGreaterThanOrEqual(entryPosition.headerBottom);

  await expect(page.locator('.feedPrelude')).toBeHidden();
  await expect(page.locator('.currentMonthMarker')).toBeVisible();
  await expect(page.locator('.currentMonthMarker b')).toHaveText('山際の変化と野生動物');
  await expect(page.locator('#feedList .card').first()).toBeVisible();
  // DL-011 / section 19: neither the permanent explanation nor the first-day
  // conversation should return after the first report, including saved May.
  await expect(page.getByRole('heading', { name: 'ADHOMSとは', exact: true })).toHaveCount(0);
  await expect(page.locator('#feedList [data-onboarding]')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.feedPrelude')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'ADHOMSとは', exact: true })).toHaveCount(0);
  await expect(page.locator('#feedList [data-onboarding]')).toHaveCount(0);
  await expect(page.locator('.currentMonthMarker b')).toHaveText('山際の変化と野生動物');
  await page.screenshot({ path: testInfo.outputPath('after-first-report.png') });
  await expect(page.locator('main .title, main .hint')).toHaveCount(0);
  await expect(page.locator('#feedList .post').filter({hasText:'まず「普通の一年」がどう揺れるか'})).toHaveCount(0);

  // User screenshot 2026-09-26: the saved May calendar hid the April-only
  // introduction. Rereading must be reachable without resetting that save.
  const before = await page.evaluate(() => ({state:ADHOMS_LIGHT_STATE,year:S.year,month:S.month,week:S.week,likes:S.likes,minus:S.minus,filter:S.filter}));
  await page.getByRole('button', {name:'初日の会話を読む',exact:true}).click();
  const transcript = page.locator('.openingTranscript');
  await expect(transcript).toBeVisible();
  await expect(transcript.locator('.card').first().locator('.who')).toContainText('T-0WA');
  await expect(transcript.locator('.post').first()).toHaveText(/^おはようございます、木曽所長。あなたの親愛なるAI、T-0WAです。/);
  await expect(transcript.locator('.card')).toHaveCount(9);
  await expect(transcript.locator('.acts, .newtag')).toHaveCount(0);
  await page.screenshot({ path:testInfo.outputPath('saved-may-opening-transcript.png') });
  await transcript.getByRole('button', {name:'現在のFEEDへ戻る',exact:true}).click();
  expect(await page.evaluate(() => ({state:ADHOMS_LIGHT_STATE,year:S.year,month:S.month,week:S.week,likes:S.likes,minus:S.minus,filter:S.filter}))).toEqual(before);
  await page.reload();
  await expect(page.locator('#bottomYm')).toHaveText('2029 / 05');
  await expect(page.locator('#feedList [data-onboarding]')).toHaveCount(0);

  // The late-trial calendar has a separate month-advance path; its header
  // offset must keep the same reread entry reachable across December→January.
  await page.evaluate(() => {
    S.year=5; S.month=12; S.week=4;
    ADHOMS_LIGHT_STATE.year=5; ADHOMS_LIGHT_STATE.month=12;
    updateTop(); renderFeed(); nextMonth();
  });
  await page.waitForTimeout(600);
  const lateEntryPosition = await page.evaluate(() => ({
    top:document.getElementById('readOpening').getBoundingClientRect().top,
    headerBottom:document.querySelector('header').getBoundingClientRect().bottom
  }));
  expect(lateEntryPosition.top).toBeGreaterThanOrEqual(lateEntryPosition.headerBottom);
});
}
