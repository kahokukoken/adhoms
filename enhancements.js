(() => {
  const hint = document.querySelector('.hint');
  if (hint) {
    hint.innerHTML = '<b>＋</b>＝この観測を重く見る。必要なら河北恒研が自動調査　／　<b>−</b>＝この観測の優先度を下げる　／　<b>＋ フォロー</b>＝発信者を継続観測。<br>＋/−は賛否ではなく、観測上の重み付けです。返信や反証まで含めて判断します。';
  }

  const style = document.createElement('style');
  style.textContent = '.a.neg.on{color:var(--bad);border-color:#82474d}.staffCue{display:inline-block;margin-left:6px;font-size:9px;color:var(--wa);border:1px solid #735c36;border-radius:999px;padding:1px 5px}.speech .replyLine{display:block;color:#9fb0c0;font-size:11px;margin-bottom:4px}';
  document.head.appendChild(style);

  S.minus = S.minus || {};

  cardHTML = function cardHTMLEnhanced(p, depth = 0) {
    const plus = !!S.likes[p.id];
    const minus = !!S.minus[p.id];
    const follow = !!S.follow[p.who];
    return `<div class="card ${p.cat} ${depth ? 'reply depth' + Math.min(depth, 2) : ''}" data-id="${p.id}"><div class="head"><div class="mark">${p.mark}</div><div><div class="who">${p.who}${p.internal ? '<span class="internal">内部</span>' : ''}${p.m === monthIndex() && p.w === S.week ? '<span class="newtag">NEW</span>' : ''}</div><div class="meta">${p.meta} ・ ${catLabel(p.cat)}</div></div></div>${depth ? '<div class="replyto">↳ 関連投稿への返信</div>' : ''}<div class="post">${p.text}</div>${relCount(p.topic) > 0 ? `<div class="rel">↔ 同テーマの関連観測 ${relCount(p.topic)}件</div>` : ''}<div class="acts"><button class="a ${plus ? 'on' : ''}" aria-label="＋" onclick="act('${p.id}','plus')">＋</button><button class="a neg ${minus ? 'on' : ''}" aria-label="−" onclick="act('${p.id}','minus')">−</button><button class="a fl ${follow ? 'on' : ''}" onclick="act('${p.id}','follow')">＋ フォロー</button><button class="a" onclick="act('${p.id}','detail')">⌕ 詳細</button></div></div>`;
  };

  act = function actEnhanced(id, action) {
    const p = findPost(id);
    if (!p) return;
    if (action === 'plus') {
      S.likes[id] = !S.likes[id];
      if (S.likes[id]) {
        S.minus[id] = false;
        if (researchMap[id] && !S.research.some(x => x.id === id)) {
          const q = researchMap[id];
          S.research.push({ id, title: q.title, result: q.result, due: monthIndex() + q.delay, done: false, topic: p.topic });
          toast(`＋観測：${q.title} を自動調査へ`);
        } else toast('＋観測：優先度を上げました');
      } else toast('＋観測を解除');
    }
    if (action === 'minus') {
      S.minus[id] = !S.minus[id];
      if (S.minus[id]) {
        S.likes[id] = false;
        toast('−観測：優先度を下げました');
      } else toast('−観測を解除');
    }
    if (action === 'follow') {
      S.follow[p.who] = !S.follow[p.who];
      toast(S.follow[p.who] ? '継続観測に追加' : 'フォロー解除');
    }
    if (action === 'detail') {
      openSheet(`<div class="meta">${p.meta}</div><h2>${p.who}</h2><p>${p.text}</p><p>同テーマの観測は現在 ${relCount(p.topic) + 1}件。FEED上の声は「事実そのもの」ではなく、立場・経験・観測範囲を持つ情報として扱います。</p>`);
    }
    renderFeed();
  };

  const bubble = (avatar, name, role, cue, text, extra = '') => `<div class="bubble"><div class="avatar">${avatar}</div><div class="speech ${extra}"><div class="speaker">${name} <span class="role">${role}</span>${cue ? `<span class="staffCue">${cue}</span>` : ''}</div>${text}</div></div>`;

  openMeeting = function openMeetingEnhanced() {
    const key = `${S.year}-${S.month}`;
    if (S.meetingDone[key]) { nextMonth(); return; }

    document.getElementById('meetTitle').textContent = `${ym()} 月例報告会`;
    const focus = summarizeMonth();
    const research = S.research.filter(r => r.done).slice(-2);
    const researchLine = research.length
      ? research.map(r => `「${r.title}」は結果が出ています`).join('。') + '。'
      : '完了した調査はまだありません。';

    const dialogue = [
      bubble('宮', '宮下 沙耶', 'データ解析', '精密・辛辣', `<span class="replyLine">会議開始</span>「${focus}」が目立っています。ただ、投稿数が多いだけでは結論になりません。誰が、どの地区で、どの時間帯に影響を受けているかを分けて見ます。単純比較は条件差を補正してからです。`),
      bubble('藤', '藤井 真', '実証運営', '現場調整', `<span class="replyLine">→ 宮下 沙耶</span>ちょ、ちょっと待って！一個ずつ！　現場はそんなにきれいに分かれませんって。困ってる人は「今どうするか」を先に聞いてくるんです。${researchLine}　対策を動かす順番も一緒に見ないと。`),
      bubble('水', '水野 悠', '社会システム', '人間観察', `<span class="replyLine">→ 藤井 真</span>藤井さんの言う「順番」は大事ですね。制度だけ見ても、人がなぜその行動を選ぶかは抜けます。記憶、習慣、他の行事との関係まで含めて、生活のつながりとして見た方がいい。……閉店告知を集めてると、こういう切れ目は結構見えるんですよ。`),
      bubble('佐', '佐伯 直人', 'ADHOMSシステム', '技術オタク', `<span class="replyLine">→ 水野 悠</span>その「切れ目」はADHOMSで扱えます。関係の強度、代替経路、遅延、局所的な制約を分ければ――いや、ここから長くなるので省きます。予測精度が上がっても不確実性は消えません。あと「何を残すべきか」みたいな価値判断は、計算だけでは決まりません。`),
      bubble('宮', '宮下 沙耶', 'データ解析', '精密・辛辣', `<span class="replyLine">→ 全員</span>では、藤井さんは現場の実行順、水野さんは記憶と関係性、佐伯さんは代替経路と不確実性を確認してください。私は比較条件を揃えます。『なんとなく重要そう』は採用しません。`),
      bubble('◇', 'ADHOMS', 'SYSTEM', '', `<span class="replyLine">MONTHLY SYNTHESIS</span>主要観測「${focus}」を、単一の問題ではなく、主体・関係・履歴・代替経路・不確実性を含む状態として継続観測します。来月の価値優先度を確認してください。`, 'hms')
    ].join('');

    document.getElementById('meetingBody').innerHTML = `<div class="meetingContext"><div class="eyebrow">今月の主要観測</div><div class="topic">${focus}</div><p>FEED・返信・調査結果・状態変化を、スタッフがそれぞれの専門と癖を持って議論します。</p></div><div class="meetingThread">${dialogue}</div><div class="monthlyValues"><b>VALUE PRIORITIES</b><label>暮らし<input type="range" min="20" max="100" value="${S.values.life}" data-k="life"><span>${S.values.life}</span></label><label>活力<input type="range" min="20" max="100" value="${S.values.vital}" data-k="vital"><span>${S.values.vital}</span></label><label>未来<input type="range" min="20" max="100" value="${S.values.future}" data-k="future"><span>${S.values.future}</span></label><label>技術<input type="range" min="20" max="100" value="${S.values.tech}" data-k="tech"><span>${S.values.tech}</span></label><label>環境<input type="range" min="20" max="100" value="${S.values.env}" data-k="env"><span>${S.values.env}</span></label></div><button class="meetingContinue" onclick="finishMeeting('${key}')">設定を保存して翌月へ →</button>`;

    document.querySelectorAll('.monthlyValues input').forEach(x => {
      x.oninput = () => { x.nextElementSibling.textContent = x.value; };
    });
    document.getElementById('meeting').classList.add('on');
  };

  renderFeed();
})();
