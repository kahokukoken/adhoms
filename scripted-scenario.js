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

  // V1-11: research is keyed to the current authored topic, never to obsolete
  // p1/p11 demo IDs. A + mark can therefore trigger investigation on the
  // actual scenario-* cards the player is reading.
  const RESEARCH_BY_TOPIC = {
    '新年度の移動変化':{title:'新年度の移動条件を確認',delay:1,result:'通勤・通学のピークと既存ダイヤのずれに加え、新規転入世帯は代替経路の認知が低い。便数だけでなく、時間帯と情報到達を分けて追う必要がある。'},
    '山際の変化と野生動物':{title:'野生動物の目撃分布を確認',delay:1,result:'目撃は山際・耕作放棄地周辺へ偏っている。住宅地全体で一様に増えたのではなく、人の利用が薄くなった境界との重なりが大きい。'},
    '梅雨入りと排水':{title:'冠水・排水条件を確認',delay:1,result:'河川水位より先に、一部側溝の閉塞と低地の排水能力差が効いている。搬入口・避難路など、同じ雨でも先に機能を失う場所が違う。'},
    '暑熱と生活圏':{title:'暑熱時の生活圏変化を確認',delay:1,result:'外出抑制だけでは通院・買物が止まる。日陰・冷房・移動手段の有無で、同じ気温でも生活継続への影響が分かれる。'},
    '夏休みと地域活動':{title:'地域行事の担い手偏りを確認',delay:2,result:'参加者数は維持されても、準備作業は少数の家庭・固定メンバーへ集中している。盛況と運営持続性を別に評価する必要がある。'},
    '八朔相撲と豪雨期':{title:'八朔相撲の運営・避難条件を確認',delay:1,result:'開催可否だけでは不十分。設営人員、途中中断の判断、観客の退避先、道路冠水が同じ時間帯に競合する。'},
    '収穫期と物流':{title:'収穫期の物流制約を確認',delay:1,result:'収量より、収穫人員・集荷車両・道路利用時間帯の重なりがボトルネックになる日がある。生産量と出荷可能量は一致しない。'},
    '冬支度と高齢世帯':{title:'冬季支援の依存関係を確認',delay:1,result:'積雪量だけでなく「誰に頼めるか」で生活継続性が変わる。除雪・通院・介護の支援者が同じ人へ集中する世帯がある。'},
    '年末商業と移動':{title:'年末の一時需要を確認',delay:1,result:'帰省で短期的な売上・交通量は増えるが、恒常的な生活サービス需要とは一致しない。一時人口と常住者の条件を分ける必要がある。'},
    '冬季交通と孤立':{title:'冬季の最後の移動区間を確認',delay:1,result:'幹線除雪後も、停留所から自宅・訪問先までの徒歩区間が残る。道路開通と生活上の到達可能性は一致しない。'},
    '冬の維持負担':{title:'冬季負担の内訳を確認',delay:1,result:'燃料・除雪費だけでなく、作業時間・身体負荷・支援依頼の調整が世帯ごとに異なる。平均支出だけでは負担差を説明できない。'},
    '年度末の先送り':{title:'未処理案件の継続年数を確認',delay:2,result:'単年の未処理件数より、複数年度にまたがる延期が一部案件へ集中している。延期期間そのものが次の選択肢を狭めている。'}
  };

  function researchRows(idx){
    const rows=[];
    (S.research||[]).forEach(item=>{
      if(!item || !Number.isFinite(item.due) || idx<item.due)return;
      if(!Number.isFinite(item.completedMonth)){
        item.completedMonth=idx;
        item.done=true;
      }
      if(item.completedMonth!==idx)return;
      rows.push({
        id:'research-'+String(item.id).replace(/[^a-z0-9_-]+/gi,'-')+'-'+idx,
        cat:'expert',mark:'調',who:'河北恒研・調査報告',
        profile:'内部調査 / ＋観測から自動調査',
        text:item.title+'：'+item.result,w:1,major:true,researchBeat:true,topic:item.topic
      });
    });
    return rows;
  }

  // V1-08: delayed social returns. These are deliberately sparse: the player
  // should see a prior decision come back through people and institutions,
  // rather than reading the light-state variables directly.
  const HISTORY_REACTIONS = [
    {index:16,flag:'y2_flood:early_close',row:{cat:'business',mark:'返',who:'駅側低地・商店会',profile:'組織アカウント / 商業・生活圏',text:'早めに道路を止めたので事故は出なかった。ただ、夕方の客足はそのまま消えた。「安全だった」と「負担がなかった」は別の記録にしてほしい。'},dialogue:[['mizuno','通行止めで守れたものと、商売側に残った損失が同じ日にあります。'],['miyashita','事故ゼロだけを成功値にすると、その負担は観測から落ちます。']]},
    {index:16,flag:'y2_flood:guided_watch',row:{cat:'resident',mark:'返',who:'駅側低地・利用者',profile:'組織アカウント / 住民聞き取り',text:'係員が「ここまでは通れる」と言ってくれたので動けた。全部止めるより助かったけど、判断する人が現場にいない日も同じようにできるのかは気になる。'},dialogue:[['fujii','現地誘導は効きました。でも、毎回そこに人を置ける前提にはできません。'],['saeki','成功条件に「現場判断できる人がいた」を残します。再現できるかは別です。']]},
    {index:16,flag:'y2_flood:hard_warning',row:{cat:'resident',mark:'返',who:'観測端末利用者',profile:'組織アカウント / 住民聞き取り',text:'今回は強い警告を見て早めに動けた。でも最近「重要」通知が増えて、家族はまたかって見なくなってる。次も同じ強さで届くかは分からない。'},dialogue:[['miyashita','初動は早まりました。同時に、警告を読む確率が下がる兆候も出ています。'],['mizuno','一回効いた強さを、そのまま繰り返せばいいわけではないですね。']]},
    {index:16,flag:'y2_flood:logistics_detour',row:{cat:'resident',mark:'返',who:'迂回路沿線',profile:'組織アカウント / 住民聞き取り',text:'トラックは止まらなかったらしい。でも、その分こっちの生活道路に車が流れてきた。物流が守れたことと、ここの負担が増えたことは両方残して。'},dialogue:[['fujii','物流は維持できました。代わりに生活道路へ車を押し出しています。'],['mizuno','「止まらなかった」の外側に、別の人の混雑ができていますね。']]},

    {index:20,flag:'y2_wildlife:capture',row:{cat:'resident',mark:'返',who:'山際地区',profile:'組織アカウント / 住民聞き取り',text:'この辺の被害は減った。でも森林公園側で目撃が増えたって聞く。いなくなったんじゃなくて、出る場所が変わっただけかもしれん。'},dialogue:[['mizuno','対象地区では改善しています。同時に、目撃地点が別側へ移りました。'],['miyashita','町全体の件数と地区別分布を分けます。局所成功を全体成功にはしません。']]},
    {index:20,flag:'y2_wildlife:fence',row:{cat:'resident',mark:'返',who:'防護柵周辺',profile:'組織アカウント / 住民聞き取り',text:'柵を入れた畑は助かった。けど隣の通学路側に足跡が出た。壁を作ったら、向こうが消えるんじゃなくて回り込むんだな。'},dialogue:[['saeki','侵入点は減りましたが、移動経路が変わっています。'],['fujii','守った場所の外まで見ないと、対策完了って言えんですね。']]},
    {index:20,flag:'y2_wildlife:food_source',row:{cat:'resident',mark:'返',who:'山際地区',profile:'組織アカウント / 住民聞き取り',text:'最初は地味だと思ったけど、ゴミ置き場を変えてから寄ってくる回数が少し減った。すぐ効かない対策は、効く前にやめない仕組みも要る。'},dialogue:[['miyashita','即効性は弱いですが、頻度は下がり始めています。'],['mizuno','遅れて効く施策は、途中評価だけだと失敗扱いされやすいですね。']]},
    {index:20,flag:'y2_wildlife:restrict',row:{cat:'resident',mark:'返',who:'学校周辺・保護者',profile:'組織アカウント / 住民聞き取り',text:'通学路の制限で安心はした。でも送迎が増えて仕事の時間が削られた家もある。安全にした結果、誰がその時間を払ったかも見てほしい。'},dialogue:[['fujii','危険回避は早かった。その分、送迎負担が家庭へ移っています。'],['mizuno','制限の効果と、生活時間の負担を一緒に残しましょう。']]},
    {index:20,flag:'y2_wildlife:survey',row:{cat:'expert',mark:'返',who:'高専系フィールドラボ',profile:'組織アカウント / 技術協力',text:'生息域調査の記録から、次にセンサーを置く場所が絞れた。被害を止める即効策ではなかったけど、次の判断に使える地図が残った。'},dialogue:[['saeki','調査が次の観測点配置に効いています。何もしなかった期間ではありません。'],['miyashita','成果を「被害件数」だけで測らず、次の選択肢が増えたことも残します。']]},

    {index:23,flag:'y2_snow:trunk_first',row:{cat:'resident',mark:'返',who:'生活道路側',profile:'組織アカウント / 住民聞き取り',text:'幹線は早く開いた。救急も物流も助かったと思う。でも家の前は最後まで残った。「町は動いた」と言われると、こっちは動けなかったって言いたくなる。'},dialogue:[['mizuno','町全体の機能維持と、生活道路側の感覚が食い違っています。'],['miyashita','平均の移動時間だけでなく、動けなかった世帯を別に残します。']]},
    {index:23,flag:'y2_snow:welfare_first',row:{cat:'business',mark:'返',who:'工場・物流事業者',profile:'組織アカウント / 事業者聞き取り',text:'学校と医療が優先なのは分かる。でも人も荷物も遅れた。反対したいわけじゃないから、次は「どこまで遅れるか」を先に共有してほしい。'},dialogue:[['fujii','福祉側は助かりました。工場側は、優先順位そのものより見通しがないことに困っています。'],['mizuno','説明と予告で減らせる負担もありそうです。補償だけの話ではない。']]},
    {index:23,flag:'y2_snow:distributed',row:{cat:'office',mark:'返',who:'倶利伽羅町・冬季運用',profile:'組織アカウント / 行政',text:'地区分散で「完全に置いていかれた」地域は減った。一方、どこも決定的には早くならず、救急・物流からは優先順位を明確にしてほしいという声が残った。'},dialogue:[['miyashita','公平感は上がりましたが、重要機能の速度は伸びていません。'],['fujii','公平と一律は同じじゃない。次は止められない機能だけ別に見ます。']]},
    {index:23,flag:'y2_snow:schedule_shift',row:{cat:'business',mark:'返',who:'町内事業者',profile:'組織アカウント / 事業者聞き取り',text:'早めの時差出勤要請で混乱は減った。ただ、勤務変更できない職種まで同じ扱いだと困る。次は「変えられる仕事」と「変えられない仕事」を分けてほしい。'},dialogue:[['mizuno','行動開始は早まりました。でも変更できない職種に負担が集中しています。'],['saeki','勤務を一つの属性にせず、変更可能性を条件として持たせます。']]}
  ];

  const COMMAND_LABELS = {
    priority_fuel:'優先給油',
    open_warehouse:'倉庫開放',
    deploy_drone_relay:'高専通信・ドローン中継',
    open_school_ground:'学校グラウンド仮設避難',
    deploy_mobile_command:'移動指令所',
    deploy_portable_shelter:'可搬避難所'
  };

  function historyContextRows(idx){
    const state=window.ADHOMS_LIGHT_STATE;
    if(!state)return [];
    const out=[];
    HISTORY_REACTIONS.filter(def=>def.index===idx&&state.flags?.[def.flag]).forEach(def=>{
      out.push({...def.row,id:`history-${idx}-${def.flag.replace(/[^a-z0-9]+/gi,'-')}`,w:1,major:true,historyBeat:true,sourceFlag:def.flag});
    });

    // After Year 3's side-effect acknowledgement, put the propagated effects
    // back into ordinary FEED instead of leaving them only in the modal report.
    if(idx===25&&window.ADHOMS_VER1_PROPAGATION){
      window.ADHOMS_VER1_PROPAGATION.SIDE_EFFECT_RULES
        .filter(rule=>state.flags?.[`resolved:${rule.id}`])
        .slice(0,3)
        .forEach((rule,n)=>out.push({
          id:`history-y3-${rule.id}`,cat:'system',mark:'返',who:'河北恒研・前年施策追跡',
          profile:'SYSTEM / Relation・Memory',text:rule.summary,w:n+1,major:true,historyBeat:true
        }));
    }

    if(idx===36&&window.ADHOMS_VER1_PROPAGATION){
      const result=window.ADHOMS_VER1_PROPAGATION.cooperationOffers(state);
      if(result.offers.length){
        out.push({id:'history-y4-offers',cat:'business',mark:'協',who:'町内協力提案',profile:'組織アカウント / Relationから生まれた手札',w:1,major:true,historyBeat:true,
          text:'これまでの対応を踏まえ、協力提案が届いた：'+result.offers.map(x=>x.label).join('／')});
      }
      if(result.resistance.length){
        out.push({id:'history-y4-resistance',cat:'resident',mark:'拒',who:'地区側の反応',profile:'組織アカウント / Burden Memory',w:2,major:true,historyBeat:true,
          text:'一方で、過去の負担から協力に慎重な反応も残る：'+result.resistance.map(x=>x.label).join('／')});
      }
    }

    if(idx===38){
      const strategy=Object.keys(state.flags||{}).find(key=>key.startsWith('y4_strategy:')&&state.flags[key]);
      if(strategy){
        const commands=window.ADHOMS_VER1_DISASTER?.availableEmergencyCommands(state)||[];
        const visible=commands.filter(x=>COMMAND_LABELS[x]).map(x=>COMMAND_LABELS[x]);
        out.push({id:'history-y4-hand',cat:'system',mark:'手',who:'T-0WA / 利用可能領域',profile:'SYSTEM / Future Capability',w:1,major:true,historyBeat:true,
          text:'過去のRelationと4年目方針から、現在の手札が更新された。'+(visible.length?' 利用可能：'+visible.join('／'):' 追加の協力資源はまだ限定的。')});
      }
    }
    return out;
  }

  function historyMeetingLines(idx){
    const state=window.ADHOMS_LIGHT_STATE;
    if(!state)return [];
    const def=HISTORY_REACTIONS.find(item=>item.index===idx&&state.flags?.[item.flag]);
    if(def)return def.dialogue||[];
    if(idx===25&&state.flags?.y3_ack)return [
      ['mizuno','前年の施策が、別の地区や別の立場から返ってきています。成功／失敗の一語で閉じない方がいい。'],
      ['miyashita','直接効果と二次影響を同じ履歴に結びます。次の修正が、何への修正なのか追えるようにします。']
    ];
    if(idx===36&&window.ADHOMS_VER1_PROPAGATION){
      const r=window.ADHOMS_VER1_PROPAGATION.cooperationOffers(state);
      return [
        ['fujii',`協力の申し出が${r.offers.length}件、慎重・拒否側の反応が${r.resistance.length}件。設備の数じゃなく、今頼める相手の数が変わってます。`],
        ['mizuno','去年までの説明や負担が、そのまま今年の選択可能領域になっていますね。']
      ];
    }
    return [];
  }

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
    historyContextRows(idx).forEach(beat=>rows.push(beat));
    researchRows(idx).forEach(beat=>rows.push(beat));
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
    return `<article class="card ${post.cat}${post.storyBeat?' storyBeat':''}${post.historyBeat?' historyBeat':''}${post.researchBeat?' researchBeat':''}" data-id="${post.id}"${post.storyBeat?' data-story-beat="true"':''}${post.historyBeat?' data-history-beat="true"':''}${post.researchBeat?' data-research-beat="true"':''}><div class="head"><div class="mark">${post.mark}</div><div><div class="who">${post.who}${post.w===S.week?'<span class="newtag">今週</span>':''}</div><div class="profileLine">${post.profile}</div><div class="meta">${post.meta} ・ ${catLabel(post.cat)}${post.major?' / 今月の主要観測':''}</div></div></div>${post.reply?`<div class="replyto">↳ ${roster[post.reply].name} の観測を受けて</div>`:''}<div class="post">${esc(post.text)}</div><div class="acts"><button class="a ${plus?'on':''}" aria-label="＋" aria-pressed="${plus}" onclick="act('${post.id}','plus')">＋</button><button class="a neg ${minus?'on':''}" aria-label="−" aria-pressed="${minus}" onclick="act('${post.id}','minus')">−</button><button class="a" onclick="act('${post.id}','detail')">⌕ 詳細</button></div></article>`;
  }

  function monthPosts(){return P.filter(p=>p.m===absMonth() && (String(p.id).startsWith('scenario-')||String(p.id).startsWith('history-')||String(p.id).startsWith('research-')));}
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
    const summary=[...new Map([...posts.filter(p=>p.researchBeat),...marked.slice(-2),...posts.filter(p=>p.w===4)].map(p=>[p.id,p])).values()];
    const observations=`<section class="meetingObservations"><h2>今月届いた声</h2><p>観測 ${posts.length}件 ／ 重点に置いた観測 ${marked.length}件。月末へ直接進んだ場合も、途中の経過をここで確認できます。</p>${summary.map(p=>`<blockquote><b>${p.who}・第${p.w}週</b><p>${esc(p.text)}</p></blockquote>`).join('')}</section>`;
    const thread=authored[S.month].dialogue.map(([speaker,text])=>bubble(speaker,text)).join('');
    const historyThread=historyMeetingLines(absMonth()).map(([speaker,text])=>bubble(speaker,text)).join('');
    const annualReport=annual?`<section class="annualReport reportBox"><h2>実証${Math.floor(absMonth()/12)+1}年目の引継ぎ</h2><p>${arc.feed}</p><p>通年の声から、行動を支えた関係と、まだ確認できていない条件を次年度へ残します。${absMonth()<12?'初年度は結論を急がず、町の人と暮らしを知るための記録を引き継ぎます。':''}</p><p>この年度の月次記録：${Object.keys(S.meetingDone).filter(k=>{const [y,m]=k.split('-').map(Number);return Math.floor(((y-1)*12+m-4)/12)===Math.floor(absMonth()/12);}).length+1}か月</p></section>`:'';
    document.getElementById('meetingBody').innerHTML=`<div class="meetingContext"><div class="eyebrow">${arc.label} / 今月の主要観測</div><div class="topic">${scene.topic}</div><p>河北恒研。今月の声を持ち寄り、次に確かめることを話し合う。</p></div><div class="meetingPrelude">${arc.meeting}</div>${observations}<div class="meetingThread">${thread}${historyThread}</div>${annualReport}${quarterlyReview()}<button class="meetingContinue" onclick="finishMeeting('${key}')">記録を引き継いで翌月へ →</button>`;
    document.querySelectorAll('.monthlyValues input').forEach(x=>{x.oninput=()=>x.nextElementSibling.textContent=x.value;});
    document.getElementById('meeting').classList.add('on');
  };

  const style=document.createElement('style');
  style.textContent='.profileLine{font-size:10px;color:#c4d5df;margin-top:2px}.currentMonthMarker{margin:2px 1px 10px;padding:8px 10px;border:1px solid #30485a;border-radius:10px;background:#0d161e;display:flex;justify-content:space-between;gap:8px;align-items:center}.currentMonthMarker b{font-size:12px}.currentMonthMarker span{font-size:9px;color:#8fa3b5;text-align:right}.meetingLine{color:#e4edf3;line-height:1.72}.meetingPrelude{margin:0 2px 14px;padding:11px 13px;border-left:2px solid #4f746f;color:#aebdca;font-size:12px;line-height:1.7;background:#0b1218}';
  document.head.appendChild(style);
  // Replace the old ID-bound observation action after the authored FEED has
  // taken ownership. Inline card handlers resolve this global at click time.
  const legacyAct = window.act;
  window.act = act = function authoredObservationAct(id, action){
    const post=findPost(id);
    if(!post)return;
    if(action==='plus'){
      S.likes[id]=!S.likes[id];
      if(S.likes[id]){
        S.minus[id]=false;
        const def=RESEARCH_BY_TOPIC[post.topic];
        if(def && !post.researchBeat && !S.research.some(x=>x.id===id)){
          S.research.push({
            id,title:def.title,result:def.result,
            due:absMonth()+def.delay,done:false,topic:post.topic,
            sourceWho:post.who,sourceProfile:post.profile
          });
          toast('＋観測：'+def.title+' を自動調査へ');
        }else{
          toast('＋観測：優先度を上げました');
        }
      }else toast('＋観測を解除');
    }else if(action==='minus'){
      S.minus[id]=!S.minus[id];
      if(S.minus[id]){
        S.likes[id]=false;
        toast('−観測：優先度を下げました');
      }else toast('−観測を解除');
    }else if(action==='detail'){
      openSheet('<div class="meta">'+esc(post.meta)+'</div><h2>'+esc(post.who)+'</h2><p>'+esc(post.profile||'')+'</p><p>'+esc(post.text)+'</p><p>この発信は立場・経験・観測範囲を持つ情報として扱います。＋は同意ではなく観測上の重み付けです。</p>');
    }else if(typeof legacyAct==='function'){
      legacyAct(id,action);
      return;
    }
    renderFeed();
  };

  renderFeed();
})();
