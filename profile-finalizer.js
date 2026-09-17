(() => {
  const roster = {
    resident:[
      ['田中 美咲','38歳','主婦 / 子育て世帯'],['山本 大輔','44歳','会社員'],['中川 春香','29歳','介護職'],
      ['北村 誠','67歳','農家'],['森川 葵','17歳','高校生'],['坂本 和夫','71歳','自治会長']
    ],
    office:[['松本 達也','46歳','倶利伽羅町 職員'],['斉藤 由佳','35歳','倶利伽羅町 職員']],
    business:[['寺西 浩一','58歳','商店主'],['村田 真紀','41歳','飲食店主']],
    expert:[['高橋 俊介','52歳','地域交通研究者'],['高木 玲子','50歳','医師'],['小林 亮','39歳','教員']],
    media:[['石田 奈緒','33歳','北陸地域新聞 記者']],
    influencer:[['クリカ','年齢不詳','ローカルVTuber'],['グレート・ノト','年齢不詳','動画配信者']]
  };

  const hash = value => Array.from(String(value || '')).reduce((n,c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
  const isOrg = p => p.cat === 'system' || p.cat === 'report' || p.cat === 'event';

  function finalize(post) {
    if (!post) return post;
    if (isOrg(post)) {
      post.profile = post.profile || 'SYSTEM / 組織アカウント';
      return post;
    }
    if (post.who === 'クリカ') { post.profile = '年齢不詳 / ローカルVTuber'; return post; }
    if (post.who === 'グレート・ノト') { post.profile = '年齢不詳 / 動画配信者'; return post; }
    if (post.profile && /歳|年齢不詳/.test(post.profile) && !/立場確認中/.test(post.profile)) return post;
    const pool = roster[post.cat] || roster.resident;
    const [name,age,role] = pool[hash(post.id || post.text) % pool.length];
    post.who = name;
    post.profile = `${age} / ${role}`;
    return post;
  }

  const priorCardHTML = cardHTML;
  cardHTML = function finalizedCard(post, depth = 0) {
    finalize(post);
    return priorCardHTML(post, depth);
  };

  const priorRenderFeed = renderFeed;
  renderFeed = function finalizedCurrentMonthFeed() {
    P.forEach(finalize);
    priorRenderFeed();
    const idx = (S.year - 1) * 12 + ((S.month - 4 + 12) % 12);
    document.querySelectorAll('#feedList .card[data-id]').forEach(card => {
      const post = P.find(p => p.id === card.dataset.id);
      if (post && post.m !== idx) card.remove();
    });
    document.querySelectorAll('#feedList .card[data-id]').forEach(card => {
      const post = P.find(p => p.id === card.dataset.id);
      if (!post) return;
      finalize(post);
      const who = card.querySelector('.who');
      if (who && !who.textContent.includes(post.who)) {
        const badges = Array.from(who.children).map(el => el.outerHTML).join('');
        who.innerHTML = `${post.who}${badges}`;
      }
      let profile = card.querySelector('.profileLine');
      if (!profile) {
        profile = document.createElement('div');
        profile.className = 'profileLine';
        const meta = card.querySelector('.meta');
        meta?.before(profile);
      }
      if (profile) profile.textContent = post.profile || '年齢不詳 / 立場確認中';
    });
  };

  renderFeed();
})();
