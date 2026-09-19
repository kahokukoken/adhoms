import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const enhancementTags = [
  'enhancements.js',
  'creator-enhancements.js',
  'meeting-v2.js',
  'opening-flow.js',
  'live-feed-v2.js',
  'profile-finalizer.js',
  'scripted-scenario.js',
  'meeting-scroll-fix.js',
  'feed-prelude-visibility.js'
].map(file => `<script src="${file}"></script>`).join('');

const mimeTypes = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
});

async function fileFor(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://127.0.0.1').pathname);
  let candidate = resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return null;
  try {
    if ((await stat(candidate)).isDirectory()) candidate = resolve(candidate, 'index.html');
  } catch {
    return null;
  }
  return candidate;
}

const server = createServer(async (request, response) => {
  const file = await fileFor(request.url ?? '/');
  if (!file) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  try {
    let content = await readFile(file);
    if (file === resolve(root, 'index.html')) {
      const html = content.toString('utf8');
      content = Buffer.from(html.includes('enhancements.js') ? html : html.replace('</body></html>', `${enhancementTags}</body></html>`));
    }
    response.writeHead(200, { 'content-type': mimeTypes[extname(file)] ?? 'application/octet-stream' });
    response.end(content);
  } catch {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Server error');
  }
});

server.listen(8000, '127.0.0.1');
