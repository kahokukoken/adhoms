const {test,expect}=require('@playwright/test');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
// DL-007/008/014/016: displayed state and retained history must share authority.
for(const route of ['web','standalone']){
 const url=route==='web'?'http://127.0.0.1:8000/':pathToFileURL(path.resolve('dist/ADHOMS-Ver1.html')).href;
 test(`${route}: Year 3 propagation synchronizes the visible canonical trust before reload`,async({page})=>{
  await page.goto(url);
  await page.evaluate(()=>{const st=ADHOMS_VER1_EVENTS.resolveChoice(ADHOMS_LIGHT_STATE,'y2_flood','hard_warning');st.year=2;st.month=3;ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate',st);});
  await page.reload();await page.evaluate(()=>nextMonth());
  await expect(page.locator('#ver1Choice')).toContainText('YEAR 3 / SIDE EFFECTS');
  const values=await page.evaluate(()=>({canonical:35+ADHOMS_LIGHT_STATE.town.trust*12,visible:S.trust,text:document.querySelector('#ct').textContent}));
  expect(values.visible).toBe(values.canonical);expect(Number(values.text)).toBe(values.canonical);
  await page.reload();expect(await page.locator('#ct').textContent()).toBe(values.text);
 });
 test(`${route}: closing epilogue retains outcomes and never restarts the final event`,async({page})=>{
  await page.goto(url);
  await page.evaluate(()=>{const st=ADHOMS_LIGHT_STATE;st.year=5;st.month=3;st.flags['directive:4:ack']=true;ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate',st);const session=ADHOMS_VER1_FINAL.finalize(ADHOMS_VER1_FINAL.createSession(st));ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession',{sessionId:ADHOMS_VER1_SESSION.id,stage:'epilogue',session});});
  await page.reload();const before=await page.evaluate(()=>ADHOMS_VER1_DEBUG.final().session.result);
  await page.locator('#v1epclose').click();
  expect(await page.evaluate(()=>ADHOMS_VER1_DEBUG.final()?.session.result)).toEqual(before);
  expect(await page.evaluate(()=>ADHOMS_CONTINUITY.render('{{recovery}}',5,3))).toContain('高倉味噌店の大きな損失');
  await page.reload();await expect(page.locator('#ver1Choice')).not.toHaveClass(/on/);
  await page.evaluate(()=>nextMonth());
  expect(await page.evaluate(()=>({year:ADHOMS_LIGHT_STATE.year,month:ADHOMS_LIGHT_STATE.month}))).toEqual({year:5,month:3});
  expect(await page.evaluate(()=>ADHOMS_VER1_DEBUG.final()?.session.result)).toEqual(before);
  await expect(page.locator('#ver1Choice')).not.toHaveClass(/on/);
 });
 test(`${route}: legacy completed saves without a final record do not restart the disaster`,async({page})=>{
  await page.goto(url);
  await page.evaluate(()=>{const st=ADHOMS_LIGHT_STATE;st.year=5;st.month=3;st.flags['directive:4:ack']=true;ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate',st);localStorage.removeItem('adhoms.ver1.finalsession');});
  await page.reload();await page.evaluate(()=>nextMonth());
  expect(await page.evaluate(()=>({year:ADHOMS_LIGHT_STATE.year,month:ADHOMS_LIGHT_STATE.month}))).toEqual({year:5,month:3});
  expect(await page.evaluate(()=>ADHOMS_VER1_DEBUG.final())).toBeNull();
 });
 test(`${route}: incomplete complete record stays terminal without inventing a result`,async({page})=>{
  await page.goto(url);
  await page.evaluate(()=>{const st=ADHOMS_LIGHT_STATE;st.year=5;st.month=3;st.flags['directive:4:ack']=true;ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate',st);ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession',{sessionId:ADHOMS_VER1_SESSION.id,stage:'complete',session:{}});});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.reload();await page.waitForTimeout(100);
  expect(await page.evaluate(()=>ADHOMS_VER1_DEBUG.final()?.stage)).toBe('complete');
  expect(await page.evaluate(()=>ADHOMS_VER1_DEBUG.final()?.session.result)).toBeUndefined();
  await expect(page.locator('#ver1Choice')).not.toHaveClass(/on/);expect(errors).toEqual([]);
 });
 test(`${route}: evacuation risk alone cannot establish a hospital setting`,async({page})=>{
  await page.goto(url);
  await page.evaluate(()=>{const st=ADHOMS_LIGHT_STATE;st.year=5;st.month=3;ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate',st);const session=ADHOMS_VER1_FINAL.finalize(ADHOMS_VER1_FINAL.createSession(st));session.result.people.towa.status='critical';session.result.livelihoodContinuity=60;ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession',{sessionId:ADHOMS_VER1_SESSION.id,stage:'private',session});});
  await page.reload();await expect(page.locator('#ver1Choice')).toContainText('PRIVATE CONVERSATION');
  await expect(page.locator('#ver1Choice')).not.toContainText('病院');
  await expect(page.locator('#ver1Choice')).toContainText('復旧現場脇の仮設休憩所');
 });
}
