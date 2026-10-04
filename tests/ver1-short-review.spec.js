const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {createHash}=require('node:crypto');
const exporter=path.resolve('scripts/export-ver1-short-review.mjs');
const outputDirectory=path.resolve('test-results/short-review');
const sha=text=>createHash('sha256').update(text).digest('hex');
async function api(){expect(fs.existsSync(exporter),'The short-review exporter must exist').toBe(true);return import(pathToFileURL(exporter).href);}
function fixture(){return {source:{revision:'test-only',sourceDigest:'a'.repeat(64),htmlSha256:'b'.repeat(64)},route:{kind:'weekly',choices:[]},scenes:['meeting','history','ending'].map((id,i)=>({id,title:`場面${i+1}`,period:'test-only',blocks:[{id:`block-${i}`,kind:'text',label:'表示記録',text:i===0?'<script>alert("bad")</script> & <img onerror="bad">':'実画面の文章',source:{selector:'#example',period:'test-only'},sha256:sha(i===0?'<script>alert("bad")</script> & <img onerror="bad">':'実画面の文章')}]}))};}

test('short review renderer contract / text is escaped and only three static scenes are emitted',async()=>{
 const {renderReviewPack}=await api();const html=renderReviewPack(fixture());
 expect(html.match(/<section class="scene"/g)).toHaveLength(3);
 expect(html).toContain('href="#meeting"');expect(html).toContain('href="#history"');expect(html).toContain('href="#ending"');
 expect(html).not.toMatch(/<script\b|<button\b|<form\b|<iframe\b|<[^>]+\son[a-z]+\s*=/i);
 expect(html).toContain('&lt;script&gt;');expect(html).toContain('&amp;');
 expect(html).toContain('Content-Security-Policy');expect(html).toContain("script-src 'none'");
 expect(html).not.toMatch(/(?:src|href)="(?:https?:|file:|javascript:)/i);
});

test('short review renderer contract / unrelated state and saves cannot leak into delivery',async()=>{
 const {renderReviewPack}=await api();const recording=fixture();
 recording.storageState={cookies:['PRIVATE_SAVE_SENTINEL']};recording.scenes[0].save='PRIVATE_SAVE_SENTINEL';recording.source.localPath='/private/source/path';
 const html=renderReviewPack(recording);expect(html).not.toContain('PRIVATE_SAVE_SENTINEL');expect(html).not.toContain('/private/source/path');
 expect(html).not.toContain('localStorage');expect(html).not.toContain('sessionStorage');
});

test('short review renderer contract / invalid text provenance and missing scenes fail closed',async()=>{
 const {renderReviewPack}=await api();const invalid=fixture();invalid.scenes[0].blocks[0].text='changed after capture';
 expect(()=>renderReviewPack(invalid)).toThrow(/digest|hash|capture/i);
 expect(()=>renderReviewPack({...fixture(),scenes:fixture().scenes.slice(0,2)})).toThrow(/three|3|scene/i);
});


test('short review renderer contract / FEED selectors use the runtime scenario namespace',async()=>{
 await api();
 const vm=require('node:vm');const sandbox={window:{}};vm.createContext(sandbox);
 for(const year of [4,5])vm.runInContext(fs.readFileSync(`ver1/ver1-continuity-year${year}.js`,'utf8'),sandbox);
 const scenario=fs.readFileSync('scripted-scenario.js','utf8');
 const prefix=scenario.match(/id:'([^']+)'\+sceneId/)[1];
 const actual=Object.values(sandbox.window.ADHOMS_CONTINUITY_YEARS).flatMap(year=>Object.values(year).flatMap(month=>month.weeks.flat().map(row=>prefix+row[4])));
 const {REVIEW_SELECTIONS}=await api();
 for(const id of [...REVIEW_SELECTIONS.historyWeek3,...REVIEW_SELECTIONS.historyWeek4])expect(actual).toContain(id);
 const source=fs.readFileSync(exporter,'utf8');
 const selectors=[...source.matchAll(/\[data-id(\^)?="([^"]*continuity-[^"]+)"\]/g)];
 expect(selectors.length).toBeGreaterThan(0);
 for(const [,startsWith,id] of selectors)expect(actual.some(value=>startsWith?value.startsWith(id):value===id),`Runtime card selector ${id}`).toBe(true);
});

test('short review renderer contract / selection closes the handoff and opens July personal stakes',async()=>{
 const {REVIEW_SELECTIONS}=await api();expect(REVIEW_SELECTIONS).toBeDefined();
 expect(REVIEW_SELECTIONS.historyWeek3).toEqual(expect.arrayContaining(['scenario-continuity-y4-m4-w3-minato-5','scenario-continuity-y4-m4-w3-kaito-6']));
 expect(REVIEW_SELECTIONS.historyWeek4).toEqual(expect.arrayContaining(['scenario-continuity-y4-m4-w4-minato-4','scenario-continuity-y4-m4-w4-kaito-5']));
 const vm=require('node:vm');const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('ver1/ver1-continuity-year5.js','utf8'),sandbox);
 const dialogue=sandbox.window.ADHOMS_CONTINUITY_YEARS[5][7].dialogue;
 const start=dialogue.findIndex(([speaker,text])=>speaker==='kiso'&&text===REVIEW_SELECTIONS.julyExchange[0]);
 expect(start).toBeGreaterThanOrEqual(0);expect(dialogue.slice(start,start+2).map(row=>row[1])).toEqual(REVIEW_SELECTIONS.julyExchange);
});

