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
