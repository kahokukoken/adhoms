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
        // Prepared equipment is not usable capacity before a deployment decision.
        portable: 0,
      },
    };
  }

  function availableEmergencyCommands(state) {
    const out = ['issue_warning', 'close_route', 'reassign_buses'];
    const accepted = (id, actorId) => {
        const agreement = state.agreements?.[id];
        const proposal = state.proposals?.y4_strategy;
        return agreement?.status === 'accepted' && agreement.offerId === id && agreement.actorId === actorId &&
          agreement.source?.type === 'actor-response' &&
          proposal?.status === 'accepted' && agreement.source.id === `y4_strategy:${proposal.choiceId}` &&
          Array.isArray(proposal.responses) && proposal.responses.some(response =>
            response.offerId === id && response.actorId === actorId && response.status === 'accepted');
    };
    const preparation = state.portablePreparation;
    const proposal = state.proposals?.y4_strategy;
    if (accepted('factory_support', 'factory_logistics') && accepted('warehouse_outreach', 'warehouse') && proposal?.portablePreparationRequested === true &&
        preparation?.status === 'secured' && preparation.actorId === 'shelter_team' &&
        preparation.placementConfirmed === true && preparation.stockCapacity === 120 &&
        preparation.siteCapacity === 120 && preparation.source?.type === 'actor-response' &&
        preparation.source.id === `y4_strategy:${proposal.choiceId}` &&
        proposal.responses.some(response => response.actorId === 'shelter_team' && response.status === 'accepted')) {
      out.push('deploy_portable_shelter');
    }
    // DL-020: new runs need the supplying actor's actual accepted response.
    // Old saves retain their historical capabilities; no consent is backfilled.
    if (state.supportModelVersion === 1) {
      const factory = accepted('factory_support', 'factory_logistics');
      const lab = accepted('lab_support', 'technical_lab');
      const school = accepted('school_support', 'school');
      const warehouse = accepted('warehouse_outreach', 'warehouse');
      if (accepted('fuel_outreach', 'gas_station')) out.push('priority_fuel');
      if (warehouse) out.push('open_warehouse');
      if (lab) out.push('deploy_drone_relay');
      if (school) out.push('open_school_ground');
      if (state.town.distributedCapacity >= 2 && lab && factory) out.push('deploy_mobile_command');
      return out;
    }
    if (state.relations.gas_station >= 2 || accepted('fuel_outreach', 'gas_station')) out.push('priority_fuel');
    if (state.relations.warehouse >= 2 || accepted('warehouse_outreach', 'warehouse')) out.push('open_warehouse');
    if (state.relations.technical_lab >= 2 || accepted('lab_support', 'technical_lab')) out.push('deploy_drone_relay');
    if (state.relations.school >= 2 || accepted('school_support', 'school')) out.push('open_school_ground');
    if (state.town.distributedCapacity >= 2) out.push('deploy_mobile_command');
    if (state.town.distributedCapacity >= 3 && !out.includes('deploy_portable_shelter')) out.push('deploy_portable_shelter');
    return out;
  }

  window.ADHOMS_VER1_DISASTER = {
    score,
    deriveDisasterState,
    availableEmergencyCommands,
  };
})();
