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

  // DL-013: the entire opening is a first-April FEED conversation, without replay.
  // Begin with T-0WA's two posts, before the town's first
  // observations. Stable IDs keep saved weights independent of scenario rows.
  const onboarding = [
    ['orientation','t0wa','おはようございます、木曽所長。あなたの親愛なるAI、T-0WAです。\n正式名称はType-0 Work Assistant。今回も、所長の研究補助を担当します。\n\n2029年4月。本日から5年間、倶利伽羅町でADHOMSの実証を進めます。目指すのは、人口やGDPの最大化ではなく、社会が変化しても暮らしを支える機能を保ち、必要なら形を変えて適応できる状態です。\n\n所長は河北恒研の実証責任者です。町の人々を直接操作せず、届いた声を読み、気になる兆候を調べてください。月例報告で状況を確かめ、四半期や重要な出来事の節目に方針を判断していただきます。'],
    ['observation','t0wa','では、最初にFEEDの見方を。ここへ投稿する町の方々は、抽選で選ばれ、観測端末を配布された実証参加者です。行政の資料、スタッフの調査、報道や配信も一緒に届きます。\n\n町全体の声が均等に届くわけではありません。投稿がないことは、問題がないことを意味しません。誰の声が届いていて、誰の事情がまだ分からないのか。その点も、私たちで確かめていきましょう。\n\nまずは第1週です。スタッフの端末がつながっているか、ここで話しながら操作を確認します。藤井さん、準備はいかがですか。'],
    ['welcome','fujii','おはようございます、所長。実証運営の藤井真です。町の皆さんへの説明や、困ったときの連絡窓口を担当します。抽選で選ばれた方への端末配布が終わりました。まずは私たちの投稿で、ちゃんと読めるか確認しましょう。'],
    ['connection','saeki','システム担当の佐伯直人です。送受信テスト中。この文章が読めていれば、所長の端末まで届いています。試しに、この投稿の下の「＋」を押してみてもらえますか。同じボタンをもう一度押すと解除できます。受信キューと時刻同期の説明も……長くなるので後にします。'],
    ['question','fujii','ちょ、ちょっと待って。一個ずつ！　佐伯さん、その「＋」って、町の人にも見える「いいね」じゃないんだよね？'],
    ['weights','miyashita','データ解析の宮下沙耶です。藤井さんの質問は先に確認しておきましょう。「＋」は詳しく確かめたい観測として重く見る印、「−」は優先度を下げる印です。賛成・反対ではありません。困ったという投稿に「＋」を付けても、その人の困りごとを歓迎した意味にはなりません。'],
    ['confirmation','t0wa','補足します。＋／−は研究内の記録です。投稿者には通知しません。接続確認中のスタッフ投稿を操作しても、町の調査は開始しません。操作せず読み進めることも可能です。'],
    ['context','mizuno','社会システム担当の水野悠です。僕は店や交通の変化を追います。閉店のお知らせを集めていると、店が一軒なくなるだけで、買い物を頼める相手まで変わることがある。気になる投稿では「詳細」を開いて、誰がどんな立場で書いたかも見てみてください。'],
    ['reading','saeki','藤井さん、表示の確認もできました。投稿は上から下へ、届いた順に読めます。「1週進む」を押すと、この続きに新しい投稿や返信が届きます。今月の経過をまとめて確認するなら「月末まで」で大丈夫です。途中の要点を持ち寄って、スタッフで話し合います。'],
    ['handoff','fujii','はい、接続確認はここまで。さっそく田中さんから朝のバスの話が届いています。町の皆さんの投稿も、この下で読めます。まずは何に困っているのか、聞いてみましょう。']
  ].map(([id,key,text],i,rows)=>({
    id:'onboarding-'+id,cat:'system',mark:key==='t0wa'?'◇':'研',w:1,onboarding:true,
    who:key==='t0wa'?'T-0WA':staff[key].name,
    profile:'河北恒研 / '+(key==='t0wa'?'研究補助AI':staff[key].role),
    replyName:i?(rows[i-1][1]==='t0wa'?'T-0WA':staff[rows[i-1][1]].name):null,
    text
  }));

  const yearArcs = {
    1:{label:'基準年',feed:'朝の送迎、店の仕込み、雪の日の通院。この一年、町の人が毎日続けていることを追ってきた。',meeting:'今月届いた声を持ち寄る。話を聞いたあと、その人はどうなっただろう。'},
    2:{label:'認知から行動へ',feed:'情報が届いても、仕事や家族、移動手段によって動ける条件は違う。',meeting:'警告を知ったかと、実際に行動できたかを分けて確認する。'},
    3:{label:'適応の反作用',feed:'前年施策の利益と、その裏で別の人へ移った負担を追う。',meeting:'改善の効果と負担転嫁を確認し、修正の必要な条件を残す。'},
    4:{label:'経路依存・政治と継承',feed:'過去の判断と関係が、いま協力してもらえる相手や利用できる資源を変える。',meeting:'過去の経緯と現在の協力条件を結び付け、次に使える手札を確認する。'},
    5:{label:'最終実証年',feed:'最終年。5年間の積み重ねが、行事・豪雨・交通・高齢化の同時発生で試される。',meeting:'今年は単月最適化を禁止。5年間の履歴が壊れ方をどう変えたかを見る。'}
  };

  const months = {
    4:{topic:'新年度の移動変化',tags:'新年度 / 交通 / 転入',feed:[
      ['resident','住','misaki','朝のバスのことで相談です。保育園が開くのは8時。子どもを預けて停留所まで歩くと7分かかるのに、乗りたい便は8時5分に出ます。次は8時40分で、仕事に遅れてしまう。早起きはできても、園が開く時間は早くならないんですよね。'],
      ['office','行','matsumoto','田中さん、交通政策係の松本です。8時5分の便ですね。時刻表と、園から停留所までの道を確認します。すぐに便を増やす約束はできませんが、「利用者が少ない」という記録だけでは、乗りたくても間に合わない事情が分からないので。ほかにも同じ便で困っている方はいますか。'],
      ['influencer','V','kurika','田中さんの8時5分のバスの話、配信でも聞いてみます。端末を持ってない人にも同じことが起きてるかもしれないから。'],
      ['influencer','G','great','【突撃企画】終バスの後、駅から家まで歩いてみる！ と予告したら「遊びで歩くお前と、仕事帰りの人を一緒にするな」と来た。まず普段乗ってる人に話を聞きます。']
    ]},
    5:{topic:'山際の変化と野生動物',tags:'野生動物 / 山際 / 耕作放棄地',feed:[
      ['resident','住','makoto','畑の端の土がまた掘り返されとった。去年は山側だけやったのに、今度は春香さんが通る道の脇まで。イノシシやと思うが、姿はまだ見てない。隣の区画、草も伸びてきた。'],
      ['resident','住','haruka','北村さん、その畑の横、遅番の帰りに通ります。仕事が終わるのは21時半で、給油所は22時に閉まるんです。明るい道へ回ると20分ほど余計にかかる。道を変えれば安心、とは思うけど、給油も済ませて帰りたい。'],
      ['office','行','saito','防災担当の斉藤です。北村さんの写真は「足跡を確認、個体は未確認」として受け取りました。撮影した日も教えてください。同じ跡の写真が何度も届いている可能性があります。春香さん、帰宅時に確かめに寄らず、通る時間と道だけ知らせていただければ大丈夫です。'],
      ['influencer','G','great','夜の山際でイノシシ探す配信、取りやめます。春香さんの帰り道の話を読んだら、こっちから騒ぎに行くのは違うわ。']
    ]},
    6:{topic:'梅雨入りと排水',tags:'梅雨 / 排水 / 冠水',feed:[
      ['resident','住','daisuke','駅前の低い道、今朝は水がたまって通れなかった。一本手前で曲がって反対側の入口へ回ったら、いつもの電車が目の前で出ていった。靴は濡らさず済んだけど、会社には遅刻の電話。家を出る前に分かれば、早く出たのに。'],
      ['business','商','murata','今日は蕎麦と日替わり、少し遅れます。店の表は平気なのに、裏の搬入口に水がたまって配達の台車が入れない。店は開けたので、お客さんには「開いてるのに何で？」と言われてしまった。'],
      ['office','行','saito','山本さんの駅前の道と、村田さんの搬入口を確認します。雨が弱まってから、側溝の詰まりも見ます。町の川の水位はまだ低いのですが、先に使えなくなった道が出ています。現在の通行状況と過去の冠水写真は分けてお知らせします。'],
      ['influencer','V','kurika','村田さんのお店、「営業中」だけ見て行くと蕎麦を待つことになるそうです。今日は注文できるものを先に聞いてね。']
    ]},
    7:{topic:'暑熱と生活圏',tags:'暑熱 / 高温 / 電力',feed:[
      ['resident','住','sakamoto','集会所の冷房、昼もつけることにしました。家より涼しいと言って、近所の人が本を持って来とる。ただ、いつも来る坂の上のおばあちゃんを今日は見んかった。'],
      ['expert','専','takagi','坂本さん、集会所の開放ありがとうございます。来ていない方にはこちらから連絡してみます。「昼は涼みに来て」と勧めても、そこまで暑い道を歩けない方がいます。家で我慢しているのか、別の所で休めているのか、まず確かめたいです。'],
      ['business','商','murata','昼の片付けが終わっても、涼んでいくお客さんがいます。「もう一品頼まんと悪い？」って。今は空いてるから大丈夫ですよ。私も冷房の下で少し座りたい。'],
      ['resident','住','aoi','部活帰り、バスが来るまで25分。停留所の屋根の影が道路側にずれてて、ベンチだけ日なた。朝はちゃんと影の中だったのに。']
    ]},
    8:{topic:'夏休みと地域活動',tags:'夏休み / 行事 / 担い手',feed:[
      ['expert','専','kobayashi','夏休み行事の手伝い表を作りました。田中さん、丸を付けてもらった三日を準備・受付・片付けに割り当てたのですが、このお願いの仕方で大丈夫でしょうか。去年と同じ表を使っています。'],
      ['resident','住','misaki','小林先生、あの丸は「この三日のうち一日なら」のつもりでした。全部だと仕事を休まないと出られません。子どもは行事を楽しみにしてるから、断るのも言いづらくて。'],
      ['business','商','teranishi','美咲さん、うちの店も飾り付けの前夜から呼ばれとった。店を閉めたら暇、というわけでもないんだけどね。まず何時までか聞いてみます。'],
      ['influencer','V','kurika','手伝える日に丸→全部担当、はきつい。出演する側も、片付けまで誰がやるか聞いておこう。']
    ]},
    9:{topic:'八朔相撲と豪雨期',tags:'八朔相撲 / 豪雨 / 避難',feed:[
      ['resident','住','sakamoto','八朔相撲の日、雨が強まったら集会所へ案内するつもりです。椅子は出せる。ただ、鍵を持っとる私が会場を離れて開けに行く間、受付を誰に頼もうか。'],
      ['office','行','saito','坂本さん、会場の受付と集会所の開錠が重なっていますね。当日の担当表を持って相談に伺います。「雨なら集会所へ」と決めただけでは、着いた人を閉まった玄関で待たせてしまうので。雨の中で慌てて代役を探す前に、決めておきましょう。'],
      ['resident','住','aoi','相撲は見たい。でも急に雨が強くなったら、友達とはぐれそう。帰る時の待ち合わせ場所も先に決めておく。'],
      ['influencer','G','great','相撲に飛び入りする企画、岳さんに「まず受付に聞け」と止められた。勢いで土俵へ行けばいいわけじゃなかった。']
    ]},
    10:{topic:'収穫期と物流',tags:'収穫 / 農業 / 物流',feed:[
      ['resident','住','makoto','刈った米を運びたいんやけど、今日借りられる軽トラを運転する人がいない。私は畑から離れられんし、息子は仕事。袋は積めるようにしてあるんやけどな。'],
      ['business','商','teranishi','北村さんの新米、店の棚は空けました。夕方なら二人で受け取れます。午前中は私一人で店番なので、荷下ろしで売り場を空けるのが難しい。'],
      ['office','行','matsumoto','北村さんと寺西さんの希望時間を確認しています。車は今日空いていても、運ぶ方は午前、受け取る店は夕方という食い違いがあります。先に車をもう一台手配するのではなく、同じ日に都合が合う時間を探しています。'],
      ['influencer','V','kurika','新米が店に並ぶまでの話を聞いてる。袋はある、車もある、でも同じ時間に人がいない。おにぎりになるまで長い。']
    ]},
    11:{topic:'冬支度と高齢世帯',tags:'冬支度 / 除雪 / 高齢世帯',feed:[
      ['resident','住','sakamoto','去年、坂の上の家の雪かきを頼んだ人に電話したら、腰を痛めとるそうです。名簿には名前があるから、今年もお願いできる気でいた。雪が降る前に聞けてよかった。'],
      ['resident','住','haruka','坂本さん、その家は私の訪問先です。玄関の前を空けてもらえると助かります。ただ、訪問時間に私も雪かきできるかというと、次の家の予約があるので難しいです。'],
      ['office','行','saito','去年の除雪名簿をそのまま今年の担当表にはしないようお願いします。坂本さんから、体調が変わった方の話が届きました。引き受けられる日と時間を確認し、未確認の所は空欄で残します。玄関前など、町の除雪車が入らない場所も別に相談します。'],
      ['influencer','V','kurika','去年助けてくれた人に、今年も当然お願いします、ってなりがち。まだ雪がない今のうちに聞く回です。']
    ]},
    12:{topic:'年末商業と移動',tags:'年末 / 商業 / 帰省',feed:[
      ['business','商','teranishi','帰省するお客さんから取り置きの電話。顔を見られるのはうれしい。ただ、年明けも同じ量が売れると思って仕入れると余る。今週の分だけ、少し多めにします。'],
      ['resident','住','daisuke','帰省する親戚から駅まで迎えを頼まれた。着く日は仕事の最終日で、残業になるかもしれない。「電車は取れた」と言うけど、駅から家までがまだ決まってない。'],
      ['office','行','matsumoto','山本さん、到着日と時刻を教えてください。年末年始は休日用のダイヤになる日があります。いつもの夕方便があると思って待ってしまわないよう、日付を入れてご案内します。迎えを頼む場合も、運行日を確認してから決めてください。'],
      ['influencer','V','kurika','駅までは帰ってこられた。さて家までどうする。帰省あるある、今年もそこから始まっています。']
    ]},
    1:{topic:'冬季交通と孤立',tags:'積雪 / 除雪 / 通院',feed:[
      ['resident','住','haruka','訪問先まで車で行けたのに、玄関までの道が雪で埋まっていました。利用者さんを車へ連れていく間、荷物を置く場所もない。診療所に「道路は開いたけど、まだ出られません」と電話しました。'],
      ['resident','住','nishimura','バスは動かせたけど、停留所のベンチの前に除雪の雪が寄っとる。そこに立てず、少し離れた所で待つ人もいた。車内から探すのに時間がかかりました。'],
      ['expert','専','takagi','中川さん、連絡ありがとうございます。予約の遅れは事情を聞いて調整します。今朝は「道路が通れた」方でも、玄関から車へ移るのに時間がかかっています。受診をやめる前に一度ご連絡ください。こちらからも、予約時刻だけで判断せず確認します。'],
      ['influencer','V','kurika','西村さんの便は動いてる。でも停留所まで行けない人もいるそうです。乗れた人の報告だけで「みんな大丈夫」にしないでね。']
    ]},
    2:{topic:'冬の維持負担',tags:'除雪費 / 燃料 / 高齢世帯',feed:[
      ['resident','住','misaki','灯油の請求を見て、暖房を居間にまとめました。子どもの宿題も私の家計簿も同じ机。暖かいけど、消しゴムとレシートがずっと混ざってる。'],
      ['office','行','saito','灯油の配達や雪かきの相談を受けています。金額のほか、注文の電話をする人、受け取りに家へ戻る人も教えてください。共同で注文すれば安くなる場合でも、その段取りが特定の方へ集中していないか確認したいです。'],
      ['resident','住','makoto','納屋まで雪を掘ったら腰が重い。明日の朝に残すと凍るし、今日ぜんぶやると明日動けん。米の袋を取りに行くだけなんやけどな。'],
      ['influencer','V','kurika','北村さんの「今日やると明日動けない」、請求書には載らないやつ。雪かきした時間だけでは分からんなあ。']
    ]},
    3:{topic:'年度末の先送り',tags:'施設更新 / 予算 / 未処理',feed:[
      ['office','行','matsumoto','年度末の引継ぎです。田中さんから相談のあった8時5分の便は、運行会社との調整が続いています。本数や時刻はまだ変わっていません。園の開く時間と勤務に間に合う条件も添えて、次の担当へ渡します。同じ事情を最初から話し直していただかないためです。'],
      ['expert','専','kobayashi','中学校の体育館の雨漏り、今年は修繕の見積もりまで出ました。まだ直ってはいません。春の部活動で使う場所をどうするか、次の担当の先生へメモを残しています。'],
      ['business','商','teranishi','店の軒先の修理も、見積もりの紙で止まっとる。「来年」と言うのは簡単やけど、その間に雨漏りのバケツだけ増えた。どこから直すか、業者さんともう一度相談します。'],
      ['influencer','V','kurika','一年たったので、「直った」「相談中」「返事待ち」を聞いて回ります。去年と同じ困りごとでも、話の続きから始めたい。']
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
    '新年度の移動変化':{title:'新年度の移動条件を確認',delay:1,result:'田中さんは8時の開園後、8時5分の便に間に合わない。次の8時40分では勤務に遅れる。近所の送迎で間に合った日はあったが、毎日は頼めていない。同じ便で困る世帯数と、帰りの送迎は引き続き確認する。'},
    '山際の変化と野生動物':{title:'野生動物の目撃分布を確認',delay:1,result:'北村さんの畑の道沿いで足跡を確認。同じ跡を撮った写真もあり、目撃数とは分けた。春香さんは明るい道へ回ると給油所の閉店に間に合わない。帰宅路を避ける案には、給油できる時間も必要だった。'},
    '梅雨入りと排水':{title:'冠水・排水条件を確認',delay:1,result:'山本さんは駅の反対側へ回って電車に乗り遅れた。村田さんの店は表口から入れても、裏口に台車が入らず材料の到着が遅れた。晴れた日の搬入は再開したが、次の雨でも使えるかはまだ確認できていない。'},
    '暑熱と生活圏':{title:'暑熱時の生活圏変化を確認',delay:1,result:'坂本さんの集会所は昼も開いた。ただ、坂道を歩けず来られない人がいる。葵さんの停留所は午後にベンチが日なたになる。「涼しい場所が近くにある」だけでは、そこで休めるとは限らなかった。'},
    '夏休みと地域活動':{title:'地域行事の担い手偏りを確認',delay:2,result:'田中さんの「三日のうち一日なら」が、三日とも担当として記入されていた。今回は片付けだけに変更できた。初参加の人へ翌年分まで頼みかけた例もあり、来られる日と引き受けた仕事を分けて確認した。'},
    '八朔相撲と豪雨期':{title:'八朔相撲の運営・避難条件を確認',delay:1,result:'集会所の鍵を持つ坂本さんは、同じ時間に会場の受付も担当する予定だった。予備の鍵と代わりに開ける人を相談中。田中さんが子どもと荷物を連れて歩くと、案内に書かれた時間では着かなかった。'},
    '収穫期と物流':{title:'収穫期の物流制約を確認',delay:1,result:'北村さんの米は、軽トラを借りても運転手と店の受取時間が合わず待機した。都合が合った日は運べたが、毎週の約束にはなっていない。車の台数だけを増やす前に、運ぶ人と受け取る人の予定を合わせる必要がある。'},
    '冬支度と高齢世帯':{title:'冬季支援の依存関係を確認',delay:1,result:'去年の協力者の一人は腰を痛め、今年の雪かきを引き受けられなかった。春香さんも訪問の合間に代わることは難しい。名簿の名前を残すだけでは足りず、今年頼める時間を聞き直している。'},
    '年末商業と移動':{title:'年末の一時需要を確認',delay:1,result:'山本さんは仕事の最終日と親戚の迎えが重なった。駅に着く便は決まっていても、家までの足は未定だった。寺西さんは取り置き分を増やし、年明けの仕入れは据え置いた。数日間の賑わいを一年中の注文とは扱っていない。'},
    '冬季交通と孤立':{title:'冬季の最後の移動区間を確認',delay:1,result:'春香さんの訪問先では、道路が開いたあとも玄関から車までの雪が残った。西村さんのバスも、停留所まで出られない人は乗せられない。通院できた日は、道路の除雪に加えて玄関からの付き添いがあった。'},
    '冬の維持負担':{title:'冬季負担の内訳を確認',delay:1,result:'北村さんは納屋まで雪を掘った翌日に休息が必要だった。村田さんは開店を遅らせ、雪かきと仕込みを続けられる形へ変えた。灯油代だけでなく、翌日の仕事と休む時間にも冬の負担が出ている。'},
    '年度末の先送り':{title:'未処理案件の継続年数を確認',delay:2,result:'8時5分のバスは運行会社との調整中。学校の雨漏りは見積もり済みだが未修繕。どちらも未完了でも、次に連絡する相手は違う。相談の経緯と次の担当を一緒に残し、同じ説明を最初から求めないようにする。'}
  };

  const researchPostId=(item,month)=>'research-'+String(item.reportKey||item.id).replace(/[^a-z0-9_-]+/gi,'-')+'-'+month;
  // Each topic has a fixed delay, so due identifies its observation period.
  // Include the report content to preserve genuinely different legacy results.
  function researchIdentity(item){
    return typeof item.topic==='string' && typeof item.title==='string' && typeof item.result==='string' && Number.isFinite(item.due)
      ? JSON.stringify([item.topic,item.due,item.title,item.result]) : null;
  }
  function consolidateResearch(){
    const groups=new Map();
    (S.research||[]).forEach(item=>{
      if(!item || typeof item!=='object')return;
      const key=researchIdentity(item)||Symbol();
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(item);
    });
    const usedKeys=new Set();
    const merged=[...groups.values()].map(items=>{
      const item={...items[0],sourceIds:[...new Set(items.flatMap(x=>[x.id,...(Array.isArray(x.sourceIds)?x.sourceIds:[])]).filter(x=>typeof x==='string'))]};
      const base=String(item.reportKey||item.id).replace(/[^a-z0-9_-]+/gi,'-');
      let key=base, suffix=2;
      while(usedKeys.has(key))key=base+'-'+suffix++;
      item.reportKey=key;
      usedKeys.add(key);
      const completed=items.filter(x=>Number.isFinite(x.completedMonth));
      if(completed.length){
        // An older completed report must not be reissued as a new report.
        item.completedMonth=Math.min(...completed.map(x=>x.completedMonth));
        item.done=true;
      }
      return {item,completed};
    });
    // Snapshot aliases before migrating: old distinct results could share an
    // ID. Retire an alias only if no surviving report still uses it.
    const weights={likes:{...S.likes},minus:{...S.minus},books:{...S.books}};
    const live=new Set(merged.filter(x=>x.completed.length).map(x=>researchPostId(x.item,x.item.completedMonth)));
    const retired=new Set();
    merged.forEach(({item,completed})=>{
      if(completed.length){
        const target=researchPostId(item,item.completedMonth);
        const aliases=completed.map(x=>researchPostId(x,x.completedMonth));
        // Preserve a marked report when its duplicate ID is retired. If old
        // copies disagree, prefer the surviving report's existing weight.
        const weighted=[target,...aliases].find(id=>weights.likes[id]||weights.minus[id]);
        if(weighted){
          S.minus??={};
          S.likes[target]=!!weights.likes[weighted];
          S.minus[target]=!S.likes[target] && !!weights.minus[weighted];
        }
        if(S.books && aliases.some(id=>weights.books[id]))S.books[target]=true;
        aliases.forEach(id=>retired.add(id));
      }
    });
    retired.forEach(id=>{
      if(!live.has(id))for(const map of [S.likes,S.minus,S.books])if(map)delete map[id];
    });
    S.research=merged.map(x=>x.item);
  }
  function researchRows(idx){
    consolidateResearch();
    // Rebuild derived cards after save restoration, including cards rendered
    // before the legacy research records were consolidated.
    for(let i=P.length-1;i>=0;i--)if(P[i].m===idx && P[i].researchBeat)P.splice(i,1);
    const rows=[];
    (S.research||[]).forEach(item=>{
      if(!item || !Number.isFinite(item.due) || idx<item.due)return;
      if(!Number.isFinite(item.completedMonth)){
        item.completedMonth=idx;
        item.done=true;
      }
      if(item.completedMonth!==idx)return;
      rows.push({
        id:researchPostId(item,idx),
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
    const scene=current(), idx=absMonth(), y=2028+S.year;
    const extra=authored[S.month];
    const rows=scene.feed.map(([cat,mark,key,text])=>({cat,mark,key,text:key==='kurika'?extra.kurika:text,w:1,major:true}));
    extra.weeks.forEach((posts,week)=>posts.forEach(([key,text,reply])=>{
      const cat=key==='kurika'?'influencer':['matsumoto','saito'].includes(key)?'office':['murata','teranishi'].includes(key)?'business':['kobayashi','takagi'].includes(key)?'expert':'resident';
      rows.push({cat,mark:key==='kurika'?'V':'観',key,text,w:week+1,reply});
    }));
    if(Math.floor(absMonth()/12)+1===1){
      (year1Story[S.month]||[]).forEach(beat=>{
        const chosen=Object.entries(beat.variants||{}).find(([flag])=>window.ADHOMS_LIGHT_STATE?.flags?.[flag]);
        rows.push({...beat,text:chosen?chosen[1]:beat.text,storyBeat:true});
      });
    }
    historyContextRows(idx).forEach(beat=>rows.push(beat));
    researchRows(idx).forEach(beat=>rows.push(beat));
    // Append to the seed array so existing scenario-* IDs never shift. The
    // display order puts this first-day conversation before resident cards.
    if(idx===0)rows.push(...onboarding);
    // Explicit IDs and append-only seeding preserve every legacy scenario ID.
    // Each season adds conversation to weeks 2–4; story/history beats stay separate.
    (window.ADHOMS_WEEKLY_SCENES[S.month]||[]).forEach((posts,week)=>posts.forEach(([id,key,text,reply,daily])=>{
      const person=staff[key]||roster[key];
      const cat=staff[key]?'system':['kurika','great'].includes(key)?'influencer':['matsumoto','saito'].includes(key)?'office':['murata','teranishi'].includes(key)?'business':['kobayashi','takagi','takahashi'].includes(key)?'expert':key==='ishida'?'media':'resident';
      rows.push({id:`scenario-${idx}-weekly-${week+2}-${id}`,cat,mark:staff[key]?'研':'観',w:week+2,
        who:person.name,profile:staff[key]?`河北恒研 / ${person.role}`:`${person.age} / ${person.role}`,
        text,replyName:reply?(staff[reply]||roster[reply]).name:null,topic:daily?'町の日常':scene.topic});
    }));
    rows.forEach((r,i)=>{
      const id=r.id||`scenario-${idx}-${i}`;
      const person=r.key?roster[r.key]:null;
      const post={m:idx,id,...r,who:r.who||(person?person.name:'ADHOMS'),profile:r.profile||(person?`${person.age} / ${person.role}`:'SYSTEM / 組織アカウント'),meta:`${y}-${String(S.month).padStart(2,'0')} / 第${r.w}週${r.onboarding?' / 初日の接続確認':''}`,topic:r.onboarding?'端末動作確認':r.topic||scene.topic};
      // Update existing rows too: older layers can request a render during initialization.
      const existing=P.find(p=>p.id===id);
      if(existing)Object.assign(existing,post);else P.push(post);
    });
  }

  function card(post){
    const plus=!!S.likes[post.id], minus=!!S.minus?.[post.id];
    return `<article class="card ${post.cat}${post.storyBeat?' storyBeat':''}${post.historyBeat?' historyBeat':''}${post.researchBeat?' researchBeat':''}" data-id="${post.id}" data-week="${post.w}"${post.onboarding?' data-onboarding="true"':''}${post.storyBeat?' data-story-beat="true"':''}${post.historyBeat?' data-history-beat="true"':''}${post.researchBeat?' data-research-beat="true"':''}><div class="head"><div class="mark">${post.mark}</div><div><div class="who">${post.who}${post.onboarding?'<span class="internal">内部</span>':''}${post.w===S.week?'<span class="newtag">今週</span>':''}</div><div class="profileLine">${post.profile}</div><div class="meta">${post.meta} ・ ${catLabel(post.cat)}${post.major?' / 今月の主要観測':''}</div></div></div>${post.replyName?`<div class="replyto">↳ ${esc(post.replyName)} の発言を受けて</div>`:post.reply?`<div class="replyto">↳ ${roster[post.reply].name} の観測を受けて</div>`:''}<div class="post">${esc(post.text)}</div><div class="acts"><button class="a ${plus?'on':''}" aria-label="＋" aria-pressed="${plus}" onclick="act('${post.id}','plus')">＋</button><button class="a neg ${minus?'on':''}" aria-label="−" aria-pressed="${minus}" onclick="act('${post.id}','minus')">−</button><button class="a" onclick="act('${post.id}','detail')">⌕ 詳細</button></div></article>`;
  }

  function monthPosts(){return P.filter(p=>p.m===absMonth() && (String(p.id).startsWith('scenario-')||String(p.id).startsWith('history-')||String(p.id).startsWith('research-')||String(p.id).startsWith('onboarding-')));}
  renderFeed=function scriptedFeed(){
    seedScenarioPosts();
    const scene=current();
    const list=document.getElementById('feedList'); if(!list) return;
    const posts=monthPosts().filter(p=>p.w<=Math.min(S.week,4) && (S.filter==='ALL'||S.filter===p.cat));
    posts.sort((a,b)=>a.w-b.w || Number(b.onboarding||false)-Number(a.onboarding||false) || Number(b.major||false)-Number(a.major||false));
    list.innerHTML=posts.map(post=>card(post)).join('') || '<p class="feedEmpty">今週までに届いた、この分類の観測はありません。</p>';
    let marker=document.querySelector('.currentMonthMarker');
    if(!marker){marker=document.createElement('div');marker.className='currentMonthMarker';list.before(marker);}
    marker.innerHTML=`<b>${scene.topic}</b><span>第${Math.min(S.week,4)}週までの観測 ${posts.length}件 / ${year().label}</span>`;
  };

  // DL-001: only an explicit advance owns new-week navigation. Restoring a
  // saved week or repainting controls must not be mistaken for new arrivals.
  const previousAdvanceWeek=advanceWeek;
  let pendingWeekScroll=0;
  advanceWeek=function advanceWeekWithReadingPosition(){
    const month=absMonth(), previousWeek=S.week;
    cancelAnimationFrame(pendingWeekScroll);
    previousAdvanceWeek();
    const week=S.week;
    if(absMonth()!==month || week!==previousWeek+1 || week>4)return;
    pendingWeekScroll=requestAnimationFrame(()=>{
      if(absMonth()!==month || S.week!==week || document.querySelector('.meeting.on'))return;
      const firstNew=document.querySelector('#feedList .card[data-week="'+week+'"]');
      if(!firstNew)return;
      const headerHeight=document.querySelector('header').getBoundingClientRect().height;
      window.scrollTo({top:Math.max(0,window.scrollY+firstNew.getBoundingClientRect().top-headerHeight-12),behavior:'smooth'});
    });
  };
  document.getElementById('nextWeek').onclick=advanceWeek;

  function bubble(key,text){
    const s=staff[key];
    return `<div class="bubble"><div class="avatar">${s.name[0]}</div><div class="speech"><div class="speaker">${s.name} <span class="role">${s.role}</span></div><div class="meetingLine">${esc(text)}</div></div></div>`;
  }

  function quarterlyReview(){
    if(S.month%3!==0)return '';
    const fields={life:'暮らし',vital:'活力',future:'未来',tech:'技術',env:'環境'};
    return `<details class="quarterlyReview"><summary>四半期の観測重点を見直す（任意）</summary><p>いまの重点を続ける場合は、そのまま翌月へ進めます。制度や協定の具体的な判断は、関係する出来事の場面で行います。</p><div class="monthlyValues">${Object.entries(fields).map(([key,label])=>`<label>${label}<input type="range" min="20" max="100" value="${S.values[key]}" data-k="${key}"><span>${S.values[key]}</span></label>`).join('')}</div></details>`;
  }

  function rememberMeetingEntry(){
    const key=`${S.year}-${S.month}`;
    if(S.meetingEntry?.key!==key)S.meetingEntry={key,week:Math.min(4,Math.max(1,S.week))};
  }
  // The legacy month-end handler advances S.week before opening the meeting.
  const previousToMonthEnd=toMonthEnd;
  toMonthEnd=function monthEndWithReadingPosition(){
    rememberMeetingEntry();
    previousToMonthEnd();
  };
  document.getElementById('toMonthEnd').onclick=toMonthEnd;

  openMeeting=function scriptedMeeting(){
    const key=`${S.year}-${S.month}`;
    if(S.meetingDone[key]){nextMonth();return;}
    // Remember which weeks had arrived before the meeting, including on reload.
    // Rendering the month-end feed below must not turn skipped weeks into read ones.
    rememberMeetingEntry();
    S.week=4;
    updateTop();
    renderFeed();
    const scene=current(), arc=year(), annual=S.month===3;
    document.getElementById('meetTitle').textContent=`${ym()} ${annual?'年次観測報告':'月次観測会議'}`;
    const posts=monthPosts().filter(p=>!p.onboarding);
    const marked=posts.filter(p=>S.likes[p.id]);
    const summary=[...new Map([...posts.filter(p=>p.researchBeat||p.storyBeat||p.historyBeat),...marked.slice(-2),...posts.filter(p=>p.w===4)].map(p=>[p.id,p])).values()].sort((a,b)=>a.w-b.w);
    const needsCatchup=p=>p.w>S.meetingEntry.week&&p.topic!=='町の日常';
    const catchup=summary.filter(needsCatchup),reference=summary.filter(p=>!needsCatchup(p));
    const quote=p=>`<blockquote data-week="${p.w}"><b>${p.who}・第${p.w}週</b><div class="profileLine">${esc(p.profile)}</div><p>${esc(p.text)}</p></blockquote>`;
    const observations=`<section class="meetingObservations"><h2>今月届いた声</h2><p>観測 ${posts.length}件 ／ 重点に置いた観測 ${marked.length}件。</p>${catchup.length?`<div class="meetingCatchup"><p>会議の前に、途中の週に届いた紹介と近況を確認します。</p>${catchup.map(quote).join('')}</div>`:'<p>第4週までの声が揃いました。今月分を持ち寄って、話を続けます。</p>'}${reference.length?`<details class="meetingReadPosts"><summary>届いた投稿・日常の近況を振り返る（${reference.length}件）</summary>${reference.map(quote).join('')}</details>`:''}</section>`;
    const thread=authored[S.month].dialogue.map(([speaker,text])=>bubble(speaker,text)).join('');
    const historyThread=historyMeetingLines(absMonth()).map(([speaker,text])=>bubble(speaker,text)).join('');
    const annualReport=annual?`<section class="annualReport reportBox"><h2>実証${Math.floor(absMonth()/12)+1}年目の引継ぎ</h2><p>${arc.feed}</p><p>通年の声から、行動を支えた関係と、まだ確認できていない条件を次年度へ残します。${absMonth()<12?'初年度は結論を急がず、町の人と暮らしを知るための記録を引き継ぎます。':''}</p><p>この年度の月次記録：${Object.keys(S.meetingDone).filter(k=>{const [y,m]=k.split('-').map(Number);return Math.floor(((y-1)*12+m-4)/12)===Math.floor(absMonth()/12);}).length+1}か月</p></section>`:'';
    document.getElementById('meetingBody').innerHTML=`<div class="meetingContext"><div class="eyebrow">${arc.label} / 今月の主要観測</div><div class="topic">${scene.topic}</div><p>河北恒研。今月の声を持ち寄り、次に確かめることを話し合う。</p></div><div class="meetingPrelude">${arc.meeting}</div>${observations}<div class="meetingThread">${thread}${historyThread}</div>${annualReport}${quarterlyReview()}<button class="meetingContinue" onclick="finishMeeting('${key}')">記録を引き継いで翌月へ →</button>`;
    document.querySelectorAll('.monthlyValues input').forEach(x=>{x.oninput=()=>x.nextElementSibling.textContent=x.value;});
    document.getElementById('meeting').classList.add('on');
  };

  const sceneStyle=document.createElement('style');
  sceneStyle.textContent='.profileLine{font-size:10px;color:#c4d5df;margin-top:2px}.currentMonthMarker{margin:2px 1px 10px;padding:8px 10px;border:1px solid #30485a;border-radius:10px;background:#0d161e;display:flex;justify-content:space-between;gap:8px;align-items:center}.currentMonthMarker b{font-size:12px}.currentMonthMarker span{font-size:9px;color:#8fa3b5;text-align:right}.meetingLine{color:#e4edf3;line-height:1.72}.meetingPrelude{margin:0 2px 14px;padding:11px 13px;border-left:2px solid #4f746f;color:#aebdca;font-size:12px;line-height:1.7;background:#0b1218}';
  document.head.appendChild(sceneStyle);
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
        if(def && !post.researchBeat){
          consolidateResearch();
          const candidate={
            id,title:def.title,result:def.result,
            due:absMonth()+def.delay,done:false,topic:post.topic,
            sourceWho:post.who,sourceProfile:post.profile,sourceIds:[id]
          };
          const existing=S.research.find(item=>researchIdentity(item)===researchIdentity(candidate));
          if(existing){
            if(!existing.sourceIds.includes(id))existing.sourceIds.push(id);
            toast('＋観測：'+def.title+' の観測に追加しました');
          }else{
            S.research.push(candidate);
            toast('＋観測：'+def.title+' を自動調査へ');
          }
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
