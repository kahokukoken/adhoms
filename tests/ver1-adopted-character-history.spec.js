const {test,expect}=require('@playwright/test');
const URL=process.env.ADHOMS_TEST_URL||'http://127.0.0.1:8000/';
async function at(page,year,month,week=1){
  await page.evaluate(({year,month,week})=>{
    ADHOMS_LIGHT_STATE.year=year;ADHOMS_LIGHT_STATE.month=month;
    S.year=year+(month<4?1:0);S.month=month;S.week=week;S.filter='ALL';
    S.meetingEntry=null;S.meetingDone={};renderFeed();
  },{year,month,week});
}
const histories=page=>page.evaluate(()=>ADHOMS_LIGHT_STATE.memories.filter(m=>m.id.startsWith('dl19_')));

test('DL-019 catalog is explicit, dated, source-backed and predecessor ordered',async({page})=>{
  await page.goto(URL);
  const events=await page.evaluate(()=>ADHOMS_VER1_STORY_HISTORY.events);
  expect(events?.length).toBeGreaterThanOrEqual(16);
  const seen=new Set();
  for(const event of events){
    expect(event.id).toMatch(/^dl19_/);expect(seen.has(event.id)).toBe(false);
    expect(event.source).toEqual({type:'canonical-event',id:`DL-019:${event.id}`});
    expect(event.entities.length).toBeGreaterThan(0);
    expect(event.year).toBeGreaterThanOrEqual(1);expect(event.year).toBeLessThanOrEqual(5);
    expect(event.month).toBeGreaterThanOrEqual(1);expect(event.month).toBeLessThanOrEqual(12);
    expect(event.week).toBeGreaterThanOrEqual(1);expect(event.week).toBeLessThanOrEqual(4);
    for(const prior of event.predecessors)expect(seen.has(prior)).toBe(true);
    seen.add(event.id);
  }
});

test('every adopted event appears only at its reached week with original provenance and no world deltas',async({page})=>{
  await page.goto(URL);
  const results=await page.evaluate(()=>{
    const h=ADHOMS_VER1_STORY_HISTORY;
    return (h.events||[]).map(event=>{
      ADHOMS_LIGHT_STATE=ADHOMS_VER1_STATE.createInitialState();
      ADHOMS_LIGHT_STATE.year=event.year;ADHOMS_LIGHT_STATE.month=event.month;
      S.year=event.year+(event.month<4?1:0);S.month=event.month;S.week=event.week-1;
      const world=JSON.stringify({...ADHOMS_LIGHT_STATE,memories:[]});
      if(S.week)h.reconcileVisible();
      const before=ADHOMS_LIGHT_STATE.memories.some(m=>m.id===event.id);
      S.week=event.week;h.reconcileVisible();
      const memory=ADHOMS_LIGHT_STATE.memories.find(m=>m.id===event.id);
      const after=JSON.stringify(ADHOMS_LIGHT_STATE);h.reconcileVisible();
      return {event,before,memory,world,afterWorld:JSON.stringify({...ADHOMS_LIGHT_STATE,memories:[]}),stable:after===JSON.stringify(ADHOMS_LIGHT_STATE)};
    });
  });
  expect(results.length).toBeGreaterThanOrEqual(16);
  for(const r of results){
    expect(r.before,r.event.id).toBe(false);expect(r.memory,r.event.id).toBeTruthy();
    expect(r.memory).toMatchObject({year:r.event.year,month:r.event.month,week:r.event.week,entities:r.event.entities,source:r.event.source});
    expect(r.memory.tags).toContain(`week:${r.event.week}`);
    expect(r.stable).toBe(true);expect(r.afterWorld).toBe(r.world);
  }
});

