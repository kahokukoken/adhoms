(() => {
  if (!window.ADHOMS_VER1_STATE || !window.ADHOMS_LIGHT_STATE || !window.ADHOMS_VER1_SESSION) return;

  const STATE_KEY = 'adhoms.ver1.lightstate';
  const scenes = window.ADHOMS_YEAR1_STORY_SCENES || {};

  function trialYear() {
    return Math.floor(monthIndex() / 12) + 1;
  }

  function save() {
    window.ADHOMS_VER1_SESSION.write(STATE_KEY, window.ADHOMS_LIGHT_STATE);
  }

  function reconcileVisible() {
    const year = trialYear();
    let next = window.ADHOMS_LIGHT_STATE;
    let changed = false;
    const entries = year > 1
      ? Object.entries(scenes).flatMap(([month, beats]) => (beats || []).map(beat => ({month:Number(month), beat})))
      : (scenes[S.month] || []).map(beat => ({month:S.month, beat}));

    for (const {month, beat} of entries) {
      if (!beat?.memory || !Number.isInteger(beat.w)) continue;
      if (year === 1 && beat.w > Math.min(4, Math.max(1, S.week))) continue;
      if ((next.memories || []).some(memory => memory.id === beat.memory.id)) continue;
      next = window.ADHOMS_VER1_STATE.addMemory(next, {...beat.memory, year:1, month});
      changed = true;
    }

    if (changed) {
      window.ADHOMS_LIGHT_STATE = next;
      save();
    }
    return changed;
  }

  // Initial reconciliation covers fresh entry and older saves whose primary
  // light state already contains the current calendar. daily-session runs a
  // second reconciliation after restoring its saved week.
  reconcileVisible();

  const previousAdvanceWeek = window.advanceWeek;
  window.advanceWeek = function advanceWeekWithStoryHistory() {
    previousAdvanceWeek();
    reconcileVisible();
  };
  const nextWeek = document.getElementById('nextWeek');
  if (nextWeek) nextWeek.onclick = window.advanceWeek;

  const previousOpenMeeting = window.openMeeting;
  window.openMeeting = function openMeetingWithStoryHistory() {
    previousOpenMeeting();
    reconcileVisible();
  };

  const previousNextMonth = window.nextMonth;
  window.nextMonth = function nextMonthWithStoryHistory() {
    previousNextMonth();
    reconcileVisible();
  };

  window.ADHOMS_VER1_STORY_HISTORY = {
    reconcileVisible,
    memoriesFor(entityId) {
      return window.ADHOMS_VER1_STATE.memoriesForEntity(window.ADHOMS_LIGHT_STATE, entityId);
    }
  };
})();
