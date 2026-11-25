// /news renderer — 12 items per page using the same card markup as the showcase.
(() => {
    'use strict';

    const PAGE_SIZE = 12;
    const grid = document.getElementById('news-grid');
    if (!grid) return;

    const paginationEl = document.getElementById('news-pagination');
    const updatedEl = document.getElementById('news-updated');
    const previewBadge = document.getElementById('news-preview-badge');

    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get('preview') === '1';

    let items = [];
    let currentPage = toPage(params.get('page'));
    let lastUpdatedRaw = '';
    let loadedOk = false;
    let cardTweens = [];
    let refreshTimer = 0;

    function toPage(value) {
        const page = parseInt(value, 10);
        return Number.isFinite(page) && page > 0 ? page : 1;
    }

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

    // Markdown shown inside the shared modal (parsed with Marked by script.js).
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

    function createCard(item) {
        const title = item.title || item.slug;
        const meta = [formatDate(item.date), item.category].filter(Boolean).join(' · ');
        const images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
        const badges = Array.isArray(item.badges) ? item.badges.filter(Boolean) : [];

        const card = document.createElement('article');
        card.className = 'project-card glass-panel news-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', title);
        card.dataset.title = title;
        card.dataset.subtitle = meta;
        card.dataset.image = images[0] || '';
        card.dataset.readme = buildReadme(item);
        card.dataset.desc = buildFallback(item, meta);

        const imageWrap = document.createElement('div');
        if (images.length > 0) {
            imageWrap.className = 'project-image' + (images.length > 1 ? ' grid-2' : '');
            images.slice(0, 2).forEach((src, index) => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = index === 0 ? title : '';
                img.loading = 'lazy';
                img.decoding = 'async';
                img.addEventListener('load', scheduleRefresh);
                imageWrap.appendChild(img);
            });
        } else {
            imageWrap.className = 'project-image news-placeholder';
            const label = document.createElement('span');
            label.textContent = 'NEWS';
            imageWrap.appendChild(label);
        }

        const info = document.createElement('div');
        info.className = 'project-info';

        if (meta) {
            const metaEl = document.createElement('div');
            metaEl.className = 'news-meta';
            metaEl.textContent = meta;
            info.appendChild(metaEl);
        }

        const heading = document.createElement('h3');
        heading.textContent = title;
        info.appendChild(heading);

        const badgeWrap = document.createElement('div');
        badgeWrap.className = 'card-badges';
        badges.slice(0, 5).forEach((src) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = '';
            img.loading = 'lazy';
            badgeWrap.appendChild(img);
        });
        if (badges.length === 0 && item.category) {
            const category = document.createElement('p');
            category.textContent = item.category;
            badgeWrap.appendChild(category);
        }
        if (badgeWrap.childElementCount > 0) info.appendChild(badgeWrap);

        card.appendChild(imageWrap);
        card.appendChild(info);

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                card.click();
            }
        });

        return card;
    }

    function scheduleRefresh() {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => {
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }, 150);
    }

    function reveal(card) {
        if (typeof gsap === 'undefined') {
            card.style.opacity = '1';
            card.style.transform = 'none';
            return;
        }
        const tween = gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 90%'
            },
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay: 0.05,
            ease: 'power3.out'
        });
        cardTweens.push(tween);
    }

    function clearCardTweens() {
        cardTweens.forEach((tween) => {
            if (tween.scrollTrigger) tween.scrollTrigger.kill();
            tween.kill();
        });
        cardTweens = [];
    }

    function pageSequence(current, total) {
        const pages = [];
        if (total <= 7) {
            for (let page = 1; page <= total; page += 1) pages.push(page);
            return pages;
        }
        pages.push(1);
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        if (start > 2) pages.push('…');
        for (let page = start; page <= end; page += 1) pages.push(page);
        if (end < total - 1) pages.push('…');
        pages.push(total);
        return pages;
    }

    function createPageButton(label, page, options) {
        const settings = options || {};
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'page-btn';
        button.textContent = label;

        if (settings.active) {
            button.classList.add('is-active');
            button.setAttribute('aria-current', 'page');
        }
        if (settings.disabled) button.disabled = true;
        if (settings.ariaLabel) button.setAttribute('aria-label', settings.ariaLabel);

        if (!settings.disabled) {
            button.addEventListener('click', () => {
                if (page !== currentPage) goToPage(page);
            });
        }
        return button;
    }

    function renderPagination(totalPages) {
        if (!paginationEl) return;
        paginationEl.innerHTML = '';

        if (totalPages <= 1) {
            paginationEl.hidden = true;
            return;
        }

        paginationEl.hidden = false;
        paginationEl.appendChild(
            createPageButton(t('news-prev') || 'Previous', currentPage - 1, {
                disabled: currentPage === 1,
                ariaLabel: t('news-prev') || 'Previous'
            })
        );

        pageSequence(currentPage, totalPages).forEach((page) => {
            if (page === '…') {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '…';
                paginationEl.appendChild(ellipsis);
                return;
            }
            paginationEl.appendChild(
                createPageButton(String(page), page, {
                    active: page === currentPage,
                    ariaLabel: (t('news-page') || 'Page') + ' ' + page
                })
            );
        });

        paginationEl.appendChild(
            createPageButton(t('news-next') || 'Next', currentPage + 1, {
                disabled: currentPage === totalPages,
                ariaLabel: t('news-next') || 'Next'
            })
        );
    }

    function render() {
        const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
        currentPage = Math.min(Math.max(1, currentPage), totalPages);

        clearCardTweens();
        grid.innerHTML = '';

        if (items.length === 0) {
            const message = document.createElement('p');
            message.className = 'news-empty';
            message.textContent = loadedOk
                ? t('news-empty') || 'No news has been published yet.'
                : t('news-error') || 'Failed to load news.';
            grid.appendChild(message);
            renderPagination(0);
            return;
        }

        const start = (currentPage - 1) * PAGE_SIZE;
        items.slice(start, start + PAGE_SIZE).forEach((item) => {
            const card = createCard(item);
            grid.appendChild(card);
            reveal(card);
        });

        renderPagination(totalPages);
        scheduleRefresh();
    }

    function syncUrlAfterLoad() {
        const url = new URL(window.location.href);
        const urlPage = url.searchParams.get('page');
        if (currentPage > 1 && urlPage !== String(currentPage)) {
            url.searchParams.set('page', String(currentPage));
        } else if (currentPage === 1 && urlPage) {
            url.searchParams.delete('page');
        } else {
            return;
        }
        try {
            window.history.replaceState({ page: currentPage }, '', url);
        } catch (e) {}
    }

    function goToPage(page) {
        currentPage = page;
        render();

        const url = new URL(window.location.href);
        if (page > 1) url.searchParams.set('page', String(page));
        else url.searchParams.delete('page');
        try {
            window.history.pushState({ page }, '', url);
        } catch (e) {}

        const section = document.getElementById('news');
        if (typeof lenis !== 'undefined' && lenis.scrollTo) {
            lenis.scrollTo(section || 0, { offset: -30, duration: 1.1 });
        } else if (section) {
            window.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
        }
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
        syncUrlAfterLoad();
        updateStatus();
    }

    window.addEventListener('popstate', () => {
        currentPage = toPage(new URLSearchParams(window.location.search).get('page'));
        render();
    });

    // UI language changes re-render dates, pagination labels, and empty state.
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.lang-btn')) return;
        setTimeout(() => {
            render();
            updateStatus();
        }, 0);
    });

    load();
})();
