const TEXT = Object.freeze({
  MONTH_ADVANCED: '町内の月次状態を更新しました。複数の観測は一致するとは限りません。',
  HEAVY_RAIN_PRESSURE: '短時間の強い雨について、道路と排水の状態を知らせる報告が届いています。',
  SNOW_ACCESS_PRESSURE: '積雪により、通院・通学・買い物の移動条件が変化しています。',
  DELAYED_EFFECT_APPLIED: '以前に決めた制度対応の効果が、今月の地域状態へ現れ始めました。',
  MAYORAL_ELECTION: '倶利伽羅町長選挙の結果が確定しました。新しい政治的委任のもとで実証を継続します。',
  CLIMAX_HASSAKU_SUMO: '倶利伽羅八朔相撲の開催準備が最終段階に入り、会場運営の人員需要が高まっています。',
  CLIMAX_FOREST_LIVE: '倶利伽羅森林公園ライブの来場者対応が始まり、道路・救護・案内の資源を共有しています。',
  CLIMAX_HEAVY_RAIN: '秋雨前線による大雨が、二つの行事と同時に町の排水・避難能力を圧迫しています。',
  'investigation.completed': '登録した端末観測を別資料と照合しました。確認できた範囲と、なお不明な範囲を分けて記録します。'
});

const escape = value => String(value).replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

function actionButton(name, label, itemId, pressed = false) {
  return `<button type="button" data-action="${name}" data-item-id="${escape(itemId)}" aria-pressed="${pressed}">${label}</button>`;
}

function card(item, player) {
  const eventType = item.eventType ?? '';
  const milestone = eventType === 'MAYORAL_ELECTION' || eventType.startsWith('CLIMAX_');
  const reply = item.sourceType === 'staff-investigation' && item.evidenceRefs?.length;
  const body = item.text ?? TEXT[eventType] ?? TEXT[item.textKey] ?? TEXT.MONTH_ADVANCED;
  const source = item.sourceLabel ?? (item.sourceType === 'staff-investigation' ? '河北恒研・調査担当' : '抽選端末 / 匿名住民');
  const confidence = Number.isFinite(item.confidence) ? Math.round(item.confidence * 100) : 50;
  const assessment = player.assessments[item.id];
  const assessmentMarkup = assessment === 1
    ? '<span class="delta positive">+1 内部評価</span>'
    : assessment === -1 ? '<span class="delta negative">−1 内部評価</span>' : '';
  return `
    <article class="feed-card ${milestone ? 'milestone' : ''} ${item.system ? 'system' : ''} ${reply ? 'reply' : ''}" data-feed-id="${escape(item.id)}">
      <div class="card-head"><div><div class="source">${escape(source)}</div><div class="meta">${escape(item.meta ?? `MONTH ${item.observedTick}`)}</div></div><span class="confidence">確度 ${confidence}%</span></div>
      ${reply ? `<div class="meta">↳ ${escape(item.evidenceRefs[0])} への調査返信</div>` : ''}<div class="post">${escape(body)}</div>
      <div class="reaction-summary" aria-live="polite">${assessmentMarkup}</div>
      <div class="feed-actions">
        ${actionButton('plus', '評価＋', item.id, player.assessments[item.id] === 1)}
        ${actionButton('minus', '評価−', item.id, player.assessments[item.id] === -1)}
        ${actionButton('bookmark', '保存', item.id, player.bookmarks.includes(item.id))}
        ${actionButton('investigate', '調査登録', item.id)}
        ${actionButton('source-profile', '情報源', item.id)}
      </div>
    </article>`;
}

export function renderFeed(container, items, onAction, player) {
  container.innerHTML = items.map(item => card(item, player)).join('');
  container.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
      const article = button.closest('[data-feed-id]');
      const action = button.dataset.action;
      const item = items.find(candidate => candidate.id === button.dataset.itemId);
      if (action === 'plus' || action === 'minus') {
        const summary = article.querySelector('.reaction-summary');
        const className = action === 'plus' ? 'positive' : 'negative';
        const symbol = action === 'plus' ? '+1 内部評価' : '−1 内部評価';
        summary.innerHTML = `<span class="delta ${className}">${symbol}</span>`;
      }
      onAction(action, item, article);
    });
  });
}
