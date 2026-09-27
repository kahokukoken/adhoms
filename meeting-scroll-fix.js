(() => {
  const previousOpenMeeting = openMeeting;

  function resetMeetingScroll() {
    const overlay = document.getElementById('meeting');
    const body = document.getElementById('meetingBody');
    const card = document.querySelector('.meetingCard');
    const thread = document.querySelector('.meetingThread');

    if (overlay) overlay.scrollTop = 0;
    if (body) body.scrollTop = 0;
    if (card) card.scrollTop = 0;
    if (thread) thread.scrollTop = 0;
  }

  openMeeting = function openMeetingFromTop() {
    previousOpenMeeting();
    requestAnimationFrame(() => {
      resetMeetingScroll();
      requestAnimationFrame(resetMeetingScroll);
    });
  };
})();
