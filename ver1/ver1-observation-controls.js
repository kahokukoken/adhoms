(() => {
  const hint = document.querySelector('.hint');
  if (hint) {
    hint.innerHTML = '<b>＋</b>＝この観測を重く見る。必要なら河北恒研が自動調査　／　<b>−</b>＝この観測の優先度を下げる。<br>＋/−は賛否ではなく、観測上の重み付けです。返信や反証まで含めて判断します。';
  }

  if (typeof window.cardHTML === 'function') {
    const previousCardHTML = window.cardHTML;
    window.cardHTML = function cardHTMLWithoutFollow(...args) {
      return previousCardHTML(...args).replace(/<button class="a fl[^>]*>＋ フォロー<\/button>/g, '');
    };
  }

  const style = document.createElement('style');
  style.id = 'ver1-observation-controls-style';
  style.textContent = '.acts{grid-template-columns:repeat(3,1fr)!important}';
  document.head.appendChild(style);

  if (typeof window.renderFeed === 'function') window.renderFeed();
})();
