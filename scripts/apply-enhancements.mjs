import fs from 'node:fs';

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const tags = [
  '<script src="enhancements.js"></script>',
  '<script src="creator-enhancements.js"></script>',
  '<script src="meeting-v2.js"></script>',
  '<script src="opening-flow.js"></script>',
  '<script src="live-feed-v2.js"></script>',
  '<script src="profile-finalizer.js"></script>',
  '<script src="scripted-scenario.js"></script>',
  '<script src="meeting-scroll-fix.js"></script>',
  '<script src="feed-prelude-visibility.js"></script>',
  '<script src="ver1/ver1-state.js"></script>',
  '<script src="ver1/ver1-events.js"></script>',
  '<script src="ver1/ver1-disaster.js"></script>',
  '<script src="ver1/ver1-propagation.js"></script>',
  '<script src="ver1/ver1-final-event.js"></script>',
  '<script src="ver1/ver1-smoke-test.js"></script>',
  '<script src="ver1/ver1-ui-bridge.js"></script>',
  '<script src="ver1/ver1-calendar-bridge.js"></script>',
  '<script src="ver1/ver1-observation-controls.js"></script>',
  '<script src="ver1/ver1-optional-creation-events.js"></script>',
  '<script src="ver1/ver1-story-milestones.js"></script>',
  '<script src="ver1/ver1-overlay-cleanup.js"></script>'
];
for (const tag of tags) {
  if (!html.includes(tag)) html = html.replace('</body></html>', `${tag}</body></html>`);
}
fs.writeFileSync(file, html);
