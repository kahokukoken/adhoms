const {test,expect}=require('@playwright/test');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const next=async page=>{
  await page.locator('#toMonthEnd').click();
  await page.locator('.meetingContinue').click();
};
for(const [kind,url] of [
  ['web','http://127.0.0.1:8000/'],
  ['standalone',pathToFileURL(path.join(process.cwd(),'dist/ADHOMS-Ver1.html')).href]
]){
  test(`${kind}: month-only reading preserves introductions and advances unresolved creative scenes`,async({page},testInfo)=>{
    // V1-03/06/07/13; hub section 25. Normal progression, no debug calendar jumps.
    await page.setViewportSize({width:390,height:844});
    await page.goto(url);
    await expect(page.locator('#feedList')).toContainText('高倉 千尋');
    await page.locator('#toMonthEnd').click();
    const catchup=page.locator('.meetingCatchup');
    await expect(catchup).toContainText('柴垣 岳');
    await expect(catchup).toContainText('幼馴染');
    const initial=await catchup.innerText();
    await page.reload();
    await expect(catchup).toHaveText(initial);
    // A pending meeting from before this field existed must still catch up.
    // Do this after pagehide has saved the old page, before the new app restores.
    await page.addInitScript(()=>{
      const saved=JSON.parse(localStorage.getItem('adhoms.ver1.daily.v1'));
      if(saved?.calendar.month===4&&saved.meeting){
        delete saved.ui.meetingEntryWeek;
        localStorage.setItem('adhoms.ver1.daily.v1',JSON.stringify(saved));
      }
    });
    await page.reload();
    await expect(catchup).toHaveText(initial);
    await catchup.scrollIntoViewIfNeeded();
    await page.screenshot({path:testInfo.outputPath('monthly-introductions.png')});
    await page.locator('.meetingContinue').click(); // May
    await page.locator('#toMonthEnd').click();
    await expect(catchup).toContainText('宮下 湊');
    await page.locator('.meetingContinue').click(); // June
    await page.locator('#toMonthEnd').click();
    await expect(catchup).toContainText('久保田 蓮');
    const weeks=await catchup.locator('blockquote').evaluateAll(ns=>ns.map(n=>Number(n.dataset.week)));
    expect(weeks).toEqual([...weeks].sort((a,b)=>a-b));
    await page.locator('.meetingContinue').click(); // July
    const brine=page.locator('[data-optional-event="brine"]');
    const original=await brine.locator('.ver1OptionalProcess').innerText();
    await next(page); // August, still unresolved
    await expect(brine.locator('.ver1OptionalProcess')).not.toHaveText(original);
    await expect(brine.locator('.ver1OptionalLine')).toHaveCount(2);
    await expect(brine.locator('[data-optional-choice]')).toHaveCount(3);
    await page.reload();
    await expect(brine.locator('.ver1OptionalLine')).toHaveCount(2);
    await next(page); // September
    const miso=page.locator('[data-optional-event="miso"]');
    const originalMiso=await miso.locator('.ver1OptionalProcess').innerText();
    await next(page); // October, still unresolved
    await expect(miso.locator('.ver1OptionalProcess')).not.toHaveText(originalMiso);
    await expect(miso.locator('.ver1OptionalLine')).toHaveCount(2);
    await expect(miso.locator('[data-optional-choice]')).toHaveCount(3);
    await next(page); // November
    await page.locator('#toMonthEnd').click();
    await expect(catchup).toContainText('円形');
    const names=await catchup.locator('blockquote b').allTextContents();
    expect(names.findIndex(t=>t.includes('久保田'))).toBeLessThan(names.findIndex(t=>t.includes('柴垣')));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test(`${kind}: weekly readers reach the meeting without replaying delivered posts and choices stay single`,async({page},testInfo)=>{
    await page.setViewportSize({width:390,height:844});
    await page.goto(url);
    for(let i=0;i<3;i++)await page.locator('#nextWeek').click();
    await page.locator('#toMonthEnd').click();
    await expect(page.locator('.meetingObservations blockquote:visible')).toHaveCount(0);
    const archive=page.locator('.meetingReadPosts');
    await expect(archive).not.toHaveAttribute('open','');
    await page.reload();
    await expect(page.locator('.meetingObservations blockquote:visible')).toHaveCount(0);
    await archive.locator('summary').click();
    await expect(archive.locator('blockquote').first()).toBeVisible();
    await page.locator('.meetingContinue').click(); // May
    await page.locator('#nextWeek').click(); // May week 2: Minato has arrived.
    await page.locator('#toMonthEnd').click();
    await expect(page.locator('.meetingCatchup')).not.toContainText('宮下 湊');
    await expect(page.locator('.meetingReadPosts')).toContainText('宮下 湊');
    const partial=await page.locator('.meetingCatchup').innerText();
    await page.reload();
    await expect(page.locator('.meetingCatchup')).toHaveText(partial);
    await page.locator('.meetingContinue').click(); // June
    await next(page); // July
    await page.locator('[data-optional-choice="live_test"]').click();
    await next(page); // August
    const brine=page.locator('[data-optional-event="brine"]');
    await expect(brine).toContainText('記録済み');
    await expect(brine.locator('.ver1OptionalLine')).toHaveCount(2);
    await expect(brine.locator('[data-optional-choice]')).toHaveCount(0);
    const state=await page.evaluate(()=>ADHOMS_VER1_DEBUG.state());
    await page.reload();
    expect(await page.evaluate(()=>ADHOMS_VER1_DEBUG.state())).toEqual(state);
    await brine.scrollIntoViewIfNeeded();
    await page.screenshot({path:testInfo.outputPath('brine-august-continuation.png')});
    await next(page); // September
    await page.locator('[data-optional-choice="shared_ingredients"]').click();
    await next(page); // October
    const miso=page.locator('[data-optional-event="miso"]');
    await expect(miso).toContainText('記録済み');
    await expect(miso.locator('.ver1OptionalLine')).toHaveCount(2);
    await expect(miso.locator('[data-optional-choice]')).toHaveCount(0);
    await miso.scrollIntoViewIfNeeded();
    await page.screenshot({path:testInfo.outputPath('miso-october-continuation.png')});
    expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.memories.filter(m=>m.id==='optional_miso_soba').length)).toBe(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
}
