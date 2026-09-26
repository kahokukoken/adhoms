const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { test, expect } = require('@playwright/test');

const web = 'http://127.0.0.1:8000/';
const standalone = pathToFileURL(path.join(process.cwd(), 'dist/ADHOMS-Ver1.html')).href;

// DL-001: restoring a saved week is not a player advancing time. Checking
// after layout/animation settlement catches the startup jump missed by the
// earlier test, which only checked a click on the week button.
for (const [kind, url] of [['web', web], ['standalone', standalone]]) {
  test(`DL-001 / ${kind}: fresh startup leaves the opening at the top`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url);
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
    await expect(page.locator('.feedPrelude')).toHaveCount(0);
    await expect(page.locator('#feedList .card').first().locator('.who')).toBeInViewport();
    await expect(page.locator('#bottomMn')).toHaveText('第1週');
    // DL-012 refinement, user 2026-09-26 / Notion hub section 21.
    const first = page.locator('#feedList .card').first();
    await expect(first.locator('.who')).toContainText('T-0WA');
    await expect(first.locator('.post')).toHaveText(/^おはようございます、木曽所長。あなたの親愛なるAI、T-0WAです。/);
    await expect(first.locator('.post')).toContainText('ADHOMS');
    await expect(page.getByRole('heading', { name: 'ADHOMSとは', exact: true })).toHaveCount(0);
  });

  test(`DL-001 / ${kind}: saved week does not scroll the opening away on startup`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url);
    await page.locator('#nextWeek').click();
    await expect(page.locator('#bottomMn')).toHaveText('第2週');
    await page.waitForTimeout(600);
    // The explicit week jump is smooth and can still be animating on CI.
    // Establish a settled top-of-page reload input before testing restoration.
    await page.evaluate(() => {
      window.scrollTo({top:0,left:0,behavior:'instant'});
      return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await page.reload();
    await page.waitForTimeout(800);
    await expect(page.locator('#bottomMn')).toHaveText('第2週');
    expect(await page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
    await expect(page.locator('.feedPrelude')).toHaveCount(0);
    await expect(page.locator('#feedList .card').first().locator('.who')).toBeInViewport();
  });
}

test('DL-012 / staff conversation precedes residents and practice weights persist without queuing town research', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(web);
  const cards = page.locator('#feedList .card');
  await expect(cards.first()).toHaveAttribute('data-onboarding', 'true');
  const intro = page.locator('#feedList [data-onboarding="true"]');
  await cards.first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('t0wa-opening.png') });
  const speakers = await intro.locator('.who').allTextContents();
  for (const name of ['藤井 真', '佐伯 直人', '宮下 沙耶', '水野 悠', 'T-0WA']) {
    expect(speakers.some(s => s.includes(name))).toBe(true);
  }
  const order = await cards.evaluateAll(nodes => nodes.map(n => ({ intro: n.dataset.onboarding === 'true', resident: n.classList.contains('resident') })));
  const firstResident = order.findIndex(p => p.resident);
  expect(firstResident).toBeGreaterThan(0);
  expect(order.slice(firstResident).every(p => !p.intro)).toBe(true);

  const practice = intro.filter({ hasText: '佐伯 直人' }).first();
  const id = await practice.getAttribute('data-id');
  await practice.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('staff-conversation.png') });
  await testInfo.attach('staff-conversation', { body: await intro.allTextContents().then(x => x.join('\n\n')), contentType: 'text/plain' });
  await practice.getByRole('button', { name: '＋', exact: true }).click();
  await expect(practice.getByRole('button', { name: '＋', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => S.research)).toEqual([]);
  await practice.getByRole('button', { name: '−', exact: true }).click();
  await page.reload();
  const resumed = page.locator(`[data-id="${id}"]`);
  await expect(resumed.getByRole('button', { name: '−', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(resumed.getByRole('button', { name: '＋', exact: true })).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => S.research)).toEqual([]);
  await resumed.getByRole('button', { name: '⌕ 詳細', exact: true }).click();
  await expect(page.locator('#sheetBody')).toContainText('佐伯 直人');
  await page.locator('#ov .close').click();
  await page.locator('#toMonthEnd').click();
  await page.locator('.meetingContinue').click();
  await expect(page.locator('#feedList [data-onboarding]')).toHaveCount(0);
  await page.evaluate(() => { S.year = 2; S.month = 4; S.week = 1; renderFeed(); });
  await expect(page.locator('#feedList [data-onboarding]')).toHaveCount(0);
});
