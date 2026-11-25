// /news renderer — sharded feed: loads manifest + highest chunk first, lazy-loads article body on demand.
(() => {
    'use strict';

    const feed = document.getElementById('news-feed');
    if (!feed) return;

    const updatedEl = document.getElementById('news-updated');
    const previewBadge = document.getElementById('news-preview-badge');
    const paginationEl = document.getElementById('news-pagination');

    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get('preview') === '1';

    const MANIFEST_URL = '../news/data/manifest.json';
    const CHUNKS_BASE = '../news/data/chunks/';
    const ARTICLES_BASE = '../news/data/articles/';
    const LEGACY_FEED_URL = '../news.json';
    const LEGACY_PAGE_SIZE = 25;

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

    function currentLang() {
        try {
            return localStorage.getItem('lang') || document.documentElement.lang || 'id';
        } catch (e) {
            return 'id';
        }
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

    function normalizeEntry(item, index) {
        return {
            id: item.id || item.slug || 'news-' + index,
            title: item.title || item.slug || '',
            slug: item.slug || '',
            date: item.date || '',
            category: item.category || '',
            excerpt: item.excerpt || '',
            images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
            badges: Array.isArray(item.badges) ? item.badges.filter(Boolean) : [],
            body: typeof item.body === 'string' ? item.body : '',
            url: item.url || '',
            source: item.source || 'manual',
            model: item.model || ''
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
        activeSlug = slug;

        if (item.body) {
            renderModalArticle(item);
            return;
        }

        if (slug && articleCache.has(slug)) {
            renderModalArticle(articleCache.get(slug));
            return;
        }

        renderModalArticle({
            ...item,
            body: '_' + (t('news-loading') || 'Memuat berita...') + '_'
        });

        try {
            const response = await fetch(ARTICLES_BASE + encodeURIComponent(slug) + '.json');
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const raw = await response.json();
            const fullItem = normalizeEntry(raw, 0);
            articleCache.set(slug, fullItem);
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

    function createEntry(item) {
        const title = item.title || item.slug;
        const meta = [formatDate(item.date), item.category].filter(Boolean).join(' · ');

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'news-entry';
        button.dataset.lazy = '1';
        button.setAttribute('aria-label', title);
        button.dataset.title = title;
        button.dataset.subtitle = meta;
        button.dataset.image = (Array.isArray(item.images) && item.images[0]) || '';
        button.dataset.desc = buildFallback(item, meta);

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

        button.append(head, heading, excerpt);
        button.addEventListener('click', () => handleOpenArticle(item));
        return button;
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

    async function fetchChunk(chunkIndex) {
        const entry = manifest.chunks[chunkIndex];
        if (!entry || !entry.file) return [];
        if (chunkCache.has(entry.file)) return chunkCache.get(entry.file);

        const isLatest = entry.file === manifest.latestChunk || chunkIndex === 0;
        const response = await fetch(
            CHUNKS_BASE + encodeURIComponent(entry.file),
            isLatest ? { cache: 'no-cache' } : undefined
        );
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        const list = Array.isArray(data.items) ? data.items : [];
        const normalized = list
            .filter((item) => item && (item.title || item.slug))
            .map(normalizeEntry)
            .sort((a, b) => String(b.date).localeCompare(String(a.date)));
        chunkCache.set(entry.file, normalized);
        return normalized;
    }

    async function goToPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= totalPages) return;
        currentPage = pageIndex;

        if (manifest && Array.isArray(manifest.chunks)) {
            try {
                currentItems = await fetchChunk(pageIndex);
                loadedOk = true;
            } catch (e) {
                currentItems = [];
                loadedOk = false;
            }
        } else {
            const start = pageIndex * LEGACY_PAGE_SIZE;
            currentItems = legacyItems.slice(start, start + LEGACY_PAGE_SIZE);
        }

        render();
        renderPagination();
        updateStatus();
    }

    async function load() {
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
                        .map(normalizeEntry)
                        .sort((a, b) => String(b.date).localeCompare(String(a.date)));
                    lastUpdatedRaw = data && data.lastUpdated ? data.lastUpdated : '';
                    loadedOk = true;
                    totalPages = Math.max(1, Math.ceil(legacyItems.length / LEGACY_PAGE_SIZE));
                    if (previewBadge) previewBadge.hidden = false;
                    await goToPage(0);
                    return;
                }
            } catch (e) {}
        }

        if (previewBadge) previewBadge.hidden = true;

        try {
            const response = await fetch(MANIFEST_URL, { cache: 'no-cache' });
            if (response.ok) {
                const parsed = await response.json();
                if (parsed && Array.isArray(parsed.chunks)) {
                    manifest = parsed;
                    lastUpdatedRaw = parsed.lastUpdated || '';
                    totalPages = parsed.chunks.length;
                    if (totalPages === 0) {
                        loadedOk = true;
                        currentItems = [];
                        render();
                        renderPagination();
                        updateStatus();
                        return;
                    }
                    await goToPage(0);
                    return;
                }
            }
        } catch (e) {}

        // Fallback to single news.json if manifest is unavailable
        try {
            const response = await fetch(LEGACY_FEED_URL, { cache: 'no-cache' });
            if (response.ok) {
                const data = await response.json();
                const list = Array.isArray(data)
                    ? data
                    : data && Array.isArray(data.items)
                      ? data.items
                      : [];
                legacyItems = list
                    .filter((item) => item && (item.title || item.slug))
                    .map(normalizeEntry)
                    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
                lastUpdatedRaw = data && data.lastUpdated ? data.lastUpdated : '';
                loadedOk = true;
                totalPages = Math.max(1, Math.ceil(legacyItems.length / LEGACY_PAGE_SIZE));
                await goToPage(0);
                return;
            }
        } catch (e) {}

        loadedOk = false;
        currentItems = [];
        render();
        renderPagination();
        updateStatus();
    }

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.lang-btn')) return;
        setTimeout(() => {
            render();
            renderPagination();
            updateStatus();
        }, 0);
    });

    load();
})();