test('weekly first arrival records rest agreement and result before the first dependent render',async({page})=>{
  await page.goto(URL);await at(page,2,2);
  await page.evaluate(()=>{
    window.historyFrames=[];const prior=window.renderFeed;
    window.renderFeed=function(){historyFrames.push({week:S.week,ids:ADHOMS_LIGHT_STATE.memories.map(m=>m.id)});return prior();};
  });
  await page.getByRole('button',{name:/1週進む/}).click();
  expect((await histories(page)).map(m=>m.id)).toContain('dl19_gaku_rest_agreed');
  await page.getByRole('button',{name:/1週進む/}).click();
  const frames=await page.evaluate(()=>historyFrames);
  expect(frames.find(f=>f.week===2).ids).toContain('dl19_gaku_rest_agreed');
  expect(frames.find(f=>f.week===3).ids).toContain('dl19_gaku_rest_kept');
  await expect(page.locator('#feedList')).toContainText('休む日に連絡が来なかった');
  const before=await histories(page);await page.reload();expect(await histories(page)).toEqual(before);
});

test('month-end catches up adopted facts before meeting and preserves entry week into March',async({page})=>{
  await page.goto(URL);await at(page,2,2);
  await page.getByRole('button',{name:/月末/}).click();
  expect((await histories(page)).map(m=>m.id)).toContain('dl19_gaku_rest_kept');
  expect(await page.evaluate(()=>S.meetingEntry.week)).toBe(1);
  await expect(page.locator('.meetingThread')).toContainText('その日は依頼が来なかった');
  await page.locator('.meetingContinue').click();
  await page.getByRole('button',{name:/月末/}).click();
  await expect(page.locator('.meetingThread')).toContainText('誰が調整したかは未確認');
  await expect(page.locator('#feedList')).not.toContainText('誰かが次の人を探してくれている');
});

test('four arcs visibly depend on Memory, and repeated render never creates facts',async({page})=>{
  await page.goto(URL);
  const checks=[
    [2,2,4,'dl19_gaku_rest_kept','休む日に連絡が来なかった'],
    [3,6,4,'dl19_ren_minato_test','そこへ印をもらえた'],
    [4,7,4,'dl19_minato_direct_contact','僕を通さず日程変更の話が進んでいました'],
    [4,2,4,'dl19_teaching_return_kept','味噌店へ戻る時間を守れました']
  ];
  for(const [year,month,week,id,phrase] of checks){
    await at(page,year,month,week);
    await page.evaluate(()=>{ADHOMS_VER1_STORY_HISTORY.reconcileVisible();renderFeed();});
    await expect(page.locator('#feedList')).toContainText(phrase);
    const data=await page.evaluate(id=>{
      ADHOMS_LIGHT_STATE.memories=ADHOMS_LIGHT_STATE.memories.filter(m=>m.id!==id);
      const before=JSON.stringify(ADHOMS_LIGHT_STATE);renderFeed();renderFeed();
      return {before,after:JSON.stringify(ADHOMS_LIGHT_STATE),text:document.querySelector('#feedList').innerText};
    },id);
    expect(data.after).toBe(data.before);expect(data.text).not.toContain(phrase);expect(data.text).toContain('記録');
  }
});

for(const week of [1,2,3])test(`same-month legacy migration waits for restored week ${week}`,async({page})=>{
  await page.goto(URL);
  await page.evaluate(week=>{
    const st=ADHOMS_VER1_STATE.createInitialState();st.year=2;st.month=2;
    localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(st));
    localStorage.setItem('adhoms.ver1.daily.v1',JSON.stringify({version:1,calendar:{year:2,month:2},ui:{week},meeting:false}));
  },week);
  await page.reload();
  const ids=(await histories(page)).map(m=>m.id);
  expect(ids.includes('dl19_gaku_rest_agreed')).toBe(week>=2);
  expect(ids.includes('dl19_gaku_rest_kept')).toBe(week>=3);
  expect(ids).toContain('dl19_gaku_shed_fatigue');
  const before=await histories(page);await page.reload();expect(await histories(page)).toEqual(before);
});

test('foreign or invalid daily week cannot backfill current-month future facts',async({page})=>{
  await page.goto(URL);
  for(const ui of [{week:4,foreign:true},{week:99},{week:-1},{week:'4'}]){
    await page.evaluate(ui=>{
      const st=ADHOMS_VER1_STATE.createInitialState();st.year=4;st.month=2;
      localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(st));
      localStorage.setItem('adhoms.ver1.daily.v1',JSON.stringify({version:1,...(ui.foreign?{sessionId:'another-run'}:{}),calendar:{year:4,month:2},ui}));
    },ui);
    await page.reload();expect((await histories(page)).map(m=>m.id)).not.toContain('dl19_teaching_return_kept');
  }
});

