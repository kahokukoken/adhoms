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
      summary: '高倉真知・柴垣晃生・TOWAの危機と町全体の優先順位が衝突。',
      decisions: ['priority_override', 'personal_vehicle_allocation'],
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
    personal_vehicle_allocation: ['festival', 'forest', 'vulnerable_households', 'balanced'],
  };

  function createSession(state) {
    const derived = window.ADHOMS_VER1_DISASTER.deriveDisasterState(state);
    const people = {
      chihiro: { risk: 2, status: 'safe' },
      gaku: { risk: 2, status: 'safe' },
      towa: { risk: 2, status: 'safe' },
    };
    return {
      portableCapacityVersion: 1,
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

  // Migrate only a complete, recognizable active legacy baseline. Do not
  // replay actions through applyDecision: old saves have no implied new assent.
  // Historical terminal results and incomplete records remain unchanged.
  function migratePortableCapacity(session, stage = 'active') {
    if (stage !== 'active' || session.result || session.portableCapacityVersion === 1) return session;
    const base = session.decisionBase?.derived?.shelterCapacity?.portable;
    const current = session.derived?.shelterCapacity?.portable;
    const capacity = session.decisionBase?.state?.town?.distributedCapacity;
    const decision = session.decisions?.portable_shelter;
    const deployed = decision === 'full' ? 120 : decision === 'partial' ? 60
      : decision === 'none' || decision === undefined ? 0 : null;
    if (!Number.isFinite(base) || !Number.isFinite(current) || !Number.isFinite(capacity) ||
        base !== Math.round(capacity * 40) || deployed === null || current !== base + deployed) return session;
    const next = structuredClone(session);
    next.decisionBase.derived.shelterCapacity.portable = 0;
    next.derived.shelterCapacity.portable = deployed;
    next.portableCapacityVersion = 1;
    next.portableCapacityMigration = { removedUndeployedBaseline: base };
    return next;
  }

  function availableChoices(session, key) {
    const choices = DEFAULT_CHOICES[key] || [];
    if (key === 'personal_vehicle_allocation' &&
        (PHASES[session.phaseIndex]?.id !== 'personal_crisis' ||
          session.decisions.priority_override !== 'manual_override')) {
      return [];
    }
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

    // Keep both decisions as history; only one allocation contributes risk.
    // Replace at the original effect position so subsequent capped reductions
    // are replayed once in their existing order, rather than undone arithmetically.
    const personalAllocation = decisions.priority_override === 'manual_override' &&
      DEFAULT_CHOICES.personal_vehicle_allocation.includes(decisions.personal_vehicle_allocation)
        ? decisions.personal_vehicle_allocation : null;
    const hasEarlierAllocation = DEFAULT_CHOICES.vehicle_allocation.includes(decisions.vehicle_allocation);
    for (const [key, value] of Object.entries(decisions)) {
      next.decisions[key] = value;
      if (key === 'personal_vehicle_allocation') {
        if (personalAllocation && !hasEarlierAllocation) {
          applyDecisionEffect(next, 'vehicle_allocation', personalAllocation);
        }
      } else {
        applyDecisionEffect(next, key, key === 'vehicle_allocation' && personalAllocation
          ? personalAllocation : value);
      }
    }
    return next;
  }

  function applyDecision(session, key, value) {
    assertDecisionAllowed(session, key, value);
    // DL-020: the standing disaster arrangement assigns execution to the
    // responsible actor, not ADHOMS. No response is inferred for old choices.
    const actors = {
      sumo_schedule:['sumo_organizer','八朔相撲運営','開催・撤収の運営判断'],
      towa_schedule:['towa_organizer','TOWAイベント運営','開催・撤収の運営判断'],
      portable_shelter:['shelter_team','避難所担当','確保済み可搬避難所の展開'],
      mobile_command:['field_lab','河北恒研・連携担当','事前協定内の代替拠点支援'],
      forest_evacuation:['towa_organizer','森林公園イベント運営','参加者への案内と撤収支援'],
      traffic_priority:['transport_team','交通・輸送担当','既存の避難輸送の枠内での調整（可搬機材搬送とは別）'],
      sumo_evacuation:['sumo_organizer','八朔相撲運営','参加者への案内と撤収支援'],
      route_closure:['road_manager','道路管理担当','所管する道路の通行判断'],
      vehicle_allocation:['transport_team','輸送担当','既存の避難輸送車両の配分（可搬機材搬送とは別）'],
      reroute:['transport_team','交通・輸送担当','使用可能な経路の再照合'],
      shelter_rebalance:['shelter_team','避難所担当','受入可能な避難先の調整'],
      portable_redeploy:['shelter_team','避難所担当','展開済み可搬避難所の再配置'],
      logistics_reallocate:['logistics_team','物資・物流担当','確保済み物資の配分'],
      priority_override:['transport_team','輸送担当','既存車両の優先順位の再照会'],
      personal_vehicle_allocation:['transport_team','輸送担当','同じ車両の再配分'],
    };
    const [actorId,actor,baseScope]=actors[key];
    const scope=key==='portable_shelter'&&value==='none'
      ? '可搬避難所を追加で展開しない判断'
      :key==='portable_redeploy'&&value==='hold'&&!['partial','full'].includes(session.decisions.portable_shelter)
        ? '未展開のまま新たな配置を行わない判断'
        :key==='mobile_command'&&value==='standby'
          ? '移動拠点を新たに展開せず待機する判断'
          :baseScope;
    const responseValues={keep:'予定どおり',advance:'前倒し',cancel:'中止',reduce:'縮小',none:'展開しない',partial:'一部展開',full:'全面展開',standby:'待機',deploy_highground:'高所へ展開',wait:'待機',start_now:'今すぐ開始',residents:'住民の移動を優先',mixed:'住民と行事の輸送を両立',event_first:'行事の輸送を優先',gradual:'段階的な閉鎖',early:'早期閉鎖',festival:'相撲会場へ重点配分',forest:'森林公園へ重点配分',vulnerable_households:'要支援世帯へ重点配分',balanced:'分散配分',shortest:'最短経路',distributed:'複数経路',hold:'現状維持',move_people:'別の避難所へ移す',open_temporary:'臨時避難所の開設',move_highground:'高所への再配置',equal:'均等配分',critical_sites:'重要拠点を優先',system_priority:'これまでの配分を維持',manual_override:'優先順位の再照会'};
    const response={actorId,actor,scope,status:'accepted',choice:value,
      text:actor+'からの返事：「'+responseValues[value]+'」を、'+scope+'の範囲で引き受けます。'+(['vehicle_allocation','personal_vehicle_allocation'].includes(key)?'同じ車両を配り直すため、他の地点を同じだけ支えることはできません。':'')+'住民本人の移動や安全を保証するものではありません。'};
    const actionResponses={...(session.actionResponses||{}),[key]:response};
    if(key==='priority_override'&&actionResponses.personal_vehicle_allocation){
      actionResponses.personal_vehicle_allocation={...actionResponses.personal_vehicle_allocation,status:value==='system_priority'?'superseded':'accepted'};
    }
    const agreed={...session,actionResponses};
    return rebuildDecisionEffects(agreed, { ...session.decisions, [key]: value });
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

  function adoptedPersonalOutcomes(decisions = {}) {
    const evacuationChoice = ['wait', 'start_now'].includes(decisions?.forest_evacuation)
      ? decisions.forest_evacuation : null;
    return {
      chihiro: {
        survived: true,
        seriousInjury: false,
        evacuationDelay: true,
        businessLoss: 'major',
        businessContinuity: 'at_risk',
        note: '高倉味噌店の設備・蔵・在庫に大きな損失が残る。'
      },
      gaku: {
        survived: true,
        stranded: true,
        injured: true,
        immediateSportReturn: false,
        note: '八朔相撲会場側で取り残される過程で負傷し、すぐ競技へ戻れる状態ではない。'
      },
      towa: {
        survived: true,
        seriousInjury: false,
        evacuationStart: evacuationChoice === 'wait' ? 'delayed'
          : evacuationChoice === 'start_now' ? 'immediate' : 'unrecorded',
        evacuationStartSource: 'forest_evacuation',
        evacuationStartChoice: evacuationChoice,
      }
    };
  }

  function ensurePersonalOutcomes(result, decisions = result?.decisions || {}) {
    if (!result) return result;
    const adopted = adoptedPersonalOutcomes(decisions);
    const existing = result.personalOutcomes && typeof result.personalOutcomes === 'object'
      && !Array.isArray(result.personalOutcomes) ? result.personalOutcomes : {};
    result.personalOutcomes = { ...existing };
    for (const [person, defaults] of Object.entries(adopted)) {
      const recorded = existing[person] && typeof existing[person] === 'object'
        && !Array.isArray(existing[person]) ? existing[person] : {};
      result.personalOutcomes[person] = { ...defaults, ...recorded };
    }
    const towa = result.personalOutcomes.towa;
    // DL-017 fixes these outcomes independently of risk and stale save data.
    towa.survived = true;
    towa.seriousInjury = false;
    // Known decisions can enrich a previously unrecorded outcome. Without such
    // evidence, retain a valid saved result instead of inventing a player action.
    if (adopted.towa.evacuationStartChoice ||
        !['delayed', 'immediate', 'unrecorded'].includes(towa.evacuationStart)) {
      towa.evacuationStart = adopted.towa.evacuationStart;
      towa.evacuationStartSource = adopted.towa.evacuationStartSource;
      towa.evacuationStartChoice = adopted.towa.evacuationStartChoice;
    }
    return result;
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
      individualLossPossible: true,
      people: next.people,
      decisions: structuredClone(next.decisions),
      personalOutcomes: adoptedPersonalOutcomes(next.decisions)
    };
    return next;
  }

  window.ADHOMS_VER1_FINAL = {
    PHASES,
    DEFAULT_CHOICES,
    createSession,
    migratePortableCapacity,
    availableChoices,
    applyDecision,
    nextPhase,
    finalize,
    adoptedPersonalOutcomes,
    ensurePersonalOutcomes,
  };
})();