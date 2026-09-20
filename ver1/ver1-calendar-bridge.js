(() => {
  if (!window.ADHOMS_VER1_FINAL || !window.ADHOMS_LIGHT_STATE || typeof window.nextMonth !== 'function') return;

  const STATE_KEY = 'adhoms.ver1.lightstate';
  const FINAL_KEY = 'adhoms.ver1.finalsession';
  const ver1NextMonth = window.nextMonth;

  function saveLightState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(window.ADHOMS_LIGHT_STATE));
  }

  function advanceLateTrialMonth() {
    S.week = 1;
    S.month += 1;
    if (S.month > 12) {
      S.month = 1;
      S.year += 1;
    }

    drift(1);
    if (S.month === 1 || S.month === 2) S.fisc = Math.max(0, S.fisc - 1);

    const index = monthIndex();
    window.ADHOMS_LIGHT_STATE.year = Math.floor(index / 12) + 1;
    window.ADHOMS_LIGHT_STATE.month = S.month;
    saveLightState();

    updateTop();
    renderFeed();
    setTimeout(() => window.scrollTo({ top: document.querySelector('main').offsetTop, behavior: 'smooth' }), 50);
    toast(`${ym()} のFEEDを受信`);
  }

  function startFinalFromMarch() {
    window.ADHOMS_LIGHT_STATE.year = 5;
    window.ADHOMS_LIGHT_STATE.month = 3;
    saveLightState();

    const session = window.ADHOMS_VER1_FINAL.createSession(window.ADHOMS_LIGHT_STATE);
    localStorage.setItem(FINAL_KEY, JSON.stringify({ stage: 'active', session }));

    // Reload through the normal Ver1 resume path so the final event is rendered by
    // the existing UI bridge without reusing the legacy calendar's December cap.
    location.reload();
  }

  window.nextMonth = function nextMonthWithAprilTrialBoundary() {
    const index = monthIndex();

    if (index < 56) {
      ver1NextMonth();
      return;
    }

    if (index >= 56 && index < 59) {
      advanceLateTrialMonth();
      return;
    }

    if (index === 59) {
      startFinalFromMarch();
      return;
    }

    ver1NextMonth();
  };
})();
