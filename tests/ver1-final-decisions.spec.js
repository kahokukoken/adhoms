const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:8000/';

function minRoute(derived) {
  return Math.min(...Object.values(derived.routeLifetimeMin));
}

test.describe('ADHOMS Ver1 final disaster decision effects', () => {
  test('later disaster choices materially change modeled safety and continuity', async ({ page }) => {
    await page.goto(URL);

    const result = await page.evaluate(() => {
      const base = window.ADHOMS_VER1_STATE.createInitialState();
      base.town.distributedCapacity = 3;
      base.relations.school = 2;

      let session = window.ADHOMS_VER1_FINAL.createSession(base);
      session = window.ADHOMS_VER1_FINAL.applyDecision(session, 'portable_shelter', 'full');
      session = window.ADHOMS_VER1_FINAL.applyDecision(session, 'mobile_command', 'deploy_highground');

      session = window.ADHOMS_VER1_FINAL.nextPhase(session);
      const beforeTraffic = session.derived.evacuationDelayMin;
      session = window.ADHOMS_VER1_FINAL.applyDecision(session, 'traffic_priority', 'residents');
      const afterTraffic = session.derived.evacuationDelayMin;

      session = window.ADHOMS_VER1_FINAL.nextPhase(session);
      const beforeRoute = Math.min(...Object.values(session.derived.routeLifetimeMin));
      const beforeBalanced = { ...session.people };
      session = window.ADHOMS_VER1_FINAL.applyDecision(session, 'route_closure', 'early');
      session = window.ADHOMS_VER1_FINAL.applyDecision(session, 'vehicle_allocation', 'balanced');
      const afterRoute = Math.min(...Object.values(session.derived.routeLifetimeMin));
      const afterBalanced = { ...session.people };

      session = window.ADHOMS_VER1_FINAL.nextPhase(session);
      const beforeReroute = Math.min(...Object.values(session.derived.routeLifetimeMin));
      const beforeTemporary = session.derived.shelterCapacity.fixed;
      session = window.ADHOMS_VER1_FINAL.applyDecision(session, 'reroute', 'distributed');
      session = window.ADHOMS_VER1_FINAL.applyDecision(session, 'shelter_rebalance', 'open_temporary');
      const afterReroute = Math.min(...Object.values(session.derived.routeLifetimeMin));
      const afterTemporary = session.derived.shelterCapacity.fixed;

      session = window.ADHOMS_VER1_FINAL.nextPhase(session);
      const beforeRedeploy = session.derived.evacuationDelayMin;
      const beforeLogistics = session.derived.logisticsHours;
      session = window.ADHOMS_VER1_FINAL.applyDecision(session, 'portable_redeploy', 'move_highground');
      session = window.ADHOMS_VER1_FINAL.applyDecision(session, 'logistics_reallocate', 'critical_sites');

      return {
        beforeTraffic,
        afterTraffic,
        beforeRoute,
        afterRoute,
        beforeBalanced,
        afterBalanced,
        beforeReroute,
        afterReroute,
        beforeTemporary,
        afterTemporary,
        beforeRedeploy,
        afterRedeploy: session.derived.evacuationDelayMin,
        beforeLogistics,
        afterLogistics: session.derived.logisticsHours,
      };
    });

    expect(result.afterTraffic).toBeLessThan(result.beforeTraffic);
    expect(result.afterRoute).toBeGreaterThan(result.beforeRoute);
    expect(result.afterBalanced.chihiro.risk).toBeLessThan(result.beforeBalanced.chihiro.risk);
    expect(result.afterBalanced.gaku.risk).toBeLessThan(result.beforeBalanced.gaku.risk);
    expect(result.afterBalanced.towa.risk).toBeLessThan(result.beforeBalanced.towa.risk);
    expect(result.afterReroute).toBeGreaterThan(result.beforeReroute);
    expect(result.afterTemporary).toBeGreaterThan(result.beforeTemporary);
    expect(result.afterRedeploy).toBeLessThan(result.beforeRedeploy);
    expect(result.afterLogistics).toBeGreaterThan(result.beforeLogistics);
  });
});