test('validated later calendar backfills only adopted fixed events, never optional choices',async({page})=>{
  await page.goto(URL);
  await page.evaluate(()=>{
    const st=ADHOMS_VER1_STATE.createInitialState();st.year=5;st.month=5;
    localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(st));localStorage.removeItem('adhoms.ver1.daily.v1');
  });
  await page.reload();
  const s=await page.evaluate(()=>ADHOMS_LIGHT_STATE);
  expect(s.memories.map(m=>m.id)).toContain('dl19_minato_next_contact');
  // Existing optional minimum world progression is allowed; missing player
  // choices are not. DL-019 reconciliation itself leaves all flags untouched.
  for(const memory of s.memories.filter(m=>m.id.startsWith('optional_')))expect(memory.source?.type).not.toBe('optional-choice');
  const choiceIds=['live_test','universal','observe_only','shared_ingredients','service_flow','compare_takes','hear_audience','wait_recording','counter_flow','ask_regulars','leave_to_cooks'];
  expect(Object.keys(s.flags).some(k=>k.startsWith('optional:')&&choiceIds.includes(k.split(':').at(-1)))).toBe(false);
  const dates=s.memories.find(m=>m.id==='dl19_gaku_rest_kept');expect(dates).toMatchObject({year:2,month:2});
});

test('all adopted guarded rows have reached dependencies and counterfactual reads are pure',async({page})=>{
  await page.goto(URL);
  const result=await page.evaluate(()=>{
    const h=ADHOMS_VER1_STORY_HISTORY, catalog=new Map(h.events.map(e=>[e.id,e]));
    const time=(y,m,w)=>(y-1)*48+((m+8)%12)*4+w;
    const checks=[];
    for(const [y,months] of Object.entries(ADHOMS_CONTINUITY_YEARS))for(const [m,packet] of Object.entries(months)){
      const texts=[...packet.weeks.flatMap((rows,w)=>rows.map(r=>({text:r[1],week:w+1,id:r[4]}))),...packet.dialogue.map((r,i)=>({text:r[1],week:4,id:'meeting-'+i})),{text:packet.research,week:4,id:'research'}];
      for(const row of texts){if(!row.text?.history)continue;
        ADHOMS_LIGHT_STATE=ADHOMS_VER1_STATE.createInitialState();ADHOMS_LIGHT_STATE.year=Number(y);ADHOMS_LIGHT_STATE.month=Number(m);
        S.year=Number(y)+(Number(m)<4?1:0);S.month=Number(m);S.week=row.week;h.reconcileVisible();
        const before=JSON.stringify(ADHOMS_LIGHT_STATE),known=ADHOMS_CONTINUITY.render(row.text,Number(y),Number(m));
        const complete=row.text.history.every(id=>h.has(id));
        const reached=row.text.history.every(id=>catalog.has(id)&&time(catalog.get(id).year,catalog.get(id).month,catalog.get(id).week)<=time(Number(y),Number(m),row.week));
        const pure=before===JSON.stringify(ADHOMS_LIGHT_STATE);
        ADHOMS_LIGHT_STATE.memories=ADHOMS_LIGHT_STATE.memories.filter(memory=>!row.text.history.includes(memory.id));
        const missingBefore=JSON.stringify(ADHOMS_LIGHT_STATE),unknown=ADHOMS_CONTINUITY.render(row.text,Number(y),Number(m));
        checks.push({id:`${y}-${m}-${row.id}`,reached,complete,pure: pure&&missingBefore===JSON.stringify(ADHOMS_LIGHT_STATE),different:known!==unknown,known,unknown});
      }
    }
    return checks;
  });
  expect(result.length).toBeGreaterThanOrEqual(70);
  for(const row of result){expect(row.reached,row.id).toBe(true);expect(row.complete,row.id).toBe(true);expect(row.pure,row.id).toBe(true);expect(row.different,row.id).toBe(true);expect(row.known).not.toContain('[object Object]');expect(row.unknown).not.toContain('{{');}
});

