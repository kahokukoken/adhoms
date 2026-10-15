import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../ver1/ver1-story-milestones.js', import.meta.url), 'utf8');
function load({number = 2, saved = {flags: {}}, resumed = false, missingHost = false} = {}) {
  let index = 47;
  let hasHost = !missingHost, hostCreations = 0;
  const timers = [], writes = [], listeners = [], observers = [], classes = new Set(resumed || number === 3 ? [] : ['on']);
  const button = {dataset: {}, addEventListener(type, callback) { if (type === 'click') listeners.push(callback); }};
  const directiveButton = {};
  const host = {textContent: resumed || number === 3 ? '' : number === 1 ? 'YEAR 3 / SIDE EFFECTS' : 'YEAR 4 / RELATION', innerHTML: '',
    classList: {contains: name => classes.has(name), add: name => classes.add(name), remove: name => classes.delete(name)},
    querySelectorAll: () => [button], querySelector: selector => selector === '#v1directive' ? directiveButton : null};
  const state = JSON.parse(JSON.stringify(saved));
  const window = {ADHOMS_LIGHT_STATE: state, nextMonth() { index += 1; },
    ADHOMS_VER1_UI: {ensureChoiceHost() {hasHost = true; hostCreations += 1; return host;}},
    ADHOMS_VER1_SESSION: {write(key, value) { writes.push(JSON.parse(JSON.stringify(value))); }}};
  const context = {window, document: {body: {}, getElementById: () => hasHost ? host : null}, monthIndex: () => index,
    MutationObserver: class {constructor(callback) {observers.push(callback);} observe() {}}, setTimeout(callback, delay) { timers.push({callback, delay}); }, queueMicrotask(callback) { timers.push({callback, delay: 0}); }};
  vm.runInNewContext(source, context);
  return {window, host, writes, timers, directiveButton, hostCreations: () => hostCreations, trigger() {
    if (number === 3) window.nextMonth();
    else { host.classList.remove('on'); for (const callback of listeners) callback(); }
  }, notify() {for (const callback of observers) callback();}, flush() { while (timers.length) timers.shift().callback(); }};
}

test('a real pending directive recreates a cleaned-up host, but idle or acknowledged state does not', () => {
  const saved = {flags: {'directive:1:ack': true, 'directive:2:ack': true}};
  const current = load({number: 3, saved, resumed: true, missingHost: true});
  current.flush(); current.notify();
  assert.equal(current.hostCreations(), 0, 'no empty overlay should be resurrected at idle');
  current.trigger(); current.notify();
  assert.equal(current.hostCreations(), 0, 'presentation must still honor its deferred boundary');
  current.flush();
  assert.equal(current.hostCreations(), 1);
  assert.match(current.host.innerHTML, /data-directive-number="3"/);
  current.directiveButton.onclick(); current.flush();
  const restored = load({number: 3, saved: current.writes.at(-1), resumed: true, missingHost: true});
  restored.flush(); restored.notify();
  assert.equal(restored.hostCreations(), 0);
});

for (const number of [1, 2, 3]) {
  test(`directive ${number} is durable before its deferred presentation and reload acknowledges it once`, () => {
    const current = load({number});
    current.trigger();
    // No timer has run: the previous implementation loses this pending event
    // when the page is discarded here, exactly as the CI reload did.
    assert.equal(current.writes.at(-1)?.flags[`directive:${number}:seen`], true);
    current.notify();
    assert.equal(current.host.innerHTML, '');
    assert.equal(current.timers.at(-1).delay, number === 3 ? 220 : 0);
    const restored = load({number, saved: current.writes.at(-1), resumed: true});
    restored.flush();
    assert.match(restored.host.innerHTML, new RegExp(`data-directive-number="${number}"`));
    restored.directiveButton.onclick();
    restored.flush();
    assert.equal(restored.writes.at(-1).flags[`directive:${number}:ack`], true);
    assert.equal(restored.host.classList.contains('on'), false);
    const again = load({number, saved: restored.writes.at(-1), resumed: true});
    again.flush();
    assert.equal(again.host.innerHTML, '');
    again.trigger(); again.flush();
    assert.equal(again.host.innerHTML, '', 'an acknowledged directive must not be shown again');
  });
}

test('a pending directive waits for an unrelated open overlay and resumes when it closes', () => {
  const current = load({number: 2});
  current.trigger();
  current.host.classList.add('on');
  current.flush();
  assert.equal(current.host.innerHTML, '');
  current.host.classList.remove('on'); current.notify();
  assert.match(current.host.innerHTML, /data-directive-number="2"/);
});

test('a stale second acknowledgement cannot close the next pending directive', () => {
  const current = load({resumed: true, saved: {flags: {'directive:1:seen': true, 'directive:2:seen': true}}});
  current.flush();
  const firstAck = current.directiveButton.onclick;
  firstAck(); current.flush();
  assert.match(current.host.innerHTML, /data-directive-number="2"/);
  firstAck();
  assert.equal(current.host.classList.contains('on'), true);
  assert.equal(current.window.ADHOMS_LIGHT_STATE.flags['directive:2:ack'], undefined);
});
