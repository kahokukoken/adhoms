const {test,expect}=require('@playwright/test');
const URL='http://127.0.0.1:8000/';
async function nextMonth(page){await page.locator('#toMonthEnd').click();await page.locator('.meetingContinue').click();}

test('DL020 opening explains participant decision support before the first problem',async({page})=>{
 await page.goto(URL);
 const opening=page.locator('[data-onboarding="true"] .post');
 await expect(opening.nth(0)).toContainText('関係性の最適化');
 await expect(opening.nth(0)).toContainText('本人');
 await expect(opening.nth(1)).toContainText('手伝える');
 await expect(opening.nth(1)).toContainText('返事');
});

test('bus proposal is pending without capability gain; participant reply and continuation differ by choice',async({browser})=>{
 const results=[];
 for(const choice of ['coordinate_days','ask_timetable']){
  const page=await browser.newPage();await page.goto(URL);
  const post=page.locator('#feedList .card').filter({hasText:'朝のバスのことで相談です'}).first();
  await post.getByRole('button',{name:'＋',exact:true}).click();await nextMonth(page);
  const report=page.locator('[data-support-case="bus"]');await expect(report).toContainText('8時5分');
  await report.getByRole('button',{name:'⌕ 詳細',exact:true}).click();
  await page.locator(`[data-support-choice="${choice}"]`).click();
  const before=await page.evaluate(()=>({s:structuredClone(ADHOMS_LIGHT_STATE),ordinal:monthIndex()*4+S.week}));
  expect(before.s.supportCases.bus.status).toBe('proposed');
  await page.reload();expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.supportCases.bus.status)).toBe('proposed');
  await page.locator('#nextWeek').click();
  const after=await page.evaluate(()=>structuredClone(ADHOMS_LIGHT_STATE));
  expect(after.town).toEqual(before.s.town);expect(after.relations).toEqual(before.s.relations);
  expect(after.supportCases.bus.response.status).toBe(choice==='coordinate_days'?'accepted_limited':'unavailable');
  const reply=page.locator('[data-support-reply="bus"]');await expect(reply).toBeVisible();
  await reply.scrollIntoViewIfNeeded();
  results.push(await reply.locator(".post").innerText());
  expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.memories.filter(m=>m.id==='support_bus_reply').length)).toBe(1);
  await page.reload();expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.memories.filter(m=>m.id==='support_bus_reply').length)).toBe(1);
  await nextMonth(page);await expect(page.locator('[data-support-continuation="bus"]')).toContainText(choice==='coordinate_days'?'曜日':'時刻変更');
  await page.close();
 }
 expect(results[0]).not.toEqual(results[1]);
});

test('month-only route receives a participant reply without another mandatory modal',async({page})=>{
 await page.goto(URL);await nextMonth(page);
 await page.locator('[data-support-case="bus"]').getByRole('button',{name:'⌕ 詳細',exact:true}).click();
 await page.locator('[data-support-choice="coordinate_days"]').click();
 await page.locator('#toMonthEnd').click();
 await expect(page.locator('.meetingCatchup')).toContainText('毎日の当番');
 expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.supportCases.bus.response.status)).toBe('accepted_limited');
 await page.locator('.meetingContinue').click();await expect(page.locator('#bottomYm')).toHaveText('2029 / 06');
});

test('render and no-proposal route never fabricate player action or participant consent',async({page})=>{
 await page.goto(URL);await nextMonth(page);
 const before=await page.evaluate(()=>JSON.stringify(ADHOMS_LIGHT_STATE));
 await page.evaluate(()=>{renderFeed();renderFeed();});
 expect(await page.evaluate(()=>JSON.stringify(ADHOMS_LIGHT_STATE))).toBe(before);
 await nextMonth(page);
 expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.supportCases?.bus)).toBeUndefined();
 await expect(page.locator('[data-support-continuation="bus"]')).toHaveCount(0);
});

