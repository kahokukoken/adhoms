const {test,expect}=require('@playwright/test');
const URL=process.env.ADHOMS_TEST_URL||'http://127.0.0.1:8000/';

async function finishFinal(page){
  await page.goto(URL);
  await page.evaluate(()=>showEnding());
  for(let phase=0;phase<6;phase++){
    const next=page.locator('#v1next');
    if(await next.count()) await next.click();
  }
  await page.locator('#v1fin').click();
}

test('Q-05 final result records adopted Machi and Kosei outcomes independently from risk labels',async({page})=>{
  await finishFinal(page);
  const result=await page.evaluate(()=>ADHOMS_VER1_DEBUG.final().session.result);
  expect(result.personalOutcomes.chihiro).toMatchObject({
    survived:true,seriousInjury:false,businessLoss:'major',businessContinuity:'at_risk'
  });
  expect(result.personalOutcomes.gaku).toMatchObject({
    survived:true,stranded:true,injured:true,immediateSportReturn:false
  });
});

test('Q-05 recovery handoff tells the player what actually happened',async({page})=>{
  await finishFinal(page);
  await expect(page.locator('#ver1Choice')).toContainText('高倉真知：生存');
  await expect(page.locator('#ver1Choice')).toContainText('高倉味噌店の設備・蔵・在庫に大きな損失');
  await expect(page.locator('#ver1Choice')).toContainText('柴垣晃生：生存');
  await expect(page.locator('#ver1Choice')).toContainText('取り残される過程で負傷');
  await expect(page.locator('#ver1Choice')).toContainText('すぐ競技へ戻れる状態ではない');
});

test('Q-05 September and March FEED keep both personal consequences in sequence',async({page})=>{
  await finishFinal(page);
  await page.locator('#v1recover').click();
  await expect(page.locator('#bottomYm')).toHaveText('2033 / 09');
  await expect(page.locator('#feedList')).toContainText('高倉 真知');
  await expect(page.locator('#feedList')).toContainText('前と同じように開けられる状態じゃない');
  await expect(page.locator('#feedList')).toContainText('柴垣 晃生');
  await expect(page.locator('#feedList')).toContainText('怪我はした');

  await page.evaluate(()=>{
    ADHOMS_LIGHT_STATE.year=5; ADHOMS_LIGHT_STATE.month=3;
    S.year=6; S.month=3; S.week=4; renderFeed();
  });
  await expect(page.locator('#feedList')).toContainText('店の復旧は終わりじゃない');
  await expect(page.locator('#feedList')).toContainText('競技へ戻る時期は、まだ約束せん');
});

test('Q-05 administrative review names the individual residuals',async({page})=>{
  await finishFinal(page);
  await page.evaluate(()=>{
    const record=ADHOMS_VER1_DEBUG.final();
    record.stage='result';
    ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession',record);
  });
  await page.reload();
  await expect(page.locator('#ver1Choice')).toContainText('個別残差');
  await expect(page.locator('#ver1Choice')).toContainText('高倉味噌店の設備・蔵・在庫に大きな損失');
  await expect(page.locator('#ver1Choice')).toContainText('競技へすぐ戻れる状態ではない');
});

test('Q-05 outcomes survive save/resume',async({page})=>{
  await finishFinal(page);
  const before=await page.evaluate(()=>ADHOMS_VER1_DEBUG.final().session.result.personalOutcomes);
  await page.reload();
  const after=await page.evaluate(()=>ADHOMS_VER1_DEBUG.final().session.result.personalOutcomes);
  expect(after).toEqual(before);
});
