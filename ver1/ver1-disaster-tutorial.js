/* V1-15: Four-week disaster-drill pretrial, separate from the 2029–2034 field calendar. */
(() => {
  'use strict';
  if (!window.ADHOMS_VER1_SESSION || !window.ADHOMS_LIGHT_STATE) return;
  const run=window.ADHOMS_VER1_SESSION;
  const STORAGE='adhoms.ver1.pretrial.v1';
  const MAIN='adhoms.ver1.lightstate';
  // Fictional future SIP challenge: the program title and signatories are
  // story settings, not a claim of a currently adopted government program.
  // SIP's per-challenge leader is styled Program Director (PD).
  const commissioningMail = {
    from:'内閣府SIP「社会システム恒常適応プログラム」プログラムディレクター／石川県知事（連名）',
    to:'河北恒研株式会社　木曽周弥 所長',
    subject:'倶利伽羅町実証実験に向けた最終確認テストの実施依頼',
    paragraphs:[
      '倶利伽羅町における「社会システム恒常適応プログラム」の5年間の実証実験について、正式な実施可否を判断するため、最終確認テストを依頼します。',
      'ADHOMSは、住民や関係機関から届く声を、人・組織のつながりや過去の経緯と照合し、地域の変化に対応するため「誰に何を提案するか」の候補を示す研究システムです。本テストでは、倶利伽羅町の防災訓練を対象に、その働きを1か月間検証します。',
      '毎週届くFEEDから、何を重く扱い、何を軽く扱うかを判断し、ADHOMSの分析に反映してください。提示された提案を専門スタッフと検討し、河北恒研として誰に何を提案するかは木曽所長が決定してください。提案先の返答と翌週以降の変化も確認してください。',
      '終了後、成果だけでなく予測と異なった点や未確認の条件も結果報告書にまとめ、国と県へ提出してください。正式な町実証の承認は、報告の審査後に判断します。'
    ]
  };
  const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function commissioningMailCard() {
    return '<article class="adhomsTrialPost adhomsTrialMail" data-pretrial-opening="sip-governor-mail">'+
      '<b>T-0WA <small>INBOX / メール受信通知</small></b>'+
      '<p>木曽所長、内閣府SIPのプログラムディレクターと石川県知事の連名でメールが届きました。</p>'+
      '<div class="adhomsTrialMailDetail"><div><b>差出人：</b>'+esc(commissioningMail.from)+'</div>'+
      '<div><b>宛先：</b>'+esc(commissioningMail.to)+'</div>'+
      '<div><b>件名：</b>'+esc(commissioningMail.subject)+'</div>'+
      commissioningMail.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div></article>';
  }
  const subjects={
    route:'避難経路',
    attendance:'参加・連絡',
    burden:'準備負担'
  };
  const weeks=[
    {
      title:'事前の観測：防災訓練をどう準備するか',
      brief:'一地区の防災訓練。参加者の少なさだけを問題と決めつけず、住民の事情と担当を調べます。',
      feed:[
        {id:'w1a',who:'坂本 和夫',role:'自治会長',axis:'attendance',text:'今年の防災訓練も参加申込みが少ない。案内は配ったんだけどな。'},
        {id:'w1b',who:'田中 美咲',role:'子育て世帯',axis:'attendance',text:'訓練に行きたいけど、朝は家の用事と重なってしまう。'},
        {id:'w1c',who:'斉藤 由佳',role:'町防災担当',axis:'route',text:'避難所までの道は地図上では接続しています。現地の歩きやすさは未確認です。'},
        {id:'w1d',who:'自治会役員',role:'実施協力者',axis:'burden',text:'会場の準備も受付も、ここ何年か同じ人が引き受けています。'}
      ],
      proposals:[
        {id:'route',axis:'route',target:'町防災担当',action:'避難経路の現地点検を提案',limit:'現地での通行条件は調査前には確定しない。'},
        {id:'attendance',axis:'attendance',target:'地区自治会',action:'参加できない理由と希望時間の聞き取りを提案',limit:'聞けた人だけで地区全体を代表させない。'},
        {id:'burden',axis:'burden',target:'自治会役員',action:'準備作業の担当表と代替人員の確認を提案',limit:'交代できるかは各人の仕事と意思による。'}
      ],
      reaction:{route:'防災担当が現地点検の必要性を認識。まだ通行可能とは断定できない。',
        attendance:'自治会が参加可能な時間を尋ねることにした。全世帯の返事はまだそろっていない。',
        burden:'準備担当表を確認したところ、交代できる人の少なさが論点になった。'}
    },
    {
      title:'計画の見直し：何が足りないのか',
      brief:'追加の声が届きました。訓練参加人数だけでなく、移動と運営の制約を合わせて考えます。',
      feed:[
        {id:'w2a',who:'一人暮らしの住民',role:'高齢者世帯',axis:'route',text:'指定避難所まで行く道に急な坂がある。地図で近くても一人で歩くのは難しい。'},
        {id:'w2b',who:'森川 葵',role:'高校生',axis:'attendance',text:'友達となら参加しやすいけど、申し込みの案内がどこにあるのか分からなかった。'},
        {id:'w2c',who:'自治会役員',role:'実施協力者',axis:'burden',text:'避難誘導の人も受付に回る予定で、当日同時にできるか心配。'}
      ],
      proposals:[
        {id:'route',axis:'route',target:'町防災担当と自治会',action:'徒歩の難しい区間を地図と照合する案を提案',limit:'利用者によって歩行能力が異なる。'},
        {id:'attendance',axis:'attendance',target:'学校・自治会',action:'参加案内の伝達経路を見直す案を提案',limit:'周知が増えても参加可能とは限らない。'},
        {id:'burden',axis:'burden',target:'訓練実行委員',action:'同時刻に重なる役割の再配置を提案',limit:'新たな人員が確保できたとは限らない。'}
      ],
      reaction:{route:'坂の区間が訓練時の観測点になった。代替経路の利用可能性は引き続き調査する。',
        attendance:'学校と自治会で案内方法を比較した。参加可否の制約は残っている。',
        burden:'同じ担当者に二つの役割が重ならない案が検討され、当日の確認項目に追加された。'}
    },
    {
      title:'訓練当日：予測と観測を照合する',
      brief:'防災訓練を実施。訓練参加者の動きが、事前の想定と部分的に食い違いました。',
      feed:[
        {id:'w3a',who:'訓練参加者',role:'住民',axis:'route',text:'案内板はあったけど、曲がり角からは見えなかった。進む方向が少し迷った。'},
        {id:'w3b',who:'受付担当',role:'自治会',axis:'burden',text:'案内係が受付も手伝う予定だったので、開始時に一時的な人手不足が出た。'},
        {id:'w3c',who:'高校生参加者',role:'住民',axis:'attendance',text:'終わってみたら分かりやすかった。次は友達にも声を掛けたい。'}
      ],
      proposals:[
        {id:'route',axis:'route',target:'町防災担当',action:'案内板が見えない地点の再確認を提案',limit:'訓練で見えた条件が実災害でも同じとは限らない。'},
        {id:'burden',axis:'burden',target:'訓練実行委員',action:'受付・誘導の同時稼働を見直す案を提案',limit:'分担変更は追加人員の確保を保証しない。'},
        {id:'attendance',axis:'attendance',target:'自治会と参加住民',action:'参加しやすかった条件の聞き取りを提案',limit:'好意的な参加者の声だけでは不参加理由は分からない。'}
      ],
      reaction:{route:'案内板と曲がり角の見通しが点検課題として記録された。',
        burden:'受付と誘導の作業が重なる時間帯を、次回の運営資料へ記録した。',
        attendance:'参加者の感想を集めたが、不参加の住民についてはまだ分からない。'}
    },
    {
      title:'最終報告：何を確かめられたか',
      brief:'予備実証の最終週。参加、動線、準備負担のうち、予測できたことと未確認のことを分けます。',
      feed:[
        {id:'w4a',who:'藤井 真',role:'実証運営',axis:'burden',text:'訓練は実施できました。ただ、少人数の役員へ負担が残ったことも記録しておきたいです。'},
        {id:'w4b',who:'宮下 沙耶',role:'データ解析',axis:'route',text:'避難経路の想定と現地の動きには差がありました。原因を一つに決めるには追加観測が必要です。'},
        {id:'w4c',who:'水野 悠',role:'社会システム',axis:'attendance',text:'来なかった人も地域の一部です。参加人数だけを成果と呼ぶと、次の問題を見落とします。'}
      ],
      proposals:[
        {id:'route',axis:'route',target:'町防災担当',action:'訓練時の経路評価を次回の検証項目として提案',limit:'現地の災害状況をすべて再現したわけではない。'},
        {id:'burden',axis:'burden',target:'地区自治会',action:'準備担当と交代可能者の継続観測を提案',limit:'担当が増える保証はなく、本人の同意が必要。'},
        {id:'attendance',axis:'attendance',target:'自治会と住民代表',action:'不参加世帯の条件を次回調査へ残す案を提案',limit:'新しい調査も全世帯に届くとは限らない。'}
      ],
      reaction:{route:'経路の見落としを次期検証対象へ登録した。',
        burden:'準備負担の集中を次期検証対象へ登録した。',
        attendance:'参加しない人の理由を次期検証対象へ登録した。'}
    }
  ];
  function initial(){
    let raw;try{raw=JSON.parse(localStorage.getItem(STORAGE));}catch(_){}
    if(raw?.sessionId===run.id && raw?.version===1 &&
       Number.isInteger(raw.week)&&raw.week>=1&&raw.week<=4 &&
       ['offer','intro','staff','feed','meeting','report','approval','complete'].includes(raw.stage) &&
       Array.isArray(raw.decisions) && raw.weights && typeof raw.weights==='object')return raw;
    if(run.resuming)return null; // Do not force established 2029-April saves back to a new prologue.
    return {version:1,sessionId:run.id,stage:'offer',week:1,weights:{},decisions:[],selected:null};
  }
  let trial=initial();
  if(!trial)return;
  function save(){run.write(STORAGE,trial);}
  const weight=(id)=>trial.weights[id]||'normal';
  const numeric=id=>weight(id)==='high'?3:weight(id)==='low'?0.3:1;
  function analysis(){
    const data=weeks[trial.week-1];
    const sums={route:0,attendance:0,burden:0};
    data.feed.forEach(p=>{sums[p.axis]+=numeric(p.id);});
    for(const previous of trial.decisions) if(previous.axis in sums)sums[previous.axis]+=0.2;
    const ordered=data.proposals.map((p,i)=>({...p,score:sums[p.axis],order:i})).sort((a,b)=>b.score-a.score||a.order-b.order);
    return {data,sums,ordered,top:ordered[0],marked:data.feed.filter(p=>weight(p.id)!=='normal')};
  }
  function dialogue(a){
    const subject=subjects[a.top.axis];
    const first='今週のFEEDの重みからは「'+subject+'」を重点として扱っています。ただし重みは事実の証明ではありません。';
    if(trial.week===1)return[
      ['佐伯 直人',first+' まずは提案候補として並べました。'],
      ['宮下 沙耶','佐伯さん、参加人数だけでは原因は分かりません。重く見なかった声も観測記録に残してください。'],
      ['藤井 真','そうそう。沙耶さん、実際にお願いする相手の都合もあるんです。所長、提案してよいことと、実行させることは分けましょう。']
    ];
    if(trial.week===2)return[
      ['水野 悠',first+' 「避難所に行けるか」は道があるかだけの問題ではありませんね。'],
      ['宮下 沙耶','水野さんの指摘は妥当です。ただ、証言があるだけで全世帯に同じ制約があると推定してはいけません。'],
      ['藤井 真','じゃあ、誰に何を聞くかまで決めましょう。役所や自治会の返事をもらう前に実施済みにはできません。']
    ];
    if(trial.week===3)return[
      ['藤井 真','訓練は無事に行えましたが、現場は予定どおりじゃありません。'+subject+'の声も実際に出ました。'],
      ['佐伯 直人','藤井さん、そこが検証できるところです。ADHOMSが想定した条件と、観測されたズレは別々に記録しましょう。'],
      ['宮下 沙耶','そうですね。訓練が終わったことを予測成功と取り違えず、何がまだ分からないかを報告してください。']
    ];
    return [
      ['佐伯 直人',first+' 四週分の違いをMemoryとして残せます。'],
      ['水野 悠','佐伯さん、その記録に数字にならない準備負担や不参加の人も残したいです。'],
      ['宮下 沙耶','両方必要です。ただしこの小地区の一回の訓練で町全体の因果まで証明したとは言えません。'],
      ['藤井 真','だから次の規模で確かめるんですね。誰が参加を決めるのかも忘れずに、所長。']
    ];
  }
  let overlay=null;
  function closeOverlay(){
    document.getElementById('adhomsPretrialOverlay')?.remove();
    document.body.classList.remove('adhomsTrialActive');
    overlay=null;
  }
  function showBanner(){
    let banner=document.getElementById('adhomsPretrialLaunch');
    if(!banner){
      banner=document.createElement('section');banner.id='adhomsPretrialLaunch';
      const main=document.querySelector('main');
      if(main)main.prepend(banner);
    }
    if(!banner)return;
    if(trial.stage!=='offer'||monthIndex()!==0){banner.remove();return;}
    // The first visible tutorial FEED is the official joint email notice.
    banner.innerHTML='<div class="adhomsTrialEyebrow">T-0WA / NEW MAIL RECEIVED</div>'+
      '<h2>国・県から最終確認テストの依頼が届きました</h2>'+
      '<p>内閣府SIP「社会システム恒常適応プログラム」の責任者と石川県知事から、倶利伽羅町での正式実証に先立つ依頼です。</p>'+
      '<p>対象：倶利伽羅町の防災訓練／期間：1か月／提出先：国・石川県。</p>'+
      '<button id="adhomsStartTrial">連名メールを確認する →</button>';
    banner.querySelector('button').onclick=()=>{trial.stage='intro';save();render();};
  }
  function wrap(content){
    if(!overlay){
      overlay=document.createElement('div');overlay.id='adhomsPretrialOverlay';document.body.appendChild(overlay);
    }
    document.body.classList.add('adhomsTrialActive');
    overlay.innerHTML='<div class="adhomsTrialShell"><header class="adhomsTrialHeader"><b>河北恒研</b><span>ADHOMS / 予備実証</span></header><div class="adhomsTrialBody">'+content+'</div></div>';
    overlay.querySelector('.adhomsTrialBody').scrollTop=0;
    window.scrollTo({top:0,behavior:'instant'});
  }
  function intro(){
    wrap('<div class="adhomsTrialEyebrow">PRETRIAL / 最初のFEED</div>'+
      '<h1>国・県からの正式依頼</h1>'+commissioningMailCard()+
      '<p>木曽所長。国と県が求めているのは、訓練の成果だけではなく、ADHOMSの分析から提案、現場の反応までを確かめた記録です。私はその操作を補助します。</p>'+
      '<p>まず研究スタッフを紹介します。そのあと、第1週に届いた町の人たちの声を確認しましょう。</p>'+
      '<button id="adhomsIntroNext" class="adhomsTrialPrimary">スタッフを紹介する →</button>');
    overlay.querySelector('#adhomsIntroNext').onclick=()=>{trial.stage='staff';save();render();};
  }
  function staff(){
    const people=[
      ['宮下 沙耶','データ解析','データの偏りや、見落とした条件を指摘します。'],
      ['佐伯 直人','ADHOMSシステム','予測の根拠や、外れた部分を検証します。'],
      ['水野 悠','社会システム','生活と人間関係のつながりを読み取ります。'],
      ['藤井 真','実証運営','住民との調整や現場で実際にできることを確認します。']
    ];
    wrap('<div class="adhomsTrialEyebrow">PRETRIAL / スタッフ紹介</div><h1>河北恒研・実証チーム</h1>'+
      '<p>所長が社会学の専門知識を持っている必要はありません。判断材料は各分野のスタッフが提示します。意見は必ずしも一致しません。</p>'+
      people.map(x=>'<section class="adhomsTrialStaff"><b>'+x[0]+' <small>'+x[1]+'</small></b><p>'+x[2]+'</p></section>').join('')+
      '<button id="adhomsStaffNext" class="adhomsTrialPrimary">第1週のFEEDへ →</button>');
    overlay.querySelector('#adhomsStaffNext').onclick=()=>{trial.stage='feed';save();render();};
  }
  function feed(){
    const data=weeks[trial.week-1],last=trial.decisions[trial.week-2];
    const reaction=last?weeks[trial.week-2].reaction[last.id]:'';
    wrap('<div class="adhomsTrialEyebrow">地域防災訓練 / 第'+trial.week+'週・FEED</div><h1>'+data.title+'</h1>'+
      '<p>'+data.brief+'</p>'+
      (last?'<section class="adhomsTrialReport"><b>先週の木曽決定からの経過</b><p>'+reaction+'</p></section>':'')+
      '<p class="adhomsTrialHint">「重く」は研究上の注目度。「軽く」は優先度を下げるだけで、事実の否定や賛否ではありません。</p>'+
      data.feed.map(p=>'<article class="adhomsTrialPost"><b>'+p.who+'</b><small>'+p.role+'</small><p>'+p.text+'</p>'+
        '<div class="adhomsTrialWeights">'+[['high','重く'],['normal','通常'],['low','軽く']].map(x=>'<button type="button" data-post="'+p.id+'" data-weight="'+x[0]+'" aria-pressed="'+(weight(p.id)===x[0])+'">'+x[1]+'</button>').join('')+'</div></article>').join('')+
      '<button id="adhomsRunAnalysis" class="adhomsTrialPrimary">ADHOMSで提案を生成し、週次会議へ →</button>');
    overlay.querySelectorAll('[data-post][data-weight]').forEach(btn=>btn.onclick=()=>{
      trial.weights[btn.dataset.post]=btn.dataset.weight;save();feed();
    });
    overlay.querySelector('#adhomsRunAnalysis').onclick=()=>{trial.stage='meeting';trial.selected=null;save();render();};
  }
  function meeting(){
    const a=analysis(),data=a.data,used=dialogue(a);
    wrap('<div class="adhomsTrialEyebrow">予備実証 / 第'+trial.week+'週・スタッフ会議</div><h1>ADHOMS分析と検討</h1>'+
      '<p>重点：<b>'+subjects[a.top.axis]+'</b> ／ 今週の重み変更 '+a.marked.length+'件。未選択のFEEDも観測から消えていません。</p>'+
      '<section class="adhomsTrialReport"><b>ADHOMSの提案候補</b><p>FEEDの重みと前週までの決定を使って候補を並べました。順位は有効性の保証ではありません。</p></section>'+
      '<h2>スタッフの意見</h2>'+used.map(x=>'<div class="adhomsTrialVoice"><b>'+x[0]+'</b><p>'+x[1]+'</p></div>').join('')+
      '<h2>木曽が決定する提案</h2>'+
      a.ordered.map((p,i)=>'<label class="adhomsTrialChoice"><input type="radio" name="adhomsPretrialProposal" value="'+p.id+'" '+(trial.selected===p.id?'checked':'')+'><span><b>'+(i===0?'ADHOMS第1候補：':'別の候補：')+p.target+'</b><br>'+p.action+'<small>'+p.limit+'</small></span></label>').join('')+
      '<p class="adhomsTrialHint">この会議で決めるのは、河北恒研が提案する相手と内容です。実施は相手の判断で、どの案も唯一の正解ではありません。</p>'+
      '<button id="adhomsConfirmProposal" class="adhomsTrialPrimary" '+(trial.selected?'':'disabled')+'>木曽の決定を記録する →</button>');
    overlay.querySelectorAll('input[name="adhomsPretrialProposal"]').forEach(input=>input.onchange=()=>{
      trial.selected=input.value;save();
      overlay.querySelector('#adhomsConfirmProposal').disabled=false;
    });
    overlay.querySelector('#adhomsConfirmProposal').onclick=()=>{
      const selected=a.ordered.find(p=>p.id===trial.selected);
      if(!selected)return;
      if(!trial.decisions.some(x=>x.week===trial.week))trial.decisions.push({week:trial.week,id:selected.id,axis:selected.axis,target:selected.target,action:selected.action});
      trial.stage=trial.week===4?'report':'feed';
      if(trial.week<4)trial.week++;
      trial.selected=null;save();render();
    };
  }
  function report(){
    const summary=trial.decisions.map(x=>'<li>第'+x.week+'週：'+esc(x.target)+'へ「'+esc(x.action)+'」</li>').join('');
    wrap('<div class="adhomsTrialEyebrow">PRETRIAL / 第4週・最終報告</div><h1>国・県への報告書</h1>'+
      '<p>連名メールで依頼された1か月の最終確認テストが終了しました。観測の重み付け、ADHOMSの提案、専門家会議、木曽の決定、次週の検証を4回実施しました。</p>'+
      '<h2>木曽が決定した提案</h2><ol>'+summary+'</ol>'+
      '<section class="adhomsTrialReport"><b>研究上の成果と限界</b><p>避難経路、参加、準備負担について異なる論点を観測しました。一地区での一回の訓練では町全体への一般化はできず、提案先の承諾や実行条件を別途確かめる必要があります。</p><p>これらを記録し、正式な5年間の倶利伽羅町実証の実施可否を判断するための審査資料として提出します。</p></section>'+
      '<button id="adhomsSubmitReport" class="adhomsTrialPrimary">SIP・石川県へ結果報告書を提出する →</button>');
    overlay.querySelector('#adhomsSubmitReport').onclick=()=>{
      trial.submitted=true;
      trial.stage='approval';save();render();
    };
  }
  function approval(){
    wrap('<div class="adhomsTrialEyebrow">SIP / ISHIKAWA・審査結果</div><h1>倶利伽羅町での5年間の実証が条件付きで承認</h1>'+
      '<p>T-0WA：木曽所長。結果報告書が国・石川県に受領され、所定の審査結果が届きました。</p>'+
      '<p>観測と提案、実際の反応を切り分けて検証する方法には継続的な検証価値が認められました。ただし町内の一地区の訓練結果を、町全体の実績とみなすことはできません。</p>'+
      '<section class="adhomsTrialReport"><b>審査結果：条件付き承認</b><p>5年間の倶利伽羅町実証を認める。住民・行政・事業者の判断権限は維持し、観測範囲と未確認条件、提案の受諾状況を継続報告すること。</p><p>国と県は全国展開の判断に向けて評価を続け、実施協力先の倶利伽羅町が各案件の現場調整を担当します。</p></section>'+
      '<button id="adhomsStartMain" class="adhomsTrialPrimary">正式実証・2029年4月へ →</button>');
    overlay.querySelector('#adhomsStartMain').onclick=()=>{
      trial.stage='complete';save();
      const st=window.ADHOMS_LIGHT_STATE;
      st.pretrial={completed:true,submitted:true,weeks:4,decisions:trial.decisions.map(x=>({...x}))};
      run.write(MAIN,st);
      closeOverlay();showBanner();
      window.scrollTo({top:0,behavior:'instant'});
      window.renderFeed();
    };
  }
  function render(){
    showBanner();
    if(trial.stage==='offer'||trial.stage==='complete'){closeOverlay();return;}
    if(trial.stage==='intro')return intro();
    if(trial.stage==='staff')return staff();
    if(trial.stage==='feed')return feed();
    if(trial.stage==='meeting')return meeting();
    if(trial.stage==='report')return report();
    if(trial.stage==='approval')return approval();
  }
  const style=document.createElement('style');
  style.id='adhoms-pretrial-style';
  style.textContent='#adhomsPretrialLaunch{border:1px solid #426d69;border-radius:13px;padding:15px;margin:0 0 14px;background:#11232a}#adhomsPretrialLaunch h2{font-size:16px;margin:0 0 8px}#adhomsPretrialLaunch p{font-size:14px;line-height:1.7}#adhomsPretrialLaunch button,.adhomsTrialPrimary{display:block;width:100%;border:0;border-radius:10px;background:#69d0c7;color:#091816;font-weight:800;font-size:15px;padding:14px 10px;margin-top:15px;cursor:pointer}.adhomsTrialPrimary:disabled{opacity:.45;cursor:not-allowed}body.adhomsTrialActive{overflow:hidden}#adhomsPretrialOverlay{position:fixed;z-index:120;inset:0;display:flex;justify-content:center;background:#061016;color:#eaf1f7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans JP",sans-serif}.adhomsTrialShell{width:min(100%,520px);height:100%;display:flex;flex-direction:column;background:#0b1015}.adhomsTrialHeader{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#0e1820;border-bottom:1px solid #34515c;font-size:14px}.adhomsTrialHeader span{color:#a7c7c4;font-size:12px}.adhomsTrialBody{flex:1;overflow:auto;overscroll-behavior:contain;padding:20px 15px max(25px,env(safe-area-inset-bottom))}.adhomsTrialBody h1{font-size:21px;line-height:1.4;margin:9px 0 15px}.adhomsTrialBody h2{font-size:17px;margin:20px 0 9px}.adhomsTrialBody p{font-size:15px;line-height:1.75}.adhomsTrialBody li{font-size:14px;line-height:1.8}.adhomsTrialEyebrow{font-size:12px;color:#71c9c2;letter-spacing:.04em}.adhomsTrialHint{color:#bed0d7;font-size:13px!important}.adhomsTrialStaff,.adhomsTrialPost,.adhomsTrialVoice,.adhomsTrialReport{margin:11px 0;padding:13px;border:1px solid #344657;border-radius:12px;background:#121f29}.adhomsTrialStaff small,.adhomsTrialPost small{display:block;color:#9fb1c5;margin-top:3px;font-size:12px}.adhomsTrialPost p,.adhomsTrialVoice p,.adhomsTrialStaff p{margin:7px 0}.adhomsTrialReport{border-color:#426d69;background:#10232a}.adhomsTrialWeights{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}.adhomsTrialWeights button{border:1px solid #455d6d;border-radius:9px;padding:9px 5px;font-size:13px;color:#eaf1f7;background:#15212c}.adhomsTrialWeights button[aria-pressed="true"]{background:#254a45;border-color:#69d0c7;color:#ffffff}.adhomsTrialChoice{display:flex;gap:9px;align-items:flex-start;border:1px solid #426d69;border-radius:11px;padding:12px;margin:9px 0;background:#14252c;font-size:14px;line-height:1.7}.adhomsTrialChoice input{width:20px;height:20px;accent-color:#69d0c7;margin-top:3px}.adhomsTrialChoice span{flex:1}.adhomsTrialChoice small{display:block;color:#b6c9d4;font-size:12px;margin-top:5px}';
  style.textContent += '.adhomsTrialMail{border-color:#4f746f;margin:12px 0 20px}.adhomsTrialMail small{display:block;font-size:12px;color:#9eb4c8;margin-top:3px}.adhomsTrialMailDetail{margin-top:12px;padding:12px;background:#0b161d;border-left:2px solid #69d0c7;font-size:13px;line-height:1.8;overflow-wrap:anywhere}.adhomsTrialMailDetail p{font-size:14px;margin:10px 0 0}';
  document.head.appendChild(style);
  save();
  window.ADHOMS_VER1_PRETRIAL={getState:()=>JSON.parse(JSON.stringify(trial)),analysis};
  render();
})();