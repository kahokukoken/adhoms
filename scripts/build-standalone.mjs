import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const sourcePath = path.join(root, 'index.html');
const distDir = path.join(root, 'dist');
const outputPath = path.join(distDir, 'ADHOMS-Ver1.html');

let html = fs.readFileSync(sourcePath, 'utf8');
html = html.replace(/<script src="([^"]+)"><\/script>/g, (tag, relativePath) => {
  const scriptPath = path.resolve(root, relativePath);
  if (!scriptPath.startsWith(root + path.sep) || !fs.existsSync(scriptPath)) {
    throw new Error(`Cannot inline script: ${relativePath}`);
  }
  const source = fs.readFileSync(scriptPath, 'utf8');
  return `<script>\n${source}\n<\/script>`;
});

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(outputPath, html);
fs.writeFileSync(path.join(distDir, 'README.txt'), [
  'ADHOMS Ver1 確認用ビルド',
  '',
  '1. ADHOMS-Ver1.html をブラウザで開いてください。',
  '2. 追加のインストールやローカルサーバーは不要です。',
  '3. セーブデータはブラウザ内に保存されます。',
  '',
  '現行仕様：https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef',
  '対応範囲：V1-01〜05・12〜13の導入／観測UI。物語全編と初見体験は未完了です。',
  'ソース：' + (process.env.ADHOMS_SOURCE_REVISION || 'ローカルビルド（PR #17の検証記録を参照）'),
  'HTML SHA-256：' + createHash('sha256').update(html).digest('hex'),
  'この成果物はPR #17の確認用で、正式な公開版ではありません。',
  ''
].join('\n'));

console.log(outputPath);
