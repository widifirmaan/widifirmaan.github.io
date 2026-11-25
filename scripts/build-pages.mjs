#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT_DIR,
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

function formatDateId(value) {
  if (!value) return '';
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

async function readImageDimensions(assetPath) {
  if (!assetPath || !assetPath.startsWith('/news/assets/')) return null;
  const fullPath = path.join(ROOT_DIR, assetPath.replace(/^\/+/, ''));
  try {
    const buf = await fs.readFile(fullPath);
    // PNG
    if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    // WebP (RIFF....WEBP + VP8 / VP8L / VP8X)
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
    // JPEG SOF0/SOF2
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

function formatInline(text, imageDimsMap) {
  const placeholders = [];
  const hold = (html) => {
    const idx = placeholders.length;
    placeholders.push(html);
    return `\u0000PH${idx}\u0000`;
  };

  let s = String(text || '');

  // Protect inline code spans before escaping or emphasis parsing.
  s = s.replace(/`([^`]+)`/g, (_, code) => hold(`<code>${escapeHtml(code)}</code>`));

  // Images inline
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    const cleanSrc = safeHref(src);
    const dims = imageDimsMap.get(cleanSrc);
    const dimAttrs = dims ? ` width="${dims.width}" height="${dims.height}"` : '';
    return hold(`<img src="${escapeHtml(cleanSrc)}" alt="${escapeHtml(alt)}"${dimAttrs} decoding="async" />`);
  });

  // Links
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const cleanHref = safeHref(href);
    const external = /^https?:\/\//i.test(cleanHref) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return hold(`<a href="${escapeHtml(cleanHref)}"${external}>${escapeHtml(label)}</a>`);
  });

  s = escapeHtml(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');

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

    // Fenced code block
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

    // Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      out.push(`<h${level}>${formatInline(headingMatch[2].trim(), imageDimsMap)}</h${level}>`);
      i += 1;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      out.push('<hr />');
      i += 1;
      continue;
    }

    // Standalone image block
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

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote><p>${formatInline(quoteLines.join(' ').trim(), imageDimsMap)}</p></blockquote>`);
      continue;
    }

    // Pipe table
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

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i += 1;
      }
      out.push(`<ul>${items.map((it) => `<li>${formatInline(it, imageDimsMap)}</li>`).join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      out.push(`<ol>${items.map((it) => `<li>${formatInline(it, imageDimsMap)}</li>`).join('')}</ol>`);
      continue;
    }

    // Paragraph
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

function renderArticlePage(article, imageDimsMap) {
  const canonicalUrl = `${SITE_URL}/news/${article.slug}/`;
  const heroImage = Array.isArray(article.images) && article.images[0] ? article.images[0] : '/memoji.png';
  const absoluteImage = heroImage.startsWith('http') ? heroImage : `${SITE_URL}${heroImage}`;
  const formattedDate = formatDateId(article.date);
  const category = article.category || (article.source === 'ai' ? 'AI' : 'News');
  const labelClass = article.source === 'ai' ? 'news-label is-ai' : 'news-label';
  const bodyHtml = renderMarkdown(article.body, imageDimsMap);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.excerpt,
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
    ? `<a class="news-article-source" href="${escapeHtml(safeHref(article.url))}" target="_blank" rel="noopener noreferrer">Sumber: ${escapeHtml(hostOf(article.url))}</a>`
    : '';
  const aiNote =
    article.source === 'ai'
      ? '<p class="news-article-ai-note" data-i18n="news-ai-note">Konten ini dibuat dengan bantuan AI.</p>'
      : '';

  return `<!doctype html>
<html lang="id" data-theme="dark">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(article.title)} | News | Widi Firmansyah</title>

        <meta name="title" content="${escapeHtml(article.title)} | News | Widi Firmansyah" />
        <meta name="description" content="${escapeHtml(article.excerpt)}" />
        <meta name="author" content="Widi Firmansyah" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Widi Firmansyah Portfolio" />
        <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
        <meta property="og:title" content="${escapeHtml(article.title)}" />
        <meta property="og:description" content="${escapeHtml(article.excerpt)}" />
        <meta property="og:image" content="${escapeHtml(absoluteImage)}" />
        <meta property="article:published_time" content="${escapeHtml(article.date)}" />
        <meta property="article:section" content="${escapeHtml(category)}" />
        <meta property="og:locale" content="id_ID" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />
        <meta name="twitter:title" content="${escapeHtml(article.title)}" />
        <meta name="twitter:description" content="${escapeHtml(article.excerpt)}" />
        <meta name="twitter:image" content="${escapeHtml(absoluteImage)}" />

        <link rel="icon" type="image/png" href="../../favicon.png" />
        <link rel="apple-touch-icon" href="../../memoji.png" />

        <script type="application/ld+json">
