import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function scene(state = {memories: [], flags: {}}) {
  const context = {window: {ADHOMS_LIGHT_STATE: state}, S: {year: 4, month: 4, week: 1}, monthIndex: () => 36};
  for (const file of ['ver1-continuity-year4.js', 'ver1-continuity.js']) {
    vm.runInNewContext(fs.readFileSync(new URL(`../ver1/${file}`, import.meta.url), 'utf8'), context);
  }
  const continuity = context.window.ADHOMS_CONTINUITY;
  const row = continuity.packet().weeks[0].find(row => row[4] === 'continuity-y4-m4-w1-misaki-1');
  return {row, text: continuity.render(row[1]), state: context.window.ADHOMS_LIGHT_STATE};
}

// Reintroducing the unsupported prior-year post attribution must fail this test.
test('Misaki reports her current work limit without citing an absent prior year-end post', () => {
  const {row, text} = scene();
  assert.doesNotMatch(text, /去年の終わりに書いた通り/);
  assert.match(text, /仕事中は返せません/);
  assert.match(text, /送迎を頼む人から直接連絡してもらう日を、今月は作りたいです/);
  assert.equal(row[0], 'misaki');
  assert.equal(row[2], null);
  assert.equal(row[3], false);
});

test('rendering the current bus constraint does not backfill history and survives serialized restoration', () => {
  for (const choice of ['coordinate_days', 'ask_timetable', null]) {
    const state = {memories: [], flags: {}, supportCases: choice ? {bus: {choice}} : {}};
    const before = JSON.stringify(state);
    const current = scene(state);
    assert.equal(JSON.stringify(current.state), before);
    assert.equal(scene(JSON.parse(before)).text, current.text);
  }
});
