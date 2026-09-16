import fs from 'node:fs';

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');
const tag = '<script src="enhancements.js"></script>';
if (!html.includes(tag)) {
  html = html.replace('</body></html>', `${tag}</body></html>`);
  fs.writeFileSync(file, html);
}
