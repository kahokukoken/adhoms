(() => {
  const E = {
    y2_snow: {
      year: 2,
      season: 'winter',
      title: '雪害：通れる道と動ける生活',
      choices: {
        trunk_first: {
          label: '幹線道路を最優先で維持',
          delta: {
            town: { networkResilience: 1 },
            districts: { old_road: { burdenMemory: 1 } },
            relations: { factory_logistics: 1 },
          },
          memory: { id: 'snow_trunk_first', valence: 0, tags: ['snow', 'tradeoff'] },
        },
        welfare_first: {
          label: '学校・医療・福祉アクセスを優先',
          delta: {
            town: { legitimacy: 1, responseReadiness: 1 },
            relations: { school: 1, childcare: 1 },
            districts: { hillside_hub: { burdenMemory: 1 } },
          },
          memory: { id: 'snow_welfare_first', valence: 1, tags: ['snow', 'care'] },
        },
        distributed: {
          label: '地区ごとに除雪資源を分散',
          delta: { town: { legitimacy: 1 } },
          memory: { id: 'snow_distributed', valence: 0, tags: ['snow', 'fairness'] },
        },
        schedule_shift: {
          label: '時差出勤・休校要請を強める',
          delta: {
            town: { responseReadiness: 1 },
            relations: { school: 1, factory_logistics: -1 },
          },
          memory: { id: 'snow_schedule_shift', valence: 0, tags: ['snow', 'behavior'] },
        },
      },
    },

    y2_flood: {
      year: 2,
      season: 'rainy',
      title: '局地冠水：正しい予測と正しい行動',
      choices: {
        early_close: {
          label: '早期通行止め',
          delta: {
            town: { responseReadiness: 1 },
            districts: { station_lowland: { localTrust: -1, burdenMemory: 1 } },
          },
          memory: { id: 'flood_early_close', valence: 0, tags: ['flood', 'safety_vs_cost'] },
        },
        guided_watch: {
          label: '現地誘導を置きつつ様子見',
          delta: {
            town: { legitimacy: 1 },
            relations: { factory_logistics: 1 },
          },
          memory: { id: 'flood_guided_watch', valence: 1, tags: ['flood', 'adaptive'] },
        },
        hard_warning: {
          label: '住民端末へ強警告',
          delta: { town: { responseReadiness: 1, trust: -1 } },
          memory: { id: 'flood_hard_warning', valence: 0, tags: ['flood', 'warning_fatigue'] },
        },
        logistics_detour: {
          label: '物流・通勤車両を先に迂回',
          delta: {
            town: { networkResilience: 1 },
            districts: { station_lowland: { burdenMemory: 1 } },
            relations: { factory_logistics: 1 },
          },
          memory: { id: 'flood_logistics_detour', valence: 0, tags: ['flood', 'priority'] },
        },
      },
    },

    y2_wildlife: {
      year: 2,
      season: 'autumn',
      title: '獣害：誰の危険を基準にするか',
      choices: {
        capture: {
          label: '捕獲強化',
          delta: {
            town: { legitimacy: -1 },
            districts: { old_road: { localTrust: 1 } },
          },
          memory: { id: 'wildlife_capture', valence: 0, tags: ['wildlife', 'displacement'] },
        },
        fence: {
          label: '柵・侵入防止',
          delta: {
            town: { environmentalBuffer: -1 },
            districts: { old_road: { localTrust: 1 } },
          },
          memory: { id: 'wildlife_fence', valence: 0, tags: ['wildlife', 'route_shift'] },
        },
        food_source: {
          label: 'ゴミ・餌資源対策',
          delta: {
            town: { legitimacy: 1, environmentalBuffer: 1 },
          },
          memory: { id: 'wildlife_food_source', valence: 1, tags: ['wildlife', 'slow_effect'] },
        },
        restrict: {
          label: '学校・住民の行動制限',
          delta: {
            town: { responseReadiness: 1, legitimacy: -1 },
            relations: { school: 1 },
          },
          memory: { id: 'wildlife_restrict', valence: 0, tags: ['wildlife', 'restriction'] },
        },
        survey: {
          label: '生息域調査を優先',
          delta: {
            town: { environmentalBuffer: 1 },
            relations: { technical_lab: 1 },
          },
          memory: { id: 'wildlife_survey', valence: 0, tags: ['wildlife', 'knowledge'] },
        },
      },
    },
  };

  function getEvent(id) {
    return E[id] ?? null;
  }

  function resolveChoice(state, eventId, choiceId) {
    const event = E[eventId];
    if (!event) throw new Error(`Unknown event: ${eventId}`);
    const choice = event.choices[choiceId];
    if (!choice) throw new Error(`Unknown choice: ${choiceId}`);

    let next = window.ADHOMS_VER1_STATE.applyDelta(state, choice.delta);
    next = window.ADHOMS_VER1_STATE.addMemory(next, choice.memory);
    next.flags[`${eventId}:${choiceId}`] = true;
    return next;
  }

  window.ADHOMS_VER1_EVENTS = {
    all: E,
    getEvent,
    resolveChoice,
  };
})();