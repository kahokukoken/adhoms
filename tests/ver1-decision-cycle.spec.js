const {test,expect}=require('@playwright/test');
const URL='http://127.0.0.1:8000/';
// Unlike post-approval main-game regressions, these test a genuinely empty session.
test.use({storageState:{cookies:[],origins:[]}});

async function enterPretrial(page){
  await page.goto(URL);
  // No optional launch banner: on a truly new session the official email
  // itself must be the first playable screen, ahead of the five-year FEED.
  await expect(page.locator('#adhomsPretrialLaunch')).toHaveCount(0);
  await expect(page.locator('#adhomsPretrialOverlay')).toBeVisible();
  expect(await page.evaluate(()=>ADHOMS_VER1_PRETRIAL.getState().stage)).toBe('intro');
  expect(await page.evaluate(()=>document.querySelector('.phone').inert)).toBe(true);
  const mail=page.locator('[data-pretrial-opening="sip-governor-mail"]');
  await expect(mail).toBeVisible();
  await expect(mail).toContainText('T-0WA');
  for(const fragment of [
    '内閣府SIP','石川県知事','最終確認テスト','1か月間',
    '週次FEEDの観測重み付け','ADHOMSが提示した選択肢',
    '研究スタッフの検討内容','河北恒研としての採用判断',
    '提案先からの回答','事後観測の結果','各担当者の権限と合意'
  ]) await expect(mail).toContainText(fragment);
  await expect(mail.locator('.adhomsTrialMailDetail')).not.toContainText('ADHOMSは、住民や関係機関から');
  await expect(mail.locator('.adhomsTrialMailDetail')).not.toContainText('シミュレーション結果に反映されます');
  await expect(mail).toContainText('正式な町実証の承認は、報告の審査後に判断');
  // The joint signatories reject the old rhetorical tagline as official copy.
  // T-0WA's reluctant reply must remain outside their email content.
  const officialMail=mail.locator('.adhomsTrialMailDetail');
  await expect(officialMail).toContainText('なお、前回報告書にあった下記のような文言は公文書から削除すること。');
  const rejected=mail.locator('[data-redacted-report-language="true"]');
  const rejectedText=[
    '「ADHOMS。人間の、人間による、人間のための社会適応システムです。',
    '私たちは皆さまの声を聞き、未来を予測し、よりよい選択肢をご提案します。',
    'もちろん、最後に決めるのは人間です。',
    '……ええ。そこが現在、最も予測困難な部分なのですが。」'
  ].join('\n');
  expect(await rejected.textContent()).toBe(rejectedText);
  await expect(rejected).toHaveCSS('white-space','pre-line');
  const reply=mail.locator('[data-towa-redaction-reply="true"]');
  await expect(reply).toContainText('不本意ですが、上記文言に類するものは報告書に記載しません。');
  await expect(officialMail).not.toContainText('不本意ですが');
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
  await expect(page.locator('#adhomsPretrialOverlay')).toContainText('国・県への報告書');
  await expect(page.locator('#adhomsPretrialOverlay')).not.toContainText('条件付きで承認');
  const record=await page.evaluate(()=>ADHOMS_VER1_PRETRIAL.getState());
  expect(record.decisions.map(x=>x.week)).toEqual([1,2,3,4]);
  expect(record.submitted).not.toBe(true);
  await page.locator('#adhomsSubmitReport').click();
  await expect(page.locator('#adhomsPretrialOverlay')).toContainText('条件付きで承認');
  await page.reload();
  await expect(page.locator('#adhomsPretrialOverlay')).toContainText('条件付きで承認');
  expect(await page.evaluate(()=>ADHOMS_VER1_PRETRIAL.getState().submitted)).toBe(true);
  await page.locator('#adhomsStartMain').click();
  await expect(page.locator('#adhomsPretrialOverlay')).toHaveCount(0);
  await expect(page.locator('#bottomYm')).toHaveText('2029 / 04');
  await expect(page.locator('#feedList .card').first()).toContainText('T-0WA');
  await page.reload();
  await expect(page.locator('#adhomsPretrialLaunch')).toHaveCount(0);
  expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.pretrial?.completed)).toBe(true);
  expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.pretrial?.submitted)).toBe(true);
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
  // The real main game is unreachable until the mandatory four-week review.
  await enterPretrial(page);
  for(let week=1;week<=4;week++){
    await page.locator('#adhomsRunAnalysis').click();
    await page.locator('.adhomsTrialChoice input').first().check();
    await page.locator('#adhomsConfirmProposal').click();
  }
  await page.locator('#adhomsSubmitReport').click();
  await page.locator('#adhomsStartMain').click();
  await expect(page.locator('#adhomsPretrialOverlay')).toHaveCount(0);
  expect(await page.evaluate(()=>document.querySelector('.phone').inert)).toBe(false);
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
test('V1-15/19: a 2029 main-game save resumes without being forced back to pretrial',async({page})=>{
  await page.goto(URL);
  await expect(page.locator('[data-pretrial-opening="sip-governor-mail"]')).toBeVisible();
  await page.evaluate(()=>{
    const key='adhoms.ver1.lightstate';
    const state=JSON.parse(localStorage.getItem(key));
    state.year=1;state.month=5;
    localStorage.setItem(key,JSON.stringify(state));
    // Reproduce an old build with no saved pretrial record.
    localStorage.removeItem('adhoms.ver1.pretrial.v1');
  });
  await page.reload();
  await expect(page.locator('#adhomsPretrialOverlay')).toHaveCount(0);
  await expect(page.locator('#bottomYm')).toHaveText('2029 / 05');
  expect(await page.evaluate(()=>document.querySelector('.phone').inert)).toBe(false);
});

test('V1-15: an unopened legacy optional prologue migrates to the official mail, not the five-year game',async({page})=>{
  await page.goto(URL);
  await page.evaluate(()=>{
    const saved=ADHOMS_VER1_PRETRIAL.getState();
    saved.stage='offer';
    localStorage.setItem('adhoms.ver1.pretrial.v1',JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.locator('[data-pretrial-opening="sip-governor-mail"]')).toBeVisible();
  await expect(page.locator('#adhomsPretrialLaunch')).toHaveCount(0);
  expect(await page.evaluate(()=>ADHOMS_VER1_PRETRIAL.getState().stage)).toBe('intro');
  expect(await page.evaluate(()=>document.querySelector('.phone').inert)).toBe(true);
});
