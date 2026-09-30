const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'docs/ver1/decision-locks.json'), 'utf8'));

test.describe('ADHOMS Ver1 decision locks', () => {
  test('registry has unique stable lock IDs and explicit change rule', async () => {
    const ids = registry.locks.map(lock => lock.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining([
      'DL-001','DL-002','DL-003','DL-004','DL-005',
      'DL-006','DL-007','DL-008','DL-009','DL-010','DL-011','DL-012','DL-013','DL-014','DL-015'
    ]));
    expect(registry.change_rule).toContain('explicit user decision');
    expect(registry.locks.find(lock=>lock.id==='DL-011')).toMatchObject({status:'superseded',superseded_by:'DL-012'});
    expect(registry.locks.find(lock=>lock.id==='DL-012')).toMatchObject({status:'superseded',supersedes:'DL-011',superseded_by:'DL-013'});
    expect(registry.locks.find(lock=>lock.id==='DL-013')).toMatchObject({status:'locked',supersedes:'DL-012'});
    expect(registry.locks.find(lock=>lock.id==='DL-015')).toMatchObject({
      status:'locked',
      reading_rule:expect.stringContaining('たかくら・まち')
    });
    expect(registry.locks.find(lock=>lock.id==='DL-015').reading_rule).toContain('しばがき・こうせい');
  });

  test('DL-001: weekly FEED is chronological rather than newest-first', async () => {
    const source = fs.readFileSync(path.join(root, 'scripted-scenario.js'), 'utf8');
    expect(source).toContain('posts.sort((a,b)=>a.w-b.w');
    expect(source).not.toContain('posts.sort((a,b)=>b.w-a.w');
  });

  test('DL-002: authored FEED preserves meaningful length variation', async () => {
    const source = fs.readFileSync(path.join(root, 'scripted-scenario.js'), 'utf8');
    const monthBlock = source.slice(source.indexOf('const months = {'), source.indexOf('function absMonth()'));
    const strings = [...monthBlock.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'/g)].map(m => m[1]);
    const jp = strings.filter(s => /[ぁ-んァ-ヶ一-龠]/.test(s) && s.length >= 20);
    expect(jp.some(s => s.length >= 110)).toBe(true);
    expect(jp.some(s => s.length <= 60)).toBe(true);
  });

  test('DL-004/DL-005: authored cards have no Follow and expose +/- weighting', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    const card = page.locator('#feedList .card[data-id]').first();
    await expect(card.getByRole('button', { name:/フォロー/ })).toHaveCount(0);
    await expect(card.getByRole('button', { name:'＋', exact:true })).toHaveCount(1);
    await expect(card.getByRole('button', { name:'−', exact:true })).toHaveCount(1);
  });

  test('DL-006: ordinary monthly meeting does not require value sliders', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    await page.getByRole('button', { name:'月末まで →', exact:true }).click();
    await expect(page.locator('#meeting input[type=range]')).toHaveCount(0);
  });

  test('DL-015: current ADHOMS display names supersede the old names without changing save IDs', async ({ page }) => {
    const scripted = fs.readFileSync(path.join(root, 'scripted-scenario.js'), 'utf8');
    const uiBridge = fs.readFileSync(path.join(root, 'ver1/ver1-ui-bridge.js'), 'utf8');
    expect(scripted).toContain("chihiro:{name:'高倉 真知'");
    expect(scripted).toContain("gaku:{name:'柴垣 晃生'");
    expect(scripted).not.toContain('高倉 千尋');
    expect(scripted).not.toContain('柴垣 岳');
    expect(uiBridge).not.toContain('高倉千尋');
    expect(uiBridge).not.toContain('柴垣岳');

    await page.goto('http://127.0.0.1:8000/');
    await page.evaluate(() => {
      ADHOMS_LIGHT_STATE.year=5; ADHOMS_LIGHT_STATE.month=8;
      S.year=5; S.month=8; S.week=4;
      showEnding();
    });
    await expect(page.locator('#ver1Choice')).toContainText('高倉真知');
    await expect(page.locator('#ver1Choice')).toContainText('柴垣晃生');
    await expect(page.locator('#ver1Choice')).not.toContainText('高倉千尋');
    await expect(page.locator('#ver1Choice')).not.toContainText('柴垣岳');
  });

  test('DL-008/DL-009: ending reveal order and withheld T-0WA origin stay locked', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/');
    await page.evaluate(() => {
      S.year = 5; S.month = 12; S.week = 4; showEnding();
    });
    const overlay = page.locator('#ver1Choice');
    for (let i=0;i<6;i++) await overlay.locator('#v1next').click();
    await overlay.locator('#v1fin').click();
    await page.evaluate(() => {
      const r=JSON.parse(localStorage.getItem('adhoms.ver1.finalsession'));
      r.stage='result'; localStorage.setItem('adhoms.ver1.finalsession',JSON.stringify(r));
    });
    await page.reload();
    await expect(overlay).toContainText('アップデート条件の達成を確認しました');
    await expect(overlay).not.toContainText('木曽指令 第4号');
    await overlay.locator('#v1close').click();
    await expect(overlay).toContainText('PRIVATE CONVERSATION / TOWA');
    await expect(overlay).not.toContainText('木曽指令 第4号');
    await expect(overlay).not.toContainText('ダブルミーニング');
    await overlay.locator('#v1privateclose').click();
    await expect(overlay).toContainText('木曽指令 第4号');
  });
});
