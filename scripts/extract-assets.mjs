/**
 * Khôi phục 96 chân dung và tài nguyên giao diện từ HTML gốc của repository.
 * Không tải nội dung từ mạng; chỉ đọc tệp có sẵn trong nhánh Git.
 *
 * Usage:
 *   node v2/scripts/extract-assets.mjs
 *   node v2/scripts/extract-assets.mjs --source ./index.html --output ./v2
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const defaultV2 = resolve(here, '..');
const defaultSource = resolve(defaultV2, '..', 'index.html');
function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index < 0) return fallback;
  if (!process.argv[index + 1]) throw new Error(`Thiếu giá trị cho ${name}`);
  return resolve(process.argv[index + 1]);
}
const outputRoot = arg('--output', defaultV2);
const sourcePath = arg('--source', defaultSource);
const source = readFileSync(sourcePath, 'utf8');
const manifest = readFileSync(resolve(defaultV2, 'src/data/assets.js'), 'utf8');

function extractObject(text, name) {
  let re;
  if (name === 'IMG') {
    re = /Object\.assign\(IMG,\s*(\{[\s\S]*?\})\s*\);/;
  } else {
    re = /\bBN\s*=\s*(\{[\s\S]*?\})\s*;/;
  }
  const match = text.match(re);
  if (!match) throw new Error(`Không tìm thấy dữ liệu ${name} trong HTML nguồn`);
  return JSON.parse(match[1]);
}
function manifestObject(name) {
  const re = new RegExp('\\bconst '+name+'\\s*=\\s*(\\{[^;]*\\})\\s*;');
  const match = manifest.match(re);
  if (!match) throw new Error(`Không đọc được ${name} trong manifest`);
  return JSON.parse(match[1]);
}
function sourceImage(name) {
  const re = new RegExp('\\b'+name+'\\s*=\\s*([\\x27\\x22])(data:image/[^\\x27\\x22]+)\\1');
  const match = source.match(re);
  if (!match) throw new Error(`Không tìm thấy ảnh ${name} trong HTML nguồn`);
  return match[2];
}
function manifestImage(name) {
  const re = new RegExp('\\b'+name+'\\s*=\\s*([\\x27\\x22])([^\\x27\\x22]+)\\1');
  const match = manifest.match(re);
  if (!match) throw new Error(`Không đọc được đường dẫn ${name} trong manifest`);
  return match[2];
}
function saveImage(relativePath, uri) {
  const match = /^data:image\/(?:jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(uri);
  if (!match) throw new Error(`Dữ liệu ảnh không hợp lệ: ${relativePath}`);
  const filePath = resolve(outputRoot, relativePath);
  if (!filePath.startsWith(outputRoot + sep)) throw new Error('Đường dẫn tài nguyên không hợp lệ');
  const data = Buffer.from(match[1], 'base64');
  if (data.length < 100) throw new Error(`Ảnh quá nhỏ: ${relativePath}`);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, data);
  return data.length;
}
const images = extractObject(source, 'IMG');
const paths = manifestObject('IMG');
const keys = Object.keys(paths);
if (keys.length !== 96 || Object.keys(images).length !== 96) {
  throw new Error(`Dự kiến 96 tướng; nguồn có ${Object.keys(images).length}, manifest có ${keys.length}`);
}
let bytes = 0;
for (const name of keys) {
  if (!images[name]) throw new Error(`Thiếu ảnh của tướng: ${name}`);
  bytes += saveImage(paths[name], images[name]);
}
for (const name of ['BG', 'CB', 'PP', 'HT']) {
  bytes += saveImage(manifestImage(name), sourceImage(name));
}
const sourceBadges = extractObject(source, 'BN');
const badgePaths = manifestObject('BN');
for (const [name, path] of Object.entries(badgePaths)) {
  if (!sourceBadges[name]) throw new Error(`Thiếu huy hiệu ${name}`);
  bytes += saveImage(path, sourceBadges[name]);
}
console.log(`Đã trích xuất ${keys.length} tướng + 8 tài nguyên giao diện (${(bytes/1024/1024).toFixed(2)} MiB).`);