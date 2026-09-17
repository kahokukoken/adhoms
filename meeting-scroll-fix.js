(() => {
  const previousOpenMeeting = openMeeting;

  function resetMeetingScroll() {
    const overlay = document.getElementById('meeting');
    const body = document.getElementById('meetingBody');
    const thread = document.querySelector('.meetingThread');

    if (overlay) overlay.scrollTop = 0;
    if (body) body.scrollTop = 0;
    if (thread) thread.scrollTop = 0;

    const prelude = document.querySelector('.meetingPrelude');
    if (prelude) prelude.scrollIntoView({ block: 'start', inline: 'nearest' });
  }

  openMeeting = function openMeetingFromTop() {
    previousOpenMeeting();
    requestAnimationFrame(() => {
      resetMeetingScroll();
      requestAnimationFrame(resetMeetingScroll);
    });
  };
})();
