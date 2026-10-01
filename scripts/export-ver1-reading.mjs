// Actual player routes: click normal controls, retain chronological visible text.
// No design notes or expected interpretations are included in reader packets.
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const route=process.argv[2]||'weekly';
if(!['weekly','monthly'].includes(route))throw new Error('route must be weekly or monthly');
const out=process.env.ADHOMS_READING_DIR||'test-results/reading';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const years={1:[],2:[],3:[],4:[],5:[]},metrics=[];
const file=pathToFileURL(path.resolve('dist/ADHOMS-Ver1.html')).href;
const overlay=page.locator('#ver1Choice');
const capture=async locator=>await locator.innerText();
const currentYear=async()=>page.evaluate(()=>Math.floor(monthIndex()/12)+1);
async function recordOverlay(button){
 const y=await currentYear();years[y].push(await capture(overlay));
 const choice=overlay.locator(button);years[y].push('選択：'+await choice.innerText());await choice.click();
}
async function pending(){
 // Milestone observers can insert a directive after the current choice closes.
 await page.waitForLoadState('load');
 await page.waitForTimeout(200);
 for(let tries=0;tries<6;tries++){
  await page.waitForTimeout(40);
  if(!await overlay.count()||!await overlay.evaluate(e=>e.classList.contains('on')))return;
  if(await overlay.locator('[data-c]').count()){
   const choices=await overlay.locator('[data-c]').evaluateAll(es=>es.map(e=>e.dataset.c));
   const selected=['guided_watch','food_source','welfare_first'].find(x=>choices.includes(x));await recordOverlay(`[data-c="${selected}"]`);
  }else if(await overlay.locator('[data-s]').count())await recordOverlay(route==='weekly'?'[data-s="deepen"]':'[data-s="authority"]');
  else if(await overlay.locator('[data-revisit]').count())await recordOverlay(route==='weekly'?'[data-revisit="burden"]':'[data-revisit="cooperation"]');
  else if(await overlay.locator('#v1ok').count())await recordOverlay('#v1ok');
  else if(await overlay.locator('#v1directive').count())await recordOverlay('#v1directive');
  else return;
 }
}
async function feed(week){
 const result=await page.locator(`#feedList .card[data-week="${week}"]`).evaluateAll(cards=>cards.map(card=>({id:card.dataset.id,week:Number(card.dataset.week),who:card.querySelector('.who').firstChild.textContent.trim(),profile:card.querySelector('.profileLine').textContent,text:card.querySelector('.post').textContent,reply:card.querySelector('.replyto')?.textContent||''})));
 const y=await currentYear();years[y].push(...result.map(p=>`${p.who}（${p.profile}）\n${p.reply?p.reply+'\n':''}${p.text}`));return result;
}
async function meeting(){
 await page.locator('#toMonthEnd').click();
 const blocks=await page.locator('#meeting').evaluate(e=>[e.querySelector('#meetTitle'),...e.querySelectorAll('.meetingContext,.meetingPrelude,.meetingObservations>h2,.meetingCatchup,.meetingThread,.annualReport')].filter(Boolean).map(n=>n.innerText).join('\n\n'));
 years[await currentYear()].push(blocks);
 await page.locator('.meetingContinue').click();await pending();
}
try{
 await page.goto(file);await pending();
 for(let index=0;index<60;index++){
  const actual=await page.evaluate(()=>monthIndex());
  if(actual!==index)throw new Error(`Calendar ${actual}, expected ${index}`);
  console.log('reading',route,index);
  const y=Math.floor(index/12)+1;
  years[y].push(`\n# ${await page.locator('#bottomYm').innerText()}\n`);
  if(index===52){
   for(let phase=0;phase<6;phase++){
    years[5].push(await capture(overlay));
    const keys=await overlay.locator('[data-k]').evaluateAll(es=>[...new Set(es.map(e=>e.dataset.k))]);
    for(const key of keys){const b=overlay.locator(`[data-k="${key}"]`).first();years[5].push('選択：'+await b.innerText());await b.click();const response=overlay.locator(`[data-response-key="${key}"]`);if(await response.count())years[5].push(await capture(response));}
    years[5].push(await capture(overlay.locator('.ver1Forecast')));
    await overlay.locator('#v1next').click();
   }
   await recordOverlay('#v1fin');await recordOverlay('#v1recover');
   // Recovery starts in September; the ordinary August feed was behind the event.
   metrics.push({index,route,event:'six-phase-disaster'});continue;
  }
  const optional=page.locator('.ver1OptionalCard');
  if(index<12&&await optional.count()){
    const buttons=optional.locator('button[data-optional-choice]');
    if(await buttons.count()){
      years[1].push(await optional.innerText());
      const preferred={3:'live_test',4:'compare_takes',5:'service_flow',6:'counter_flow'}[index];
      const button=optional.locator(`[data-optional-choice="${preferred}"]`);
      years[1].push('選択：'+await button.innerText());await button.click();
      years[1].push(await optional.locator('.ver1OptionalDone').innerText());
    }
  }
  let ids=await feed(1);
  if(index===0){
    const bus=page.locator('#feedList .card').filter({hasText:'朝のバスのことで相談です'}).first();
    years[1].push('操作：田中美咲の朝のバスの投稿に＋観測');
    await bus.getByRole('button',{name:'＋',exact:true}).click();
  }
  if(index===1){
    await page.locator('[data-support-case="bus"]').getByRole('button',{name:'⌕ 詳細',exact:true}).click();
    years[1].push(await capture(page.locator('#sheetBody')));
    const proposal=page.locator(route==='weekly'?'[data-support-choice="coordinate_days"]':'[data-support-choice="ask_timetable"]');
    years[1].push('選択：'+await proposal.innerText());await proposal.click();
  }
  if(route==='weekly')for(let w=2;w<=4;w++){await page.locator('#nextWeek').click();ids.push(...await feed(w));}
  metrics.push({index,route,ids:ids.map(p=>p.id)});
  await meeting();
 }
 for(const stage of ['#v1close','#v1privateclose','#v1directive4','#v1epclose'])if(await overlay.locator(stage).count())await recordOverlay(stage);
 if(errors.length)throw new Error(errors.join('\n'));
 for(const [year,parts] of Object.entries(years))fs.writeFileSync(path.join(out,`${route}-year${year}.md`),parts.join('\n\n')+'\n');
 fs.writeFileSync(path.join(out,`${route}-metrics.json`),JSON.stringify({route,errors,months:metrics},null,2));
 console.log(JSON.stringify({route,months:metrics.length,years:Object.keys(years),errors}));
}catch(error){console.error({url:page.url(),errors,index:await page.evaluate(()=>typeof monthIndex==='function'?monthIndex():null).catch(()=>null),body:(await page.locator('body').innerText()).slice(0,1500)});throw error;}finally{await browser.close();}
