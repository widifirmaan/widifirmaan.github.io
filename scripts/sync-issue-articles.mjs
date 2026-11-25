#!/usr/bin/env node
/**
 * Fetches owner-authored GitHub Issues labeled `news:published`, downloads and
 * watermarks attached screenshots, and writes transient `.build-issues/` JSON
 * so articles published via GitHub Issues deploy cleanly without git commits.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import {
  ROOT_DIR,
  asString,
  normalizeArticle,
  safeSlug,
} from './news-store.mjs';

const execFileAsync = promisify(execFile);

const ISSUE_CACHE_DIR = path.join(ROOT_DIR, '.build-issues');
const ISSUE_ARTICLES_DIR = path.join(ISSUE_CACHE_DIR, 'articles');
const ISSUE_ASSETS_DIR = path.join(ISSUE_CACHE_DIR, 'assets');
const ISSUE_TMP_DIR = path.join(ISSUE_CACHE_DIR, 'tmp');
const WATERMARK_SCRIPT = path.join(ROOT_DIR, 'scripts', 'apply-watermark.mjs');

const PUBLISH_LABEL = 'news:published';
const ALLOWED_CATEGORIES = new Set([
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

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && idx + 1 < process.argv.length ? process.argv[idx + 1] : '';
}

function parseSimpleYaml(text) {
  const out = {};
  for (const rawLine of String(text || '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    let val = line.slice(colon + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) out[key] = val;
  }
  return out;
}

function stripLeadingMetadata(block) {
  const lines = String(block || '').replace(/\r\n/g, '\n').trim().split('\n');
  const meta = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      const nextNonEmpty = lines.slice(i + 1).find((l) => l.trim() !== '');
      if (nextNonEmpty && /^(title|excerpt)\s*:\s*(.+)$/i.test(nextNonEmpty.trim())) {
        i += 1;
        continue;
      }
      if (Object.keys(meta).length > 0) i += 1;
      break;
    }
    const m = line.match(/^(title|excerpt)\s*:\s*(.+)$/i);
    if (!m) break;
    meta[m[1].toLowerCase()] = m[2].trim().replace(/^["']|["']$/g, '');
    i += 1;
  }
  return {
    title: meta.title || '',
    excerpt: meta.excerpt || '',
    body: lines.slice(i).join('\n').trim(),
  };
}

function deriveExcerpt(markdown) {
  const clean = String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/^#+\s+.*$/gm, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.slice(0, 180).trim();
}

function normalizeGitHubHtmlImages(markdown) {
  return String(markdown || '').replace(
    /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
    (full, src) => {
      const altMatch = full.match(/\balt=["']([^"']*)["']/i);
      const alt = altMatch ? altMatch[1] : 'Screenshot artikel';
      return `![${alt}](${src})`;
    }
  );
}

function findFirstImageUrl(markdown) {
  const m = String(markdown || '').match(/!\[[^\]]*\]\(((?:https?:\/\/|\/news\/assets\/)[^)\s]+)(?:\s+["'][^"']*["'])?\)/i);
  return m ? m[1].trim() : '';
}

function findAllExternalImageUrls(...texts) {
  const urls = new Set();
  const mdRegex = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/gi;
  for (const text of texts) {
    if (!text) continue;
    for (const match of String(text).matchAll(mdRegex)) {
      if (match[1]) urls.add(match[1].trim());
    }
  }
  return Array.from(urls);
}

export function parseIssueToDraft(issue) {
  const rawBody = String(issue.body || '').replace(/\r\n/g, '\n').trim();
  let meta = {};
  let content = rawBody;

  const yamlFence = content.match(/^```ya?ml\s*\n([\s\S]*?)\n```\s*/i);
  if (yamlFence) {
    meta = parseSimpleYaml(yamlFence[1]);
    content = content.slice(yamlFence[0].length).trim();
  } else {
    const frontmatter = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
    if (frontmatter) {
      meta = parseSimpleYaml(frontmatter[1]);
      content = content.slice(frontmatter[0].length).trim();
    }
  }

  const localeRegex = /<!--\s*LANG:(id|en|zh)\s*-->/gi;
  const markers = [...content.matchAll(localeRegex)];
  const sections = {};
  let preamble = '';

  if (markers.length > 0) {
    preamble = normalizeGitHubHtmlImages(content.slice(0, markers[0].index));
    for (let i = 0; i < markers.length; i += 1) {
      const lang = markers[i][1].toLowerCase();
      const start = markers[i].index + markers[i][0].length;
      const end = i + 1 < markers.length ? markers[i + 1].index : content.length;
      sections[lang] = stripLeadingMetadata(normalizeGitHubHtmlImages(content.slice(start, end)));
    }
  } else {
    sections.id = stripLeadingMetadata(normalizeGitHubHtmlImages(content));
  }

  const idSection = sections.id || { title: '', excerpt: '', body: '' };
  const cleanIssueTitle = asString(issue.title).replace(/^\[(?:news|draft|artikel)\]\s*/i, '');
  const title = idSection.title || meta.title || cleanIssueTitle;
  const body = idSection.body;
  if (!title || !body) return null;

  const slug = safeSlug(meta.slug || title, `issue-${issue.number}`);
  const category = ALLOWED_CATEGORIES.has(meta.category) ? meta.category : 'Open Source';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(meta.date || '')
    ? meta.date
    : String(issue.created_at || new Date().toISOString()).slice(0, 10);
  const publishedAt = asString(meta.publishedat || meta.published_at) || issue.created_at || new Date().toISOString();

  const locales = {};
  for (const lang of ['en', 'zh']) {
    const sec = sections[lang];
    if (sec && sec.body) {
      locales[lang] = {
        title: sec.title || title,
        excerpt: sec.excerpt || deriveExcerpt(sec.body),
        body: sec.body,
      };
    }
  }

  const heroImageUrl =
    asString(meta.image) ||
    findFirstImageUrl(preamble) ||
    findFirstImageUrl(body) ||
    findFirstImageUrl(locales.en?.body) ||
    findFirstImageUrl(locales.zh?.body);

  const externalSet = new Set();
  if (/^https?:\/\//i.test(asString(meta.image))) {
    externalSet.add(asString(meta.image));
  }
  for (const extUrl of findAllExternalImageUrls(preamble, body, locales.en?.body, locales.zh?.body)) {
    externalSet.add(extUrl);
  }

  const localImages = [];
  if (heroImageUrl && heroImageUrl.startsWith('/news/assets/')) {
    localImages.push(heroImageUrl);
  }

  return {
    issueNumber: issue.number,
    heroImageUrl,
    externalImageUrls: Array.from(externalSet),
    article: {
      id: `issue-${issue.number}-${slug}`,
      title,
      slug,
      date,
      publishedAt,
      category,
      excerpt: idSection.excerpt || meta.excerpt || deriveExcerpt(body),
      images: localImages,
      badges: [],
      body,
      ...(Object.keys(locales).length ? { locales } : {}),
      url: asString(meta.url),
      source: meta.source === 'ai' ? 'ai' : 'manual',
      model: asString(meta.model),
    },
  };
}

