const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const nextMonth = async page => {
  await page.locator('#toMonthEnd').click();
  await page.locator('.meetingContinue').click();
};
for (const [kind,url] of [
  ['web','http://127.0.0.1:8000/'],
  ['standalone',pathToFileURL(path.join(process.cwd(),'dist/ADHOMS-Ver1.html')).href]
]) {
  test(`${kind}: monthly readers meet Toru before the event and saved choices return through people`, async ({page},testInfo) => {
    // V1-06/07/13, user 2026-09-27 / hub section 23. Real choices and progression.
    await page.setViewportSize({width:390,height:844});
    await page.goto(url);
    await nextMonth(page); // May
    await nextMonth(page); // June
    const repair=page.locator('[data-id="scenario-y1-brine-repair"]');
    await expect(repair).toContainText('透');
    await expect(repair).toContainText('大学');
    await repair.getByRole('button',{name:'＋',exact:true}).click();
    expect(await page.evaluate(()=>S.research)).toEqual([]);
    await page.locator('#toMonthEnd').click();
    await expect(page.locator('.meetingObservations')).toContainText('大学の頃から修理を頼んでる木曽');
    await expect(page.locator('.meetingObservations')).toContainText('来月、スタジオ');
    await page.locator('.meetingContinue').click(); // July
    const brine=page.locator('[data-optional-event="brine"]');
    await expect(brine).toContainText('木曽の大学同級生');
    await expect(brine).toContainText('六月の修理');
    await brine.scrollIntoViewIfNeeded();
    await page.screenshot({path:testInfo.outputPath('brine-relationship.png')});
    await brine.locator('[data-optional-choice="live_test"]').click();
    await nextMonth(page); // August
    await nextMonth(page); // September
    await page.locator('[data-optional-choice="shared_ingredients"]').click();
    await page.locator('#toMonthEnd').click();
    await expect(page.locator('[data-id="scenario-y1-brine-return"]')).toContainText('約束していた小さなライブ');
    await expect(page.locator('.meetingObservations')).toContainText('前の列は手拍子');
    await page.locator('.meetingContinue').click(); // October
    await nextMonth(page); // November
    await page.locator('#nextWeek').click();
    await page.locator('#nextWeek').click();
    await page.locator('#nextWeek').click();
    const followup=page.locator('[data-id="scenario-y1-miso-return"]');
    await expect(followup).toContainText('同じ薬味');
    await expect(followup).not.toContainText('注文が重なったつもり');
    await followup.getByRole('button',{name:'−',exact:true}).click();
    await followup.scrollIntoViewIfNeeded();
    await page.screenshot({path:testInfo.outputPath('miso-followup.png')});
    const before=await page.evaluate(()=>ADHOMS_VER1_DEBUG.state());
    await page.reload();
    await expect(followup).toContainText('同じ薬味');
    await expect(followup.getByRole('button',{name:'−',exact:true})).toHaveAttribute('aria-pressed','true');
    expect(await page.evaluate(()=>ADHOMS_VER1_DEBUG.state())).toEqual(before);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
}
