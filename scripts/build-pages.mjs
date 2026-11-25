#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT_DIR,
  EXTRA_LOCALES,
  localizeArticle,
  readAllArticles,
} from './news-store.mjs';

const SITE_URL = 'https://widifirmaan.web.id';
const OUT_DIR = path.join(ROOT_DIR, '_site');
const ROOT_FILES = [
  'CNAME',
  'favicon.png',
  'memoji.png',
  'animoji.glb',
  'index.html',
  'style.css',
  'script.js',
  'translations.js',
  'projects.json',
  'news.json',
  'robots.txt',
];
const STATIC_DIRS = ['v1'];

const LOCALE_META = {
  id: {
    htmlLang: 'id',
    ogLocale: 'id_ID',
    dateLocale: 'id-ID',
    inLanguage: 'id-ID',
    backLabel: '← Semua Berita',
    sourceLabel: 'Sumber',
    aiNote: 'Konten ini dibuat dengan bantuan AI.',
    feedTitle: 'News | Widi Firmansyah',
    feedSubtitle: 'Berita, tips, dan trik seputar coding, ditulis untuk dipraktikkan, bukan sekadar dibaca.',
    feedDescription: 'Berita, tips, dan trik seputar coding oleh Widi Firmansyah, arsip artikel praktis tentang backend, frontend, dan rekayasa perangkat lunak.',
    emptyText: 'Belum ada berita yang dipublikasikan.',
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    dateLocale: 'en-US',
    inLanguage: 'en-US',
    backLabel: '← All News',
    sourceLabel: 'Source',
    aiNote: 'This content was created with AI assistance.',
    feedTitle: 'News | Widi Firmansyah',
    feedSubtitle: 'News, tips, and tricks about coding, written to be practised, not just read.',
    feedDescription: 'Coding news, tips, and practical technical articles by Widi Firmansyah covering systems, tooling, and open-source software.',
    emptyText: 'No news has been published yet.',
  },
  zh: {
    htmlLang: 'zh',
    ogLocale: 'zh_CN',
    dateLocale: 'zh-CN',
    inLanguage: 'zh-CN',
    backLabel: '← 全部新闻',
    sourceLabel: '来源',
    aiNote: '本内容由 AI 辅助生成。',
    feedTitle: '新闻 | Widi Firmansyah',
    feedSubtitle: '关于编程的新闻、技巧与实践：为动手实践而写，而不只是阅读。',
    feedDescription: 'Widi Firmansyah 整理的编程新闻、开源项目分析与实用工程技术文章归档。',
    emptyText: '暂无已发布的新闻。',
  },
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(value) {
  return escapeHtml(value);
}

function safeJsonLd(obj) {
  return JSON.stringify(obj, null, 2).replace(/<\//g, '<\\/');
}

function safeHref(raw) {
  const value = String(raw || '').trim();
  if (/^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(value)) return value;
  return '#';
}

function hostOf(raw) {
  try {
    return new URL(raw).host;
  } catch {
    return raw;
  }
}

function formatDate(value, lang = 'id') {
  if (!value) return '';
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return value;
  const meta = LOCALE_META[lang] || LOCALE_META.id;
  return new Intl.DateTimeFormat(meta.dateLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function availableArticleLocales(article) {
  const out = ['id'];
  for (const lang of EXTRA_LOCALES) {
    const loc = article.locales && article.locales[lang];
    if (loc && typeof loc.body === 'string' && loc.body.trim()) {
      out.push(lang);
    }
  }
  return out;
}

function articlePath(slug, lang = 'id') {
  return lang === 'id' ? `/news/${slug}/` : `/${lang}/news/${slug}/`;
}

function feedPath(lang = 'id') {
  return lang === 'id' ? '/news/' : `/${lang}/news/`;
}

function buildHreflangLinks(urlByLang, defaultPath) {
  const links = Object.entries(urlByLang).map(
    ([lang, relPath]) =>
      `        <link rel="alternate" hreflang="${escapeHtml(lang)}" href="${escapeHtml(SITE_URL + relPath)}" />`
  );
  links.push(
    `        <link rel="alternate" hreflang="x-default" href="${escapeHtml(SITE_URL + defaultPath)}" />`
  );
  return links.join('\n');
}

function buildOgAlternateLocales(activeLang, availableLangs) {
  return availableLangs
    .filter((l) => l !== activeLang)
    .map((l) => LOCALE_META[l]?.ogLocale)
    .filter(Boolean)
    .map((loc) => `        <meta property="og:locale:alternate" content="${loc}" />`)
    .join('\n');
}

function buildLangSwitcher(activeLang) {
  const labels = { id: 'ID', en: 'EN', zh: '中' };
  return ['id', 'en', 'zh']
    .map(
      (lang) =>
        `                        <button class="lang-btn${lang === activeLang ? ' active' : ''}" data-lang="${lang}">${labels[lang]}</button>`
    )
    .join('\n');
}

async function readImageDimensions(assetPath) {
  if (!assetPath || !assetPath.startsWith('/news/assets/')) return null;
  const fullPath = path.join(ROOT_DIR, assetPath.replace(/^\/+/, ''));
  try {
    const buf = await fs.readFile(fullPath);
    if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (buf.length >= 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      const chunk = buf.toString('ascii', 12, 16);
      if (chunk === 'VP8X') {
        const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
        const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
        return { width: w, height: h };
      }
      if (chunk === 'VP8 ' && buf.length >= 30) {
        return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      }
      if (chunk === 'VP8L' && buf.length >= 25) {
        const bits = buf.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
    }
    if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i + 9 < buf.length && buf[i] === 0xff) {
        const marker = buf[i + 1];
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
        }
        const len = buf.readUInt16BE(i + 2);
        if (len < 2) break;
        i += 2 + len;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function formatEmphasis(raw) {
  let out = escapeHtml(raw);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  return out;
}

function formatInline(text, imageDimsMap) {
  const placeholders = [];
  const hold = (html) => {
    const idx = placeholders.length;
    placeholders.push(html);
    return `\u0000PH${idx}\u0000`;
  };

  let s = String(text || '');
  s = s.replace(/`([^`]+)`/g, (_, code) => hold(`<code>${escapeHtml(code)}</code>`));
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    const cleanSrc = safeHref(src);
    const dims = imageDimsMap.get(cleanSrc);
    const dimAttrs = dims ? ` width="${dims.width}" height="${dims.height}"` : '';
    return hold(`<img src="${escapeHtml(cleanSrc)}" alt="${escapeHtml(alt)}"${dimAttrs} decoding="async" />`);
  });
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const cleanHref = safeHref(href);
    const external = /^https?:\/\//i.test(cleanHref) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return hold(`<a href="${escapeHtml(cleanHref)}"${external}>${formatEmphasis(label)}</a>`);
  });

  s = formatEmphasis(s);
  return s.replace(/\u0000PH(\d+)\u0000/g, (_, idx) => placeholders[Number(idx)] || '');
}

function renderMarkdown(markdown, imageDimsMap) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fenceMatch = line.match(/^```([a-zA-Z0-9_-]*)\s*$/);
    if (fenceMatch) {
      const lang = fenceMatch[1] ? ` class="language-${escapeHtml(fenceMatch[1])}"` : '';
      const codeLines = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      out.push(`<pre><code${lang}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      out.push(`<h${level}>${formatInline(headingMatch[2].trim(), imageDimsMap)}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      out.push('<hr />');
      i += 1;
      continue;
    }

    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = safeHref(imgMatch[2]);
      const dims = imageDimsMap.get(src);
      const dimAttrs = dims ? ` width="${dims.width}" height="${dims.height}"` : '';
      out.push(
        `<figure class="news-article-figure"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${dimAttrs} decoding="async" /></figure>`
      );
      i += 1;
      continue;
    }

    if (line.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote><p>${formatInline(quoteLines.join(' ').trim(), imageDimsMap)}</p></blockquote>`);
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?(\s*:?-{2,}:?\s*\|)+\s*:?-{2,}:?\s*\|?\s*$/.test(lines[i + 1])) {
      const parseRow = (row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
      const headers = parseRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(parseRow(lines[i]));
        i += 1;
      }
      const thead = `<thead><tr>${headers.map((h) => `<th>${formatInline(h, imageDimsMap)}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${formatInline(c, imageDimsMap)}</td>`).join('')}</tr>`).join('')}</tbody>`;
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i += 1;
      }
      out.push(`<ul>${items.map((it) => `<li>${formatInline(it, imageDimsMap)}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      out.push(`<ol>${items.map((it) => `<li>${formatInline(it, imageDimsMap)}</li>`).join('')}</ol>`);
      continue;
    }

    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s+|```|>|[-*]\s+|\d+\.\s+|(-{3,}|\*{3,})\s*$)/.test(lines[i]) &&
      !lines[i].trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    if (paraLines.length) {
      out.push(`<p>${formatInline(paraLines.join(' '), imageDimsMap)}</p>`);
    }
  }

  return out.join('\n');
}

function themeBootstrapScript() {
  return `        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" content="#050505" />
        <script>
            (function () {
                try {
                    var stored = localStorage.getItem('theme');
                    var mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
                    var effective =
                        mode === 'light' || mode === 'dark'
                            ? mode
                            : window.matchMedia('(prefers-color-scheme: light)').matches
                              ? 'light'
                              : 'dark';
                    document.documentElement.setAttribute('data-theme', effective);
                    document.documentElement.style.backgroundColor = effective === 'light' ? '#ffffff' : '#050505';
                    var meta = document.querySelector('meta[name="theme-color"]');
                    if (meta) meta.setAttribute('content', effective === 'light' ? '#ffffff' : '#050505');
                } catch (e) {}
            })();
        </script>`;
}

function navbarHtml(toRoot, newsHref, activeLang) {
  return `        <nav class="glass-panel">
            <a class="logo" href="${escapeHtml(toRoot)}">WDPORT</a>
            <ul class="nav-links">
                <li><a href="${escapeHtml(toRoot)}index.html#home" data-i18n="nav-home">Home</a></li>
                <li><a href="${escapeHtml(toRoot)}index.html#about" data-i18n="nav-about">About</a></li>
                <li><a href="${escapeHtml(toRoot)}index.html#works" data-i18n="nav-works">Works</a></li>
                <li><a href="${escapeHtml(newsHref)}" class="is-current" aria-current="page" data-i18n="nav-news">News</a></li>
                <li><a href="${escapeHtml(toRoot)}index.html#contact" data-i18n="nav-contact">Contact</a></li>
                <li class="theme-switcher-container">
                    <button
                        type="button"
                        class="theme-toggle"
                        id="theme-toggle"
                        aria-label="Theme: system"
                        title="Theme: system (click for light)"
                    >
                        <span class="theme-icon visible" id="theme-icon-active"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></span>
                        <span class="theme-label" id="theme-label">System</span>
                    </button>
                </li>
                <li class="lang-switcher-container">
                    <div class="lang-switcher">
${buildLangSwitcher(activeLang)}
                    </div>
                </li>
            </ul>
            <button type="button" class="hamburger" aria-label="Buka menu navigasi" aria-expanded="false">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
            </button>
        </nav>`;
}

function renderArticlePage(rawArticle, lang, imageDimsMap) {
  const meta = LOCALE_META[lang] || LOCALE_META.id;
  const article = localizeArticle(rawArticle, lang);
  const avail = availableArticleLocales(rawArticle);
  const urlByLang = {};
  for (const l of avail) {
    urlByLang[l] = articlePath(article.slug, l);
  }

  const canonicalUrl = `${SITE_URL}${articlePath(article.slug, lang)}`;
  const heroImage = Array.isArray(article.images) && article.images[0] ? article.images[0] : '/memoji.png';
  const absoluteImage = heroImage.startsWith('http') ? heroImage : `${SITE_URL}${heroImage}`;
  const formattedDate = formatDate(article.date, lang);
  const category = article.category || (article.source === 'ai' ? 'AI' : 'News');
  const labelClass = article.source === 'ai' ? 'news-label is-ai' : 'news-label';
  const bodyHtml = renderMarkdown(article.body, imageDimsMap);

  const toRoot = lang === 'id' ? '../../' : '../../../';
  const newsCssHref = lang === 'id' ? '../news.css?v=3.2' : '../../../news/news.css?v=3.2';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.excerpt,
    inLanguage: meta.inLanguage,
    datePublished: article.date,
    dateModified: article.date,
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    articleSection: category,
    image: [absoluteImage],
    author: {
      '@type': 'Person',
      name: 'Widi Firmansyah',
      url: `${SITE_URL}/`,
    },
    publisher: {
      '@type': 'Person',
      name: 'Widi Firmansyah',
      url: `${SITE_URL}/`,
    },
  };

  const sourceLink = article.url
    ? `<a class="news-article-source" href="${escapeHtml(safeHref(article.url))}" target="_blank" rel="noopener noreferrer"><span data-i18n="news-source">${escapeHtml(meta.sourceLabel)}</span>: ${escapeHtml(hostOf(article.url))}</a>`
    : '';
  const aiNote =
    article.source === 'ai'
      ? `<p class="news-article-ai-note" data-i18n="news-ai-note">${escapeHtml(meta.aiNote)}</p>`
      : '';

  return `<!doctype html>
<html lang="${meta.htmlLang}" data-page-lang="${lang}" data-theme="dark">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(article.title)} | ${escapeHtml(meta.feedTitle)}</title>

        <meta name="title" content="${escapeHtml(article.title)} | ${escapeHtml(meta.feedTitle)}" />
        <meta name="description" content="${escapeHtml(article.excerpt)}" />
        <meta name="author" content="Widi Firmansyah" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
${buildHreflangLinks(urlByLang, articlePath(article.slug, 'id'))}

        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Widi Firmansyah Portfolio" />
        <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
        <meta property="og:title" content="${escapeHtml(article.title)}" />
        <meta property="og:description" content="${escapeHtml(article.excerpt)}" />
        <meta property="og:image" content="${escapeHtml(absoluteImage)}" />
        <meta property="article:published_time" content="${escapeHtml(article.date)}" />
        <meta property="article:section" content="${escapeHtml(category)}" />
        <meta property="og:locale" content="${meta.ogLocale}" />
${buildOgAlternateLocales(lang, avail)}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />
        <meta name="twitter:title" content="${escapeHtml(article.title)}" />
        <meta name="twitter:description" content="${escapeHtml(article.excerpt)}" />
        <meta name="twitter:image" content="${escapeHtml(absoluteImage)}" />

        <link rel="icon" type="image/png" href="${toRoot}favicon.png" />
        <link rel="apple-touch-icon" href="${toRoot}memoji.png" />

        <script type="application/ld+json">
${safeJsonLd(jsonLd)}
        </script>

${themeBootstrapScript()}

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="stylesheet" href="${toRoot}style.css?v=5.0" />
        <link rel="stylesheet" href="${newsCssHref}" />
        <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Syncopate:wght@700&display=swap"
            rel="stylesheet"
        />
    </head>

    <body data-page="news" data-lang-urls="${escapeHtml(JSON.stringify(urlByLang))}">
        <div class="cursor-follower"></div>

        <canvas id="webgl"></canvas>

${navbarHtml(toRoot, '../', lang)}

        <main>
            <section class="news">
                <div class="container">
                    <a class="news-article-back" href="../" data-i18n="news-back">${escapeHtml(meta.backLabel)}</a>

                    <article class="news-article">
                        <header class="news-article-header">
                            <div class="news-article-meta">
                                <span class="${labelClass}">${escapeHtml(category)}</span>
                                <time class="news-date" datetime="${escapeHtml(article.date)}">${escapeHtml(formattedDate)}</time>
                            </div>
                            <h1 class="news-article-title">${escapeHtml(article.title)}</h1>
                            <p class="news-article-excerpt">${escapeHtml(article.excerpt)}</p>
                        </header>

                        <div class="markdown-body">
${bodyHtml}
                        </div>

                        <footer class="news-article-footer">
                            ${sourceLink}
                            ${aiNote}
                        </footer>
                    </article>

                    <footer>
                        <p data-i18n="footer-copy">© 2026 WDPORT. Hak cipta dilindungi undang-undang.</p>
                    </footer>
                </div>
            </section>
        </main>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.19/bundled/lenis.min.js"></script>
        <script src="${toRoot}translations.js?v=1.1"></script>
        <script src="${toRoot}script.js?v=5.0"></script>
    </body>
</html>
`;
}

function buildFeedPreRender(items, lang) {
  const meta = LOCALE_META[lang] || LOCALE_META.id;
  const firstPage = items.slice(0, 25);
  if (!firstPage.length) {
    return `<p class="news-empty" data-i18n="news-empty">${escapeHtml(meta.emptyText)}</p>`;
  }
  const siteRoot = lang === 'id' ? '../' : '../../';
  return firstPage
    .map((raw) => {
      const item = localizeArticle(raw, lang);
      const targetLang = item.lang === lang ? lang : 'id';
      const href = `${siteRoot}${targetLang === 'id' ? 'news' : `${targetLang}/news`}/${encodeURIComponent(item.slug)}/`;
      const labelClass = item.source === 'ai' ? 'news-label is-ai' : 'news-label';
      const category = item.category || (item.source === 'ai' ? 'AI' : 'News');
      return `<a class="news-entry" href="${escapeHtml(href)}" aria-label="${escapeHtml(item.title)}"><div class="news-entry-head"><span class="${labelClass}">${escapeHtml(category)}</span><span class="news-date">${escapeHtml(formatDate(item.date, lang))}</span></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.excerpt)}</p></a>`;
    })
    .join('\n                        ');
}

function renderFeedPage(items, lang) {
  const meta = LOCALE_META[lang] || LOCALE_META.id;
  const toRoot = lang === 'id' ? '../' : '../../';
  const newsCssHref = lang === 'id' ? 'news.css?v=3.2' : '../../news/news.css?v=3.2';
  const newsJsSrc = lang === 'id' ? 'news.js?v=3.4' : '../../news/news.js?v=3.4';
  const canonicalUrl = `${SITE_URL}${feedPath(lang)}`;
  const urlByLang = { id: feedPath('id'), en: feedPath('en'), zh: feedPath('zh') };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: meta.feedTitle,
    url: canonicalUrl,
    inLanguage: meta.inLanguage,
    description: meta.feedDescription,
    isPartOf: {
      '@type': 'WebSite',
      url: `${SITE_URL}/`,
    },
    about: {
      '@type': 'Person',
      name: 'Widi Firmansyah',
      url: `${SITE_URL}/`,
    },
  };

  return `<!doctype html>
<html lang="${meta.htmlLang}"${lang !== 'id' ? ` data-page-lang="${lang}"` : ''} data-theme="dark">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(meta.feedTitle)}</title>

        <meta name="title" content="${escapeHtml(meta.feedTitle)}" />
        <meta name="description" content="${escapeHtml(meta.feedDescription)}" />
        <meta name="author" content="Widi Firmansyah" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
${buildHreflangLinks(urlByLang, feedPath('id'))}

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Widi Firmansyah Portfolio" />
        <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
        <meta property="og:title" content="${escapeHtml(meta.feedTitle)}" />
        <meta property="og:description" content="${escapeHtml(meta.feedDescription)}" />
        <meta property="og:image" content="${SITE_URL}/memoji.png" />
        <meta property="og:image:alt" content="Avatar Widi Firmansyah" />
        <meta property="og:locale" content="${meta.ogLocale}" />
${buildOgAlternateLocales(lang, ['id', 'en', 'zh'])}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />
        <meta name="twitter:title" content="${escapeHtml(meta.feedTitle)}" />
        <meta name="twitter:description" content="${escapeHtml(meta.feedDescription)}" />
        <meta name="twitter:image" content="${SITE_URL}/memoji.png" />

        <link rel="icon" type="image/png" href="${toRoot}favicon.png" />
        <link rel="apple-touch-icon" href="${toRoot}memoji.png" />

        <script type="application/ld+json">
${safeJsonLd(jsonLd)}
        </script>

${themeBootstrapScript()}

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="stylesheet" href="${toRoot}style.css?v=5.0" />
        <link rel="stylesheet" href="${newsCssHref}" />
        <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Syncopate:wght@700&display=swap"
            rel="stylesheet"
        />
    </head>

    <body data-page="news" data-site-root="${toRoot}">
        <div class="cursor-follower"></div>

        <canvas id="webgl"></canvas>

${navbarHtml(toRoot, './', lang)}

        <main>
            <section id="news" class="news">
                <div class="container">
                    <h2 class="section-title" data-i18n="news-title">NEWS</h2>
                    <p class="news-subtitle" data-i18n="news-subtitle">
                        ${escapeHtml(meta.feedSubtitle)}
                    </p>
                    <p id="news-preview-badge" class="news-preview-badge" hidden data-i18n="news-preview">
                        Pratinjau lokal: belum dipublikasikan
                    </p>

                    <div id="news-feed" class="news-feed">
                        ${buildFeedPreRender(items, lang)}
                    </div>

                    <nav id="news-pagination" class="news-pagination" aria-label="Paginasi berita" hidden></nav>

                    <p id="news-updated" class="news-status"></p>

                    <noscript>
                        <p class="news-empty">
                            Arsip berita memerlukan JavaScript. Data mentah tersedia di
                            <a href="${toRoot}news.json">news.json</a>.
                        </p>
                    </noscript>
                </div>
            </section>

            <footer>
                <p data-i18n="footer-copy">© 2026 WDPORT. Hak cipta dilindungi undang-undang.</p>
            </footer>
        </main>

        <div id="detail-modal" class="modal">
            <div class="modal-overlay"></div>
            <div class="modal-content glass-panel" data-lenis-prevent>
                <button type="button" class="modal-close" aria-label="Tutup">&times;</button>
                <div class="modal-scroll-area">
                    <div class="modal-body">
                        <div id="modal-description" class="modal-description"></div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.19/bundled/lenis.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <script src="${toRoot}translations.js?v=1.1"></script>
        <script src="${toRoot}script.js?v=5.0"></script>
        <script src="${newsJsSrc}"></script>
    </body>
</html>
`;
}

function sitemapAlternateTags(alternates) {
  return alternates
    .map(
      ({ hreflang, href }) =>
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}" />`
    )
    .join('\n');
}

