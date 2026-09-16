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
        } else {
          toast('＋観測：優先度を上げました');
        }
      } else {
        toast('＋観測を解除');
      }
    }

    if (action === 'minus') {
      S.minus[id] = !S.minus[id];
      if (S.minus[id]) {
        S.likes[id] = false;
        toast('−観測：優先度を下げました');
      } else {
        toast('−観測を解除');
      }
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
    if (S.meetingDone[key]) {
      nextMonth();
      return;
    }

    document.getElementById('meetTitle').textContent = `${ym()} 月例報告会`;
    const focus = summarizeMonth();
    const research = S.research.filter(r => r.done).slice(-2);
    const researchLine = research.length
      ? research.map(r => `「${r.title}」は結果が出ています`).join('。') + '。'
      : '完了した調査はまだありません。';

    const dialogue = [
      bubble('宮', '宮下', '実証統括', '辛辣', `<span class="replyLine">会議開始</span>今月は「${focus}」。投稿数が増えたから重要、で済ませると雑です。藤井、現場で何が重なって見えた？`),
      bubble('藤', '藤井', '調査・住民窓口', 'ワタワタ', `<span class="replyLine">→ 宮下</span>宮下さん、えっと……声だけ追うと散らばってるんですけど、移動できない・人手が足りない・連絡がつながらない、が何度も出ています。${researchLine}`),
      bubble('水', '水野', '現地観測', '変な趣味', `<span class="replyLine">→ 藤井</span>藤井の整理は合ってる。ただ、平均だけ見ると消える偏りがある。自分なら古道と水路と夜の動物痕を一緒に歩いて見る。変な組み合わせに見えるけど、生活圏の境目が出る。`),
      bubble('佐', '佐伯', 'ADHOMS解析', 'ADHOMSオタク', `<span class="replyLine">→ 水野</span>水野さんの「境目」はかなり重要です。ADHOMS的には、問題の種類より関係が切れる位置を追いたい。交通と医療、維持管理と豪雨みたいに、別カテゴリが同じ制約を共有している可能性があります。`),
      bubble('宮', '宮下', '実証統括', '辛辣', `<span class="replyLine">→ 佐伯・全員</span>じゃあ来月は「何を増やすか」より「どこで関係が切れるか」を優先して見る。佐伯、理屈に酔わず検証可能な形に落として。藤井は反証になる声も拾う。水野は現地差を潰さない。`),
      bubble('◇', 'ADHOMS', 'SYSTEM', '', `<span class="replyLine">MONTHLY SYNTHESIS</span>主要観測「${focus}」を、単一問題ではなく複数主体・移動・維持能力・情報経路の関係として継続追跡します。来月の価値優先度を確認してください。`, 'hms')
    ].join('');

    document.getElementById('meetingBody').innerHTML = `<div class="meetingContext"><div class="eyebrow">今月の主要観測</div><div class="topic">${focus}</div><p>FEED・返信・調査結果・状態変化を、スタッフが互いに反証しながら整理します。</p></div><div class="meetingThread">${dialogue}</div><div class="monthlyValues"><b>VALUE PRIORITIES</b><label>暮らし<input type="range" min="20" max="100" value="${S.values.life}" data-k="life"><span>${S.values.life}</span></label><label>活力<input type="range" min="20" max="100" value="${S.values.vital}" data-k="vital"><span>${S.values.vital}</span></label><label>未来<input type="range" min="20" max="100" value="${S.values.future}" data-k="future"><span>${S.values.future}</span></label><label>技術<input type="range" min="20" max="100" value="${S.values.tech}" data-k="tech"><span>${S.values.tech}</span></label><label>環境<input type="range" min="20" max="100" value="${S.values.env}" data-k="env"><span>${S.values.env}</span></label></div><button class="meetingContinue" onclick="finishMeeting('${key}')">設定を保存して翌月へ →</button>`;

    document.querySelectorAll('.monthlyValues input').forEach(x => {
      x.oninput = () => { x.nextElementSibling.textContent = x.value; };
    });
    document.getElementById('meeting').classList.add('on');
  };

  renderFeed();
})();
