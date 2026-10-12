const {test,expect}=require('@playwright/test');
const URL='http://127.0.0.1:8000/';

async function enterPretrial(page){
  await page.goto(URL);
  await expect(page.locator('#adhomsPretrialLaunch')).toBeVisible();
  await page.locator('#adhomsStartTrial').click();
  await expect(page.locator('#adhomsPretrialOverlay')).toContainText('T-0WA');
  await page.locator('#adhomsIntroNext').click();
  await expect(page.locator('#adhomsPretrialOverlay')).toContainText('宮下 沙耶');
  await page.locator('#adhomsStaffNext').click();
}

test('V1-15: the disaster-drill pretrial completes four weekly FEED/meeting/decision loops',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await enterPretrial(page);
  for(let week=1;week<=4;week++){
    const trial=page.locator('#adhomsPretrialOverlay');
    await expect(trial).toContainText('第'+week+'週');
    await trial.locator('.adhomsTrialWeights button[data-weight="high"]').first().click();
    await trial.locator('#adhomsRunAnalysis').click();
    await expect(trial).toContainText('ADHOMS分析と検討');
    await expect(trial.locator('.adhomsTrialChoice')).toHaveCount(3);
    await expect(trial).toContainText('宮下 沙耶');
    await trial.locator('.adhomsTrialChoice input').last().check();
    await trial.locator('#adhomsConfirmProposal').click();
  }
  await expect(page.locator('#adhomsPretrialOverlay')).toContainText('条件付きで承認');
  const record=await page.evaluate(()=>ADHOMS_VER1_PRETRIAL.getState());
  expect(record.decisions.map(x=>x.week)).toEqual([1,2,3,4]);
  await page.locator('#adhomsStartMain').click();
  await expect(page.locator('#adhomsPretrialOverlay')).toHaveCount(0);
  await expect(page.locator('#bottomYm')).toHaveText('2029 / 04');
  await expect(page.locator('#feedList .card').first()).toContainText('T-0WA');
  await page.reload();
  await expect(page.locator('#adhomsPretrialLaunch')).toHaveCount(0);
  expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.pretrial?.completed)).toBe(true);
});

test('V1-15: a weekly pretrial meeting resumes with its unfinished choice',async({page})=>{
  await enterPretrial(page);
  await page.locator('#adhomsRunAnalysis').click();
  await page.locator('.adhomsTrialChoice input').nth(1).check();
  await page.reload();
  await expect(page.locator('#adhomsPretrialOverlay')).toContainText('第1週・スタッフ会議');
  await expect(page.locator('.adhomsTrialChoice input').nth(1)).toBeChecked();
  await page.locator('#adhomsConfirmProposal').click();
  expect(await page.evaluate(()=>ADHOMS_VER1_PRETRIAL.getState().decisions.length)).toBe(1);
  await expect(page.locator('#adhomsPretrialOverlay')).toContainText('第2週・FEED');
});

test('V1-16/18: FEED weights change recommendation scores; Kiso decision persists to next month',async({page})=>{
  await page.goto(URL);
  let comparison=await page.evaluate(()=>{
    const posts=ADHOMS_VER1_DECISION_CYCLE.analyze().posts;
    if(!posts.length)throw Error('No current-month observations');
    const ids=posts.map(p=>p.id);
    const first=ADHOMS_VER1_DECISION_CYCLE.analyze().plans.map(p=>({id:p.id,score:p.score}));
    for(const id of ids){S.likes[id]=true;S.minus[id]=false;}
    const heavy=ADHOMS_VER1_DECISION_CYCLE.analyze().plans.map(p=>({id:p.id,score:p.score}));
    for(const id of ids){S.likes[id]=false;S.minus[id]=true;}
    const light=ADHOMS_VER1_DECISION_CYCLE.analyze().plans.map(p=>({id:p.id,score:p.score}));
    S.likes={};S.minus={};return {first,heavy,light};
  });
  const byId=list=>Object.fromEntries(list.map(p=>[p.id,p.score]));
  expect(comparison.heavy.some(p=>p.score!==byId(comparison.light)[p.id])).toBe(true);
  await page.locator('#toMonthEnd').click();
  await expect(page.locator('.adhomsDecision')).toBeVisible();
  await expect(page.locator('.adhomsDecision')).toContainText('提案先');
  const candidate=await page.locator('.adhomsOption input').nth(1).inputValue();
  await page.locator('.adhomsOption input').nth(1).check();
  await page.locator('.meetingContinue').click();
  await expect(page.locator('#bottomYm')).toHaveText('2029 / 05');
  expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.researchWorkflow.decisions.length)).toBe(1);
  expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.researchWorkflow.decisions[0].choiceId)).toBe(candidate);
  await expect(page.locator('#feedList')).toContainText('先月の木曽決定');
  await page.reload();
  await expect(page.locator('#feedList')).toContainText('先月の木曽決定');
  expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.researchWorkflow.decisions.length)).toBe(1);
});