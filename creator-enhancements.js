(() => {
  P.forEach(post => {
    if (post.who === '勇者ノト') {
      post.who = 'クリカ';
      post.meta = post.meta.replace('LOCAL VTUBER', 'LOCAL VTUBER / KURIKARA');
    }
  });

  const greatNotoPosts = [
    {m:0,w:3,id:'gn1',cat:'influencer',mark:'G',who:'グレート・ノト',meta:'VIDEO CREATOR / 突撃配信',topic:'transport',text:'【突撃】終バス逃したら本当に帰れないのか？　深夜の倶利伽羅で徒歩チャレンジ。※コメント欄で地元民から「危ないからやめろ」が殺到中。'},
    {m:1,w:3,id:'gn2',cat:'influencer',mark:'G',who:'グレート・ノト',meta:'VIDEO CREATOR / 現地配信',topic:'wildlife',text:'イノシシ出るって場所、実際に夜行けば会える説。現地から生配信するわ。※視聴者から通報・批判が相次いでいる。'},
    {m:2,w:4,id:'gn3',cat:'influencer',mark:'G',who:'グレート・ノト',meta:'VIDEO CREATOR / 豪雨LIVE',topic:'rain',text:'「危険だから来るな」って言われてる川、今どこまで増えてる？　見に来た。道路ヤバい。※避難情報より映像だけが切り抜かれて拡散中。'},
    {m:4,w:3,id:'gn4',cat:'influencer',mark:'G',who:'グレート・ノト',meta:'VIDEO CREATOR / EVENT',topic:'sumo',text:'八朔相撲に飛び入りしたらどこまで怒られるのか検証！　祭りを知らない視聴者が一気に流入してコメント欄が荒れている。'},
    {m:7,w:2,id:'gn5',cat:'influencer',mark:'G',who:'グレート・ノト',meta:'VIDEO CREATOR / SNOW',topic:'snow',text:'除雪前の道を四駆なら突破できる説。スタックしたらそれも動画になる。※地元から「作業の邪魔」と批判が出ている。'}
  ];

  greatNotoPosts.forEach(post => {
    if (!P.some(existing => existing.id === post.id)) P.push(post);
  });

  renderFeed();
})();
