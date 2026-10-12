/* V1-16/17/18: Weighted observation -> proposals -> expert discussion -> director decision. */
(() => {
  'use strict';
  if (!window.ADHOMS_VER1_SESSION || !window.ADHOMS_LIGHT_STATE || typeof P === 'undefined' || typeof S === 'undefined') return;
  const KEY = 'adhoms.ver1.lightstate';
  const domains = [
    {id:'transport', re:/バス|交通|送迎|通勤|通学|乗り継ぎ|ダイヤ|移動/, title:'交通・生活時間', subject:'移動できない時間帯', targets:['町交通政策係','利用世帯・保育園','運行会社と沿線事業者'], plans:['乗降と生活時間のずれを共同調査する','利用できない曜日と送迎条件を聞き取る','小規模な時間調整の実施条件を照会する']},
    {id:'flood', re:/冠水|排水|側溝|浸水|豪雨|雨量|水路|河川/, title:'排水・避難経路', subject:'雨の日に使えなくなる経路', targets:['町防災担当','地区自治会','道路管理担当'], plans:['地点別の冠水履歴と通行条件を照合する','避難の際に使えない道を聞き取る','通行誘導と迂回経路の合同点検を相談する']},
    {id:'wildlife', re:/イノシシ|獣害|山際|農地|目撃|耕作放棄/, title:'山際・鳥獣', subject:'出没地点と生活動線の重なり', targets:['町鳥獣対策担当','農家と通学路の利用者','地域の土地管理者'], plans:['目撃地点と行動時間の分布を照合する','被害と通行上の制約を分けて聞き取る','境界の管理と点検分担を協議する']},
    {id:'winter', re:/除雪|積雪|雪害|冬季|通院|道路凍結/, title:'冬の生活動線', subject:'雪で止まる生活機能', targets:['町道路管理担当','通院・介護の利用世帯','地区の除雪協力団体'], plans:['生活動線と除雪実施時刻を照合する','除雪後にも使えない区間を調べる','担当範囲と代替通路の協力条件を相談する']},
    {id:'community', re:/訓練|自治会|担い手|役員|祭|参加|八朔相撲|準備|地域活動/, title:'地域活動・役割分担', subject:'参加と準備負担の食い違い', targets:['自治会役員','行事の準備担当者','町の地域活動担当'], plans:['参加人数と準備担当の偏りを照合する','準備作業の重複と代替者を聞き取る','負担を分散した次回運営の条件を相談する']},
    {id:'heat', re:/暑熱|猛暑|冷房|高温|熱中症|避暑/, title:'暑熱と生活圏', subject:'暑さによって変わる移動と避暑', targets:['町の健康福祉担当','集会所や店舗の運営者','交通と福祉の担当者'], plans:['避暑場所と移動手段を組み合わせて調査する','暑い時間帯の利用者の行動を聞き取る','休憩場所と移動支援の連携条件を相談する']},
    {id:'commerce', re:/店舗|営業|物流|売上|工場|飲食|仕入れ|閉店|商店|蕎麦|味噌/, title:'地域商業・物流', subject:'事業継続に必要な関係', targets:['町商工担当','地域の商店・事業者','物流・仕入れの関係者'], plans:['利用者と営業時間・物流を照合する','継続の障害と準備負担を聞き取る','仕入れ・移動・共同利用の条件を相談する']},
    {id:'daily', re:/.*/, title:'地域の生活・関係', subject:'日常の中で見えにくい制約', targets:['町の関係担当課','観測に参加する住民','地域の関係事業者'], plans:['観測内容と既存資料を照合する','生活上の事情を追加で聞き取る','無理のない小規模協力の条件を相談する']}
  ];
  const safe = v => String(v == null ? '' : v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const state = () => window.ADHOMS_LIGHT_STATE;
  const store = () => {
    const st=state();
    st.researchWorkflow ||= {version:1,decisions:[],drafts:{}};
    st.researchWorkflow.decisions ||= [];
    st.researchWorkflow.drafts ||= {};
    return st.researchWorkflow;
  };
  const persist = () => window.ADHOMS_VER1_SESSION.write(KEY,state());
  const value = p => S.likes[p.id] ? 3 : S.minus?.[p.id] ? 0.3 : 1;
  const monthPosts = () => P.filter(p => p.m===monthIndex() && !p.onboarding && !p.legacyObservation &&
    (String(p.id).startsWith('scenario-') || String(p.id).startsWith('history-') ||
     String(p.id).startsWith('research-')) && p.cat!=='system');
  const domainFor = p => {
    const txt=String(p.topic || '')+' '+String(p.text || '');
    return domains.find(d=>d.re.test(txt)) || domains[domains.length-1];
  };
  function analyze() {
    const posts=monthPosts();
    const buckets=new Map();
    for (const p of posts) {
      const d=domainFor(p);
      const b=buckets.get(d.id)||{domain:d,posts:[],mass:0};
      b.posts.push(p); b.mass += value(p);
      buckets.set(d.id,b);
    }
    const chosen=[...buckets.values()].sort((a,b)=>b.mass-a.mass)[0]||
      {domain:domains[domains.length-1],posts:[],mass:0};
    const d=chosen.domain;
    const channels={resident:0,office:0,business:0,expert:0,other:0};
    for(const p of chosen.posts) channels[p.cat in channels?p.cat:'other']+=value(p);
    const all=chosen.posts.slice().sort((a,b)=>value(b)-value(a));
    const relations=state().relations||{};
    const relationship=Object.values(relations).filter(x=>typeof x==='number'&&x>=2).length;
    const memories=(state().memories||[]).filter(x=>(x.tags||[]).some(t=>String(t).includes(d.id))).length;
    const research=(S.research||[]).filter(x=>x.done&&chosen.posts.some(p=>p.topic===x.topic)).length;
    const plans=[
      {id:'survey',target:d.targets[0],plan:d.plans[0],risk:'調査で関係者の負担が増えます。因果関係はまだ確定しません。',
        reason:'異なる立場の情報を比べ、見落とした条件を探す',score:2+channels.office*0.9+channels.expert*1.6+channels.other*0.4},
      {id:'interview',target:d.targets[1],plan:d.plans[1],risk:'協力は相手の意思次第です。少数の声を全体へ一般化できません。',
        reason:'当事者の生活上の制約を追加で確認する',score:2+channels.resident*1.8+channels.other*0.6},
      {id:'coordinate',target:d.targets[2],plan:d.plans[2],risk:'相手の権限、時間、費用の条件を確認するまで実行できません。',
        reason:'組織間の調整と小規模な試行を検討する',score:1+channels.business*2+channels.office*1.2+relationship*0.2}
    ];
    const recent=store().decisions.filter(x=>x.domain===d.id).slice(-1)[0];
    if(recent)for(const p of plans)if(p.id===recent.choiceId)p.score-=0.5;
    plans.sort((a,b)=>b.score-a.score);
    return {domain:d,posts:chosen.posts,all,plans,memories,research,weighted:chosen.posts.filter(p=>S.likes[p.id]).length,light:chosen.posts.filter(p=>S.minus?.[p.id]).length};
  }
  function responseFor(record){
    if(record.choiceId==='survey')
      return '河北恒研は'+record.target+'に観測資料の照合を依頼した。追加資料の提供・実施範囲は照会中で、調査だけで改善が起きたとは扱わない。';
    if(record.choiceId==='interview')
      return '河北恒研は'+record.target+'へ聞き取りの協力を依頼した。協力は任意であり、現時点では応じた人数や代表性を確定できない。';
    return '河北恒研は'+record.target+'へ運用条件の協議を提案した。担当組織の受諾・実施判断はまだ確認されていない。提案を実行済みとは扱わない。';
  }
  function seedFollowup() {
    const idx=monthIndex();
    const records=store().decisions.filter(x=>x.index===idx-1);
    for(const record of records){
      const id='research-workflow-'+record.id;
      if(P.some(p=>p.id===id))continue;
      P.push({id,m:idx,w:1,cat:'report',mark:'研',who:'河北恒研・提案経過',
        profile:'ADHOMS / 提案先の返答待ち',topic:record.topic||'研究経過',
        text:'先月の木曽決定：'+record.target+'へ「'+record.plan+'」を提案。\n'+responseFor(record)+
        '\nこの結果は次の観測に引き継ぐ。受諾や改善を推測で補わない。',researchBeat:true});
    }
  }
  function discussion(a){
    const p=a.plans[0], second=a.plans[1];
    const top=a.all[0];
    const source=top ? top.who+'さんの観測' : '今月の観測';
    return [
      ['佐伯 直人','ADHOMSは「'+a.domain.title+'」を抽出しました。重点データからは「'+p.plan+'」が上位ですが、これは予測の順位であって正解ではありません。'],
      ['宮下 沙耶','佐伯さん、その順位には観測した人の偏りも入っています。'+source+'は重要ですが、まだ観測できていない人を無視してよい根拠にはなりません。'],
      ['藤井 真','そうなんですよ。沙耶さんが言う条件、現場で聞かないと分からんです。'+p.target+'に話を持っていくにしても、誰が何を引き受けられるかは確認しましょう。'],
      ['水野 悠','その上で、'+second.target+'の側から見ると別の困り方もありますね。いま見えている問題だけ消して、別の誰かが負担を抱えるのは避けたいです。']
    ].slice(0,3+(a.weighted+a.light>0?1:0));
  }
  function renderDecision(){
    const overlay=document.getElementById('meeting');
    if(!overlay?.classList.contains('on'))return;
    const body=document.getElementById('meetingBody');
    const thread=body?.querySelector('.meetingThread');
    if(!body||!thread)return;
    body.querySelector('.adhomsDecision')?.remove();
    const a=analyze();
    const key=S.year+'-'+S.month;
    const draft=store().drafts[key];
    const selected=a.plans.some(p=>p.id===draft)?draft:a.plans[0].id;
    const samples=a.all.slice(0,3).map(p=>'<li>'+safe(p.who)+'：'+safe(String(p.text).slice(0,95))+(S.likes[p.id]?'（重）':S.minus?.[p.id]?'（軽）':'（通常）')+'</li>').join('');
    const result=document.createElement('section');
    result.className='adhomsDecision';
    result.innerHTML=
      '<h2>ADHOMS / 観測分析と提案候補</h2>'+
      '<p>対象：<b>'+safe(a.domain.title)+'</b> ／ 重く見た観測 '+a.weighted+'件・軽く見た観測 '+a.light+'件。重みは賛否ではなく分析の優先度です。</p>'+
      '<p>過去の関連記録 '+a.memories+'件 ／ 調査済み資料 '+a.research+'件。未観測の人・関係は推定できません。</p>'+
      '<details><summary>提案の根拠となった観測を確認</summary><ul>'+(samples||'<li>十分な観測がありません。</li>')+'</ul></details>'+
      '<div class="adhomsDebate"><h3>提案に対するスタッフの意見</h3>'+
      discussion(a).map(x=>'<p><b>'+safe(x[0])+'：</b>'+safe(x[1])+'</p>').join('')+'</div>'+
      '<h3>木曽の決定／河北恒研としての提案先と提案内容</h3>'+
      a.plans.map((p,i)=>'<label class="adhomsOption"><input type="radio" name="adhoms-meeting-choice" value="'+p.id+'" '+(selected===p.id?'checked':'')+'>'+
        '<span><b>'+(i===0?'ADHOMS第1候補：':'別の視点：')+safe(p.target)+'</b><br>'+safe(p.plan)+
        '<small>根拠：'+safe(p.reason)+'<br>留保：'+safe(p.risk)+'</small></span></label>').join('')+
      '<p class="adhomsCaution">所長が決めるのは「提案すること」まで。採否・実施は相手が決めます。どれも絶対的な正解ではありません。</p>';
    const button=body.querySelector('.meetingContinue');
    if(button)button.before(result);else body.appendChild(result);
    result.querySelectorAll('input[name="adhoms-meeting-choice"]').forEach(input=>{
      input.addEventListener('change',()=>{
        store().drafts[key]=input.value;
        persist();
      });
    });
  }
  const oldOpen=window.openMeeting;
  window.openMeeting=function(){oldOpen();renderDecision();};
  const oldFinish=window.finishMeeting;
  window.finishMeeting=function(key){
    const overlay=document.getElementById('meeting');
    if(overlay?.classList.contains('on') && document.querySelector('.adhomsDecision')){
      const a=analyze();
      const selected=document.querySelector('.adhomsDecision input[name="adhoms-meeting-choice"]:checked')?.value;
      const chosen=a.plans.find(p=>p.id===selected);
      if(!chosen){toast('木曽の提案先を選んでください');return;}
      const data=store();
      if(!data.decisions.some(x=>x.id===key)){
        data.decisions.push({id:key,index:monthIndex(),domain:a.domain.id,topic:a.domain.title,
          choiceId:chosen.id,target:chosen.target,plan:chosen.plan,
          sourceIds:a.all.slice(0,5).map(p=>p.id),weighted:a.weighted,light:a.light,
          status:'proposed',note:'実施主体の受諾は未確認'});
        delete data.drafts[key];
        state().memories ||= [];
        state().memories.push({id:'decision-workflow-'+key,year:state().year,month:state().month,week:4,
          valence:0,scope:'town',tags:['proposal',a.domain.id,chosen.id],note:chosen.target+'への提案。受諾未確認。',
          entities:[],source:{type:'meeting',id:key}});
        persist();
      }
    }
    return oldFinish(key);
  };
  const oldRender=window.renderFeed;
  window.renderFeed=function(){
    seedFollowup();
    oldRender();
    // A scripted FEED rebuild may omit externally supplied report categories.
    // Keep the report in the canonical P collection AND make it visible in the
    // same first-week FEED without falsely treating a proposal as accepted.
    const followups=store().decisions.filter(record=>record.index===monthIndex()-1);
    const list=document.getElementById('feedList');
    if(list && S.week>=1 && S.filter==='ALL'){
      for(const record of [...followups].reverse()){
        const id='research-workflow-'+record.id;
        if(list.querySelector('[data-id="'+id+'"]'))continue;
        const report=document.createElement('article');
        report.className='card report adhomsFollowup';
        report.dataset.id=id;
        report.dataset.week='1';
        report.innerHTML='<div class="head"><div class="mark">研</div><div><div class="who">河北恒研・提案経過<span class="newtag">第1週</span></div>'+
          '<div class="profileLine">ADHOMS / 実施主体の確認待ち</div></div></div>'+
          '<div class="post">先月の木曽決定：'+safe(record.target)+'へ「'+safe(record.plan)+'」を提案。\n'+safe(responseFor(record))+
          '\n受諾や改善を推測で補わず、次の観測に引き継ぎます。</div>';
        list.prepend(report);
      }
    }
    let legend=document.getElementById('adhomsWeightLegend');
    if(!legend){legend=document.createElement('p');legend.id='adhomsWeightLegend';
      legend.className='adhomsWeightLegend';
      const marker=document.querySelector('.currentMonthMarker');
      if(marker)marker.after(legend);}
    if(legend)legend.textContent='観測諸元：＋ 重く見る ／ − 軽く見る（賛成・反対ではありません）。月末にADHOMSが集約します。';
    document.querySelectorAll('#feedList .card .a[aria-label="＋"]').forEach(btn=>btn.title='ADHOMSの観測で重く扱う（賛成ではない）');
    document.querySelectorAll('#feedList .card .a[aria-label="−"]').forEach(btn=>btn.title='ADHOMSの観測で軽く扱う（反対ではない）');
  };
  const style=document.createElement('style');style.id='adhoms-decision-cycle-style';
  style.textContent='.adhomsWeightLegend{font-size:12px;line-height:1.6;color:#bed0d7;margin:8px 4px 12px}.adhomsDecision{border-top:1px solid #385563;margin:22px 0 10px;padding:18px 2px 4px}.adhomsDecision h2{font-size:17px;margin:0 0 11px}.adhomsDecision h3{font-size:15px;margin:16px 0 8px}.adhomsDecision p,.adhomsDecision li{font-size:14px;line-height:1.75;color:#d5e1e8}.adhomsDecision summary{font-size:14px;padding:8px 0;color:#a3d7d2}.adhomsDebate{border-left:3px solid #42786f;padding:6px 12px;background:#0c1820}.adhomsOption{display:flex;align-items:flex-start;gap:9px;padding:12px;margin:9px 0;border:1px solid #42606c;border-radius:11px;background:#10202a;cursor:pointer;font-size:14px;line-height:1.6}.adhomsOption input{width:19px;height:19px;margin:2px 0;flex-shrink:0;accent-color:#69d0c7}.adhomsOption span{display:block;flex:1}.adhomsOption small{display:block;color:#bdcdd5;font-size:12px;line-height:1.55;margin-top:4px}.adhomsCaution{font-size:12px!important}';
  document.head.appendChild(style);
  window.ADHOMS_VER1_DECISION_CYCLE={analyze,store};
  window.renderFeed();
  if(document.getElementById('meeting')?.classList.contains('on'))renderDecision();
})();