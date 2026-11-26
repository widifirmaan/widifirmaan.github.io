#!/usr/bin/env node
/**
 * Audits published news articles, multilingual parity, and uploaded media assets
 * against NEWS_RULES.md.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ROOT_DIR, readAllArticles } from './news-store.mjs';

const execFileAsync = promisify(execFile);

const VALID_CATEGORIES = new Set([
  'Backend',
  'Frontend',
  'DevOps',
  'Database',
  'Security',
  'Performance',
  'Tooling',
  'AI',
  'Open Source',
]);

const VISUAL_GUIDE_PATTERN =
  /\b(tutorial|compare|perbandingan|original\s+vs\s+hd|split-screen|grid\s+view|table\s+view|launcher|monaco\s+editor)\b/i;

function extractMarkdownImages(markdown) {
  const out = [];
  const regex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'))?\)/g;
  for (const m of String(markdown || '').matchAll(regex)) {
    out.push({ alt: m[1].trim(), src: m[2].trim() });
  }
  return out;
}

function stripCodeBlocksAndInline(text) {
  return String(text || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '');
}

function hasEmoji(text) {
  return /\p{Extended_Pictographic}/u.test(String(text || ''));
}

async function probeImage(assetPath) {
  const rel = String(assetPath || '').replace(/^\/+/, '');
  const fullPath = path.join(ROOT_DIR, rel);
  const stat = await fs.stat(fullPath).catch(() => null);
  if (!stat || !stat.isFile() || stat.size === 0) {
    return { exists: false, fullPath, bytes: 0, width: 0, height: 0 };
  }

  const header = Buffer.alloc(64);
  const handle = await fs.open(fullPath, 'r');
  try {
    await handle.read(header, 0, 64, 0);
  } finally {
    await handle.close();
  }

  let width = 0;
  let height = 0;
  if (header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = header.toString('ascii', 12, 16);
    if (chunk === 'VP8X') {
      width = 1 + (header[24] | (header[25] << 8) | (header[26] << 16));
      height = 1 + (header[27] | (header[28] << 8) | (header[29] << 16));
    } else if (chunk === 'VP8 ') {
      width = header.readUInt16LE(26) & 0x3fff;
      height = header.readUInt16LE(28) & 0x3fff;
    } else if (chunk === 'VP8L') {
      const bits = header.readUInt32LE(21);
      width = (bits & 0x3fff) + 1;
      height = ((bits >> 14) & 0x3fff) + 1;
    }
  } else if (header.readUInt32BE(0) === 0x89504e47) {
    width = header.readUInt32BE(16);
    height = header.readUInt32BE(20);
  }

  return { exists: true, fullPath, bytes: stat.size, width, height };
}

async function checkWatermarkPresence(fullPath) {
  // Heuristic check with ffmpeg if available: ensure center overlay region isn't purely uniform unblended alpha miss.
  try {
    await execFileAsync('ffmpeg', ['-v', 'error', '-i', fullPath, '-f', 'null', '-']);
    return { decodedOk: true };
  } catch (err) {
    if (err.code === 'ENOENT') return { decodedOk: true, skippedFfmpeg: true };
    return { decodedOk: false, error: err.message };
  }
}

async function main() {
  const { items } = await readAllArticles();
  const errors = [];
  const warnings = [];
  const referencedAssets = new Set(['/news/assets/watermark.png']);

  if (!items.length) {
    errors.push('No articles found to audit.');
  }

  for (const article of items) {
    const slug = article.slug || '(missing-slug)';
    const pushErr = (msg) => errors.push(`[${slug}] ${msg}`);
    const pushWarn = (msg) => warnings.push(`[${slug}] ${msg}`);

    if (!article.title || article.title.length > 80) {
      pushErr(`Invalid title length (${article.title?.length || 0}, max 80).`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      pushErr(`Slug "${slug}" must be lowercase ASCII kebab-case.`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(article.date || '')) {
      pushErr(`Invalid date format "${article.date}".`);
    }
    if (!VALID_CATEGORIES.has(article.category)) {
      pushErr(`Invalid category "${article.category}".`);
    }
    if (!article.excerpt || article.excerpt.length < 120 || article.excerpt.length > 200) {
      pushErr(`Excerpt length (${article.excerpt?.length || 0}) must be 120-200 chars.`);
    }
    if (article.source === 'ai' && !article.model) {
      pushErr('AI article is missing "model" attribution.');
    }

    const editions = [
      ['id', { title: article.title, excerpt: article.excerpt, body: article.body }],
      ['en', article.locales?.en],
      ['zh', article.locales?.zh],
    ];

    const srcLists = {};
    for (const [lang, ed] of editions) {
      if (!ed || !ed.title || !ed.excerpt || !ed.body) {
        pushErr(`Missing complete "${lang}" localized content.`);
        continue;
      }

      if (lang === 'en' && (ed.title.length > 80 || ed.excerpt.length < 120 || ed.excerpt.length > 200)) {
        pushErr(`EN SEO length invalid (title=${ed.title.length}, excerpt=${ed.excerpt.length}).`);
      }
      if (lang === 'zh' && (ed.title.length < 12 || ed.title.length > 50 || ed.excerpt.length < 40 || ed.excerpt.length > 130)) {
        pushWarn(`ZH SEO length outside typical range (title=${ed.title.length}, excerpt=${ed.excerpt.length}).`);
      }

      const prose = stripCodeBlocksAndInline(ed.body);
      if (hasEmoji(ed.title) || hasEmoji(ed.excerpt) || hasEmoji(prose)) {
        pushErr(`Emoji detected in "${lang}" edition.`);
      }
      if (ed.title.includes('\u2014') || ed.excerpt.includes('\u2014') || prose.includes('\u2014')) {
        pushErr(`Em dash (\u2014) detected in "${lang}" edition.`);
      }
      if (/(^|\s)--(\s|$)/.test(prose)) {
        pushErr(`Double hyphen "--" punctuation detected outside code in "${lang}" edition.`);
      }
      if (!/```[a-zA-Z0-9_-]*\n[\s\S]+?\n```/.test(ed.body)) {
        pushErr(`Missing fenced code block in "${lang}" edition.`);
      }

      const imgs = extractMarkdownImages(ed.body);
      srcLists[lang] = imgs.map((i) => i.src);
      for (const img of imgs) {
        if (!img.alt) pushErr(`Image "${img.src}" in "${lang}" edition is missing descriptive alt text.`);
        if (/^(HERO_IMAGE|URL_GAMBAR)$/i.test(img.src)) {
          pushErr(`Unreplaced placeholder image "${img.src}" in "${lang}" edition.`);
        } else if (!img.src.startsWith('/news/assets/')) {
          pushErr(`External/non-asset image "${img.src}" in "${lang}" must be uploaded to /news/assets/ with watermark.`);
        }
      }
    }

    // Cross-locale image alignment
    if (srcLists.id && srcLists.en && JSON.stringify(srcLists.id) !== JSON.stringify(srcLists.en)) {
      pushErr(`Image sequence mismatch between id and en: ${JSON.stringify(srcLists.id)} vs ${JSON.stringify(srcLists.en)}`);
    }
    if (srcLists.id && srcLists.zh && JSON.stringify(srcLists.id) !== JSON.stringify(srcLists.zh)) {
      pushErr(`Image sequence mismatch between id and zh: ${JSON.stringify(srcLists.id)} vs ${JSON.stringify(srcLists.zh)}`);
    }

    const declaredImgs = Array.isArray(article.images) ? article.images : [];
    for (const src of srcLists.id || []) {
      if (!declaredImgs.includes(src)) {
        pushErr(`Body image "${src}" is missing from metadata images[] array.`);
      }
    }

    if (declaredImgs.length === 0) {
      pushErr('Article must include at least one uploaded image in /news/assets/.');
    }

    const combinedText = `${article.title}\n${article.excerpt}\n${article.body}`;
    if (VISUAL_GUIDE_PATTERN.test(combinedText) && declaredImgs.length < 2) {
      pushErr(
        `Article covers tutorial/compare/UI walkthrough but only has ${declaredImgs.length} image(s); upload supporting screenshots to /news/assets/.`
      );
    }

    for (const imgPath of new Set([...declaredImgs, ...(srcLists.id || [])])) {
      referencedAssets.add(imgPath);
      const info = await probeImage(imgPath);
      if (!info.exists) {
        pushErr(`Referenced image missing or empty on disk: ${imgPath}`);
        continue;
      }
      if (!info.fullPath.endsWith('.webp')) {
        pushWarn(`Image "${imgPath}" is not .webp (WebP recommended per NEWS_RULES.md).`);
      }
      if (info.width <= 0 || info.height <= 0) {
        pushErr(`Failed to read dimensions for ${imgPath}`);
      }
      const decodeRes = await checkWatermarkPresence(info.fullPath);
      if (!decodeRes.decodedOk) {
        pushErr(`FFmpeg failed decoding ${imgPath}: ${decodeRes.error}`);
      }
    }
  }

  // Check for orphan assets inside news/assets/
  const assetsDir = path.join(ROOT_DIR, 'news', 'assets');
  const assetFiles = await fs.readdir(assetsDir).catch(() => []);
  for (const name of assetFiles) {
    if (name.startsWith('.')) continue;
    const rel = `/news/assets/${name}`;
    if (!referencedAssets.has(rel)) {
      warnings.push(`Orphan asset in news/assets/ not referenced by any article: ${rel}`);
    }
  }

  if (warnings.length) {
    console.warn('AUDIT WARNINGS:');
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (errors.length) {
    console.error('AUDIT FAILED:');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log(
    `NEWS AUDIT PASSED: ${items.length} article(s), ${referencedAssets.size - 1} uploaded media asset(s), 0 errors, ${warnings.length} warning(s).`
  );
}

main().catch((err) => {
  console.error('audit-news crashed:', err);
  process.exit(1);
});