${safeJsonLd(jsonLd)}
        </script>

        <meta name="color-scheme" content="dark light" />
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
        </script>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="stylesheet" href="../../style.css?v=5.0" />
        <link rel="stylesheet" href="../news.css?v=3.2" />
        <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Syncopate:wght@700&display=swap"
            rel="stylesheet"
        />
    </head>

    <body data-page="news">
        <div class="cursor-follower"></div>

        <canvas id="webgl"></canvas>

        <nav class="glass-panel">
            <a class="logo" href="../../">WDPORT</a>
            <ul class="nav-links">
                <li><a href="../../index.html#home" data-i18n="nav-home">Home</a></li>
                <li><a href="../../index.html#about" data-i18n="nav-about">About</a></li>
                <li><a href="../../index.html#works" data-i18n="nav-works">Works</a></li>
                <li><a href="../" class="is-current" aria-current="page" data-i18n="nav-news">News</a></li>
                <li><a href="../../index.html#contact" data-i18n="nav-contact">Contact</a></li>
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
                        <button class="lang-btn active" data-lang="id">ID</button>
                        <button class="lang-btn" data-lang="en">EN</button>
                        <button class="lang-btn" data-lang="zh">中</button>
                    </div>
                </li>
            </ul>
            <button type="button" class="hamburger" aria-label="Buka menu navigasi" aria-expanded="false">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
            </button>
        </nav>

        <main>
            <section class="news">
                <div class="container">
                    <a class="news-article-back" href="../">&larr; Semua Berita</a>

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
        <script src="../../translations.js"></script>
        <script src="../../script.js?v=4.9"></script>
    </body>
</html>
`;
}

function buildFeedPreRender(items) {
  const firstPage = items.slice(0, 25);
  if (!firstPage.length) {
    return '<p class="news-empty" data-i18n="news-empty">Belum ada berita yang dipublikasikan.</p>';
  }
  return firstPage
    .map((item) => {
      const labelClass = item.source === 'ai' ? 'news-label is-ai' : 'news-label';
      const category = item.category || (item.source === 'ai' ? 'AI' : 'News');
      return `<a class="news-entry" href="./${encodeURIComponent(item.slug)}/" aria-label="${escapeHtml(item.title)}"><div class="news-entry-head"><span class="${labelClass}">${escapeHtml(category)}</span><span class="news-date">${escapeHtml(formatDateId(item.date))}</span></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.excerpt)}</p></a>`;
    })
    .join('\n                        ');
}

function buildSitemap(items) {
  const latestDate = items[0]?.date || new Date().toISOString().slice(0, 10);
  const articleUrls = items
    .map(
      (item) => `  <url>
    <loc>${escapeXml(`${SITE_URL}/news/${item.slug}/`)}</loc>
    <lastmod>${escapeXml(item.date || latestDate)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
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
  <url>
    <loc>${SITE_URL}/news/</loc>
    <lastmod>${escapeXml(latestDate)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${articleUrls}
</urlset>
`;
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
    const matches = String(item.body || '').matchAll(/!\[[^\]]*\]\(([^)]+)\)/g);
    for (const m of matches) {
      const src = m[1].trim();
      if (!imageDimsMap.has(src)) {
        const dims = await readImageDimensions(src);
        if (dims) imageDimsMap.set(src, dims);
      }
    }
  }

  // Pre-populate /news/index.html feed with static article links for crawlers
  const newsIndexPath = path.join(OUT_DIR, 'news', 'index.html');
  let newsIndexHtml = await fs.readFile(newsIndexPath, 'utf8');
  newsIndexHtml = newsIndexHtml.replace(
    /<div id="news-feed" class="news-feed">[\s\S]*?<\/div>/,
    `<div id="news-feed" class="news-feed">\n                        ${buildFeedPreRender(items)}\n                    </div>`
  );
  await fs.writeFile(newsIndexPath, newsIndexHtml, 'utf8');

  // Generate /news/<slug>/index.html for each article
  for (const article of items) {
    const articleDir = path.join(OUT_DIR, 'news', article.slug);
    await fs.mkdir(articleDir, { recursive: true });
    await fs.writeFile(
      path.join(articleDir, 'index.html'),
      renderArticlePage(article, imageDimsMap),
      'utf8'
    );
  }

  // Generate sitemap.xml in _site/
  await fs.writeFile(path.join(OUT_DIR, 'sitemap.xml'), buildSitemap(items), 'utf8');

  console.log(
    `Built static site in _site/: ${items.length} article page(s), ${items.length + 2} sitemap URL(s).`
  );
}

main().catch((err) => {
  console.error('build-pages failed:', err);
  process.exit(1);
});