test.describe('short review actual capture',()=>{
 let recording,htmlPath;
 test.beforeAll(async({browser})=>{
  test.setTimeout(180000);
  const {captureShortReview,writeReviewPack}=await api();
  const capturePath=path.join(outputDirectory,'capture.json');
  const existing=fs.existsSync(capturePath)?JSON.parse(fs.readFileSync(capturePath,'utf8')):null;
  const sourceSha=sha(fs.readFileSync(path.resolve('dist/ADHOMS-Ver1.html')));
  recording=existing?.source?.htmlSha256===sourceSha?existing:await captureShortReview({browser});
  ({htmlPath}=writeReviewPack(recording,outputDirectory));
 });
 test('authentic normal-controls route has exact rendered blocks and preserves ending order',async({page})=>{
  await page.goto(pathToFileURL(htmlPath).href);
  expect(recording.route.kind).toBe('weekly');expect(recording.route.months).toHaveLength(60);
  expect(recording.route.initialStorageEmpty).toBe(true);expect(recording.errors).toEqual([]);
  expect(recording.scenes.map(s=>s.id)).toEqual(['meeting','history','ending']);
  for(const scene of recording.scenes)for(const block of scene.blocks){
   expect(block.sha256).toBe(sha(block.text));
   expect(await page.locator(`[data-capture-id="${block.id}"] .verbatim`).textContent()).toBe(block.text);
  }
  expect(recording.scenes[0].blocks.some(b=>b.source.selector.includes('meeting'))).toBe(true);
  expect(recording.scenes[1].blocks.some(b=>b.source.selector.includes('feedList'))).toBe(true);
  const history=recording.scenes[1].blocks;
  const handoffIds=['w2-kaito-6','w3-minato-5','w3-kaito-6','w4-minato-4','w4-kaito-5'];
  const handoffOrder=handoffIds.map(id=>history.findIndex(b=>b.source.selector.includes('scenario-continuity-y4-m4-'+id)));
  expect(handoffOrder.every(index=>index>=0)).toBe(true);expect(handoffOrder).toEqual([...handoffOrder].sort((a,b)=>a-b));
  expect(history[handoffOrder[1]].text).toContain('最初の問い合わせまで');expect(history[handoffOrder[4]].text).toContain('返事は俺から相手にした');
  const ending=recording.scenes[2].blocks;expect(recording.scenes[2].period).toBe('2033年7月〜2034年3月');
  expect(ending[0].label).toBe('七月の月末会議');expect(ending[0].text).toContain('気になる名前の返事だけ待って');
  expect(ending[1].label).toBe('七月の月末会議');expect(ending[1].text).toContain('ほかの場所の新しい危険を先に伝える');
  expect(ending[0].source.selector).toContain('.meetingThread .bubble');expect(ending[1].source.selector).toContain('.meetingThread .bubble');
  const labels=ending.map(b=>b.label);
  for(const label of ['個人危機・選択前','個人危機・選択後','豪雨の収束','九月の復旧','行政評価','TOWAとの会話','木曽指令第4号','エピローグ'])expect(labels).toContain(label);
  const ordered=['行政評価','TOWAとの会話','木曽指令第4号','エピローグ'].map(l=>labels.indexOf(l));expect(ordered).toEqual([...ordered].sort((a,b)=>a-b));
  const text=await page.locator('main').innerText();expect(text).not.toContain('{{');
  expect(text.length).toBeLessThan(26000);
 });
 for(const width of [320,390])test(`offline portrait ${width}px stays readable and navigable`,async({page,context})=>{
  await page.setViewportSize({width,height:844});await context.setOffline(true);await page.goto(pathToFileURL(htmlPath).href);
  for(const id of ['meeting','history','ending']){
   await page.locator(`nav a[href="#${id}"]`).click();await expect(page).toHaveURL(new RegExp(`#${id}$`));
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   expect(await page.locator(`#${id}`).evaluate(e=>e.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
   await page.screenshot({path:path.join(outputDirectory,`review-${width}-${id}.png`)});
  }
  expect(await page.locator('.verbatim').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
  await page.screenshot({path:path.join(outputDirectory,`review-${width}.png`),fullPage:true});
 });
 test('reading and reloading cannot touch existing saves or run game code',async({page})=>{
  await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate(()=>{localStorage.setItem('adhoms.ver1.lightstate','EXISTING_SAVE_SENTINEL');sessionStorage.setItem('review-sentinel','untouched');});
  const before=await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}}));
  await page.locator('nav a[href="#ending"]').click();await page.locator('details').first().locator('summary').click();await page.reload();
  expect(await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}}))).toEqual(before);
  expect(await page.locator('script,button,form,input,iframe,object,embed').count()).toBe(0);
  expect(await page.evaluate(()=>typeof window.ADHOMS_LIGHT_STATE)).toBe('undefined');
 });
});
