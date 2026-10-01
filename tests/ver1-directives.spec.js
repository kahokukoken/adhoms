const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

async function advanceOneMonth(page) {
  await page.getByRole('button', { name: '月末まで →', exact: true }).click();
  await page.locator('.meetingContinue').click();
}

async function closeDirective(page, number) {
  const overlay = page.locator('#ver1Choice');
  await expect(overlay).toContainText(`木曽指令 第${number}号`);
  await overlay.locator('#v1directive').click();
  await expect(overlay).not.toHaveClass(/on/);
}

test.describe('ADHOMS Ver1 Kiso directives', () => {
  test('directives 1-3 emerge from the completed yearly learning loops and persist until acknowledged', async ({ page }) => {
    test.setTimeout(150000);
    await page.goto(URL);
    const overlay = page.locator('#ver1Choice');

    for (let index = 1; index <= 24; index += 1) {
      await advanceOneMonth(page);
      if (index === 14) await overlay.locator('[data-c="guided_watch"]').click();
      if (index === 18) await overlay.locator('[data-c="food_source"]').click();
      if (index === 21) await overlay.locator('[data-c="welfare_first"]').click();
    }

    await expect(overlay).toContainText('YEAR 3 / SIDE EFFECTS');
    await overlay.locator('#v1ok').click();
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('木曽指令 第1号');
    await expect(overlay).toContainText('情報が誰にどう受け取られ、行動へ変換されるか');

    // A directive is a research revision, not a disposable toast. Reloading before
    // acknowledgement must restore it.
    await page.reload();
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('木曽指令 第1号');
    await closeDirective(page, 1);

    for (let index = 25; index <= 36; index += 1) await advanceOneMonth(page);
    await expect(overlay).toContainText('YEAR 4 / RELATION');
    await overlay.locator('[data-s="repair"]').click();
    await expect(overlay).toContainText('木曽指令 第2号');
    await expect(overlay).toContainText('反作用・負担転嫁・二次影響');
    await closeDirective(page, 2);

    for (let index = 37; index <= 48; index += 1) await advanceOneMonth(page);
    await expect(overlay).toHaveClass(/on/);
    await expect(overlay).toContainText('木曽指令 第3号');
    await expect(overlay).toContainText('Relation・Memory');
    await expect(overlay).toContainText('選択肢そのものを変える');
    await closeDirective(page, 3);

    const state = await page.evaluate(() => window.ADHOMS_VER1_DEBUG.state());
    expect(state.flags['directive:1:ack']).toBe(true);
    expect(state.flags['directive:2:ack']).toBe(true);
    expect(state.flags['directive:3:ack']).toBe(true);
  });
});
