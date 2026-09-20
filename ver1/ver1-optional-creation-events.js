(() => {
  if (!window.ADHOMS_VER1_STATE || !window.ADHOMS_LIGHT_STATE || typeof window.renderFeed !== 'function') return;

  const STATE_KEY = 'adhoms.ver1.lightstate';
  const EVENTS = {
    brine: {
      months: [7, 8],
      relation: 'brine',
      memoryId: 'optional_brine_genkan',
      kicker: 'OPTIONAL CREATION / CULTURE',
      title: 'BRINE / GENKAN',
      body: 'BRINEが新曲の核を探している。「玄関」「母港」「出発と帰着」「帰れない場所」。説明を足すほど良くなるとは限らない。歌詞・ライブ・地元性・観客反応・口コミが、曲をどこまで普遍化できるかを観測する。',
      choices: {
        universal: {
          label: '「玄関／帰る場所」の像を残し、説明を増やしすぎない',
          note: 'GENKANは地名の説明ではなく、出発と帰着を共有できる像として残す方向を観測した。',
          relationDelta: 1,
        },
        live_test: {
          label: 'まず小さなライブで鳴らし、観客反応と口コミの広がりを見る',
          note: 'GENKANを小規模ライブで試し、観客反応・口コミ・反復可能性を観測した。',
          relationDelta: 1,
        },
        observe_only: {
          label: '制作には介入せず、曲が自然に反復されるかだけ追う',
          note: '制作には介入せず、GENKANがライブと口コミで自発的に反復されるかを観測した。',
          relationDelta: 0,
        },
      },
    },
    miso: {
      months: [9, 10],
      relation: 'miso_shop',
      memoryId: 'optional_miso_soba',
      kicker: 'OPTIONAL CREATION / LOCAL FOOD',
      title: '高倉味噌店 / 味噌だれつけ蕎麦',
      body: '店から「この店の名物を一つ作りたい」と相談が来た。候補は冷／温の味噌だれつけ蕎麦。味だけでなく、厨房負荷・提供速度・食材共用・再現性と、客が繰り返し頼むかを観測する。',
      choices: {
        shared_ingredients: {
          label: '冷／温で食材を共用できる構成を優先して試す',
          note: '冷／温の味噌だれつけ蕎麦で食材共用と再現性を優先し、地域で反復できる条件を観測した。',
          relationDelta: 1,
        },
        service_flow: {
          label: '提供速度と厨房負荷を優先し、現場で回る形を試す',
          note: '味噌だれつけ蕎麦の提供速度と厨房負荷を優先し、日常営業で反復できる条件を観測した。',
          relationDelta: 1,
        },
        observe_only: {
          label: '味には介入せず、客層と反復注文だけを追う',
          note: '商品設計には介入せず、味噌だれつけ蕎麦を誰が繰り返し注文するかを観測した。',
          relationDelta: 0,
        },
      },
    },
  };

  function save() {
    localStorage.setItem(STATE_KEY, JSON.stringify(window.ADHOMS_LIGHT_STATE));
  }

  function selectedChoice(eventId) {
    const event = EVENTS[eventId];
    if (!event) return null;
    return Object.keys(event.choices).find(choiceId => window.ADHOMS_LIGHT_STATE.flags?.[`optional:${eventId}:${choiceId}`]) || null;
  }

  function activeEventId() {
    if (S.year !== 1) return null;
    return Object.keys(EVENTS).find(eventId => EVENTS[eventId].months.includes(S.month)) || null;
  }

  function resolveChoice(eventId, choiceId) {
    const event = EVENTS[eventId];
    const choice = event?.choices?.[choiceId];
    if (!event || !choice || selectedChoice(eventId)) return;

    let next = window.ADHOMS_VER1_STATE.applyDelta(window.ADHOMS_LIGHT_STATE, {
      relations: choice.relationDelta ? { [event.relation]: choice.relationDelta } : {},
      flags: {
        [`optional:${eventId}:seen`]: true,
        [`optional:${eventId}:${choiceId}`]: true,
      },
    });
    next = window.ADHOMS_VER1_STATE.addMemory(next, {
      id: event.memoryId,
      scope: eventId === 'brine' ? 'culture' : 'local_food',
      tags: eventId === 'brine' ? ['culture', 'emergence', 'repeatability'] : ['food', 'emergence', 'repeatability'],
      note: choice.note,
    });
    window.ADHOMS_LIGHT_STATE = next;
    save();
    renderOptionalCard();
    if (typeof toast === 'function') toast('任意観測を記録しました');
  }

  function ensureStyle() {
    if (document.getElementById('ver1-optional-creation-style')) return;
    const style = document.createElement('style');
    style.id = 'ver1-optional-creation-style';
    style.textContent = '.ver1OptionalCard{background:#101922;border:1px solid #3b5868;border-radius:14px;padding:13px;margin:0 0 10px;position:relative}.ver1OptionalCard:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:14px 0 0 14px;background:var(--wa)}.ver1OptionalKicker{font-size:9px;letter-spacing:.1em;color:var(--wa);margin-bottom:4px}.ver1OptionalCard h3{font-size:15px;margin:0 0 7px}.ver1OptionalCard p{font-size:12px;line-height:1.7;color:#bdc9d3;margin:0 0 10px}.ver1OptionalChoices{display:grid;gap:6px}.ver1OptionalChoice{border:1px solid #34495a;background:#111b24;color:#eaf1f7;border-radius:10px;padding:10px;text-align:left;font-size:12px;line-height:1.55}.ver1OptionalDone{font-size:11px;color:var(--go);border-top:1px solid #2d414d;padding-top:8px}';
    document.head.appendChild(style);
  }

  function renderOptionalCard() {
    document.querySelectorAll('.ver1OptionalCard').forEach(node => node.remove());
    const eventId = activeEventId();
    if (!eventId) return;
    const event = EVENTS[eventId];
    const feed = document.getElementById('feedList');
    if (!feed?.parentNode) return;

    const selected = selectedChoice(eventId);
    const card = document.createElement('section');
    card.className = 'ver1OptionalCard';
    card.dataset.optionalEvent = eventId;

    let controls = '';
    if (selected) {
      controls = '<div class="ver1OptionalDone">記録済み：'+event.choices[selected].label+'</div>';
    } else {
      controls = '<div class="ver1OptionalChoices">'+Object.entries(event.choices).map(([choiceId, choice]) =>
        '<button class="ver1OptionalChoice" data-optional-choice="'+choiceId+'">'+choice.label+'</button>'
      ).join('')+'</div>';
    }

    card.innerHTML = '<div class="ver1OptionalKicker">'+event.kicker+'</div><h3>'+event.title+'</h3><p>'+event.body+'</p>'+controls;
    feed.parentNode.insertBefore(card, feed);
    card.querySelectorAll('[data-optional-choice]').forEach(button => {
      button.onclick = () => resolveChoice(eventId, button.dataset.optionalChoice);
    });
  }

  ensureStyle();
  const baseRenderFeed = window.renderFeed;
  window.renderFeed = function renderFeedWithOptionalCreation() {
    baseRenderFeed();
    renderOptionalCard();
  };
  renderOptionalCard();

  window.ADHOMS_VER1_OPTIONAL = {
    events: EVENTS,
    selectedChoice,
    resolveChoice,
  };
})();
