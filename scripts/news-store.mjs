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

export function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function asStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
    : [];
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
  return {
    id: asString(item.id) || `news-${slug}`,
    title,
    slug,
    date: asString(item.date) || new Date().toISOString().slice(0, 10),
    category: asString(item.category),
    excerpt: asString(item.excerpt),
    images: asStringArray(item.images),
    badges: asStringArray(item.badges),
    body: typeof item.body === 'string' ? item.body : '',
    url: asString(item.url),
    source: asString(item.source) || 'manual',
    model: asString(item.model),
  };
}

export function toSummary(item) {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    date: item.date,
    category: item.category,
    excerpt: item.excerpt,
    images: item.images,
    badges: item.badges,
    url: item.url,
    source: item.source,
    model: item.model,
  };
}

function compareDesc(a, b) {
  const dateDiff = String(b.date || '').localeCompare(String(a.date || ''));
  if (dateDiff !== 0) return dateDiff;
  return String(a.slug || '').localeCompare(String(b.slug || ''));
}

function compareAsc(a, b) {
  const dateDiff = String(a.date || '').localeCompare(String(b.date || ''));
  if (dateDiff !== 0) return dateDiff;
  return String(a.slug || '').localeCompare(String(b.slug || ''));
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

export async function readKnownSummaries() {
  const manifest = await readJsonSafe(MANIFEST_FILE);
  if (!manifest || !Array.isArray(manifest.chunks)) {
    const legacy = await readLegacyNews();
    return { lastUpdated: legacy.lastUpdated, items: legacy.items.map(toSummary) };
  }

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

export async function readAllArticles() {
  const manifest = await readJsonSafe(MANIFEST_FILE);
  if (!manifest || !Array.isArray(manifest.chunks)) {
    return readLegacyNews();
  }

  const { items: summaries } = await readKnownSummaries();
  const bySlug = new Map();

  for (const summary of summaries) {
    const articleData = await readJsonSafe(path.join(ARTICLES_DIR, `${summary.slug}.json`));
    bySlug.set(summary.slug, normalizeArticle(articleData || summary));
  }

  // Merge any item present only in legacy news.json so no article is silently dropped.
  const legacy = await readLegacyNews();
  for (const item of legacy.items) {
    if (!bySlug.has(item.slug)) bySlug.set(item.slug, item);
  }

  return {
    lastUpdated: manifest.lastUpdated || legacy.lastUpdated || new Date().toISOString(),
    items: Array.from(bySlug.values()).sort(compareDesc),
  };
}

export async function writeNewsStore(rawItems) {
  await fs.mkdir(CHUNKS_DIR, { recursive: true });
  await fs.mkdir(ARTICLES_DIR, { recursive: true });

  const deduped = new Map();
  for (const raw of rawItems) {
    const item = normalizeArticle(raw);
    if (!item.title && !item.slug) continue;
    deduped.set(item.slug, item);
  }

  const itemsDesc = Array.from(deduped.values()).sort(compareDesc);
  const itemsAsc = itemsDesc.slice().sort(compareAsc);
  const nowIso = new Date().toISOString();

  // Write individual article payloads (only changed or new files are rewritten).
  const expectedArticleFiles = new Set();
  for (const item of itemsDesc) {
    const fileName = `${item.slug}.json`;
    expectedArticleFiles.add(fileName);
    await writeIfChanged(
      path.join(ARTICLES_DIR, fileName),
      JSON.stringify(item, null, 2) + '\n'
    );
  }

  // Remove orphaned article files.
  for (const existingFile of await fs.readdir(ARTICLES_DIR)) {
    if (existingFile.endsWith('.json') && !expectedArticleFiles.has(existingFile)) {
      await fs.unlink(path.join(ARTICLES_DIR, existingFile));
    }
  }

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
      total: sliceDesc.length,
      items: sliceDesc.map(toSummary),
    };
    await writeIfChanged(path.join(CHUNKS_DIR, fileName), JSON.stringify(payload, null, 2) + '\n');
    chunkMeta.push({
      file: fileName,
      count: sliceDesc.length,
      newestDate: sliceDesc[0]?.date || '',
      oldestDate: sliceDesc[sliceDesc.length - 1]?.date || '',
    });
  }

  // Remove obsolete extra chunk files if total shrank.
  for (const existingFile of await fs.readdir(CHUNKS_DIR)) {
    if (existingFile.endsWith('.json') && !expectedChunkFiles.has(existingFile)) {
      await fs.unlink(path.join(CHUNKS_DIR, existingFile));
    }
  }

  // Manifest lists chunks from highest number (newest) to lowest (oldest).
  const chunksDesc = chunkMeta.slice().reverse();
  const manifest = {
    version: 1,
    lastUpdated: nowIso,
    total: itemsDesc.length,
    pageSize: CHUNK_SIZE,
    latestChunk: chunksDesc[0]?.file || '',
    chunks: chunksDesc,
  };
  await fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  // Keep legacy news.json capped at the latest N full items for audit CMS & <noscript>.
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
