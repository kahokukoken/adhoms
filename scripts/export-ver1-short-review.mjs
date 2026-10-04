// A bounded reading export from one real route. Never load a user's browser profile,
// seed game state, execute the exported file, or silently choose a missing option.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';

const sha=text=>createHash('sha256').update(text).digest('hex');
const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sceneIds=['meeting','history','ending'];
const defaultSource=()=>path.resolve('dist/ADHOMS-Ver1.html');
// Selection keys/text locate real displayed content; they are never used as
// substitute narrative when a runtime capture is missing.
export const REVIEW_SELECTIONS={
 historyWeek3:['scenario-continuity-y4-m4-w3-matsumoto-1','scenario-continuity-y4-m4-w3-fujii-2','scenario-continuity-y4-m4-w3-minato-5','scenario-continuity-y4-m4-w3-kaito-6'],
 historyWeek4:['scenario-continuity-y4-m4-w4-misaki-1','scenario-continuity-y4-m4-w4-daisuke-2','scenario-continuity-y4-m4-w4-matsumoto-3','scenario-continuity-y4-m4-w4-minato-4','scenario-continuity-y4-m4-w4-kaito-5'],
 julyExchange:[
  'TOWAの方の連絡は、僕にも回してほしい。……真知と晃生の方も。気になる名前の返事だけ待って、ほかの場所を見るのが遅れそうになる。先に言っておく。',
  '三地点とも、情報が届いた時刻と現地で確認した時刻を並べます。所長が待っている返事より、ほかの場所の新しい危険を先に伝える場合もあります。'
 ]
};


function validate(recording){
 if(!recording||JSON.stringify(recording.scenes?.map(s=>s.id))!==JSON.stringify(sceneIds))throw new Error('Exactly three ordered scenes are required.');
 const ids=new Set();
 for(const scene of recording.scenes){
  if(!scene.blocks?.length)throw new Error(`Scene ${scene.id} has no captured text.`);
  for(const block of scene.blocks){
   if(!block.text||block.sha256!==sha(block.text)||!block.source?.selector)throw new Error(`Capture hash/provenance mismatch: ${block.id}`);
   if(!/^[a-z0-9-]+$/.test(block.id)||ids.has(block.id))throw new Error('Invalid or duplicate capture ID.');
   ids.add(block.id);
  }
 }
}

