#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WM = path.join(ROOT, 'news/assets/watermark.png');

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/apply-watermark.mjs <image-path> [output-path]');
  process.exit(1);
}
const src = path.resolve(input);
const out = path.resolve(process.argv[3] || src);
const ext = path.extname(src).toLowerCase();
if (!['.png', '.jpg', '.jpeg', '.webp', '.avif'].includes(ext)) {
  console.error('Supported: png, jpg, jpeg, webp, avif');
  process.exit(1);
}
await fs.access(src);
await fs.access(WM);

const cmd = [
  '-y','-i', src, '-i', WM,
  '-filter_complex', '[1][0]scale2ref=iw:ih[wm][base];[base][wm]overlay=0:0',
  out
];
const r = spawnSync('ffmpeg', cmd, { encoding: 'utf8' });
if (r.status !== 0) {
  console.error(r.stderr || r.stdout || 'ffmpeg failed');
  process.exit(r.status || 1);
}
console.log(out);
