import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(`../ver1/${name}.js`, import.meta.url), 'utf8');
function july(state = {flags: {}, memories: []}) {
  const context = {window: {ADHOMS_LIGHT_STATE: state}, S: {year: 5, month: 7, week: 4}, monthIndex: () => 51};
  for (const name of ['ver1-continuity-year5', 'ver1-continuity']) vm.runInNewContext(read(name), context);
  const api = context.window.ADHOMS_CONTINUITY, packet = api.packet();
  return {text: api.render(packet.dialogue.find(row => row[0] === 'saeki')[1]),
    antecedent: packet.weeks.flat().map(row => api.render(row[1])).find(text => text.includes('呼ばれそうになる')), state};
}
const bridge = read('ver1-ui-bridge');
const locationSource = bridge.slice(bridge.indexOf('    function privateScenePlace(){'), bridge.indexOf('    function renderResult(){'));
const privateSource = bridge.slice(bridge.indexOf('    function renderPrivate(){'), bridge.indexOf('    function renderDirective4(){'));
function privateScene(result) {
  const session = {result}, handlers = {}, h = {innerHTML: '', classList: {add() {}}, querySelector: id => handlers[id] ||= {}};
  const context = {session, stage: 'result', h, persist() {}, renderDirective4() {}};
  vm.runInNewContext(locationSource + privateSource + '\nrenderPrivate();', context);
  return {html: h.innerHTML, session};
}

// Restoring the former certainty in the July field must fail this assertion.
test('July recap preserves the observed possibility of another call during handoff', () => {
  const {text, antecedent} = july();
  assert.match(antecedent, /呼ばれそうになる/);
  assert.equal(text, '晃生さんの交代練習では、説明している間にも次の用事で呼ばれそうになっていました。連絡先の紙には、交代後に誰へ聞くかも入れます。');
});
// Restoring the teardown modifier must fail in the actual production renderer.
test('March default private heading names backstage without inventing a teardown', () => {
  const {html} = privateScene({livelihoodContinuity: 87, relationContinuity: 95});
  assert.match(html, /<h2>三月・評価会議のあと／ステージ裏<\/h2>/);
  assert.doesNotMatch(html, /撤収後/);
  assert.match(html, /大学の学祭/);
  assert.match(html, /仕様。今はそこじゃない/);
});
test('existing alternate March locations retain their result boundaries', () => {
  for (const [livelihoodContinuity, relationContinuity, place] of [[69,95,'復旧現場脇の仮設休憩所'],[70,69,'避難所の撤収前'],[70,70,'ステージ裏']]) {
    assert.match(privateScene({livelihoodContinuity, relationContinuity}).html, new RegExp('<h2>三月・評価会議のあと／'+place+'</h2>'));
  }
});
test('July and private rendering remain read-only and equal after serialized restoration', () => {
  const state = {flags: {'example:observed': true}, memories: [{id: 'existing'}]}, saved = JSON.stringify(state);
  assert.equal(july(state).text, july(JSON.parse(saved)).text);
  assert.equal(JSON.stringify(state), saved);
  for (const result of [{livelihoodContinuity: 87, relationContinuity: 95}, {livelihoodContinuity: 65, relationContinuity: 95}]) {
    const before = JSON.stringify(result), current = privateScene(result);
    assert.equal(current.html, privateScene(JSON.parse(before)).html);
    assert.equal(JSON.stringify(result), before);
  }
});
