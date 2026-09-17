const { test, expect } = require('@playwright/test');

test('monthly meeting always opens from the introduction at the top', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/');

  await page.getByRole('button', { name: '月末まで →' }).click();
  const meeting = page.locator('#meeting');
  const body = page.locator('#meetingBody');
  await expect(page.locator('.meetingPrelude')).toBeVisible();
  expect(await meeting.evaluate(el => el.scrollTop)).toBe(0);
  expect(await body.evaluate(el => el.scrollTop)).toBe(0);

  await meeting.evaluate(el => { el.scrollTop = el.scrollHeight; });
  await body.evaluate(el => { el.scrollTop = el.scrollHeight; });
  await page.locator('.meetingContinue').click();

  await page.getByRole('button', { name: '月末まで →' }).click();
  await expect(page.locator('.meetingPrelude')).toBeVisible();
  expect(await meeting.evaluate(el => el.scrollTop)).toBe(0);
  expect(await body.evaluate(el => el.scrollTop)).toBe(0);
});
