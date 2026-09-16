(() => {
  const hint = document.querySelector('.hint');
  if (hint) hint.innerHTML = '<b>＋</b>＝この観測を重く見る。必要なら河北恒研が自動調査　／　<b>−</b>＝この観測の優先度を下げる　／　<b>＋ フォロー</b>＝発信者を継続観測。<br>＋/−は賛否ではなく、観測上の重み付けです。返信や反証まで含めて判断します。';

  const style = document.createElement('style');
  style.textContent = '.a.neg.on{color:var(--bad);border-color:#82474d}.staffCue{display:inline-block;margin-left:6px;font-size:9px;color:var(--wa);border:1px solid #735c36;border-radius:999px;padding:1px 5px}.speech .replyLine{display:block;color:#9fb0c0;font-size:11px;margin-bottom:4px}.card.influencer::before{background:#ff8bd8}.mark.vt{color:#ffb7eb;border-color:#6b3d61}';
  document.head.appendChild(style);

  S.minus = S.minus || {};
  if (!cats.some(([k]) => k === 'influencer')) cats.splice(cats.length - 1, 0, ['influencer', '配信']);
  const baseCatLabel = catLabel;
  catLabel = c => c === 'influencer' ? '配信・インフルエンサー' : baseCatLabel(c);

  const vtuberPosts = [
    {m:0,w:1,id:'vt1',cat:'influencer',mark:'V',who:'勇者ノト',meta:'LOCAL VTUBER / LIVE CLIP',topic:'transport',text:'【今日の倶利伽羅】「車ないと詰む」ってコメント来てるけど、朝のバスって実際どこで詰まってるん？　地元民、情報求む！'},
    {m:1,w:2,id:'vt2',cat:'influencer',mark:'V',who:'勇者ノト',meta:'LOCAL VTUBER / STREAM',topic:'wildlife',text:'イノシシ目撃マップ作ったら山際にめっちゃ偏ってる。怖がるだけじゃなくて、なんでそこに寄ってるのか知りたい。'},
    {m:2,w:3,id:'vt3',cat:'influencer',mark:'V',who:'勇者ノト',meta:'LOCAL VTUBER / WEATHER WATCH',topic:'rain',text:'雨配信しようと思ったけど笑えん降り方してる。川だけじゃなく道路の水たまり位置も送って。無理して外出るのは禁止。'},
    {m:4,w:2,id:'vt4',cat:'influencer',mark:'V',who:'勇者ノト',meta:'LOCAL VTUBER / COMMUNITY',topic:'sumo',text:'八朔相撲、若い人来ないって言うけど「知らない」と「興味ない」は別だよね。今度配信で現場見に行く。'},
    {m:7,w:1,id:'vt5',cat:'influencer',mark:'V',who:'勇者ノト',meta:'LOCAL VTUBER / WINTER PREP',topic:'snow',text:'冬支度回。除雪って雪降ってから始まる仕事じゃないんだな…。去年詰まった道、今年どうするか聞いてみる。'}
  ];
  vtuberPosts.forEach(p => { if (!P.some(x => x.id === p.id)) P.push(p); });

  cardHTML = function cardHTMLEnhanced(p, depth = 0) {
    const plus = !!S.likes[p.id], minus = !!S.minus[p.id], follow = !!S.follow[p.who];
    return `<div class="card ${p.cat} ${depth ? 'reply depth' + Math.min(depth,2) : ''}" data-id="${p.id}"><div class="head"><div class="mark ${p.cat==='influencer'?'vt':''}">${p.mark}</div><div><div class="who">${p.who}${p.internal?'<span class="internal">内部</span>':''}${p.m===monthIndex()&&p.w===S.week?'<span class="newtag">NEW</span>':''}</div><div class="meta">${p.meta} ・ ${catLabel(p.cat)}</div></div></div>${depth?'<div class="replyto">↳ 関連投稿への返信</div>':''}<div class="post">${p.text}</div>${relCount(p.topic)>0?`<div class="rel">↔ 同テーマの関連観測 ${relCount(p.topic)}件</div>`:''}<div class="acts"><button class="a ${plus?'on':''}" aria-label="＋" onclick="act('${p.id}','plus')">＋</button><button class="a neg ${minus?'on':''}" aria-label="−" onclick="act('${p.id}','minus')">−</button><button class="a fl ${follow?'on':''}" onclick="act('${p.id}','follow')">＋ フォロー</button><button class="a" onclick="act('${p.id}','detail')">⌕ 詳細</button></div></div>`;
  };

  act = function actEnhanced(id, action) {
    const p = findPost(id); if (!p) return;
    if (action === 'plus') {
      S.likes[id] = !S.likes[id];
      if (S.likes[id]) {
        S.minus[id] = false;
        if (researchMap[id] && !S.research.some(x => x.id === id)) {
          const q = researchMap[id]; S.research.push({id,title:q.title,result:q.result,due:monthIndex()+q.delay,done:false,topic:p.topic});
          toast(`＋観測：${q.title} を自動調査へ`);
        } else toast('＋観測：優先度を上げました');
      } else toast('＋観測を解除');
    }
    if (action === 'minus') { S.minus[id] = !S.minus[id]; if (S.minus[id]) { S.likes[id] = false; toast('−観測：優先度を下げました'); } else toast('−観測を解除'); }
    if (action === 'follow') { S.follow[p.who] = !S.follow[p.who]; toast(S.follow[p.who] ? '継続観測に追加' : 'フォロー解除'); }
    if (action === 'detail') openSheet(`<div class="meta">${p.meta}</div><h2>${p.who}</h2><p>${p.text}</p><p>同テーマの観測は現在 ${relCount(p.topic)+1}件。FEED上の声は「事実そのもの」ではなく、立場・経験・観測範囲を持つ情報として扱います。</p>`);
    renderFeed();
  };

  const scenarios = {
    1:{title:'冬季交通と孤立',signal:'積雪・除雪・通院アクセス',m:'昨冬との比較を取ります。積雪量だけでなく、除雪開始時刻と通行不能時間を分けないと意味がありません。',f:'ちょ、ちょっと待って！一個ずつ！　雪の日は予定どおり動けない前提で、まず通院と通学の代替から決めましょう。',w:'雪の日って人の助け合い方が露骨に出ます。普段見えない関係が見える季節ですね。',s:'冗長経路と復旧遅延を別々に持たせます。不確実性は天候だけじゃなく、人員配置にもあります。'},
    2:{title:'冬の維持負担',signal:'除雪費・高齢世帯・燃料',m:'支出増だけ見て悪化扱いはしません。必要支出と構造的な浪費を分離します。',f:'現場は節約だけ言われても困るんですよ。削ると止まる場所を先に出しましょう。',w:'冬の負担って家ごとの差が大きいです。数字の平均より暮らし方の違いを見たい。',s:'同じ支出でも機能維持への寄与が違います。評価関数を単純なコスト最小化にしない方がいいです。'},
    3:{title:'年度末の先送り',signal:'施設更新・予算・未処理案件',m:'未処理件数より、先送りが何年続いているかを見ます。累積は別の情報です。',f:'年度末に全部来るのやめてほしいんですけど！　優先順位つけましょう、ほんとに。',w:'「毎年あとで」が地域の記憶になると、行政への期待そのものが変わります。',s:'経路依存ですね。延期コストは時間とともに非線形に増える可能性があります。'},
    4:{title:'新年度の移動変化',signal:'通勤・通学・転入世帯',m:'4月は構成が変わる月です。前年同月と単純比較せず、新規流入を分けます。単純比較は条件差を補正してからです。',f:'ちょ、ちょっと待って！一個ずつ！　新しく来た人は制度もバスも知らないんです。まず困り方が違う。',w:'引っ越してきた人の「当たり前」と地元の「当たり前」がぶつかる時期ですね。記憶の差が出ます。',s:'初期条件の差として持てます。関係がまだ形成されていない主体は同じサービスでも脆弱性が違います。'},
    5:{title:'山際の変化と野生動物',signal:'目撃地点・耕作放棄地・草刈り',m:'5月は目撃数そのものより分布です。山際・耕作放棄地・住宅地を分けます。',f:'通報が来た場所から順に見たいです。怖いって声と実際の危険地点を混ぜると対応が崩れます。',w:'人が使わなくなった土地って、動物には「空いた場所」ですからね。人間側の撤退も一緒に見ないと。',s:'生息域の問題だけでなく、人間活動の縮小との境界変化として扱えます。不確実性は目撃バイアスにもあります。'},
    6:{title:'梅雨入りと排水',signal:'側溝・冠水・河川・避難経路',m:'6月は降雨量だけでは足りません。同じ雨量で冠水差が出る地点を比較します。',f:'雨降ってから側溝見るんじゃ遅いですって！　詰まりと避難路、今のうちに確認しましょう。',w:'水って昔の地形を思い出したみたいに流れますよね。土地の記憶って言いたくなる。',s:'排水容量、閉塞、土地利用、移動経路の連鎖で表現できます。閾値超えの挙動が重要です。'},
    7:{title:'暑熱と生活圏',signal:'高温・高齢者・移動・電力',m:'気温平均ではなく、時間帯と屋内外の差を見ます。',f:'外出控えてで終わらせると通院できない人が出ます。移動もセットです。',w:'暑いと人が集まる場所そのものが変わる。商店や公民館の役割まで変わりますね。',s:'熱ストレス単体ではなく、電力・移動・社会接触の連成として見ます。'},
    8:{title:'夏休みと地域活動',signal:'子ども・観光・地域行事',m:'一時的な人口増と恒常的な利用増を混同しません。',f:'イベント人員、毎回同じ人に寄ってます。そろそろ限界見た方がいいです。',w:'祭りって参加者数より「誰が準備してるか」の方が地域構造が出ます。',s:'担い手集中度を関係ネットワーク側で見ます。単純参加者数では拾えません。'},
    9:{title:'八朔相撲と豪雨期',signal:'行事運営・道路・避難・降雨',m:'行事と気象を別々の表にするのはやめます。同時発生時の制約を見ます。',f:'開催か中止かだけじゃなくて、途中で降ったらどう逃がすかですよ！',w:'残すべき文化と安全は対立項じゃないです。やり方を変えて残す選択もある。',s:'複合イベントとして扱います。独立確率の足し算ではなく、共有制約の同時飽和を見ます。'},
    10:{title:'収穫期と物流',signal:'農業・人手・道路・販売',m:'収量だけでなく、収穫できるか・運べるか・売れるかを分けます。',f:'人手不足って一言で済ませないでください。曜日と時間で全然違います。',w:'農業って地域の季節のリズムそのものですね。人の予定まで巻き込む。',s:'生産量よりフロー制約として捉える方が自然です。'},
    11:{title:'冬支度の準備度',signal:'除雪契約・燃料・備蓄・人員',m:'「準備した／してない」ではなく、機能別に準備度を測ります。',f:'去年困った場所から先に潰しましょう。全部完璧は無理です。',w:'去年の失敗を誰が覚えてるか、そこ大事ですよ。担当が変わると消える記憶もある。',s:'組織Memoryとして保持させるべき情報ですね。'},
    12:{title:'年末の負荷集中',signal:'物流・医療・商業・休業',m:'年末特有のピークを平常月と混ぜません。',f:'休みの人が増えるのに需要は減らない場所ありますからね。代替連絡先を確認します。',w:'「みんな休む」時に誰が残るかで、見えない役割が出ます。',s:'同時休止による共通原因故障として扱えます。'}
  };

  const bubble = (avatar,name,role,cue,text,extra='') => `<div class="bubble"><div class="avatar">${avatar}</div><div class="speech ${extra}"><div class="speaker">${name} <span class="role">${role}</span>${cue?`<span class="staffCue">${cue}</span>`:''}</div>${text}</div></div>`;

  openMeeting = function openMeetingEnhanced() {
    const key = `${S.year}-${S.month}`; if (S.meetingDone[key]) { nextMonth(); return; }
    const sc = scenarios[S.month], focus = summarizeMonth();
    const research = S.research.filter(r => r.done).slice(-2);
    const researchLine = research.length ? research.map(r=>`「${r.title}」結果あり`).join(' / ') : '今月の完了調査なし';
    const yearLine = S.year === 1 ? '初年度なので基準線を作ります。' : `${S.year}年目。前年同月との差だけでなく、累積変化も見ます。`;
    document.getElementById('meetTitle').textContent = `${ym()} 月例報告会`;

    const dialogue = [
      bubble('宮','宮下 沙耶','データ解析','精密・辛辣',`<span class="replyLine">会議開始 / ${sc.title}</span>${sc.m} ${yearLine}`),
      bubble('藤','藤井 真','実証運営','現場調整',`<span class="replyLine">→ 宮下 沙耶</span>${sc.f}　${researchLine}`),
      bubble('水','水野 悠','社会システム','人間観察',`<span class="replyLine">→ 藤井 真</span>${sc.w}`),
      bubble('佐','佐伯 直人','ADHOMSシステム','技術オタク',`<span class="replyLine">→ 水野 悠</span>${sc.s} 予測精度が上がっても不確実性は消えません。`),
      bubble('宮','宮下 沙耶','データ解析','精密・辛辣',`<span class="replyLine">→ 全員</span>今月のFEED上の主要観測は「${focus}」。季節要因「${sc.signal}」と混同せず、重なった部分だけを次月へ持ち越します。『なんとなく重要そう』は採用しません。`),
      bubble('◇','ADHOMS','SYSTEM','',`<span class="replyLine">MONTHLY SYNTHESIS</span>${sc.title}を中心に、「${focus}」との関係、履歴、代替経路、遅延、不確実性を継続観測します。`, 'hms')
    ].join('');

    document.getElementById('meetingBody').innerHTML = `<div class="meetingContext"><div class="eyebrow">${2028+S.year}年${S.month}月 / 今月の焦点</div><div class="topic">${sc.title}</div><p>${sc.signal}。FEED・返信・調査結果・＋/−の重み付けと突き合わせます。</p></div><div class="meetingThread">${dialogue}</div><div class="monthlyValues"><b>VALUE PRIORITIES</b><label>暮らし<input type="range" min="20" max="100" value="${S.values.life}" data-k="life"><span>${S.values.life}</span></label><label>活力<input type="range" min="20" max="100" value="${S.values.vital}" data-k="vital"><span>${S.values.vital}</span></label><label>未来<input type="range" min="20" max="100" value="${S.values.future}" data-k="future"><span>${S.values.future}</span></label><label>技術<input type="range" min="20" max="100" value="${S.values.tech}" data-k="tech"><span>${S.values.tech}</span></label><label>環境<input type="range" min="20" max="100" value="${S.values.env}" data-k="env"><span>${S.values.env}</span></label></div><button class="meetingContinue" onclick="finishMeeting('${key}')">設定を保存して翌月へ →</button>`;
    document.querySelectorAll('.monthlyValues input').forEach(x => x.oninput = () => x.nextElementSibling.textContent = x.value);
    document.getElementById('meeting').classList.add('on');
  };

  renderFilters(); renderFeed();
})();
