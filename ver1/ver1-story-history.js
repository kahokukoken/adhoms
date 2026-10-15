(() => {
  if (!window.ADHOMS_VER1_STATE || !window.ADHOMS_LIGHT_STATE || !window.ADHOMS_VER1_SESSION) return;
  const STATE_KEY = 'adhoms.ver1.lightstate';
  const scenes = window.ADHOMS_YEAR1_STORY_SCENES || {};
  // DL-019: individually adopted fixed events, never inferred from prose.
  // Dates are April-based trial years. Predecessors describe the bounded arc;
  // they do not award numerical effects, optional choices or capabilities.
  const events = [
  {
    "id": "dl19_gaku_shed_fatigue",
    "year": 1,
    "month": 2,
    "week": 3,
    "entities": [
      "gaku",
      "makoto"
    ],
    "predecessors": [],
    "note": "納屋の雪かきの翌朝に腕の重さを感じ、休んでから次に行ける日を伝える。",
    "scene": "ver1-observation-scenes:February-W3",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_gaku_shed_fatigue"
    }
  },
  {
    "id": "dl19_ren_stale_misread",
    "year": 2,
    "month": 6,
    "week": 2,
    "entities": [
      "ren"
    ],
    "predecessors": [],
    "note": "止まった試作表示が雨の安定と誤読された。警報や避難判断には使用しない。",
    "scene": "continuity-y2-m6-w2-ren-4",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_ren_stale_misread"
    }
  },
  {
    "id": "dl19_ren_stale_display",
    "year": 2,
    "month": 6,
    "week": 3,
    "entities": [
      "ren",
      "minato",
      "saeki"
    ],
    "predecessors": [
      "dl19_ren_stale_misread"
    ],
    "note": "値が最後に動いた時刻を大きくする試作へ変更。実用安全性は未確認。 同週のラボ試読で湊は更新時刻を指せたが、その後の連絡先は表示の外に残った。",
    "scene": "continuity-y2-m6-w3-ren-3",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_ren_stale_display"
    }
  },
  {
    "id": "dl19_gaku_rest_announced",
    "year": 2,
    "month": 2,
    "week": 1,
    "entities": [
      "gaku"
    ],
    "predecessors": [
      "dl19_gaku_shed_fatigue"
    ],
    "note": "雪かき翌日の休息と競技予定を依頼前に伝えた。",
    "scene": "continuity-y2-m2-w1-gaku-1",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_gaku_rest_announced"
    }
  },
  {
    "id": "dl19_gaku_rest_agreed",
    "year": 2,
    "month": 2,
    "week": 2,
    "entities": [
      "gaku",
      "sakamoto"
    ],
    "predecessors": [
      "dl19_gaku_rest_announced"
    ],
    "note": "休みと明記し、坂本がその日は依頼を回さないと了承。理由を公開しない。",
    "scene": "continuity-y2-m2-w2-gaku-1",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_gaku_rest_agreed"
    }
  },
  {
    "id": "dl19_gaku_rest_kept",
    "year": 2,
    "month": 2,
    "week": 3,
    "entities": [
      "gaku",
      "sakamoto"
    ],
    "predecessors": [
      "dl19_gaku_rest_agreed"
    ],
    "note": "伝えた休養日には依頼の連絡が来なかった。調整者や代役の成立は未確認。",
    "scene": "continuity-y2-m2-w3-gaku-3",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_gaku_rest_kept"
    }
  },
  {
    "id": "dl19_ren_case_trial",
    "year": 3,
    "month": 6,
    "week": 1,
    "entities": [
      "ren",
      "minato"
    ],
    "predecessors": [
      "dl19_ren_stale_display"
    ],
    "note": "湊が試作品の箱を開ける際に配線を引き、持つ場所の説明不足が見つかった。",
    "scene": "continuity-y3-m6-w1-ren-5",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_ren_case_trial"
    }
  },
  {
    "id": "dl19_ren_stop_instructions",
    "year": 3,
    "month": 6,
    "week": 2,
    "entities": [
      "ren"
    ],
    "predecessors": [
      "dl19_ren_case_trial"
    ],
    "note": "試作品の止め方を説明の先へ移した。避難や通行を決める機械ではない。",
    "scene": "continuity-y3-m6-w2-ren-3",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_ren_stop_instructions"
    }
  },
  {
    "id": "dl19_ren_minato_test",
    "year": 3,
    "month": 6,
    "week": 3,
    "entities": [
      "ren",
      "minato"
    ],
    "predecessors": [
      "dl19_ren_stop_instructions"
    ],
    "note": "湊が説明を試読し、蓮が横から補わない時に迷う箇所を確認した。",
    "scene": "continuity-y3-m6-w3-ren-5",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_ren_minato_test"
    }
  },
  {
    "id": "dl19_gaku_tools_taught",
    "year": 3,
    "month": 8,
    "week": 2,
    "entities": [
      "gaku"
    ],
    "predecessors": [
      "dl19_gaku_rest_kept"
    ],
    "note": "新しく来る人へ道具の置き場所を教え、自分で全部運ばず待った。",
    "scene": "continuity-y3-m8-w2-gaku-3",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_gaku_tools_taught"
    }
  },
  {
    "id": "dl19_gaku_teaching_time",
    "year": 3,
    "month": 8,
    "week": 3,
    "entities": [
      "gaku"
    ],
    "predecessors": [
      "dl19_gaku_tools_taught"
    ],
    "note": "道具を教える日は晃生を運ぶ人数から外し、説明と運搬で二重に数えなかった。",
    "scene": "continuity-y3-m8-w3-gaku-2",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_gaku_teaching_time"
    }
  },
  {
    "id": "dl19_gaku_supervised_stop",
    "year": 3,
    "month": 9,
    "week": 3,
    "entities": [
      "gaku"
    ],
    "predecessors": [
      "dl19_gaku_teaching_time"
    ],
    "note": "教えた相手が不明点で止まれた。晃生抜きの全面的な独立運営は未成立。",
    "scene": "continuity-y3-m9-w3-gaku-3",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_gaku_supervised_stop"
    }
  },
  {
    "id": "dl19_minato_inquiry_scope",
    "year": 4,
    "month": 4,
    "week": 3,
    "entities": [
      "minato",
      "kaito"
    ],
    "predecessors": [],
    "note": "廻斗へ渡す役を最初の問い合わせまでとし、代役探しは別に相談する範囲で合意。",
    "scene": "continuity-y4-m4-w3-minato-5",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_minato_inquiry_scope"
    }
  },
  {
    "id": "dl19_minato_inquiry_handoff",
    "year": 4,
    "month": 4,
    "week": 4,
    "entities": [
      "minato",
      "kaito"
    ],
    "predecessors": [
      "dl19_minato_inquiry_scope"
    ],
    "note": "最初の問い合わせを廻斗へ渡し、廻斗が自分から相手へ返事した。",
    "scene": "continuity-y4-m4-w4-minato-4",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_minato_inquiry_handoff"
    }
  },
  {
    "id": "dl19_ren_check_time",
    "year": 4,
    "month": 6,
    "week": 3,
    "entities": [
      "ren"
    ],
    "predecessors": [
      "dl19_ren_minato_test"
    ],
    "note": "組立と動作確認の時間を分け、試作品を渡す時期を答え直した。",
    "scene": "continuity-y4-m6-w3-ren-1",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_ren_check_time"
    }
  },
  {
    "id": "dl19_ren_failure_instructions",
    "year": 4,
    "month": 6,
    "week": 4,
    "entities": [
      "ren",
      "minato"
    ],
    "predecessors": [
      "dl19_ren_check_time"
    ],
    "note": "測れない時の説明を加えた。試作品の引渡しに確認時間を含め、実用警報の機械とは扱わない。",
    "scene": "continuity-y4-m6-w4-ren-3",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_ren_failure_instructions"
    }
  },
  {
    "id": "dl19_minato_direct_contact",
    "year": 4,
    "month": 7,
    "week": 3,
    "entities": [
      "minato",
      "kaito"
    ],
    "predecessors": [
      "dl19_minato_inquiry_handoff"
    ],
    "note": "日程変更の連絡が湊を介さず進んだ。一部の連絡の成立であり全用件の完了ではない。",
    "scene": "continuity-y4-m7-w3-minato-5",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_minato_direct_contact"
    }
  },
  {
    "id": "dl19_gaku_handoff_contacts",
    "year": 4,
    "month": 8,
    "week": 2,
    "entities": [
      "gaku",
      "kaito"
    ],
    "predecessors": [
      "dl19_gaku_supervised_stop"
    ],
    "note": "廻斗へ準備の問い合わせ先を渡した。不在時のすべての決定は押し付けない。",
    "scene": "continuity-y4-m8-w2-gaku-1",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_gaku_handoff_contacts"
    }
  },
  {
    "id": "dl19_gaku_position_handoff",
    "year": 4,
    "month": 8,
    "week": 4,
    "entities": [
      "gaku",
      "kaito"
    ],
    "predecessors": [
      "dl19_gaku_handoff_contacts"
    ],
    "note": "廻斗へ当日の持ち場を渡し、晃生が稽古へ行けた。恒常的な余剰人員ではない。",
    "scene": "continuity-y4-m8-w4-gaku-4",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_gaku_position_handoff"
    }
  },
  {
    "id": "dl19_teaching_time_visible",
    "year": 4,
    "month": 2,
    "week": 1,
    "entities": [
      "murata",
      "chihiro"
    ],
    "predecessors": [],
    "note": "手伝いの帳面で教える時間が抜けていたことを確認。人数増を営業時間増とはしない。",
    "scene": "continuity-y4-m2-w1-murata-1",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_teaching_time_visible"
    }
  },
  {
    "id": "dl19_teaching_time_agreed",
    "year": 4,
    "month": 2,
    "week": 2,
    "entities": [
      "murata",
      "chihiro"
    ],
    "predecessors": [
      "dl19_teaching_time_visible"
    ],
    "note": "教える日は仕込みを減らし、真知が味噌店へ戻る時間を守ると相談した。",
    "scene": "continuity-y4-m2-w2-murata-1",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_teaching_time_agreed"
    }
  },
  {
    "id": "dl19_teaching_return_kept",
    "year": 4,
    "month": 2,
    "week": 4,
    "entities": [
      "murata",
      "chihiro"
    ],
    "predecessors": [
      "dl19_teaching_time_agreed"
    ],
    "note": "教える日に仕込みを減らし、真知が味噌店へ戻る時間を守れた。営業延長や供給増は未成立。",
    "scene": "continuity-y4-m2-w4-chihiro-2",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_teaching_return_kept"
    }
  },
  {
    "id": "dl19_minato_next_contact",
    "year": 5,
    "month": 4,
    "week": 4,
    "entities": [
      "minato"
    ],
    "predecessors": [
      "dl19_minato_direct_contact"
    ],
    "note": "大学時代の相談の一件を、次の相手同士が直接やり取りする所まで見届けた。",
    "scene": "continuity-y5-m4-w4-minato-3",
    "source": {
      "type": "canonical-event",
      "id": "DL-019:dl19_minato_next_contact"
    }
  }
];
  const byId = new Map(events.map(event => [event.id, event]));
  for (const event of events) {
    Object.freeze(event.entities); Object.freeze(event.predecessors);
    Object.freeze(event.source); Object.freeze(event);
  }
  Object.freeze(events);
  let restored = false;
  const index = (year, month) => (year - 1) * 12 + (month + 8) % 12;
  function reachedCalendar() {
    const year = Math.floor(monthIndex() / 12) + 1;
    if (!Number.isInteger(S.year) || !Number.isInteger(S.month) || S.month < 1 || S.month > 12 ||
        !Number.isInteger(S.week) || S.week < 1 || S.week > 4 || year < 1 || year > 5) return null;
    return {year, month:S.month, week:S.week};
  }
  function hasIn(state, id) {
    const event = byId.get(id);
    if (!event) return false;
    return (state.memories || []).some(memory => memory.id === id &&
      memory.year === event.year && memory.month === event.month && memory.week === event.week &&
      memory.source?.type === event.source.type && memory.source?.id === event.source.id) &&
      event.predecessors.every(prior => hasIn(state, prior));
  }
  function has(id) { return hasIn(window.ADHOMS_LIGHT_STATE,id); }
  function reconcileVisible() {
    // daily-session owns the validated current week. Initial light-state load
    // must not guess week four or backfill before that restoration boundary.
    if (!restored) return false;
    const current = reachedCalendar();
    if (!current) return false;
    let next = window.ADHOMS_LIGHT_STATE;
    let changed = false;
    const reached = (year, month, week) => index(year,month) < index(current.year,current.month) ||
      (index(year,month) === index(current.year,current.month) && week <= current.week);
    for (const [month, beats] of Object.entries(scenes)) for (const beat of beats || []) {
      if (!beat?.memory || !Number.isInteger(beat.w) || !reached(1,Number(month),beat.w)) continue;
      if ((next.memories || []).some(memory => memory.id === beat.memory.id)) continue;
      next = window.ADHOMS_VER1_STATE.addMemory(next, {...beat.memory, year:1, month:Number(month)});
      changed = true;
    }
    for (const event of events) {
      if (!reached(event.year,event.month,event.week)) continue;
      if ((next.memories || []).some(memory => memory.id === event.id)) continue;
      if (!event.predecessors.every(id => hasIn(next,id))) continue;
      next = window.ADHOMS_VER1_STATE.addMemory(next, {...event, scope:'character', tags:['adopted-history','week:'+event.week]});
      changed = true;
    }
    if (changed) {
      window.ADHOMS_LIGHT_STATE = next;
      window.ADHOMS_VER1_SESSION.write(STATE_KEY,next);
    }
    return changed;
  }
  window.ADHOMS_VER1_STORY_HISTORY = {
    events, has, reconcileVisible,
    restoreComplete() { restored = true; return reconcileVisible(); },
    memoriesFor(entityId) { return window.ADHOMS_VER1_STATE.memoriesForEntity(window.ADHOMS_LIGHT_STATE,entityId); }
  };
})();
