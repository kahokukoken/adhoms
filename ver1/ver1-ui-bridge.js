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
    priority_override:'個別優先判断',
    personal_vehicle_allocation:'個人危機での車両再配分'
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
  function finalChoiceLabel(k,v){ return (FINAL_DECISION_LABELS[k]||k)+'：'+(FINAL_VALUE_LABELS[v]||v)+'を提案'; }
  function riskLabel(risk){ return risk>=4?'危険':risk>=2?'注意':'低い'; }
  const esc = value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function decisionEvidence(id){
    const context=window.ADHOMS_VER1_PERCEPTION?.decisionContext(id);
    if(!context || context.status==='not_applicable')return '';
    if(context.status==='uncertain'){
      return '<div class="ver1Status ver1Danger"><b>判断材料</b><br>このテーマで完了した内部調査はありません。FEED上の観測と既知の記録だけで判断するため、不確実性が残ります。</div>';
    }
    return '<div class="ver1Status"><b>過去に確認した判断材料</b><br>'+esc(context.latest.title)+'：'+esc(context.latest.result)+'</div>';
  }
  function load(){
    const initial=window.ADHOMS_VER1_STATE.createInitialState();
    const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
    // Validate the structures consumed by syncLegacy and subsequent events.
    // Unknown fields survive so existing story/choice saves remain compatible.
    const valid=x=>object(x)&&Number.isInteger(x.year)&&x.year>=1&&x.year<=5&&
      Number.isInteger(x.month)&&x.month>=1&&x.month<=12&&
      ['town','relations'].every(k=>object(x[k])&&Object.keys(initial[k]).every(f=>Number.isFinite(x[k][f])))&&
      object(x.districts)&&Object.keys(initial.districts).every(k=>object(x.districts[k])&&
        Number.isFinite(x.districts[k].localTrust)&&Number.isFinite(x.districts[k].burdenMemory)&&Array.isArray(x.districts[k].tags))&&
      Array.isArray(x.memories)&&x.memories.every(m=>object(m)&&typeof m.id==='string')&&object(x.flags)&&object(x.disaster);
    let parsed;
    try{parsed=JSON.parse(localStorage.getItem(KEY));}catch(_){}
    const resuming=valid(parsed);
    const state=resuming?parsed:initial;
    const legacy=resuming&&typeof state.sessionId!=='string';
    if(typeof state.sessionId!=='string'||!state.sessionId)state.sessionId=crypto.randomUUID();
    const id=state.sessionId;
    let staleWarning=false;
    const ownsSave=()=>{
      try{return JSON.parse(localStorage.getItem(KEY))?.sessionId===id;}catch(_){return false;}
    };
    window.ADHOMS_VER1_SESSION={id,resuming,legacy,ownsSave,write(key,record){
      // An older tab must never resurrect a run replaced by an explicit reset.
      if(!ownsSave()){
        if(!staleWarning){staleWarning=true;toast('保存が別の画面で切り替わりました。この画面を再読み込みしてください。');}
        return false;
      }
      localStorage.setItem(key,JSON.stringify(record));return true;
    }};
    // Persist the primary identity even in April before the first month advance.
    // A weekly-only save must be resumable, and orphan UI fragments must not be.
    try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){}
    return state;
  }
  function save(){ window.ADHOMS_VER1_SESSION.write(KEY,window.ADHOMS_LIGHT_STATE); }
  function eventResolved(id,state=window.ADHOMS_LIGHT_STATE){
    const ev=window.ADHOMS_VER1_EVENTS.getEvent(id);
    if(!ev||!state)return false;
    if(state.proposals?.[id])return true;
    return Object.entries(ev.choices).some(([cid,c])=>!!state.flags?.[id+':'+cid]||state.memories?.some(m=>m.id===c.memory.id));
  }
  function year4Resolved(state=window.ADHOMS_LIGHT_STATE){
    if(!state)return false;
    if(state.proposals?.y4_strategy)return true;
    return Object.keys(state.flags||{}).some(key=>key.startsWith('y4_strategy:')&&state.flags[key])||state.memories?.some(m=>m.id.startsWith('y4_strategy_'));
  }
  function loadFinalRecord(){
    try{
      const raw=localStorage.getItem(FINAL_KEY);
      if(!raw)return null;
      const record=JSON.parse(raw);
      if(!record||!['active','recovery','result','private','directive4','epilogue','complete'].includes(record.stage)||!record.session)return null;
      const run=window.ADHOMS_VER1_SESSION;
      if(record.sessionId!==run.id&&!(run.legacy&&!record.sessionId))return null;
      if(record.session?.result){
        const before=JSON.stringify(record.session.result);
        window.ADHOMS_VER1_FINAL.ensurePersonalOutcomes(record.session.result,record.session.decisions||{});
        if(before!==JSON.stringify(record.session.result))run.write(FINAL_KEY,record);
      }
      if(!record.sessionId){record.sessionId=run.id;run.write(FINAL_KEY,record);}
      return record;
    }catch(e){ return null; }
  }
  function saveFinalRecord(stage,session){ window.ADHOMS_VER1_SESSION.write(FINAL_KEY,{stage,session,sessionId:window.ADHOMS_VER1_SESSION.id}); }
  function clearFinalRecord(){ if(window.ADHOMS_VER1_SESSION.ownsSave())localStorage.removeItem(FINAL_KEY); }
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
    const situation={
      y2_flood:'六月の局地冠水対応です。短時間強雨で低い道路や搬入口が先に使えなくなる見込みを受け、道路管理・防災・物流の担当へ相談します。閉鎖を早めれば営業や通勤に負担が移り、様子を見る場合は現地誘導の担当と交代が必要です。全世帯の移動条件までは把握できていません。',
      y2_wildlife:'秋の山際で出没と農地被害が課題になっています。農林・防災・学校と土地を管理する側が、それぞれの範囲で対応を決めます。捕獲や柵は周囲への移動、通学路の制限は送迎負担、餌資源管理や調査は効果が出るまでの時間を考える必要があります。目撃のない場所を安全とは断定できません。',
      y2_snow:'大雪予報を受けた冬季対応です。行政の除雪担当、学校・福祉、事業者へ、どの移動を先に支えるか提案します。幹線と生活道路、送迎と出勤は同じ順番では助けられません。時差対応も各組織が変更できる勤務に限られます。全員が警告どおり動ける前提では選べません。'
    }[id];
    h.innerHTML='<div class="ver1ChoiceCard"><div class="ver1Kicker">FIELD DECISION / YEAR '+ev.year+'</div><h2>'+ev.title+'</h2><p>'+situation+'</p><p>担当組織へ送る対応案を選びます。次の週または月末に相手の返事を確認し、引き受けられた範囲だけ実行へ進みます。住民全員が従うという意味ではなく、負担や対応できない事情も後年に返ります。</p>'+decisionEvidence(id)+'<div class="ver1ChoiceGrid">'+buttons+'</div></div>';
    h.classList.add('on');
    h.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{
      if(eventResolved(id)){ h.classList.remove('on'); return; }
      window.ADHOMS_LIGHT_STATE=window.ADHOMS_VER1_EVENTS.proposeChoice(window.ADHOMS_LIGHT_STATE,id,b.dataset.c);
      window.ADHOMS_LIGHT_STATE.proposals[id].week=S.week;
      save();
      syncLegacy();
      renderFeed();
      h.classList.remove('on');
      toast('提案を送りました。次の観測で担当からの返事を確認します');
    });
  }
  function showY3(){
    const r=window.ADHOMS_VER1_PROPAGATION.applySideEffects(window.ADHOMS_LIGHT_STATE);
    window.ADHOMS_LIGHT_STATE=r.state;
    save();
    syncLegacy();
    renderFeed();
    const h=host();
    const replayRules=window.ADHOMS_VER1_PROPAGATION.SIDE_EFFECT_RULES.filter(rule=>window.ADHOMS_LIGHT_STATE.flags[rule.sourceFlag]&&window.ADHOMS_LIGHT_STATE.flags['resolved:'+rule.id]);
    const reportRules=r.applied.length?r.applied:replayRules;
    const lines=reportRules.length?reportRules.map(x=>'・'+x.summary).join('<br>'):'大きな副作用はまだ顕在化していません。';
    h.innerHTML='<div class="ver1ChoiceCard"><div class="ver1Kicker">YEAR 3 / SIDE EFFECTS</div><h2>去年の「正解」が、別の場所で動き始めた。</h2><p>'+lines+'</p><div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" data-revisit="burden">負担を受けた側へ、次に必要な条件を聞く</button><button class="ver1ChoiceBtn" data-revisit="cooperation">対応に協力した側へ、次も頼める範囲を聞く</button><button class="ver1ChoiceBtn" id="v1ok">記録を受け取り、今は追加で聞かない</button></div></div>';
    h.classList.add('on');
    h.querySelectorAll('[data-revisit]').forEach(b=>b.onclick=()=>{
      window.ADHOMS_VER1_SUPPORT.proposeRevisit(b.dataset.revisit);
      window.ADHOMS_LIGHT_STATE.flags.y3_ack=true;save();h.classList.remove('on');
    });
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
    const strategies={repair:'関係修復を優先する',deepen:'届いている協力提案を協定まで深める',authority:'担当者へ共通の受入条件を相談する',alternative:'ラボへ代替経路の協力を相談する'};
    let buttons='';
    Object.entries(strategies).forEach(([id,l])=>buttons += '<button class="ver1ChoiceBtn" data-s="'+id+'">'+l+'</button>');
    const offers=context.offers.length
      ? '<div class="ver1Status"><b>いま届いている協力提案</b><br>'+context.offers.map(x=>'・'+x.label).join('<br>')+'</div>'
      : '<div class="ver1Status"><b>いま届いている協力提案</b><br>具体的な協定提案はまだ少ない。</div>';
    const resistance=context.resistance.length
      ? '<div class="ver1Status ver1Danger"><b>過去の負担から残る抵抗</b><br>'+context.resistance.map(x=>'・'+x.label).join('<br>')+'</div>'
      : '<div class="ver1Status"><b>過去の負担から残る抵抗</b><br>強い拒否反応はまだ顕在化していない。</div>';
    h.innerHTML='<div class="ver1ChoiceCard"><div class="ver1Kicker">YEAR 4 / RELATION</div><h2>過去の結果が、今年の手札になった。</h2><p>Relationは好感度ではありません。これまでの説明・負担・協力履歴が、いま相談できる相手を変えています。提案を出しただけでは協定は成立しません。次の観測で、各組織が引き受ける範囲と断る条件を確認します。</p><p>可搬避難所の準備は、協定を深める案か共通条件を相談する案に含めます。工場・物流の搬送と倉庫の保管・受渡しが引き受けられた場合に、避難所担当が既存拠点の設置区画と機材を確認します。学校敷地の開放は別の協力です。</p>'+offers+resistance+'<div class="ver1ChoiceGrid">'+buttons+'</div></div>';
    h.classList.add('on');
    h.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{
      if(year4Resolved()){h.classList.remove('on');return;}
      window.ADHOMS_LIGHT_STATE=window.ADHOMS_VER1_PROPAGATION.proposeYear4Strategy(window.ADHOMS_LIGHT_STATE,b.dataset.s);
      window.ADHOMS_LIGHT_STATE.proposals.y4_strategy.week=S.week;
      save();
      syncLegacy();
      renderFeed();
      h.classList.remove('on');
      const commands=window.ADHOMS_VER1_DISASTER.availableEmergencyCommands(window.ADHOMS_LIGHT_STATE)
        .filter(id=>CAPABILITY_LABELS[id])
        .map(id=>CAPABILITY_LABELS[id]);
      toast('協力の相談を送りました。相手の返事を待ちます');
    });
  }
  function showFinal(resumeRecord=null){
    const record=resumeRecord||loadFinalRecord();
    let stage=record?.stage||'active';
    let session=record?.session?structuredClone(record.session):window.ADHOMS_VER1_FINAL.createSession(window.ADHOMS_LIGHT_STATE);
    session=window.ADHOMS_VER1_FINAL.migratePortableCapacity(session,stage);
    const h=host();
    function persist(){ saveFinalRecord(stage,session); }
    const escapeText=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    const routeNames={station_route:'駅方面の経路',forest_route:'森林公園側の経路',festival_route:'八朔相撲会場側の経路'};
    function incidentMarkup(){
      // nextPhase clones its input: preview the current phase's incident without
      // advancing or persisting state, using the same rule as confirmation.
      const incidents=stage==='active'?window.ADHOMS_VER1_FINAL.nextPhase(session).incidents:session.incidents;
      return '<div class="ver1Incidents">'+(incidents?.length?'<b>当日の経過：各観測時点の記録</b>':'')+(incidents||[]).map(i=>'<p>'+escapeText(i.text.replace(/station_route|forest_route|festival_route/g,key=>routeNames[key]))+'</p>').join('')+'</div>';
    }
    function towaOutcomeText(){
      const towa=session.result?.personalOutcomes?.towa;
      if(!towa)return 'TOWAの個別結果は、この保存にはまだ記録されていません。';
      const start=towa.evacuationStart==='delayed'
        ? '森林公園の避難開始を待機する判断が、避難の遅れとして残りました。'
        : towa.evacuationStart==='immediate'
          ? '森林公園の避難開始を今すぐ行う判断を記録しています。'
          : '避難開始の判断はこの保存に記録がありません。遅れの有無は補いません。';
      return 'TOWA：生存。重傷なし。'+start+'当日の危険度と、確認された身体の状態は別に記録します。';
    }
    function allocationHistory(){
      const before=FINAL_VALUE_LABELS[session.decisions.vehicle_allocation];
      const target=FINAL_VALUE_LABELS[session.decisions.personal_vehicle_allocation];
      if(session.decisions.priority_override==='manual_override'){
        return target?(before||'夕方の配分先は未記録')+' → '+target:'手動変更の判断はありますが、再配分先は記録されていません。';
      }
      if(session.decisions.priority_override==='system_priority'){
        return before?before+'を維持':'維持を選択しましたが、夕方の配分先は未記録です。';
      }
      return '個人危機での配分判断は未記録です。';
    }
    function personalCrisisMarkup(){
      const situation=window.ADHOMS_VER1_FINAL.narrativeContext(session);
      const before=FINAL_VALUE_LABELS[session.decisions.vehicle_allocation]||'未記録';
      return '<div class="ver1Status"><b>三地点の状況と、限られた避難車両</b><br>'
        +'真知は味噌店の樽・帳簿・家族を気にして避難が遅れかけています。生活側の避難を支える車両が必要です。<br>'
        +'晃生は八朔相撲会場側で撤収・誘導に残っています。会場側の経路障害と、残る人の移動を見ます。<br>'
        +escapeText(situation.towaSituation+situation.forestEvacuation)+'<br><br>'
        +'<b>夕方に決めた車両配分</b>：'+before+'<br>'
        +'配分を維持するか、ここで同じ車両を配り直します。一地点への重点配分は、その地点の避難を助ける一方、他の二地点への車両を手薄にします。分散配分は三地点を少しずつ支えます。今の危険度からの変化は、前の割当と他の判断によって異なります。追加の車両が増える判断ではありません。<br>'
        +'個人的関係を理由に手動変更する場合は、決め方への正統性も下がります。危険度の変化は、負傷や死亡の確定ではありません。<br>'
        +'<b>今回の配分</b>：'+allocationHistory()+'</div>';
    }
    function renderActive(){
      stage='active';
      persist();
      const p=window.ADHOMS_VER1_FINAL.PHASES[session.phaseIndex];
      let actions='';
      (p.decisions||[]).forEach(k=>{ window.ADHOMS_VER1_FINAL.availableChoices(session,k).forEach(v=>{ const selected=session.decisions[k]===v; actions += '<button class="ver1ChoiceBtn'+(selected?' selected':'')+'" aria-pressed="'+(selected?'true':'false')+'" data-k="'+k+'" data-v="'+v+'">'+(selected?'✓ ':'')+finalChoiceLabel(k,v)+'</button>'; }); });
      if(actions){
        const needsTarget=p.id==='personal_crisis'&&session.decisions.priority_override==='manual_override'&&!session.decisions.personal_vehicle_allocation;
        actions += (needsTarget?'<p>再配分先を選んでから確定してください。</p>':'')+'<button class="ver1ChoiceBtn" id="v1next"'+(needsTarget?' disabled':'')+'>このフェーズを確定して次へ</button>';
      }
      else actions='<button class="ver1ChoiceBtn" id="v1fin">結果を確定する</button>';
      const prepared=session.commands.filter(id=>CAPABILITY_LABELS[id]).map(id=>CAPABILITY_LABELS[id]);
      h.innerHTML='<div class="ver1ChoiceCard '+(session.phaseIndex>=3?'ver1Danger':'')+'"><div class="ver1Kicker">FINAL DAY / '+p.label+'</div><h2>'+escapeText(window.ADHOMS_VER1_FINAL.narrativeContext(session).summary)+'</h2>'+incidentMarkup()+(p.id==='personal_crisis'?personalCrisisMarkup():'')+Object.entries(session.actionResponses||{}).filter(([k,r])=>p.decisions?.includes(k)&&r.status==='accepted').map(([k,r])=>'<p data-response-key="'+k+'">'+escapeText(r.text)+'</p>').join('')+'<p class="ver1Forecast">現在の選択に基づく見通し：避難開始遅延 '+session.derived.evacuationDelayMin+'分 / 物流維持 '+session.derived.logisticsHours+'時間</p><div class="ver1Capability"><b>過去4年で準備できた手札</b><br>'+(prepared.length?prepared.join('／'):'追加資源なし')+(session.state.supportModelVersion===1&&!session.commands.includes('deploy_portable_shelter')?'<br>可搬避難所：'+escapeText((session.state.portablePreparation?.status==='incomplete'?session.state.portablePreparation.text:null)||'機材・設置区画・搬送・受渡しの準備記録がそろっていないため、展開は選べません。'):'')+(session.state.supportModelVersion===1&&!session.commands.includes('deploy_mobile_command')?'<br>移動指令所：移動拠点用の追加車両と通信・電源の双方の提供がそろっていないため、展開は選べません。':'')+(session.state.portablePreparation?.status==='secured'&&session.commands.includes('deploy_portable_shelter')?'<br>可搬機材：準備済み120人分／現在の展開容量 '+session.derived.shelterCapacity.portable+'人分。未展開の機材は収容人数に含めません。':'')+(!session.state.supportModelVersion?'<br>旧保存の利用条件を継承しています。保存されていない相手の承諾は補っていません。':'')+'</div><details class="ver1SupportNotes"><summary>担当・支援条件を確認</summary><p>開催や通行は運営・道路管理の担当が判断し、輸送や拠点支援は既存の協定範囲で調整します。ADHOMSから案を渡し、担当側の返事を確認します。</p><p>燃料・倉庫・ドローンは協力条件の記録です。この版では、それぞれを単独で使用した追加効果は計算していません。</p></details><div class="ver1ChoiceGrid">'+actions+'</div><div class="ver1Status">避難上の危険度：高倉真知 '+riskLabel(session.people.chihiro.risk)+' / 柴垣晃生 '+riskLabel(session.people.gaku.risk)+' / TOWA '+riskLabel(session.people.towa.risk)+'</div></div>';
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
      const personal=session.result?.personalOutcomes||{};
      const machi=personal.chihiro;
      const kosei=personal.gaku;
      const outcome='<div class="ver1Status"><b>確認された個別結果</b><br>'
        +(machi?'高倉真知：生存。重傷なし。高倉味噌店の設備・蔵・在庫に大きな損失が残り、家業継続が危機。<br>':'')
        +(kosei?'柴垣晃生：生存。八朔相撲会場側で取り残される過程で負傷し、すぐ競技へ戻れる状態ではない。<br>':'')
        +towaOutcomeText()+'<br><b>個人危機での車両配分</b>：'+allocationHistory()
        +'</div>';
      h.innerHTML='<div class="ver1ChoiceCard"><div class="ver1Kicker">YEAR 5 / 復旧期間</div><h2>豪雨当日の結果を抱えて、残る期間の復旧へ。</h2>'+incidentMarkup()+'<p>当日の避難上の危険度：高倉真知 '+riskLabel(session.people.chihiro.risk)+' / 柴垣晃生 '+riskLabel(session.people.gaku.risk)+' / TOWA '+riskLabel(session.people.towa.risk)+'。危険度は当日の避難リスクで、下の個別結果とは別の記録です。</p>'+outcome+'<p>9月から翌3月まで、生活基盤・事業・Relationの損失を追跡します。最終的な行政評価は5年間の終了時に行います。</p><div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" id="v1recover">9月のFEEDへ進む</button></div></div>';
      h.classList.add('on');
      h.querySelector('#v1recover').onclick=()=>{ h.classList.remove('on'); window.nextMonth(); };
    }
    function administrativeLossLine(){
      const r=session.result;
      if(r.livelihoodContinuity<70)return '生活・事業継続には大きな損失が残っています。人的被害の抑制とは別に、復旧・事業継続支援が必要です。';
      if(r.livelihoodContinuity<85)return '生活・事業継続には損失が残っています。人的被害の抑制とは別の評価項目として記録します。';
      return '生活継続は全体指標では維持されました。ただし、個別の家業・生活基盤の損失は平均値とは別に記録します。';
    }
    function privateScenePlace(){
      // Evacuation risk is not a confirmed injury or hospitalization outcome.
      // Use only the established non-medical result-dependent venues.
      if(session.result.livelihoodContinuity<70)return '復旧現場脇の仮設休憩所';
      if(session.result.relationContinuity<70)return '避難所の撤収前';
      return '撤収後のステージ裏';
    }
    function renderResult(){
      stage='result';
      persist();
      const humanLine=session.result.humanSafety>=60
        ? '人的被害の軽減は、実証成果として評価されました。'
        : '人的安全には課題が残り、追加検証が必要と評価されました。';
      h.innerHTML='<div class="ver1ChoiceCard" data-ending-stage="administrative"><div class="ver1Kicker">5 YEAR FIELD TRIAL COMPLETE</div><h2>5年間の実証評価会議</h2><p><b>ADMINISTRATIVE REVIEW</b></p><p>国・県・町、研究側が実証結果を行政指標として確認する。</p><p>行政評価と、生活の損失は同じではない。</p><div class="ver1Status"><b>行政評価</b><br>人的安全 '+session.result.humanSafety+' / 生活継続 '+session.result.livelihoodContinuity+' / Relation継続 '+session.result.relationContinuity+'<br>'+humanLine+'<br>'+administrativeLossLine()+'<br><br><b>個別残差</b><br>高倉真知：生存・重傷なし。ただし高倉味噌店の設備・蔵・在庫に大きな損失が残り、家業継続が危機。<br>柴垣晃生：生存。八朔相撲会場側で取り残される過程で負傷し、競技へすぐ戻れる状態ではない。<br>'+towaOutcomeText()+'</div><p><b>木曽</b>：……。</p><p>評価は間違っていない。けれど、木曽には結果と実感のずれをまだ言葉にできない。</p><div class="ver1Capability"><b>T-0WA</b><br>アップデート条件の達成を確認しました。ADHOMSによる継続観測が可能です。</div><div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" id="v1close">会議を終える</button></div></div>';
      h.classList.add('on');
      h.querySelector('#v1close').onclick=()=>{ stage='private'; persist(); renderPrivate(); };
    }
    function renderPrivate(){
      stage='private';
      persist();
      const place='三月・評価会議のあと／'+privateScenePlace();
      h.innerHTML='<div class="ver1ChoiceCard" data-ending-stage="private"><div class="ver1Kicker">PRIVATE CONVERSATION / TOWA</div><h2>'+place+'</h2><p>TOWAは豪雨を生き延び、重傷は負わなかった。あの時の避難の記録を残し、実証評価会議のあと、二人だけで話せるこの場所へ移り、木曽と向き合う。</p><p><b>TOWA</b>：覚えてる？ 大学の学祭。私、スタッフを抜けて有名店に行こうとしてた。</p><p><b>木曽</b>：……永遠。</p><p><b>TOWA</b>：今さら。あのとき、有名だから勧めるなら雑誌でいいって、別の店を出してきた人。</p><p><b>TOWA</b>：店だけじゃなくて、その人がどこから来て、何をしたくて、どう動くかまで見てた。あれから私も、一種類だけ残る強さって本当に強いのかなって考えるようになった。</p><p><b>TOWA</b>：今日の評価も間違いじゃないよ。でも、助かったって数字と、明日から同じ生活に戻れるかは別でしょう。</p><p><b>木曽</b>：……別じゃない。同じ結果の中に、残ってる。</p><p><b>TOWA</b>：それにしても、その端末の声……なんか変な感じするね。</p><p><b>木曽</b>：仕様。今はそこじゃない。</p><div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" id="v1privateclose">会話を終える</button></div></div>';
      h.classList.add('on');
      h.querySelector('#v1privateclose').onclick=()=>{ stage='directive4'; persist(); renderDirective4(); };
    }
    function renderDirective4(){
      stage='directive4';
      window.ADHOMS_LIGHT_STATE.flags['directive:4:seen']=true;
      save();
      persist();
      h.innerHTML='<div class="ver1ChoiceCard" data-ending-stage="directive4" data-directive-number="4"><div class="ver1Kicker">研究リビジョン / 木曽指令 第4号</div><h2>木曽指令 第4号</h2><p>行政・全体評価の数値だけでは、個人・家業・生活基盤の継続を判断できない。その残差を次段階の研究課題として残す。</p><p>まだ答えの名前は付けない。失われたものを平均値の外へ捨てず、次の観測条件へ持ち越す。</p><div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" id="v1directive4">研究原則として記録</button></div></div>';
      h.classList.add('on');
      h.querySelector('#v1directive4').onclick=()=>{
        window.ADHOMS_LIGHT_STATE.flags['directive:4:ack']=true;
        save();
        stage='epilogue';
        persist();
        renderEpilogue();
      };
    }
    function renderEpilogue(){
      stage='epilogue';
      persist();
      h.innerHTML='<div class="ver1ChoiceCard" data-ending-stage="epilogue"><div class="ver1Kicker">EPILOGUE</div><h2>5年間の倶利伽羅町実証を閉じる。</h2><p>継続観測は承認された。第4号には、全体評価では消えてしまう個別の残差が研究課題として残った。</p><p>T-0WAの名前と声の由来は、まだ誰にも説明されていない。</p><div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" id="v1epclose">FEEDへ戻る</button></div></div>';
      h.classList.add('on');
      h.querySelector('#v1epclose').onclick=()=>{ stage='complete'; persist(); h.classList.remove('on'); };
    }
    if(stage==='complete'||(stage==='recovery'&&session.result)){ h.classList.remove('on'); }
    else if(stage==='result'&&session.result)renderResult();
    else if(stage==='private'&&session.result)renderPrivate();
    else if(stage==='directive4'&&session.result)renderDirective4();
    else if(stage==='epilogue'&&session.result)renderEpilogue();
    else renderActive();
  }
  function trialMonthIndex(){ return monthIndex(); }
  function trialYear(){ return Math.floor(trialMonthIndex()/12)+1; }
  function eventId(){ const i=trialMonthIndex(); if(i===14)return 'y2_flood'; if(i===18)return 'y2_wildlife'; if(i===21)return 'y2_snow'; return null; }
  window.nextMonth=function(){ originalNextMonth(); window.ADHOMS_LIGHT_STATE.year=trialYear(); window.ADHOMS_LIGHT_STATE.month=S.month; const i=trialMonthIndex(); const id=eventId(); if(id&&!window.ADHOMS_LIGHT_STATE.flags['seen:'+id]){ window.ADHOMS_LIGHT_STATE.flags['seen:'+id]=true; save(); setTimeout(()=>showEvent(id),120); } if(i===24&&!window.ADHOMS_LIGHT_STATE.flags.y3_seen){ window.ADHOMS_LIGHT_STATE.flags.y3_seen=true; save(); setTimeout(showY3,160); } if(i===36&&!window.ADHOMS_LIGHT_STATE.flags.y4_seen){ window.ADHOMS_LIGHT_STATE.flags.y4_seen=true; save(); setTimeout(showY4,160); } save(); };
  window.showEnding=function(){ clearFinalRecord(); window.ADHOMS_LIGHT_STATE.year=5; window.ADHOMS_LIGHT_STATE.month=8; save(); syncLegacy(); showFinal(); };
  window.renderFeed=function(){ originalRenderFeed(); };
  window.ADHOMS_VER1_UI={syncCanonical:syncLegacy,ensureChoiceHost:host};
  window.ADHOMS_LIGHT_STATE=load(); syncLegacy();
  window.ADHOMS_VER1_DEBUG={ reset(){localStorage.removeItem(KEY);localStorage.removeItem(FINAL_KEY);location.reload();}, state(){return structuredClone(window.ADHOMS_LIGHT_STATE);}, final(){return loadFinalRecord()?structuredClone(loadFinalRecord()):null;}, smoke(){return window.ADHOMS_VER1_TEST&&window.ADHOMS_VER1_TEST.run?window.ADHOMS_VER1_TEST.run():null;} };
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
