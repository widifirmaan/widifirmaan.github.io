#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const NEWS_FILE = path.join(ROOT, 'news.json');
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const TOKEN = process.env.NEWS_API_TOKEN || '';

function send(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(body);
}

function unauthorized(res) {
  send(res, 401, { error: 'Unauthorized' });
}

function isAuthorized(req) {
  if (!TOKEN) return true;
  const auth = req.headers.authorization || '';
  return auth === `Bearer ${TOKEN}`;
}

async function readNews() {
  try {
    const raw = await fs.readFile(NEWS_FILE, 'utf8');
    const data = JSON.parse(raw);
    const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    return { lastUpdated: data?.lastUpdated || new Date().toISOString(), items: items.map(normalize) };
  } catch (err) {
    if (err.code === 'ENOENT') return { lastUpdated: new Date().toISOString(), items: [] };
    throw err;
  }
}

async function writeNews(items) {
  const normalized = items.map(normalize).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const payload = { lastUpdated: new Date().toISOString(), total: normalized.length, items: normalized };
  await fs.writeFile(NEWS_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  return payload;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

function uid() {
  return 'news-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function asString(v) { return typeof v === 'string' ? v.trim() : ''; }
function asStringArray(v) { return Array.isArray(v) ? v.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()) : []; }

function normalize(raw = {}) {
  const item = raw && typeof raw === 'object' ? raw : {};
  const title = asString(item.title);
  const slug = asString(item.slug) || slugify(title);
  return {
    id: asString(item.id) || (slug ? `news-${slug}` : uid()),
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

function pick(input, existing) {
  const src = input && typeof input === 'object' ? input : {};
  const base = existing || {};
  return normalize({
    ...base,
    ...src,
    id: base.id || src.id,
    slug: src.slug !== undefined ? src.slug : (src.title !== undefined ? slugify(src.title) : base.slug),
  });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  const text = Buffer.concat(chunks).toString('utf8');
  try { return JSON.parse(text); } catch { throw Object.assign(new Error('Invalid JSON body'), { status: 400 }); }
}

function matchIndex(items, idOrSlug) {
  return items.findIndex(i => i.id === idOrSlug || i.slug === idOrSlug);
}

async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (!isAuthorized(req)) return unauthorized(res);

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const parts = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean);

  try {
    if (parts[0] !== 'api' || parts[1] !== 'articles') {
      return send(res, 404, { error: 'Not found', endpoints: ['/api/articles', '/api/articles/:id'] });
    }

    const id = parts[2] ? decodeURIComponent(parts[2]) : '';
    const news = await readNews();

    if (req.method === 'GET' && !id) {
      return send(res, 200, { total: news.items.length, lastUpdated: news.lastUpdated, items: news.items });
    }

    if (req.method === 'GET' && id) {
      const item = news.items.find(i => i.id === id || i.slug === id);
      return item ? send(res, 200, item) : send(res, 404, { error: 'Article not found' });
    }

    if (req.method === 'POST' && !id) {
      const body = await readBody(req);
      const item = normalize(body);
      if (!item.title && !item.slug) return send(res, 400, { error: 'title or slug is required' });
      if (news.items.some(i => i.id === item.id || (item.slug && i.slug === item.slug))) {
        return send(res, 409, { error: 'Article with same id/slug already exists' });
      }
      news.items.push(item);
      const payload = await writeNews(news.items);
      return send(res, 201, { ...item, feed: { lastUpdated: payload.lastUpdated, total: payload.total } });
    }

    if (req.method === 'PUT' && id) {
      const idx = matchIndex(news.items, id);
      if (idx === -1) return send(res, 404, { error: 'Article not found' });
      const body = await readBody(req);
      const updated = pick(body, news.items[idx]);
      const conflict = news.items.some((i, n) => n !== idx && (i.id === updated.id || (updated.slug && i.slug === updated.slug)));
      if (conflict) return send(res, 409, { error: 'Article with same id/slug already exists' });
      news.items[idx] = updated;
      const payload = await writeNews(news.items);
      return send(res, 200, { ...updated, feed: { lastUpdated: payload.lastUpdated, total: payload.total } });
    }

    if (req.method === 'DELETE' && id) {
      const idx = matchIndex(news.items, id);
      if (idx === -1) return send(res, 404, { error: 'Article not found' });
      const [removed] = news.items.splice(idx, 1);
      const payload = await writeNews(news.items);
      return send(res, 200, { deleted: removed.id, feed: { lastUpdated: payload.lastUpdated, total: payload.total } });
    }

    return send(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    const status = err.status || 500;
    return send(res, status, { error: err.message || 'Internal server error' });
  }
}

http.createServer(handler).listen(PORT, HOST, () => {
  console.log(`News API listening on http://${HOST}:${PORT}`);
  console.log(`File: ${NEWS_FILE}`);
});
