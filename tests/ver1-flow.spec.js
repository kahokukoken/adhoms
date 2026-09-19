const { test, expect } = require('@playwright/test');

test.setTimeout(120_000);

async function closePhases(page) {
  const quarterly = page.getByRole('dialog', { name: '四半期判断' });
  if (await quarterly.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: '判断を確定' }).click();
  }
  const annual = page.getByRole('dialog', { name: '年次報告' });
  if (await annual.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: '報告を閉じる' }).click();
  }
  const crisis = page.getByRole('dialog', { name: '危機対応' });
  if (await crisis.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: '8予算で分散対応' }).click();
  }
}

async function start(page) {
  await page.goto('http://127.0.0.1:8000/ver1/');
  await page.getByLabel('チームリーダー').selectOption('miyashita');
  await page.getByRole('button', { name: '5年間の実証を開始' }).click();
}

async function advance(page, count) {
  for (let tick = 0; tick < count; tick += 1) {
    await page.getByRole('button', { name: '翌月へ' }).click();
    await closePhases(page);
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/ver1/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('first-time player completes all 60 months without follow mechanics', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByText(/抽選された住民.*観測端末/)).toBeVisible();
  await expect(page.getByRole('button', { name: /フォロー/ })).toHaveCount(0);
  await page.getByLabel('チームリーダー').selectOption('miyashita');
  await page.getByRole('button', { name: '5年間の実証を開始' }).click();

  await advance(page, 43);
  await expect(page.getByText(/町長選挙/).first()).toBeVisible();
  await advance(page, 11);
  await expect(page.getByText('倶利伽羅八朔相撲').first()).toBeVisible();
  await expect(page.getByText('倶利伽羅森林公園ライブ').first()).toBeVisible();
  await expect(page.getByText('秋雨前線による大雨').first()).toBeVisible();
  await advance(page, 6);

  await expect(page.getByText('5 YEAR FIELD TRIAL COMPLETE')).toBeVisible();
  await expect(page.getByText(/実証評価 [A-D]/)).toBeVisible();
  await expect(page.getByText(/A・B：実証成功|C・D：実証失敗/)).toBeVisible();
  await expect(page.getByText(/本作に登場する自治体/)).toBeVisible();
  const persisted = await page.evaluate(() => {
    const valid = localStorage.getItem('adhoms.ver1.valid');
    const candidate = localStorage.getItem('adhoms.ver1.candidate');
    return {
      validTick: JSON.parse(valid).savedAtTick,
      recoveryTick: JSON.parse(candidate).savedAtTick,
      recoveryFormat: JSON.parse(candidate).format,
      diagnostic: document.querySelector('#diagnostic').textContent,
      storedCharacters: valid.length + candidate.length
    };
  });
  expect(persisted.validTick).toBe(60);
  expect(persisted.recoveryTick).toBe(60);
  expect(persisted.recoveryFormat).toBe('adhoms-ver1-replay-backup');
  expect(persisted.diagnostic).not.toContain('保存に失敗');
  expect(persisted.storedCharacters).toBeLessThan(5_242_880);
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(horizontalOverflow).toBe(0);
});

test('saves, resumes, and exposes only institutional FEED actions', async ({ page }) => {
  await start(page);
  await expect(page.getByRole('button', { name: '評価＋' }).first()).toBeVisible();
  await page.getByRole('button', { name: '評価＋' }).first().click();
  await expect(page.locator('.delta.positive').first()).toHaveCSS('color', 'rgb(122, 183, 255)');
  await page.getByRole('button', { name: '評価−' }).first().click();
  await expect(page.locator('.delta.negative').first()).toHaveCSS('color', 'rgb(255, 126, 134)');
  await page.getByRole('button', { name: '保存' }).first().click();
  await expect(page.getByRole('button', { name: '保存' }).first()).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '調査登録' }).first().click();
  await page.getByRole('button', { name: '情報源' }).first().click();
  await expect(page.getByRole('dialog', { name: '情報源プロファイル' })).toBeVisible();
  await page.getByRole('button', { name: '閉じる' }).click();

  await advance(page, 17);
  await expect(page.getByText('17 / 60か月')).toBeVisible();
  await page.reload();
  await expect(page.getByText('17 / 60か月')).toBeVisible();
  await page.locator('#feed-filter').selectOption('bookmarked');
  await expect(page.getByRole('button', { name: '保存' }).first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.delta.negative').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /フォロー/ })).toHaveCount(0);
});

test('shows a warning when a corrupt candidate falls back to the canonical save', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: '保存' }).first().click();
  await page.evaluate(() => localStorage.setItem('adhoms.ver1.candidate', '{'));
  await page.reload();
  await expect(page.getByRole('button', { name: '翌月へ' })).toBeVisible();
  await expect(page.locator('#diagnostic')).toContainText('save is not valid JSON');
});

test('annual review contains a five-year forecast chart', async ({ page }) => {
  await start(page);
  await advance(page, 11);
  await page.getByRole('button', { name: '翌月へ' }).click();
  await page.getByRole('button', { name: '判断を確定' }).click();
  const dialog = page.getByRole('dialog', { name: '年次報告' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('svg[aria-label="5年間予測"]')).toBeVisible();
  await expect(dialog.locator('[data-series="forecast-line"]')).toHaveAttribute('d', /L/);
  await expect(dialog.locator('[data-series="uncertainty-band"]')).toBeVisible();
});

test('quarterly workflow and confirmed policy survive reload', async ({ page }) => {
  await expect(page.locator('#setup-priorities [data-priority]')).toHaveCount(5);
  await expect(page.locator('#setup-terminal-policy [data-policy]')).toHaveCount(6);
  await start(page);
  await advance(page, 2);
  await page.getByRole('button', { name: '翌月へ' }).click();
  const dialog = page.getByRole('dialog', { name: '四半期判断' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await page.reload();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: '採択' })).toHaveCount(3);
  await expect(dialog.getByRole('button', { name: '見送る' })).toHaveCount(3);

  await dialog.locator('[data-priority="welfare"]').fill('65');
  await page.getByRole('button', { name: '判断を確定' }).click();
  await expect(dialog.getByRole('alert')).toContainText('現在305点');
  await dialog.locator('[data-priority="technology"]').fill('55');
  await dialog.locator('[data-policy="coverage"]').fill('30');
  await page.getByRole('button', { name: '判断を確定' }).click();
  await expect(dialog).toBeHidden();
  await page.reload();
  await advance(page, 2);
  await page.getByRole('button', { name: '翌月へ' }).click();
  await expect(dialog.locator('[data-priority="welfare"]')).toHaveValue('65');
  await expect(dialog.locator('[data-priority="technology"]')).toHaveValue('55');
  await expect(dialog.locator('[data-policy="coverage"]')).toHaveValue('30');
});

test('setup validates constrained allocation and completed saves can be replaced', async ({ page }) => {
  await page.locator('#setup-priorities [data-priority="welfare"]').fill('70');
  await page.getByRole('button', { name: '5年間の実証を開始' }).click();
  await expect(page.locator('#setup-error')).toContainText('現在310点');
  await page.locator('#setup-priorities [data-priority="technology"]').fill('50');
  await page.getByRole('button', { name: '5年間の実証を開始' }).click();
  await expect(page.getByRole('button', { name: '翌月へ' })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '新しい実証' }).click();
  await expect(page.getByRole('button', { name: '5年間の実証を開始' })).toBeVisible();
});
