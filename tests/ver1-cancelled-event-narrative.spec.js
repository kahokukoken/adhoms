const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const URL=process.env.ADHOMS_TEST_URL||'http://127.0.0.1:8000/';
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const bridge=read('ver1/ver1-ui-bridge.js');

// Run the production model and the exact production final-day renderer.
// Only DOM presentation and persistence are replaced; no narrative is mocked.
function runtime(){
  const context={structuredClone,console};context.window=context;
  vm.createContext(context);
  for(const name of ['ver1-state','ver1-disaster','ver1-final-event']){
    vm.runInContext(read('ver1/'+name+'.js'),context);
  }
  return context;
}
function render(context,session){
  const h={innerHTML:'',classList:{add(){}},querySelectorAll:()=>[],querySelector:()=>null};
  Object.assign(context,{session:structuredClone(session),stage:'active',h,persist(){},incidentMarkup:()=>'',allocationHistory:()=>'',escapeText:String});
  const labels=bridge.slice(bridge.indexOf('  const FINAL_DECISION_LABELS'),bridge.indexOf('  function load(){'));
  const renderer=bridge.slice(bridge.indexOf('    function personalCrisisMarkup(){'),bridge.indexOf('    function renderRecovery(){'));
  vm.runInContext('{'+labels+renderer+'renderActive();}',context);
  expect(JSON.stringify(context.session),'presentation must not rewrite the session').toBe(JSON.stringify(session));
  return h.innerHTML;
}
function scheduled(context,sumo='cancel',towa='cancel',evacuation='start_now'){
  const api=context.ADHOMS_VER1_FINAL;
  let session=api.createSession(context.ADHOMS_VER1_STATE.createInitialState());
  for(const [key,value] of [['sumo_schedule',sumo],['towa_schedule',towa]]){
    session=api.applyDecision(session,key,value);
  }
  session=api.nextPhase(session);
  session=api.applyDecision(session,'forest_evacuation',evacuation);
  return session;
}
test.describe('cancelled-event narrative model',()=>{
  test('accepted cancellations change noon, evening and personal-crisis situations',()=>{
    const context=runtime(),session=scheduled(context);
    session.phaseIndex=1;
    expect(render(context,session)).toContain('TOWAイベントは中止');
    session.phaseIndex=2;
    const evening=render(context,session);
    expect(evening).toContain('八朔相撲は中止');
    expect(evening).not.toContain('観客集中と衝突');
    expect(evening).toContain('撤収・誘導');
    session.phaseIndex=5;
    const crisis=render(context,session);
    expect(crisis).not.toContain('群衆の移動と本人の避難を切り離せません');
    expect(crisis).toContain('中止');
    expect(crisis).toContain('撤収・誘導');
    expect(crisis).toContain('森林公園の運営側が避難開始を受け入れています');
    expect(crisis).toContain('晃生は八朔相撲会場側で撤収・誘導に残っています');
  });
  test('advance, reduce and keep retain their distinct accepted schedule',()=>{
    const context=runtime(),session=scheduled(context,'advance','reduce');
    session.phaseIndex=2;
    expect(render(context,session)).toContain('前倒し');
    expect(render(context,session)).not.toContain('観客集中と衝突');
    session.phaseIndex=5;
    expect(render(context,session)).toContain('縮小');
    const kept=scheduled(context,'keep','keep');kept.phaseIndex=2;
    expect(render(context,kept)).toContain('観客集中');
  });
  test('missing and mismatching assent are not narrated as accepted cancellation',()=>{
    const context=runtime(),session=scheduled(context);
    delete session.actionResponses;session.phaseIndex=2;
    expect(render(context,session)).toContain('返事は未記録');
    expect(render(context,session)).not.toContain('八朔相撲は中止');
    session.phaseIndex=5;
    expect(render(context,session)).toContain('返事は未記録');
    expect(render(context,session)).not.toContain('群衆の移動と本人の避難を切り離せません');
    session.actionResponses={sumo_schedule:{status:'accepted',choice:'keep',actorId:'sumo_organizer'}};
    session.phaseIndex=2;
    expect(render(context,session)).not.toContain('八朔相撲は中止');
    expect(render(context,session)).toContain('返事は未記録');
    session.actionResponses.sumo_schedule={status:'accepted',choice:'cancel',actorId:'towa_organizer'};
    expect(render(context,session)).toContain('返事は未記録');
    session.actionResponses.sumo_schedule={status:'superseded',choice:'cancel',actorId:'sumo_organizer'};
    expect(render(context,session)).toContain('返事は未記録');
  });
  test('wait is an actor-accepted delay only when the matching response exists',()=>{
    const context=runtime(),session=scheduled(context,'cancel','cancel','wait');session.phaseIndex=5;
    expect(render(context,session)).toContain('避難開始は待機');
    delete session.actionResponses.forest_evacuation;
    expect(render(context,session)).toContain('待機を選んだ記録');
    expect(render(context,session)).not.toContain('遅れへの対応が必要です');
  });
  test('render and JSON resume preserve all numeric effects, assent and fixed outcomes',()=>{
    const context=runtime(),api=context.ADHOMS_VER1_FINAL,session=scheduled(context);
    session.phaseIndex=5;
    const before=JSON.stringify(session),beforeResult=JSON.stringify(api.finalize(session).result);
    const html=render(context,session);
    expect(render(context,JSON.parse(before))).toBe(html);
    expect(JSON.stringify(session)).toBe(before);
    expect(JSON.stringify(api.finalize(session).result)).toBe(beforeResult);
    const result=api.finalize(session).result;
    expect(result.personalOutcomes.gaku.survived).toBe(true);
    expect(result.personalOutcomes.gaku.injured).toBe(true);
    expect(result.personalOutcomes.towa.seriousInjury).toBe(false);
  });
  test('standing support caveats fold without hiding current replies or preparation failures',()=>{
    const context=runtime(),session=scheduled(context);session.phaseIndex=1;
    const html=render(context,session),details=html.match(/<details\b([^>]*)>([\s\S]*?)<\/details>/);
    expect(details).not.toBeNull();
    expect(details[1]).not.toMatch(/\bopen\b/);
    expect(details[2]).toContain('<summary>担当・支援条件を確認</summary>');
    expect(details[2]).toContain('開催や通行は運営・道路管理の担当が判断');
    expect(details[2]).toContain('燃料・倉庫・ドローンは協力条件の記録');
    const visible=html.replace(details[0],'');
    expect(visible).toContain('data-response-key="forest_evacuation"');
    expect(visible).toContain('展開は選べません');
    expect(visible).toContain('現在の選択に基づく見通し');
    expect(visible).toContain('避難上の危険度');
    expect(visible).toContain('data-k="forest_evacuation"');
    delete session.state.supportModelVersion;
    const legacy=render(context,session).replace(/<details\b[^>]*>[\s\S]*?<\/details>/,'');
    expect(legacy).toContain('保存されていない相手の承諾は補っていません');
  });
});

