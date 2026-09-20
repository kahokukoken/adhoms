import fs from 'node:fs';
import path from 'node:path';

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
  'この成果物は feature/ver1-light-sim の確認用で、公開版ではありません。',
  ''
].join('\n'));

console.log(outputPath);