test('predecessor removal changes later handoff without removing its own saved Memory',async({page})=>{
  await page.goto(URL);await at(page,4,8,4);
  await page.evaluate(()=>{ADHOMS_VER1_STORY_HISTORY.reconcileVisible();renderFeed();});
  await expect(page.locator('#feedList')).toContainText('廻斗に持ち場を渡して稽古へ行った');
  const data=await page.evaluate(()=>{
    ADHOMS_LIGHT_STATE.memories=ADHOMS_LIGHT_STATE.memories.filter(m=>m.id!=='dl19_gaku_rest_agreed');
    const before=JSON.stringify(ADHOMS_LIGHT_STATE);renderFeed();
    return {hasHandoff:ADHOMS_LIGHT_STATE.memories.some(m=>m.id==='dl19_gaku_position_handoff'),before,after:JSON.stringify(ADHOMS_LIGHT_STATE)};
  });
  expect(data.hasHandoff).toBe(true);expect(data.after).toBe(data.before);
  await expect(page.locator('#feedList')).not.toContainText('廻斗に持ち場を渡して稽古へ行った');
});

test('next-month first render receives reached week-one history before any later wrapper save',async({page})=>{
  await page.goto(URL);await at(page,2,1,4);
  await page.evaluate(()=>{window.historyFrames=[];const prior=renderFeed;window.renderFeed=function(){historyFrames.push({month:S.month,week:S.week,ids:ADHOMS_LIGHT_STATE.memories.map(m=>m.id)});return prior();};nextMonth();});
  const frame=await page.evaluate(()=>historyFrames.find(f=>f.month===2));
  expect(frame.week).toBe(1);expect(frame.ids).toContain('dl19_gaku_rest_announced');expect(frame.ids).not.toContain('dl19_gaku_rest_agreed');
  const before=await histories(page);await page.evaluate(()=>document.dispatchEvent(new Event('click')));await page.reload();expect(await histories(page)).toEqual(before);
});

test('Memory week is optional validated metadata without changing legacy shapes',async({page})=>{
  await page.goto(URL);
  const result=await page.evaluate(()=>[undefined,0,1,4,5,'3'].map(week=>ADHOMS_VER1_STATE.addMemory(ADHOMS_VER1_STATE.createInitialState(),{id:'week-check',week}).memories[0]));
  expect(result.map(m=>m.week)).toEqual([undefined,undefined,1,4,undefined,undefined]);
  expect(Object.hasOwn(result[0],'week')).toBe(false);
});

test('malformed predecessor metadata cannot authorize later adopted facts',async({page})=>{
  await page.goto(URL);await at(page,2,2,3);
  const data=await page.evaluate(()=>{
    ADHOMS_LIGHT_STATE.memories.push({id:'dl19_gaku_rest_agreed',year:2,month:2,week:1,source:{type:'canonical-event',id:'DL-019:dl19_gaku_rest_agreed'}});
    ADHOMS_VER1_STORY_HISTORY.reconcileVisible();
    return {ids:ADHOMS_LIGHT_STATE.memories.map(m=>m.id),bad:ADHOMS_LIGHT_STATE.memories.find(m=>m.id==='dl19_gaku_rest_agreed')};
  });
  expect(data.ids).not.toContain('dl19_gaku_rest_kept');expect(data.bad.week).toBe(1);
});

