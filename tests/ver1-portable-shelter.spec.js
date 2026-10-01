const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function model(){const window={};const c=vm.createContext({window,structuredClone});for(const f of ['state','events','propagation','disaster','final-event'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../ver1/ver1-'+f+'.js'),'utf8'),c);return {S:window.ADHOMS_VER1_STATE,E:window.ADHOMS_VER1_EVENTS,P:window.ADHOMS_VER1_PROPAGATION,D:window.ADHOMS_VER1_DISASTER,F:window.ADHOMS_VER1_FINAL};}
function prepare(m,positive=true){let s=m.S.createInitialState();s.year=2;s=m.E.resolveChoice(s,'y2_flood',positive?'guided_watch':'hard_warning');s=m.E.resolveChoice(s,'y2_wildlife','food_source');s=m.E.resolveChoice(s,'y2_snow',positive?'trunk_first':'welfare_first');s.year=3;s=m.P.applySideEffects(s).state;s.year=4;s.month=4;return s;}
// Replacing actual provenance by a capacity score, or counting stock as seats, must fail.
test('prepared path secures real stock only after response, with zero seats before deployment',()=>{
 const m=model(),s=prepare(m);const p=m.P.proposeYear4Strategy(s,'deepen');
 expect(m.D.availableEmergencyCommands(p)).not.toContain('deploy_portable_shelter');
 expect(p.proposals.y4_strategy.actorIds).toContain('shelter_team');
 const r=m.P.respondYear4Strategy(p).state;
 expect(r.portablePreparation).toEqual(expect.objectContaining({status:'secured',stockCapacity:120,actorId:'shelter_team'}));
 expect(m.D.availableEmergencyCommands(r)).toContain('deploy_portable_shelter');
 expect(m.D.deriveDisasterState(r).shelterCapacity.portable).toBe(0);
 expect(m.P.respondYear4Strategy(r).state).toEqual(r);
});
test('unprepared path has neither stock nor phantom capacity despite distributed preparation score',()=>{
 const m=model();let s=m.P.resolveYear4Strategy(prepare(m,false),'deepen').state;s.town.distributedCapacity=4;
 expect(s.portablePreparation).toEqual(expect.objectContaining({status:'incomplete'}));
 expect(s.portablePreparation.text).toContain('車両');
 expect(m.D.availableEmergencyCommands(s)).not.toContain('deploy_portable_shelter');
 expect(m.D.deriveDisasterState(s).shelterCapacity.portable).toBe(0);
});
test('stock requires authentic actor response and agreement provenance',()=>{
 const m=model(),s=m.P.resolveYear4Strategy(prepare(m),'deepen').state;
 const copy=()=>JSON.parse(JSON.stringify(s));
 for(const mutate of [x=>delete x.portablePreparation,x=>delete x.agreements.factory_support,x=>x.agreements.warehouse_outreach.source.id='unrelated',x=>x.proposals.y4_strategy.responses=x.proposals.y4_strategy.responses.filter(r=>r.actorId!=='shelter_team')]){const x=copy();mutate(x);expect(m.D.availableEmergencyCommands(x)).not.toContain('deploy_portable_shelter');}
});
test('partial and full deployment use existing 60/120 once; none and night relocation add no stock',()=>{
 const m=model(),s=m.P.resolveYear4Strategy(prepare(m),'deepen').state;let f=m.F.createSession(s);
 expect(f.derived.shelterCapacity.portable).toBe(0);
 f=m.F.applyDecision(f,'portable_shelter','partial');expect(f.derived.shelterCapacity.portable).toBe(60);
 f=m.F.applyDecision(f,'portable_shelter','full');expect(f.derived.shelterCapacity.portable).toBe(120);
 f=m.F.applyDecision(f,'portable_shelter','full');expect(f.derived.shelterCapacity.portable).toBe(120);
 const restored=JSON.parse(JSON.stringify(f));restored.phaseIndex=4;
 const night=m.F.applyDecision(restored,'portable_redeploy','move_highground');expect(night.derived.shelterCapacity.portable).toBe(120);
 f=m.F.applyDecision(f,'portable_shelter','none');expect(f.derived.shelterCapacity.portable).toBe(0);f.phaseIndex=4;expect(m.F.availableChoices(f,'portable_redeploy')).toEqual(['hold']);
});

test('final score counts deployed space, not prepared stock, and preserves fixed fates',()=>{
 const m=model(),s=m.P.resolveYear4Strategy(prepare(m),'deepen').state;
 const results=['none','partial','full'].map(choice=>{let f=m.F.createSession(s);f=m.F.applyDecision(f,'portable_shelter',choice);while(f.phaseIndex<5)f=m.F.nextPhase(f);return m.F.finalize(f);});
 expect(results.map(f=>f.derived.shelterCapacity.portable)).toEqual([0,60,120]);
 expect(results[2].result.humanSafety).toBeGreaterThan(results[0].result.humanSafety);
 expect(results[0].result.personalOutcomes).toEqual(results[2].result.personalOutcomes);
});
test('old incomplete proposals and resolved saves do not acquire shelter-team assent on reload',()=>{
 const m=model(),s=prepare(m);let p=m.P.proposeYear4Strategy(s,'deepen');delete p.proposals.y4_strategy.portablePreparationRequested;
 const r=m.P.respondYear4Strategy(JSON.parse(JSON.stringify(p))).state;expect(r.portablePreparation).toBeUndefined();expect(m.D.availableEmergencyCommands(r)).not.toContain('deploy_portable_shelter');
 expect(m.P.respondYear4Strategy(JSON.parse(JSON.stringify(r))).state).toEqual(r);
 const legacy=m.S.createInitialState();delete legacy.supportModelVersion;legacy.town.distributedCapacity=3;
 expect(m.D.availableEmergencyCommands(legacy)).toContain('deploy_portable_shelter');
 expect(m.F.createSession(legacy).derived.shelterCapacity.portable).toBe(0);expect(legacy.portablePreparation).toBeUndefined();
});
for(const route of ['weekly','monthly'])test('preparation reply and final deployment persist through '+route+' progression',async({page})=>{
 await page.goto('http://127.0.0.1:8000/');
 await page.evaluate(()=>{
  let s=ADHOMS_LIGHT_STATE; s.year=2;
  for(const [e,c] of [['y2_flood','guided_watch'],['y2_wildlife','food_source'],['y2_snow','trunk_first']])s=ADHOMS_VER1_EVENTS.resolveChoice(s,e,c);
  s.year=3;s=ADHOMS_VER1_PROPAGATION.applySideEffects(s).state;s.year=4;s.month=4;s.flags.y4_seen=true;
  ADHOMS_LIGHT_STATE=s;localStorage.setItem('adhoms.ver1.lightstate',JSON.stringify(s));
 });await page.reload();
 await expect(page.locator('#ver1Choice')).toContainText('設置区画');await page.locator('[data-s="deepen"]').click();
 expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.portablePreparation)).toBeUndefined();await page.reload();
 await page.locator('#v1directive').click();
 if(route==='weekly')await page.locator('#nextWeek').click();else await page.locator('#toMonthEnd').click();
 expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.portablePreparation.status)).toBe('secured');
 await expect(page.locator(route==='weekly'?'#feedList':'.meetingCatchup')).toContainText('120人分確保');
 await page.reload();expect(await page.evaluate(()=>ADHOMS_LIGHT_STATE.portablePreparation.stockCapacity)).toBe(120);
 await page.evaluate(()=>{const s=ADHOMS_VER1_FINAL.createSession(ADHOMS_LIGHT_STATE);ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession',{sessionId:ADHOMS_VER1_SESSION.id,stage:'active',session:s});});
 await page.reload();await expect(page.locator('#ver1Choice')).toContainText('現在の展開容量 0人分');await page.locator('[data-k="portable_shelter"][data-v="partial"]').click();
 await page.reload();await expect(page.locator('#ver1Choice')).toContainText('現在の展開容量 60人分');await page.locator('[data-k="portable_shelter"][data-v="full"]').click();
 await expect(page.locator('#ver1Choice')).toContainText('現在の展開容量 120人分');
 for(let i=0;i<4;i++)await page.locator('#v1next').click();
 await page.locator('[data-k="portable_redeploy"][data-v="move_highground"]').click();await page.reload();
 await expect(page.locator('#ver1Choice')).toContainText('現在の展開容量 120人分');
});
test('active legacy baseline migration is explicit, idempotent and never invents assent',()=>{
 const m=model(),st=m.S.createInitialState();delete st.supportModelVersion;st.town.distributedCapacity=3;
 let old=m.F.createSession(st);delete old.portableCapacityVersion;old.decisionBase.derived.shelterCapacity.portable=120;old.derived.shelterCapacity.portable=120;
 old=m.F.applyDecision(old,'portable_shelter','full');delete old.actionResponses;
 const migrated=m.F.migratePortableCapacity(JSON.parse(JSON.stringify(old)),'active');
 expect(migrated.derived.shelterCapacity.portable).toBe(120);expect(migrated.decisionBase.derived.shelterCapacity.portable).toBe(0);
 expect(migrated.decisions).toEqual(old.decisions);expect(migrated.people).toEqual(old.people);expect(migrated.state).toEqual(old.state);expect(migrated.actionResponses).toBeUndefined();
 expect(m.F.migratePortableCapacity(JSON.parse(JSON.stringify(migrated)),'active')).toEqual(migrated);
 expect(m.F.migratePortableCapacity(old,'result')).toEqual(old);
 for(const mutate of [s=>delete s.decisionBase,s=>s.decisionBase.derived.shelterCapacity.portable=null,s=>s.derived.shelterCapacity.portable=999]){const x=structuredClone(old);mutate(x);expect(m.F.migratePortableCapacity(x,'active')).toEqual(x);}
});
test('legacy save can acquire new genuine preparation without changing its old model marker',()=>{
 const m=model(),s=prepare(m);delete s.supportModelVersion;const r=m.P.resolveYear4Strategy(s,'deepen').state;
 expect(r.portablePreparation.status).toBe('secured');expect(r.supportModelVersion).toBeUndefined();
 expect(m.D.availableEmergencyCommands(r)).toContain('deploy_portable_shelter');
});
test('browser reload persists a recognized active legacy baseline correction once',async({page})=>{
 await page.goto('http://127.0.0.1:8000/');
 await page.evaluate(()=>{let st=ADHOMS_VER1_STATE.createInitialState();delete st.supportModelVersion;st.town.distributedCapacity=3;let s=ADHOMS_VER1_FINAL.createSession(st);delete s.portableCapacityVersion;s.decisionBase.derived.shelterCapacity.portable=120;s.derived.shelterCapacity.portable=120;s=ADHOMS_VER1_FINAL.applyDecision(s,'portable_shelter','full');delete s.actionResponses;ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession',{sessionId:ADHOMS_VER1_SESSION.id,stage:'active',session:s});});
 for(let i=0;i<2;i++){await page.reload();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('adhoms.ver1.finalsession')).session);expect(saved.portableCapacityVersion).toBe(1);expect(saved.derived.shelterCapacity.portable).toBe(120);expect(saved.actionResponses).toBeUndefined();}
});
test('ordinary evacuation fleet remains distinct from refused portable-equipment transport',()=>{
 const m=model(),s=m.P.resolveYear4Strategy(prepare(m,false),'deepen').state;let f=m.F.createSession(s);f.phaseIndex=2;f=m.F.applyDecision(f,'vehicle_allocation','festival');
 expect(f.actionResponses.vehicle_allocation.text).toContain('機材搬送とは別');
 expect(s.portablePreparation.text).toContain('機材搬送');
});
test('later phase labels retained night observations as historical records',async({page})=>{
 await page.goto('http://127.0.0.1:8000/');await page.evaluate(()=>{let s=ADHOMS_VER1_FINAL.createSession(ADHOMS_LIGHT_STATE);for(let i=0;i<5;i++)s=ADHOMS_VER1_FINAL.nextPhase(s);ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession',{sessionId:ADHOMS_VER1_SESSION.id,stage:'active',session:s});});await page.reload();
 await expect(page.locator('.ver1Incidents')).toContainText('各観測時点の記録');
});
test('legacy choice-only narrative never creates road actor assent',()=>{
 const window={ADHOMS_LIGHT_STATE:{flags:{'y2_flood:guided_watch':true,'y2_snow:trunk_first':true},memories:[],relations:{}}};const c=vm.createContext({window});vm.runInContext(fs.readFileSync(path.join(__dirname,'../ver1/ver1-continuity.js'),'utf8'),c);
 for(const topic of ['flood','snow']){const text=window.ADHOMS_CONTINUITY.render('{{'+topic+'}}',2,6);expect(text).not.toMatch(/道路管理側.*(?:引き受け|判断をした)/);expect(text).toContain('記録');}
});
