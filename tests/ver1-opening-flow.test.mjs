import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../scripted-scenario.js', import.meta.url), 'utf8');
const context = {};
vm.runInNewContext(source.slice(source.indexOf('  const roster'), source.indexOf('  const yearArcs')) + '\nthis.opening = onboarding;', context);
const opening = context.opening;

// The old orientation tail announces the town observation before nine more
// setup posts. Reintroducing it must fail before any browser is needed.
test('the first T-0WA explanation does not prematurely start resident observation', () => {
  assert.doesNotMatch(opening[0].text, /最初の観測を始めましょう/);
  assert.match(opening[0].text, /^おはようございます、木曽所長。あなたの親愛なるAI、T-0WAです。/);
  for (const essential of ['2029年4月', '5年間', '関係性の最適化', '本人や担当組織が決めます']) assert.ok(opening[0].text.includes(essential));
});

test('source guidance retains the feedback loop without repeating the procedure', () => {
  assert.doesNotMatch(opening[1].text, /投稿を読み、必要なら調査し、対応を提案する/);
  for (const essential of ['抽選', '観測端末', '手伝える', '返事', '生活の変化', '投稿がないことは、問題がないことを意味しません']) assert.ok(opening[1].text.includes(essential));
});

test('the ten stable introductory rows finish with Fujii handing off to Misaki', () => {
  assert.equal(opening.length, 10);
  assert.deepEqual(Array.from(opening.slice(0, 2), row => row.who), ['T-0WA', 'T-0WA']);
  assert.deepEqual(Array.from(opening, row => row.id), ['orientation', 'observation', 'welcome', 'connection', 'question', 'weights', 'confirmation', 'context', 'reading', 'handoff'].map(id => 'onboarding-' + id));
  assert.match(opening.at(-1).text, /接続確認はここまで/);
  assert.match(opening.at(-1).text, /田中美咲.*朝のバス/);
  assert.match(opening.at(-1).text, /聞いてみましょう。$/);
});
