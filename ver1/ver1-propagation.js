(() => {
  const clone = (x) => structuredClone(x);

  const SIDE_EFFECT_RULES = [
    {
      sourceFlag: 'y2_snow:trunk_first',
      id: 'y3_snow_trunk_spillover',
      summary: '物流と救急は改善したが、生活道路側に不満が蓄積。',
      delta: {
        districts: { old_road: { localTrust: -1, burdenMemory: 1 } },
        relations: { factory_logistics: 1 },
      },
      memory: { id: 'y3_snow_trunk_spillover', valence: 0, tags: ['snow', 'spillover'] },
    },
    {
      sourceFlag: 'y2_snow:welfare_first',
      id: 'y3_snow_welfare_spillover',
      summary: '福祉アクセスは改善したが、工場・物流側の負担感が増加。',
      delta: {
        relations: { school: 1, childcare: 1, factory_logistics: -1 },
        districts: { hillside_hub: { burdenMemory: 1 } },
      },
      memory: { id: 'y3_snow_welfare_spillover', valence: 0, tags: ['snow', 'spillover'] },
    },
    {
      sourceFlag: 'y2_snow:schedule_shift',
      id: 'y3_snow_schedule_spillover',
      summary: '行動開始は早まったが、勤務変更を受けた企業側に不満。',
      delta: {
        town: { responseReadiness: 1 },
        relations: { factory_logistics: -1, school: 1 },
      },
      memory: { id: 'y3_snow_schedule_spillover', valence: 0, tags: ['snow', 'schedule'] },
    },
    {
      sourceFlag: 'y2_flood:early_close',
      id: 'y3_flood_early_close_spillover',
      summary: '事故回避には成功したが、低地商業側の負担記憶が強まった。',
      delta: {
        districts: { station_lowland: { localTrust: -1, burdenMemory: 1 } },
        town: { responseReadiness: 1 },
      },
      memory: { id: 'y3_flood_early_close_spillover', valence: 0, tags: ['flood', 'commerce'] },
    },
    {
      sourceFlag: 'y2_flood:guided_watch',
      id: 'y3_flood_guided_watch_spillover',
      summary: '現地誘導が成功体験となり、運用協力が広がった。',
      delta: {
        town: { legitimacy: 1 },
        relations: { factory_logistics: 1, technical_lab: 1 },
      },
      memory: { id: 'y3_flood_guided_watch_spillover', valence: 1, tags: ['flood', 'cooperation'] },
    },
    {
      sourceFlag: 'y2_flood:hard_warning',
      id: 'y3_flood_warning_fatigue',
      summary: '初動は早くなったが、警告疲れが表面化。',
      delta: {
        town: { responseReadiness: 1, trust: -1 },
      },
      memory: { id: 'y3_flood_warning_fatigue', valence: -1, tags: ['flood', 'warning_fatigue'] },
    },
    {
      sourceFlag: 'y2_flood:logistics_detour',
      id: 'y3_flood_detour_spillover',
      summary: '物流維持の代わりに生活道路へ交通が流入。',
      delta: {
        town: { networkResilience: 1 },
        districts: { station_lowland: { burdenMemory: 1 } },
        relations: { factory_logistics: 1 },
      },
      memory: { id: 'y3_flood_detour_spillover', valence: 0, tags: ['flood', 'traffic_shift'] },
    },
    {
      sourceFlag: 'y2_wildlife:capture',
      id: 'y3_wildlife_capture_shift',
      summary: '対象地区の被害は減ったが、出没地点が別地区へ移動。',
      delta: {
        districts: { forest_park: { burdenMemory: 1 } },
        town: { legitimacy: -1 },
      },
      memory: { id: 'y3_wildlife_capture_shift', valence: 0, tags: ['wildlife', 'displacement'] },
    },
    {
      sourceFlag: 'y2_wildlife:fence',
      id: 'y3_wildlife_fence_shift',
      summary: '防護地区は安定したが、動物の移動経路が変化。',
      delta: {
        town: { environmentalBuffer: -1 },
        districts: { forest_park: { burdenMemory: 1 } },
      },
      memory: { id: 'y3_wildlife_fence_shift', valence: 0, tags: ['wildlife', 'route_shift'] },
    },
    {
      sourceFlag: 'y2_wildlife:food_source',
      id: 'y3_wildlife_food_source_gain',
      summary: '即効性は弱かったが、出没頻度が徐々に安定。',
      delta: {
        town: { environmentalBuffer: 1, legitimacy: 1 },
      },
      memory: { id: 'y3_wildlife_food_source_gain', valence: 1, tags: ['wildlife', 'slow_gain'] },
    },
    {
      sourceFlag: 'y2_wildlife:survey',
      id: 'y3_wildlife_survey_gain',
      summary: '調査履歴が次の対策精度と高専連携に効き始めた。',
      delta: {
        town: { environmentalBuffer: 1 },
        relations: { technical_lab: 1 },
      },
      memory: { id: 'y3_wildlife_survey_gain', valence: 1, tags: ['wildlife', 'knowledge'] },
    },
  ];

  function applySideEffects(state) {
    let next = clone(state);
    const applied = [];
    for (const rule of SIDE_EFFECT_RULES) {
      if (!next.flags[rule.sourceFlag] || next.flags[`resolved:${rule.id}`]) continue;
      next = window.ADHOMS_VER1_STATE.applyDelta(next, rule.delta);
      next = window.ADHOMS_VER1_STATE.addMemory(next, {
        ...rule.memory,
        source: { type: 'propagation', id: rule.id },
      });
      next.flags[`resolved:${rule.id}`] = true;
      applied.push(rule);
    }
    return { state: next, applied };
  }

  // Existing relation/legitimacy thresholds describe offers, never consent.
  const COOPERATORS = [
    { id: 'factory_support', label: '工場・物流：車両／人員提供', relation: 'factory_logistics', condition: '自社の車両と担当人員を提供する。ラボの通信・電源と組み合わせる場合も、自社の運行を止めない範囲で担当同士が配分する' },
    { id: 'lab_support', label: '高専ラボ：通信／ドローン／電源共有', relation: 'technical_lab', condition: 'ラボが運用・保守する通信中継・電源を共有する。車両は含まず、移動拠点にするには輸送側の提供も必要' },
    { id: 'school_support', label: '学校：避難訓練／連絡網・敷地利用', relation: 'school', condition: '学校側が敷地利用・連絡網・訓練を担当する。場所の提供であり、可搬避難所の機材を提供する約束ではない' },
    { id: 'childcare_support', label: '保育：避難訓練／保護者連絡', relation: 'childcare', condition: '保育側の連絡・訓練のみで、学校敷地の利用は含まない', informational: true },
    { id: 'warehouse_outreach', label: '倉庫会社：災害時開放協定', relation: 'warehouse', condition: '倉庫側が保管場所と受渡し窓口を担当する。搬送車や可搬避難所の機材は含まず、受取と回収の時間は依頼ごとに照合する' },
    { id: 'fuel_outreach', label: 'ガソリンスタンド：優先給油協定', relation: 'gas_station', condition: '給油所が優先給油の窓口を担当する。無制限の燃料確保ではなく、供給可能な時間と量は当日の担当間で照合する' },
  ];
  const STRATEGIES = ['repair', 'deepen', 'authority', 'alternative'];
  const DISTRICT_NAMES = { station_lowland: '駅側低地', old_road: '旧道側', hillside_hub: '高所側', forest_park: '森林公園側' };

  function cooperationOffers(state) {
    const offers = COOPERATORS.filter(offer =>
      ['warehouse', 'gas_station'].includes(offer.relation)
        ? state.town.legitimacy >= 3
        : state.relations[offer.relation] >= 2
    ).map(offer => ({ ...offer, actorId: offer.relation }));
    const burden = Object.values(state.districts).reduce((a, d) => a + (d.burdenMemory || 0), 0);
    const resistance = [];
    for (const [id, d] of Object.entries(state.districts)) {
      if ((d.burdenMemory || 0) >= 2 || (d.localTrust || 0) <= 1) {
        resistance.push({
          id: `resist:${id}`, district: id,
          label: '訓練・情報共有への消極化',
          severity: Math.max(d.burdenMemory || 0, 2 - (d.localTrust || 0)),
        });
      }
    }
    if (burden >= 5) {
      resistance.push({ id: 'townwide_fatigue', district: 'town', label: '「また河北恒研か」という広域的な警戒', severity: 2 });
    }
    return { offers, resistance };
  }

  function year4AlreadyRecorded(state) {
    return STRATEGIES.some(id => state.flags?.[`y4_strategy:${id}`] ||
      (state.memories || []).some(memory => memory.id === `y4_strategy_${id}`));
  }

  function proposeYear4Strategy(state, strategy) {
    if (!STRATEGIES.includes(strategy)) throw new Error(`Unknown strategy: ${strategy}`);
    if (year4AlreadyRecorded(state) || state.proposals?.y4_strategy) return state;
    const next = clone(state);
    const { offers } = cooperationOffers(state);
    next.proposals ??= {};
    next.proposals.y4_strategy = {
      eventId: 'y4_strategy', choiceId: strategy, strategy,
      status: 'proposed', year: state.year, month: state.month,
      actorIds: strategy === 'repair' ? Object.keys(state.districts)
        : COOPERATORS.filter(offer => strategy !== 'alternative' || offer.id === 'lab_support').map(offer => offer.relation).concat(['deepen', 'authority'].includes(strategy) ? ['shelter_team'] : []),
      offeredIds: offers.map(offer => offer.id),
      response: null, responses: [],
      portablePreparationRequested: ['deepen', 'authority'].includes(strategy),
    };
    return next;
  }

  function year4Result(state) {
    return { state, ...cooperationOffers(state), proposal: state.proposals?.y4_strategy || null };
  }

  function respondYear4Strategy(state) {
    const proposal = state.proposals?.y4_strategy;
    if (!proposal || proposal.status !== 'proposed' || year4AlreadyRecorded(state)) return year4Result(state);
    const strategy = proposal.choiceId;
    if (!STRATEGIES.includes(strategy)) throw new Error(`Unknown strategy: ${strategy}`);
    let next = clone(state);
    const { offers, resistance } = cooperationOffers(state);
    const responses = [];
    const acceptedOffers = [];

    if (strategy === 'repair') {
      for (const [id, district] of Object.entries(state.districts)) {
        const declined = resistance.some(item => item.district === id);
        responses.push({
          actorId: id, status: declined ? 'declined' : 'accepted',
          text: declined
            ? `${DISTRICT_NAMES[id] || id}は、以前の負担が残っているため今回は協力を見送った。提案を出しただけで、過去の負担や不信が解消したとは扱わない。`
            : `${DISTRICT_NAMES[id] || id}の参加者は、困りごとを確認し直す相談に応じた。いまの負担を軽くする調整は始まったが、過去の出来事は消えず、施設・人員の提供まで約束したわけではない。`,
          constraints: ['今回の返答は相談と負担調整の範囲であり、資源提供の協定ではない'],
        });
        if (!declined) {
          next.districts[id].burdenMemory = Math.max(0, (district.burdenMemory || 0) - 1);
          next.districts[id].localTrust = Math.min(4, (district.localTrust || 0) + 1);
        }
      }
      if (responses.some(response => response.status === 'accepted')) {
        next = window.ADHOMS_VER1_STATE.applyDelta(next, { town: { trust: 1, legitimacy: 1 } });
      }
    } else {
      const candidates = COOPERATORS.filter(offer => strategy !== 'alternative' || offer.id === 'lab_support');
      for (const actor of candidates) {
        // An offer must exist both when proposed and when the actor answers.
        // A newly improved score cannot retroactively become consent.
        const accepted = Array.isArray(proposal.offeredIds) && proposal.offeredIds.includes(actor.id) &&
          offers.some(offer => offer.id === actor.id);
        responses.push({
          actorId: actor.relation, offerId: actor.id, status: accepted ? 'accepted' : 'declined',
          text: accepted
            ? `${actor.label}の担当者は、提案に示された協力を引き受けた。${actor.condition}。他の組織や住民にも従うよう求める返答ではない。`
            : `${actor.label}の担当者からは、実行を引き受けられる条件がそろっていないとの返答。今回は確保済みの手札に数えず、参加や提供を強制しない。`,
          constraints: [actor.condition],
        });
        if (accepted) acceptedOffers.push(actor);
      }
      for (const offer of acceptedOffers) {
        next.agreements ??= {};
        next.agreements[offer.id] = {
          offerId: offer.id, actorId: offer.relation, status: 'accepted',
          year: state.year, month: state.month,
          constraints: [offer.condition],
          source: { type: 'actor-response', id: `y4_strategy:${strategy}` },
        };
        next.flags[`offer:${offer.id}:secured`] = true;
        if (strategy === 'deepen' && !offer.informational) {
          next.relations[offer.relation] = Math.max(2, Math.min(4, (next.relations[offer.relation] || 0) + 1));
        }
      }
      if (strategy === 'deepen' && acceptedOffers.some(offer => !offer.informational)) {
        next.town.distributedCapacity = Math.min(4, next.town.distributedCapacity + 1);
      }
      if (strategy === 'alternative' && acceptedOffers.some(offer => offer.id === 'lab_support')) {
        next = window.ADHOMS_VER1_STATE.applyDelta(next, {
          town: { networkResilience: 1, distributedCapacity: 1 }, relations: { technical_lab: 1 },
        });
      }
      // 'authority' is retained only as a save ID for a common-condition request.
      // No coercion penalty, flat capacity gain or substitute reward is applied.
    }

    // Approved 2026-10-01 repair: connect the existing shelter capability to an
    // explicit preparation response. These are newly authored bounded scenario
    // events, not a claim that a named supplier exists in the sourcebook.
    // An old proposal without this request never acquires retrospective assent.
    if (proposal.portablePreparationRequested === true) {
      const transport = acceptedOffers.some(offer => offer.id === 'factory_support');
      const handoff = acceptedOffers.some(offer => offer.id === 'warehouse_outreach');
      const ready = transport && handoff;
      const missing = [!transport && '可搬機材搬送の追加車両・担当人員の引受け', !handoff && '保管・受渡しの引受け'].filter(Boolean);
      const text = ready
        ? '避難所担当からの返事：工場・物流の搬送と倉庫の受渡しの引受けを照合しました。既存避難拠点の敷地内で設置できる区画を確認し、その区画で使う可搬機材を120人分確保しました。固定施設の収容人数とは別の区画です。これは保管中の機材で、まだ避難者を受け入れられる場所が120人分増えたわけではありません。当日の設置確認後に一部60人分か全面120人分を展開し、夜の移設でも同じ機材を使います。'
        : '避難所担当からの返事：可搬避難所の準備は未成立です。'+missing.join('と')+'がそろっていません。場所や関係値だけで機材を確保済みにせず、設置区画と機材の確保も保留します。既存の避難輸送車両は別枠で、機材搬送へ無条件に転用できるものではありません。';
      next.portablePreparation = {
        actorId: 'shelter_team', status: ready ? 'secured' : 'incomplete',
        stockCapacity: ready ? 120 : 0, siteCapacity: ready ? 120 : 0,
        placementConfirmed: ready, year: state.year, month: state.month,
        source: { type: 'actor-response', id: `y4_strategy:${strategy}` },
        requiredAgreements: ['factory_support', 'warehouse_outreach'], text,
      };
      responses.push({ actorId: 'shelter_team', status: ready ? 'accepted' : 'held',
        text, constraints: ['既存拠点で確認した別区画と確保済み機材の120人分が上限。未展開の機材は収容人数に数えない'] });
    }

    const acceptedActors = responses.filter(response => response.status === 'accepted').map(response => response.actorId);
    const status = acceptedActors.length ? 'accepted' : 'declined';
    const text = responses.map(response => response.text).join('\n');
    next.proposals.y4_strategy.status = status;
    next.proposals.y4_strategy.responses = responses;
    next.proposals.y4_strategy.response = {
      status, actorIds: acceptedActors, text,
      constraints: [...new Set(responses.flatMap(response => response.constraints))],
      year: state.year, month: state.month,
    };
    next.flags[`y4_strategy:${strategy}`] = true;
    next = window.ADHOMS_VER1_STATE.addMemory(next, {
      id: `y4_strategy_${strategy}`, valence: acceptedActors.length ? 1 : 0,
      scope: 'town', tags: ['relation', 'future_capability'], entities: responses.map(response => response.actorId),
      note: text, source: { type: 'strategy', id: 'y4_strategy:' + strategy },
    });
    return { state: next, offers, resistance, proposal: next.proposals.y4_strategy };
  }

  function resolveYear4Strategy(state, strategy) {
    return respondYear4Strategy(proposeYear4Strategy(state, strategy));
  }

  window.ADHOMS_VER1_PROPAGATION = {
    SIDE_EFFECT_RULES,
    applySideEffects,
    cooperationOffers,
    proposeYear4Strategy,
    respondYear4Strategy,
    resolveYear4Strategy,
  };
})();
