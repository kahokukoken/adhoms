(() => {
  if (document.querySelector('.feedPrelude')) return;

  const about = document.querySelector('.about');
  const title = document.querySelector('main .title');
  if (!about || !title) return;

  const prelude = document.createElement('section');
  prelude.className = 'feedPrelude';
  prelude.innerHTML = `<div class="feedPreludeKicker">KURIKARA FIRST FIELD TRIAL / DAY 1</div><h2>2029年4月、実証開始。</h2><p>倶利伽羅町で5年間のADHOMS実証が始まった。あなたは町を直接操作するのではなく、河北恒研の実証責任者として、住民・行政・商店・専門家・配信者から流れ込む観測を読み、必要なものに重みを付けていく。</p><p><b>まずは第1週。</b> FEEDに現れた声を追い、同じ出来事が立場によってどう違って見えるかを確認する。</p>`;
  title.insertAdjacentElement('afterend', prelude);

  const style = document.createElement('style');
  style.id = 'opening-flow-style';
  style.textContent = '.feedPrelude{background:linear-gradient(180deg,#111a22,#0d141a);border:1px solid #33495a;border-radius:14px;padding:14px;margin:0 0 10px}.feedPreludeKicker{font-size:9px;letter-spacing:.1em;color:var(--ac);margin-bottom:5px}.feedPrelude h2{font-size:17px;margin:0 0 8px}.feedPrelude p{font-size:12px;line-height:1.75;color:#b9c7d2;margin:6px 0}.feedPrelude b{color:var(--tx)}';
  document.head.appendChild(style);
})();
