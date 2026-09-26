const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

for (const [kind, url] of [
  ['web', 'http://127.0.0.1:8000/'],
  ['standalone', pathToFileURL(path.join(process.cwd(), 'dist/ADHOMS-Ver1.html')).href]
]) {
  test(`${kind}: every seasonal week brings six ordinary posts with replies and staff`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    // V1-03: exercise the full five-year calendar, including Jan–Mar boundaries.
    const months = await page.evaluate(() => {
      const result = [];
      for (let index = 0; index < 60; index++) {
        S.year = Math.floor((index + 3) / 12) + 1;
        S.month = (index + 3) % 12 + 1;
        S.week = 4; S.filter = 'ALL';
        renderFeed(); renderFeed(); // repaint must not duplicate arrivals
        const cards = [...document.querySelectorAll('#feedList .card')];
        result.push({ index, ids:cards.map(n=>n.dataset.id), weeks:[2,3,4].map(week=>{
          const ordinary = cards.filter(n=>Number(n.dataset.week)===week && !n.dataset.storyBeat && !n.dataset.historyBeat && !n.dataset.researchBeat);
          return {week, count:ordinary.length, authors:new Set(ordinary.map(n=>n.querySelector('.who').textContent)).size,
            replies:ordinary.filter(n=>n.querySelector('.replyto')).length,
            staff:ordinary.some(n=>n.querySelector('.profileLine').textContent.includes('河北恒研'))};
        })});
      }
      return result;
    });
    for (const month of months) {
      expect(new Set(month.ids).size).toBe(month.ids.length);
      for (const week of month.weeks) {
        expect(week.count, `month ${month.index}, week ${week.week}`).toBe(6);
        expect(week.authors).toBeGreaterThanOrEqual(4);
        expect(week.replies).toBeGreaterThanOrEqual(2);
        expect(week.staff).toBe(true);
      }
    }
    expect(errors).toEqual([]);
  });

  test(`${kind}: new conversations retain old saved IDs and everyday weights do not start research`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width:390, height:844 });
    await page.goto(url);
    await page.locator('#nextWeek').click();
    const old = page.locator('[data-id="scenario-0-6"]');
    await expect(old).toContainText('田中 美咲');
    await expect(old).toContainText('保育園');
    await old.getByRole('button', {name:'−',exact:true}).click();
    const daily = page.locator('[data-id="scenario-0-weekly-2-lunch"]');
    await daily.getByRole('button', {name:'＋',exact:true}).click();
    expect(await page.evaluate(()=>S.research)).toEqual([]);
    await page.reload();
    await expect(page.locator('#bottomMn')).toHaveText('第2週');
    await expect(old.getByRole('button', {name:'−',exact:true})).toHaveAttribute('aria-pressed','true');
    await expect(daily.getByRole('button', {name:'＋',exact:true})).toHaveAttribute('aria-pressed','true');
    const prior = await page.locator('#feedList .card').evaluateAll(nodes=>nodes.map(n=>n.dataset.id));
    await page.locator('#nextWeek').click();
    const after = await page.locator('#feedList .card').evaluateAll(nodes=>nodes.map(n=>n.dataset.id));
    expect(after.slice(0,prior.length)).toEqual(prior);
    await expect(page.locator('[data-id="scenario-0-8"]')).toContainText('山本 大輔');
    const observation = page.locator('[data-id="scenario-0-weekly-3-notebook"]');
    await observation.getByRole('button', {name:'＋',exact:true}).click();
    expect(await page.evaluate(()=>S.research.length)).toBe(1);
    await page.reload();
    await expect(observation.getByRole('button', {name:'＋',exact:true})).toHaveAttribute('aria-pressed','true');
    expect(await page.evaluate(()=>S.research.length)).toBe(1);
    await observation.scrollIntoViewIfNeeded();
    await page.screenshot({path:testInfo.outputPath('weekly-staff-observation.png')});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.locator('#nextWeek').click();
    // Staff terminal guidance is not a transport observation either.
    await page.locator('[data-id="scenario-0-weekly-4-paper"]').getByRole('button', {name:'＋',exact:true}).click();
    expect(await page.evaluate(()=>S.research.length)).toBe(1);
    await page.locator('#toMonthEnd').click();
    await expect(page.locator('.meetingObservations')).toContainText('弁当箱');
    await expect(page.locator('.meetingObservations')).not.toContainText('あなたの親愛なるAI');
  });
}