function buildSitemap(items) {
  const latestDate = items[0]?.date || new Date().toISOString().slice(0, 10);
  const feedAlternates = [
    { hreflang: 'id', href: `${SITE_URL}/news/` },
    { hreflang: 'en', href: `${SITE_URL}/en/news/` },
    { hreflang: 'zh', href: `${SITE_URL}/zh/news/` },
    { hreflang: 'x-default', href: `${SITE_URL}/news/` },
  ];

  const feedEntries = ['id', 'en', 'zh'].map(
    (lang) => `  <url>
    <loc>${escapeXml(SITE_URL + feedPath(lang))}</loc>
    <lastmod>${escapeXml(latestDate)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${lang === 'id' ? '0.8' : '0.7'}</priority>
${sitemapAlternateTags(feedAlternates)}
  </url>`
  );

  const articleEntries = [];
  for (const item of items) {
    const avail = availableArticleLocales(item);
    const alternates = [
      ...avail.map((l) => ({ hreflang: l, href: `${SITE_URL}${articlePath(item.slug, l)}` })),
      { hreflang: 'x-default', href: `${SITE_URL}${articlePath(item.slug, 'id')}` },
    ];
    for (const lang of avail) {
      articleEntries.push(`  <url>
    <loc>${escapeXml(SITE_URL + articlePath(item.slug, lang))}</loc>
    <lastmod>${escapeXml(item.date || latestDate)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
${sitemapAlternateTags(alternates)}
  </url>`);
    }
  }

  return {
    totalUrls: 1 + feedEntries.length + articleEntries.length,
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${escapeXml(latestDate)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="id" href="${SITE_URL}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/" />
    <xhtml:link rel="alternate" hreflang="zh" href="${SITE_URL}/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />
  </url>
${feedEntries.join('\n')}
${articleEntries.join('\n')}
</urlset>
`,
  };
}

async function copyDirFiltered(src, dest, excludeRel = new Set(), prefix = '') {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (excludeRel.has(rel)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDirFiltered(srcPath, destPath, excludeRel, rel);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const file of ROOT_FILES) {
    const src = path.join(ROOT_DIR, file);
    try {
      await fs.copyFile(src, path.join(OUT_DIR, file));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  for (const dir of STATIC_DIRS) {
    const src = path.join(ROOT_DIR, dir);
    try {
      await copyDirFiltered(src, path.join(OUT_DIR, dir));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  // Copy news/ excluding local-only CMS news/audit/
  await copyDirFiltered(
    path.join(ROOT_DIR, 'news'),
    path.join(OUT_DIR, 'news'),
    new Set(['audit'])
  );

  const { items } = await readAllArticles();

  // Pre-collect image dimensions for all /news/assets/* references
  const imageDimsMap = new Map();
  for (const item of items) {
    for (const imgPath of item.images || []) {
      if (!imageDimsMap.has(imgPath)) {
        const dims = await readImageDimensions(imgPath);
        if (dims) imageDimsMap.set(imgPath, dims);
      }
    }
    const bodies = [item.body, ...Object.values(item.locales || {}).map((l) => l && l.body)];
    for (const body of bodies) {
      const matches = String(body || '').matchAll(/!\[[^\]]*\]\(([^)]+)\)/g);
      for (const m of matches) {
        const src = m[1].trim();
        if (!imageDimsMap.has(src)) {
          const dims = await readImageDimensions(src);
          if (dims) imageDimsMap.set(src, dims);
        }
      }
    }
  }

  // Build localized feed pages (/news/, /en/news/, /zh/news/)
  for (const lang of ['id', 'en', 'zh']) {
    const feedOut = lang === 'id'
      ? path.join(OUT_DIR, 'news', 'index.html')
      : path.join(OUT_DIR, lang, 'news', 'index.html');
    await fs.mkdir(path.dirname(feedOut), { recursive: true });
    await fs.writeFile(feedOut, renderFeedPage(items, lang), 'utf8');
  }

  // Build localized article pages (/news/<slug>/, /en/news/<slug>/, /zh/news/<slug>/)
  let articlePagesCount = 0;
  for (const article of items) {
    for (const lang of availableArticleLocales(article)) {
      const rel = articlePath(article.slug, lang).replace(/^\/+/, '');
      const articleDir = path.join(OUT_DIR, rel);
      await fs.mkdir(articleDir, { recursive: true });
      await fs.writeFile(
        path.join(articleDir, 'index.html'),
        renderArticlePage(article, lang, imageDimsMap),
        'utf8'
      );
      articlePagesCount += 1;
    }
  }

  // Generate multilingual sitemap.xml in _site/
  const sitemap = buildSitemap(items);
  await fs.writeFile(path.join(OUT_DIR, 'sitemap.xml'), sitemap.xml, 'utf8');

  console.log(
    `Built static site in _site/: ${items.length} article(s), ${articlePagesCount} localized article page(s), ${sitemap.totalUrls} sitemap URL(s).`
  );
}

main().catch((err) => {
  console.error('build-pages failed:', err);
  process.exit(1);
});
