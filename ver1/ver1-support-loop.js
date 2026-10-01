// DL-020: bounded proposal/response history. Rendering never grants consent.
(() => {
  const state=()=>window.ADHOMS_LIGHT_STATE;
  const ordinal=()=>monthIndex()*4+Math.min(4,Math.max(1,S.week));
  const save=()=>window.ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate',state());
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const BUS_CHOICES={coordinate_days:'双方が無理なく頼める曜日を照合する案を送る',ask_timetable:'運行会社への時刻変更の照会を松本さんに頼む'};
  const BUS_RESPONSES={
    coordinate_days:{status:'accepted_limited',actorId:'misaki',who:'田中 美咲',profile:'38歳 / 主婦 / 子育て世帯',text:'曜日を分けて書く案ならできます。送ってもらえた火曜と、まだ頼めない日を分けて、同じ園の方にも確認することにしました。毎日の当番にはしないでくださいね。相手の仕事もあるし、私も断られた日は別の方法を考えたいです。',continuation:'田中さんから返った曜日別の条件を残しています。火曜の一回を毎日の送迎へ広げず、未確認の日は未確認のまま、本人同士で次の予定を相談します。バスの本数や時刻は変わっていません。'},
    ask_timetable:{status:'unavailable',actorId:'matsumoto',who:'松本',profile:'交通政策係 / 行政',text:'運行会社へ時刻変更を照会する件を受け取りました。いま8時5分の便を動かすことは約束できません。ほかの乗り継ぎと運行側の予定も調整が必要です。田中さんの開園時刻と勤務の条件を添えて、調整中の案件として引き継ぎます。',continuation:'松本さんから、時刻変更は現時点で約束できないと返事がありました。調整中として、園の開く時間と勤務に間に合う条件を残しています。運行時刻が変わったとは記録せず、当面の移動は田中さんたちの相談と分けて追います。'}
  };
  function proposeBus(choice){
    if(monthIndex()!==1||!BUS_CHOICES[choice]||state().supportCases?.bus)return false;
    const next=structuredClone(state());next.supportCases??={};
    next.supportCases.bus={choice,status:'proposed',proposedOrdinal:ordinal(),year:next.year,month:next.month,week:S.week,response:null};
    window.ADHOMS_LIGHT_STATE=next;save();return true;
  }
  function proposeRevisit(choice){
    if(!['burden','cooperation'].includes(choice)||state().supportCases?.spillover)return false;
    const next=structuredClone(state());next.supportCases??={};
    next.supportCases.spillover={choice,status:'proposed',proposedOrdinal:ordinal(),year:next.year,month:next.month,week:S.week,response:null};
    window.ADHOMS_LIGHT_STATE=next;save();return true;
  }
  function replyRevisit(record,st){
    const rules=window.ADHOMS_VER1_PROPAGATION.SIDE_EFFECT_RULES.filter(r=>st.flags['resolved:'+r.id]);
    if(!rules.length)return {status:'unavailable',actorId:'fujii',who:'藤井 真',profile:'河北恒研 / 実証運営',text:'追跡先を確認しましたが、この保存には前年の実行結果が残っていません。どの地区が負担したかを決めつけて依頼せず、元の判断と担当を確認するところから始めます。'};
    const burden=record.choice==='burden';
    const rule=burden?(rules.find(r=>r.delta.districts||Object.values(r.delta.relations||{}).some(v=>v<0))||rules[0]):(rules.find(r=>Object.values(r.delta.relations||{}).some(v=>v>0))||rules[0]);
    const facts=rule.summary;
    // Each response remains tied to the actual source action, not merely season.
    const details={
      y3_snow_trunk_spillover:[
        '生活道路側から「幹線が開いた後も、玄関から出られる時刻を知りたい」と返事がありました。家から道までの待ち時間を次の確認項目にします。',
        '工場・物流側から「幹線が通れて助かったが、次の搬入も同じ時刻とは限らない」と返事がありました。次回の運行時間は別に確認します。'],
      y3_snow_welfare_spillover:[
        '工場・物流側から「福祉優先には反対しないが、どこまで遅れるか先に知らせてほしい」と返事がありました。止められる工程と、待てない搬入を分けて次の相談へ渡します。',
        '学校・福祉側から「優先して通れた道だけでなく、迎えに来る人の予定も確かめたい」と返事がありました。次の送迎を前回と同じ人員で数えません。'],
      y3_snow_schedule_spillover:[
        '勤務を変えられない事業者から「時差出勤に応じられない仕事を先に聞いてほしい」と返事がありました。固定の勤務を変更可能として扱わない条件を残します。',
        '時差対応に応じた側から「前回ずらせた予定も、次は確かめてから」と返事がありました。勤務を変える案と学校側の連絡を一つの承諾にまとめません。'],
      y3_flood_early_close_spillover:[
        '低地の店から「通行止めを、仕込みや客の出発より前に知りたい」と返事がありました。安全の判断と、営業予定を変えられる時間を分けて追います。',
        '道路管理側から「事故回避の記録だけで次も同じ時刻には閉めない」と返事がありました。現況と迂回先を照合してから、次の判断を相談します。'],
      y3_flood_guided_watch_spillover:[
        '現地で誘導した側から「同じ人が毎回立てるわけではない」と返事がありました。交代できない時間を、負担として次の相談へ残します。',
        '誘導に協力した側から「次は交代の連絡先を先に決めたい」と返事がありました。連絡を受ける相手が決まるまで、次回の配置を確保済みにはしません。'],
      y3_flood_warning_fatigue:[
        '通知を受ける側から「緊急という言葉だけでは、前との違いが分からない」と返事がありました。何が変わり、どの行動が取れるかを伝える必要があります。',
        '警告を伝える担当から「通知を増やす前に、受け手が何を待っているか確かめたい」と返事がありました。現地誘導や追加人員があったとは扱いません。'],
      y3_flood_detour_spillover:[
        '生活道路の沿線から「車が増える時間には歩く人もいる」と返事がありました。物流の到着時刻だけでなく、沿線の生活時間を次の確認項目にします。',
        '物流側から「迂回できた道を、次も当然に使えるとは思わない」と返事がありました。運行前に沿線の条件を照合する必要があります。'],
      y3_wildlife_capture_shift:[
        '捕獲地区の外から「こちらの目撃も同じ記録へ入れてほしい」と返事がありました。対象地区の改善で聞き取りを終えず、移動先を確かめます。',
        '捕獲に関わる担当から「同じ場所の捕獲数だけでは経路の変化が追えない」と返事がありました。次の対策前に周囲の記録を合わせます。'],
      y3_wildlife_fence_shift:[
        '柵の外の道を使う側から「端を回った足跡も見てほしい」と返事がありました。内側の防護と外側の移動を分けて次の点検へ渡します。',
        '柵を管理する側から「境目を誰も見ないままにしたくない」と返事がありました。隣の利用者と点検範囲を相談する条件を残します。'],
      y3_wildlife_food_source_gain:[
        '片付けを続ける側から「当番が休める日も必要」と返事がありました。目撃の減少を、作業を無制限に頼める理由にしません。',
        '餌を残さない管理に関わる側から「次の人には片付ける範囲も伝えたい」と返事がありました。作業範囲と断る連絡先を次の依頼に添えます。'],
      y3_wildlife_survey_gain:[
        '調べた場所の周りを使う側から「地図の空白にも生活の道がある」と返事がありました。未観測の場所を安全とせず、次の聞き取り候補へ残します。',
        '調査に関わるラボから「地図の更新を頼める範囲を先に決めたい」と返事がありました。調査のつながりを機材や施設の提供への同意には読み替えません。']
    };
    const detail=details[rule.id]?.[burden?0:1]||'今回の条件について具体的な返事はまだそろっていません。記録以上の実行や協力を補いません。';
    return {status:'information_received',actorId:'fujii',who:'藤井 真',profile:'河北恒研 / 参加者からの返事',sourceRule:rule.id,text:'前年の記録は「'+facts+'」。'+detail+'聞けたことと、次の協力を引き受けてもらえたことは別です。'};
  }
  function settle(){
    if(!state())return false;
    let next=state(),changed=false;
    for(const [id,record] of Object.entries(next.supportCases||{})){
      if(!record||record.status!=='proposed'||!Number.isInteger(record.proposedOrdinal)||record.proposedOrdinal<1||ordinal()<=record.proposedOrdinal)continue;
      const response=id==='bus'?BUS_RESPONSES[record.choice]:id==='spillover'?replyRevisit(record,next):null;
      if(!response)continue;
      next=structuredClone(next);
      next.supportCases[id]={...record,status:'responded',response:{...response,year:next.year,month:next.month,week:S.week,index:monthIndex()}};
      next=window.ADHOMS_VER1_STATE.addMemory(next,{id:'support_'+id+'_reply',week:S.week,entities:[response.actorId],tags:['decision_support',record.choice,response.status],note:response.text,source:{type:'participant-response',id:'support:'+id+':'+record.choice}});
      changed=true;
    }
    for(const [id,record] of Object.entries(next.proposals||{})){
      if(!record||record.status!=='proposed'||!Number.isInteger(record.year)||record.year<1||record.year>5||!Number.isInteger(record.month)||record.month<1||record.month>12||!Number.isInteger(record.week)||record.week<1||record.week>4)continue;
      if(id!=='y4_strategy'&&!window.ADHOMS_VER1_EVENTS.getEvent(id)?.choices[record.choiceId])continue;
      const proposedIndex=(record.year-1)*12+((record.month+8)%12);
      if(ordinal()<=proposedIndex*4+(record.week||1))continue;
      next=id==='y4_strategy'?window.ADHOMS_VER1_PROPAGATION.respondYear4Strategy(next).state:window.ADHOMS_VER1_EVENTS.respondChoice(next,id);
      if(next.proposals?.[id]?.response){next.proposals[id].response.week=S.week;next.proposals[id].response.index=monthIndex();}
      changed=true;
    }
    if(changed){window.ADHOMS_LIGHT_STATE=next;save();window.ADHOMS_VER1_UI.syncCanonical();}
    return changed;
  }
  function rows(index){
    const out=[],st=state();if(!st)return out;
    const bus=st.supportCases?.bus;
    if(index===1){
      const researched=window.ADHOMS_VER1_PERCEPTION?.completedResearch('新年度の移動変化').length;
      out.push({id:'history-support-bus-proposal',key:'fujii',cat:'system',mark:'研',who:'藤井 真',profile:'河北恒研 / 実証運営',w:1,major:true,historyBeat:true,supportCase:'bus',topic:'参加者との調整',text:'田中さんの8時5分の便の続きです。'+(researched?'所長が重みを付けた投稿の調査で、8時の開園、徒歩7分、次の8時40分では勤務に遅れる条件を確認しました。':'四月の本人の投稿と火曜の送迎の返事を読み合わせました。追加の内部調査はしていないので、同じ便で困る世帯数はまだ分かりません。')+'火曜に助かった一回を、毎日の約束にはできません。頼める日を本人同士で照合する案か、松本さんへ時刻変更を照会する案なら出せます。'+(bus?' '+(bus.status==='proposed'?'所長からの提案を送り、相手の返事を待っています。':'相手の返事を受け取りました。受けてもらえた範囲だけを次へ残します。'):'詳しく検討する場合は、この投稿の詳細から選べます。選ばなくても、本人たちの相談は続きます。')});
    }
    for(const [id,record] of Object.entries(st.supportCases||{})){
      const r=record?.response;if(!r||r.index!==index)continue;
      out.push({id:'history-support-'+id+'-reply',cat:r.actorId==='matsumoto'?'office':'resident',mark:'返',who:r.who,profile:r.profile,w:r.week,major:true,historyBeat:true,supportReply:id,text:r.text,topic:'参加者からの返事'});
    }
    if(index===2&&bus?.response){out.push({id:'history-support-bus-continuation',cat:'system',mark:'研',who:'宮下 沙耶',profile:'河北恒研 / データ解析',w:1,major:true,historyBeat:true,supportContinuation:'bus',topic:'参加者との調整',text:bus.response.continuation});}
    for(const [id,p] of Object.entries(st.proposals||{})){
      if(!p||typeof p!=='object')continue;
      const indexProposed=(p.year-1)*12+((p.month+8)%12);
      if(p.status==='proposed'&&indexProposed===index)out.push({id:'history-proposal-pending-'+id,cat:'system',mark:'案',who:'河北恒研・調整案',profile:'提案 / 返事待ち',w:p.week||1,major:true,historyBeat:true,text:'関係する担当へ提案を送りました。返事があるまでは実行済みや資源確保とは扱いません。',topic:'提案の返事'});
      if(p.response?.index===index)out.push({id:'history-proposal-response-'+id,cat:'office',mark:'返',who:'関係担当からの返事',profile:'実行主体 / 条件付きの回答',w:p.response.week||1,major:true,historyBeat:true,text:p.response.text+(id!=='y4_strategy'&&p.response.constraints?.length?' 条件：'+p.response.constraints.join('／'):''),topic:'提案の返事'});
    }
    return out;
  }
  function detail(post){
    if(post.supportCase!=='bus')return false;
    const record=state().supportCases?.bus;
    let actions='';
    if(!record&&monthIndex()===1)actions=Object.entries(BUS_CHOICES).map(([id,label])=>'<button class="ver1ChoiceBtn" data-support-choice="'+id+'">'+esc(label)+'</button>').join('');
    openSheet('<h2>8時5分の便と、頼める日</h2><p>'+esc(post.text)+'</p><p>提案後は次の週、または月末に相手の返事を確認します。所長の選択で運行時刻や誰かの勤務を変更することはできません。</p>'+actions+(record?'<p>'+esc(record.response?.text||'提案済み。まだ返事を待っています。')+'</p>':''));
    document.querySelectorAll('[data-support-choice]').forEach(b=>b.onclick=()=>{if(proposeBus(b.dataset.supportChoice)){closeSheet();renderFeed();}});
    return true;
  }
  const advance=window.advanceWeek;
  window.advanceWeek=function(){advance();if(settle())renderFeed();};
  document.getElementById('nextWeek').onclick=window.advanceWeek;
  const meeting=window.openMeeting;
  window.openMeeting=function(){settle();meeting();};
  const month=window.nextMonth;
  window.nextMonth=function(){month();if(settle())renderFeed();};
  window.ADHOMS_VER1_SUPPORT={proposeBus,proposeRevisit,settle,rows,detail};
})();
