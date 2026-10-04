const {test,expect}=require('@playwright/test');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
for(const [kind,url] of [['web','http://127.0.0.1:8000/'],['standalone',pathToFileURL(path.resolve('dist/ADHOMS-Ver1.html')).href]]){
 test(`${kind}: monthly meeting keeps context and progress without repeating annual framing`,async({page})=>{
  await page.goto(url);await page.locator('#toMonthEnd').click();
  await expect(page.locator('.meetingPrelude')).toHaveCount(1);
  await page.locator('.meetingContinue').click();await page.locator('#toMonthEnd').click();
  await expect(page.locator('.meetingPrelude')).toHaveCount(0);
  await expect(page.locator('.meetingContext')).toBeInViewport();
  const text=await page.locator('.meetingThread').innerText();await page.reload();
  await expect(page.locator('.meetingThread')).toHaveText(text,{useInnerText:true});
  await expect(page.locator('.meetingPrelude')).toHaveCount(0);
  await page.locator('.meetingContinue').click();await expect(page.locator('#bottomYm')).toHaveText('2029 / 06');
 });
 test(`${kind}: direct month-end preserves separate actor response paragraphs and original saved record`,async({page})=>{
  await page.goto(url);await page.evaluate(()=>{
   let st=ADHOMS_VER1_STATE.createInitialState();st.year=4;st.month=4;st.town.legitimacy=3;st.relations.factory_logistics=2;st.relations.technical_lab=2;
   st=ADHOMS_VER1_PROPAGATION.resolveYear4Strategy(st,'deepen').state;
   st.proposals.y4_strategy.response.index=36;st.proposals.y4_strategy.response.week=2;
   st.sessionId=ADHOMS_VER1_SESSION.id;ADHOMS_LIGHT_STATE=st;S.year=4;S.month=4;S.week=1;S.meetingEntry=null;renderFeed();
  });
  const before=await page.evaluate(()=>JSON.stringify(ADHOMS_LIGHT_STATE.proposals.y4_strategy.response));
  await page.locator('#toMonthEnd').click();
  const quote=page.locator('.meetingCatchup blockquote').filter({hasText:'関係担当からの返事'}).locator('p');
  expect(await quote.evaluate(el=>getComputedStyle(el).whiteSpace)).toBe('pre-line');
  const text=await quote.textContent();expect(text.split('他の組織や住民にも従うよう求める返答ではない。')).toHaveLength(2);
  expect(text.split('\n\n').length).toBeGreaterThan(2);
  expect(await page.evaluate(()=>JSON.stringify(ADHOMS_LIGHT_STATE.proposals.y4_strategy.response))).toBe(before);
 });
 for(const width of [320,390])test(`${kind}: final resource explanations remain readable at ${width}px`,async({page},testInfo)=>{
  await page.setViewportSize({width,height:844});await page.goto(url);await page.evaluate(()=>showEnding());
  const panel=page.locator('#ver1Choice .ver1Capability');await expect(panel).toBeVisible();
  expect(await panel.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  await panel.scrollIntoViewIfNeeded();await page.screenshot({path:testInfo.outputPath(`resources-${width}.png`)});
  await page.reload();await expect(panel).toBeVisible();
  expect(await panel.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
 });
}
