#!/usr/bin/env node
/**
 * Generates 1-3 coding articles and prepends them to news.json.
 *
 * Provider is configurable so the workflow is not tied to a retired API:
 *   NEWS_AI_PROVIDER=openai  (default) -> {BASE_URL}/chat/completions
 *   NEWS_AI_PROVIDER=gemini            -> {BASE_URL}/models/{MODEL}:generateContent
 *
 * Required:
 *   NEWS_AI_API_KEY (or OPENAI_API_KEY / GEMINI_API_KEY)
 *
 * Optional:
 *   NEWS_AI_BASE_URL, NEWS_AI_MODEL, NEWS_COUNT, NEWS_TOPIC,
 *   NEWS_CATEGORY, NEWS_LANGUAGE
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readAllArticles,
  readKnownSummaries,
  writeNewsStore,
} from './news-store.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const NEWS_FILE = path.join(ROOT_DIR, 'news.json');

const PROVIDERS = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4.1-mini'
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.5-flash'
  }
};

const LANGUAGES = {
  id: 'Bahasa Indonesia',
  en: 'English',
  zh: 'Simplified Chinese'
};

const CATEGORIES = [
  'Backend',
  'Frontend',
  'DevOps',
  'Database',
  'Security',
  'Performance',
  'Tooling',
  'AI',
  'Open Source'
];

function readConfig() {
  const provider = (process.env.NEWS_AI_PROVIDER || 'openai').toLowerCase();
  if (!PROVIDERS[provider]) {
    throw new Error(
      `NEWS_AI_PROVIDER "${provider}" tidak dikenal. Pilih: ${Object.keys(PROVIDERS).join(', ')}.`
    );
  }

  const language = (process.env.NEWS_LANGUAGE || 'id').toLowerCase();
  const count = Number.parseInt(process.env.NEWS_COUNT || '1', 10);

  return {
    provider,
    baseUrl: (process.env.NEWS_AI_BASE_URL || PROVIDERS[provider].baseUrl).replace(/\/+$/, ''),
    model: process.env.NEWS_AI_MODEL || PROVIDERS[provider].model,
    apiKey:
      process.env.NEWS_AI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      '',
    count: Number.isFinite(count) ? Math.min(Math.max(count, 1), 3) : 1,
    topic: (process.env.NEWS_TOPIC || '').trim(),
    category: (process.env.NEWS_CATEGORY || '').trim(),
    language: LANGUAGES[language] ? language : 'id'
  };
}

function jakartaDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

function titleKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 90);
}

function buildSystemPrompt() {
  return [
    'You are a senior software engineer and technical journalist writing for a developer portfolio.',
    'Write in clear, factual, dynamic, journalistic language: active voice, concrete claims, no hype, and no guessing without verified facts.',
    'Never use emoji.',
    'Never use em dashes or double hyphens as sentence punctuation. Use commas, periods, or split sentences.',
    'Never invent personal stories, employers, clients, benchmarks, statistics, quotes, citations, or test results.',
    'Never write "as an AI" and never mention prompts or internal instructions.',
    'Code examples must be correct, minimal, and explained.'
  ].join(' ');
}

function buildUserPrompt(config, today) {
  const topic =
    config.topic ||
    'choose a concrete, evergreen problem that developers actually search for (debugging, architecture, performance, security, tooling, or testing)';
  const category = config.category || `choose one of: ${CATEGORIES.join(', ')}`;

  return `Write ${config.count} original coding article(s) in ${LANGUAGES[config.language]}, plus natural transcreated editions for English ("en") and Simplified Chinese ("zh").

Topic: ${topic}
Category: ${category}
Publication date: ${today}

Editorial and SEO rules:
- 500-900 words of Markdown per article for id and en (matching complete Chinese article for zh).
- Open with one paragraph that states the problem or practical payoff; do not restate the title.
- Use 3 to 5 descriptive "## " sections with flowing paragraphs; avoid stiff "- **Label:** ..." bold list templates.
- Include at least one minimal fenced code block with a language tag and explain it concisely below the block.
- No filler, no generic motivation, no listicles without substance.
- No emoji. No em dash character. No "--" used as sentence punctuation outside code blocks.
- Do not fabricate personal experience, employers, clients, metrics, or benchmark numbers.
- No HTML, no third-party blog links if official primary source applies.
- Title: max 80 characters for id/en (18-45 Han characters for zh), specific, no clickbait, no numbering prefix.
- Excerpt (meta description): 120-200 characters for id/en (60-110 chars for zh).
- Slug: kebab-case English, max 60 characters, derived from the title.
- Category must be one of: ${CATEGORIES.join(', ')}.
- Transcreation rule: keep project names, CLI flags, code identifiers, version numbers, and verified metrics consistent while making phrasing natural in each language.

Return ONLY valid JSON without prose or code fences:
{"articles":[{"title":"...","slug":"...","category":"...","excerpt":"...","body":"markdown","locales":{"en":{"title":"...","excerpt":"...","body":"markdown"},"zh":{"title":"...","excerpt":"...","body":"markdown"}}}]}`;
}

async function requestWithRetry(url, options, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, options);
    if (response.ok || (response.status !== 429 && response.status < 500)) return response;
    if (attempt === attempts) return response;
    await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
  }
  throw new Error('Permintaan AI gagal tanpa respons.');
}

function extractOpenAIContent(data) {
  const content = data && data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content
    : '';
  if (Array.isArray(content)) {
    return content.map((part) => (typeof part === 'string' ? part : part.text || '')).join('');
  }
  return typeof content === 'string' ? content : '';
}

function extractGeminiContent(data) {
  const parts =
    data && data.candidates && data.candidates[0] && data.candidates[0].content
      ? data.candidates[0].content.parts || []
      : [];
  return parts.map((part) => part.text || '').join('');
}

async function callOpenAI(config, messages, useJsonMode) {
  const body = {
    model: config.model,
    messages,
    temperature: 0.7
  };
  if (useJsonMode) body.response_format = { type: 'json_object' };

  const response = await requestWithRetry(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180000)
  });

  if (!response.ok) {
    if (useJsonMode && [400, 404, 422].includes(response.status)) {
      return callOpenAI(config, messages, false);
    }
    const detail = await response.text();
    throw new Error(`AI HTTP ${response.status}: ${detail.slice(0, 400)}`);
  }

  const data = await response.json();
  const content = extractOpenAIContent(data);
  if (!content) throw new Error('Respons AI kosong.');
  return content;
}

async function callGemini(config, messages) {
  const prompt = messages.map((message) => message.content).join('\n\n');
  const url = `${config.baseUrl}/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

  const response = await requestWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
    }),
    signal: AbortSignal.timeout(180000)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`AI HTTP ${response.status}: ${detail.slice(0, 400)}`);
  }

  const data = await response.json();
  const content = extractGeminiContent(data);
  if (!content) throw new Error('Respons AI kosong.');
  return content;
}

function parseArticles(text) {
  let raw = String(text).trim();
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '');
  }

  const firstObject = raw.indexOf('{');
  const firstArray = raw.indexOf('[');
  let jsonText = raw;

  if (firstObject !== -1 && (firstArray === -1 || firstObject < firstArray)) {
    const last = raw.lastIndexOf('}');
    jsonText = raw.slice(firstObject, last + 1);
  } else if (firstArray !== -1) {
    const last = raw.lastIndexOf(']');
    jsonText = raw.slice(firstArray, last + 1);
  }

  const parsed = JSON.parse(jsonText);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.articles)) return parsed.articles;
  throw new Error('JSON AI tidak berisi array "articles".');
}

function cleanExcerpt(value, body) {
  let excerpt = String(value || '').replace(/\s+/g, ' ').trim();
  if (!excerpt) {
    excerpt = String(body || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/[#>*_`-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);
  }
  return excerpt.slice(0, 240).trim();
}

function normalizeArticle(raw, config, today, index, usedSlugs) {
  if (!raw || typeof raw !== 'object') return null;

  const title = String(raw.title || '').replace(/\s+/g, ' ').trim();
  const body = String(raw.body || '').trim();
  if (!title || title.length > 120) return null;
  if (body.length < 400) return null;

  let slug = slugify(raw.slug || title);
  if (!slug) slug = `ai-${today.replace(/-/g, '')}-${index + 1}`;
  let candidate = slug;
  let suffix = 2;
  while (usedSlugs.has(candidate)) {
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
  usedSlugs.add(candidate);

  const category = String(config.category || raw.category || 'Coding').trim().slice(0, 40);
  const excerpt = cleanExcerpt(raw.excerpt, body);

  const rawLocales = raw.locales && typeof raw.locales === 'object' ? raw.locales : {};
  const locales = {};
  for (const lang of ['en', 'zh']) {
    const loc = rawLocales[lang];
    if (loc && typeof loc === 'object' && String(loc.body || '').trim().length >= 300) {
      locales[lang] = {
        title: String(loc.title || title).replace(/\s+/g, ' ').trim().slice(0, 90),
        excerpt: cleanExcerpt(loc.excerpt, loc.body),
        body: String(loc.body || '').trim(),
      };
    }
  }

  return {
    id: `ai-${today.replace(/-/g, '')}-${candidate}`,
    title: title.slice(0, 90),
    slug: candidate,
    date: today,
    category,
    excerpt,
    images: [],
    badges: [],
    body,
    ...(Object.keys(locales).length ? { locales } : {}),
    url: '',
    source: 'ai',
    model: config.model
  };
}

async function generate(config) {
  const today = jakartaDate();
  const { items: knownSummaries } = await readKnownSummaries();
  const usedSlugs = new Set(knownSummaries.map((item) => String(item.slug || '').toLowerCase()).filter(Boolean));
  const existingTitles = new Set(knownSummaries.map((item) => titleKey(item.title)).filter(Boolean));
  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: buildUserPrompt(config, today) }
  ];

  let accepted = [];

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const text =
      config.provider === 'gemini'
        ? await callGemini(config, messages)
        : await callOpenAI(config, messages, true);

    const articles = parseArticles(text);
    accepted = [];

    articles.forEach((article, index) => {
      const normalized = normalizeArticle(article, config, today, index, usedSlugs);
      if (!normalized) return;
      if (existingTitles.has(titleKey(normalized.title))) {
        console.log(`- Lewati duplikat judul: ${normalized.title}`);
        return;
      }
      existingTitles.add(titleKey(normalized.title));
      accepted.push(normalized);
    });

    if (accepted.length > 0) break;
    console.warn(`Percobaan ${attempt}: tidak ada artikel valid, mencoba ulang...`);
  }

  if (accepted.length === 0) {
    console.log('Tidak ada artikel baru. Data berita tidak diubah.');
    return;
  }

  const { items: existing } = await readAllArticles();
  const result = await writeNewsStore(accepted.concat(existing));
  console.log(`Ditambahkan ${accepted.length} artikel (${config.provider}/${config.model}).`);
  accepted.forEach((item) => console.log(`  + ${item.date}  ${item.title}`));
  console.log(`Total arsip berita sekarang: ${result.total} item (${result.chunks} chunk, terbaru ${result.latestChunk}).`);
}

async function main() {
  let config;
  try {
    config = readConfig();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (!config.apiKey) {
    console.log(
      '::warning::NEWS_AI_API_KEY belum diatur. Generator dilewati; isi secret repositori untuk mengaktifkan artikel otomatis.'
    );
    return;
  }

  await generate(config);
}

main().catch((error) => {
  console.error('Generate news gagal:', error.message);
  process.exit(1);
});
