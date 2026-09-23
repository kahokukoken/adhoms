// V1-12. Shared typography for the final composed player UI.
(() => {
  const style=document.createElement('style');
  style.id='ver1-readable-ui';
  style.textContent=`
    .post,.feedPrelude p,.about p,.meetingLine,.speech,.sheet p,
    .ver1ChoiceCard p,.ver1ChoiceBtn,.ver1OptionalCard p,.ver1OptionalChoice,
    .meetingObservations,.meetingObservations>p,.meetingPrelude,.meetingContext p,
    .annualReport,.quarterlyReview p{font-size:16px!important;line-height:1.8}
    .who,.speaker,.feedPrelude h2,.ver1OptionalCard h3{font-size:18px!important}
    .meta,.profileLine,.hint,.title,.role,.newtag,.replyto,.rel,.internal,
    .feedPreludeKicker,.currentMonthMarker span,.eyebrow,.minutesHead,.ver1Kicker,
    .ver1Status,.ver1OptionalKicker,.ver1OptionalDone,.brand small,.date span,
    .buildline,.chip,.bottomDate,.monthlyValues label,.toast,.feedEmpty{font-size:13px!important}
    .currentMonthMarker b,.filter,.a,.bottomBtn,.meetingContinue,.quarterlyReview summary{font-size:15px!important}
    .hint,.meta,.profileLine{line-height:1.65}
    .currentMonthMarker{display:block!important}.currentMonthMarker span{display:block;text-align:left!important;margin-top:5px}
    .a,.filter,.bottomBtn,.meetingContinue{min-height:44px}
    .brand small{max-width:240px;line-height:1.5}.top{gap:12px}.logoWrap{min-width:0}.date{flex-shrink:0}
    .buildline{gap:8px;flex-wrap:wrap}.head>div:last-child,.speech{min-width:0}.mark{flex-shrink:0}
    .meetingObservations{border-bottom:1px solid var(--ln);padding-bottom:14px;margin-bottom:18px}
    .meetingObservations h2,.annualReport h2{font-size:18px}.meetingObservations>p{color:var(--mu);font-size:14px}
    .meetingObservations blockquote{margin:12px 0;padding:8px 12px;border-left:2px solid var(--ac);background:#0d141c}
    .meetingObservations blockquote b{font-size:14px}.meetingObservations blockquote p{margin:6px 0}
    .quarterlyReview{padding:14px;border:1px solid #385565;border-radius:12px;margin-top:18px}
    .quarterlyReview summary{cursor:pointer;line-height:1.7}.meetingCard{max-height:94dvh}
    .staffCue{display:none!important}
    .bottombar{grid-template-columns:minmax(0,1fr) 94px minmax(0,1fr)}
    @media(max-width:400px){.klogo{display:none}.brand small{max-width:200px}.bubble{grid-template-columns:28px minmax(0,1fr);gap:6px}.avatar{width:28px;height:28px}.meetingCard{padding:12px}.role{display:block;margin-left:0}.bottomBtn{padding:10px 4px}}
  `;
  document.head.appendChild(style);
})();
