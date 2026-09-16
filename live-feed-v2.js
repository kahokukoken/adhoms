(() => {
  const people = {
    transportMom:{name:'田中 美咲',age:'38歳',role:'主婦 / 子育て世帯'},
    commuter:{name:'山本 大輔',age:'44歳',role:'会社員 / 金沢方面へ通勤'},
    careWorker:{name:'中川 春香',age:'29歳',role:'介護職'},
    farmer:{name:'北村 誠',age:'67歳',role:'農家'},
    student:{name:'森川 葵',age:'17歳',role:'高校生'},
    transportOfficer:{name:'松本 達也',age:'46歳',role:'倶利伽羅町 交通政策係長'},
    disasterOfficer:{name:'斉藤 由佳',age:'35歳',role:'倶利伽羅町 防災担当主査'},
    shopkeeper:{name:'寺西 浩一',age:'58歳',role:'旧宿場地区 商店主'},
    cafeOwner:{name:'村田 真紀',age:'41歳',role:'飲食店主'},
    teacher:{name:'小林 亮',age:'39歳',role:'中学校教員'},
    doctor:{name:'高木 玲子',age:'50歳',role:'町内診療所 医師'},
    researcher:{name:'高橋 俊介',age:'52歳',role:'地域交通研究者'},
    reporter:{name:'石田 奈緒',age:'33歳',role:'北陸地域新聞 記者'},
    association:{name:'坂本 和夫',age:'71歳',role:'自治会長'},
    driver:{name:'西村 健太',age:'55歳',role:'路線バス運転手'},
    vtuber:{name:'クリカ',age:'年齢不詳',role:'ローカルVTuber'},
    nuisance:{name:'グレート・ノト',age:'年齢不詳',role:'動画配信者'}
  };

  const monthThemes = {
    4:{topic:'新年度の移動変化',tags:'新年度 / 交通 / 転入',posts:[
      ['resident','住','transportMom','transport','朝のバス、一本逃すと次までが長い。新学期になって送迎と通勤が重なる時間が前よりきつい。'],
      ['office','行','transportOfficer','transport','4月の利用実績を確認中です。新規転入世帯と通学利用を分けて、時間帯ごとの偏りを見ます。'],
      ['business','商','shopkeeper','commerce','春休み明けから平日の人通りがまた変わった。観光客より、毎日通る人の動きが店には効くね。'],
      ['influencer','V','vtuber','transport','【クリカ調査中】新年度で「前と同じ時間のバスに乗れない」って声が増えてる。どの地区で変わった？'],
      ['influencer','G','nuisance','transport','【突撃】終バス逃したら徒歩で帰れるのか、新年度一発目で試す。地元民からは普通に止められてる。']
    ]},
    5:{topic:'山際の変化と野生動物',tags:'野生動物 / 山際 / 耕作放棄地',posts:[
      ['resident','住','farmer','wildlife','畑の縁にイノシシの跡が増えた。去年より住宅側に寄ってきとる気がする。草刈りしてない区画も増えたし。'],
      ['office','行','disasterOfficer','wildlife','目撃件数だけでなく地点を整理しています。通報の多さと実際の危険度は分けて確認します。'],
      ['resident','住','careWorker','wildlife','夜勤帰りに山際の道を通るのが怖い。遠回りすると20分増えるので、使わないわけにもいかない。'],
      ['influencer','V','vtuber','wildlife','イノシシ目撃マップ更新。山際だけじゃなく、空き地のつながりも見た方がよさそう。情報ちょうだい。'],
      ['influencer','G','nuisance','wildlife','イノシシ出る場所に夜行けば会える説。配信予告したらコメント欄が「やめろ」で埋まった。']
    ]},
    6:{topic:'梅雨入りと排水',tags:'梅雨 / 排水 / 冠水',posts:[
      ['resident','住','commuter','rain','朝の雨で駅へ向かう道がまた冠水してた。同じ雨量でも、あそこだけ毎回ひどい気がする。'],
      ['office','行','disasterOfficer','rain','側溝の閉塞と低地の冠水履歴を照合します。河川水位だけで判断しないようにします。'],
      ['business','商','cafeOwner','rain','大雨の日は店の前より裏の搬入口が先に使えなくなる。配送が止まると営業にも響く。'],
      ['influencer','V','vtuber','rain','雨配信は中止。危ないから外に出ず、冠水地点は窓から分かる範囲か過去写真で送って。'],
      ['influencer','G','nuisance','rain','「危険だから来るな」って川、今どこまで増えてるか見に来た。切り抜きだけ伸び始めてる。']
    ]},
    7:{topic:'暑熱と生活圏',tags:'暑熱 / 高温 / 電力',posts:[
      ['resident','住','association','heat','昼間の集会所、今年は避暑で来る人が増えた。昔は会合の時しか使わんかったんだけどね。'],
      ['expert','専','doctor','heat','高齢者は「外出を控える」だけでは通院や買い物が止まります。移動手段と室温を一緒に見る必要があります。'],
      ['business','商','cafeOwner','heat','午後だけ客層が変わった。涼みに来て長く滞在する人が増えて、店の役割まで変わってきた感じ。'],
      ['influencer','V','vtuber','heat','クリカの暑さマップ作る。温度だけじゃなく「逃げ込める場所」も教えて。'],
      ['resident','住','student','heat','部活帰りのバス待ちが一番きつい。日陰がほぼない停留所、どうにかならんかな。']
    ]},
    8:{topic:'夏休みと地域活動',tags:'夏休み / 行事 / 担い手',posts:[
      ['resident','住','teacher','community','夏休み行事の手伝いが毎年同じ家庭に偏っています。参加者数だけ見ると盛況なんですが。'],
      ['resident','住','transportMom','community','子どもは楽しみにしてるけど、準備側になると平日夜の集まりがかなり重い。'],
      ['business','商','shopkeeper','community','イベントの日だけは人が来る。でも準備してる顔ぶれは10年前とあんまり変わらないね。'],
      ['influencer','V','vtuber','community','夏の地域行事、参加する側だけじゃなく「準備してる人」に話を聞いてみる。']
    ]},
    9:{topic:'八朔相撲と豪雨期',tags:'八朔相撲 / 豪雨 / 避難',posts:[
      ['resident','住','association','sumo','八朔相撲は今年もやりたい。ただ、雨が強くなった時に観客をどこへ逃がすかは詰めないといけない。'],
      ['office','行','disasterOfficer','sumo','開催可否だけでなく、開催中に避難へ切り替える条件と経路を確認しています。'],
      ['resident','住','student','sumo','相撲は好きだけど、大雨の時まで無理してやる必要はないと思う。でも無くなるのも嫌。'],
      ['influencer','V','vtuber','sumo','八朔相撲の準備を見せてもらう。雨の時どうするかも聞く予定。'],
      ['influencer','G','nuisance','sumo','八朔相撲に飛び入りしたらどこまで怒られるか検証、って企画出したら既に怒られてる。']
    ]},
    10:{topic:'収穫期と物流',tags:'収穫 / 農業 / 物流',posts:[
      ['resident','住','farmer','agri','米は穫れても人手と運ぶ車が足りん日がある。収量だけ見ても仕事は終わらん。'],
      ['business','商','shopkeeper','agri','地元の新米を置きたいけど、入荷日が読めないと売り場を組みにくい。'],
      ['office','行','transportOfficer','agri','農繁期の物流と生活交通が同じ道路・時間帯に集中する地点を確認します。'],
      ['influencer','V','vtuber','agri','収穫って「穫る」だけじゃないんだな。運ぶところまで追ってみる。']
    ]},
    11:{topic:'冬支度と高齢世帯',tags:'冬支度 / 除雪 / 高齢世帯',posts:[
      ['resident','住','association','snow','雪が降る前に助け合いの組み合わせを決めとかないと、降ってからでは遅い。'],
      ['resident','住','careWorker','snow','独居の利用者さんは、雪より「誰に頼めるか」で困り方が変わります。'],
      ['office','行','disasterOfficer','snow','除雪路線に加えて、通院・介護で止められない生活動線を確認します。'],
      ['influencer','V','vtuber','snow','冬支度回。去年詰まった道と、今年助けに行く人の話を聞いてみる。']
    ]},
    12:{topic:'年末商業と移動',tags:'年末 / 商業 / 帰省',posts:[
      ['business','商','shopkeeper','commerce','年末は人が戻るけど数日だけ。売上は増えても、普段の買い物環境が良くなるわけじゃない。'],
      ['resident','住','commuter','transport','帰省の車で道が混むと、普段の移動時間が読めなくなる。'],
      ['office','行','transportOfficer','transport','一時的な交通量増加と恒常的な需要を分けて整理します。'],
      ['influencer','V','vtuber','commerce','帰省した人に「地元で困ること」聞いてみる。住んでる人と違う答え出そう。']
    ]},
    1:{topic:'冬季交通と孤立',tags:'積雪 / 除雪 / 通院',posts:[
      ['resident','住','careWorker','snow','雪の日、訪問先までの最後の500mが一番困る。幹線が開いてても生活は止まります。'],
      ['resident','住','driver','snow','除雪が入る順番でバスの遅れ方が全然違う。時刻表より道路状態の方が支配的になる日がある。'],
      ['expert','専','doctor','snow','通院中断は積雪量だけでなく、送迎者の都合や歩行距離にも左右されます。'],
      ['influencer','V','vtuber','snow','雪の日の「行ける/行けない」マップ、道路だけじゃなく最後の徒歩区間も集めたい。']
    ]},
    2:{topic:'冬の維持負担',tags:'除雪費 / 燃料 / 高齢世帯',posts:[
      ['resident','住','transportMom','snow','灯油も除雪も上がって、冬だけ家計の形が別物になる。'],
      ['office','行','disasterOfficer','snow','必要な冬季支出と改善可能な非効率を分けて整理します。'],
      ['resident','住','farmer','snow','納屋までの除雪は自分でやるけど、年々きつくなる。金だけの話でもない。'],
      ['influencer','V','vtuber','snow','「冬にしか発生しない負担」募集。お金以外の手間も教えて。']
    ]},
    3:{topic:'年度末の先送り',tags:'施設更新 / 予算 / 未処理',posts:[
      ['office','行','transportOfficer','budget','今年度中に結論が出なかった交通案件を、継続年数と影響範囲で整理します。'],
      ['resident','住','teacher','budget','学校設備の修繕、また来年度検討になったものがあります。壊れてからでは遅いんですが。'],
      ['business','商','shopkeeper','budget','毎年「来年考える」って話、商店街でも増えた。先送りにも癖がつくね。'],
      ['influencer','V','vtuber','budget','年度末。「今年決まらなかったこと」を集めてみる。忘れたことにしないために。']
    ]}
  };

  function absoluteMonthIndex() {
    const offset = (S.month - 4 + 12) % 12;
    return (S.year - 1) * 12 + offset;
  }

  function ensureCurrentMonthPosts() {
    const idx = absoluteMonthIndex();
    const theme = monthThemes[S.month] || monthThemes[4];
    const year = 2028 + S.year;
    theme.posts.forEach((row, i) => {
      const [cat,mark,key,topic,text] = row;
      const person = people[key];
      const id = `live-${idx}-${i}`;
      if (P.some(p => p.id === id)) return;
      P.push({m:idx,w:1,id,cat,mark,who:person.name,profile:`${person.age} / ${person.role}`,meta:`${year}-${String(S.month).padStart(2,'0')} / 第1週`,topic,text});
    });
  }

  // Give older prototype people concrete identities too, so no human card remains anonymous.
  const fallbackByCat = {
    resident:['transportMom','commuter','careWorker','farmer','student','association'],
    office:['transportOfficer','disasterOfficer'],
    business:['shopkeeper','cafeOwner'],
    expert:['researcher','doctor','teacher'],
    media:['reporter'],
    influencer:['vtuber']
  };
  const cursors = {};
  P.forEach(post => {
    if (post.cat === 'system' || post.cat === 'report' || post.cat === 'event') {
      post.profile = post.profile || 'SYSTEM / 組織アカウント';
      return;
    }
    if (post.who === 'クリカ') { post.profile = '年齢不詳 / ローカルVTuber'; return; }
    if (post.who === 'グレート・ノト') { post.profile = '年齢不詳 / 動画配信者'; return; }
    const pool = fallbackByCat[post.cat];
    if (!pool) return;
    const n = cursors[post.cat] = (cursors[post.cat] || 0);
    const person = people[pool[n % pool.length]];
    cursors[post.cat]++;
    post.who = person.name;
    post.profile = `${person.age} / ${person.role}`;
  });

  const previousCardHTML = cardHTML;
  cardHTML = function profileCardHTML(post, depth = 0) {
    const html = previousCardHTML(post, depth);
    const profile = post.profile || (post.cat === 'system' ? 'SYSTEM / 組織アカウント' : '年齢不詳 / 立場確認中');
    return html.replace(`<div class="meta">${post.meta}`, `<div class="profileLine">${profile}</div><div class="meta">${post.meta}`);
  };

  const previousRenderFeed = renderFeed;
  renderFeed = function currentMonthRenderFeed() {
    ensureCurrentMonthPosts();
    previousRenderFeed();
    const idx = absoluteMonthIndex();
    document.querySelectorAll('#feedList .card[data-id]').forEach(card => {
      const post = P.find(p => p.id === card.dataset.id);
      if (!post) return;
      // Main FEED is the current observation window. Research/system cards generated this month remain visible.
      card.style.display = post.m === idx ? '' : 'none';
    });
    const title = document.querySelector('main .title');
    const theme = monthThemes[S.month] || monthThemes[4];
    if (title) title.textContent = `SOCIAL FEED — 倶利伽羅町 / ${2028 + S.year}年${S.month}月`;
    let marker = document.querySelector('.currentMonthMarker');
    if (!marker) {
      marker = document.createElement('div');
      marker.className = 'currentMonthMarker';
      document.getElementById('feedList')?.before(marker);
    }
    if (marker) marker.innerHTML = `<b>${theme.topic}</b><span>${theme.tags}</span>`;
  };

  const style = document.createElement('style');
  style.textContent = '.profileLine{font-size:10px;color:#c4d5df;margin-top:2px}.currentMonthMarker{margin:2px 1px 10px;padding:8px 10px;border:1px solid #30485a;border-radius:10px;background:#0d161e;display:flex;justify-content:space-between;gap:8px;align-items:center}.currentMonthMarker b{font-size:12px}.currentMonthMarker span{font-size:9px;color:#8fa3b5;text-align:right}';
  document.head.appendChild(style);

  renderFeed();
})();