test('each catalog event is present in the first render of its real transition',async({page})=>{
  await page.goto(URL);
  const results=await page.evaluate(()=>{
    const events=ADHOMS_VER1_STORY_HISTORY.events,original=renderFeed;
    const records=[];let frames=[];
    window.renderFeed=function(){frames.push({month:S.month,week:S.week,ids:ADHOMS_LIGHT_STATE.memories.map(m=>m.id)});return original();};
    for(const event of events){
      const idx=(event.year-1)*12+(event.month+8)%12;
      const start=event.week===1?idx-1:idx;
      ADHOMS_LIGHT_STATE=ADHOMS_VER1_STATE.createInitialState();
      ADHOMS_LIGHT_STATE.year=Math.floor(start/12)+1;ADHOMS_LIGHT_STATE.month=(start+3)%12+1;
      S.year=Math.floor((start+3)/12)+1;S.month=ADHOMS_LIGHT_STATE.month;S.week=event.week===1?4:event.week-1;
      S.meetingDone={};S.meetingEntry=null;frames=[];
      if(event.week===1)nextMonth();else advanceWeek();
      records.push({id:event.id,frame:frames.find(frame=>frame.month===event.month&&frame.week===event.week)});
    }
    return records;
  });
  expect(results.length).toBeGreaterThanOrEqual(16);
  for(const result of results)expect(result.frame?.ids,result.id).toContain(result.id);
});

test('weekly and direct month-end routes record the same adopted facts and retain cold isolation',async({page,browser})=>{
  const context=await browser.newContext();const monthly=await context.newPage();
  await page.goto(URL);await monthly.goto(URL);
  for(const [year,month] of [[2,2],[3,6],[4,4],[4,7],[4,2],[5,4]]){
    await at(page,year,month);await at(monthly,year,month);
    await page.evaluate(()=>{advanceWeek();advanceWeek();advanceWeek();openMeeting();});
    await monthly.evaluate(()=>toMonthEnd());
    expect(await histories(page)).toEqual(await histories(monthly));
    expect(await monthly.evaluate(()=>S.meetingEntry.week)).toBe(1);
    await page.evaluate(()=>document.querySelector('#meeting').classList.remove('on'));
    await monthly.evaluate(()=>document.querySelector('#meeting').classList.remove('on'));
  }
  const cold=await browser.newContext();const fresh=await cold.newPage();await fresh.goto(URL);
  expect(await histories(fresh)).toEqual([]);await expect(fresh.locator('#bottomYm')).toHaveText('2029 / 04');
  await cold.close();await context.close();
});

test('shed fatigue belongs to the existing farmer entity makoto',async({page})=>{
  await page.goto(URL);await at(page,1,2,3);
  const ids=await page.evaluate(()=>{ADHOMS_VER1_STORY_HISTORY.reconcileVisible();return ADHOMS_VER1_STORY_HISTORY.memoriesFor('makoto').map(m=>m.id);});
  expect(ids).toContain('dl19_gaku_shed_fatigue');
});

test('invalid saved week cannot reopen a pending meeting into future facts, but preserves valid draft and weights',async({page})=>{
  await page.goto(URL);
  await page.evaluate(()=>{
    const st=ADHOMS_VER1_STATE.createInitialState();st.year=4;st.month=6;
    localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(st));
    localStorage.setItem('adhoms.ver1.daily.v1',JSON.stringify({version:1,calendar:{year:4,month:6},ui:{week:99,likes:{'keep-me':true},values:{life:77}},meeting:true,reviewOpen:true,reviewValues:{life:89,vital:66}}));
  });
  await page.reload();
  expect(await page.evaluate(()=>S.week)).toBe(1);
  await expect(page.locator('#meeting')).not.toHaveClass(/on/);
  expect((await histories(page)).map(m=>m.id)).not.toContain('dl19_ren_check_time');
  expect(await page.evaluate(()=>S.likes['keep-me'])).toBe(true);
  expect(await page.evaluate(()=>S.values.life)).toBe(77);
  await page.reload();expect(await page.evaluate(()=>S.week)).toBe(1);
  await page.getByRole('button',{name:/月末/}).click();
  await expect(page.locator('.monthlyValues input[data-k="life"]')).toHaveValue('89');
  await expect(page.locator('.monthlyValues input[data-k="vital"]')).toHaveValue('66');
  expect(await page.evaluate(()=>S.meetingEntry.week)).toBe(1);
  expect((await histories(page)).map(m=>m.id)).toContain('dl19_ren_failure_instructions');
});

