const {test,expect}=require('@playwright/test');
const URL=process.env.ADHOMS_TEST_URL||'http://127.0.0.1:8000/';

test('Single State Authority: routine time progress does not mutate legacy world metrics independently',async({page})=>{
  await page.goto(URL);
  const before=await page.evaluate(()=>({
    pop:S.pop,life:S.life,fisc:S.fisc,activity:S.activity,trust:S.trust,resilience:S.resilience,
    light:structuredClone(ADHOMS_LIGHT_STATE)
  }));
  await page.getByRole('button',{name:/1週進む/}).click();
  await page.getByRole('button',{name:/1週進む/}).click();
  const after=await page.evaluate(()=>({
    pop:S.pop,life:S.life,fisc:S.fisc,activity:S.activity,trust:S.trust,resilience:S.resilience,
    light:structuredClone(ADHOMS_LIGHT_STATE)
  }));
  expect(after.pop).toBe(before.pop);
  expect(after.life).toBe(before.life);
  expect(after.fisc).toBe(before.fisc);
  expect(after.activity).toBe(before.activity);
  expect(after.trust).toBe(before.trust);
  expect(after.resilience).toBe(before.resilience);
  expect(after.light).toEqual(before.light);
});

test('Character History Authority: canonical Memory can address major characters',async({page})=>{
  await page.goto(URL);
  const result=await page.evaluate(()=>{
    let state=ADHOMS_VER1_STATE.createInitialState();
    state=ADHOMS_VER1_STATE.addMemory(state,{
      id:'test_toru_history',scope:'culture',tags:['continuity'],note:'recorded event',entities:['kiso','toru']
    });
    return {
      memory:state.memories[0],
      toru:ADHOMS_VER1_STATE.memoriesForEntity(state,'toru'),
      chihiro:ADHOMS_VER1_STATE.memoriesForEntity(state,'chihiro')
    };
  });
  expect(result.memory.entities).toEqual(['kiso','toru']);
  expect(result.toru).toHaveLength(1);
  expect(result.chihiro).toHaveLength(0);
});

test('optional creation records canonical character-addressable Memory',async({page})=>{
  await page.goto(URL);
  const memory=await page.evaluate(()=>{
    ADHOMS_VER1_OPTIONAL.resolveChoice('brine','live_test');
    return ADHOMS_LIGHT_STATE.memories.find(m=>m.id==='optional_brine_genkan');
  });
  expect(memory).toBeTruthy();
  expect(memory.entities).toEqual(expect.arrayContaining(['kiso','toru']));
  expect(memory.source).toEqual({type:'optional-choice',id:'brine:live_test'});
});

test('Perception-to-Decision: completed investigation appears as decision evidence',async({page})=>{
  await page.goto(URL);
  await page.evaluate(()=>{
    S.research=[{
      id:'prior-flood',topic:'梅雨入りと排水',title:'冠水・排水条件を確認',
      result:'前年の調査で、側溝閉塞と搬入口の使用不能を確認した。',due:2,done:true,completedMonth:2
    }];
    ADHOMS_LIGHT_STATE.year=2;ADHOMS_LIGHT_STATE.month=5;
    S.year=2;S.month=5;S.week=4;
    nextMonth();
  });
  await expect(page.locator('#ver1Choice')).toHaveClass(/on/);
  await expect(page.locator('#ver1Choice')).toContainText('過去に確認した判断材料');
  await expect(page.locator('#ver1Choice')).toContainText('側溝閉塞');
  expect(await page.evaluate(()=>ADHOMS_VER1_PERCEPTION.decisionContext('y2_flood').status)).toBe('observed');
});

