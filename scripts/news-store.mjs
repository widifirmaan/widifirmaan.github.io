#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, '..');
export const NEWS_FILE = path.join(ROOT_DIR, 'news.json');
export const DATA_DIR = path.join(ROOT_DIR, 'news', 'data');
export const CHUNKS_DIR = path.join(DATA_DIR, 'chunks');
export const ARTICLES_DIR = path.join(DATA_DIR, 'articles');
export const MANIFEST_FILE = path.join(DATA_DIR, 'manifest.json');

export const CHUNK_SIZE = 25;
export const LEGACY_MIRROR_LIMIT = 50;
export const EXTRA_LOCALES = ['en', 'zh'];
export const ALL_LOCALES = ['id', ...EXTRA_LOCALES];
export const I18N_DIR = path.join(DATA_DIR, 'i18n');

export function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function asStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
    : [];
}

export function normalizeLocales(rawLocales) {
  const src = rawLocales && typeof rawLocales === 'object' ? rawLocales : {};
  const out = {};
  for (const lang of EXTRA_LOCALES) {
    const entry = src[lang];
    if (!entry || typeof entry !== 'object') continue;
    const title = asString(entry.title);
    const excerpt = asString(entry.excerpt);
    const body = typeof entry.body === 'string' ? entry.body : '';
    if (title || excerpt || body.trim()) {
      out[lang] = { title, excerpt, body };
    }
  }
  return out;
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

export function safeSlug(value, fallback = '') {
  const cleaned = slugify(value || fallback);
  return cleaned || `article-${Date.now().toString(36)}`;
}

export function uid() {
  return 'news-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function normalizeArticle(raw = {}) {
  const item = raw && typeof raw === 'object' ? raw : {};
  const title = asString(item.title);
  const slug = safeSlug(asString(item.slug) || title, asString(item.id));
  const locales = normalizeLocales(item.locales);
  const publishedAt = asString(item.publishedAt);
  const normalized = {
    id: asString(item.id) || `news-${slug}`,
    title,
    slug,
    date: asString(item.date) || new Date().toISOString().slice(0, 10),
    ...(publishedAt ? { publishedAt } : {}),
    category: asString(item.category),
    excerpt: asString(item.excerpt),
    images: asStringArray(item.images),
    badges: asStringArray(item.badges),
    body: typeof item.body === 'string' ? item.body : '',
  };
  if (Object.keys(locales).length > 0) {
    normalized.locales = locales;
  }
  normalized.url = asString(item.url);
  normalized.source = asString(item.source) || 'manual';
  normalized.model = asString(item.model);
  return normalized;
}

export function localizeArticle(item, lang = 'id') {
  const loc = lang && lang !== 'id' && item.locales && item.locales[lang] ? item.locales[lang] : null;
  return {
    id: item.id,
    title: (loc && loc.title) || item.title,
    slug: item.slug,
    date: item.date,
    ...(item.publishedAt ? { publishedAt: item.publishedAt } : {}),
    category: item.category,
    excerpt: (loc && loc.excerpt) || item.excerpt,
    images: item.images,
    badges: item.badges,
    body: (loc && loc.body) || item.body,
    url: item.url,
    source: item.source,
    model: item.model,
    lang: loc ? lang : 'id',
  };
}

export function toSummary(item, lang = 'id') {
  const localized = localizeArticle(item, lang);
  return {
    id: localized.id,
    title: localized.title,
    slug: localized.slug,
    date: localized.date,
    ...(localized.publishedAt ? { publishedAt: localized.publishedAt } : {}),
    category: localized.category,
    excerpt: localized.excerpt,
    images: localized.images,
    badges: localized.badges,
    url: localized.url,
    source: localized.source,
    model: localized.model,
    lang: localized.lang,
  };
}

function timestampOf(value) {
  const parsed = value ? Date.parse(String(value)) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function compareDesc(a, b) {
  const dateDiff = String(b.date || '').localeCompare(String(a.date || ''));
  if (dateDiff !== 0) return dateDiff;
  const timeDiff = timestampOf(b.publishedAt) - timestampOf(a.publishedAt);
  if (timeDiff !== 0) return timeDiff;
  return String(b.slug || '').localeCompare(String(a.slug || ''));
}

function compareAsc(a, b) {
  return -compareDesc(a, b);
}

async function readJsonSafe(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

async function writeIfChanged(filePath, content) {
  try {
    const existing = await fs.readFile(filePath, 'utf8');
    if (existing === content) return false;
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  await fs.writeFile(filePath, content, 'utf8');
  return true;
}

export async function readLegacyNews() {
  const data = await readJsonSafe(NEWS_FILE);
  if (!data) return { lastUpdated: new Date().toISOString(), items: [] };
  const list = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
  return {
    lastUpdated: data.lastUpdated || new Date().toISOString(),
    items: list.map(normalizeArticle),
  };
}

export async function readArticlesFromDir(dirPath) {
  const articles = [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
      const data = await readJsonSafe(path.join(dirPath, entry.name));
      if (data && (data.title || data.slug)) {
        articles.push(normalizeArticle(data));
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  return articles;
}

export async function readAllArticles({ extraArticlesDir } = {}) {
  const bySlug = new Map();

  // Read legacy news.json first so canonical article files always win on conflict.
  const legacy = await readLegacyNews();
  for (const item of legacy.items) {
    if (item.slug) bySlug.set(item.slug, item);
  }

  for (const item of await readArticlesFromDir(ARTICLES_DIR)) {
    if (item.slug) bySlug.set(item.slug, item);
  }

  if (extraArticlesDir) {
    for (const item of await readArticlesFromDir(extraArticlesDir)) {
      if (item.slug) bySlug.set(item.slug, item);
    }
  }

  const manifest = await readJsonSafe(MANIFEST_FILE);
  return {
    lastUpdated: (manifest && manifest.lastUpdated) || legacy.lastUpdated || new Date().toISOString(),
    items: Array.from(bySlug.values()).sort(compareDesc),
  };
}

export async function readKnownSummaries() {
  const manifest = await readJsonSafe(MANIFEST_FILE);
  if (manifest && Array.isArray(manifest.chunks)) {
    const summaries = [];
    for (const chunkInfo of manifest.chunks) {
      const fileName = path.basename(String(chunkInfo.file || ''));
      if (!fileName) continue;
      const chunk = await readJsonSafe(path.join(CHUNKS_DIR, fileName));
      if (chunk && Array.isArray(chunk.items)) {
        summaries.push(...chunk.items.map(normalizeArticle).map(toSummary));
      }
    }
    return {
      lastUpdated: manifest.lastUpdated || new Date().toISOString(),
      items: summaries.sort(compareDesc),
    };
  }

  const { lastUpdated, items } = await readAllArticles();
  return { lastUpdated, items: items.map(toSummary) };
}

export async function writeDerivedShardedData(rawItems, targetDataDir, nowIso = new Date().toISOString()) {
  const itemsDesc = Array.from(
    rawItems.reduce((map, raw) => {
      const item = normalizeArticle(raw);
      if (item.title || item.slug) map.set(item.slug, item);
      return map;
    }, new Map()).values()
  ).sort(compareDesc);
  const itemsAsc = itemsDesc.slice().sort(compareAsc);

  const chunksDir = path.join(targetDataDir, 'chunks');
  const i18nDir = path.join(targetDataDir, 'i18n');
  const manifestFile = path.join(targetDataDir, 'manifest.json');

  const chunkMeta = await writeLocaleChunks({ chunksDir, itemsAsc, lang: 'id' });
  for (const lang of EXTRA_LOCALES) {
    const localeDir = path.join(i18nDir, lang);
    await writeLocaleChunks({ chunksDir: path.join(localeDir, 'chunks'), itemsAsc, lang });
    await fs.rm(path.join(localeDir, 'articles'), { recursive: true, force: true });
    await fs.rm(path.join(localeDir, 'manifest.json'), { force: true });
  }

  const chunksDesc = chunkMeta.slice().reverse();
  const manifest = {
    version: 1,
    lastUpdated: nowIso,
    total: itemsDesc.length,
    pageSize: CHUNK_SIZE,
    latestChunk: chunksDesc[0]?.file || '',
    chunks: chunksDesc,
  };
  await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  return { itemsDesc, manifest };
}

async function writeLocaleChunks({ chunksDir, itemsAsc, lang }) {
  await fs.mkdir(chunksDir, { recursive: true });

  // Slice oldest-first into fixed-capacity chunks so older chunks stay immutable.
  const chunkMeta = [];
  const expectedChunkFiles = new Set();
  for (let i = 0; i < itemsAsc.length; i += CHUNK_SIZE) {
    const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
    const fileName = `chunk-${String(chunkIndex).padStart(4, '0')}.json`;
    expectedChunkFiles.add(fileName);
    const sliceDesc = itemsAsc.slice(i, i + CHUNK_SIZE).sort(compareDesc);
    const payload = {
      chunk: fileName,
      lang,
      total: sliceDesc.length,
      items: sliceDesc.map((it) => toSummary(it, lang)),
    };
    await writeIfChanged(path.join(chunksDir, fileName), JSON.stringify(payload, null, 2) + '\n');
    chunkMeta.push({
      file: fileName,
      count: sliceDesc.length,
      newestDate: sliceDesc[0]?.date || '',
      oldestDate: sliceDesc[sliceDesc.length - 1]?.date || '',
    });
  }

  // Remove obsolete extra chunk files if total shrank.
  for (const existingFile of await fs.readdir(chunksDir)) {
    if (existingFile.endsWith('.json') && !expectedChunkFiles.has(existingFile)) {
      await fs.unlink(path.join(chunksDir, existingFile));
    }
  }

  return chunkMeta;
}

export async function writeNewsStore(rawItems) {
  const deduped = new Map();
  for (const raw of rawItems) {
    const item = normalizeArticle(raw);
    if (!item.title && !item.slug) continue;
    deduped.set(item.slug, item);
  }

  const itemsDesc = Array.from(deduped.values()).sort(compareDesc);
  const nowIso = new Date().toISOString();

  // Write canonical single source of truth per article (with localized editions inside).
  await fs.mkdir(ARTICLES_DIR, { recursive: true });
  const expectedArticleFiles = new Set();
  for (const item of itemsDesc) {
    const fileName = `${item.slug}.json`;
    expectedArticleFiles.add(fileName);
    await writeIfChanged(
      path.join(ARTICLES_DIR, fileName),
      JSON.stringify(item, null, 2) + '\n'
    );
  }
  for (const existingFile of await fs.readdir(ARTICLES_DIR)) {
    if (existingFile.endsWith('.json') && !expectedArticleFiles.has(existingFile)) {
      await fs.unlink(path.join(ARTICLES_DIR, existingFile));
    }
  }

  const { manifest } = await writeDerivedShardedData(itemsDesc, DATA_DIR, nowIso);

  // Keep legacy news.json capped at the latest N full items for audit CMS compatibility.
  const recent = itemsDesc.slice(0, LEGACY_MIRROR_LIMIT);
  const legacyPayload = {
    lastUpdated: nowIso,
    total: recent.length,
    totalAll: itemsDesc.length,
    items: recent,
  };
  await fs.writeFile(NEWS_FILE, JSON.stringify(legacyPayload, null, 2) + '\n', 'utf8');

  return {
    lastUpdated: nowIso,
    total: itemsDesc.length,
    latestChunk: manifest.latestChunk,
    chunks: chunksDesc.length,
  };
}

if (process.argv.includes('--rebuild')) {
  readAllArticles()
    .then(({ items }) => writeNewsStore(items))
    .then((res) => console.log('Rebuilt sharded news store:', JSON.stringify(res)))
    .catch((err) => {
      console.error('Failed to rebuild news store:', err);
      process.exit(1);
    });
}