test('year2 effects wait for an actor reply on real progression, then FEED reports accepted limits',async({page})=>{
 await page.goto(URL);await page.evaluate(()=>{ADHOMS_LIGHT_STATE.year=2;ADHOMS_LIGHT_STATE.month=6;ADHOMS_LIGHT_STATE.flags['seen:y2_flood']=true;localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(ADHOMS_LIGHT_STATE));});await page.reload();
 const before=await page.evaluate(()=>structuredClone(ADHOMS_LIGHT_STATE.town));
 await page.locator('[data-c="guided_watch"]').click();
 expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.proposals.y2_flood.status)).toBe('proposed');
 expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.town)).toEqual(before);
 await page.reload();await expect(page.locator('#ver1Choice')).not.toHaveClass(/on/);
 await page.locator('#toMonthEnd').click();
 expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.proposals.y2_flood.status)).toBe('accepted');
 await expect(page.locator('.meetingCatchup')).toContainText('返事');
 expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.flags['y2_flood:guided_watch'])).toBe(true);
});

test('year3 selected revisit returns different actor information without free recovery',async({browser})=>{
 const replies=[];
 for(const choice of ['burden','cooperation']){
  const page=await browser.newPage();await page.goto(URL);
  await page.evaluate(()=>{ADHOMS_LIGHT_STATE=ADHOMS_VER1_EVENTS.resolveChoice(ADHOMS_LIGHT_STATE,'y2_snow','trunk_first');ADHOMS_LIGHT_STATE.year=3;ADHOMS_LIGHT_STATE.month=4;ADHOMS_LIGHT_STATE.flags.y3_seen=true;localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(ADHOMS_LIGHT_STATE));});await page.reload();
  await page.locator(`[data-revisit="${choice}"]`).click();
  await page.locator('#v1directive').click();
  const before=await page.evaluate(()=>structuredClone(ADHOMS_LIGHT_STATE.town));
  await page.locator('#nextWeek').click();
  const reply=page.locator('[data-support-reply="spillover"]');await expect(reply).toBeVisible();await reply.scrollIntoViewIfNeeded();replies.push(await reply.locator(".post").innerText());
  expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.town)).toEqual(before);await page.close();
 }
 expect(replies[0]).not.toEqual(replies[1]);
});

test('final decisions record the actual responsible actor and agreement scope without changing fixed outcomes',async({page})=>{
 await page.goto(URL);
 const result=await page.evaluate(()=>{
  const f=ADHOMS_VER1_FINAL;let session=f.createSession(ADHOMS_VER1_STATE.createInitialState());
  session=f.applyDecision(session,'towa_schedule','cancel');
  return session.actionResponses?.towa_schedule;
 });
 expect(result).toEqual(expect.objectContaining({actorId:'towa_organizer',status:'accepted',choice:'cancel'}));
 expect(result.scope).toContain('運営');
});

test('accepted reply updates the canonical current trust display before reload',async({page})=>{
 await page.goto(URL);await page.evaluate(()=>{ADHOMS_LIGHT_STATE.year=2;ADHOMS_LIGHT_STATE.month=6;ADHOMS_LIGHT_STATE.flags['seen:y2_flood']=true;localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(ADHOMS_LIGHT_STATE));});await page.reload();
 await page.locator('[data-c="hard_warning"]').click();await page.locator('#nextWeek').click();
 const expected=await page.evaluate(()=>String(35+ADHOMS_LIGHT_STATE.town.trust*12));
 await expect(page.locator('#ct')).toHaveText(expected);
});

test('year2 decision offers current situation and names who owns the response before selection',async({page})=>{
 await page.goto(URL);await page.evaluate(()=>{ADHOMS_LIGHT_STATE.year=2;ADHOMS_LIGHT_STATE.month=6;ADHOMS_LIGHT_STATE.flags['seen:y2_flood']=true;localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(ADHOMS_LIGHT_STATE));});await page.reload();
 await expect(page.locator('#ver1Choice')).toContainText('短時間強雨');
 await expect(page.locator('#ver1Choice')).toContainText('道路管理');
 await page.locator('[data-c="guided_watch"]').click();
 await expect(page.locator('#feedList')).toContainText('返事があるまでは実行済みや資源確保とは扱いません');
 await expect(page.locator('#feedList')).not.toContainText('冠水への施策選択は、この記録ではまだ確認できない');
});