test('guarded research keeps one definition and resolves reached history only on completion',async({page})=>{
  await page.goto(URL);await at(page,2,6,1);
  await page.evaluate(()=>{ADHOMS_VER1_STORY_HISTORY.reconcileVisible();renderFeed();});
  await page.locator('[data-id="scenario-continuity-y2-m6-w1-ren-2"]').getByRole('button',{name:'＋',exact:true}).click();
  await page.getByRole('button',{name:/1週進む/}).click();
  await page.getByRole('button',{name:/1週進む/}).click();
  await page.locator('[data-id="scenario-continuity-y2-m6-w3-ren-3"]').getByRole('button',{name:'＋',exact:true}).click();
  expect(await page.evaluate(()=>S.research.length)).toBe(1);
  await page.reload();expect(await page.evaluate(()=>S.research.length)).toBe(1);
  await page.getByRole('button',{name:/月末/}).click();await page.locator('.meetingContinue').click();
  const report=page.locator('#feedList [data-research-beat]');await expect(report).toHaveCount(1);
  await expect(report).toContainText('停止値を安定値と誤読');await expect(report).not.toContainText('記録を確認中');
  const complete=await page.evaluate(()=>structuredClone(S.research[0]));
  await page.reload();expect(await page.evaluate(()=>S.research[0])).toEqual(complete);
  await page.evaluate(()=>{ADHOMS_LIGHT_STATE.memories=[];renderFeed();});
  await expect(report).toContainText('停止値を安定値と誤読');
});

test('pending guarded research resolves after history restoration, completed and distinct legacy reports stay unchanged',async({page})=>{
  await page.goto(URL);await at(page,2,6,1);
  await page.locator('[data-id="scenario-continuity-y2-m6-w1-ren-2"]').getByRole('button',{name:'＋',exact:true}).click();
  await page.evaluate(()=>{
    const research=structuredClone(S.research);const st=ADHOMS_VER1_STATE.createInitialState();st.year=2;st.month=7;
    const base={id:'historic',topic:'梅雨入りと排水',title:'以前の確認',result:'以前に確認した固有の報告',due:15,done:true,completedMonth:15};
    localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(st));
    localStorage.setItem('adhoms.ver1.daily.v1',JSON.stringify({version:1,calendar:{year:2,month:7},ui:{week:1,research:[...research,base,{...base,id:'historic-other',result:'別の確認結果'}]},meeting:false}));
  });
  await page.reload();
  const records=await page.evaluate(()=>S.research);
  expect(records).toHaveLength(3);
  expect(records[0].result).toContain('停止値を安定値と誤読');
  expect(records[1].result).toBe('以前に確認した固有の報告');expect(records[2].result).toBe('別の確認結果');
});

test('every primary write at January→February has reached history within its saved calendar',async({page})=>{
  await page.goto(URL);await at(page,2,1,4);
  const records=await page.evaluate(()=>{
    const write=ADHOMS_VER1_SESSION.write;window.primarySnapshots=[];
    ADHOMS_VER1_SESSION.write=function(key,record){if(key==='adhoms.ver1.lightstate')primarySnapshots.push(structuredClone(record));return write(key,record);};
    nextMonth();return primarySnapshots;
  });
  expect(records.length).toBeGreaterThan(0);
  for(const record of records){
    for(const memory of record.memories.filter(m=>m.id.startsWith('dl19_'))){
      const index=(y,m)=>(y-1)*12+(m+8)%12;
      expect(index(memory.year,memory.month),memory.id).toBeLessThanOrEqual(index(record.year,record.month));
    }
    if(record.memories.some(m=>m.id==='dl19_gaku_rest_announced'))expect(record).toMatchObject({year:2,month:2});
  }
});