async function downloadBuffer(url, token) {
  const isGitHubHost = (u) => {
    try {
      const host = new URL(u).hostname;
      return host === 'github.com' || host === 'api.github.com' || host.endsWith('.githubusercontent.com');
    } catch {
      return false;
    }
  };

  let res = await fetch(url, { headers: { 'User-Agent': 'widifirmaan-news-builder' } });
  if (!res.ok && token && isGitHubHost(url)) {
    res = await fetch(url, {
      headers: {
        'User-Agent': 'widifirmaan-news-builder',
        Authorization: `Bearer ${token}`,
      },
    });
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} downloading ${url}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (
    contentType &&
    !/^image\/(png|jpe?g|webp|avif)/i.test(contentType) &&
    !/^application\/octet-stream/i.test(contentType)
  ) {
    throw new Error(`Unsupported image content-type "${contentType}" from ${url}`);
  }
  return {
    buf: Buffer.from(await res.arrayBuffer()),
    contentType,
  };
}

function extFromContentType(ct, url) {
  if (/png/i.test(ct)) return '.png';
  if (/webp/i.test(ct)) return '.webp';
  if (/avif/i.test(ct)) return '.avif';
  if (/jpe?g/i.test(ct)) return '.jpg';
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.webp', '.avif'].includes(ext)) return ext;
  } catch {}
  return '.png';
}

