const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';
const STATE_KEY = 'adhoms.ver1.lightstate';

test.describe('ADHOMS Ver1 V1-08 history feedback', () => {
  test('a Year 2 flood choice returns later through FEED and the monthly conversation', async ({ page }) => {
    await page.goto(URL);

    await page.evaluate((stateKey) => {
      let state = window.ADHOMS_VER1_STATE.createInitialState();
      state.year = 2;
      state.month = 6;
      state = window.ADHOMS_VER1_EVENTS.resolveChoice(state, 'y2_flood', 'early_close');
      state.year = 2;
      state.month = 8;
      window.ADHOMS_LIGHT_STATE = state;
      localStorage.setItem(stateKey, JSON.stringify(state));

      S.year = 2;
      S.month = 8;
      S.week = 4;
      updateTop();
      renderFeed();
    }, STATE_KEY);

    const delayed = page.locator('#feedList [data-history-beat="true"]');
    await expect(delayed.filter({ hasText: '駅側低地・商店会' })).toHaveCount(1);
    await expect(delayed.filter({ hasText: '事故は出なかった' })).toHaveCount(1);
    await expect(delayed.filter({ hasText: '負担がなかった' })).toHaveCount(1);

    await page.evaluate(() => openMeeting());
    const meeting = page.locator('#meeting');
    await expect(meeting).toHaveClass(/on/);
    await expect(meeting).toContainText('通行止めで守れたもの');
    await expect(meeting).toContainText('事故ゼロだけを成功値');
  });

  test('Year 3 propagated effects return to ordinary FEED after the yearly report', async ({ page }) => {
    await page.goto(URL);

    await page.evaluate((stateKey) => {
      let state = window.ADHOMS_VER1_STATE.createInitialState();
      state.year = 2;
      state = window.ADHOMS_VER1_EVENTS.resolveChoice(state, 'y2_flood', 'guided_watch');
      state = window.ADHOMS_VER1_EVENTS.resolveChoice(state, 'y2_wildlife', 'survey');
      state = window.ADHOMS_VER1_EVENTS.resolveChoice(state, 'y2_snow', 'welfare_first');
      state.year = 3;
      state.month = 5;
      const propagated = window.ADHOMS_VER1_PROPAGATION.applySideEffects(state);
      state = propagated.state;
      state.flags.y3_ack = true;
      window.ADHOMS_LIGHT_STATE = state;
      localStorage.setItem(stateKey, JSON.stringify(state));

      S.year = 3;
      S.month = 5;
      S.week = 4;
      updateTop();
      renderFeed();
    }, STATE_KEY);

    const returned = page.locator('#feedList [data-history-beat="true"]');
    await expect(returned.filter({ hasText: '前年施策追跡' })).toHaveCount(3);
    await expect(returned.filter({ hasText: '現地誘導が成功体験' })).toHaveCount(1);
    await expect(returned.filter({ hasText: '高専連携' })).toHaveCount(1);
    await expect(returned.filter({ hasText: '工場・物流側の負担感' })).toHaveCount(1);
  });

  test('Year 4 cooperation history changes concrete prepared capabilities and shows the hand', async ({ page }) => {
    await page.goto(URL);

    const result = await page.evaluate(() => {
      let state = window.ADHOMS_VER1_STATE.createInitialState();
      state.year = 4;
      state.month = 4;
      state.town.legitimacy = 3;
      state.relations.factory_logistics = 2;
      state.relations.technical_lab = 2;
      state.relations.school = 2;
      state.relations.childcare = 2;

      const context = window.ADHOMS_VER1_PROPAGATION.cooperationOffers(state);
      const resolved = window.ADHOMS_VER1_PROPAGATION.resolveYear4Strategy(state, 'deepen');
      const commands = window.ADHOMS_VER1_DISASTER.availableEmergencyCommands(resolved.state);
      return {
        offers: context.offers.map(x => x.id),
        commands,
        securedWarehouse: resolved.state.flags['offer:warehouse_outreach:secured'],
        securedFuel: resolved.state.flags['offer:fuel_outreach:secured'],
        state: resolved.state,
      };
    });

    expect(result.offers).toEqual(expect.arrayContaining([
      'factory_support', 'lab_support', 'school_support', 'warehouse_outreach', 'fuel_outreach'
    ]));
    expect(result.commands).toEqual(expect.arrayContaining([
      'priority_fuel', 'open_warehouse', 'deploy_drone_relay', 'open_school_ground'
    ]));
    expect(result.securedWarehouse).toBe(true);
    expect(result.securedFuel).toBe(true);

    await page.evaluate(({ state, stateKey }) => {
      state.year = 4;
      state.month = 6;
      window.ADHOMS_LIGHT_STATE = state;
      localStorage.setItem(stateKey, JSON.stringify(state));
      S.year = 4;
      S.month = 6;
      S.week = 4;
      updateTop();
      renderFeed();
      showEnding();
    }, { state: result.state, stateKey: STATE_KEY });

    const hand = page.locator('#feedList [data-history-beat="true"]').filter({ hasText: '利用可能領域' });
    await expect(hand).toContainText('優先給油');
    await expect(hand).toContainText('倉庫開放');
    await expect(hand).toContainText('高専通信・ドローン中継');

    const final = page.locator('#ver1Choice');
    await expect(final).toHaveClass(/on/);
    await expect(final).toContainText('過去4年で準備できた手札');
    await expect(final).toContainText('優先給油協定');
    await expect(final).toContainText('倉庫開放協定');
    await expect(final).toContainText('高専通信・ドローン中継');
  });
});
