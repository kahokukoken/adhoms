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
      next = window.ADHOMS_VER1_STATE.addMemory(next, rule.memory);
      next.flags[`resolved:${rule.id}`] = true;
      applied.push(rule);
    }
    return { state: next, applied };
  }

  function cooperationOffers(state) {
    const offers = [];
    const burden = Object.values(state.districts).reduce((a, d) => a + (d.burdenMemory || 0), 0);

    if (state.relations.factory_logistics >= 2) {
      offers.push({ id: 'factory_support', label: '工場・物流：車両／人員提供', relation: 'factory_logistics' });
    }
    if (state.relations.technical_lab >= 2) {
      offers.push({ id: 'lab_support', label: '高専ラボ：通信／ドローン／電源共有', relation: 'technical_lab' });
    }
    if (state.relations.school >= 2 || state.relations.childcare >= 2) {
      offers.push({ id: 'school_support', label: '学校・保育：避難訓練／連絡網', relation: 'school' });
    }
    if (state.town.legitimacy >= 3) {
      offers.push({ id: 'warehouse_outreach', label: '倉庫会社：災害時開放協定', relation: 'warehouse' });
      offers.push({ id: 'fuel_outreach', label: 'ガソリンスタンド：優先給油協定', relation: 'gas_station' });
    }

    const resistance = [];
    for (const [id, d] of Object.entries(state.districts)) {
      if ((d.burdenMemory || 0) >= 2 || (d.localTrust || 0) <= 1) {
        resistance.push({
          id: `resist:${id}`,
          district: id,
          label: '訓練・情報共有への消極化',
          severity: Math.max(d.burdenMemory || 0, 2 - (d.localTrust || 0)),
        });
      }
    }

    if (burden >= 5) {
      resistance.push({
        id: 'townwide_fatigue',
        district: 'town',
        label: '「また河北恒研か」という広域的な警戒',
        severity: 2,
      });
    }

    return { offers, resistance };
  }

  function resolveYear4Strategy(state, strategy) {
    let next = clone(state);
    const { offers, resistance } = cooperationOffers(next);

    if (strategy === 'repair') {
      next = window.ADHOMS_VER1_STATE.applyDelta(next, {
        town: { trust: 1, legitimacy: 1 },
      });
      for (const d of Object.values(next.districts)) {
        d.burdenMemory = Math.max(0, (d.burdenMemory || 0) - 1);
        d.localTrust = Math.min(4, (d.localTrust || 0) + 1);
      }
    }

    if (strategy === 'deepen') {
      for (const offer of offers) {
        next.relations[offer.relation] = Math.min(4, (next.relations[offer.relation] || 0) + 1);
      }
      next.town.distributedCapacity = Math.min(4, next.town.distributedCapacity + 1);
    }

    if (strategy === 'authority') {
      next = window.ADHOMS_VER1_STATE.applyDelta(next, {
        town: { distributedCapacity: 1, legitimacy: -1, trust: -1 },
      });
    }

    if (strategy === 'alternative') {
      next = window.ADHOMS_VER1_STATE.applyDelta(next, {
        town: { networkResilience: 1, distributedCapacity: 1 },
        relations: { technical_lab: 1 },
      });
    }

    next.flags[`y4_strategy:${strategy}`] = true;
    next.memories.push({
      id: `y4_strategy_${strategy}`,
      year: 4,
      month: 12,
      valence: strategy === 'authority' ? -1 : 1,
      scope: 'town',
      tags: ['relation', 'future_capability'],
      note: `offers:${offers.length}; resistance:${resistance.length}`,
    });

    return { state: next, offers, resistance };
  }

  window.ADHOMS_VER1_PROPAGATION = {
    SIDE_EFFECT_RULES,
    applySideEffects,
    cooperationOffers,
    resolveYear4Strategy,
  };
})();