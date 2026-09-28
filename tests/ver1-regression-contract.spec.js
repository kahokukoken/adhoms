const {test,expect}=require('@playwright/test');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const targets=[['web','http://127.0.0.1:8000/'],['standalone',pathToFileURL(path.join(process.cwd(),'dist/ADHOMS-Ver1.html')).href]];
const nextMonth=async page=>{await page.locator('#toMonthEnd').click();await page.locator('.meetingContinue').click();};
const ids=page=>page.locator('#feedList .card').evaluateAll(nodes=>nodes.map(n=>n.dataset.id));
async function settle(page){await page.waitForTimeout(900);}
async function freshAssertions(page){
  await expect(page.locator('#bottomYm')).toHaveText('2029 / 04');
  await expect(page.locator('#bottomMn')).toHaveText('第1週');
  await expect(page.locator('#feedList .card').first()).toContainText('おはようございます、木曽所長。あなたの親愛なるAI、T-0WAです。');
  await expect(page.locator('#feedList [data-onboarding] .post')).not.toContainText(['木曽朔']);
  await expect(page.locator('#feedList')).toContainText('抽選');
  await expect(page.locator('#feedList')).toContainText('観測端末');
  await expect(page.locator('header')).toContainText('木曽朔');
  await expect(page.locator('header')).toContainText('29歳 / 河北恒研所長');
  await expect(page.locator('header')).toContainText('倶利伽羅町ADHOMS実証試験責任者');
  expect(await page.evaluate(()=>({likes:S.likes,meetingDone:S.meetingDone,research:S.research,flags:ADHOMS_LIGHT_STATE.flags}))).toEqual({likes:{},meetingDone:{},research:[],flags:{}});
  expect(await page.evaluate(()=>scrollY)).toBe(0);
  await expect(page.locator('#meeting')).not.toHaveClass(/on/);
  await expect(page.getByRole('button',{name:'初日の会話を読む'})).toHaveCount(0);
  expect(await page.locator('body').innerText()).not.toMatch(/ADHOMSとは|ADHOMS \/ 倶利伽羅町実証|FIELD TERMINAL/);
}
async function meetingAnchor(page){
  const data=await page.evaluate(()=>{
    const overlay=document.querySelector('#meeting'),card=document.querySelector('.meetingCard'),title=document.querySelector('#meetTitle');
    return {position:getComputedStyle(overlay).position,overlayTop:overlay.getBoundingClientRect().top,top:card.getBoundingClientRect().top,bottom:card.getBoundingClientRect().bottom,titleTop:title.getBoundingClientRect().top,titleBottom:title.getBoundingClientRect().bottom,height:innerHeight,scroll:[overlay,card,document.querySelector('#meetingBody')].map(e=>e.scrollTop)};
  });
  expect(data.position).toBe('fixed');expect(data.overlayTop).toBe(0);
  expect(data.top).toBeGreaterThanOrEqual(0);expect(data.bottom).toBeLessThanOrEqual(data.height);
  expect(data.titleTop).toBeGreaterThanOrEqual(0);expect(data.titleBottom).toBeLessThan(data.height);
  expect(data.scroll).toEqual([0,0,0]);
  return data;
}
for(const [kind,url] of targets){
  test(`${kind}: Cold Start Contract / empty browser starts at the first April introduction`,async({page},info)=>{
    await page.setViewportSize({width:390,height:844});await page.goto(url);await settle(page);await freshAssertions(page);
    await page.screenshot({path:info.outputPath('cold-start.png')});
  });
  // Catches browser scroll restoration: do not scroll to zero before reload.
  test(`${kind}: Resume Contract / reading position cannot reopen halfway through FEED`,async({page})=>{
    await page.setViewportSize({width:390,height:844});await page.goto(url);
    await page.locator('#nextWeek').click();await settle(page);
    const post=page.locator('[data-id="scenario-0-6"]');await post.getByRole('button',{name:'＋',exact:true}).click();
    const before=await ids(page);await page.evaluate(()=>window.scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
    expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(500);
    await page.reload();await settle(page);
    expect(await page.evaluate(()=>scrollY)).toBe(0);
    await expect(page.locator('#bottomMn')).toHaveText('第2週');expect(await ids(page)).toEqual(before);
    await expect(post.getByRole('button',{name:'＋',exact:true})).toHaveAttribute('aria-pressed','true');
  });
  // Catches pagehide writing the old UI back after a reset, and native scroll restoration.
  test(`${kind}: Fresh Contract / explicit reset from a scrolled saved May is cold`,async({page})=>{
    await page.goto(url);await nextMonth(page);await page.locator('#nextWeek').click();await settle(page);
    await page.evaluate(()=>{localStorage.setItem('unrelated.preference','keep');window.scrollTo({top:document.body.scrollHeight,behavior:'instant'});});
    await page.evaluate(()=>ADHOMS_VER1_DEBUG.reset());await page.waitForLoadState();await settle(page);
    await freshAssertions(page);expect(await page.evaluate(()=>localStorage.getItem('unrelated.preference'))).toBe('keep');
  });
  for(const missing of ['missing','malformed']){
    test(`${kind}: Fresh Contract / ${missing} primary save cannot import orphan daily state`,async({page})=>{
      const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
      await page.locator('[data-id="scenario-0-0"]').getByRole('button',{name:'＋',exact:true}).click();
      await nextMonth(page);await page.locator('#toMonthEnd').click();
      await page.evaluate(mode=>{
        if(mode==='missing')localStorage.removeItem('adhoms.ver1.lightstate');else localStorage.setItem('adhoms.ver1.lightstate','{}');
      },missing);
      await page.reload();await settle(page);expect(errors).toEqual([]);await freshAssertions(page);
      await page.locator('#toMonthEnd').click();await expect(page.locator('#meeting')).toHaveClass(/on/);
    });
  }
  test(`${kind}: Fresh Contract / another run's daily and final fragments cannot attach to a valid new save`,async({page})=>{
    await page.goto(url);await nextMonth(page);
    await page.evaluate(()=>{
      const state=ADHOMS_VER1_STATE.createInitialState();
      state.sessionId='a-different-game';
      localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(state));
      localStorage.setItem('adhoms.ver1.finalsession',JSON.stringify({stage:'active',sessionId:'old-game',session:ADHOMS_VER1_FINAL.createSession(ADHOMS_LIGHT_STATE)}));
    });
    await page.reload();await settle(page);await freshAssertions(page);
    await expect(page.locator('#ver1Choice.on')).toHaveCount(0);
  });
  test(`${kind}: Resume Contract / legacy untagged saves migrate without losing week or observations`,async({page})=>{
    await page.goto(url);await page.locator('#nextWeek').click();
    await page.locator('[data-id="scenario-0-6"]').getByRole('button',{name:'＋',exact:true}).click();
    const records=await page.evaluate(()=>Object.fromEntries(['adhoms.ver1.lightstate','adhoms.ver1.daily.v1'].map(key=>{
      const record=JSON.parse(localStorage.getItem(key));delete record.sessionId;return [key,record];
    })));
    // Seed before scripts execute so pagehide cannot rewrite the fixture.
    await page.addInitScript(data=>{if(!sessionStorage.getItem('legacy-seeded')){for(const [k,v] of Object.entries(data))localStorage.setItem(k,JSON.stringify(v));sessionStorage.setItem('legacy-seeded','yes');}},records);
    for(let i=0;i<2;i++){
      await page.reload();await settle(page);
      await expect(page.locator('#bottomMn')).toHaveText('第2週');
      await expect(page.locator('[data-id="scenario-0-6"]').getByRole('button',{name:'＋',exact:true})).toHaveAttribute('aria-pressed','true');
      expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('adhoms.ver1.daily.v1')).sessionId)).toBe(await page.evaluate(()=>ADHOMS_LIGHT_STATE.sessionId));
    }
  });
  test(`${kind}: Month Boundary Contract / foreign recovery cannot skip the current August disaster`,async({page})=>{
    await page.goto(url);
    await page.evaluate(()=>{
      const state=ADHOMS_VER1_STATE.createInitialState();
      Object.assign(state,{year:5,month:7,sessionId:'current-game'});
      localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(state));
      localStorage.setItem('adhoms.ver1.finalsession',JSON.stringify({stage:'recovery',sessionId:'old-game',session:{result:{old:true}}}));
    });
    await page.reload();await nextMonth(page);await settle(page);
    await expect(page.locator('#ver1Choice.on')).toContainText('FINAL DAY');
    const final=await page.evaluate(()=>ADHOMS_VER1_DEBUG.final());
    expect(final.sessionId).toBe('current-game');expect(final.stage).toBe('active');
  });
  test(`${kind}: Fresh Contract / stale tab cannot overwrite a new run`,async({page,context})=>{
    await page.goto(url);await nextMonth(page);
    const old=await context.newPage();await old.goto(url);
    await page.evaluate(()=>ADHOMS_VER1_DEBUG.reset());await page.waitForLoadState();await settle(page);
    const freshId=await page.evaluate(()=>ADHOMS_LIGHT_STATE.sessionId);
    await nextMonth(old);await old.close();
    await page.reload();await settle(page);await freshAssertions(page);
    expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.sessionId)).toBe(freshId);
  });
  test(`${kind}: Fresh Contract / malformed memory cannot crash an otherwise shaped save`,async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
    await page.evaluate(()=>{const state=ADHOMS_VER1_STATE.createInitialState();state.month=9;state.memories=[null];localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(state));});
    await page.reload();await settle(page);expect(errors).toEqual([]);await freshAssertions(page);
  });
  test(`${kind}: Weekly Density Contract / April ordinary increments are 6,6,6 with stable prior IDs`,async({page},info)=>{
    await page.goto(url);let before=await ids(page);const increments=[];
    for(const week of [2,3,4]){
      await page.locator('#nextWeek').click();await expect(page.locator('#bottomMn')).toHaveText(`第${week}週`);
      const after=await ids(page);expect(after.slice(0,before.length)).toEqual(before);
      const ordinary=page.locator(`#feedList .card[data-week="${week}"]:not([data-story-beat]):not([data-history-beat]):not([data-research-beat])`);
      increments.push({week,total:after.length-before.length,ordinary:await ordinary.count()});
      expect(await ordinary.count()).toBe(6);
      const text=await ordinary.locator('.post').allTextContents();expect(new Set(text).size).toBe(6);before=after;
    }
    await info.attach('weekly-increments',{body:JSON.stringify(increments,null,2),contentType:'application/json'});
  });
  test(`${kind}: Meeting Anchor Contract / long FEED, saved meeting and next month stay at title`,async({page},info)=>{
    await page.setViewportSize({width:390,height:844});await page.goto(url);
    for(let i=0;i<3;i++)await page.locator('#nextWeek').click();await settle(page);
    await page.evaluate(()=>window.scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
    await page.locator('#toMonthEnd').click();await settle(page);await meetingAnchor(page);
    await page.screenshot({path:info.outputPath('meeting-april.png')});
    await page.locator('.meetingCard').evaluate(e=>e.scrollTop=e.scrollHeight);
    await page.reload();await settle(page);await meetingAnchor(page);
    await page.locator('.meetingContinue').click();await page.locator('#toMonthEnd').click();await settle(page);await meetingAnchor(page);
  });
  test(`${kind}: Month Boundary Contract / rapid week-meeting-month does not carry stale navigation`,async({page},info)=>{
    await page.setViewportSize({width:390,height:844});await page.goto(url);
    await page.locator('[data-id="scenario-0-0"]').getByRole('button',{name:'−',exact:true}).click();
    // Real button handlers in one task expose a delayed navigation racing a month boundary.
    await page.evaluate(()=>{document.querySelector('#nextWeek').click();document.querySelector('#toMonthEnd').click();document.querySelector('.meetingContinue').click();document.querySelector('#nextWeek').click();});
    await settle(page);
    await expect(page.locator('#bottomYm')).toHaveText('2029 / 05');await expect(page.locator('#bottomMn')).toHaveText('第2週');
    await expect(page.locator('#meeting')).not.toHaveClass(/on/);
    await expect(page.locator('#feedList [data-onboarding]')).toHaveCount(0);
    const position=await page.locator('#feedList [data-week="2"]').first().boundingBox();
    const headerBottom=await page.locator('header').evaluate(e=>e.getBoundingClientRect().bottom);
    expect(position.y).toBeGreaterThanOrEqual(headerBottom);expect(position.y).toBeLessThan(422);
    const state=await page.evaluate(()=>({done:S.meetingDone,minus:S.minus,entry:S.meetingEntry}));
    expect(state.done['1-4']).toBe(true);expect(state.done['1-5']).toBeUndefined();expect(state.minus['scenario-0-0']).toBe(true);
    const before=await ids(page);await page.reload();await settle(page);expect(await ids(page)).toEqual(before);
    await expect(page.locator('#bottomMn')).toHaveText('第2週');expect(await page.evaluate(()=>scrollY)).toBe(0);
    await page.locator('#toMonthEnd').click();await settle(page);await meetingAnchor(page);
    await page.screenshot({path:info.outputPath('meeting-may.png')});
  });
}
