(() => {
  function score(state) {
    const t = state.town;
    const avgRelation = Object.values(state.relations).reduce((a, b) => a + b, 0) /
      Math.max(1, Object.keys(state.relations).length);

    return {
      warningConversion: t.trust + t.legitimacy + t.responseReadiness,
      mobility: t.networkResilience + avgRelation,
      reconfiguration: t.distributedCapacity + avgRelation,
      floodBuffer: t.environmentalBuffer + t.networkResilience,
    };
  }

  function deriveDisasterState(state) {
    const s = score(state);
    return {
      evacuationDelayMin: Math.max(5, 50 - s.warningConversion * 4),
      logisticsHours: Math.max(2, Math.round(3 + s.reconfiguration * 1.5)),
      routeLifetimeMin: {
        station_route: Math.max(8, Math.round(10 + s.mobility * 3)),
        forest_route: Math.max(8, Math.round(8 + s.floodBuffer * 3)),
        festival_route: Math.max(8, Math.round(9 + s.mobility * 2.5)),
      },
      shelterCapacity: {
        fixed: 100 + Math.round(state.town.distributedCapacity * 25),
        portable: Math.round(state.town.distributedCapacity * 40),
      },
    };
  }

  function availableEmergencyCommands(state) {
    const out = ['issue_warning', 'close_route', 'reassign_buses'];
    if (state.relations.gas_station >= 2) out.push('priority_fuel');
    if (state.relations.warehouse >= 2) out.push('open_warehouse');
    if (state.relations.technical_lab >= 2) out.push('deploy_drone_relay');
    if (state.relations.school >= 2) out.push('open_school_ground');
    if (state.town.distributedCapacity >= 2) out.push('deploy_mobile_command');
    if (state.town.distributedCapacity >= 3) out.push('deploy_portable_shelter');
    return out;
  }

  window.ADHOMS_VER1_DISASTER = {
    score,
    deriveDisasterState,
    availableEmergencyCommands,
  };
})();