let ffmpegEnsured = false;
async function ensureFfmpeg() {
  if (ffmpegEnsured) return;
  try {
    await execFileAsync('ffmpeg', ['-version']);
    ffmpegEnsured = true;
    return;
  } catch {
    if (process.env.CI !== 'true') {
      throw new Error('ffmpeg is not installed locally; install ffmpeg or pass --no-watermark');
    }
    console.log('Installing ffmpeg on demand for issue image watermarking...');
    await execFileAsync('sudo', ['apt-get', 'update'], { maxBuffer: 10 * 1024 * 1024 });
    await execFileAsync('sudo', ['apt-get', 'install', '-y', '--no-install-recommends', 'ffmpeg'], {
      maxBuffer: 10 * 1024 * 1024,
    });
    ffmpegEnsured = true;
  }
}

async function materializeImage(slug, url, token, skipWatermark) {
  if (!url || !/^https?:\/\//i.test(url)) return '';
  await fs.mkdir(ISSUE_TMP_DIR, { recursive: true });
  await fs.mkdir(ISSUE_ASSETS_DIR, { recursive: true });

  const { buf, contentType } = await downloadBuffer(url, token);
  const hash8 = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const ext = extFromContentType(contentType, url);
  const rawPath = path.join(ISSUE_TMP_DIR, `${slug}-${hash8}${ext}`);
  const outName = `${slug}-${hash8}.webp`;
  const outPath = path.join(ISSUE_ASSETS_DIR, outName);

  await fs.writeFile(rawPath, buf);
  if (skipWatermark) {
    await fs.copyFile(rawPath, outPath);
  } else {
    await ensureFfmpeg();
    await execFileAsync('node', [WATERMARK_SCRIPT, rawPath, outPath], { cwd: ROOT_DIR });
  }
  return `/news/assets/${outName}`;
}

function rewriteImageRefs(article, urlReplacements, primaryLocalPath) {
  const uniquePaths = Array.from(
    new Set([...(article.images || []), ...urlReplacements.map((r) => r.newPath)].filter(Boolean))
  );
  if (uniquePaths.length === 0 && !primaryLocalPath) return article;

  const fallbackPath = primaryLocalPath || uniquePaths[0] || '';
  const replaceInBody = (text, fallbackTitle) => {
    let s = String(text || '');
    for (const { oldUrl, newPath } of urlReplacements) {
      if (oldUrl && newPath) s = s.split(oldUrl).join(newPath);
    }
    if (fallbackPath) {
      s = s.replace(/\((HERO_IMAGE|URL_GAMBAR)\)/gi, `(${fallbackPath})`);
      const hasLocalImage = /!\[[^\]]*\]\(\/news\/assets\/[^)]+\)/.test(s);
      if (!hasLocalImage) {
        const idx = s.indexOf('\n\n');
        const imgMd = `\n\n![${fallbackTitle}](${fallbackPath})`;
        s = idx !== -1 ? s.slice(0, idx) + imgMd + s.slice(idx) : s + imgMd;
      }
    }
    return s;
  };

  article.images = uniquePaths;
  article.body = replaceInBody(article.body, article.title);
  if (article.locales) {
    for (const lang of Object.keys(article.locales)) {
      const loc = article.locales[lang];
      loc.body = replaceInBody(loc.body, loc.title || article.title);
    }
  }
  return article;
}

