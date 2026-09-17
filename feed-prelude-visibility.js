(() => {
  const previousRenderFeed = renderFeed;

  function syncFeedPrelude() {
    const prelude = document.querySelector('.feedPrelude');
    if (!prelude) return;
    const isTrialStart = S.year === 1 && S.month === 4;
    prelude.hidden = !isTrialStart;
    prelude.style.display = isTrialStart ? '' : 'none';
  }

  renderFeed = function renderFeedWithPreludeVisibility() {
    previousRenderFeed();
    syncFeedPrelude();
  };

  syncFeedPrelude();
})();
