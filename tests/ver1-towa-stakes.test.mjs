import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
for(const year of [3,5])vm.runInNewContext(fs.readFileSync(new URL(`../ver1/ver1-continuity-year${year}.js`,import.meta.url),'utf8'),context);
test('fixed Year3 CM recognition identifies the previous performer without disclosing the private encounter',()=>{
 const lines=context.window.ADHOMS_CONTINUITY_YEARS[3][12].dialogue;
 const recognition=lines.find(([who])=>who==='kiso')[1];
 assert.match(recognition,/永遠/);assert.match(recognition,/声/);
 assert.doesNotMatch(JSON.stringify(lines),/大学の学祭|学園祭|命名|初期音声|永遠の声を/);
});
test('pre-crisis preparation gives Kiso and Saya a direct exchange about personal concern and shared priorities',()=>{
 const lines=context.window.ADHOMS_CONTINUITY_YEARS[5][7].dialogue;
 const i=lines.findIndex(([who,text])=>who==='kiso'&&/TOWA/.test(text));
 assert.ok(i>=0,'Kiso must speak before the final crisis, not only be explained by staff');
 assert.match(lines[i][1],/真知|晃生/);
 assert.equal(lines[i+1][0],'miyashita');
 assert.match(lines[i+1][1],/三地点|同じ時刻/);
 assert.doesNotMatch(JSON.stringify(lines),/大学の学祭|学園祭|命名|初期音声/);
});
