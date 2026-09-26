// V1-13. Lightweight state owns the calendar and story choices. This snapshot
// owns routine observation UI only; never restore an older calendar over it.
(() => {
  const KEY = 'adhoms.ver1.daily.v1';
  const numericFields = ['pop', 'life', 'fisc', 'activity'];
  const mapFields = ['likes', 'minus', 'books', 'meetingDone'];
  const priorityKeys = ['life', 'vital', 'future', 'tech', 'env'];
  const calendar = () => ({ year: Math.floor(monthIndex()/12)+1, month: S.month });
  const sameCalendar = (a, b) => a?.year === b?.year && a?.month === b?.month;
  const object = x => x && typeof x === 'object' && !Array.isArray(x);
  const boolMap = x => object(x) ? Object.fromEntries(Object.entries(x).filter(([k,v]) => k.length < 100 && typeof v === 'boolean')) : {};
  function priorities(x) {
    return Object.fromEntries(priorityKeys.filter(k => Number.isFinite(x?.[k]) && x[k]>=20 && x[k]<=100).map(k=>[k,x[k]]));
  }
  let saved;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (_) { /* Keep a fresh UI for malformed saves. */ }
  const valid = saved?.version===1 && object(saved.ui);
  if (valid) {
    for (const key of mapFields) S[key] = boolMap(saved.ui[key]);
    Object.assign(S.values, priorities(saved.ui.values));
    // Research records retain their existing data shape. The active renderer
    // does not interpolate saved text into HTML.
    if (Array.isArray(saved.ui.research)) S.research = saved.ui.research.filter(r=>object(r)&&typeof r.id==='string'&&Number.isFinite(r.due));
    if (sameCalendar(saved.calendar, calendar())) {
      S.week = Number.isInteger(saved.ui.week) ? Math.min(4,Math.max(1,saved.ui.week)) : 1;
      if(saved.meeting){
        // Old pending-meeting saves have no entry week: show essential catch-up
        // rather than treating their already-forced week 4 as a completed read.
        const entry=saved.ui.meetingEntryWeek;
        S.meetingEntry={key:`${S.year}-${S.month}`,week:Number.isInteger(entry)&&entry>=1&&entry<=4?entry:1};
      }
      for (const key of numericFields) if (Number.isFinite(saved.ui[key])) S[key]=saved.ui[key];
      if (cats.some(([key])=>key===saved.ui.filter)) S.filter=saved.ui.filter;
    }
  }
  updateTop();
  renderFilters();
  renderFeed();
  if (valid && sameCalendar(saved.calendar, calendar()) && saved.meeting && !S.meetingDone[`${S.year}-${S.month}`]) {
    openMeeting();
    const review=document.querySelector('.quarterlyReview');
    if(review)review.open=!!saved.reviewOpen;
    const draft=priorities(saved.reviewValues);
    document.querySelectorAll('.monthlyValues input').forEach(input=>{
      if(draft[input.dataset.k]!==undefined)input.value=draft[input.dataset.k];
      input.nextElementSibling.textContent=input.value;
    });
  }

  let warned = false;
  let resetting = false;
  function save() {
    if (resetting || !sameCalendar(calendar(), window.ADHOMS_LIGHT_STATE)) return;
    const ui={week:Math.min(S.week,4),filter:S.filter,values:{...S.values},research:S.research,
      meetingEntryWeek:S.meetingEntry?.key===`${S.year}-${S.month}`?S.meetingEntry.week:null};
    for(const key of [...numericFields,...mapFields])ui[key]=S[key];
    const record={version:1,calendar:calendar(),ui,meeting:document.getElementById('meeting').classList.contains('on'),reviewOpen:!!document.querySelector('.quarterlyReview')?.open,reviewValues:Object.fromEntries([...document.querySelectorAll('.monthlyValues input')].map(input=>[input.dataset.k,Number(input.value)]))};
    try { localStorage.setItem(KEY,JSON.stringify(record)); }
    catch (_) { if(!warned){warned=true;toast('このブラウザでは進行を保存できません。保存設定をご確認ください。');} }
  }
  // Button handlers installed before this script may hold earlier function
  // references. Delegated events persist after those handlers have completed.
  for(const event of ['click','input','change']) document.addEventListener(event,()=>queueMicrotask(save));
  document.addEventListener('toggle',()=>queueMicrotask(save),true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
  window.addEventListener('pagehide',save);
  const reset=window.ADHOMS_VER1_DEBUG.reset;
  window.ADHOMS_VER1_DEBUG.reset=()=>{resetting=true;localStorage.removeItem(KEY);reset();};
})();
