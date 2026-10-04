import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const common='他の組織や住民にも従うよう求める返答ではない。';
function model(){
 const window={advanceWeek(){},openMeeting(){},nextMonth(){}};
 const context=vm.createContext({window,structuredClone,S:{week:2},monthIndex:()=>36,document:{getElementById:()=>({})}});
 for(const file of ['ver1-state.js','ver1-events.js','ver1-propagation.js','ver1-support-loop.js'])vm.runInContext(fs.readFileSync(new URL('../ver1/'+file,import.meta.url),'utf8'),context);
 let state=window.ADHOMS_VER1_STATE.createInitialState();state.year=4;state.month=4;
 state.town.legitimacy=3;state.relations.factory_logistics=2;state.relations.technical_lab=2;
 state=window.ADHOMS_VER1_PROPAGATION.resolveYear4Strategy(state,'deepen').state;
 state.proposals.y4_strategy.response.index=36;state.proposals.y4_strategy.response.week=2;
 window.ADHOMS_LIGHT_STATE=state;return window;
}
test('organizational reply keeps each actor paragraph and one shared scope notice, without rewriting history',()=>{
 const w=model(),before=JSON.stringify(w.ADHOMS_LIGHT_STATE);
 const p=w.ADHOMS_LIGHT_STATE.proposals.y4_strategy;
 const post=w.ADHOMS_VER1_SUPPORT.rows(36).find(x=>x.id==='history-proposal-response-y4_strategy');
 assert.equal(post.text.split(common).length-1,1);
 for(const response of p.responses)assert.ok(post.text.includes(response.text.replace(common,'')));
 assert.equal(post.text.split('\n\n').length,p.responses.length+1);
 assert.equal(JSON.stringify(w.ADHOMS_LIGHT_STATE),before);
 assert.equal(w.ADHOMS_VER1_SUPPORT.rows(36).filter(x=>x.id===post.id).length,1);
});
test('legacy combined reply receives the same display-only paragraph treatment',()=>{
 const w=model();delete w.ADHOMS_LIGHT_STATE.proposals.y4_strategy.responses;
 const before=JSON.stringify(w.ADHOMS_LIGHT_STATE);
 const post=w.ADHOMS_VER1_SUPPORT.rows(36).find(x=>x.id==='history-proposal-response-y4_strategy');
 assert.equal(post.text.split(common).length-1,1);
 assert.equal(JSON.stringify(w.ADHOMS_LIGHT_STATE),before);
});
test('unknown and custom reply wording is preserved without inventing an accepted actor',()=>{
 const w=model();w.ADHOMS_LIGHT_STATE.proposals.y4_strategy.response.text='保存された返事のみ。担当者は未確認。';
 const post=w.ADHOMS_VER1_SUPPORT.rows(36).find(x=>x.id==='history-proposal-response-y4_strategy');
 assert.equal(post.text,'保存された返事のみ。担当者は未確認。');
 delete w.ADHOMS_LIGHT_STATE.proposals.y4_strategy.response;
 assert.equal(w.ADHOMS_VER1_SUPPORT.rows(36).filter(x=>x.id==='history-proposal-response-y4_strategy').length,0);
});
test('resource explanations and final declaration use established readable body size',()=>{
 let css='';const style={};const document={createElement:()=>style,head:{appendChild:element=>{css=element.textContent;}}};
 vm.runInNewContext(fs.readFileSync(new URL('../ver1/ver1-readable-ui.js',import.meta.url),'utf8'),{document});
 const bodyRule=css.match(/([^{}]+)\{font-size:16px!important;line-height:1\.8\}/)?.[1]||'';
 assert.ok(bodyRule.split(',').map(x=>x.trim()).includes('.ver1Capability'));
});
test('month-only catch-up preserves the same actor paragraph breaks as FEED',()=>{
 let css='';const document={createElement:()=>({}),head:{appendChild:el=>{css=el.textContent;}}};
 vm.runInNewContext(fs.readFileSync(new URL('../ver1/ver1-readable-ui.js',import.meta.url),'utf8'),{document});
 assert.match(css,/\.meetingObservations blockquote p\{[^}]*white-space:pre-line/);
});
