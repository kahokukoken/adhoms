import fs from 'node:fs';

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');
const tags = [
  '<script src="enhancements.js"></script>',
  '<script src="creator-enhancements.js"></script>'
];
for (const tag of tags) {
  if (!html.includes(tag)) html = html.replace('</body></html>', `${tag}</body></html>`);
}
fs.writeFileSync(file, html);
