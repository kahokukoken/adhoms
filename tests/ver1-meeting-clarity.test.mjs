import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Execute the real production renderer. Surrounding DOM/state adapters are
// minimal here; the browser spec verifies normal interaction and persistence.
const source=fs.readFileSync(new URL('../scripted-scenario.js',import.meta.url),'utf8');
const renderer=source.slice(source.indexOf('  openMeeting=function scriptedMeeting(){'),source.indexOf('\n  const sceneStyle='));
assert.match(renderer,/openMeeting=function scriptedMeeting/);
function renderMeeting({trialYear=2,month=5,week=4,result=null,done={}}={}){
  const year=trialYear+(month<4?1:0), index=(trialYear-1)*12+(month+8)%12;
  const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',classList:{add(){}}});return nodes.get(id);};
  const state={year,month,week,meetingDone:done,meetingEntry:{key:`${year}-${month}`,week},likes:{}};
  const context={S:state,window:{ADHOMS_VER1_DEBUG:{final:()=>result?{session:{result}}:null}},
    document:{getElementById:node,querySelectorAll:()=>[]},
    rememberMeetingEntry(){},updateTop(){},renderFeed(){},nextMonth(){},
    current:()=>({topic:'今月の相談'}),year:()=>({meeting:'年度の共通原則',feed:'年度の振り返り'}),
    continuity:{packet:()=>({dialogue:[['fujii','今月の具体的な会話']]}),fiscalYear:()=>trialYear,render:x=>x},
    ym:()=>`${2028+year}年${month}月`,monthPosts:()=>[],absMonth:()=>index,
    esc:x=>x,bubble:(_,text)=>`<p class="meetingLine">${text}</p>`,historyMeetingLines:()=>[],quarterlyReview:()=>''};
  vm.runInNewContext(renderer,context);context.openMeeting();
  return {html:node('meetingBody').innerHTML,state};
}
test('DL-014: the annual meeting principle appears in April, not as the same monthly lecture',()=>{
  assert.match(renderMeeting({month:4}).html,/年度の共通原則/);
  for(const month of [5,6,7,8,9,10,11,12,1,2,3]){
    const {html}=renderMeeting({month});
    assert.doesNotMatch(html,/年度の共通原則/,`month ${month}`);
    assert.match(html,/今月の具体的な会話/);
    assert.match(html,/今月届いた声/);
  }
});
test('final-year annual report distinguishes real August disaster record from ordinary meetings',()=>{
  const done=Object.fromEntries([4,5,6,7,9,10,11,12].map(m=>[`5-${m}`,true]).concat([["6-1",true],["6-2",true]]));
  const {html,state}=renderMeeting({trialYear:5,month:3,done,result:{personalOutcomes:{}}});
  assert.match(html,/通常の月例記録：11か月/);
  assert.match(html,/8月の豪雨対応は別記録/);
  assert.equal(Object.keys(state.meetingDone).length,10,'explaining August must not invent a completed meeting');
});
test('missing final result does not manufacture an August disaster record',()=>{
  assert.doesNotMatch(renderMeeting({trialYear:5,month:3}).html,/8月の豪雨対応は別記録/);
  assert.doesNotMatch(renderMeeting({trialYear:4,month:3,result:{}}).html,/8月の豪雨対応は別記録/);
});
test('warehouse dialogue identifies the unconfirmed consignment, without denying every disaster agreement',()=>{
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync(new URL('../ver1/ver1-continuity-year4.js',import.meta.url),'utf8'),context);
  const lines=context.window.ADHOMS_CONTINUITY_YEARS[4][6].dialogue.map(row=>row[1]).filter(x=>typeof x==='string').join('\n');
  assert.doesNotMatch(lines,/まだ相談中の倉庫を確保済みに数えません/);
  assert.match(lines,/村田さんの荷物/);
  assert.match(lines,/時間帯/);
});
