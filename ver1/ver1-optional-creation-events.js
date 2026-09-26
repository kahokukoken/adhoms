(() => {
  if (!window.ADHOMS_VER1_STATE || !window.ADHOMS_LIGHT_STATE || typeof window.renderFeed !== 'function') return;

  const STATE_KEY = 'adhoms.ver1.lightstate';
  const EVENTS = {
    brine: {
      months: [7, 8],
      relation: 'brine',
      memoryId: 'optional_brine_genkan',
      kicker: 'OPTIONAL CREATION / CULTURE',
      title: '透の持ち込み相談 — BRINEの新曲',
      body: '木曽の大学同級生、透はバンド「BRINE」で活動している。音響の授業で知り合って以来、壊れたアンプや録音機材を木曽に持ち込む仲だ。六月の修理のお礼に誘われ、今日は音楽スタジオへ。機材は直った。今度の相談は、新曲のことらしい。',
      continuation: {
        title: '透から八月の録音 — GENKANの続き',
        body: '七月にスタジオで相談した、BRINEの新曲「GENKAN」。大学同級生の透から、歌詞を書き直した練習の録音が木曽へ届いた。',
        process: [
          ['透','最後の一行でまだ揉めてる。出ていく歌か、帰ってくる歌か。片方には決めたくないんだよ。次はこの形で最後まで通してみる。'],
          ['木曽','両方あるから、お前らの曲なんだろ。俺も録音を聴く。冒頭と最後で、同じ言葉がどう聞こえるか確かめたい。']
        ],
      },
      process: [
        ['透','アンプは直った。ありがとう。で、こっちは曲。聴かせると「何か足りない」って言われるんだよ。お前、そういう分からない所を探すの得意だろ。'],
        ['木曽','機材と一緒にするな。……さっきの歌詞、町の名前を知らない客はどこで自分の話だと思えばいい？'],
        ['透','そこなんだよ。地元の説明を足したら、観光案内みたいになった。そのADHOMSで、俺たちをスタジアムバンドにできない？'],
        ['木曽','売れる曲を出してくれる装置じゃない。聴いた人が、どの言葉を覚えて帰ったかなら調べられる。曲はお前らが作れ。'],
        ['ドラム担当','私は「地元が好き」だけだと歌いにくいな。出ていきたい日もあったし。帰ってきたらほっとするのも、本当だけど。'],
        ['木曽','出る時も帰る時も、通るのは同じ玄関か。……帰りたいのに帰れない人も、その言葉なら入る。'],
        ['T-0WA','比較記録。「玄関」は、入口の設備だけでなく、出発と帰着の場所として使われています。英語へ一語で置き換えると、この重なりが残るかは要確認です。'],
        ['透','GENKAN、か。俺は昔の家を思い浮かべたけど、お前は違う場所かもしれない。それでいい気がする。まず曲に戻してみよう。'],
        ['木曽','よさそう、だけではまだ分からん。説明を削った歌詞を聴き比べるか、小さいライブで反応を見るか。何もしなくても、曲は進めてくれ。']
      ],
      worldNote: 'プレイヤーが制作へ直接関与しなくても、透たちは練習を続け、新曲の仮題をGENKANとした。河北恒研は後日の音源を待つことにした。',
      choices: {
        universal: {
          label: '地名の説明を削った歌詞を、メンバーで聴き比べる',
          note: '透たちと、地名の説明を削り「玄関／帰る場所」を残した歌詞を聴き比べることにした。誰がどんな場所を思い浮かべるか、次の練習で聞く。',
          relationDelta: 1,
        },
        live_test: {
          label: '小さなライブで鳴らして、帰る客に感想を聞く',
          note: 'GENKANを小さなライブで試すことにした。拍手の大きさだけで決めず、帰る客が覚えている言葉も聞く。透から後日、様子を知らせてもらう。',
          relationDelta: 1,
        },
        observe_only: {
          label: '曲作りはメンバーに任せ、出来た音源を聴く',
          note: '制作は透たちに任せた。完成した音源と、その後のライブの様子を外から聴いていく。',
          relationDelta: 0,
        },
      },
    },
    miso: {
      months: [9, 10],
      relation: 'miso_shop',
      memoryId: 'optional_miso_soba',
      kicker: 'OPTIONAL CREATION / LOCAL FOOD',
      title: '村田さんの昼ごはん — 味噌だれつけ蕎麦',
      body: '六月に搬入口の雨で困っていた、村田真紀の店。今度は、工場の昼休みにまた食べたくなる名物を作りたいという相談だ。味噌を届ける高倉千尋は木曽の幼馴染。「まず食べに来て」と木曽を呼んだ。厨房には、いつもの蕎麦とだし、千尋の持ってきた味噌が並んでいる。',
      continuation: {
        title: '村田さんの十月の厨房 — 味噌だれつけ蕎麦の続き',
        body: '九月に木曽も味見した、村田さんの味噌だれつけ蕎麦。木曽の幼馴染で味噌を届ける千尋と、いつもの昼営業に出せる形を探している。',
        process: [
          ['村田 真紀','朝晩冷えるので、温かい方を聞かれるようになりました。今は常連さんに少しずつ。食べたい人がいると分かると、続けられる出し方を見つけたくなりますね。'],
          ['高倉 千尋','次に味噌を届ける日は、私も昼まで残るよ。いつもの定食が止まらないか、厨房で見てみよう。朔にもその日の様子を知らせるね。']
        ],
      },
      process: [
        ['村田 真紀','このつけだれ、おいしいです。でも昼に十杯来たらどうかな。工場の人、食べ終わって戻る時間が決まってるから。'],
        ['高倉 千尋','朔、まず一口。……どう？ 点数じゃなくて、明日の昼も食べたいかで答えて。'],
        ['木曽','食べたい。けど、温かい方の鍋はどこに置く？ 今も蕎麦の湯とだしでコンロを使ってる。'],
        ['村田 真紀','そこなんです。鍋を増やすと、いつもの定食が作れなくなる。冷たいのだけだと冬が心配だし。'],
        ['高倉 千尋','冷たいのと温かいので、同じ味噌だれと薬味を使えないかな。新しい具を一品だけのために仕込むのは、私が毎朝届けても続かんから。'],
        ['木曽','今の厨房で十杯まとめて出せるかも気になる。試すなら、皿が戻ってくるところまで時間を見たい。'],
        ['高倉 千尋','手伝うなら、時計だけ見とらんと空いた皿も下げてね。昔からそういう役を見つけるのは早いんだから。'],
        ['T-0WA','本日の感想と、次に試したいことを記録しました。冷／温の材料を比べる案と、昼に十杯出す案があります。所長は制作をお手伝いしますか。それとも、お二人の試作を待ちますか。']
      ],
      worldNote: 'プレイヤーが商品設計へ直接関与しなくても、村田と千尋は冷／温の味噌だれつけ蕎麦を試作し、常連客の感想を聞き続けた。',
      choices: {
        shared_ingredients: {
          label: '冷／温で同じ薬味とたれを使い、仕込みを比べる',
          note: '千尋と村田さんに、冷／温で同じ食材を使う試作をお願いした。味に加え、毎朝の仕込みが増えすぎないかを確かめる。',
          relationDelta: 1,
        },
        service_flow: {
          label: '昼に十杯頼まれたつもりで、提供と片付けを試す',
          note: '注文が重なる昼を想定し、十杯を作って片付けるまでの流れを試すことにした。鍋と皿の置き場も一緒に確認する。',
          relationDelta: 1,
        },
        observe_only: {
          label: '試作は二人に任せ、もう一度注文した客の話を聞く',
          note: 'レシピは千尋と村田さんに任せた。誰が一度食べ、誰がまた頼んだか、普段の昼営業で教えてもらう。',
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

  const FISCAL_MONTHS = [4,5,6,7,8,9,10,11,12,1,2,3];
  const monthPosition = month => FISCAL_MONTHS.indexOf(month);

  function worldProgressed(eventId) {
    return !!window.ADHOMS_LIGHT_STATE.flags?.[`optional:${eventId}:world`];
  }

  function eventExpired(event) {
    const trialYear = Math.floor(monthIndex() / 12) + 1;
    if (trialYear > 1) return true;
    if (trialYear < 1) return false;
    const last = Math.max(...event.months.map(monthPosition));
    return monthPosition(S.month) > last;
  }

  function addEventMemory(state, eventId, note, extraTags=[]) {
    const event = EVENTS[eventId];
    if (state.memories?.some(memory => memory.id === event.memoryId)) return state;
    return window.ADHOMS_VER1_STATE.addMemory(state, {
      id: event.memoryId,
      scope: eventId === 'brine' ? 'culture' : 'local_food',
      tags: eventId === 'brine'
        ? ['culture', 'emergence', 'repeatability', ...extraTags]
        : ['food', 'emergence', 'repeatability', ...extraTags],
      note,
    });
  }

  function ensureWorldProgress() {
    let changed = false;
    Object.entries(EVENTS).forEach(([eventId,event]) => {
      if (selectedChoice(eventId) || worldProgressed(eventId) || !eventExpired(event)) return;
      let next = window.ADHOMS_VER1_STATE.applyDelta(window.ADHOMS_LIGHT_STATE, {
        flags: {
          [`optional:${eventId}:seen`]: true,
          [`optional:${eventId}:world`]: true,
        },
      });
      next = addEventMemory(next, eventId, event.worldNote, ['autonomous']);
      window.ADHOMS_LIGHT_STATE = next;
      changed = true;
    });
    if (changed) save();
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
    next = addEventMemory(next, eventId, choice.note);
    window.ADHOMS_LIGHT_STATE = next;
    save();
    renderOptionalCard();
    if (typeof toast === 'function') toast('任意観測を記録しました');
  }

  function ensureStyle() {
    if (document.getElementById('ver1-optional-creation-style')) return;
    const style = document.createElement('style');
    style.id = 'ver1-optional-creation-style';
    style.textContent = '.ver1OptionalCard{background:#101922;border:1px solid #3b5868;border-radius:14px;padding:13px;margin:0 0 10px;position:relative}.ver1OptionalCard:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:14px 0 0 14px;background:var(--wa)}.ver1OptionalKicker{font-size:13px;letter-spacing:.08em;color:var(--wa);margin-bottom:5px}.ver1OptionalCard h3{font-size:16px;margin:0 0 8px}.ver1OptionalCard p{font-size:15px;line-height:1.7;color:#bdc9d3;margin:0 0 10px}.ver1OptionalProcess{display:grid;gap:7px;margin:10px 0 12px}.ver1OptionalLine{border-left:2px solid #355368;padding:7px 9px;background:#0c151d}.ver1OptionalLine b{display:block;font-size:13px;color:#dce9f1;margin-bottom:2px}.ver1OptionalLine span{font-size:14px;line-height:1.65;color:#bdc9d3}.ver1OptionalChoices{display:grid;gap:7px}.ver1OptionalChoice{border:1px solid #34495a;background:#111b24;color:#eaf1f7;border-radius:10px;padding:11px;text-align:left;font-size:14px;line-height:1.55}.ver1OptionalDone{font-size:13px;color:var(--go);border-top:1px solid #2d414d;padding-top:9px}.ver1OptionalOutcome{font-size:14px!important;color:#bdc9d3!important;margin:6px 0 0!important}';
    document.head.appendChild(style);
  }

  function renderOptionalCard() {
    ensureWorldProgress();
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
      controls = '<div class="ver1OptionalDone">記録済み：'+event.choices[selected].label+'<p class="ver1OptionalOutcome">'+event.choices[selected].note+'</p></div>';
    } else {
      controls = '<div class="ver1OptionalChoices">'+Object.entries(event.choices).map(([choiceId, choice]) =>
        '<button class="ver1OptionalChoice" data-optional-choice="'+choiceId+'">'+choice.label+'</button>'
      ).join('')+'</div>';
    }

    const scene=S.month===event.months[0]?event:event.continuation;
    const process = '<div class="ver1OptionalProcess">'+scene.process.map(([speaker,text])=>'<div class="ver1OptionalLine"><b>'+speaker+'</b><span>'+text+'</span></div>').join('')+'</div>';
    card.innerHTML = '<div class="ver1OptionalKicker">'+event.kicker+'</div><h3>'+scene.title+'</h3><p>'+scene.body+'</p>'+process+controls;
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
    worldProgressed,
    ensureWorldProgress,
    resolveChoice,
  };
})();
