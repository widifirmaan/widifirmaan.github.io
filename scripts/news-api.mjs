#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  ROOT_DIR as ROOT,
  NEWS_FILE,
  asString,
  slugify,
  normalizeArticle as normalize,
  readAllArticles as readNews,
  writeNewsStore as writeNews,
} from './news-store.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = path.join(ROOT, 'news', 'assets');
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

function safeName(name) {
  const base = path.basename(String(name || '')).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return base.slice(0, 120);
}

function extFromMime(mime) {
  const map = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/avif': '.avif', 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov' };
  return map[mime] || '';
}

async function ensureMediaDir() {
  await fs.mkdir(MEDIA_DIR, { recursive: true });
}

function unauthorized(res) {
  send(res, 401, { error: 'Unauthorized' });
}

function isAuthorized(req) {
  if (!TOKEN) return true;
  const auth = req.headers.authorization || '';
  return auth === `Bearer ${TOKEN}`;
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
    if (parts[0] !== 'api') {
      return send(res, 404, { error: 'Not found' });
    }

    if (parts[1] === 'media') {
      if (req.method !== 'POST' || parts[2]) return send(res, 405, { error: 'Method not allowed' });
      const body = await readBody(req);
      const filename = safeName(body.filename || body.name || 'media');
      const mime = asString(body.mimeType || body.contentType);
      const data = asString(body.data || body.base64 || body.content);
      if (!data) return send(res, 400, { error: 'data/base64 is required' });
      const allowed = /^(image|video)\//.test(mime);
      if (mime && !allowed) return send(res, 400, { error: 'Only image/* or video/* allowed' });
      const buf = Buffer.from(data.replace(/^data:[^;]+;base64,/, ''), 'base64');
      if (!buf.length) return send(res, 400, { error: 'Invalid base64 data' });
      const ext = path.extname(filename) || extFromMime(mime);
      const stem = (path.basename(filename, path.extname(filename)) || 'media').slice(0, 80);
      const outName = `${stem}-${crypto.randomUUID().slice(0, 8)}${ext}`;
      await ensureMediaDir();
      await fs.writeFile(path.join(MEDIA_DIR, outName), buf);
      const filePath = `news/assets/${outName}`;
      return send(res, 201, { path: `/${filePath}`, raw: `https://raw.githubusercontent.com/widifirmaan/widifirmaan.github.io/master/${filePath}`, mimeType: mime, bytes: buf.length });
    }

    if (parts[1] !== 'articles') {
      return send(res, 404, { error: 'Not found', endpoints: ['/api/articles', '/api/articles/:id', '/api/media'] });
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
