(() => {
  const DIRECTIVES = [1, 2, 3, 4];

  function hasPendingDirective() {
    const flags = window.ADHOMS_LIGHT_STATE?.flags || {};
    return DIRECTIVES.some(number => flags[`directive:${number}:seen`] && !flags[`directive:${number}:ack`]);
  }

  function removeUnusedOverlay() {
    const host = document.getElementById('ver1Choice');
    if (!host || host.classList.contains('on') || host.textContent.trim() || hasPendingDirective()) return;
    host.remove();
  }

  // The UI bridge creates the shared host early so unacknowledged Kiso directives
  // can be restored after reload. Remove that empty host once resume hooks have had
  // time to claim it, preserving the normal no-overlay state for resolved screens.
  setTimeout(removeUnusedOverlay, 650);
})();
