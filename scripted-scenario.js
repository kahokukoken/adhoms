(() => {
  const roster = {
    misaki:{name:'田中 美咲',age:'38歳',role:'主婦 / 子育て世帯'},
    daisuke:{name:'山本 大輔',age:'44歳',role:'会社員 / 金沢方面へ通勤'},
    haruka:{name:'中川 春香',age:'29歳',role:'介護職'},
    makoto:{name:'北村 誠',age:'67歳',role:'農家'},
    aoi:{name:'森川 葵',age:'17歳',role:'高校生'},
    matsumoto:{name:'松本 達也',age:'46歳',role:'倶利伽羅町 交通政策係長'},
    saito:{name:'斉藤 由佳',age:'35歳',role:'倶利伽羅町 防災担当主査'},
    teranishi:{name:'寺西 浩一',age:'58歳',role:'旧宿場地区 商店主'},
    murata:{name:'村田 真紀',age:'41歳',role:'飲食店主'},
    kobayashi:{name:'小林 亮',age:'39歳',role:'中学校教員'},
    takagi:{name:'高木 玲子',age:'50歳',role:'町内診療所 医師'},
    takahashi:{name:'高橋 俊介',age:'52歳',role:'地域交通研究者'},
    ishida:{name:'石田 奈緒',age:'33歳',role:'北陸地域新聞 記者'},
    sakamoto:{name:'坂本 和夫',age:'71歳',role:'自治会長'},
    nishimura:{name:'西村 健太',age:'55歳',role:'路線バス運転手'},
    kurika:{name:'クリカ',age:'年齢不詳',role:'ローカルVTuber'},
    great:{name:'グレート・ノト',age:'年齢不詳',role:'動画配信者'}
  };

  const staff = {
    miyashita:{name:'宮下 沙耶',role:'データ解析',cue:'丁寧・精密'},
    fujii:{name:'藤井 真',role:'実証運営',cue:'ワタワタ現場型'},
    mizuno:{name:'水野 悠',role:'社会システム',cue:'人間観察・閉店告知収集'},
    saeki:{name:'佐伯 直人',role:'ADHOMSシステム',cue:'ADHOMSオタク'}
  };

  const yearArcs = {
    1:{label:'基準年',feed:'初年度。まず「普通の一年」がどう揺れるかを記録する。',meeting:'初年度なので結論より基準線を作る。'},
    2:{label:'認知から行動へ',feed:'情報が届いても、仕事や家族、移動手段によって動ける条件は違う。',meeting:'警告を知ったかと、実際に行動できたかを分けて確認する。'},
    3:{label:'適応の反作用',feed:'前年施策の利益と、その裏で別の人へ移った負担を追う。',meeting:'改善の効果と負担転嫁を確認し、修正の必要な条件を残す。'},
    4:{label:'経路依存・政治と継承',feed:'過去の判断と関係が、いま協力してもらえる相手や利用できる資源を変える。',meeting:'過去の経緯と現在の協力条件を結び付け、次に使える手札を確認する。'},
    5:{label:'最終実証年',feed:'最終年。5年間の積み重ねが、行事・豪雨・交通・高齢化の同時発生で試される。',meeting:'今年は単月最適化を禁止。5年間の履歴が壊れ方をどう変えたかを見る。'}
  };

  const months = {
    4:{topic:'新年度の移動変化',tags:'新年度 / 交通 / 転入',feed:[
      ['resident','住','misaki','朝のバス、一本逃すと次までが長い。新学期になって送迎と通勤が重なる時間が前よりきつい。'],
      ['office','行','matsumoto','4月の利用実績を確認中です。新規転入世帯と通学利用を分けて、時間帯ごとの偏りを見ます。'],
      ['influencer','V','kurika','新年度で「前と同じ時間のバスに乗れない」って声が増えてる。どの地区で変わった？'],
      ['influencer','G','great','【突撃】終バス逃したら徒歩で帰れるのか、新年度一発目で試す。地元民からは普通に止められてる。']
    ]},
    5:{topic:'山際の変化と野生動物',tags:'野生動物 / 山際 / 耕作放棄地',feed:[
      ['resident','住','makoto','畑の縁にイノシシの跡が増えた。去年より住宅側に寄ってきとる気がする。草刈りしてない区画も増えたし。'],
      ['resident','住','haruka','夜勤帰りに山際の道を通るのが怖い。遠回りすると20分増えるので、使わないわけにもいかない。'],
      ['office','行','saito','目撃件数だけでなく地点を整理しています。通報の多さと実際の危険度は分けて確認します。'],
      ['influencer','G','great','イノシシ出る場所に夜行けば会える説。配信予告したらコメント欄が「やめろ」で埋まった。']
    ]},
    6:{topic:'梅雨入りと排水',tags:'梅雨 / 排水 / 冠水',feed:[
      ['resident','住','daisuke','朝の雨で駅へ向かう道がまた冠水してた。同じ雨量でも、あそこだけ毎回ひどい気がする。'],
      ['business','商','murata','大雨の日は店の前より裏の搬入口が先に使えなくなる。配送が止まると営業にも響く。'],
      ['office','行','saito','側溝の閉塞と低地の冠水履歴を照合します。河川水位だけで判断しないようにします。'],
      ['influencer','V','kurika','雨配信は中止。危ないから外に出ず、冠水地点は窓から分かる範囲か過去写真で送って。']
    ]},
    7:{topic:'暑熱と生活圏',tags:'暑熱 / 高温 / 電力',feed:[
      ['resident','住','sakamoto','昼間の集会所、今年は避暑で来る人が増えた。昔は会合の時しか使わんかったんだけどね。'],
      ['expert','専','takagi','高齢者は「外出を控える」だけでは通院や買い物が止まります。移動手段と室温を一緒に見る必要があります。'],
      ['business','商','murata','午後だけ客層が変わった。涼みに来て長く滞在する人が増えて、店の役割まで変わってきた感じ。'],
      ['resident','住','aoi','部活帰りのバス待ちが一番きつい。日陰がほぼない停留所、どうにかならんかな。']
    ]},
    8:{topic:'夏休みと地域活動',tags:'夏休み / 行事 / 担い手',feed:[
      ['expert','専','kobayashi','夏休み行事の手伝いが毎年同じ家庭に偏っています。参加者数だけ見ると盛況なんですが。'],
      ['resident','住','misaki','子どもは楽しみにしてるけど、準備側になると平日夜の集まりがかなり重い。'],
      ['business','商','teranishi','イベントの日だけは人が来る。でも準備してる顔ぶれは10年前とあんまり変わらないね。'],
      ['influencer','V','kurika','夏の地域行事、参加する側だけじゃなく「準備してる人」に話を聞いてみる。']
    ]},
    9:{topic:'八朔相撲と豪雨期',tags:'八朔相撲 / 豪雨 / 避難',feed:[
      ['resident','住','sakamoto','八朔相撲は今年もやりたい。ただ、雨が強くなった時に観客をどこへ逃がすかは詰めないといけない。'],
      ['office','行','saito','開催可否だけでなく、開催中に避難へ切り替える条件と経路を確認しています。'],
      ['resident','住','aoi','相撲は好きだけど、大雨の時まで無理してやる必要はないと思う。でも無くなるのも嫌。'],
      ['influencer','G','great','八朔相撲に飛び入りしたらどこまで怒られるか検証、って企画出したら既に怒られてる。']
    ]},
    10:{topic:'収穫期と物流',tags:'収穫 / 農業 / 物流',feed:[
      ['resident','住','makoto','米は穫れても人手と運ぶ車が足りん日がある。収量だけ見ても仕事は終わらん。'],
      ['business','商','teranishi','地元の新米を置きたいけど、入荷日が読めないと売り場を組みにくい。'],
      ['office','行','matsumoto','農繁期の物流と生活交通が同じ道路・時間帯に集中する地点を確認します。'],
      ['influencer','V','kurika','収穫って「穫る」だけじゃないんだな。運ぶところまで追ってみる。']
    ]},
    11:{topic:'冬支度と高齢世帯',tags:'冬支度 / 除雪 / 高齢世帯',feed:[
      ['resident','住','sakamoto','雪が降る前に助け合いの組み合わせを決めとかないと、降ってからでは遅い。'],
      ['resident','住','haruka','独居の利用者さんは、雪より「誰に頼めるか」で困り方が変わります。'],
      ['office','行','saito','除雪路線に加えて、通院・介護で止められない生活動線を確認します。'],
      ['influencer','V','kurika','冬支度回。去年詰まった道と、今年助けに行く人の話を聞いてみる。']
    ]},
    12:{topic:'年末商業と移動',tags:'年末 / 商業 / 帰省',feed:[
      ['business','商','teranishi','年末は人が戻るけど数日だけ。売上は増えても、普段の買い物環境が良くなるわけじゃない。'],
      ['resident','住','daisuke','帰省の車で道が混むと、普段の移動時間が読めなくなる。'],
      ['office','行','matsumoto','一時的な交通量増加と恒常的な需要を分けて整理します。'],
      ['influencer','V','kurika','帰省した人に「地元で困ること」聞いてみる。住んでる人と違う答え出そう。']
    ]},
    1:{topic:'冬季交通と孤立',tags:'積雪 / 除雪 / 通院',feed:[
      ['resident','住','haruka','雪の日、訪問先までの最後の500mが一番困る。幹線が開いてても生活は止まります。'],
      ['resident','住','nishimura','除雪が入る順番でバスの遅れ方が全然違う。時刻表より道路状態の方が支配的になる日がある。'],
      ['expert','専','takagi','通院中断は積雪量だけでなく、送迎者の都合や歩行距離にも左右されます。'],
      ['influencer','V','kurika','雪の日の「行ける/行けない」マップ、道路だけじゃなく最後の徒歩区間も集めたい。']
    ]},
    2:{topic:'冬の維持負担',tags:'除雪費 / 燃料 / 高齢世帯',feed:[
      ['resident','住','misaki','灯油も除雪も上がって、冬だけ家計の形が別物になる。'],
      ['office','行','saito','必要な冬季支出と改善可能な非効率を分けて整理します。'],
      ['resident','住','makoto','納屋までの除雪は自分でやるけど、年々きつくなる。金だけの話でもない。'],
      ['influencer','V','kurika','「冬にしか発生しない負担」募集。お金以外の手間も教えて。']
    ]},
    3:{topic:'年度末の先送り',tags:'施設更新 / 予算 / 未処理',feed:[
      ['office','行','matsumoto','今年度中に結論が出なかった交通案件を、継続年数と影響範囲で整理します。'],
      ['expert','専','kobayashi','学校設備の修繕、また来年度検討になったものがあります。壊れてからでは遅いんですが。'],
      ['business','商','teranishi','毎年「来年考える」って話、商店街でも増えた。先送りにも癖がつくね。'],
      ['influencer','V','kurika','年度末。「今年決まらなかったこと」を集めてみる。忘れたことにしないために。']
    ]}
  };

  function absMonth(){ return monthIndex(); }
  function current(){ return months[S.month] || months[4]; }
  function year(){ return yearArcs[Math.min(5,Math.floor(absMonth()/12)+1)] || yearArcs[5]; }

  const authored = window.ADHOMS_OBSERVATION_SCENES;
  const year1Story = window.ADHOMS_YEAR1_STORY_SCENES || {};
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function seedScenarioPosts(){
    const scene=current(), arc=year(), idx=absMonth(), y=2028+S.year;
    const extra=authored[S.month];
    const rows=scene.feed.map(([cat,mark,key,text])=>({cat,mark,key,text:key==='kurika'?extra.kurika:text,w:1,major:true}));
    extra.weeks.forEach((posts,week)=>posts.forEach(([key,text,reply])=>{
      const cat=key==='kurika'?'influencer':['matsumoto','saito'].includes(key)?'office':['murata','teranishi'].includes(key)?'business':['kobayashi','takagi'].includes(key)?'expert':'resident';
      rows.push({cat,mark:key==='kurika'?'V':'観',key,text,w:week+1,reply});
    }));
    if(Math.floor(absMonth()/12)+1===1){
      (year1Story[S.month]||[]).forEach(beat=>rows.push({...beat,storyBeat:true}));
    }
    rows.push({cat:'system',mark:'◇',text:`${arc.label}：${arc.feed}`,w:1});
    rows.forEach((r,i)=>{
      const id=`scenario-${idx}-${i}`;
      const person=r.key?roster[r.key]:null;
      const post={m:idx,id,...r,who:r.who||(person?person.name:'ADHOMS'),profile:r.profile||(person?`${person.age} / ${person.role}`:'SYSTEM / 組織アカウント'),meta:`${y}-${String(S.month).padStart(2,'0')} / 第${r.w}週`,topic:scene.topic};
      // Update existing rows too: older layers can request a render during initialization.
      const existing=P.find(p=>p.id===id);
      if(existing)Object.assign(existing,post);else P.push(post);
    });
  }

  function card(post){
    const plus=!!S.likes[post.id], minus=!!S.minus?.[post.id];
    return `<article class="card ${post.cat}${post.storyBeat?' storyBeat':''}" data-id="${post.id}"${post.storyBeat?' data-story-beat="true"':''}><div class="head"><div class="mark">${post.mark}</div><div><div class="who">${post.who}${post.w===S.week?'<span class="newtag">今週</span>':''}</div><div class="profileLine">${post.profile}</div><div class="meta">${post.meta} ・ ${catLabel(post.cat)}${post.major?' / 今月の主要観測':''}</div></div></div>${post.reply?`<div class="replyto">↳ ${roster[post.reply].name} の観測を受けて</div>`:''}<div class="post">${esc(post.text)}</div><div class="acts"><button class="a ${plus?'on':''}" aria-label="＋" aria-pressed="${plus}" onclick="act('${post.id}','plus')">＋</button><button class="a neg ${minus?'on':''}" aria-label="−" aria-pressed="${minus}" onclick="act('${post.id}','minus')">−</button><button class="a" onclick="act('${post.id}','detail')">⌕ 詳細</button></div></article>`;
  }

  function monthPosts(){return P.filter(p=>p.m===absMonth() && String(p.id).startsWith('scenario-'));}
  renderFeed=function scriptedFeed(){
    seedScenarioPosts();
    const scene=current(), y=2028+S.year;
    const list=document.getElementById('feedList'); if(!list) return;
    const posts=monthPosts().filter(p=>p.w<=Math.min(S.week,4) && (S.filter==='ALL'||S.filter===p.cat));
    posts.sort((a,b)=>b.w-a.w || Number(b.major||false)-Number(a.major||false));
    list.innerHTML=posts.map(card).join('') || '<p class="feedEmpty">今週までに届いた、この分類の観測はありません。</p>';
    const title=document.querySelector('main .title'); if(title) title.textContent=`SOCIAL FEED — 倶利伽羅町 / ${y}年${S.month}月`;
    let marker=document.querySelector('.currentMonthMarker');
    if(!marker){marker=document.createElement('div');marker.className='currentMonthMarker';list.before(marker);}
    marker.innerHTML=`<b>${scene.topic}</b><span>第${Math.min(S.week,4)}週までの観測 ${posts.length}件 / ${year().label}</span>`;
  };

  function bubble(key,text){
    const s=staff[key];
    return `<div class="bubble"><div class="avatar">${s.name[0]}</div><div class="speech"><div class="speaker">${s.name} <span class="role">${s.role}</span></div><div class="meetingLine">${esc(text)}</div></div></div>`;
  }

  function quarterlyReview(){
    if(S.month%3!==0)return '';
    const fields={life:'暮らし',vital:'活力',future:'未来',tech:'技術',env:'環境'};
    return `<details class="quarterlyReview"><summary>四半期の観測重点を見直す（任意）</summary><p>いまの重点を続ける場合は、そのまま翌月へ進めます。制度や協定の具体的な判断は、関係する出来事の場面で行います。</p><div class="monthlyValues">${Object.entries(fields).map(([key,label])=>`<label>${label}<input type="range" min="20" max="100" value="${S.values[key]}" data-k="${key}"><span>${S.values[key]}</span></label>`).join('')}</div></details>`;
  }

  openMeeting=function scriptedMeeting(){
    const key=`${S.year}-${S.month}`;
    if(S.meetingDone[key]){nextMonth();return;}
    S.week=4;
    updateTop();
    renderFeed();
    const scene=current(), arc=year(), annual=S.month===3;
    document.getElementById('meetTitle').textContent=`${ym()} ${annual?'年次観測報告':'月次観測会議'}`;
    const posts=monthPosts();
    const marked=posts.filter(p=>S.likes[p.id]);
    const summary=[...new Map([...marked.slice(-2),...posts.filter(p=>p.w===4)].map(p=>[p.id,p])).values()];
    const observations=`<section class="meetingObservations"><h2>今月届いた声</h2><p>観測 ${posts.length}件 ／ 重点に置いた観測 ${marked.length}件。月末へ直接進んだ場合も、途中の経過をここで確認できます。</p>${summary.map(p=>`<blockquote><b>${p.who}・第${p.w}週</b><p>${esc(p.text)}</p></blockquote>`).join('')}</section>`;
    const thread=authored[S.month].dialogue.map(([speaker,text])=>bubble(speaker,text)).join('');
    const annualReport=annual?`<section class="annualReport reportBox"><h2>実証${Math.floor(absMonth()/12)+1}年目の引継ぎ</h2><p>${arc.feed}</p><p>通年の声から、行動を支えた関係と、まだ確認できていない条件を次年度へ残します。${absMonth()<12?'初年度は結論を急がず、町の人と暮らしを知るための記録を引き継ぎます。':''}</p><p>この年度の月次記録：${Object.keys(S.meetingDone).filter(k=>{const [y,m]=k.split('-').map(Number);return Math.floor(((y-1)*12+m-4)/12)===Math.floor(absMonth()/12);}).length+1}か月</p></section>`:'';
    document.getElementById('meetingBody').innerHTML=`<div class="meetingContext"><div class="eyebrow">${arc.label} / 今月の主要観測</div><div class="topic">${scene.topic}</div><p>河北恒研。今月の声を持ち寄り、次に確かめることを話し合う。</p></div><div class="meetingPrelude">${arc.meeting}</div>${observations}<div class="meetingThread">${thread}</div>${annualReport}${quarterlyReview()}<button class="meetingContinue" onclick="finishMeeting('${key}')">記録を引き継いで翌月へ →</button>`;
    document.querySelectorAll('.monthlyValues input').forEach(x=>{x.oninput=()=>x.nextElementSibling.textContent=x.value;});
    document.getElementById('meeting').classList.add('on');
  };

  const style=document.createElement('style');
  style.textContent='.profileLine{font-size:10px;color:#c4d5df;margin-top:2px}.currentMonthMarker{margin:2px 1px 10px;padding:8px 10px;border:1px solid #30485a;border-radius:10px;background:#0d161e;display:flex;justify-content:space-between;gap:8px;align-items:center}.currentMonthMarker b{font-size:12px}.currentMonthMarker span{font-size:9px;color:#8fa3b5;text-align:right}.meetingLine{color:#e4edf3;line-height:1.72}.meetingPrelude{margin:0 2px 14px;padding:11px 13px;border-left:2px solid #4f746f;color:#aebdca;font-size:12px;line-height:1.7;background:#0b1218}';
  document.head.appendChild(style);
  renderFeed();
})();