async function fetchPublishedIssues(repoFullName, token) {
  const issues = [];
  for (let page = 1; page <= 10; page += 1) {
    const apiUrl = `https://api.github.com/repos/${repoFullName}/issues?labels=${encodeURIComponent(PUBLISH_LABEL)}&state=open&per_page=100&page=${page}`;
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'widifirmaan-news-builder',
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(apiUrl, { headers });
    if (!res.ok) throw new Error(`GitHub Issues API HTTP ${res.status}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    issues.push(...batch);
    if (batch.length < 100) break;
  }
  return issues;
}

async function main() {
  const inputFile = argValue('--input');
  const skipWatermark = process.argv.includes('--no-watermark');
  const repoFullName = process.env.GITHUB_REPOSITORY || 'widifirmaan/widifirmaan.github.io';
  const allowedAuthor = (process.env.ALLOWED_AUTHOR || repoFullName.split('/')[0] || 'widifirmaan').toLowerCase();
  const token = process.env.GITHUB_TOKEN || '';

  await fs.rm(ISSUE_CACHE_DIR, { recursive: true, force: true });
  await fs.mkdir(ISSUE_ARTICLES_DIR, { recursive: true });

  let rawIssues = [];
  if (inputFile) {
    rawIssues = JSON.parse(await fs.readFile(path.resolve(inputFile), 'utf8'));
  } else if (token || process.env.FETCH_GITHUB_ISSUES === '1') {
    rawIssues = await fetchPublishedIssues(repoFullName, token);
  } else {
    console.log('No GITHUB_TOKEN / --input supplied; skipped remote GitHub Issues fetch.');
    return;
  }

  let savedCount = 0;
  for (const issue of rawIssues) {
    if (!issue || issue.pull_request) continue;
    if (issue.state && String(issue.state).toLowerCase() !== 'open') {
      console.log(`Skipped issue #${issue.number}: state "${issue.state}" != "open".`);
      continue;
    }
    const author = String(issue.user?.login || '').toLowerCase();
    if (author !== allowedAuthor) {
      console.log(`Skipped issue #${issue.number}: author "${author}" != "${allowedAuthor}".`);
      continue;
    }
    const hasPublishLabel = Array.isArray(issue.labels)
      ? issue.labels.some((l) => (typeof l === 'string' ? l : l?.name) === PUBLISH_LABEL)
      : false;
    if (!hasPublishLabel) continue;

    const draft = parseIssueToDraft(issue);
    if (!draft) {
      console.warn(`Skipped issue #${issue.number}: missing required title/body.`);
      continue;
    }

    const urlCache = new Map();
    const urlReplacements = [];
    for (const extUrl of draft.externalImageUrls) {
      let localPath = urlCache.get(extUrl);
      if (!localPath) {
        localPath = await materializeImage(draft.article.slug, extUrl, token, skipWatermark);
        urlCache.set(extUrl, localPath);
      }
      if (localPath) {
        urlReplacements.push({ oldUrl: extUrl, newPath: localPath });
      }
    }
    const primaryLocalPath =
      urlReplacements[0]?.newPath ||
      (draft.heroImageUrl && draft.heroImageUrl.startsWith('/news/assets/') ? draft.heroImageUrl : '');
    if (urlReplacements.length > 0 || primaryLocalPath) {
      rewriteImageRefs(draft.article, urlReplacements, primaryLocalPath);
    }

    const normalized = normalizeArticle(draft.article);
    await fs.writeFile(
      path.join(ISSUE_ARTICLES_DIR, `${normalized.slug}.json`),
      JSON.stringify(normalized, null, 2) + '\n',
      'utf8'
    );
    savedCount += 1;
    console.log(`Synced issue #${issue.number} -> ${normalized.slug} (${normalized.images.length} image(s))`);
  }

  console.log(`Synced ${savedCount} published issue article(s) into .build-issues/.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('sync-issue-articles failed:', err);
    process.exit(1);
  });
}
