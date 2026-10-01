const {test,expect}=require('@playwright/test');
const URL=process.env.ADHOMS_REFERENCE_TEST_URL||'http://127.0.0.1:8000/';
const nextMonth=async page=>{await page.locator('#toMonthEnd').click();await page.locator('.meetingContinue').click();};
const toJune=async page=>{await nextMonth(page);await nextMonth(page);await page.locator('#toMonthEnd').click();};

// Removing either the legacy labels or the canonical distinction must fail this
// test, even when all four numeric values still happen to be equal to defaults.
test('DL-007 / legacy reference values remain visible and are distinct from current trust',async({page})=>{
  await page.goto(URL);
  for(const id of ['cp','cl','cf']){
    await expect(page.locator(`#${id}`).locator('..')).toContainText('旧参考値');
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator('#ct').locator('..')).toContainText('現在値');
  const before=await page.evaluate(()=>({pop:S.pop,life:S.life,fisc:S.fisc,trust:S.trust,state:ADHOMS_LIGHT_STATE}));
  expect(before.trust).toBe(35+before.state.town.trust*12);
  await page.getByRole('button',{name:'数値の扱い',exact:true}).click();
  await expect(page.locator('#sheetBody')).toContainText('旧版の参考値');
  await expect(page.locator('#sheetBody')).toContainText('初期値または旧保存値');
  await expect(page.locator('#sheetBody')).toContainText('現在のシミュレーション状態や豪雨の結果には連動しません');
  await expect(page.locator('#sheetBody')).toContainText('信頼は現在のシミュレーション状態に連動します');
  expect(await page.evaluate(()=>({pop:S.pop,life:S.life,fisc:S.fisc,trust:S.trust,state:ADHOMS_LIGHT_STATE}))).toEqual(before);
  await page.locator('#ov .close').click();
  await expect(page.locator('#feedList .card').first()).toContainText('おはようございます、木曽所長。あなたの親愛なるAI、T-0WAです。');
});

test('V1-13 / nondefault legacy saved values survive two reloads with truthful labels',async({page})=>{
  await page.goto(URL);
  // A real same-run save boundary retains the old snapshot fields, including
  // values different from fresh defaults. The display change must not migrate them.
  await page.evaluate(()=>{S.pop=7998;S.life=66;S.fisc=43;updateTop();});
  await page.locator('#nextWeek').click();
  for(let n=0;n<2;n++){
    await page.reload();
    await expect(page.locator('#cp')).toHaveText('7,998');
    await expect(page.locator('#cl')).toHaveText('66');
    await expect(page.locator('#cf')).toHaveText('43');
    await expect(page.locator('#cp').locator('..')).toContainText('旧参考値');
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('adhoms.ver1.daily.v1')));
    expect({pop:saved.ui.pop,life:saved.ui.life,fisc:saved.ui.fisc,week:saved.ui.week}).toEqual({pop:7998,life:66,fisc:43,week:2});
    expect(await page.evaluate(()=>S.trust)).toBe(await page.evaluate(()=>35+ADHOMS_LIGHT_STATE.town.trust*12));
  }
});

