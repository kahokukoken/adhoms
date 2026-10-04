const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const sources = ['scenario-0-0', 'scenario-0-1', 'scenario-0-2'];
for (const [kind, url] of [
  ['web', 'http://127.0.0.1:8000/'],
  ['standalone', pathToFileURL(path.join(process.cwd(), 'dist/ADHOMS-Ver1.html')).href]
]) {
  // User 2026-09-26 / hub section 22; DL-005, V1-03/11/13.
  test(`${kind}: several observations produce one report in FEED and meeting`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width:390, height:844 });
    await page.goto(url);
    for (const id of sources) {
      await page.locator(`[data-id="${id}"]`).getByRole('button', { name:'＋', exact:true }).click();
    }
    expect(await page.evaluate(() => S.research.length)).toBe(1);
    expect(await page.evaluate(() => S.research[0].sourceIds)).toEqual(sources);
    // Removing and restoring a source weight does not create another task.
    const plus = page.locator(`[data-id="${sources[1]}"]`).getByRole('button', { name:'＋', exact:true });
    await plus.click();
    await plus.click();
    await page.reload();
    expect(await page.evaluate(() => S.research.length)).toBe(1);
    expect(await page.evaluate(() => S.research[0].sourceIds)).toEqual(sources);
    for (const id of sources) expect(await page.evaluate(id => S.likes[id], id)).toBe(true);

    await page.getByRole('button', { name:'月末まで →', exact:true }).click();
    await page.locator('.meetingContinue').click();
    await expect(page.locator('#bottomYm')).toHaveText('2029 / 05');
    const report = page.locator('#feedList [data-research-beat]');
    await expect(report).toHaveCount(1);
    await report.getByRole('button', { name:'＋', exact:true }).click();
    const body = await report.locator('.post').textContent();
    expect(await page.evaluate(() => S.research.length)).toBe(1);
    await page.screenshot({ path:testInfo.outputPath('single-research-feed.png') });
    await page.getByRole('button', { name:'月末まで →', exact:true }).click();
    await expect(page.locator('.meetingObservations blockquote').filter({ hasText:body })).toHaveCount(1);
    await page.screenshot({ path:testInfo.outputPath('single-research-meeting.png') });
    await page.reload();
    await expect(page.locator('#meeting')).toHaveClass(/on/);
    await expect(page.locator('.meetingObservations blockquote').filter({ hasText:body })).toHaveCount(1);
    await expect(page.locator('#feedList [data-research-beat]')).toHaveCount(1);
  });

  test(`${kind}: legacy duplicate saves consolidate without losing progress or distinct research`, async ({ page }) => {
    await page.goto(url);
    await page.locator(`[data-id="${sources[0]}"]`).getByRole('button', { name:'＋', exact:true }).click();
    await page.getByRole('button', { name:'月末まで →', exact:true }).click();
    await page.locator('.meetingContinue').click();
    const before = await page.evaluate(ids => {
      const { completedMonth, sourceIds, reportKey, ...base } = S.research[0];
      // Mix pre-completion and completed legacy records. Later periods and
      // genuinely different reports must survive this migration.
      S.research = [
        { ...base, id:ids[0], done:false },
        { ...base, id:ids[1], done:true, completedMonth:1 },
        { ...base, id:ids[2], done:true, completedMonth:1 },
        { ...base, id:'another-topic', topic:'別の調査テーマ', result:'異なる調査の報告', done:true, completedMonth:1 },
        { ...base, id:'next-year', due:13, done:false },
        { ...base, id:ids[0], result:'追加の条件を確認した別報告', done:true, completedMonth:1 }
      ];
      ids.forEach(id => S.likes[id]=true);
      S.minus['research-'+ids[2]+'-1']=true;
      S.books['research-'+ids[2]+'-1']=true;
      document.dispatchEvent(new Event('change', { bubbles:true }));
      return { state:ADHOMS_LIGHT_STATE, year:S.year, month:S.month, week:S.week, meetingDone:S.meetingDone };
    }, sources);
    await page.reload();
    expect(await page.evaluate(() => ({ state:ADHOMS_LIGHT_STATE, year:S.year, month:S.month, week:S.week, meetingDone:S.meetingDone }))).toEqual(before);
    const records = await page.evaluate(() => S.research);
    expect(records).toHaveLength(4);
    expect(records[0]).toMatchObject({ sourceIds:sources, completedMonth:1, done:true });
    expect(records.find(x => x.id==='next-year')).toMatchObject({ due:13, done:false });
    for (const id of sources) expect(await page.evaluate(id => S.likes[id], id)).toBe(true);
    const canonical = 'research-'+sources[0]+'-1';
    await expect(page.locator(`[data-id="${canonical}"]`).getByRole('button', { name:'−', exact:true })).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(id => S.books[id], canonical)).toBe(true);
    await expect(page.locator('#feedList [data-research-beat]')).toHaveCount(3);
    await page.evaluate(() => { renderFeed(); renderFeed(); });
    await expect(page.locator('#feedList [data-research-beat]')).toHaveCount(3);
    await page.getByRole('button', { name:'月末まで →', exact:true }).click();
    await expect(page.locator('.meetingObservations blockquote').filter({ hasText:records[0].result })).toHaveCount(1);
    await page.reload();
    expect(await page.evaluate(() => S.research)).toEqual(records);
    await expect(page.locator('.meetingObservations blockquote').filter({ hasText:records[0].result })).toHaveCount(1);
  });
}
