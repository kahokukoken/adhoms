(() => {
  const PHASES = [
    {
      id: 'morning',
      label: '朝',
      summary: 'まだ平穏。中止や前倒しは過剰対応にも見える。',
      decisions: ['sumo_schedule', 'towa_schedule', 'portable_shelter', 'mobile_command'],
    },
    {
      id: 'noon',
      label: '昼',
      summary: '森林公園で降雨強度が急上昇。TOWAイベント撤収判断。',
      decisions: ['forest_evacuation', 'traffic_priority'],
    },
    {
      id: 'evening_peak',
      label: '夕方',
      summary: '降雨極大。八朔相撲の観客集中と衝突。',
      decisions: ['sumo_evacuation', 'route_closure', 'vehicle_allocation'],
    },
    {
      id: 'evening_failure',
      label: '夕方後半',
      summary: '道路・橋・通信・避難所のいずれかが故障し、安全判定が反転。',
      decisions: ['reroute', 'shelter_rebalance'],
    },
    {
      id: 'night_upstream',
      label: '夜',
      summary: '雨が弱まっても上流からの水が到達。下流ピークは未到達。',
      decisions: ['portable_redeploy', 'logistics_reallocate'],
    },
    {
      id: 'personal_crisis',
      label: '個人危機',
      summary: '高倉千尋・柴垣岳・TOWAの危機と町全体の優先順位が衝突。',
      decisions: ['priority_override'],
    },
    {
      id: 'convergence',
      label: '収束',
      summary: '人命、生活基盤、事業、Relationの損失を別々に評価。',
      decisions: [],
    },
  ];

  const DEFAULT_CHOICES = {
    sumo_schedule: ['keep', 'advance', 'cancel'],
    towa_schedule: ['keep', 'advance', 'reduce', 'cancel'],
    portable_shelter: ['none', 'partial', 'full'],
    mobile_command: ['standby', 'deploy_highground'],
    forest_evacuation: ['wait', 'start_now'],
    traffic_priority: ['residents', 'mixed', 'event_first'],
    sumo_evacuation: ['wait', 'start_now'],
    route_closure: ['gradual', 'early'],
    vehicle_allocation: ['festival', 'forest', 'vulnerable_households', 'balanced'],
    reroute: ['shortest', 'distributed'],
    shelter_rebalance: ['hold', 'move_people', 'open_temporary'],
    portable_redeploy: ['hold', 'move_highground'],
    logistics_reallocate: ['equal', 'critical_sites'],
    priority_override: ['system_priority', 'manual_override'],
  };

  function createSession(state) {
    const derived = window.ADHOMS_VER1_DISASTER.deriveDisasterState(state);
    const people = {
      chihiro: { risk: 2, status: 'safe' },
      gaku: { risk: 2, status: 'safe' },
      towa: { risk: 2, status: 'safe' },
    };
    return {
      phaseIndex: 0,
      state: structuredClone(state),
      derived,
      commands: window.ADHOMS_VER1_DISASTER.availableEmergencyCommands(state),
      decisions: {},
      decisionBase: {
        state: structuredClone(state),
        derived: structuredClone(derived),
        people: structuredClone(people),
      },
      incidents: [],
      people,
      result: null,
    };
  }

  function availableChoices(session, key) {
    const choices = DEFAULT_CHOICES[key] || [];
    if (key === 'portable_shelter' && !session.commands.includes('deploy_portable_shelter')) {
      return choices.filter((value) => value === 'none');
    }
    if (key === 'mobile_command' && !session.commands.includes('deploy_mobile_command')) {
      return choices.filter((value) => value === 'standby');
    }
    if (key === 'shelter_rebalance' && !session.commands.includes('open_school_ground')) {
      return choices.filter((value) => value !== 'open_temporary');
    }
    if (
      key === 'portable_redeploy' &&
      (!session.commands.includes('deploy_portable_shelter') ||
        !['partial', 'full'].includes(session.decisions.portable_shelter))
    ) {
      return choices.filter((value) => value === 'hold');
    }
    return [...choices];
  }

  function assertDecisionAllowed(session, key, value) {
    const phase = PHASES[session.phaseIndex];
    if (!phase || !phase.decisions.includes(key)) {
      throw new Error(`Decision ${key} is not available in the current phase.`);
    }
    if (!(DEFAULT_CHOICES[key] || []).includes(value)) {
      throw new Error(`Unknown decision value: ${key}:${value}`);
    }
    if (!availableChoices(session, key).includes(value)) {
      throw new Error(`Decision ${key}:${value} is unavailable because the required prepared resource is not available.`);
    }
  }

  function lowerRisk(person, amount = 1) {
    person.risk = Math.max(0, person.risk - amount);
  }

  function shiftRouteLifetime(derived, delta) {
    for (const route of Object.keys(derived.routeLifetimeMin)) {
      derived.routeLifetimeMin[route] = Math.max(1, derived.routeLifetimeMin[route] + delta);
    }
  }

  function applyDecisionEffect(next, key, value) {
    if (key === 'sumo_schedule' && value === 'keep') next.people.gaku.risk += 2;
    if (key === 'sumo_schedule' && value === 'advance') lowerRisk(next.people.gaku, 1);
    if (key === 'sumo_schedule' && value === 'cancel') lowerRisk(next.people.gaku, 2);

    if (key === 'towa_schedule' && value === 'keep') next.people.towa.risk += 2;
    if (key === 'towa_schedule' && value === 'advance') lowerRisk(next.people.towa, 1);
    if (key === 'towa_schedule' && value === 'reduce') lowerRisk(next.people.towa, 1);
    if (key === 'towa_schedule' && value === 'cancel') lowerRisk(next.people.towa, 2);

    if (key === 'portable_shelter' && value === 'partial') next.derived.shelterCapacity.portable += 60;
    if (key === 'portable_shelter' && value === 'full') next.derived.shelterCapacity.portable += 120;

    if (key === 'mobile_command' && value === 'deploy_highground') {
      next.derived.logisticsHours += 1;
      next.incidents.push({ source: 'decision', type: 'preparedness', text: '移動指令所を高所へ先行展開。' });
    }

    if (key === 'forest_evacuation' && value === 'wait') next.people.towa.risk += 1;

    if (key === 'traffic_priority' && value === 'residents') {
      next.derived.evacuationDelayMin = Math.max(0, next.derived.evacuationDelayMin - 4);
    }
    if (key === 'traffic_priority' && value === 'mixed') {
      next.derived.evacuationDelayMin = Math.max(0, next.derived.evacuationDelayMin - 2);
    }
    if (key === 'traffic_priority' && value === 'event_first') next.derived.evacuationDelayMin += 3;

    if (key === 'sumo_evacuation' && value === 'wait') next.people.gaku.risk += 1;

    if (key === 'route_closure' && value === 'gradual') {
      next.derived.evacuationDelayMin += 2;
      next.derived.logisticsHours += 1;
    }
    if (key === 'route_closure' && value === 'early') {
      next.derived.evacuationDelayMin = Math.max(0, next.derived.evacuationDelayMin - 2);
      shiftRouteLifetime(next.derived, 6);
    }

    if (key === 'vehicle_allocation' && value === 'festival') {
      lowerRisk(next.people.gaku, 2);
      next.people.chihiro.risk += 1;
      next.people.towa.risk += 1;
    }
    if (key === 'vehicle_allocation' && value === 'forest') {
      lowerRisk(next.people.towa, 2);
      next.people.chihiro.risk += 1;
      next.people.gaku.risk += 1;
    }
    if (key === 'vehicle_allocation' && value === 'vulnerable_households') {
      lowerRisk(next.people.chihiro, 2);
      next.people.gaku.risk += 1;
      next.people.towa.risk += 1;
    }
    if (key === 'vehicle_allocation' && value === 'balanced') {
      lowerRisk(next.people.chihiro, 1);
      lowerRisk(next.people.gaku, 1);
      lowerRisk(next.people.towa, 1);
    }

    if (key === 'reroute' && value === 'shortest') {
      next.derived.evacuationDelayMin = Math.max(0, next.derived.evacuationDelayMin - 3);
      shiftRouteLifetime(next.derived, -2);
    }
    if (key === 'reroute' && value === 'distributed') {
      next.derived.evacuationDelayMin += 2;
      shiftRouteLifetime(next.derived, 5);
    }

    if (key === 'shelter_rebalance' && value === 'move_people') {
      lowerRisk(next.people.chihiro, 1);
      next.derived.evacuationDelayMin += 1;
    }
    if (key === 'shelter_rebalance' && value === 'open_temporary') {
      next.derived.shelterCapacity.fixed += 80;
      next.derived.logisticsHours = Math.max(1, next.derived.logisticsHours - 1);
    }

    if (key === 'portable_redeploy' && value === 'move_highground') {
      lowerRisk(next.people.chihiro, 1);
      next.derived.evacuationDelayMin = Math.max(0, next.derived.evacuationDelayMin - 1);
    }

    if (key === 'logistics_reallocate' && value === 'critical_sites') {
      next.derived.logisticsHours += 2;
      lowerRisk(next.people.chihiro, 1);
    }

    if (key === 'priority_override' && value === 'manual_override') {
      next.state.town.legitimacy = Math.max(0, next.state.town.legitimacy - 1);
      next.incidents.push({ source: 'decision', type: 'ethics', text: '個人的関係を理由に優先順位を手動変更。' });
    }
  }

  function rebuildDecisionEffects(session, decisions) {
    const next = structuredClone(session);
    const base = session.decisionBase || {
      state: session.state,
      derived: session.derived,
      people: session.people,
    };
    next.state = structuredClone(base.state);
    next.derived = structuredClone(base.derived);
    next.people = structuredClone(base.people);
    next.decisions = {};
    next.incidents = (session.incidents || []).filter((incident) => incident.source !== 'decision');

    for (const [key, value] of Object.entries(decisions)) {
      next.decisions[key] = value;
      applyDecisionEffect(next, key, value);
    }
    return next;
  }

  function applyDecision(session, key, value) {
    assertDecisionAllowed(session, key, value);
    return rebuildDecisionEffects(session, { ...session.decisions, [key]: value });
  }

  function triggerPhaseIncident(session) {
    const next = structuredClone(session);
    const phase = PHASES[next.phaseIndex];

    if (phase.id === 'evening_failure') {
      const route = Object.entries(next.derived.routeLifetimeMin).sort((a, b) => a[1] - b[1])[0];
      next.incidents.push({
        type: 'cascade',
        text: `${route[0]} が最初に使用不能域へ。安全判定済み地区を再評価。`,
      });
    }

    if (phase.id === 'night_upstream') {
      next.incidents.push({
        type: 'upstream',
        text: '上流域降水の流下を確認。下流ピークは未到達。',
      });
    }

    if (phase.id === 'personal_crisis') {
      for (const person of Object.values(next.people)) {
        if (person.risk >= 4) person.status = 'critical';
        else if (person.risk >= 3) person.status = 'danger';
        else person.status = 'safe';
      }
    }

    return next;
  }

  function nextPhase(session) {
    let next = triggerPhaseIncident(session);
    next.phaseIndex = Math.min(PHASES.length - 1, next.phaseIndex + 1);
    return next;
  }

  function finalize(session) {
    const next = structuredClone(session);
    const critical = Object.values(next.people).filter((p) => p.status === 'critical').length;
    const danger = Object.values(next.people).filter((p) => p.status === 'danger').length;
    const t = next.state.town;
    const routeFloor = Math.min(...Object.values(next.derived.routeLifetimeMin));
    const shelterTotal = next.derived.shelterCapacity.fixed + next.derived.shelterCapacity.portable;
    const shelterSafety = Math.min(10, Math.floor(shelterTotal / 80));
    const operationsContinuity =
      Math.min(10, Math.floor(next.derived.logisticsHours / 2)) +
      Math.min(5, Math.floor(routeFloor / 10)) +
      Math.min(5, Math.floor(shelterTotal / 150));

    const humanSafety = Math.max(
      0,
      Math.min(100, 100 - critical * 30 - danger * 10 - next.derived.evacuationDelayMin + shelterSafety)
    );
    const livelihoodContinuity = Math.max(
      0,
      Math.min(
        100,
        35 + t.networkResilience * 10 + t.distributedCapacity * 10 + operationsContinuity - critical * 5
      )
    );
    const relationContinuity = Math.max(
      0,
      Math.min(100, 35 + t.trust * 10 + t.legitimacy * 10)
    );

    next.result = {
      humanSafety,
      livelihoodContinuity,
      relationContinuity,
      administrativeSuccess: humanSafety >= 60,
      individualLossPossible: livelihoodContinuity < 85 || relationContinuity < 85,
      people: next.people,
    };
    return next;
  }

  window.ADHOMS_VER1_FINAL = {
    PHASES,
    DEFAULT_CHOICES,
    createSession,
    availableChoices,
    applyDecision,
    nextPhase,
    finalize,
  };
})();