for(const width of [320,390]){
  test(`DL-003 / ${width}px reference labels and record-only controls remain readable and reachable`,async({page},info)=>{
    await page.setViewportSize({width,height:844});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(URL);
    await expect(page.locator('#cp').locator('..')).toContainText('旧参考値');
    const geometry=await page.locator('header').evaluate(el=>({height:el.getBoundingClientRect().height,width:document.documentElement.scrollWidth,labels:[...el.querySelectorAll('.metricKind')].map(n=>({size:parseFloat(getComputedStyle(n).fontSize),left:n.getBoundingClientRect().left,right:n.getBoundingClientRect().right}))}));
    expect(geometry.width).toBeLessThanOrEqual(width);
    expect(geometry.height).toBeLessThan(280);
    expect(geometry.labels).toHaveLength(4);
    for(const label of geometry.labels){expect(label.size).toBeGreaterThanOrEqual(13);expect(label.left).toBeGreaterThanOrEqual(0);expect(label.right).toBeLessThanOrEqual(width);}
    await page.screenshot({path:info.outputPath(`reference-header-${width}.png`)});
    await page.getByRole('button',{name:'数値の扱い',exact:true}).click();
    await expect(page.locator('#sheetBody')).toBeVisible();
    await page.screenshot({path:info.outputPath(`reference-explanation-${width}.png`)});
    await page.locator('#ov .close').click();
    for(let month=4;month<=6;month++){
      await page.locator('#toMonthEnd').click();
      const title=await page.locator('#meetTitle').boundingBox();
      expect(title.y).toBeGreaterThanOrEqual(0);expect(title.y+title.height).toBeLessThan(844);
      if(month<6){await expect(page.locator('.monthlyValues input')).toHaveCount(0);await page.locator('.meetingContinue').click();}
    }
    await expect(page.locator('.quarterlyReview summary')).toContainText('記録のみ');
    await expect(page.locator('.quarterlyReview input')).toHaveCount(5);
    await expect(page.locator('.quarterlyReview input').first()).toBeHidden();
    await page.locator('.quarterlyReview summary').click();
    await page.locator('.quarterlyReview').scrollIntoViewIfNeeded();
    await expect(page.locator('.quarterlyReview')).toContainText('FEEDの内容・順序、調査、シミュレーションの結果には影響しません');
    expect(await page.locator('.meetingCard').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await page.screenshot({path:info.outputPath(`quarterly-record-${width}.png`)});
    await page.locator('.meetingContinue').click();
    await expect(page.locator('#bottomYm')).toHaveText('2029 / 07');
    expect(errors).toEqual([]);
  });
}

test('V1-05/13 / quarterly record-only drafts and committed values retain their save contract',async({page})=>{
  await page.goto(URL);await toJune(page);
  await expect(page.locator('.quarterlyReview summary')).toContainText('記録のみ');
  await page.locator('.quarterlyReview summary').click();
  const prior=await page.evaluate(()=>({...S.values}));
  const desired={life:80,vital:20,future:100,tech:45,env:90};
  for(const [key,value] of Object.entries(desired))await page.locator(`.monthlyValues input[data-k="${key}"]`).fill(String(value));
  expect(await page.evaluate(()=>S.values)).toEqual(prior);
  await page.reload();
  await expect(page.locator('.quarterlyReview')).toHaveAttribute('open','');
  for(const [key,value] of Object.entries(desired))await expect(page.locator(`.monthlyValues input[data-k="${key}"]`)).toHaveValue(String(value));
  expect(await page.evaluate(()=>S.values)).toEqual(prior);
  await page.locator('.meetingContinue').click();await page.reload();
  expect(await page.evaluate(()=>S.values)).toEqual(desired);
  await expect(page.locator('#bottomYm')).toHaveText('2029 / 07');
  await expect(page.locator('#meeting')).not.toHaveClass(/on/);
});

test('DL-006/007 / opposite quarterly records do not change FEED, research or canonical July state',async({page,browser})=>{
  await page.goto(URL);await toJune(page);
  await expect(page.locator('.quarterlyReview summary')).toContainText('記録のみ');
  const saved=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));
  const outcomes=[];
  for(const value of [20,100]){
    const context=await browser.newContext();
    const branch=await context.newPage();
    await branch.addInitScript(data=>{if(!sessionStorage.getItem('reference-seeded')){for(const [key,val] of Object.entries(data))localStorage.setItem(key,val);sessionStorage.setItem('reference-seeded','yes');}},saved);
    await branch.goto(URL);
    await branch.locator('.quarterlyReview summary').click();
    for(const input of await branch.locator('.monthlyValues input').all())await input.fill(String(value));
    await branch.locator('.meetingContinue').click();
    await branch.locator('#nextWeek').click();
    outcomes.push(await branch.evaluate(()=>({state:ADHOMS_LIGHT_STATE,research:S.research,feed:[...document.querySelectorAll('#feedList .card')].map(el=>({id:el.dataset.id,text:el.querySelector('.post')?.textContent})),values:S.values})));
    await context.close();
  }
  expect(outcomes[0].values).not.toEqual(outcomes[1].values);
  expect(outcomes[0].state).toEqual(outcomes[1].state);
  expect(outcomes[0].research).toEqual(outcomes[1].research);
  expect(outcomes[0].feed).toEqual(outcomes[1].feed);
});