test('Perception-to-Decision: missing investigation is explicit uncertainty, not fabricated evidence',async({page})=>{
  await page.goto(URL);
  await page.evaluate(()=>{
    S.research=[];
    ADHOMS_LIGHT_STATE.year=2;ADHOMS_LIGHT_STATE.month=5;
    S.year=2;S.month=5;S.week=4;
    nextMonth();
  });
  await expect(page.locator('#ver1Choice')).toHaveClass(/on/);
  await expect(page.locator('#ver1Choice')).toContainText('完了した内部調査はありません');
  await expect(page.locator('#ver1Choice')).toContainText('不確実性');
  expect(await page.evaluate(()=>ADHOMS_VER1_PERCEPTION.decisionContext('y2_flood').status)).toBe('uncertain');
});

test('No Prose-as-State: rendering later continuity does not manufacture canonical history',async({page})=>{
  await page.goto(URL);
  const result=await page.evaluate(()=>{
    ADHOMS_LIGHT_STATE.year=4;ADHOMS_LIGHT_STATE.month=4;
    S.year=4;S.month=4;S.week=4;
    const before=JSON.stringify(ADHOMS_LIGHT_STATE);
    renderFeed();
    const after=JSON.stringify(ADHOMS_LIGHT_STATE);
    return {before,after};
  });
  expect(result.after).toBe(result.before);
});


test('Narrative Provenance: field choices and propagated memories retain machine-readable sources',async({page})=>{
  await page.goto(URL);
  const result=await page.evaluate(()=>{
    let state=ADHOMS_VER1_STATE.createInitialState();
    state=ADHOMS_VER1_EVENTS.resolveChoice(state,'y2_flood','guided_watch');
    const choiceMemory=state.memories.find(m=>m.id==='flood_guided_watch');
    state.year=3;
    const propagated=ADHOMS_VER1_PROPAGATION.applySideEffects(state).state;
    const side=propagated.memories.find(m=>m.id==='y3_flood_guided_watch_spillover');
    const strategy=ADHOMS_VER1_PROPAGATION.resolveYear4Strategy(propagated,'alternative').state;
    const y4=strategy.memories.find(m=>m.id==='y4_strategy_alternative');
    return {choiceMemory,side,y4};
  });
  expect(result.choiceMemory.source).toEqual({type:'choice',id:'y2_flood:guided_watch'});
  expect(result.side.source).toEqual({type:'propagation',id:'y3_flood_guided_watch_spillover'});
  expect(result.y4.source).toEqual({type:'strategy',id:'y4_strategy:alternative'});
});


test('Single State Authority: legacy summary metrics cannot change final disaster outcome',async({page})=>{
  await page.goto(URL);
  const result=await page.evaluate(()=>{
    const state=ADHOMS_VER1_STATE.createInitialState();
    const evaluate=legacy=>{
      Object.assign(S,legacy);
      const session=ADHOMS_VER1_FINAL.createSession(state);
      for(const phase of ADHOMS_VER1_FINAL.PHASES){
        for(const key of phase.decisions||[]){
          const allowed=ADHOMS_VER1_FINAL.availableChoices(session,key);
          if(allowed.length) session.decisions[key]=allowed[0];
        }
      }
      return ADHOMS_VER1_FINAL.finalize(session).result;
    };
    return {
      low:evaluate({pop:1000,life:1,fisc:1,activity:1,trust:1,resilience:1}),
      high:evaluate({pop:999999,life:100,fisc:100,activity:100,trust:100,resilience:100})
    };
  });
  expect(result.high).toEqual(result.low);
});


test('Perception state changes on time progression, never on pure FEED render',async({page})=>{
  await page.goto(URL);
  const result=await page.evaluate(()=>{
    S.research=[{
      id:'timed-research',topic:'梅雨入りと排水',title:'test',result:'test result',
      due:1,done:false
    }];
    const before=JSON.stringify(S.research);
    renderFeed();
    renderFeed();
    const afterRender=JSON.stringify(S.research);
    nextMonth();
    const afterMonth=structuredClone(S.research);
    return {before,afterRender,afterMonth};
  });
  expect(result.afterRender).toBe(result.before);
  expect(result.afterMonth[0].done).toBe(true);
  expect(Number.isFinite(result.afterMonth[0].completedMonth)).toBe(true);
});
