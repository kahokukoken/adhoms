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

  // DL-020: these are bounded scenario responses by the responsible actors,
  // not orders by ADHOMS or a claim that every resident can follow the plan.
  // Keep existing choice IDs/deltas: only the actor-owned response applies them.
  const RESPONSES = {
    y2_snow: {
      trunk_first: { actorIds: ['administration'], text: '行政の除雪担当は、救急・物流の幹線を先に確保する案を採用して作業を始めた。生活道路まで同時には手が回らず、車を出せない世帯の困りごとは残る。', constraints: ['除雪の担い手と車両には限りがある', '幹線が通れても、各世帯が移動できるとは限らない'] },
      welfare_first: { actorIds: ['administration', 'school', 'childcare'], text: '行政・学校・保育の担当者は、送迎と医療・福祉へのアクセスを先に支える案で動き始めた。工場への道や高所側の対応は後になり、全員の出勤と送迎を両立できたわけではない。', constraints: ['送迎と勤務の時間は一致しない', '限られた除雪資源で全ての道を同時には確保できない'] },
      distributed: { actorIds: ['administration'], text: '行政の除雪担当は、地区ごとに資源を分ける案を採用した。地区間の説明はしやすくなったが、個々の家の雪かきや移動手段まではそろわない。', constraints: ['分散しても除雪資源の総量は増えない', '自宅から道まで出られない世帯がある'] },
      schedule_shift: { actorIds: ['school', 'factory_logistics'], text: '学校と協力する事業者は、授業・勤務の時間をずらす案をそれぞれの範囲で採用した。早く動けた人がいる一方、夜勤や止められない仕事には変更の負担が残った。', constraints: ['勤務変更を受け入れられない職場もある', '休校だけでは保護者の仕事は休みにならない'] },
    },
    y2_flood: {
      early_close: { actorIds: ['administration'], text: '道路管理の担当者は、予測と現地の状況を受けて早期通行止めを判断した。危険な道へ入る車は減ったが、店への来客や日々の移動が止まる負担まで消えたわけではない。', constraints: ['通行止めを判断するのは道路管理の担当者', '商店と通勤者には迂回・営業上の負担が残る'] },
      guided_watch: { actorIds: ['administration', 'factory_logistics'], text: '道路管理の担当者と協力事業者は、現地誘導を置いて状況を確かめる案を採用した。案内できる範囲で車の動きを支えたが、見慣れた道を使い続ける住民まで一律には動かせない。', constraints: ['現地誘導を続けられる人員と時間は限られる', '警告を見ても直ちに経路を変えない人がいる'] },
      hard_warning: { actorIds: ['administration'], text: '防災の担当者は、危険を強く伝える通知案を採用した。早く動いた受け手がいる一方、仕事や家の事情ですぐ離れられない人、繰り返す警告に疲れた人もいた。', constraints: ['通知を読むことと避難できることは別', '強い通知を繰り返すと警告疲れが残る'] },
      logistics_detour: { actorIds: ['factory_logistics'], text: '工場・物流の担当者は、自分たちの車両を先に迂回させる案を採用した。物流はつながったが、車が流れ込んだ生活道路側からは、別の負担が届いている。', constraints: ['事業者が調整できるのは自分たちの運行', '迂回先にも住民の生活と通行がある'] },
    },
    y2_wildlife: {
      capture: { actorIds: ['administration'], text: '行政の鳥獣担当は、現場の担い手と捕獲を強める案を採用した。旧道側では安心する声が出た一方、何を危険と見るかは住民の間でもそろっていない。', constraints: ['捕獲の実施判断は担当組織が担う', '出没が別の場所へ移る可能性は残る'] },
      fence: { actorIds: ['administration', 'old_road'], text: '鳥獣担当と旧道側の協力する住民は、侵入防止柵の案を採用した。守られる場所ができる一方、動物の通り道を変える影響までなくなるわけではない。', constraints: ['設置と維持を担える範囲に限る', '動物の経路が別地区へ移る可能性がある'] },
      food_source: { actorIds: ['old_road'], text: '協力する住民と事業者は、ごみや餌になるものの管理を見直し始めた。暮らしの手順として続けられる範囲で進めるため、今日の出没がすぐなくなるとは約束していない。', constraints: ['管理に参加できる世帯・事業所の範囲から始める', '即効性はなく、継続の手間がかかる'] },
      restrict: { actorIds: ['school', 'administration'], text: '学校と行政の担当者は、通学や外出を避ける時間・場所を伝える案を採用した。学校の対応は早まったが、仕事や畑へ行く必要がある人には、同じようには守れない制約が残る。', constraints: ['学校・行政が自らの担当範囲で判断する', '外出を避けられない仕事や生活がある'] },
      survey: { actorIds: ['technical_lab'], text: '高専ラボは、生息域と出没経路を調べる案を引き受けた。観測できた範囲を担当者へ返すことになったが、調査を始めただけで住民の目前の危険が消えたわけではない。', constraints: ['調査できる場所と時間は限られる', '調査の受諾は対策の実施や安全の保証ではない'] },
    },
  };

  function getEvent(id) {
    return E[id] ?? null;
  }

  function validateChoice(eventId, choiceId) {
    const event = E[eventId];
    if (!event) throw new Error(`Unknown event: ${eventId}`);
    const choice = event.choices[choiceId];
    if (!choice) throw new Error(`Unknown choice: ${choiceId}`);
    return choice;
  }

  function alreadyActed(state, eventId) {
    return Object.entries(E[eventId].choices).some(([id, choice]) =>
      state.flags?.[`${eventId}:${id}`] || (state.memories || []).some(m => m.id === choice.memory.id)
    );
  }

  function proposeChoice(state, eventId, choiceId) {
    validateChoice(eventId, choiceId);
    if (alreadyActed(state, eventId) || state.proposals?.[eventId]) return state;
    const next = structuredClone(state);
    const response = RESPONSES[eventId][choiceId];
    next.proposals ??= {};
    next.proposals[eventId] = {
      eventId, choiceId, status: 'proposed', year: state.year, month: state.month,
      actorIds: [...response.actorIds], constraints: [...response.constraints], response: null,
    };
    return next;
  }

  function respondChoice(state, eventId) {
    if (!E[eventId]) throw new Error(`Unknown event: ${eventId}`);
    const proposal = state.proposals?.[eventId];
    if (!proposal || proposal.status !== 'proposed' || alreadyActed(state, eventId)) return state;
    const choice = validateChoice(eventId, proposal.choiceId);
    const response = RESPONSES[eventId][proposal.choiceId];

    let next = window.ADHOMS_VER1_STATE.applyDelta(state, choice.delta);
    next = window.ADHOMS_VER1_STATE.addMemory(next, {
      ...choice.memory,
      entities: response.actorIds,
      note: response.text,
      source: { type: 'choice', id: eventId + ':' + proposal.choiceId },
    });
    next.flags[`${eventId}:${proposal.choiceId}`] = true;
    next.proposals[eventId].status = 'accepted';
    next.proposals[eventId].response = {
      ...structuredClone(response), status: 'accepted', year: state.year, month: state.month,
    };
    return next;
  }

  // Compatibility for deterministic model callers. Interactive play uses the
  // two transitions separately, so proposing never masquerades as enactment.
  function resolveChoice(state, eventId, choiceId) {
    return respondChoice(proposeChoice(state, eventId, choiceId), eventId);
  }

  window.ADHOMS_VER1_EVENTS = {
    all: E,
    getEvent,
    proposeChoice,
    respondChoice,
    resolveChoice,
  };
})();
