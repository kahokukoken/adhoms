(() => {
  const baseOpenMeeting = openMeeting;

  const staff = {
    '宮下 沙耶': {
      cue: '丁寧・容赦なし',
      beats: [
        'それだけでは結論になりません。条件を分けてから判断しましょう。',
        'すみません、その説明だと因果が一段飛んでいます。数字は便利ですが、雑に使うと雑な結論しか返しません。',
        '「多い」「少ない」だけでは判断できません。比較条件を揃えてください。',
        'その仮説は面白いですが、面白いことと正しいことは別です。検証を先にします。'
      ]
    },
    '藤井 真': {
      cue: 'ワタワタ現場型',
      beats: [
        'ちょ、ちょっと待って！　一個ずつお願いします！　住民への確認、現場の確認、順番にやりますから！',
        'あっ、話が三本に増えてます！　一個ずつ！　現場側で誰に聞くか整理します。',
        '待って待って、制度の話は分かるんですけど、明日の朝に困る人がいるんですよ。そこ先で！',
        'はいはいはい、分かりました！　分かりましたけど一気に振らないでください！　連絡先から当たります！'
      ]
    },
    '水野 悠': {
      cue: '人間観察・閉店告知収集',
      beats: [
        'この前集めた閉店告知にも似た文面がありました。「長年のご愛顧」って、地域の関係が消える瞬間を一枚で残すんですよ。面白いでしょう。',
        '閉店のお知らせを集めてると、店が消える前に客層や移動経路が先に変わってることが多いんです。今回もそこを見たいですね。',
        'また閉店告知の話で悪いんですが、ああいう紙は数字より先に「続けられなくなった理由」が滲むんですよ。',
        '趣味で閉店告知を撮って回ってると、同じ「店がなくなる」でも地域ごとに壊れ方が違うのが分かります。変な趣味ですけどね。'
      ]
    },
    '佐伯 直人': {
      cue: 'ADHOMS過激派',
      beats: [
        'ここから長くなるので省きますが、この揺れ方、ADHOMSとしてはかなりかわいいです。入力に素直すぎない。',
        '今の反応、かわいいですね。……いや、システムの話です。説明すると長くなるので三割だけにします。',
        '本当はRelationとMemoryの話から始めたいんですが長くなるので省きます。こういう履歴依存の挙動、ADHOMSの好きなところです。',
        'このズレ、消したくないです。残差として持たせた方がかわいい……じゃなくて、次の仮説に使えます。'
      ]
    }
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

  function staffName(bubble) {
    const speaker = bubble.querySelector('.speaker');
    if (!speaker) return '';
    return Object.keys(staff).find(name => speaker.textContent.includes(name)) || '';
  }

  function addCharacterBeat(bubble, name, month) {
    const speech = bubble.querySelector('.speech');
    const cue = speech && speech.querySelector('.staffCue');
    if (cue) cue.textContent = staff[name].cue;
    if (!speech || speech.querySelector('.characterBeat')) return;
    const beat = document.createElement('div');
    beat.className = 'characterBeat';
    beat.textContent = staff[name].beats[(month + name.length) % staff[name].beats.length];
    speech.appendChild(beat);
  }

  openMeeting = function openMeetingWithCharacterVariation() {
    baseOpenMeeting();
    const overlay = document.getElementById('meeting');
    if (!overlay || !overlay.classList.contains('on')) return;

    const thread = document.querySelector('.meetingThread');
    if (!thread) return;

    const month = S.month;
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
      addCharacterBeat(bubble, name, month);
      thread.appendChild(bubble);
    });
    others.forEach(bubble => thread.appendChild(bubble));

    const context = document.querySelector('.meetingContext .eyebrow');
    if (context) context.textContent += ` / 今月の起点：${order[0]}`;

    const styleId = 'meeting-v2-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = '.characterBeat{margin-top:8px;padding-top:8px;border-top:1px dashed #344454;color:#d7e2eb;font-size:13px;line-height:1.65}.meetingContext .eyebrow{color:#9eb4c8}';
      document.head.appendChild(style);
    }
  };
})();
