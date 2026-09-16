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
  '<script src="scripted-scenario.js"></script>'
];
for (const tag of tags) {
  if (!html.includes(tag)) html = html.replace('</body></html>', `${tag}</body></html>`);
}
fs.writeFileSync(file, html);
