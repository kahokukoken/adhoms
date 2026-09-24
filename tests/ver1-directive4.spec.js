const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

async function reachAdministrativeResult(page) {
  await page.goto(URL);
  await page.evaluate(() => {
    S.year = 5; S.month = 12; S.week = 4;
    showEnding();
  });
  const overlay = page.locator('#ver1Choice');
  for (let phase = 0; phase < 6; phase += 1) await overlay.locator('#v1next').click();
  await overlay.locator('#v1fin').click();
  await expect(overlay).toContainText('YEAR 5 / 復旧期間');
  await page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem('adhoms.ver1.finalsession'));
    record.stage = 'result';
    localStorage.setItem('adhoms.ver1.finalsession', JSON.stringify(record));
  });
  await page.reload();
  await expect(overlay).toContainText('5 YEAR FIELD TRIAL COMPLETE');
  return overlay;
}

test.describe('ADHOMS Ver1 Kiso directive 4', () => {
  test('administrative declaration precedes the private TOWA reveal and directive 4 follows it', async ({ page }) => {
    const overlay = await reachAdministrativeResult(page);

    await expect(overlay).toContainText('5年間の実証評価会議');
    await expect(overlay).toContainText('行政評価と、生活の損失は同じではない');
    await expect(overlay).toContainText('T-0WA');
    await expect(overlay).toContainText('アップデート条件の達成を確認しました');
    await expect(overlay).not.toContainText('木曽指令 第4号');

    await overlay.locator('#v1close').click();
    await expect(overlay).toContainText('PRIVATE CONVERSATION / TOWA');
    await expect(overlay).toContainText('大学の学祭');
    await expect(overlay).toContainText('永遠');
    await expect(overlay).toContainText('有名だから勧めるなら雑誌でいい');
    await expect(overlay).toContainText('一種類だけ残る強さ');
    await expect(overlay).toContainText('同じ結果の中に、残ってる');
    await expect(overlay).not.toContainText('木曽指令 第4号');
    await expect(overlay).not.toContainText('ダブルミーニング');
    await expect(overlay).not.toContainText('命名');

    await overlay.locator('#v1privateclose').click();
    await expect(overlay).toContainText('木曽指令 第4号');
    await expect(overlay).toContainText('個人・家業・生活基盤');
    await expect(overlay).toContainText('残差');
    await expect(overlay).not.toContainText('NML');
    expect(await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state().flags['directive:4:seen'])).toBe(true);

    await page.reload();
    await expect(overlay).toContainText('木曽指令 第4号');
    await overlay.locator('#v1directive4').click();
    await expect(overlay).toContainText('EPILOGUE');
    await expect(overlay).not.toContainText('木曽指令 第4号');
    expect(await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state().flags['directive:4:ack'])).toBe(true);
  });

  test('private TOWA scene chooses a result-dependent location without exposing T-0WA origin', async ({ page }) => {
    const overlay = await reachAdministrativeResult(page);
    await page.evaluate(() => {
      const record = JSON.parse(localStorage.getItem('adhoms.ver1.finalsession'));
      record.session.result.people.towa.status = 'danger';
      localStorage.setItem('adhoms.ver1.finalsession', JSON.stringify(record));
    });
    await page.reload();
    await overlay.locator('#v1close').click();
    await expect(overlay).toContainText('病院の面会スペース');
    await expect(overlay).toContainText('端末の声');
    await expect(overlay).not.toContainText('T-0WAの由来');
    await expect(overlay).not.toContainText('木曽が永遠の声を');
  });
});