export function renderReviewPack(recording){
 validate(recording);
 const choices=(recording.route.choices||[]).map(c=>`<li><span class="date">${escape(c.period)}</span> ${escape(c.label)}</li>`).join('');
 const sections=recording.scenes.map((scene,index)=>`<section class="scene" id="${scene.id}" aria-labelledby="${scene.id}-title">
 <div class="eyebrow">SCENE ${index+1} / 3 · ${escape(scene.period)}</div><h2 id="${scene.id}-title">${escape(scene.title)}</h2>
 ${scene.blocks.map(b=>`<article class="excerpt ${escape(b.kind)}" data-capture-id="${b.id}"><h3>${escape(b.label)}</h3><div class="verbatim">${escape(b.text)}</div></article>`).join('\n')}
 <a class="next" href="#${sceneIds[index+1]||'top'}">${index<2?'次の場面へ':'先頭へ戻る'} ↑</a></section>`).join('\n');
 return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; connect-src 'none'; img-src 'none'; form-action 'none'; base-uri 'none'">
<meta name="adhoms-source-digest" content="${escape(recording.source.sourceDigest)}"><title>ADHOMS Ver1｜3つの場面</title>
<style>
:root{color-scheme:dark;--bg:#0b1217;--panel:#121d24;--text:#e4edf1;--muted:#a7bcc5;--line:#2e454f;--accent:#9ad5c7}*{box-sizing:border-box}html{scroll-padding-top:1rem}body{margin:0;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,"Noto Sans JP",sans-serif;line-height:1.8;overflow-wrap:anywhere}a{color:var(--accent);text-underline-offset:4px}main{width:min(100%,720px);margin:auto;padding:24px 18px 48px}header{padding:14px 0 26px}h1{font-size:30px;line-height:1.4;letter-spacing:.04em;margin:8px 0 18px}h2{font-size:25px;line-height:1.5;margin:8px 0 24px}h3{font-size:14px;font-weight:600;color:var(--accent);margin:0 0 12px;line-height:1.6}.eyebrow{font-size:12px;letter-spacing:.09em;color:var(--muted)}p{font-size:16px}nav{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0}nav a{flex:1 1 150px;display:block;padding:12px;border:1px solid var(--line);border-radius:10px;text-decoration:none;background:var(--panel);font-size:16px}nav a:hover,nav a:focus-visible{border-color:var(--accent);outline:2px solid var(--accent);outline-offset:3px}.note{color:var(--muted);font-size:14px}details{border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:18px 0}summary{cursor:pointer;font-size:15px;color:var(--accent)}details ol{padding-left:20px;font-size:14px}details li{padding:6px 0}.date{color:var(--muted)}.scene{border-top:1px solid var(--line);padding-top:32px;margin-top:30px;scroll-margin-top:16px}.excerpt{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:18px;margin:14px 0}.excerpt.choice{border-left:3px solid var(--accent)}.verbatim{font-size:16px;line-height:1.95;white-space:pre-wrap;overflow-wrap:anywhere}.next{display:inline-block;padding:14px 0;font-size:16px}footer{margin-top:36px;border-top:1px solid var(--line);padding-top:18px;color:var(--muted);font-size:12px}@media(max-width:360px){main{padding:18px 12px 36px}.excerpt{padding:14px}h1{font-size:27px}h2{font-size:23px}}@media print{body{background:white;color:black}.excerpt{background:white;color:black;border-color:#aaa}nav,details,.next{display:none}.scene{break-before:page}.verbatim{font-size:11pt}h3,.eyebrow,footer{color:#333}}
</style></head><body><main id="top"><header><div class="eyebrow">ADHOMS Ver1 · READING EXCERPTS</div><h1>3つの場面</h1>
<p>会議、後年のFEED、そして豪雨後へ。通常の操作で進めた一つの経路から、表示された文章を抜き出しました。</p>
<p class="note">終盤の展開を含みます。読むだけの確認用ファイルです。インターネット接続は不要で、ゲームの進行・保存には触れません。</p>
<nav aria-label="3つの場面"><a href="#meeting">01 会議</a><a href="#history">02 後年のFEED</a><a href="#ending">03 判断とその後</a></nav>
<p class="note">記録経路：2029年4月の新規開始から、各月の第1〜4週を読み、月末会議へ進行。以下の選択は、この記録を作るために選んだ一例です。唯一の正解や物語の確定ルートを示すものではありません。</p>
<details><summary>この経路で選んだことを見る</summary><ol>${choices}</ol></details></header>
${sections}
<footer>本文は実際の表示から記録。場面の間の月・投稿は省略しています。短い抜粋であり、全編・全分岐の確認や人間の体験承認を示すものではありません。<br>記録元：${escape(recording.source.revision)}<br>元のHTML SHA-256：${escape(recording.source.htmlSha256)}</footer>
</main></body></html>\n`;
}

export function writeReviewPack(recording,outputDirectory='test-results/short-review'){
 const html=renderReviewPack(recording);
 fs.mkdirSync(outputDirectory,{recursive:true});
 const htmlPath=path.resolve(outputDirectory,'ADHOMS-Ver1-Short-Review.html');
 fs.writeFileSync(htmlPath,html);
 // Project only declared capture fields. Never serialize a browser context or save.
 const capture={version:1,source:{revision:recording.source.revision,sourceDigest:recording.source.sourceDigest,htmlSha256:recording.source.htmlSha256},route:{kind:recording.route.kind,months:recording.route.months,initialStorageEmpty:recording.route.initialStorageEmpty,choices:recording.route.choices.map(({period,selector,label})=>({period,selector,label}))},scenes:recording.scenes.map(({id,title,period,blocks})=>({id,title,period,blocks:blocks.map(({id,kind,label,text,source,sha256})=>({id,kind,label,text,source:{selector:source.selector,period:source.period},sha256}))})),errors:[...(recording.errors||[])]};
 fs.writeFileSync(path.join(outputDirectory,'capture.json'),JSON.stringify(capture,null,2)+'\n');
 const manifest={version:1,source:capture.source,htmlSha256:sha(html),captureSha256:sha(JSON.stringify(capture,null,2)+'\n'),sceneIds,blockCount:capture.scenes.reduce((n,s)=>n+s.blocks.length,0),readOnly:true,scriptFree:true};
 fs.writeFileSync(path.join(outputDirectory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 return {htmlPath,manifest};
}

export async function captureShortReview({browser,source=defaultSource()}={}){
 // Refuse stale dist: capture is always bound to a checked standalone source.
 execFileSync(process.execPath,['scripts/build-standalone.mjs','--check'],{stdio:'pipe'});
 const html=fs.readFileSync(source,'utf8');
 const sourceDigest=html.match(/name="adhoms-source-digest" content="([a-f0-9]{64})"/)?.[1];
 if(!sourceDigest)throw new Error('Source standalone has no verified source digest.');
 const manifest=JSON.parse(fs.readFileSync(path.resolve('dist/manifest.json'),'utf8'));
 if(sha(html)!==manifest.htmlSha256)throw new Error('Capture source differs from the checked standalone.');
 const recording={version:1,source:{revision:manifest.sourceRevision,sourceDigest,htmlSha256:sha(html)},route:{kind:'weekly',months:[],choices:[],initialStorageEmpty:false},scenes:[
  {id:'meeting',title:'頼める日と、引き受けられる範囲',period:'2029年4〜5月',blocks:[]},
  {id:'history',title:'「前も頼めた」を、次の約束にしない',period:'2032年4月',blocks:[]},
  {id:'ending',title:'誰を先に。そして、残ったもの',period:'2033年7月〜2034年3月',blocks:[]}
 ],errors:[]};
 const owned=!browser;browser??=await chromium.launch();
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const initial=await context.storageState();recording.route.initialStorageEmpty=initial.cookies.length===0&&initial.origins.length===0;
 const page=await context.newPage();page.on('pageerror',e=>recording.errors.push(e.message));
 const overlay=page.locator('#ver1Choice');
 let period='',blockNumber=0;
 const add=(scene,kind,label,text,selector)=>{
  if(!text.trim())throw new Error(`Empty capture: ${label}`);
  recording.scenes[scene].blocks.push({id:`capture-${++blockNumber}`,kind,label,text,source:{selector,period},sha256:sha(text)});
 };
 const capture=async(scene,label,selector,kind='text')=>add(scene,kind,label,await page.locator(selector).innerText(),selector);
 async function choose(selector,{scene,label}={}){
  const button=page.locator(selector);await button.waitFor({state:'visible'});
  const text=await button.innerText();recording.route.choices.push({period,selector,label:text});
  if(scene!==undefined)add(scene,'choice',label||'この経路の選択',text,selector);
  await button.click();
 }
 async function feedCards(scene,selector,label){
  const cards=page.locator(selector);
  const count=await cards.count();if(!count)throw new Error(`No visible FEED excerpt: ${selector}`);
  for(let i=0;i<count;i++){
   const card=cards.nth(i);const id=await card.getAttribute('data-id');
   const pieces=await card.locator('.who,.profileLine,.replyto,.post').allInnerTexts();
   add(scene,'feed',label,pieces.join('\n'),`#feedList .card[data-id="${id}"]`);
  }
 }
 async function pending(){
  // Existing event presentation is deferred 120–160 ms after month advance.
  await page.waitForLoadState('load');await page.waitForTimeout(260);
  period=await page.locator('#bottomYm').innerText();
  for(let i=0;i<8;i++){
   if(!await overlay.isVisible())return;
   if(await overlay.locator('[data-k]').count()||await overlay.locator('#v1close').count())return;
   const c=await overlay.locator('[data-c]').evaluateAll(es=>es.map(e=>e.dataset.c));
   if(c.length){
    const choice=['guided_watch','food_source','trunk_first'].find(id=>c.includes(id));
    if(!choice)throw new Error('No declared representative event choice.');
    await choose(`#ver1Choice [data-c="${choice}"]`);
   }else if(await overlay.locator('[data-s]').count()){
    await capture(1,'四年目の協力相談','#ver1Choice');await choose('#ver1Choice [data-s="deepen"]',{scene:1});
   }else if(await overlay.locator('[data-revisit]').count())await choose('#ver1Choice [data-revisit="burden"]');
   else if(await overlay.locator('#v1ok').count())await choose('#ver1Choice #v1ok');
   else if(await overlay.locator('#v1directive').count())await choose('#ver1Choice #v1directive');
   else throw new Error(`Unrecognized pending scene: ${(await overlay.innerText()).slice(0,150)}`);
   await page.waitForTimeout(50);
  }
  throw new Error('Pending scenes did not settle.');
 }
 async function meeting(index){
  await page.locator('#toMonthEnd').click();
  if(index===0){
   for(const selector of ['#meeting #meetTitle','#meeting .meetingContext','#meeting .meetingPrelude','#meeting .meetingThread']){
    if(await page.locator(selector).count()&&await page.locator(selector).isVisible())await capture(0,'四月の月末会議',selector);
   }
  }
  if(index===51){
   for(const line of REVIEW_SELECTIONS.julyExchange){
    const selector=`#meeting .meetingThread .bubble:has(.meetingLine:text-is(${JSON.stringify(line)}))`;
    await capture(2,'七月の月末会議',selector);
   }
  }
  await page.locator('.meetingContinue').click();await pending();
 }
 async function finalDay(){
  const preferred={sumo_schedule:'advance',towa_schedule:'advance',portable_shelter:'full',mobile_command:'standby',forest_evacuation:'start_now',traffic_priority:'residents',sumo_evacuation:'start_now',route_closure:'early',vehicle_allocation:'balanced',reroute:'distributed',shelter_rebalance:'move_people',portable_redeploy:'move_highground',logistics_reallocate:'critical_sites',priority_override:'manual_override',personal_vehicle_allocation:'forest'};
  for(let phase=0;phase<6;phase++){
   const keys=await overlay.locator('[data-k]').evaluateAll(es=>[...new Set(es.map(e=>e.dataset.k))]);
   if(!keys.length)throw new Error(`No normal decision buttons in phase ${phase}`);
   if(phase===5)await capture(2,'個人危機・選択前','#ver1Choice');
   // Manual override reveals its target only after the first choice: enumerate again.
   const done=new Set();
   for(let turn=0;turn<8;turn++){
    const current=await overlay.locator('[data-k]').evaluateAll(es=>[...new Set(es.map(e=>e.dataset.k))]);
    const key=current.find(k=>!done.has(k));if(!key)break;done.add(key);
    let selector=`#ver1Choice [data-k="${key}"][data-v="${preferred[key]}"]`;
    if(!await page.locator(selector).count()){
     // A prepared-capability choice can be unavailable; record the explicit no-use option.
     const fallback={portable_shelter:'none',portable_redeploy:'hold'}[key];
     if(!fallback)throw new Error(`Declared choice is unavailable: ${key}`);
     selector=`#ver1Choice [data-k="${key}"][data-v="${fallback}"]`;
    }
    await choose(selector,phase===5?{scene:2}:{});
   }
   if(phase===5){
    const text=await overlay.locator('[data-response-key],.ver1Forecast,.ver1Status').allInnerTexts();
    add(2,'text','個人危機・選択後',text.join('\n\n'),'#ver1Choice [data-response-key], #ver1Choice .ver1Forecast, #ver1Choice .ver1Status');
   }
   await overlay.locator('#v1next').click();
  }
  await overlay.locator('#v1fin').click();await capture(2,'豪雨の収束','#ver1Choice');
  await overlay.locator('#v1recover').click();await pending();
 }
 try{
  await page.goto(pathToFileURL(path.resolve(source)).href);await pending();
  for(let index=0;index<60;index++){
   const actual=await page.evaluate(()=>monthIndex());if(actual!==index)throw new Error(`Calendar ${actual}, expected ${index}`);
   period=await page.locator('#bottomYm').innerText();recording.route.months.push(period);
   if(index===52){await finalDay();continue;}
   if(index===0){
    const bus=page.locator('#feedList .card').filter({hasText:'朝のバスのことで相談です'}).first();
    const id=await bus.getAttribute('data-id');await feedCards(0,`#feedList .card[data-id="${id}"]`,'四月の相談');
    await bus.getByRole('button',{name:'＋',exact:true}).click();
    recording.route.choices.push({period,selector:`#feedList .card[data-id="${id}"]`,label:'田中美咲の朝のバスの投稿に「＋」観測'});
   }
   if(index===1){
    await feedCards(0,'#feedList [data-support-case="bus"]','五月の調査・照合');
    await page.locator('[data-support-case="bus"]').getByRole('button',{name:'⌕ 詳細',exact:true}).click();
    await capture(0,'調整案を読む','#sheetBody');await choose('[data-support-choice="coordinate_days"]',{scene:0});
   }
   if(index===36)await feedCards(1,'#feedList .card[data-id^="scenario-continuity-y4-m4-w1-"]','四月・第1週');
   if(index===53){
    await feedCards(2,'#feedList .card[data-id="history-y5-machi-after-rain"],#feedList .card[data-id="history-y5-kosei-after-rain"]','九月の復旧');
   }
   const optional=page.locator('.ver1OptionalCard');
   if(index<12&&await optional.count()&&await optional.locator('button[data-optional-choice]').count()){
    const choice={3:'live_test',4:'compare_takes',5:'service_flow',6:'counter_flow'}[index];
    if(!choice)throw new Error(`Unexpected optional event at ${period}`);
    await choose(`.ver1OptionalCard [data-optional-choice="${choice}"]`);
   }
   for(let week=2;week<=4;week++){
    await page.locator('#nextWeek').click();
    if(index===1&&week===2)await feedCards(0,'#feedList [data-support-reply="bus"]','相手からの返事');
    if(index===36&&week===2){
     await feedCards(1,'#feedList .card[data-id^="scenario-continuity-y4-m4-w2-"]','四月・第2週');
     await feedCards(1,'#feedList .card[data-id="history-proposal-response-y4_strategy"]','準備依頼への返事');
    }
    if(index===36&&(week===3||week===4)){
     const ids=week===3?REVIEW_SELECTIONS.historyWeek3:REVIEW_SELECTIONS.historyWeek4;
     await feedCards(1,ids.map(id=>`#feedList .card[data-id="${id}"]`).join(','),`四月・第${week}週`);
    }
   }
   await meeting(index);
  }
  for(const [button,label] of [['#v1close','行政評価'],['#v1privateclose','TOWAとの会話'],['#v1directive4','木曽指令第4号'],['#v1epclose','エピローグ']]){
   await overlay.locator(button).waitFor({state:'visible'});await capture(2,label,'#ver1Choice');await overlay.locator(button).click();
  }
  if(recording.errors.length)throw new Error(recording.errors.join('\n'));
  validate(recording);return recording;
 }finally{await context.close();if(owned)await browser.close();}
}

if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)){
 const recording=await captureShortReview();
 const result=writeReviewPack(recording,process.env.ADHOMS_SHORT_REVIEW_DIR||'test-results/short-review');
 console.log(JSON.stringify({htmlPath:result.htmlPath,...result.manifest},null,2));
}