test('legacy final choice is not rewritten as recorded actor assent',async({page})=>{
 await page.goto(URL);await page.evaluate(()=>{
  let session=ADHOMS_VER1_FINAL.createSession(ADHOMS_LIGHT_STATE);session.phaseIndex=5;session.decisions.forest_evacuation='start_now';delete session.actionResponses;
  ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession',{sessionId:ADHOMS_VER1_SESSION.id,stage:'active',session});
 });await page.reload();
 await expect(page.locator('#ver1Choice')).not.toContainText('運営側が避難開始を受け入れています');
 await expect(page.locator('#ver1Choice')).toContainText('相手の返事はこの保存にはありません');
});

test('year3 welfare-first burden inquiry returns the actual factory burden, not trunk-road facts',async({page})=>{
 await page.goto(URL);await page.evaluate(()=>{ADHOMS_LIGHT_STATE=ADHOMS_VER1_EVENTS.resolveChoice(ADHOMS_LIGHT_STATE,'y2_snow','welfare_first');ADHOMS_LIGHT_STATE.year=3;ADHOMS_LIGHT_STATE.month=4;ADHOMS_LIGHT_STATE.flags.y3_seen=true;localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(ADHOMS_LIGHT_STATE));});await page.reload();
 await page.locator('[data-revisit="burden"]').click();await page.locator('#v1directive').click();await page.locator('#nextWeek').click();
 await expect(page.locator('[data-support-reply="spillover"]')).toContainText('工場・物流');
 await expect(page.locator('[data-support-reply="spillover"]')).not.toContainText('生活道路側から');
});

test('year3 revisit still gives directive one before year4',async({page})=>{
 await page.goto(URL);await page.evaluate(()=>{ADHOMS_LIGHT_STATE.year=3;ADHOMS_LIGHT_STATE.month=4;ADHOMS_LIGHT_STATE.flags.y3_seen=true;localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(ADHOMS_LIGHT_STATE));});await page.reload();
 await page.locator('[data-revisit="burden"]').click();
 await expect(page.locator('#ver1Choice')).toContainText('木曽指令 第1号');
});

test('returning to system priority deactivates previous personal reallocation assent',async({page})=>{
 await page.goto(URL);
 const response=await page.evaluate(()=>{const f=ADHOMS_VER1_FINAL;let s=f.createSession(ADHOMS_LIGHT_STATE);s.phaseIndex=5;s=f.applyDecision(s,'priority_override','manual_override');s=f.applyDecision(s,'personal_vehicle_allocation','forest');s=f.applyDecision(s,'priority_override','system_priority');return s.actionResponses.personal_vehicle_allocation;});
 expect(response.status).toBe('superseded');
});

test('unavailable equipment and no-op replies never claim secured or deployed shelters',async({page})=>{
 await page.goto(URL);
 const replies=await page.evaluate(()=>{const f=ADHOMS_VER1_FINAL;let s=f.createSession(ADHOMS_LIGHT_STATE);s=f.applyDecision(s,'portable_shelter','none');const first=s.actionResponses.portable_shelter.text;s.phaseIndex=4;s=f.applyDecision(s,'portable_redeploy','hold');return [first,s.actionResponses.portable_redeploy.text];});
 expect(replies.join('\n')).not.toMatch(/確保済み|展開済み/);
});

test('malformed optional proposal metadata cannot create consent or crash restored FEED',async({page})=>{
 await page.goto(URL);await page.evaluate(()=>{ADHOMS_LIGHT_STATE.proposals={y2_flood:null,unknown:{status:'proposed'},y4_strategy:{status:'proposed',choiceId:'authority'}};ADHOMS_LIGHT_STATE.supportCases={bus:{choice:'coordinate_days',status:'proposed'}};localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(ADHOMS_LIGHT_STATE));});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.reload();await page.locator('#nextWeek').click();
 expect(errors).toEqual([]);
 expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.supportCases.bus.response)).toBeUndefined();
 expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.agreements)).toBeUndefined();
});