test('corroborating staff and research cannot bypass a missing character-history fact',async({page})=>{
  await page.goto(URL);await at(page,2,6,3);
  await page.evaluate(()=>{ADHOMS_VER1_STORY_HISTORY.reconcileVisible();ADHOMS_LIGHT_STATE.memories=ADHOMS_LIGHT_STATE.memories.filter(m=>m.id!=='dl19_ren_stale_display');renderFeed();});
  const staff=page.locator('[data-id="scenario-continuity-y2-m6-w3-saeki-4"]');
  await expect(staff).not.toContainText('更新時刻を指せた');await expect(staff).toContainText('記録');
  await at(page,3,8,4);
  const data=await page.evaluate(()=>{
    ADHOMS_VER1_STORY_HISTORY.reconcileVisible();ADHOMS_LIGHT_STATE.memories=ADHOMS_LIGHT_STATE.memories.filter(m=>m.id!=='dl19_gaku_tools_taught');renderFeed();
    return {feed:document.querySelector('#feedList').innerText,research:ADHOMS_CONTINUITY.render(ADHOMS_CONTINUITY.packet().research)};
  });
  expect(data.feed).not.toContain('晃生さんが道具の場所を教えるところを見てきました');expect(data.research).not.toContain('晃生は説明時間と作業人数の二重計上を避け');
});

for(const example of [
  {year:4,month:3,memory:'dl19_minato_inquiry_handoff',id:'continuity-y4-m3-w1-kaito-2',phrase:'湊さんから渡されたと言うだけでは'},
  {year:3,month:2,memory:'dl19_ren_minato_test',id:'continuity-y3-m2-w4-ren-5',phrase:'湊さんが止まった理由、操作じゃなくて重さだった'},
  {year:5,month:5,memory:'dl19_minato_next_contact',id:'continuity-y5-m5-w3-minato-4',phrase:'代わりの連絡先へも、今月初めて直接返事が届きました'}
])test(`later reference keeps its canonical dependency: ${example.id}`,async({page})=>{
  await page.goto(URL);await at(page,example.year,example.month,4);
  await page.evaluate(()=>{ADHOMS_VER1_STORY_HISTORY.reconcileVisible();renderFeed();});
  const row=page.locator(`[data-id="scenario-${example.id}"]`);await expect(row).toContainText(example.phrase);
  const result=await page.evaluate(id=>{
    ADHOMS_LIGHT_STATE.memories=ADHOMS_LIGHT_STATE.memories.filter(m=>m.id!==id);
    const before=JSON.stringify(ADHOMS_LIGHT_STATE);renderFeed();
    const packet=ADHOMS_CONTINUITY.packet();
    return {before,after:JSON.stringify(ADHOMS_LIGHT_STATE),meeting:packet.dialogue.map(r=>ADHOMS_CONTINUITY.render(r[1])).join('\n'),research:ADHOMS_CONTINUITY.render(packet.research)};
  },example.memory);
  expect(result.after).toBe(result.before);await expect(row).not.toContainText(example.phrase);await expect(row).toContainText('記録');
  if(example.year===3)expect(result.meeting).not.toContain('湊さんが黙って支えていた重さが分かりました');
  if(example.year===4)expect(result.research).toContain('記録');
  if(example.year===5)expect(result.research).toContain('記録');
});

test('consolidated later-arc sweep retains prior-result dependencies',async({page})=>{
  await page.goto(URL);
  const examples=[
    [2,3,'continuity-y2-m3-w4-ren-4','dl19_ren_stale_display'],
    [4,5,'continuity-y4-m5-w4-minato-5','dl19_minato_inquiry_handoff'],
    [4,3,'continuity-y4-m3-w3-ren-3','dl19_ren_check_time'],
    [5,8,'continuity-y5-m8-w4-minato-4','dl19_minato_next_contact'],
    [5,6,'continuity-y5-m6-w4-ren-3','dl19_ren_failure_instructions']
  ];
  for(const [year,month,id,memory] of examples){
    await at(page,year,month,4);await page.evaluate(()=>{ADHOMS_VER1_STORY_HISTORY.reconcileVisible();renderFeed();});
    const row=page.locator(`[data-id="scenario-${id}"] .post`),known=await row.textContent();
    await page.evaluate(memory=>{ADHOMS_LIGHT_STATE.memories=ADHOMS_LIGHT_STATE.memories.filter(m=>m.id!==memory);renderFeed();},memory);
    expect(await row.textContent(),id).not.toBe(known);await expect(row).toContainText('記録');
  }
});
