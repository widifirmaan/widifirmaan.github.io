// /news renderer — sharded feed: loads active-locale manifest + latest chunk on demand.
(() => {
    'use strict';

    const feed = document.getElementById('news-feed');
    if (!feed) return;

    const updatedEl = document.getElementById('news-updated');
    const previewBadge = document.getElementById('news-preview-badge');
    const paginationEl = document.getElementById('news-pagination');

    const siteRoot = (document.body && document.body.dataset.siteRoot) || '../';
    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get('preview') === '1';

    const LEGACY_FEED_URL = siteRoot + 'news.json';
    const LEGACY_PAGE_SIZE = 25;

    const manifestCache = new Map();
    const chunkCache = new Map();
    const articleCache = new Map();

    let manifest = null;
    let legacyItems = [];
    let currentItems = [];
    let currentPage = 0;
    let totalPages = 0;
    let lastUpdatedRaw = '';
    let loadedOk = false;
    let activeSlug = '';
    let activeLoadSeq = 0;

    function currentLang() {
        const declared = document.documentElement.dataset.pageLang;
        try {
            const stored = localStorage.getItem('lang');
            if (stored && ['id', 'en', 'zh'].includes(stored)) return stored;
        } catch (e) {}
        if (declared && ['id', 'en', 'zh'].includes(declared)) return declared;
        const htmlLang = document.documentElement.lang;
        return ['id', 'en', 'zh'].includes(htmlLang) ? htmlLang : 'id';
    }

    function localePaths(lang) {
        return {
            manifestUrl: siteRoot + 'news/data/manifest.json',
            chunksBase: lang === 'id'
                ? siteRoot + 'news/data/chunks/'
                : siteRoot + 'news/data/i18n/' + lang + '/chunks/',
            articlesBase: siteRoot + 'news/data/articles/'
        };
    }

    function t(key) {
        if (typeof translations === 'undefined') return '';
        const dict = translations[currentLang()] || translations.id || {};
        return dict[key] || '';
    }

    function formatDate(value) {
        if (!value) return '';
        const date = new Date(value.length === 10 ? value + 'T00:00:00' : value);
        if (isNaN(date.getTime())) return value;
        const locales = { id: 'id-ID', en: 'en-US', zh: 'zh-CN' };
        try {
            return new Intl.DateTimeFormat(locales[currentLang()] || 'id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }).format(date);
        } catch (e) {
            return value;
        }
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function hostOf(value) {
        try {
            return new URL(value).host;
        } catch (e) {
            return value;
        }
    }

    function resolveLocalizedFields(item, lang) {
        const loc = lang && lang !== 'id' && item.locales && item.locales[lang] ? item.locales[lang] : null;
        return {
            title: (loc && loc.title) || item.title || item.slug || '',
            excerpt: (loc && loc.excerpt) || item.excerpt || '',
            body: typeof (loc && loc.body) === 'string' && loc.body
                ? loc.body
                : (typeof item.body === 'string' ? item.body : ''),
            lang: item.lang || (loc ? lang : 'id')
        };
    }

    function timestampOf(value) {
        const parsed = value ? Date.parse(String(value)) : NaN;
        return isNaN(parsed) ? 0 : parsed;
    }

    function compareNewsDesc(a, b) {
        const dateDiff = String(b.date || '').localeCompare(String(a.date || ''));
        if (dateDiff !== 0) return dateDiff;
        const timeDiff = timestampOf(b.publishedAt) - timestampOf(a.publishedAt);
        if (timeDiff !== 0) return timeDiff;
        return String(b.slug || '').localeCompare(String(a.slug || ''));
    }

    function normalizeEntry(item, index, lang) {
        const active = resolveLocalizedFields(item, lang || currentLang());
        return {
            id: item.id || item.slug || 'news-' + index,
            title: active.title,
            slug: item.slug || '',
            date: item.date || '',
            publishedAt: item.publishedAt || '',
            category: item.category || '',
            excerpt: active.excerpt,
            images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
            badges: Array.isArray(item.badges) ? item.badges.filter(Boolean) : [],
            body: active.body,
            locales: item.locales && typeof item.locales === 'object' ? item.locales : undefined,
            url: item.url || '',
            source: item.source || 'manual',
            model: item.model || '',
            lang: active.lang
        };
    }

    function buildReadme(item) {
        const lines = [];
        if (item.title) lines.push('# ' + item.title);

        const meta = [formatDate(item.date), item.category].filter(Boolean).join(' · ');
        if (meta) lines.push('> ' + meta);
        if (item.excerpt) lines.push(item.excerpt);
        if (item.body) lines.push(item.body);

        if (item.url) {
            lines.push('[' + hostOf(item.url) + '](' + item.url + ')');
        }
        if (item.source === 'ai') {
            const note = t('news-ai-note');
            if (note) lines.push('_' + note + '_');
        }
        return lines.join('\n\n');
    }

    function buildFallback(item, meta) {
        return (
            '<h2>' + escapeHtml(item.title) + '</h2>' +
            '<p>' + escapeHtml(meta) + '</p>' +
            '<p>' + escapeHtml(item.excerpt) + '</p>'
        );
    }

    function labelFor(item) {
        if (item.category) return item.category;
        return item.source === 'ai' ? 'AI' : 'News';
    }

    function applyModalImageDimensions() {
        const container = document.getElementById('modal-description');
        if (!container) return;
        container.querySelectorAll('img').forEach((img) => {
            const src = img.getAttribute('src') || '';
            if (!src.includes('/news/assets/')) return;
            const syncNatural = () => {
                if (img.naturalWidth && img.naturalHeight) {
                    img.setAttribute('width', String(img.naturalWidth));
                    img.setAttribute('height', String(img.naturalHeight));
                }
            };
            if (img.complete && img.naturalWidth) {
                syncNatural();
            } else {
                if (!img.getAttribute('width')) {
                    img.setAttribute('width', '1200');
                    img.setAttribute('height', '630');
                }
                img.addEventListener('load', syncNatural, { once: true });
            }
        });
    }

    function renderModalArticle(item) {
        const meta = [formatDate(item.date), item.category].filter(Boolean).join(' · ');
        if (typeof openModal !== 'function') return;
        openModal({
            title: item.title || item.slug,
            subtitle: meta,
            desc: buildFallback(item, meta),
            image: (Array.isArray(item.images) && item.images[0]) || '',
            readme: buildReadme(item)
        });
        applyModalImageDimensions();
    }

    function updateOpenModalBody(item) {
        const container = document.getElementById('modal-description');
        if (!container || typeof marked === 'undefined') return;
        const htmlContent = marked.parse(buildReadme(item));
        container.innerHTML = '<div class="modal-actions" style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2.5rem; padding-top: 1rem;"></div><div class="markdown-body">' + htmlContent + '</div>';
        applyModalImageDimensions();
    }

    async function handleOpenArticle(item) {
        const slug = item.slug;
        const lang = currentLang();
        const cacheKey = lang + ':' + slug;
        activeSlug = slug;

        if (item.body) {
            renderModalArticle(item);
            return;
        }

        if (slug && articleCache.has(cacheKey)) {
            renderModalArticle(articleCache.get(cacheKey));
            return;
        }

        renderModalArticle({
            ...item,
            body: '_' + (t('news-loading') || 'Memuat berita...') + '_'
        });

        try {
            const paths = localePaths(lang);
            const response = await fetch(paths.articlesBase + encodeURIComponent(slug) + '.json');
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const raw = await response.json();
            const fullItem = normalizeEntry(raw, 0, lang);
            articleCache.set(cacheKey, fullItem);
            if (activeSlug === slug) {
                updateOpenModalBody(fullItem);
            }
        } catch (err) {
            if (activeSlug === slug) {
                updateOpenModalBody({
                    ...item,
                    body: '_' + (t('news-error') || 'Gagal memuat berita.') + '_'
                });
            }
        }
    }

    function articleHref(item, lang) {
        const slug = encodeURIComponent(item.slug);
        if (lang !== 'id' && item.lang === lang) {
            return siteRoot + lang + '/news/' + slug + '/';
        }
        return siteRoot + 'news/' + slug + '/';
    }

    function createEntry(item) {
        const lang = currentLang();
        const title = item.title || item.slug;

        const entry = document.createElement(previewMode ? 'button' : 'a');
        entry.className = 'news-entry';
        if (previewMode) {
            entry.type = 'button';
            entry.dataset.lazy = '1';
        } else {
            entry.href = articleHref(item, lang);
        }
        entry.setAttribute('aria-label', title);

        const head = document.createElement('div');
        head.className = 'news-entry-head';

        const label = document.createElement('span');
        label.className = 'news-label' + (item.source === 'ai' ? ' is-ai' : '');
        label.textContent = labelFor(item);
        head.appendChild(label);

        if (item.date) {
            const date = document.createElement('span');
            date.className = 'news-date';
            date.textContent = formatDate(item.date);
            head.appendChild(date);
        }

        const heading = document.createElement('h3');
        heading.textContent = title;

        const excerpt = document.createElement('p');
        excerpt.textContent = item.excerpt || '';

        entry.append(head, heading, excerpt);
        if (previewMode) {
            entry.addEventListener('click', () => handleOpenArticle(item));
        }
        return entry;
    }

    function render() {
        feed.innerHTML = '';

        if (currentItems.length === 0) {
            const message = document.createElement('p');
            message.className = 'news-empty';
            message.textContent = loadedOk
                ? t('news-empty') || 'No news has been published yet.'
                : t('news-error') || 'Failed to load news.';
            feed.appendChild(message);
            return;
        }

        currentItems.forEach((item) => feed.appendChild(createEntry(item)));
    }

    function renderPagination() {
        if (!paginationEl) return;
        paginationEl.innerHTML = '';

        if (!loadedOk || totalPages <= 1) {
            paginationEl.hidden = true;
            return;
        }

        paginationEl.hidden = false;

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'news-page-btn';
        prevBtn.textContent = t('news-prev') || 'Sebelumnya';
        prevBtn.disabled = currentPage <= 0;
        prevBtn.addEventListener('click', () => goToPage(currentPage - 1));

        const status = document.createElement('span');
        status.className = 'news-page-status';
        const pageLabel = t('news-page') || 'Halaman';
        status.textContent = pageLabel + ' ' + (currentPage + 1) + ' / ' + totalPages;

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'news-page-btn';
        nextBtn.textContent = t('news-next') || 'Berikutnya';
        nextBtn.disabled = currentPage >= totalPages - 1;
        nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

        paginationEl.append(prevBtn, status, nextBtn);
    }

    function updateStatus() {
        if (!updatedEl) return;
        if (!loadedOk) {
            updatedEl.textContent = t('news-error') || 'Failed to load news.';
            return;
        }
        if (!lastUpdatedRaw) {
            updatedEl.textContent = '';
            return;
        }
        const label = t('news-updated') || 'Last updated';
        updatedEl.textContent = label + ': ' + formatDate(lastUpdatedRaw.slice(0, 10));
    }

    async function fetchChunk(chunkIndex, lang) {
        const entry = manifest.chunks[chunkIndex];
        if (!entry || !entry.file) return [];
        const key = lang + ':' + entry.file;
        if (chunkCache.has(key)) return chunkCache.get(key);

        const paths = localePaths(lang);
        const isLatest = entry.file === manifest.latestChunk || chunkIndex === 0;
        const response = await fetch(
            paths.chunksBase + encodeURIComponent(entry.file),
            isLatest ? { cache: 'no-cache' } : undefined
        );
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        const list = Array.isArray(data.items) ? data.items : [];
        const normalized = list
            .filter((item) => item && (item.title || item.slug))
            .map((item, idx) => normalizeEntry(item, idx, lang))
            .sort(compareNewsDesc);
        chunkCache.set(key, normalized);
        return normalized;
    }

    async function fetchPageItems(pageIndex, lang) {
        const pageSize = Number(manifest.pageSize) || LEGACY_PAGE_SIZE;
        const pageStart = pageIndex * pageSize;
        const pageEnd = pageStart + pageSize;
        const collected = [];
        let cursor = 0;

        for (let i = 0; i < manifest.chunks.length; i += 1) {
            const count = Number(manifest.chunks[i].count) || 0;
            const chunkStart = cursor;
            const chunkEnd = cursor + count;
            cursor = chunkEnd;

            if (chunkEnd <= pageStart) continue;
            if (chunkStart >= pageEnd) break;

            const chunkItems = await fetchChunk(i, lang);
            const sliceFrom = Math.max(0, pageStart - chunkStart);
            const sliceTo = Math.min(chunkItems.length, pageEnd - chunkStart);
            collected.push(...chunkItems.slice(sliceFrom, sliceTo));
        }

        return collected;
    }

    async function goToPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= totalPages) return;
        currentPage = pageIndex;
        const lang = currentLang();

        if (manifest && Array.isArray(manifest.chunks)) {
            try {
                currentItems = await fetchPageItems(pageIndex, lang);
                loadedOk = true;
            } catch (e) {
                currentItems = [];
                loadedOk = false;
            }
        } else {
            const start = pageIndex * LEGACY_PAGE_SIZE;
            currentItems = legacyItems.slice(start, start + LEGACY_PAGE_SIZE).map((item, idx) =>
                normalizeEntry(item, idx, lang)
            );
        }

        render();
        renderPagination();
        updateStatus();
    }

    async function loadLocale(targetPage) {
        const seq = ++activeLoadSeq;
        const lang = currentLang();
        const page = Number.isInteger(targetPage) ? targetPage : currentPage;

        if (previewMode) {
            try {
                const cached = localStorage.getItem('news_preview');
                if (cached) {
                    const data = JSON.parse(cached);
                    const list = Array.isArray(data)
                        ? data
                        : data && Array.isArray(data.items)
                          ? data.items
                          : [];
                    legacyItems = list
                        .filter((item) => item && (item.title || item.slug))
                        .sort(compareNewsDesc);
                    lastUpdatedRaw = data && data.lastUpdated ? data.lastUpdated : '';
                    loadedOk = true;
                    totalPages = Math.max(1, Math.ceil(legacyItems.length / LEGACY_PAGE_SIZE));
                    if (previewBadge) previewBadge.hidden = false;
                    await goToPage(Math.min(page, totalPages - 1));
                    return;
                }
            } catch (e) {}
        }

        if (previewBadge) previewBadge.hidden = true;

        try {
            let parsed = manifestCache.get('shared');
            if (!parsed) {
                const paths = localePaths(lang);
                const response = await fetch(paths.manifestUrl, { cache: 'no-cache' });
                if (response.ok) {
                    const json = await response.json();
                    if (json && Array.isArray(json.chunks)) {
                        parsed = json;
                        manifestCache.set('shared', parsed);
                    }
                }
            }

            if (seq !== activeLoadSeq) return;

            if (parsed) {
                manifest = parsed;
                lastUpdatedRaw = parsed.lastUpdated || '';
                const pageSize = Number(parsed.pageSize) || LEGACY_PAGE_SIZE;
                const totalCount = Number.isFinite(Number(parsed.total))
                    ? Number(parsed.total)
                    : parsed.chunks.reduce((sum, ch) => sum + (Number(ch.count) || 0), 0);
                totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
                if (totalPages === 0) {
                    loadedOk = true;
                    currentItems = [];
                    render();
                    renderPagination();
                    updateStatus();
                    return;
                }
                await goToPage(Math.min(page, totalPages - 1));
                return;
            }
        } catch (e) {}

        // Fallback to default i18n root or news.json if localized manifest is unavailable
        try {
            const response = await fetch(LEGACY_FEED_URL, { cache: 'no-cache' });
            if (seq !== activeLoadSeq) return;
            if (response.ok) {
                const data = await response.json();
                const list = Array.isArray(data)
                    ? data
                    : data && Array.isArray(data.items)
                      ? data.items
                      : [];
                legacyItems = list
                    .filter((item) => item && (item.title || item.slug))
                    .sort(compareNewsDesc);
                lastUpdatedRaw = data && data.lastUpdated ? data.lastUpdated : '';
                loadedOk = true;
                manifest = null;
                totalPages = Math.max(1, Math.ceil(legacyItems.length / LEGACY_PAGE_SIZE));
                await goToPage(Math.min(page, totalPages - 1));
                return;
            }
        } catch (e) {}

        if (seq !== activeLoadSeq) return;
        loadedOk = false;
        currentItems = [];
        render();
        renderPagination();
        updateStatus();
    }

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.lang-btn')) return;
        setTimeout(() => {
            loadLocale(currentPage);
        }, 0);
    });

    loadLocale(0);
})();
