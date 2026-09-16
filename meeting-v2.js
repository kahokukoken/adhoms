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

  const asides = {
    '藤井 真': [
      '……いや、ほんと一個ずつやりましょう。いっぺんに来ると現場が回らんて。',
      'これ、住民さんに聞く順番まで決めとかんと後でまたバタバタするやつです。',
      'ちょ、ここは先に現場確認しときましょう。机の上だけで決めるんは危ないです。'
    ],
    '水野 悠': [
      'そういえば、先週撮った閉店告知にも似た空気がありました。関係が切れる前って、妙に同じ言葉が出るんですよ。',
      '閉店のお知らせを集めてると、店が消える前に客の動線が先に変わってることが多いんです。今回も少し似ています。',
      '古地図を見ると、この辺の「今は何もない場所」に昔の動線が残ってるんですよ。数字だけだと見落としやすい。'
    ],
    '佐伯 直人': [
      'このズレ、消さずに残したいですね。残差として持ってる方が、ADHOMS的にはかわいいです。',
      '本当はRelationとMemoryから説明したいんですけど、長くなるので省きます。今の挙動、かなりかわいい。',
      '予測から外れたところが一番おもしろいんですよ。いや、かわいいと言った方が近いかもしれない。'
    ]
  };

  function staffName(bubble) {
    const speaker = bubble.querySelector('.speaker');
    if (!speaker) return '';
    return Object.keys(staff).find(name => speaker.textContent.includes(name)) || '';
  }

  function applyVoice(bubble, name, month) {
    const speech = bubble.querySelector('.speech');
    const cue = speech && speech.querySelector('.staffCue');
    if (cue) cue.textContent = staff[name].cue;
    if (!speech || speech.dataset.voiceApplied === '1') return;
    const pool = asides[name];
    if (pool && pool.length) {
      const aside = document.createElement('span');
      aside.className = 'characterAside';
      aside.textContent = ` ${pool[(month + name.length) % pool.length]}`;
      speech.appendChild(aside);
    }
    speech.dataset.voiceApplied = '1';
  }

  openMeeting = function openMeetingWithNaturalFlow() {
    baseOpenMeeting();
    const overlay = document.getElementById('meeting');
    if (!overlay || !overlay.classList.contains('on')) return;

    const thread = document.querySelector('.meetingThread');
    const context = document.querySelector('.meetingContext');
    if (!thread || !context) return;

    const month = S.month;
    const topic = document.querySelector('.meetingContext .topic')?.textContent?.trim() || '今月の主要観測';
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
      applyVoice(bubble, name, month);
      thread.appendChild(bubble);
    });
    others.forEach(bubble => thread.appendChild(bubble));

    document.querySelectorAll('.characterBeat').forEach(el => el.remove());

    let prelude = document.querySelector('.meetingPrelude');
    if (!prelude) {
      prelude = document.createElement('div');
      prelude.className = 'meetingPrelude';
      context.insertAdjacentElement('afterend', prelude);
    }
    const year = 2028 + S.year;
    prelude.innerHTML = `<b>${year}年${month}月・月末</b><br>1か月分のFEEDと調査結果が揃い、河北恒研の月例報告会が始まる。今月は「${topic}」を軸に、数字・現場・地域の関係・ADHOMSの4つの視点から食い違いを確認する。`;

    const eyebrow = context.querySelector('.eyebrow');
    if (eyebrow && !eyebrow.textContent.includes('今月の起点')) eyebrow.textContent += ` / 今月の起点：${order[0]}`;

    const styleId = 'meeting-v2-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = '.meetingPrelude{margin:0 2px 14px;padding:11px 13px;border-left:2px solid #4f746f;color:#aebdca;font-size:12px;line-height:1.7;background:#0b1218}.meetingPrelude b{color:#dbe8ee}.characterAside{color:inherit}.meetingContext .eyebrow{color:#9eb4c8}';
      document.head.appendChild(style);
    }
  };
})();
