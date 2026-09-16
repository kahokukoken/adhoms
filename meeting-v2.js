(() => {
  const baseOpenMeeting = openMeeting;

  const staff = {
    '宮下 沙耶': { cue: '丁寧・容赦なし' },
    '藤井 真': { cue: 'ワタワタ現場型' },
    '水野 悠': { cue: '人間観察・閉店告知収集' },
    '佐伯 直人': { cue: 'ADHOMSオタク' }
  };

  const orders = {
    1:['宮下 沙耶','佐伯 直人','藤井 真','水野 悠'],
    2:['藤井 真','水野 悠','宮下 沙耶','佐伯 直人'],
    3:['佐伯 直人','宮下 沙耶','水野 悠','藤井 真'],
    4:['宮下 沙耶','藤井 真','水野 悠','佐伯 直人'],
    5:['水野 悠','藤井 真','宮下 沙耶','佐伯 直人'],
    6:['藤井 真','宮下 沙耶','佐伯 直人','水野 悠'],
    7:['佐伯 直人','藤井 真','宮下 沙耶','水野 悠'],
    8:['水野 悠','佐伯 直人','藤井 真','宮下 沙耶'],
    9:['藤井 真','水野 悠','佐伯 直人','宮下 沙耶'],
    10:['宮下 沙耶','水野 悠','藤井 真','佐伯 直人'],
    11:['佐伯 直人','宮下 沙耶','藤井 真','水野 悠'],
    12:['水野 悠','宮下 沙耶','佐伯 直人','藤井 真']
  };

  const dialogue = {
    4:{
      '宮下 沙耶':'新年度で母集団が変わっています。前年4月との単純比較は条件差を補正してからです。転入世帯、通学、通勤を分けない数字は、正直ほとんど役に立ちません。',
      '藤井 真':'ちょ、ちょっと待って！　一個ずつ！　新しく来た人はバス停の場所から分からんのです。まず「制度を知らない困り方」と「便数が足りない困り方」を分けましょう。',
      '水野 悠':'引っ越してきた人の動線って面白いですよ。古地図の道を今でも近道として使う人がいたりする。新旧の「当たり前」がぶつかる月ですね。',
      '佐伯 直人':'Relationがまだ育っていない主体として見ると説明しやすいです。初期状態の違いがそのまま脆弱性になる。この立ち上がり方、ADHOMS的にはかなりかわいい。'
    },
    5:{
      '水野 悠':'山際の空き地が増えると、人間には「使わなくなった土地」でも動物には通路になります。閉店告知を集めていても、人が引く前には周囲の動線が先に細るんですよ。似ています。',
      '藤井 真':'夜の通報が増えとるんですけど、全部同じ危険度ではないんや。怖いって声は拾いつつ、実際に人とぶつかる場所から確認しましょう。',
      '宮下 沙耶':'目撃件数だけでは結論になりません。通報しやすい地区ほど件数は増えます。地点、時間帯、土地利用を分けてください。',
      '佐伯 直人':'目撃バイアスごと観測として持ちたいですね。人間活動の縮小と生息域の境界が同時に動いている。こういうズレ、消すより残差で残した方がかわいいです。'
    },
    6:{
      '藤井 真':'雨が降ってから「どこ詰まっとる？」って走り回るの、もうやめたいんです。側溝と避難路、晴れとるうちに一個ずつ見ましょう。',
      '宮下 沙耶':'同じ雨量でも冠水する地点が違うなら、雨量以外の変数が効いています。排水容量、閉塞、標高差を分けます。',
      '佐伯 直人':'閾値を超えた瞬間に挙動が変わるタイプですね。線形で扱うと外します。本当はここから長いんですけど、省きます。',
      '水野 悠':'昔の水路を古地図で見ると、今の道路と微妙にずれて残っています。水って昔の地形を忘れてない感じがしますね。'
    },
    7:{
      '佐伯 直人':'暑熱を気温だけにすると取りこぼします。電力、移動、社会接触の三つが絡む。複数系が同時にゆっくり悪くなる挙動、ADHOMSとしてはかわいいです。',
      '藤井 真':'かわいい言うとる場合じゃないですよ。外出控えてで終わると通院できん人が出ます。涼める場所と移動手段、セットで見ましょう。',
      '宮下 沙耶':'平均気温ではなく時間帯別、屋内外、年齢層別に見ます。「暑かった」で一括りにしないでください。',
      '水野 悠':'暑い日は人が寄る店が変わるんですよ。閉店告知を撮りに歩いてても、夏だけ妙に人がいる休憩所がある。生活圏が季節で組み替わっています。'
    },
    8:{
      '水野 悠':'祭りや夏休み行事は、参加者より準備している人を見ると地域の骨格が出ます。閉店告知と同じで、「続ける人」が減る時は前兆があります。',
      '佐伯 直人':'担い手の集中度をRelation側で持ちたいです。参加人数が多くても、裏方が三人に集中してたら脆い。そういう見かけと実態のズレはかわいい。',
      '藤井 真':'またかわいいって言っとる…。で、実際に今年も同じ人に仕事が寄ってます。頼む順番から変えんと回らんです。',
      '宮下 沙耶':'参加者数を成功指標にしない点は同意します。準備時間、担当重複、代替可能人数を出してください。'
    },
    9:{
      '藤井 真':'八朔相撲、やるかやらんかだけで揉めても進まんです。途中で雨が強くなった時、誰が止めてどこへ逃がすかまで決めましょう。',
      '水野 悠':'残したい文化と安全は敵同士じゃないですよ。昔から形を変えながら残ってきた行事なら、今回も変え方を考えればいい。',
      '佐伯 直人':'行事と豪雨を別イベントにしない方がいいです。道路、人員、避難先という共有資源が同時に詰まる。ここ、ADHOMSが一番おもしろくなるところです。',
      '宮下 沙耶':'「開催」「中止」の二択で評価しません。降雨強度、観客数、避難完了時間の組み合わせを確認します。'
    },
    10:{
      '宮下 沙耶':'収量だけでは農業の状態を説明できません。収穫、人手、輸送、販売を分けます。どこか一つが止まれば結果は変わります。',
      '水野 悠':'店の閉店告知を見てると、「売れない」より前に「仕入れが続かない」が出ることがあるんです。物流の細り方を見たいですね。',
      '藤井 真':'農繁期だけ車も人も足りん日があるんや。曜日と時間を切って、困る場所から拾いましょう。',
      '佐伯 直人':'ボトルネックが月ごとに移動する系ですね。固定の「農業力」みたいな一変数に潰さない方がかわいいです。'
    },
    11:{
      '佐伯 直人':'冬支度は雪が降る前から状態遷移が始まってます。助け合い関係が事前に組めているかが効く。見えない準備期間を持たせたいです。',
      '宮下 沙耶':'除雪距離だけではなく、通院・介護・買い物の必須動線を別にしてください。必要性の違いを平均化しないでください。',
      '藤井 真':'降ってから電話しても遅いんです。誰が誰んとこ行くか、今のうちに決めとかんと。',
      '水野 悠':'冬前の閉店告知って、実は雪の負担が理由に滲むことがあります。店だけじゃなく、人の暮らしにも同じことが起きます。'
    },
    12:{
      '水野 悠':'年末だけ戻ってくる人を見ると、町の外から見た不便さが出ます。住んでいる人が慣れて見落としていることを言ってくれる。',
      '宮下 沙耶':'一時的な帰省人口と恒常人口を混ぜないでください。短期増加を「活性化」と呼ぶのは早いです。',
      '藤井 真':'年末の渋滞で普段のバスまで遅れるんです。臨時の混雑と日常の足、分けて考えんと。',
      '佐伯 直人':'外部から戻る主体が一時的にネットワークを繋ぎ直す。Memoryの差が観測できる月ですね。こういう季節性、かわいいです。'
    },
    1:{
      '宮下 沙耶':'積雪量だけを見ないでください。同じ積雪でも通行不能時間が違います。除雪開始時刻と生活動線を分けます。',
      '佐伯 直人':'幹線が開いていても最後の500mが閉じていると生活は止まる。ネットワークの末端が効く典型例ですね。かわいい。',
      '藤井 真':'だから最後の道が大事なんですって。通院先まで「ほぼ行ける」は行けるに入らんのです。',
      '水野 悠':'雪の日は普段見えない助け合いが急に見えます。誰が誰の家の前を掘るか、そこに関係性が出ますね。'
    },
    2:{
      '藤井 真':'除雪費だけ見て「高い」言われても困るんです。削ったら止まる場所があるんやから、まずそこ分けましょう。',
      '水野 悠':'冬だけ続けられなくなる店の閉店告知、何枚かあります。費用より、体力や人手が最後の一押しになることも多い。',
      '宮下 沙耶':'必要支出と非効率を同じ赤字で扱わないでください。機能維持への寄与を分けます。',
      '佐伯 直人':'コスト最小化だけにすると、社会機能を削って数字を良くする最悪の最適化ができます。ADHOMSにはさせたくないですね。'
    },
    3:{
      '佐伯 直人':'先送りが積み上がると状態じゃなく履歴が効き始めます。Memoryの出番です。こういう経路依存、かなりかわいい。',
      '宮下 沙耶':'未処理件数より継続年数を見ます。同じ一件でも一年延期と五年延期では意味が違います。',
      '水野 悠':'閉店告知でも「長年検討してきましたが」という文面、よくあるんですよ。決断の遅れ自体が地域の空気になる。',
      '藤井 真':'年度末に全部いっぺんに来るの、ほんとやめてほしいんですけど！　一個ずつ優先順位つけましょう。'
    }
  };

  function staffName(bubble) {
    const speaker = bubble.querySelector('.speaker');
    if (!speaker) return '';
    return Object.keys(staff).find(name => speaker.textContent.includes(name)) || '';
  }

  function replaceSpeech(bubble, name, month) {
    const speech = bubble.querySelector('.speech');
    const speaker = speech?.querySelector('.speaker');
    if (!speech || !speaker) return;
    const cue = speaker.querySelector('.staffCue');
    if (cue) cue.textContent = staff[name].cue;
    const speakerHTML = speaker.outerHTML;
    const line = dialogue[month]?.[name];
    if (!line) return;
    speech.innerHTML = `${speakerHTML}<span class="replyLine">${month}月の観測から</span><div class="meetingLine">${line}</div>`;
  }

  openMeeting = function openMeetingWithNaturalFlow() {
    baseOpenMeeting();
    const overlay = document.getElementById('meeting');
    if (!overlay || !overlay.classList.contains('on')) return;

    const thread = document.querySelector('.meetingThread');
    const context = document.querySelector('.meetingContext');
    if (!thread || !context) return;

    const month = S.month;
    const topic = context.querySelector('.topic')?.textContent?.trim() || '今月の主要観測';
    const bubbles = Array.from(thread.querySelectorAll('.bubble'));
    const staffBubbles = new Map();
    const others = [];

    bubbles.forEach(bubble => {
      const name = staffName(bubble);
      if (name && !staffBubbles.has(name)) staffBubbles.set(name, bubble);
      else others.push(bubble);
    });

    const order = orders[month] || orders[4];
    order.forEach(name => {
      const bubble = staffBubbles.get(name);
      if (!bubble) return;
      replaceSpeech(bubble, name, month);
      thread.appendChild(bubble);
    });
    others.forEach(bubble => thread.appendChild(bubble));

    document.querySelectorAll('.characterBeat,.characterAside').forEach(el => el.remove());

    let prelude = document.querySelector('.meetingPrelude');
    if (!prelude) {
      prelude = document.createElement('div');
      prelude.className = 'meetingPrelude';
      context.insertAdjacentElement('afterend', prelude);
    }
    const year = 2028 + S.year;
    prelude.innerHTML = `<b>${year}年${month}月・月末</b><br>第1週から積み上がったFEEDと調査結果を閉じ、月例報告会へ移る。今月の中心は「${topic}」。誰の声を重く見たかも含めて、4人がそれぞれ違う角度から確認する。`;

    const eyebrow = context.querySelector('.eyebrow');
    if (eyebrow) eyebrow.textContent = `今月の主要観測 / 起点：${order[0]}`;

    const styleId = 'meeting-v2-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = '.meetingPrelude{margin:0 2px 14px;padding:11px 13px;border-left:2px solid #4f746f;color:#aebdca;font-size:12px;line-height:1.7;background:#0b1218}.meetingPrelude b{color:#dbe8ee}.meetingLine{color:#e4edf3}.meetingContext .eyebrow{color:#9eb4c8}';
      document.head.appendChild(style);
    }
  };
})();
