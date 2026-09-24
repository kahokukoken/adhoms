const { test, expect } = require('@playwright/test');
const URL = 'http://127.0.0.1:8000/';

test('V1-03 / weekly advance delivers new observations and retains earlier ones', async ({ page }) => {
  await page.goto(URL);
  const cards = page.locator('#feedList .card[data-id]');
  const firstIds = await cards.evaluateAll(nodes => nodes.map(n => n.dataset.id));
  await page.getByRole('button', { name: '1週進む →', exact: true }).click();
  const secondIds = await cards.evaluateAll(nodes => nodes.map(n => n.dataset.id));
  expect(secondIds.filter(id => !firstIds.includes(id)).length).toBeGreaterThanOrEqual(2);
  expect(secondIds).toEqual(expect.arrayContaining(firstIds));
  await expect(page.locator('#feedList .replyto').first()).toBeVisible();
});

test('V1-05 / monthly observation preserves priorities; quarter review is optional', async ({ page }) => {
  await page.goto(URL);
  const before = await page.evaluate(() => ({ ...S.values }));
  for (let month = 4; month <= 6; month++) {
    await page.getByRole('button', { name: '月末まで →', exact: true }).click();
    if (month < 6) {
      await expect(page.locator('#meeting input[type=range]')).toHaveCount(0);
    } else {
      await expect(page.locator('.quarterlyReview')).toBeVisible();
      await expect(page.locator('.quarterlyReview input').first()).toBeHidden();
    }
    await expect(page.locator('.meetingObservations')).toBeVisible();
    await page.locator('.meetingContinue').click();
  }
  expect(await page.evaluate(() => S.values)).toEqual(before);
  await expect(page.locator('#bottomYm')).toHaveText('2029 / 07');
});

test('V1-13 / reload restores week, weighted post and unfinished monthly review', async ({ page }) => {
  await page.goto(URL);
  await page.getByRole('button', { name: '1週進む →', exact: true }).click();
  const post = page.locator('#feedList .card[data-id]').first();
  const id = await post.getAttribute('data-id');
  await post.getByRole('button', { name: '＋', exact: true }).click();
  await page.reload();
  await expect(page.locator('#bottomMn')).toHaveText('第2週');
  await expect(page.locator(`[data-id="${id}"]`).getByRole('button', { name: '＋', exact: true })).toHaveClass(/on/);
  await page.getByRole('button', { name: '月末まで →', exact: true }).click();
  await page.reload();
  await expect(page.locator('#meeting')).toHaveClass(/on/);
  await page.locator('.meetingContinue').click();
  await page.reload();
  await expect(page.locator('#bottomYm')).toHaveText('2029 / 05');
  await expect(page.locator('#meeting')).not.toHaveClass(/on/);
});

test('V1-12 / mobile reading flow fits the viewport with readable text', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(URL);
  await page.screenshot({ path: testInfo.outputPath('mobile-opening.png') });
  expect(await page.locator('.post').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  expect(await page.locator('.profileLine').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(13);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.locator('#feedList .card').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('mobile-feed.png') });
  await page.getByRole('button', { name: '月末まで →', exact: true }).click();
  await page.locator('.meetingThread').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('mobile-conversation.png') });
  await testInfo.attach('monthly-conversation', { body: await page.locator('#meetingBody').innerText(), contentType:'text/plain' });
  expect(await page.locator('.meetingLine').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  await page.locator('.meetingContinue').click();
  await expect(page.locator('#bottomYm')).toHaveText('2029 / 05');
  expect(errors).toEqual([]);
});

test('V1-13 / unfinished quarterly edits resume and commit once', async ({ page }) => {
  await page.goto(URL);
  for(let i=0;i<2;i++){
    await page.getByRole('button', { name:'月末まで →', exact:true }).click();
    await page.locator('.meetingContinue').click();
  }
  await page.getByRole('button', { name:'月末まで →', exact:true }).click();
  await page.locator('.quarterlyReview summary').click();
  const priority=page.locator('.monthlyValues input[data-k="life"]');
  await priority.fill('80');
  await page.reload();
  await expect(priority).toHaveValue('80');
  expect(await page.evaluate(()=>S.values.life)).toBe(70);
  await page.locator('.meetingContinue').click();
  await page.reload();
  expect(await page.evaluate(()=>S.values.life)).toBe(80);
  await expect(page.locator('#bottomYm')).toHaveText('2029 / 07');
});

test('V1-13 / festival transition retains routine state and completed July meeting', async ({ page }) => {
  await page.goto(URL);
  // Prepare the boundary, then exercise the real month-end and reload route.
  await page.evaluate(()=>{
    S.year=5; S.month=7; S.week=4; S.pop=7998; S.life=66; S.fisc=43;
    ADHOMS_LIGHT_STATE.year=5; ADHOMS_LIGHT_STATE.month=7;
    localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(ADHOMS_LIGHT_STATE));
    updateTop(); renderFeed();
  });
  await page.getByRole('button',{ name:'月末まで →',exact:true }).click();
  await page.locator('.meetingContinue').click();
  await expect(page.locator('#ver1Choice')).toContainText('FINAL DAY / 朝');
  await expect(page.locator('#bottomYm')).toHaveText('2033 / 08');
  expect(await page.evaluate(()=>({pop:S.pop,life:S.life,fisc:S.fisc,july:S.meetingDone['5-7']}))).toEqual({pop:7998,life:66,fisc:43,july:true});
});


test('V1-06 / year-one story beats introduce people, life nodes and future seeds without leaking into later years', async ({ page }) => {
  await page.goto(URL);

  await page.evaluate(() => { S.week = 4; updateTop(); renderFeed(); });
  const april = page.locator('#feedList [data-story-beat="true"]');
  await expect(april).toContainText(['高倉 千尋', '柴垣 岳']);
  await expect(april).toContainText('幼馴染');

  await page.evaluate(() => {
    S.year = 1; S.month = 5; S.week = 4;
    ADHOMS_LIGHT_STATE.year = 1; ADHOMS_LIGHT_STATE.month = 5;
    updateTop(); renderFeed();
  });
  const may = page.locator('#feedList [data-story-beat="true"]');
  await expect(may).toContainText('宮下 湊');
  await expect(may).toContainText('フィールドラボ');
  await expect(may).toContainText('工場・物流');

  await page.evaluate(() => {
    S.year = 1; S.month = 11; S.week = 4;
    ADHOMS_LIGHT_STATE.year = 1; ADHOMS_LIGHT_STATE.month = 11;
    updateTop(); renderFeed();
  });
  const november = page.locator('#feedList [data-story-beat="true"]');
  await expect(november).toContainText('久保田 蓮');
  await expect(november).toContainText('円形マット');
  await expect(november).toContainText('ENJIN原型');

  await page.evaluate(() => {
    S.year = 2; S.month = 3; S.week = 4;
    ADHOMS_LIGHT_STATE.year = 1; ADHOMS_LIGHT_STATE.month = 3;
    updateTop(); renderFeed();
  });
  const march = page.locator('#feedList [data-story-beat="true"]');
  await expect(march).toContainText('TOWA');
  await expect(march).toContainText('生物多様性');

  await page.evaluate(() => {
    S.year = 2; S.month = 4; S.week = 4;
    ADHOMS_LIGHT_STATE.year = 2; ADHOMS_LIGHT_STATE.month = 4;
    updateTop(); renderFeed();
  });
  await expect(page.locator('#feedList [data-story-beat="true"]')).toHaveCount(0);
});
