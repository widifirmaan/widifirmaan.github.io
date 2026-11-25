// /news renderer — single-card feed; each article is a labeled row that opens the shared modal.
(() => {
    'use strict';

    const feed = document.getElementById('news-feed');
    if (!feed) return;

    const updatedEl = document.getElementById('news-updated');
    const previewBadge = document.getElementById('news-preview-badge');

    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get('preview') === '1';

    let items = [];
    let lastUpdatedRaw = '';
    let loadedOk = false;

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

    function createEntry(item) {
        const title = item.title || item.slug;
        const meta = [formatDate(item.date), item.category].filter(Boolean).join(' · ');

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'news-entry';
        button.setAttribute('aria-label', title);
        button.dataset.title = title;
        button.dataset.subtitle = meta;
        button.dataset.image = (Array.isArray(item.images) && item.images[0]) || '';
        button.dataset.readme = buildReadme(item);
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
        return button;
    }

    function render() {
        feed.innerHTML = '';

        if (items.length === 0) {
            const message = document.createElement('p');
            message.className = 'news-empty';
            message.textContent = loadedOk
                ? t('news-empty') || 'No news has been published yet.'
                : t('news-error') || 'Failed to load news.';
            feed.appendChild(message);
            return;
        }

        items.forEach((item) => feed.appendChild(createEntry(item)));
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

    async function load() {
        let data = null;

        if (previewMode) {
            try {
                const cached = localStorage.getItem('news_preview');
                if (cached) data = JSON.parse(cached);
            } catch (e) {}
        }

        if (!data) {
            try {
                const response = await fetch('../news.json?v=' + Date.now(), {
                    cache: 'no-store'
                });
                if (response.ok) data = await response.json();
            } catch (e) {}
        }

        loadedOk = Boolean(data);

        const list = Array.isArray(data)
            ? data
            : data && Array.isArray(data.items)
              ? data.items
              : [];

        items = list
            .filter((item) => item && (item.title || item.slug))
            .map((item, index) => ({
                id: item.id || item.slug || 'news-' + index,
                title: item.title || item.slug || '',
                slug: item.slug || '',
                date: item.date || '',
                category: item.category || '',
                excerpt: item.excerpt || '',
                images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
                badges: Array.isArray(item.badges) ? item.badges.filter(Boolean) : [],
                body: item.body || '',
                url: item.url || '',
                source: item.source || 'manual'
            }))
            .sort((a, b) => String(b.date).localeCompare(String(a.date)));

        lastUpdatedRaw = data && data.lastUpdated ? data.lastUpdated : '';
        if (previewBadge) previewBadge.hidden = !(previewMode && data);

        render();
        updateStatus();
    }

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.lang-btn')) return;
        setTimeout(() => {
            render();
            updateStatus();
        }, 0);
    });

    load();
})();
