(() => {
  if (document.querySelector('.feedPrelude')) return;

  const title = document.querySelector('main .title');
  if (!title) return;

  const prelude = document.createElement('section');
  prelude.className = 'feedPrelude';
  prelude.innerHTML = `<div class="feedPreludeKicker">KURIKARA FIRST FIELD TRIAL / DAY 1</div><h2>2029年4月、実証開始。</h2><p>あなたは河北恒研の木曽所長。これから5年間、倶利伽羅町でADHOMSの実証を進めます。町の人々が変化の中で暮らしを続けるには、何が必要なのか。まずは、ここに届く声を読むところから。</p><p><b>FEEDの町民は、抽選で選ばれ、観測端末を配布された実証参加者です。</b> 町全体の声が均等に届くわけではありません。行政の資料、スタッフの調査、報道や配信も一緒に流れてきます。投稿がないことは、問題がないことを意味しません。</p><p><b>まずは第1週。</b> ＋／−は研究内での観測の重み付けです。町民には通知されません。「1週進む」で経過を追い、「月末まで」で会話と今月の要点へ進めます。</p>`;
  title.insertAdjacentElement('afterend', prelude);

  const style = document.createElement('style');
  style.id = 'opening-flow-style';
  style.textContent = '.feedPrelude{background:linear-gradient(180deg,#111a22,#0d141a);border:1px solid #33495a;border-radius:14px;padding:14px;margin:0 0 10px}.feedPreludeKicker{font-size:9px;letter-spacing:.1em;color:var(--ac);margin-bottom:5px}.feedPrelude h2{font-size:17px;margin:0 0 8px}.feedPrelude p{font-size:12px;line-height:1.75;color:#b9c7d2;margin:6px 0}.feedPrelude b{color:var(--tx)}';
  document.head.appendChild(style);
})();