test('cancelled events keep withdrawal stakes across normal final-day clicks and reload',async({page})=>{
  await page.goto(URL);await page.evaluate(()=>showEnding());
  const overlay=page.locator('#ver1Choice');
  for(const key of ['sumo_schedule','towa_schedule'])await overlay.locator(`[data-k="${key}"][data-v="cancel"]`).click();
  await overlay.locator('#v1next').click();
  await expect(overlay.locator('h2')).toContainText('TOWAイベントは中止');
  const details=overlay.locator('details');
  await expect(details).not.toHaveAttribute('open','');
  await details.locator('summary').click();
  await expect(details).toContainText('燃料・倉庫・ドローンは協力条件の記録');
  await expect(details.locator('p').first()).toBeVisible();
  await overlay.locator('[data-k="forest_evacuation"][data-v="start_now"]').click();
  await overlay.locator('#v1next').click();
  await expect(overlay.locator('h2')).toContainText('八朔相撲は中止');
  await expect(overlay.locator('h2')).not.toContainText('観客集中');
  await page.reload();
  await expect(overlay.locator('h2')).toContainText('八朔相撲は中止');
  for(let i=0;i<3;i++)await overlay.locator('#v1next').click();
  await expect(overlay).toContainText('撤収・誘導');
  await expect(overlay).not.toContainText('群衆の移動と本人の避難を切り離せません');
  await page.reload();
  await expect(overlay).toContainText('TOWAイベントは中止');
  await expect(overlay).toContainText('森林公園の運営側が避難開始を受け入れています');
  await overlay.locator('#v1next').click();await overlay.locator('#v1fin').click();
  await expect(overlay).toContainText('取り残される過程で負傷');
  await expect(overlay).toContainText('TOWA：生存。重傷なし');
});
