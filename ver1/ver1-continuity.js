// DL-007/014: authored continuity reads existing history; it never reapplies a
// choice, advances the simulation, or manufactures missing saved decisions.
(() => {
  const fiscalYear=()=>Math.min(5,Math.floor(monthIndex()/12)+1);
  const state=()=>window.ADHOMS_LIGHT_STATE||{flags:{},memories:[],relations:{}};
  const memory=id=>state().memories?.find(m=>m.id===id);
  function chosen(event, ids, memoryPrefix){
    return ids.find(id=>state().flags?.[`${event}:${id}`]) ||
      (memoryPrefix?ids.find(id=>memory(`${memoryPrefix}${id}`)):undefined);
  }
  const decisions={
    flood:{event:'y2_flood',prefix:'flood_',branches:{
      early_close:['早めに道路を止める判断をした。次は閉鎖の連絡を、店が仕込みを始める前に渡せるか確かめたい。','早めの通行止めで危険を避けた一方、低地の店に売上の負担が残った。今度は店を開ける前の予定変更まで聞きたい。','低地の店へ協力を頼む時、あの通行止めの負担を抜きに話は始められない。休む日を先に聞いてから頼む。','通行止めの安全だけで話を閉じなかった記録を持って、今回は搬入を止める連絡先も照合する。'],
      guided_watch:['現地誘導を選んだ。誰かが立っていれば済む、にせず交代できる時間を先に確認したい。','あの冠水では現地誘導に助けられた。ただ、同じ人が毎回立てるわけではなかった。今回は交代できない時間が課題になっている。','現地誘導でつながった相手へ、今回は代役の相談をする。「あの日できた」を毎日の約束にはしない。','誘導してもらった時の連絡網を見直す。今回は現場へ来られない人もいるので、名前だけで人数を数えない。'],
      hard_warning:['強い警告を出す判断をした。急ぐ理由と、いま取れる行動が一緒に届くか見たい。','強い警告の後、早く動けた人と「またか」と読まなくなった人がいた。今回は通知を増やす前に、何を待っているか聞く。','警告を繰り返した時の疲れを覚えている。連絡を受け持つ人には、同じ文を転送するだけでなく確認先も渡したい。','以前の強い警告を見慣れた人にも、今回はどの道をいつ避けるかが必要になる。緊急という言葉だけで済ませない。'],
      logistics_detour:['物流の迂回を選んだ。荷物が届く側だけでなく、車が増える道の生活時間も確認する。','迂回で物流が続いた一方、生活道路に車が増えた。今回は同じ時刻に歩く人が何を変えたか聞いている。','迂回路の沿線へ協力を頼む前に、前回増えた交通の負担を確かめる。道が空いていることと承諾は別だった。','物流の迂回先も避難の道になる。以前車を受け入れた沿線へ、今回は何時まで使えるかを聞き直している。']
    }},
    wildlife:{event:'y2_wildlife',prefix:'wildlife_',branches:{
      capture:['重点捕獲を選んだ。目撃が減った場所だけで対策を終えず、周囲にも連絡先を残したい。','重点捕獲の地区で被害が減り、別側の目撃が増えた。今回はその境目の記録を持ち寄る。','捕獲地区の外へ動いた可能性を、隣の担当へも渡す。去年まで別々だった聞き取りをつなぐ。','捕獲した地区の記録だけでは、変わった経路が追えない。復旧作業の入る場所も重ねて確かめる。'],
      fence:['防護柵を選んだ。柵の内側に加えて、端と隣の道にも注意を向けたい。','防護柵の内側は助かったが、外へ回り込む足跡があった。今度は隣の道の利用時刻を重ねる。','柵を管理する側と、その外の道を使う側で点検の範囲を相談する。境目を誰も見ない状態には戻したくない。','防護柵の効果を引き継ぎつつ、復旧車両の出入りで開く箇所を確認している。以前守れたことだけでは今を判断できない。'],
      food_source:['餌資源管理を選んだ。片付ける人と続けられる頻度まで話を詰めたい。','ゴミ置き場の見直しは、遅れて目撃頻度に表れた。今回は続けてきた当番が休めるようにしたい。','餌を残さない管理は続ける人に支えられていた。新しく頼む相手には、片付けの範囲と休む連絡先を渡す。','餌資源管理を続けてきた記録がある。復旧で仮置き場が変わるので、いつもの場所だけを見回らない。'],
      restrict:['生活圏を制限する判断をした。避けた先で必要になる送迎の時間も聞いておきたい。','通学路の制限で安心が増えた一方、送迎の時間が家庭へ移った。今回は頼れなかった日の事情を聞く。','制限を支えてきた送迎を、毎回同じ家へ頼めない。協力表には断れる日も書いてもらう。','制限した経路の代わりを、以前の送迎だけで賄えるとは限らない。今使える道と家庭の予定を合わせ直す。'],
      survey:['生息域調査を選んだ。調べた場所と、まだ見ていない場所を分けておきたい。','生息域調査から観測点の候補が絞れた。今回は地図の空白にも生活の道があることを確かめる。','調査の地図を、機材を置く人だけでなく日々その道を使う人へ渡している。更新を頼める範囲から決めたい。','調査で残った地図へ、豪雨後に歩けなくなった区間を重ねている。古い観測点へ無理に戻る必要はない。']
    }},
    snow:{event:'y2_snow',prefix:'snow_',branches:{
      trunk_first:['幹線を先に除雪する判断をした。生活道路で待つ時間の見通しも伝えたい。','幹線が開き救急や物流が助かった反面、家の前に雪が残る人がいた。今回は道路から玄関までの待ち時間を追う。','幹線優先の時に残った生活道路の負担を持って、協力を頼む順番を相談している。待った人をまた無言で最後にはできない。','幹線を守った経験を使う。ただ、復旧中の暮らしでは玄関や仮の出入口も変わっている。前の除雪順を写すだけでは足りない。'],
      welfare_first:['福祉と教育を先に支える判断をした。後になる仕事へも遅れの見通しを伝えたい。','学校や医療を優先できた一方、工場や物流に遅れが残った。今回は優先順位と一緒に待つ時間を渡している。','福祉優先を支えた事業者へ、次も黙って待ってとは頼めない。止められる工程を先に聞く。','福祉を優先した時のつながりを使って、通院と仕事の予定を合わせ直す。復旧で変わった出入口も確かめる。'],
      distributed:['地区へ分けて除雪する判断をした。どの地区も遅いままにならないか確認したい。','地区へ分けたことで置き去り感は減ったが、急ぐ移動の速さは伸びなかった。今回は通院時刻と作業順を合わせる。','地区分散の記録を持ち寄り、急ぐ用事の時だけ誰へ連絡するかを相談している。均等な表だけでは決められなかった。','地区に分けた除雪の経験を引き継ぐ。仮の生活拠点が増えた分、同じ配分をそのまま当てない。'],
      schedule_shift:['時差出勤を頼む判断をした。勤務を変えられない人を同じ扱いにしないよう聞きたい。','時差出勤で混乱は減ったが、勤務を動かせない仕事に負担が寄った。今回は固定の訪問時刻を先に残す。','時差出勤に応じた経験から、動かせる予定と動かせない予定を分けて協力を頼む。前回応じた人にも再確認する。','時差出勤の記録を使いながら、復旧と勤務が重なる日を確かめる。以前ずらせた時間が今年も空いているとは限らない。']
    }}
  };
  function decisionText(kind,year){
    const d=decisions[kind],id=chosen(d.event,Object.keys(d.branches),d.prefix);
    return id?d.branches[id][year-2]:({flood:'冠水への施策選択は、この記録ではまだ確かめられない。先に現地の通れる範囲と連絡先を確認する。',wildlife:'獣害対策の選択は、この記録ではまだ確認できない。決まったものとして他の地区へ案内せず、確認済みの痕跡から話す。',snow:'除雪方針の選択は、この記録ではまだ確認できない。どこが先に開くかを約束せず、動けない人の予定を集める。'})[kind];
  }
  function optionalText(kind,year){
    const brine=kind==='brine';
    const first=brine?{universal:'初年度に地名の説明を削った歌詞を比べた',live_test:'初年度に小さなライブで客の感想を聞いた',observe_only:'初年度の曲作りは透たちに任せた'}:{shared_ingredients:'初年度に冷／温で同じ食材を使う試作をした',service_flow:'初年度に昼の十杯を出して片付ける流れを試した',observe_only:'初年度の厨房の調整は二人に任せた'};
    const follow=brine?{compare_takes:'その後、最後の一行を二通り録って聴き比べた',hear_audience:'その後、帰る客に残った一行を聞いた',wait_recording:'最後の一行はメンバーに任せ、音源を待った'}:{counter_flow:'その後、鍋と空いた皿の置き場を確かめた',ask_regulars:'その後、冷／温のどちらをまた頼むか常連に聞いた',leave_to_cooks:'その後の試作も二人に任せ、注文の報告を待った'};
    const memoryId=brine?'optional_brine_genkan':'optional_miso_soba';
    const firstId=chosen(`optional:${kind}`,Object.keys(first));
    const followId=chosen(`optional:${kind}:followup`,Object.keys(follow))||Object.keys(follow).find(id=>memory(memoryId+'_followup')?.tags?.includes(id));
    const history=firstId?first[firstId]+'。':memory(memoryId)?.tags?.includes('autonomous')?(brine?'初年度は曲作りに直接入らず、透たちが進めた音源を待った。':'初年度は直接手を加えず、二人が続けた試作を見守った。'):(brine?'GENKANの記録は残っているが、初回にどこまで手伝ったかは決めつけずに話を続ける。':'味噌だれつけ蕎麦の試作は続いているが、初回の手伝い方は記録を確かめてから話す。');
    const next=brine?[
      '今は、一度聴いた人が次のライブでも口ずさむのかを知りたい。',
      '今回は初めての感想より、何度か聴くうちに違って聞こえた所を尋ねる。',
      'あの録音を持って、今回は人に曲を渡す時にどこまで説明するかを相談している。',
      '積み重ねた録音から、今年の舞台で残したい部分を選ぶ。以前の受け方をそのまま約束にはしない。'
    ]:[
      '今は、特別な試食の日以外にも無理なく出せる量を探している。',
      '今回は同じ味でも、別の人が仕込む時に何が伝わらないかを確かめたい。',
      '今年は教える側が休む日も考えて、レシピだけでは伝わらない手順を渡す。',
      '以前の試作を再開の手がかりにする。材料も人も揃うかを先に確かめ、前と同じ量を約束しない。'
    ];
    const close=(state().relations?.[brine?'brine':'miso_shop']||0)>=2;
    const artifact=brine?{universal:'地名の説明を削った歌詞',live_test:'ライブで受け取った感想',observe_only:'透たちが仕上げた音源'}:{shared_ingredients:'冷／温の共通食材を試したメモ',service_flow:'十杯を出して片付けた時の手順',observe_only:'二人が続けた試作の記録'};
    const followArtifact=brine?{compare_takes:'二通り録った最後の一行',hear_audience:'帰る客が覚えていた一行',wait_recording:'メンバーから届いた録音'}:{counter_flow:'鍋と皿の置き方',ask_regulars:'常連がまた頼みたいと答えた方',leave_to_cooks:'厨房から届いた注文の報告'};
    const retained=year===2?history+(followId?follow[followId]+'。':'二度目の相談で何を一緒に試したかは、確認できた範囲にとどめる。'):
      (firstId?artifact[firstId]+'を残してある。':history)+(followId?followArtifact[followId]+'も見返せる。':'');
    return retained+next[year-2]+(close?(brine?'相談を続けてきたので、未完成の録音も持ち寄れる。':'相談を続けてきたので、忙しい日にできないことも先に言える。'):(brine?'制作の内側まで分かったつもりにならず、聴かせてもらえる範囲から確かめる。':'厨房の都合を知ったつもりにならず、今回頼める範囲から聞く。'));
  }
  function strategyText(year){
    const options={repair:'負担を受けた地区との関係修復',deepen:'協力関係を深めること',authority:'権限集中で準備を進めること',alternative:'別の経路や手段の準備'};
    const id=chosen('y4_strategy',Object.keys(options),'y4_strategy_');
    if(!id)return '今年の協力の進め方は、まだ判断前の記録です。引き受けてもらえる範囲を先に確かめます。';
    const consequences={repair:'前に待ってもらった人へ、今も困っていることを聞きに行く。協力をすぐ取り戻せたとは扱わない。',deepen:'確保できた協力先と、相談の段階の相手を分ける。同じ人へ無制限に頼めるわけではない。',authority:'準備が進んでも、納得が増えたとは限らない。断りにくくなっていないか、担当以外からも聞く。',alternative:'新しい手段を増やすだけでなく、それを使う人の練習と保守の時間も要る。'};
    return (year===4?'今回は':'昨年選んだのは')+options[id]+'。'+consequences[id];
  }
  function cooperationText(year){
    const st=state(),offers=window.ADHOMS_VER1_PROPAGATION?.cooperationOffers(st);
    const commands=window.ADHOMS_VER1_DISASTER?.availableEmergencyCommands(st)||[];
    const commandNames={priority_fuel:'燃料の優先供給',open_warehouse:'倉庫の開放',deploy_drone_relay:'ドローン通信中継',open_school_ground:'学校敷地の利用',deploy_portable_shelter:'可搬型避難所',deploy_mobile_command:'移動指揮'};
    const prepared=commands.map(k=>commandNames[k]).filter(Boolean);
    const sentence=prepared.length?'いま条件を満たすのは'+prepared.join('、')+'。':'いま使える追加資源はまだ確保できていない。';
    const burden=Object.values(st.districts||{}).some(d=>d.burdenMemory>=2||d.localTrust<=1);
    return (year===4?'これまでの関係から協力条件を照合した。':'前年の協力表を、今年の参加可否と突き合わせている。')+sentence+(offers?.offers.length?'協力の申し出があっても、当日の人数と時間は別に確認する。':'新しい協力を当然の人数に入れず、連絡できる相手から聞く。')+(burden?'負担が残る地区には、前の依頼を終えたことにせず話を戻す。':'以前に負担を引き受けた人へも、今回はどこまで協力できるかを聞く。前の返事だけで参加者に数えない。');
  }
  function recoveryText(month){
    const r=window.ADHOMS_VER1_DEBUG?.final()?.session?.result;
    if(!r)return '豪雨後の最終確認がこの記録では揃っていません。人や店が元どおりになったとは書かず、確認を待っています。';
    const lowLife=r.livelihoodContinuity<85,lowRelation=r.relationContinuity<85;
    if(month===9){
      const who={chihiro:'千尋さん',gaku:'岳さん',towa:'TOWAさん'};
      const risks=Object.entries(r.people||{}).filter(([,p])=>p.status!=='safe').map(([key,p])=>(who[key]||key)+(p.status==='critical'?'は重大な危険':'は危険')+'にさらされました');
      return '八月の最終局面の記録です。'+(risks.length?risks.join('。')+'。':'三人とも避難上の危険を抑えられました。')+'これは当日の避難リスクの記録で、今の容体や被害の確定報告ではありません。'+(lowLife?'生活と事業を戻す作業が残っています。':'生活機能が保たれた地区からも、個別の困りごとを集めます。')+'まず変わった受取場所と連絡先を照合し、八月以前の当番表を使うのを止めます。';
    }
    const steps={
      10:lowLife?'九月に照合した受取先へ、今度は米を届ける日の人数を聞いています。運ぶ車があっても降ろせる人がいない。予定を決める順番を、受取の返事が来てからに変えます。':'九月の受取先の記録を、収穫物の配達にも使います。再開している所ほど注文が集中するので、受け取れる数を一軒ずつ聞きます。',
      11:'十月は土曜の受取が合わず、その案を見送りました。冬を前に、今度は荷物を降ろした後に誰が中まで運ぶのかを確認しています。入口の変更を配達の人だけが知っている所は、訪問する人にも伝えます。',
      12:lowRelation?'年末の依頼は、一度断った相手へ別の担当から重ねて頼んでいないか照合します。前の頼み方への不信が残る中で、返事を急かす電話を増やしたくありません。':'年末に何を戻したいか、何を今年は休むかを先に聞いています。続いているつながりを使って、注文や手伝いを頼む前に希望を受け取ります。',
      1:lowLife?'十一月に書き直した入口の記録を、除雪と通院の連絡へ渡しました。復旧中に移した物が通り道を狭めている所を、訪問する側と一緒に見直します。':'冬の訪問先へ、十一月から入口が変わっていないか照会しています。生活機能が戻った所でも、雪で最後の数歩が塞がることがあります。',
      2:'一月は変更点を詳しく集めましたが、その記録を書く仕事が訪問担当へ増えていました。今月は前回から変わった箇所を先に渡す形へ直します。復旧を追う私たちの依頼も、現場の時間を使っていました。',
      3:'九月に作った連絡表へ、その後変わった入口と受取条件を重ねました。来月も確認が必要な用件には、次に連絡する相手を残します。実証が終わる日と、それぞれの暮らしが落ち着く日は揃いません。'
    };
    return steps[month]||'';
  }

  function render(text,year=fiscalYear(),month=S.month){
    return String(text).replace(/\{\{(\w+)\}\}/g,(_,key)=>{
      if(decisions[key])return decisionText(key,year);
      if(key==='brine'||key==='soba')return optionalText(key==='soba'?'miso':key,year);
      if(key==='strategy')return strategyText(year);
      if(key==='cooperation')return cooperationText(year);
      if(key==='recovery')return recoveryText(month);
      throw new Error('Unknown continuity field: '+key);
    });
  }
  function packet(){return window.ADHOMS_CONTINUITY_YEARS?.[fiscalYear()]?.[S.month]||null;}
  function profile(person,key){
    const offset=fiscalYear()-1;
    const age=String(person.age).replace(/^(\d+)(?:〜(\d+))?歳$/,(_,lo,hi)=>`${Number(lo)+offset}${hi?'〜'+(Number(hi)+offset):''}歳`);
    let role=person.role;
    if(offset&&key==='aoi')role='町の若者 / 生活と進路';
    if(key==='minato')role=offset<4?`金沢大学 ${offset+1}年 / 行政の仕事を志望`:'大学での経験を次の進路へ / 行政の仕事を志望';
    return `${age} / ${role}`;
  }
  window.ADHOMS_CONTINUITY={packet,render,profile,fiscalYear};
})();
