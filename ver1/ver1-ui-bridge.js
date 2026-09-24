(() => {
  if (!window.ADHOMS_VER1_STATE || !window.ADHOMS_VER1_EVENTS || !window.ADHOMS_VER1_PROPAGATION || !window.ADHOMS_VER1_FINAL) return;
  const KEY = 'adhoms.ver1.lightstate';
  const FINAL_KEY = 'adhoms.ver1.finalsession';
  const originalNextMonth = window.nextMonth;
  const originalRenderFeed = window.renderFeed;
  const FINAL_DECISION_LABELS = {
    sumo_schedule:'八朔相撲',
    towa_schedule:'TOWAイベント',
    portable_shelter:'可搬避難所',
    mobile_command:'移動指令所',
    forest_evacuation:'森林公園の避難',
    traffic_priority:'交通優先',
    sumo_evacuation:'八朔相撲の避難',
    route_closure:'道路閉鎖',
    vehicle_allocation:'車両配分',
    reroute:'迂回方針',
    shelter_rebalance:'避難所再配分',
    portable_redeploy:'可搬避難所再配置',
    logistics_reallocate:'物流再配分',
    priority_override:'個別優先判断'
  };
  const CAPABILITY_LABELS = {
    priority_fuel:'優先給油協定',
    open_warehouse:'倉庫開放協定',
    deploy_drone_relay:'高専通信・ドローン中継',
    open_school_ground:'学校グラウンド仮設避難',
    deploy_mobile_command:'移動指令所',
    deploy_portable_shelter:'可搬避難所'
  };
  const FINAL_VALUE_LABELS = {
    keep:'予定どおり実施',
    advance:'前倒し',
    cancel:'中止',
    reduce:'縮小',
    none:'展開しない',
    partial:'一部展開',
    full:'全面展開',
    standby:'待機',
    deploy_highground:'高所へ先行展開',
    wait:'待機',
    start_now:'今すぐ開始',
    residents:'住民移動を優先',
    mixed:'住民とイベントを両立',
    event_first:'イベント輸送を優先',
    gradual:'段階的に閉鎖',
    early:'早期閉鎖',
    festival:'相撲会場へ重点配分',
    forest:'森林公園へ重点配分',
    vulnerable_households:'要支援世帯へ重点配分',
    balanced:'分散配分',
    shortest:'最短経路へ集中',
    distributed:'複数経路へ分散',
    hold:'現状維持',
    move_people:'人を別避難所へ移す',
    open_temporary:'臨時避難所を開設',
    move_highground:'高所へ再配置',
    equal:'均等配分',
    critical_sites:'重要拠点を優先',
    system_priority:'システム優先順位を維持',
    manual_override:'手動で優先順位を変更'
  };
  function finalChoiceLabel(k,v){ return (FINAL_DECISION_LABELS[k]||k)+'：'+(FINAL_VALUE_LABELS[v]||v); }
  function riskLabel(risk){ return risk>=4?'危険':risk>=2?'注意':'低い'; }
  function load(){ try{ const x=localStorage.getItem(KEY); if(x) return JSON.parse(x); }catch(e){} return window.ADHOMS_VER1_STATE.createInitialState(); }
  function save(){ localStorage.setItem(KEY, JSON.stringify(window.ADHOMS_LIGHT_STATE)); }
  function eventResolved(id,state=window.ADHOMS_LIGHT_STATE){
    const ev=window.ADHOMS_VER1_EVENTS.getEvent(id);
    if(!ev||!state)return false;
    return Object.keys(ev.choices).some(cid=>!!state.flags?.[id+':'+cid]);
  }
  function year4Resolved(state=window.ADHOMS_LIGHT_STATE){
    if(!state)return false;
    return Object.keys(state.flags||{}).some(key=>key.startsWith('y4_strategy:')&&state.flags[key]);
  }
  function loadFinalRecord(){
    try{
      const raw=localStorage.getItem(FINAL_KEY);
      if(!raw)return null;
      const record=JSON.parse(raw);
      if(!record||!['active','recovery','result','epilogue'].includes(record.stage)||!record.session)return null;
      return record;
    }catch(e){ return null; }
  }
  function saveFinalRecord(stage,session){ localStorage.setItem(FINAL_KEY,JSON.stringify({stage,session})); }
  function clearFinalRecord(){ localStorage.removeItem(FINAL_KEY); }
  function host(){ let e=document.getElementById('ver1Choice'); if(e) return e; e=document.createElement('div'); e.id='ver1Choice'; e.className='ver1Choice'; document.body.appendChild(e); const s=document.createElement('style'); s.textContent='.ver1Choice{display:none;position:fixed;inset:0;z-index:95;background:rgba(2,7,10,.9);padding:16px;align-items:center;justify-content:center}.ver1Choice.on{display:flex}.ver1ChoiceCard{width:min(100%,520px);max-height:92vh;overflow:auto;background:#101821;border:1px solid #385267;border-radius:18px;padding:16px}.ver1ChoiceCard h2{font-size:20px;margin:6px 0 8px}.ver1ChoiceCard p{font-size:13px;line-height:1.7;color:#c4d0da}.ver1ChoiceGrid{display:grid;gap:8px;margin-top:12px}.ver1ChoiceBtn{border:1px solid #34495a;background:#111b24;color:#eaf1f7;border-radius:12px;padding:12px;text-align:left;font-size:13px;line-height:1.55}.ver1ChoiceBtn.selected{border-color:#72a6bd;background:#182b37}.ver1Kicker{font-size:10px;letter-spacing:.08em;color:var(--ac)}.ver1Status,.ver1Capability{margin-top:10px;padding:10px;border:1px solid #273545;border-radius:10px;background:#0d141c;color:#9fb0c0;font-size:11px;line-height:1.6}.ver1Danger{border-color:#7b4a4f;background:#241519}'; document.head.appendChild(s); return e; }
  function syncLegacy(){
    const q=window.ADHOMS_LIGHT_STATE;
    // Light state uses the April-based trial year and the actual calendar month.
    // The legacy UI increments its year in January, not in April.
    S.year=q.year+(q.month<4?1:0);
    S.month=q.month;
    S.trust=35+q.town.trust*12;
    S.resilience=30+Math.round((q.town.networkResilience+q.town.distributedCapacity+q.town.environmentalBuffer)/3)*14;
    updateTop();
  }
  function showEvent(id){
    const ev=window.ADHOMS_VER1_EVENTS.getEvent(id);
    if(!ev||eventResolved(id)) return;
    const h=host();
    let buttons='';
    Object.entries(ev.choices).forEach(([cid,c])=>buttons += '<button class="ver1ChoiceBtn" data-c="'+cid+'">'+c.label+'</button>');
    h.innerHTML='<div class="ver1ChoiceCard"><div class="ver1Kicker">FIELD DECISION / YEAR '+ev.year+'</div><h2>'+ev.title+'</h2><p>施策の影響は後年に別の形で返ります。</p><div class="ver1ChoiceGrid">'+buttons+'</div></div>';
    h.classList.add('on');
    h.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{
      if(eventResolved(id)){ h.classList.remove('on'); return; }
      window.ADHOMS_LIGHT_STATE=window.ADHOMS_VER1_EVENTS.resolveChoice(window.ADHOMS_LIGHT_STATE,id,b.dataset.c);
      save();
      syncLegacy();
      h.classList.remove('on');
      toast('選択を記録。影響は後年に返ります');
    });
  }
  function showY3(){
    const r=window.ADHOMS_VER1_PROPAGATION.applySideEffects(window.ADHOMS_LIGHT_STATE);
    window.ADHOMS_LIGHT_STATE=r.state;
    save();
    const h=host();
    const replayRules=window.ADHOMS_VER1_PROPAGATION.SIDE_EFFECT_RULES.filter(rule=>window.ADHOMS_LIGHT_STATE.flags[rule.sourceFlag]&&window.ADHOMS_LIGHT_STATE.flags['resolved:'+rule.id]);
    const reportRules=r.applied.length?r.applied:replayRules;
    const lines=reportRules.length?reportRules.map(x=>'・'+x.summary).join('<br>'):'大きな副作用はまだ顕在化していません。';
    h.innerHTML='<div class="ver1ChoiceCard"><div class="ver1Kicker">YEAR 3 / SIDE EFFECTS</div><h2>去年の「正解」が、別の場所で動き始めた。</h2><p>'+lines+'</p><div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" id="v1ok">確認して進む</button></div></div>';
    h.classList.add('on');
    h.querySelector('#v1ok').onclick=()=>{
      window.ADHOMS_LIGHT_STATE.flags.y3_ack=true;
      save();
      h.classList.remove('on');
    };
  }
  function showY4(){
    if(year4Resolved())return;
    const h=host();
    const context=window.ADHOMS_VER1_PROPAGATION.cooperationOffers(window.ADHOMS_LIGHT_STATE);
    const strategies={repair:'関係修復を優先する',deepen:'届いている協力提案を協定まで深める',authority:'行政権限で標準化を進める',alternative:'別の代替協力網を構築する'};
    let buttons='';
    Object.entries(strategies).forEach(([id,l])=>buttons += '<button class="ver1ChoiceBtn" data-s="'+id+'">'+l+'</button>');
    const offers=context.offers.length
      ? '<div class="ver1Status"><b>いま届いている協力提案</b><br>'+context.offers.map(x=>'・'+x.label).join('<br>')+'</div>'
      : '<div class="ver1Status"><b>いま届いている協力提案</b><br>具体的な協定提案はまだ少ない。</div>';
    const resistance=context.resistance.length
      ? '<div class="ver1Status ver1Danger"><b>過去の負担から残る抵抗</b><br>'+context.resistance.map(x=>'・'+x.label).join('<br>')+'</div>'
      : '<div class="ver1Status"><b>過去の負担から残る抵抗</b><br>強い拒否反応はまだ顕在化していない。</div>';
    h.innerHTML='<div class="ver1ChoiceCard"><div class="ver1Kicker">YEAR 4 / RELATION</div><h2>過去の結果が、今年の手札になった。</h2><p>Relationは好感度ではありません。これまでの説明・負担・協力履歴が、いま頼める相手と使える資源を変えています。</p>'+offers+resistance+'<div class="ver1ChoiceGrid">'+buttons+'</div></div>';
    h.classList.add('on');
    h.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{
      if(year4Resolved()){h.classList.remove('on');return;}
      const r=window.ADHOMS_VER1_PROPAGATION.resolveYear4Strategy(window.ADHOMS_LIGHT_STATE,b.dataset.s);
      window.ADHOMS_LIGHT_STATE=r.state;
      save();
      syncLegacy();
      h.classList.remove('on');
      const commands=window.ADHOMS_VER1_DISASTER.availableEmergencyCommands(window.ADHOMS_LIGHT_STATE)
        .filter(id=>CAPABILITY_LABELS[id])
        .map(id=>CAPABILITY_LABELS[id]);
      toast(commands.length?'手札を更新：'+commands.join('／'):'4年目の方針を記録');
    });
  }
  function showFinal(resumeRecord=null){
    const record=resumeRecord||loadFinalRecord();
    let stage=record?.stage||'active';
    let session=record?.session?structuredClone(record.session):window.ADHOMS_VER1_FINAL.createSession(window.ADHOMS_LIGHT_STATE);
    const h=host();
    function persist(){ saveFinalRecord(stage,session); }
    function renderActive(){
      stage='active';
      persist();
      const p=window.ADHOMS_VER1_FINAL.PHASES[session.phaseIndex];
      let actions='';
      (p.decisions||[]).forEach(k=>{ window.ADHOMS_VER1_FINAL.availableChoices(session,k).forEach(v=>{ const selected=session.decisions[k]===v; actions += '<button class="ver1ChoiceBtn'+(selected?' selected':'')+'" aria-pressed="'+(selected?'true':'false')+'" data-k="'+k+'" data-v="'+v+'">'+(selected?'✓ ':'')+finalChoiceLabel(k,v)+'</button>'; }); });
      if(actions) actions += '<button class="ver1ChoiceBtn" id="v1next">このフェーズを確定して次へ</button>';
      else actions='<button class="ver1ChoiceBtn" id="v1fin">結果を確定する</button>';
      const prepared=session.commands.filter(id=>CAPABILITY_LABELS[id]).map(id=>CAPABILITY_LABELS[id]);
      h.innerHTML='<div class="ver1ChoiceCard '+(session.phaseIndex>=3?'ver1Danger':'')+'"><div class="ver1Kicker">FINAL DAY / '+p.label+'</div><h2>'+p.summary+'</h2><p>避難開始遅延 '+session.derived.evacuationDelayMin+'分 / 物流維持 '+session.derived.logisticsHours+'時間</p><div class="ver1Capability"><b>過去4年で準備できた手札</b><br>'+(prepared.length?prepared.join('／'):'追加資源なし')+'</div><div class="ver1ChoiceGrid">'+actions+'</div><div class="ver1Status">避難上の危険度：高倉千尋 '+riskLabel(session.people.chihiro.risk)+' / 柴垣岳 '+riskLabel(session.people.gaku.risk)+' / TOWA '+riskLabel(session.people.towa.risk)+'</div></div>';
      h.classList.add('on');
      h.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ session=window.ADHOMS_VER1_FINAL.applyDecision(session,b.dataset.k,b.dataset.v); persist(); renderActive(); });
      const n=h.querySelector('#v1next');
      if(n)n.onclick=()=>{ session=window.ADHOMS_VER1_FINAL.nextPhase(session); persist(); renderActive(); };
      const f=h.querySelector('#v1fin');
      if(f)f.onclick=()=>{ session=window.ADHOMS_VER1_FINAL.finalize(session); stage='recovery'; persist(); renderRecovery(); };
    }
    function renderRecovery(){
      stage='recovery';
      persist();
      h.innerHTML='<div class="ver1ChoiceCard"><div class="ver1Kicker">YEAR 5 / 復旧期間</div><h2>豪雨当日の結果を抱えて、残る期間の復旧へ。</h2><p>9月から翌3月まで、生活基盤・事業・Relationの損失を追跡します。最終的な行政評価は5年間の終了時に行います。</p><div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" id="v1recover">9月のFEEDへ進む</button></div></div>';
      h.classList.add('on');
      h.querySelector('#v1recover').onclick=()=>{ h.classList.remove('on'); window.nextMonth(); };
    }
    function renderResult(){
      stage='result';
      persist();
      h.innerHTML='<div class="ver1ChoiceCard"><div class="ver1Kicker">5 YEAR FIELD TRIAL COMPLETE</div><h2>行政評価と、生活の損失は同じではない。</h2><p>人的安全 '+session.result.humanSafety+'<br>生活継続 '+session.result.livelihoodContinuity+'<br>Relation継続 '+session.result.relationContinuity+'</p><div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" id="v1close">エピローグへ</button></div></div>';
      h.classList.add('on');
      h.querySelector('#v1close').onclick=()=>{ stage='epilogue'; persist(); renderEpilogue(); };
    }
    function renderEpilogue(){
      stage='epilogue';
      persist();
      h.innerHTML='<div class="ver1ChoiceCard"><div class="ver1Kicker">EPILOGUE</div><h2>T-0WA：アップデート条件の達成を確認しました。</h2><p>ADHOMSによる継続観測が可能です。</p><p>行政上の成功と、個人の生活に残った損失。その違和感は次の研究課題として残る。</p><div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" id="v1epclose">FEEDへ戻る</button></div></div>';
      h.classList.add('on');
      h.querySelector('#v1epclose').onclick=()=>{ clearFinalRecord(); h.classList.remove('on'); };
    }
    if(stage==='recovery'&&session.result){ h.classList.remove('on'); }
    else if(stage==='result'&&session.result)renderResult();
    else if(stage==='epilogue'&&session.result)renderEpilogue();
    else renderActive();
  }
  function trialMonthIndex(){ return monthIndex(); }
  function trialYear(){ return Math.floor(trialMonthIndex()/12)+1; }
  function eventId(){ const i=trialMonthIndex(); if(i===14)return 'y2_flood'; if(i===18)return 'y2_wildlife'; if(i===21)return 'y2_snow'; return null; }
  window.nextMonth=function(){ originalNextMonth(); window.ADHOMS_LIGHT_STATE.year=trialYear(); window.ADHOMS_LIGHT_STATE.month=S.month; const i=trialMonthIndex(); const id=eventId(); if(id&&!window.ADHOMS_LIGHT_STATE.flags['seen:'+id]){ window.ADHOMS_LIGHT_STATE.flags['seen:'+id]=true; save(); setTimeout(()=>showEvent(id),120); } if(i===24&&!window.ADHOMS_LIGHT_STATE.flags.y3_seen){ window.ADHOMS_LIGHT_STATE.flags.y3_seen=true; save(); setTimeout(showY3,160); } if(i===36&&!window.ADHOMS_LIGHT_STATE.flags.y4_seen){ window.ADHOMS_LIGHT_STATE.flags.y4_seen=true; save(); setTimeout(showY4,160); } save(); };
  window.showEnding=function(){ clearFinalRecord(); window.ADHOMS_LIGHT_STATE.year=5; window.ADHOMS_LIGHT_STATE.month=8; save(); syncLegacy(); showFinal(); };
  window.renderFeed=function(){ originalRenderFeed(); };
  window.ADHOMS_LIGHT_STATE=load(); syncLegacy();
  window.ADHOMS_VER1_DEBUG={ reset(){localStorage.removeItem(KEY);clearFinalRecord();location.reload();}, state(){return structuredClone(window.ADHOMS_LIGHT_STATE);}, final(){return loadFinalRecord()?structuredClone(loadFinalRecord()):null;}, smoke(){return window.ADHOMS_VER1_TEST&&window.ADHOMS_VER1_TEST.run?window.ADHOMS_VER1_TEST.run():null;} };
  host();
  renderFeed();
  const resumedFinal=loadFinalRecord();
  if(resumedFinal){
    setTimeout(()=>showFinal(resumedFinal),0);
  }else{
    const pendingEvent=eventId();
    const index=trialMonthIndex();
    if(pendingEvent&&window.ADHOMS_LIGHT_STATE.flags['seen:'+pendingEvent]&&!eventResolved(pendingEvent)){
      setTimeout(()=>showEvent(pendingEvent),0);
    }else if(index===24&&window.ADHOMS_LIGHT_STATE.flags.y3_seen&&!window.ADHOMS_LIGHT_STATE.flags.y3_ack){
      setTimeout(showY3,0);
    }else if(index===36&&window.ADHOMS_LIGHT_STATE.flags.y4_seen&&!year4Resolved()){
      setTimeout(showY4,0);
    }
  }
})();