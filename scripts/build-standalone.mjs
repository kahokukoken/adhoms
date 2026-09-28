import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const sourcePath = path.join(root, 'index.html');
const distDir = path.join(root, 'dist');
const outputPath = path.join(distDir, 'ADHOMS-Ver1.html');

let html = fs.readFileSync(sourcePath, 'utf8');
const sourceHash=createHash('sha256').update('index.html\0').update(html);
html = html.replace(/<script src="([^"]+)"><\/script>/g, (tag, relativePath) => {
  const scriptPath = path.resolve(root, relativePath);
  if (!scriptPath.startsWith(root + path.sep) || !fs.existsSync(scriptPath)) {
    throw new Error(`Cannot inline script: ${relativePath}`);
  }
  const source = fs.readFileSync(scriptPath, 'utf8');
  sourceHash.update(relativePath+'\0').update(source);
  return `<script>\n${source}\n<\/script>`;
});

const sourceRevision=process.env.ADHOMS_SOURCE_REVISION || 'local';
const sourceDigest=sourceHash.digest('hex');
html=html.replace('</head>',`<meta name="adhoms-source-digest" content="${sourceDigest}"></head>`);
const htmlSha256=createHash('sha256').update(html).digest('hex');
if(process.argv.includes('--check')){
  const manifest=JSON.parse(fs.readFileSync(path.join(distDir,'manifest.json'),'utf8'));
  const actual=createHash('sha256').update(fs.readFileSync(outputPath)).digest('hex');
  if(manifest.sourceDigest!==sourceDigest||manifest.htmlSha256!==htmlSha256||actual!==htmlSha256||
    (process.env.ADHOMS_SOURCE_REVISION&&manifest.sourceRevision!==sourceRevision)){
    throw new Error('Standalone delivery does not match the current source/manifest; rebuild before handoff.');
  }
  console.log('Delivery source and HTML digest PASS');
  process.exit(0);
}
// Frozen reader versions are immutable. Rebuild only the current delivery.
fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(outputPath, html);
fs.writeFileSync(path.join(distDir,'manifest.json'),JSON.stringify({sourceRevision,sourceDigest,htmlSha256},null,2)+'\n');
fs.writeFileSync(path.join(distDir, 'README.txt'), [
  'ADHOMS Ver1 確認用ビルド',
  '',
  '1. ADHOMS-Ver1.html をブラウザで開いてください。',
  '2. 追加のインストールやローカルサーバーは不要です。',
  '3. セーブデータはブラウザ内に保存されます。',
  '',
  '現行仕様：https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef',
  '対応範囲：V1-01〜13の機能経路。初見の物語体験（V1-14）は確認中です。',
  'ソース：' + sourceRevision,
  'Source SHA-256：' + sourceDigest,
  'HTML SHA-256：' + htmlSha256,
  'この成果物はPR #17の確認用で、正式な公開版ではありません。',
  ''
].join('\n'));

console.log(outputPath);
