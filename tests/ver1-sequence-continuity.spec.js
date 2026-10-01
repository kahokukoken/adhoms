const {test,expect}=require('@playwright/test');
const URL=process.env.ADHOMS_TEST_URL||'http://127.0.0.1:8000/';
async function at(page,year,month=4,week=4){await page.evaluate(({year,month,week})=>{ADHOMS_LIGHT_STATE.year=year;ADHOMS_LIGHT_STATE.month=month;const index=(year-1)*12+(month+8)%12;S.year=Math.floor((index+3)/12)+1;S.month=month;S.week=week;S.filter='ALL';updateTop();renderFeed();},{year,month,week});}
const ordinary=page=>page.locator('#feedList .card:not([data-history-beat]):not([data-story-beat]):not([data-research-beat]):not([data-onboarding])');
test('later years keep six arrivals, age and continuing roles instead of replaying the first consultation',async({page})=>{
 await page.goto(URL);const starts=[];
 for(let year=2;year<=5;year++){
  await at(page,year,4,1);starts.push(await ordinary(page).first().innerText());
  await expect(page.locator('header')).toContainText(`${28+year}歳 / 河北恒研所長`);
  await expect(page.locator('#feedList')).not.toContainText('朝のバスのことで相談です。');
  for(let week=1;week<=4;week++){await at(page,year,4,week);expect(await ordinary(page).count()).toBe(6*week);}
  const aoi=ordinary(page).filter({hasText:'森川 葵'});if(await aoi.count())expect(await aoi.first().innerText()).not.toContain('17歳');
 }
 expect(new Set(starts).size).toBe(4);
});
test('year-three ordinary conversation reads flood choice or Memory without applying deltas again',async({page})=>{
 await page.goto(URL);let bodies=[];
 for(const choice of ['early_close','guided_watch','hard_warning','logistics_detour']){
  await page.evaluate(choice=>{let st=ADHOMS_VER1_STATE.createInitialState();st=ADHOMS_VER1_EVENTS.resolveChoice(st,'y2_flood',choice);ADHOMS_LIGHT_STATE=st;},choice);
  await at(page,3,6);const text=await ordinary(page).allTextContents();bodies.push(text.join('\n'));
  const before=await page.evaluate(()=>JSON.stringify(ADHOMS_LIGHT_STATE));await page.evaluate(()=>renderFeed());expect(await page.evaluate(()=>JSON.stringify(ADHOMS_LIGHT_STATE))).toBe(before);
  await page.evaluate(()=>{ADHOMS_LIGHT_STATE.flags={};renderFeed();});expect((await ordinary(page).allTextContents()).join('\n')).toBe(bodies.at(-1));
 }
 expect(new Set(bodies).size).toBe(4);
 expect(bodies[0]).toMatch(/通行止め|道路を止め/);expect(bodies[1]).toMatch(/誘導/);expect(bodies[2]).toMatch(/警告/);expect(bodies[3]).toMatch(/迂回/);
});
test('optional history and relations change later ordinary music and family-business conversation',async({page})=>{
 await page.goto(URL);await at(page,3,7);const absent=await ordinary(page).allTextContents();
 await page.evaluate(()=>{ADHOMS_LIGHT_STATE.flags['optional:brine:live_test']=true;ADHOMS_LIGHT_STATE.flags['optional:brine:followup:compare_takes']=true;ADHOMS_LIGHT_STATE.relations.brine=3;renderFeed();});
 expect(await ordinary(page).allTextContents()).not.toEqual(absent);
 await at(page,3,9);const noSoba=await ordinary(page).allTextContents();
 await page.evaluate(()=>{ADHOMS_LIGHT_STATE.flags['optional:miso:service_flow']=true;ADHOMS_LIGHT_STATE.relations.miso_shop=3;renderFeed();});expect(await ordinary(page).allTextContents()).not.toEqual(noSoba);
});
test('month-only entry carries intermediate causes and has a year-specific meeting',async({page})=>{
 await page.goto(URL);const meetings=[];
 for(const year of [2,3,4,5]){await at(page,year,4,1);await page.evaluate(()=>{S.meetingEntry=null;openMeeting();});
 expect(await page.locator('.meetingCatchup blockquote[data-week="2"]').count()).toBeGreaterThan(0);
 expect(await page.locator('.meetingCatchup blockquote[data-week="3"]').count()).toBeGreaterThan(0);
 meetings.push(await page.locator('.meetingThread').innerText());await page.evaluate(()=>document.querySelector('#meeting').classList.remove('on'));
 }
 expect(new Set(meetings).size).toBe(4);
});
test('later-year research follows the current episode rather than the year-one bus dispute',async({page})=>{
 await page.goto(URL);await at(page,4,4,1);await ordinary(page).first().getByRole('button',{name:'＋',exact:true}).click();
 const research=await page.evaluate(()=>S.research.at(-1));expect(research).toBeTruthy();expect(research.result).not.toMatch(/8時5分|保育園が開く/);
});
test('wildlife and snow branches remain distinguishable in ordinary next-year scenes',async({page})=>{
 await page.goto(URL);
 for(const [event,month,choices] of [['y2_wildlife',10,['capture','fence','food_source','restrict','survey']],['y2_snow',1,['trunk_first','welfare_first','distributed','schedule_shift']]]){
  const texts=[];
  for(const choice of choices){await page.evaluate(({event,choice})=>{ADHOMS_LIGHT_STATE=ADHOMS_VER1_EVENTS.resolveChoice(ADHOMS_VER1_STATE.createInitialState(),event,choice);},{event,choice});await at(page,3,month);texts.push((await ordinary(page).allTextContents()).join('\n'));}
  expect(new Set(texts).size).toBe(choices.length);
 }
});
test('strategy and concrete cooperation resources change ordinary preparation, without awarding new resources',async({page})=>{
 await page.goto(URL);const texts=[];
 for(const strategy of ['repair','deepen','authority','alternative']){await page.evaluate(strategy=>{ADHOMS_LIGHT_STATE=ADHOMS_VER1_PROPAGATION.resolveYear4Strategy(ADHOMS_VER1_STATE.createInitialState(),strategy).state;},strategy);await at(page,4,4);texts.push((await ordinary(page).allTextContents()).join('\n'));}
 expect(new Set(texts).size).toBe(4);
 await at(page,4,6);const absent=(await ordinary(page).allTextContents()).join('\n');
 await page.evaluate(()=>{ADHOMS_LIGHT_STATE.relations.warehouse=2;ADHOMS_LIGHT_STATE.relations.gas_station=2;renderFeed();});const available=(await ordinary(page).allTextContents()).join('\n');
 expect(available).not.toBe(absent);expect(available).toMatch(/倉庫/);expect(available).toMatch(/燃料/);
});
test('recovery retains adopted personal outcomes and livelihood loss instead of resetting to ordinary autumn',async({page})=>{
 await page.goto(URL);
 async function final(safe){await page.evaluate(safe=>{const session=ADHOMS_VER1_FINAL.createSession(ADHOMS_LIGHT_STATE);for(const p of Object.values(session.people))p.status=safe?'safe':'critical';session.result=ADHOMS_VER1_FINAL.ensurePersonalOutcomes({people:session.people,humanSafety:safe?90:20,livelihoodContinuity:safe?95:40,relationContinuity:safe?95:40});ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession',{sessionId:ADHOMS_VER1_SESSION.id,stage:'recovery',session});},safe);}
 await final(false);await at(page,5,9);const damaged=(await ordinary(page).allTextContents()).join('\n');expect(damaged).toMatch(/高倉味噌店/);expect(damaged).toMatch(/負傷/);expect(damaged).toMatch(/生活|事業/);
 await final(true);await page.evaluate(()=>renderFeed());const safe=(await ordinary(page).allTextContents()).join('\n');expect(safe).not.toBe(damaged);expect(safe).toMatch(/高倉味噌店/);expect(safe).toMatch(/負傷/);
 await page.evaluate(()=>localStorage.removeItem('adhoms.ver1.finalsession'));await page.evaluate(()=>renderFeed());expect((await ordinary(page).allTextContents()).join('\n')).toMatch(/確認.*揃っていません|結果.*未確認/);
});
test('later-year choice prose, aged profiles and saved observation IDs survive resume independently from cold start',async({page,browser})=>{
 await page.goto(URL);await page.evaluate(()=>{ADHOMS_LIGHT_STATE=ADHOMS_VER1_EVENTS.resolveChoice(ADHOMS_LIGHT_STATE,'y2_flood','logistics_detour');});await at(page,3,6,2);
 await page.evaluate(()=>ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate',ADHOMS_LIGHT_STATE));
 const post=ordinary(page).first();const id=await post.getAttribute('data-id');await post.getByRole('button',{name:'＋',exact:true}).click();
 const before=await ordinary(page).allTextContents();await page.reload();expect(await ordinary(page).allTextContents()).toEqual(before);await expect(page.locator(`[data-id="${id}"] button[aria-label="＋"]`)).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>scrollY)).toBe(0);
 const context=await browser.newContext();const fresh=await context.newPage();await fresh.goto(URL);await expect(fresh.locator('#bottomYm')).toHaveText('2029 / 04');await expect(fresh.locator('header')).toContainText('29歳');await context.close();
});
test('a year-four strategy removes obsolete conditional resistance instead of contradicting the current meeting',async({page})=>{
 await page.goto(URL);
 await page.evaluate(()=>{const state=ADHOMS_VER1_STATE.createInitialState();state.sessionId=ADHOMS_VER1_SESSION.id;state.year=4;state.month=4;state.flags.y4_seen=true;state.districts.old_road.burdenMemory=2;ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate',state);});
 await page.reload();await page.evaluate(()=>{S.week=2;renderFeed();});await expect(page.locator('[data-id="history-y4-resistance"]')).toHaveCount(1);
 await page.locator('#ver1Choice [data-s="repair"]').click();
 await expect(page.locator('[data-id="history-y4-resistance"]')).toHaveCount(0);
 await page.evaluate(()=>openMeeting());await expect(page.locator('.meetingThread')).not.toContainText('慎重・拒否側の反応が0件');await expect(page.locator('.meetingThread')).toContainText('解消したと判断せず');
});
test('old saved observations keep their speaker and body without moving their weights to rewritten people',async({page})=>{
 await page.goto('http://127.0.0.1:8000/dist/ADHOMS-Ver1-StateFix-e063f4f3.html');await at(page,3,4,1);
 await page.evaluate(()=>ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate',ADHOMS_LIGHT_STATE));
 const oldId='scenario-24-2';const before=await page.evaluate(id=>({who:findPost(id).who,text:findPost(id).text}),oldId);
 await page.locator(`[data-id="${oldId}"]`).getByRole('button',{name:'＋',exact:true}).click();
 await page.goto(URL);
 expect(await page.evaluate(id=>({who:findPost(id)?.who,text:findPost(id)?.text}),oldId)).toEqual(before);
 expect(await page.evaluate(id=>S.likes[id],oldId)).toBe(true);
 await expect(page.locator(`#feedList [data-id="${oldId}"]`)).toHaveCount(0);
 await expect(page.locator('#feedList button[aria-pressed="true"]')).toHaveCount(0);
 await expect(page.locator('[data-legacy-observations]')).toContainText(before.who);
 await page.reload();expect(await page.evaluate(id=>findPost(id)?.text,oldId)).toBe(before.text);
});
test('explicit resident descriptions are not expanded into doubled role phrases',async({page})=>{
 await page.goto(URL);
 for(const month of [7,10]){await at(page,3,month,1);await page.evaluate(()=>{S.meetingEntry=null;openMeeting();});const text=await page.locator('.meetingThread').innerText();expect(text).not.toMatch(/農家の農家の|飲食店主の飲食店を営む/);await page.evaluate(()=>document.querySelector('#meeting').classList.remove('on'));}
});
test('recovery dates the disaster snapshot once and moves to different monthly work',async({page})=>{
 await page.goto(URL);await page.evaluate(()=>{const session=ADHOMS_VER1_FINAL.createSession(ADHOMS_LIGHT_STATE);for(const p of Object.values(session.people))p.status='critical';session.result={people:session.people,humanSafety:20,livelihoodContinuity:40,relationContinuity:40};ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession',{sessionId:ADHOMS_VER1_SESSION.id,stage:'recovery',session});});
 await at(page,5,9);await expect(page.locator('#feedList')).toContainText('八月の最終局面');
 for(const month of [10,11,12,1,2,3]){await at(page,5,month);await expect(page.locator('#feedList')).not.toContainText('真知さんは重大な危険');}
});
test('monthly reading includes the personal context cited by the meeting',async({page})=>{
 await page.goto(URL);
 for(const [year,month,name] of [[3,9,'高倉 灯'],[3,2,'久保田 蓮'],[4,7,'透'],[4,12,'高倉 真知']]){
  await at(page,year,month,1);await page.evaluate(()=>{S.meetingEntry=null;openMeeting();});
  await expect(page.locator('.meetingCatchup blockquote b').filter({hasText:name}).first()).toBeVisible();
  await page.evaluate(()=>document.querySelector('#meeting').classList.remove('on'));
 }
});
test('the final day identifies the failed route from its actual incident and retains it on resume',async({page})=>{
 await page.goto(URL);await page.evaluate(()=>showEnding());
 for(let phase=0;phase<4;phase++)await page.locator('#v1next').click();
 const before=await page.evaluate(()=>ADHOMS_VER1_DEBUG.final().session.incidents.find(i=>i.type==='cascade').text);
 await expect(page.locator('.ver1Incidents')).toContainText('最初に使用不能域');
 await expect(page.locator('.ver1Incidents')).not.toContainText('_route');
 await page.reload();expect(await page.evaluate(()=>ADHOMS_VER1_DEBUG.final().session.incidents.find(i=>i.type==='cascade').text)).toBe(before);await expect(page.locator('.ver1Incidents')).toContainText('最初に使用不能域');
});
