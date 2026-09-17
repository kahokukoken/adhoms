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
    2:{label:'適応の反作用',feed:'前年の対策が別の場所へ負担を移し始める。便利になった人と困り始めた人が同時に現れる。',meeting:'前年施策の効果だけでなく、押し出された負担を確認する。'},
    3:{label:'経路依存',feed:'二年分の選択が「今さら戻しにくい」状態を作り始める。住民も事業者も前提を変え始めた。',meeting:'三年目は現在値より、戻しにくくなった関係を優先して見る。'},
    4:{label:'政治と継承',feed:'町長任期の節目が近づき、同じ事実でも「成果」「失敗」の語られ方が分かれ始める。',meeting:'政策評価と実態を分ける。誰が次に引き継ぐかも状態の一部として扱う。'},
    5:{label:'最終実証年',feed:'最終年。5年間の積み重ねが、行事・豪雨・交通・高齢化の同時発生で試される。',meeting:'今年は単月最適化を禁止。5年間の履歴が壊れ方をどう変えたかを見る。'}
  };

  const months = {
    4:{topic:'新年度の移動変化',tags:'新年度 / 交通 / 転入',feed:[
      ['resident','住','misaki','朝のバス、一本逃すと次までが長い。新学期になって送迎と通勤が重なる時間が前よりきつい。'],
      ['office','行','matsumoto','4月の利用実績を確認中です。新規転入世帯と通学利用を分けて、時間帯ごとの偏りを見ます。'],
      ['influencer','V','kurika','新年度で「前と同じ時間のバスに乗れない」って声が増えてる。どの地区で変わった？'],
      ['influencer','G','great','【突撃】終バス逃したら徒歩で帰れるのか、新年度一発目で試す。地元民からは普通に止められてる。']
    ],order:['miyashita','fujii','mizuno','saeki'],meeting:{
      miyashita:'前年4月との単純比較は条件差を補正してからです。転入世帯、通学、通勤を分けない数字は、正直ほとんど役に立ちません。',
      fujii:'ちょ、ちょっと待って！　一個ずつ！　新しく来た人はバス停の場所から分からんのです。まず「制度を知らない困り方」と「便数が足りない困り方」を分けましょう。',
      mizuno:'古地図の道を今でも近道として使う人がいるんですよ。新旧の「当たり前」がぶつかる月ですね。',
      saeki:'Relationがまだ育っていない主体として見ると説明しやすいです。初期状態の違いがそのまま脆弱性になる。この立ち上がり方、ADHOMS的にはかなりかわいい。'
    }},
    5:{topic:'山際の変化と野生動物',tags:'野生動物 / 山際 / 耕作放棄地',feed:[
      ['resident','住','makoto','畑の縁にイノシシの跡が増えた。去年より住宅側に寄ってきとる気がする。草刈りしてない区画も増えたし。'],
      ['resident','住','haruka','夜勤帰りに山際の道を通るのが怖い。遠回りすると20分増えるので、使わないわけにもいかない。'],
      ['office','行','saito','目撃件数だけでなく地点を整理しています。通報の多さと実際の危険度は分けて確認します。'],
      ['influencer','G','great','イノシシ出る場所に夜行けば会える説。配信予告したらコメント欄が「やめろ」で埋まった。']
    ],order:['mizuno','fujii','miyashita','saeki'],meeting:{
      mizuno:'山際の空き地が増えると、人間には「使わなくなった土地」でも動物には通路になります。閉店告知を集めていても、人が引く前には周囲の動線が先に細るんですよ。似ています。',
      fujii:'夜の通報が増えとるんですけど、全部同じ危険度ではないんや。怖いって声は拾いつつ、実際に人とぶつかる場所から確認しましょう。',
      miyashita:'目撃件数だけでは結論になりません。通報しやすい地区ほど件数は増えます。地点、時間帯、土地利用を分けてください。',
      saeki:'目撃バイアスごと観測として持ちたいですね。人間活動の縮小と生息域の境界が同時に動いている。こういうズレ、残差で残した方がかわいいです。'
    }},
    6:{topic:'梅雨入りと排水',tags:'梅雨 / 排水 / 冠水',feed:[
      ['resident','住','daisuke','朝の雨で駅へ向かう道がまた冠水してた。同じ雨量でも、あそこだけ毎回ひどい気がする。'],
      ['business','商','murata','大雨の日は店の前より裏の搬入口が先に使えなくなる。配送が止まると営業にも響く。'],
      ['office','行','saito','側溝の閉塞と低地の冠水履歴を照合します。河川水位だけで判断しないようにします。'],
      ['influencer','V','kurika','雨配信は中止。危ないから外に出ず、冠水地点は窓から分かる範囲か過去写真で送って。']
    ],order:['fujii','miyashita','saeki','mizuno'],meeting:{
      fujii:'雨が降ってから「どこ詰まっとる？」って走り回るの、もうやめたいんです。側溝と避難路、晴れとるうちに一個ずつ見ましょう。',
      miyashita:'同じ雨量でも冠水する地点が違うなら、雨量以外の変数が効いています。排水容量、閉塞、標高差を分けます。',
      saeki:'閾値を超えた瞬間に挙動が変わるタイプですね。線形で扱うと外します。本当はここから長いんですけど、省きます。',
      mizuno:'昔の水路を古地図で見ると、今の道路と微妙にずれて残っています。水って昔の地形を忘れてない感じがしますね。'
    }},
    7:{topic:'暑熱と生活圏',tags:'暑熱 / 高温 / 電力',feed:[
      ['resident','住','sakamoto','昼間の集会所、今年は避暑で来る人が増えた。昔は会合の時しか使わんかったんだけどね。'],
      ['expert','専','takagi','高齢者は「外出を控える」だけでは通院や買い物が止まります。移動手段と室温を一緒に見る必要があります。'],
      ['business','商','murata','午後だけ客層が変わった。涼みに来て長く滞在する人が増えて、店の役割まで変わってきた感じ。'],
      ['resident','住','aoi','部活帰りのバス待ちが一番きつい。日陰がほぼない停留所、どうにかならんかな。']
    ],order:['saeki','fujii','miyashita','mizuno'],meeting:{
      saeki:'暑熱を気温だけにすると取りこぼします。電力、移動、社会接触の三つが絡む。複数系が同時にゆっくり悪くなる挙動、ADHOMSとしてはかわいいです。',
      fujii:'かわいい言うとる場合じゃないですよ。外出控えてで終わると通院できん人が出ます。涼める場所と移動手段、セットで見ましょう。',
      miyashita:'平均気温ではなく時間帯別、屋内外、年齢層別に見ます。「暑かった」で一括りにしないでください。',
      mizuno:'暑い日は人が寄る店が変わるんですよ。閉店告知を撮りに歩いてても、夏だけ妙に人がいる休憩所がある。生活圏が季節で組み替わっています。'
    }},
    8:{topic:'夏休みと地域活動',tags:'夏休み / 行事 / 担い手',feed:[
      ['expert','専','kobayashi','夏休み行事の手伝いが毎年同じ家庭に偏っています。参加者数だけ見ると盛況なんですが。'],
      ['resident','住','misaki','子どもは楽しみにしてるけど、準備側になると平日夜の集まりがかなり重い。'],
      ['business','商','teranishi','イベントの日だけは人が来る。でも準備してる顔ぶれは10年前とあんまり変わらないね。'],
      ['influencer','V','kurika','夏の地域行事、参加する側だけじゃなく「準備してる人」に話を聞いてみる。']
    ],order:['mizuno','saeki','fujii','miyashita'],meeting:{
      mizuno:'祭りや夏休み行事は、参加者より準備している人を見ると地域の骨格が出ます。閉店告知と同じで、「続ける人」が減る時は前兆があります。',
      saeki:'担い手の集中度をRelation側で持ちたいです。参加人数が多くても、裏方が三人に集中してたら脆い。そういう見かけと実態のズレはかわいい。',
      fujii:'またかわいいって言っとる…。で、実際に今年も同じ人に仕事が寄ってます。頼む順番から変えんと回らんです。',
      miyashita:'参加者数を成功指標にしない点は同意します。準備時間、担当重複、代替可能人数を出してください。'
    }},
    9:{topic:'八朔相撲と豪雨期',tags:'八朔相撲 / 豪雨 / 避難',feed:[
      ['resident','住','sakamoto','八朔相撲は今年もやりたい。ただ、雨が強くなった時に観客をどこへ逃がすかは詰めないといけない。'],
      ['office','行','saito','開催可否だけでなく、開催中に避難へ切り替える条件と経路を確認しています。'],
      ['resident','住','aoi','相撲は好きだけど、大雨の時まで無理してやる必要はないと思う。でも無くなるのも嫌。'],
      ['influencer','G','great','八朔相撲に飛び入りしたらどこまで怒られるか検証、って企画出したら既に怒られてる。']
    ],order:['fujii','mizuno','saeki','miyashita'],meeting:{
      fujii:'八朔相撲、やるかやらんかだけで揉めても進まんです。途中で雨が強くなった時、誰が止めてどこへ逃がすかまで決めましょう。',
      mizuno:'残したい文化と安全は敵同士じゃないですよ。昔から形を変えながら残ってきた行事なら、今回も変え方を考えればいい。',
      saeki:'行事と豪雨を別イベントにしない方がいいです。道路、人員、避難先という共有資源が同時に詰まる。ここ、ADHOMSが一番おもしろくなるところです。',
      miyashita:'「開催」「中止」の二択で評価しません。降雨強度、観客数、避難完了時間の組み合わせを確認します。'
    }},
    10:{topic:'収穫期と物流',tags:'収穫 / 農業 / 物流',feed:[
      ['resident','住','makoto','米は穫れても人手と運ぶ車が足りん日がある。収量だけ見ても仕事は終わらん。'],
      ['business','商','teranishi','地元の新米を置きたいけど、入荷日が読めないと売り場を組みにくい。'],
      ['office','行','matsumoto','農繁期の物流と生活交通が同じ道路・時間帯に集中する地点を確認します。'],
      ['influencer','V','kurika','収穫って「穫る」だけじゃないんだな。運ぶところまで追ってみる。']
    ],order:['miyashita','mizuno','fujii','saeki'],meeting:{
      miyashita:'収量だけでは農業の状態を説明できません。収穫、人手、輸送、販売を分けます。どこか一つが止まれば結果は変わります。',
      mizuno:'店の閉店告知を見てると、「売れない」より前に「仕入れが続かない」が出ることがあるんです。物流の細り方を見たいですね。',
      fujii:'農繁期だけ車も人も足りん日があるんや。曜日と時間を切って、困る場所から拾いましょう。',
      saeki:'ボトルネックが月ごとに移動する系ですね。固定の「農業力」みたいな一変数に潰さない方がかわいいです。'
    }},
    11:{topic:'冬支度と高齢世帯',tags:'冬支度 / 除雪 / 高齢世帯',feed:[
      ['resident','住','sakamoto','雪が降る前に助け合いの組み合わせを決めとかないと、降ってからでは遅い。'],
      ['resident','住','haruka','独居の利用者さんは、雪より「誰に頼めるか」で困り方が変わります。'],
      ['office','行','saito','除雪路線に加えて、通院・介護で止められない生活動線を確認します。'],
      ['influencer','V','kurika','冬支度回。去年詰まった道と、今年助けに行く人の話を聞いてみる。']
    ],order:['saeki','miyashita','fujii','mizuno'],meeting:{
      saeki:'冬支度は雪が降る前から状態遷移が始まってます。助け合い関係が事前に組めているかが効く。見えない準備期間を持たせたいです。',
      miyashita:'除雪距離だけではなく、通院・介護・買い物の必須動線を別にしてください。必要性の違いを平均化しないでください。',
      fujii:'降ってから電話しても遅いんです。誰が誰んとこ行くか、今のうちに決めとかんと。',
      mizuno:'冬前の閉店告知って、実は雪の負担が理由に滲むことがあります。店だけじゃなく、人の暮らしにも同じことが起きます。'
    }},
    12:{topic:'年末商業と移動',tags:'年末 / 商業 / 帰省',feed:[
      ['business','商','teranishi','年末は人が戻るけど数日だけ。売上は増えても、普段の買い物環境が良くなるわけじゃない。'],
      ['resident','住','daisuke','帰省の車で道が混むと、普段の移動時間が読めなくなる。'],
      ['office','行','matsumoto','一時的な交通量増加と恒常的な需要を分けて整理します。'],
      ['influencer','V','kurika','帰省した人に「地元で困ること」聞いてみる。住んでる人と違う答え出そう。']
    ],order:['mizuno','miyashita','saeki','fujii'],meeting:{
      mizuno:'年末だけ戻ってくる人を見ると、町の外から見た不便さが出ます。住んでいる人が慣れて見落としていることを言ってくれる。',
      miyashita:'一時的な帰省人口と恒常人口を混ぜないでください。短期増加を「活性化」と呼ぶのは早いです。',
      saeki:'外部から戻る主体が一時的にネットワークを繋ぎ直す。Memoryの差が観測できる月ですね。こういう季節性、かわいいです。',
      fujii:'年末の渋滞で普段のバスまで遅れるんです。臨時の混雑と日常の足、分けて考えんと。'
    }},
    1:{topic:'冬季交通と孤立',tags:'積雪 / 除雪 / 通院',feed:[
      ['resident','住','haruka','雪の日、訪問先までの最後の500mが一番困る。幹線が開いてても生活は止まります。'],
      ['resident','住','nishimura','除雪が入る順番でバスの遅れ方が全然違う。時刻表より道路状態の方が支配的になる日がある。'],
      ['expert','専','takagi','通院中断は積雪量だけでなく、送迎者の都合や歩行距離にも左右されます。'],
      ['influencer','V','kurika','雪の日の「行ける/行けない」マップ、道路だけじゃなく最後の徒歩区間も集めたい。']
    ],order:['miyashita','saeki','fujii','mizuno'],meeting:{
      miyashita:'積雪量だけを見ないでください。同じ積雪でも通行不能時間が違います。除雪開始時刻と生活動線を分けます。',
      saeki:'幹線が開いていても最後の500mが閉じていると生活は止まる。ネットワークの末端が効く典型例ですね。かわいい。',
      fujii:'だから最後の道が大事なんですって。通院先まで「ほぼ行ける」は行けるに入らんのです。',
      mizuno:'雪の日は普段見えない助け合いが急に見えます。誰が誰の家の前を掘るか、そこに関係性が出ますね。'
    }},
    2:{topic:'冬の維持負担',tags:'除雪費 / 燃料 / 高齢世帯',feed:[
      ['resident','住','misaki','灯油も除雪も上がって、冬だけ家計の形が別物になる。'],
      ['office','行','saito','必要な冬季支出と改善可能な非効率を分けて整理します。'],
      ['resident','住','makoto','納屋までの除雪は自分でやるけど、年々きつくなる。金だけの話でもない。'],
      ['influencer','V','kurika','「冬にしか発生しない負担」募集。お金以外の手間も教えて。']
    ],order:['fujii','mizuno','miyashita','saeki'],meeting:{
      fujii:'除雪費だけ見て「高い」言われても困るんです。削ったら止まる場所があるんやから、まずそこ分けましょう。',
      mizuno:'冬だけ続けられなくなる店の閉店告知、何枚かあります。費用より、体力や人手が最後の一押しになることも多い。',
      miyashita:'必要支出と非効率を同じ赤字で扱わないでください。機能維持への寄与を分けます。',
      saeki:'コスト最小化だけにすると、社会機能を削って数字を良くする最悪の最適化ができます。ADHOMSにはさせたくないですね。'
    }},
    3:{topic:'年度末の先送り',tags:'施設更新 / 予算 / 未処理',feed:[
      ['office','行','matsumoto','今年度中に結論が出なかった交通案件を、継続年数と影響範囲で整理します。'],
      ['expert','専','kobayashi','学校設備の修繕、また来年度検討になったものがあります。壊れてからでは遅いんですが。'],
      ['business','商','teranishi','毎年「来年考える」って話、商店街でも増えた。先送りにも癖がつくね。'],
      ['influencer','V','kurika','年度末。「今年決まらなかったこと」を集めてみる。忘れたことにしないために。']
    ],order:['saeki','miyashita','mizuno','fujii'],meeting:{
      saeki:'先送りが積み上がると状態じゃなく履歴が効き始めます。Memoryの出番です。こういう経路依存、かなりかわいい。',
      miyashita:'未処理件数より継続年数を見ます。同じ一件でも一年延期と五年延期では意味が違います。',
      mizuno:'閉店告知でも「長年検討してきましたが」という文面、よくあるんですよ。決断の遅れ自体が地域の空気になる。',
      fujii:'年度末に全部いっぺんに来るの、ほんとやめてほしいんですけど！　一個ずつ優先順位つけましょう。'
    }}
  };

  function absMonth(){ return (S.year - 1) * 12 + ((S.month - 4 + 12) % 12); }
  function current(){ return months[S.month] || months[4]; }
  function year(){ return yearArcs[Math.min(5,Math.max(1,S.year))] || yearArcs[5]; }

  function seedScenarioPosts(){
    const scene=current(), arc=year(), idx=absMonth(), y=2028+S.year;
    const rows=[...scene.feed,['system','◇',null,`${arc.label}：${arc.feed}`]];
    rows.forEach((r,i)=>{
      const [cat,mark,key,text]=r, id=`scenario-${idx}-${i}`;
      if(P.some(p=>p.id===id)) return;
      const person=key?roster[key]:null;
      P.push({m:idx,w:1,id,cat,mark,who:person?person.name:'ADHOMS',profile:person?`${person.age} / ${person.role}`:'SYSTEM / 組織アカウント',meta:`${y}-${String(S.month).padStart(2,'0')} / 第1週`,topic:scene.topic,text});
    });
  }

  function card(post){
    const plus=!!S.likes[post.id], minus=!!S.minus?.[post.id], follow=!!S.follow[post.who];
    return `<div class="card ${post.cat}" data-id="${post.id}"><div class="head"><div class="mark">${post.mark}</div><div><div class="who">${post.who}</div><div class="profileLine">${post.profile}</div><div class="meta">${post.meta} ・ ${catLabel(post.cat)}</div></div></div><div class="post">${post.text}</div><div class="acts"><button class="a ${plus?'on':''}" aria-label="＋" onclick="act('${post.id}','plus')">＋</button><button class="a neg ${minus?'on':''}" aria-label="−" onclick="act('${post.id}','minus')">−</button><button class="a fl ${follow?'on':''}" onclick="act('${post.id}','follow')">＋ フォロー</button><button class="a" onclick="act('${post.id}','detail')">⌕ 詳細</button></div></div>`;
  }

  renderFeed=function scriptedFeed(){
    seedScenarioPosts();
    const scene=current(), idx=absMonth(), y=2028+S.year;
    const list=document.getElementById('feedList'); if(!list) return;
    const posts=P.filter(p=>p.m===idx && String(p.id).startsWith('scenario-'));
    list.innerHTML=posts.map(card).join('');
    const title=document.querySelector('main .title'); if(title) title.textContent=`SOCIAL FEED — 倶利伽羅町 / ${y}年${S.month}月`;
    let marker=document.querySelector('.currentMonthMarker');
    if(!marker){marker=document.createElement('div');marker.className='currentMonthMarker';list.before(marker);}
    marker.innerHTML=`<b>${scene.topic}</b><span>${scene.tags} / ${year().label}</span>`;
  };

  function bubble(key,text){
    const s=staff[key];
    return `<div class="bubble"><div class="avatar">${s.name[0]}</div><div class="speech"><div class="speaker">${s.name} <span class="role">${s.role}</span><span class="staffCue">${s.cue}</span></div><div class="meetingLine">${text}</div></div></div>`;
  }

  openMeeting=function scriptedMeeting(){
    const key=`${S.year}-${S.month}`;
    if(S.meetingDone[key]){nextMonth();return;}
    const scene=current(), arc=year(), y=2028+S.year;
    document.getElementById('meetTitle').textContent=`${ym()} 月例報告会`;
    const thread=scene.order.map(k=>bubble(k,scene.meeting[k])).join('') + `<div class="bubble"><div class="avatar">◇</div><div class="speech hms"><div class="speaker">ADHOMS <span class="role">SYSTEM</span></div><div class="meetingLine">${arc.meeting} 今月の主要観測「${scene.topic}」を、次月へ引き継ぐ関係と一時的な季節要因に分けて保持します。</div></div></div>`;
    document.getElementById('meetingBody').innerHTML=`<div class="meetingContext"><div class="eyebrow">${arc.label} / 今月の主要観測</div><div class="topic">${scene.topic}</div><p>${y}年${S.month}月。1か月分のFEEDを閉じ、河北恒研の月例報告会を始める。</p></div><div class="meetingPrelude"><b>${scene.tags}</b><br>投稿、調査、＋/−で重み付けした観測を持ち寄り、4人が別々の視点から食い違いを確認する。</div><div class="meetingThread">${thread}</div><div class="monthlyValues"><b>VALUE PRIORITIES</b><label>暮らし<input type="range" min="20" max="100" value="${S.values.life}" data-k="life"><span>${S.values.life}</span></label><label>活力<input type="range" min="20" max="100" value="${S.values.vital}" data-k="vital"><span>${S.values.vital}</span></label><label>未来<input type="range" min="20" max="100" value="${S.values.future}" data-k="future"><span>${S.values.future}</span></label><label>技術<input type="range" min="20" max="100" value="${S.values.tech}" data-k="tech"><span>${S.values.tech}</span></label><label>環境<input type="range" min="20" max="100" value="${S.values.env}" data-k="env"><span>${S.values.env}</span></label></div><button class="meetingContinue" onclick="finishMeeting('${key}')">設定を保存して翌月へ →</button>`;
    document.querySelectorAll('.monthlyValues input').forEach(x=>{x.oninput=()=>x.nextElementSibling.textContent=x.value;});
    document.getElementById('meeting').classList.add('on');
  };

  const style=document.createElement('style');
  style.textContent='.profileLine{font-size:10px;color:#c4d5df;margin-top:2px}.currentMonthMarker{margin:2px 1px 10px;padding:8px 10px;border:1px solid #30485a;border-radius:10px;background:#0d161e;display:flex;justify-content:space-between;gap:8px;align-items:center}.currentMonthMarker b{font-size:12px}.currentMonthMarker span{font-size:9px;color:#8fa3b5;text-align:right}.meetingLine{color:#e4edf3;line-height:1.72}.meetingPrelude{margin:0 2px 14px;padding:11px 13px;border-left:2px solid #4f746f;color:#aebdca;font-size:12px;line-height:1.7;background:#0b1218}';
  document.head.appendChild(style);
  renderFeed();
})();
