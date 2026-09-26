(() => {
  function removeFollowControls(root = document) {
    root.querySelectorAll?.('.a.fl').forEach(button => button.remove());
  }

  const style = document.createElement('style');
  style.id = 'ver1-observation-controls-style';
  style.textContent = '.acts{grid-template-columns:repeat(3,1fr)!important}';
  document.head.appendChild(style);

  const feed = document.getElementById('feedList');
  removeFollowControls(feed || document);

  if (feed) {
    const observer = new MutationObserver(() => removeFollowControls(feed));
    observer.observe(feed, { childList: true, subtree: true });
  }
})();
