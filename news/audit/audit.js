// /news/audit — local-first CMS: edit drafts, audit content, publish news.json,
// and trigger AI generation through the update-news GitHub Actions workflow.
(() => {
    'use strict';

    const STORAGE = {
        draft: 'news_cms_draft',
        log: 'news_cms_log',
        preview: 'news_preview',
        token: 'news_cms_token',
        settings: 'news_cms_settings'
    };
    const LOCAL_FEED = '../../news.json';
    const WORKFLOW_FILE = 'update-news.yml';
    const POLL_INTERVAL = 5000;
    const POLL_LIMIT = 60;
    const MAX_ITEMS = 120;

    const $ = (id) => document.getElementById(id);
    const els = {
        search: $('search'),
        filterStatus: $('filter-status'),
        itemList: $('item-list'),
        draftNote: $('draft-note'),
        btnNew: $('btn-new'),
        btnReset: $('btn-reset'),
        editorEmpty: $('editor-empty'),
        editorForm: $('editor-form'),
        editorStatus: $('editor-status'),
        editorMeta: $('editor-meta'),
        fTitle: $('f-title'),
        fSlug: $('f-slug'),
        fDate: $('f-date'),
        fCategory: $('f-category'),
        fExcerpt: $('f-excerpt'),
        fImages: $('f-images'),
        fBadges: $('f-badges'),
        fUrl: $('f-url'),
        fBody: $('f-body'),
        excerptCount: $('excerpt-count'),
        btnPreview: $('btn-preview'),
        btnDuplicate: $('btn-duplicate'),
        btnDelete: $('btn-delete'),
        btnSave: $('btn-save'),
        statTotal: $('stat-total'),
        statErrors: $('stat-errors'),
        statWarnings: $('stat-warnings'),
        auditSummary: $('audit-summary'),
        auditIssues: $('audit-issues'),
        auditLog: $('audit-log'),
        btnClearLog: $('btn-clear-log'),
        ghOwner: $('gh-owner'),
        ghRepo: $('gh-repo'),
        ghBranch: $('gh-branch'),
        ghPath: $('gh-path'),
        ghToken: $('gh-token'),
        btnVerify: $('btn-verify'),
        btnForget: $('btn-forget'),
        btnPublish: $('btn-publish'),
        publishStatus: $('publish-status'),
        aiTopic: $('ai-topic'),
        aiCategory: $('ai-category'),
        aiCount: $('ai-count'),
        aiLanguage: $('ai-language'),
        btnGenerate: $('btn-generate'),
        aiStatus: $('ai-status'),
        btnExport: $('btn-export'),
        btnImport: $('btn-import'),
        importFile: $('import-file'),
        btnPreviewSite: $('btn-preview-site'),
        btnReload: $('btn-reload'),
        dataStatus: $('data-status')
    };

    let published = [];
    let working = [];
    let selectedId = null;
    let currentPublishedStamp = '';
    let draftBaseStamp = '';
    let slugAuto = false;
    let saveTimer = 0;
    let pollTimer = 0;

    const deepCopy = (value) => JSON.parse(JSON.stringify(value));

    function todayISO() {
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 10);
    }

    function uid() {
        return 'news-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
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

    function t(key) {
        let lang = 'id';
        try {
            lang = localStorage.getItem('lang') || 'id';
        } catch (e) {}
        if (typeof translations === 'undefined') return '';
        const dict = translations[lang] || translations.id || {};
        return dict[key] || '';
    }

    function formatDateTime(value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) return value;
        try {
            return new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'short',
                timeStyle: 'medium'
            }).format(date);
        } catch (e) {
            return value;
        }
    }

    function normalizeItem(raw) {
        const item = raw && typeof raw === 'object' ? raw : {};
        const title = typeof item.title === 'string' ? item.title.trim() : '';
        const slug = typeof item.slug === 'string' && item.slug.trim()
            ? item.slug.trim()
            : slugify(title);

        return {
            // Derive the id from the slug when missing so reloading a feed
            // without ids does not mark every published item as new.
            id:
                typeof item.id === 'string' && item.id
                    ? item.id
                    : slug
                      ? 'news-' + slug
                      : uid(),
            title,
            slug,
            date: typeof item.date === 'string' && item.date ? item.date : todayISO(),
            category: typeof item.category === 'string' ? item.category.trim() : '',
            excerpt: typeof item.excerpt === 'string' ? item.excerpt.trim() : '',
            images: Array.isArray(item.images)
                ? item.images.filter((value) => typeof value === 'string' && value.trim()).map((value) => value.trim())
                : [],
            badges: Array.isArray(item.badges)
                ? item.badges.filter((value) => typeof value === 'string' && value.trim()).map((value) => value.trim())
                : [],
            body: typeof item.body === 'string' ? item.body : '',
            url: typeof item.url === 'string' ? item.url.trim() : '',
            source: typeof item.source === 'string' ? item.source : '',
            model: typeof item.model === 'string' ? item.model : ''
        };
    }

    function ensureIds(list) {
        const seen = new Set();
        return list.map((item) => {
            let id = item.id;
            while (!id || seen.has(id)) id = uid();
            seen.add(id);
            item.id = id;
            return item;
        });
    }

    function isHttpUrl(value) {
        try {
            const url = new URL(value);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (e) {
            return false;
        }
    }

    function linesOf(value) {
        return String(value || '')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /* ----------------------------- audit log ----------------------------- */

    function readLog() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE.log) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function writeLog(entries) {
        try {
            localStorage.setItem(STORAGE.log, JSON.stringify(entries.slice(0, 200)));
        } catch (e) {}
        renderLog();
    }

    function logEvent(action, detail) {
        const entries = readLog();
        entries.unshift({ at: new Date().toISOString(), action, detail });
        writeLog(entries);
    }

    function renderLog() {
        if (!els.auditLog) return;
        const entries = readLog();
        els.auditLog.innerHTML = '';

        if (entries.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'hint';
            empty.textContent = 'Belum ada aktivitas.';
            els.auditLog.appendChild(empty);
            return;
        }

        entries.slice(0, 60).forEach((entry) => {
            const row = document.createElement('li');
            const time = document.createElement('time');
            time.dateTime = entry.at;
            time.textContent = formatDateTime(entry.at);
            const action = document.createElement('span');
            action.className = 'log-action';
            action.textContent = entry.action;
            const detail = document.createElement('span');
            detail.className = 'log-detail';
            detail.textContent = entry.detail || '';
            row.append(time, action, detail);
            els.auditLog.appendChild(row);
        });
    }

    /* ------------------------------ draft I/O ---------------------------- */

    function saveWorking(logIt) {
        try {
            localStorage.setItem(
                STORAGE.draft,
                JSON.stringify({
                    savedAt: new Date().toISOString(),
                    base: draftBaseStamp,
                    items: working
                })
            );
        } catch (e) {}

        els.draftNote.textContent = 'Draft lokal · ' + formatDateTime(new Date().toISOString());
        if (logIt) logEvent('save', working.length + ' item disimpan sebagai draft');
    }

    function scheduleAutosave() {
        els.editorStatus.textContent = 'Menyimpan...';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            saveWorking(false);
            els.editorStatus.textContent = 'Tersimpan lokal';
            els.draftNote.textContent = 'Draft lokal · ' + formatDateTime(new Date().toISOString());
        }, 600);
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem(STORAGE.draft);
            if (!raw) return false;
            const parsed = JSON.parse(raw);
            const list = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.items) ? parsed.items : null;
            if (!list) return false;
            draftBaseStamp = !Array.isArray(parsed) && parsed.base ? parsed.base : '';
            working = ensureIds(list.map(normalizeItem));
            return true;
        } catch (e) {
            return false;
        }
    }

    function hasLocalChanges() {
        return JSON.stringify(working) !== JSON.stringify(published);
    }

    /* ---------------------------- published feed ------------------------- */

    async function fetchFeed() {
        const settings = getSettings();
        const rawUrl =
            'https://raw.githubusercontent.com/' +
            encodeURIComponent(settings.owner) +
            '/' +
            encodeURIComponent(settings.repo) +
            '/' +
            encodeURIComponent(settings.branch) +
            '/' +
            settings.path.split('/').map(encodeURIComponent).join('/') +
            '?v=' +
            Date.now();

        try {
            const response = await fetch(rawUrl, { cache: 'no-store' });
            if (response.ok) {
                return { data: await response.json(), source: 'GitHub' };
            }
        } catch (e) {}

        try {
            const response = await fetch(LOCAL_FEED + '?v=' + Date.now(), { cache: 'no-store' });
            if (response.ok) {
                return { data: await response.json(), source: 'situs' };
            }
        } catch (e) {}

        return null;
    }

    async function loadPublished() {
        const result = await fetchFeed();
        if (!result) return false;
        const data = result.data;
        const list = Array.isArray(data) ? data : data && Array.isArray(data.items) ? data.items : [];
        published = ensureIds(list.map(normalizeItem));
        currentPublishedStamp = data && data.lastUpdated ? data.lastUpdated : '';
        return true;
    }

    async function reloadFeed(options) {
        const opts = options || {};
        const result = await fetchFeed();
        if (!result) {
            setDataStatus('Gagal memuat news.json dari GitHub maupun situs.', 'error');
            return false;
        }

        const data = result.data;
        const list = Array.isArray(data) ? data : data && Array.isArray(data.items) ? data.items : [];
        const dirty = hasLocalChanges();

        published = ensureIds(list.map(normalizeItem));
        currentPublishedStamp = data && data.lastUpdated ? data.lastUpdated : '';

        if (dirty && !opts.force) {
            renderList();
            renderStats();
            renderIssues();
            setDataStatus(
                'Feed dimuat dari ' +
                    result.source +
                    ', tetapi draft lokal berbeda dan belum digabung. Tekan "Muat ulang news.json" untuk membuang draft lokal.',
                'warn'
            );
            return true;
        }

        draftBaseStamp = currentPublishedStamp;
        working = deepCopy(published);
        ensureIds(working);
        selectedId = null;
        saveWorking(false);
        renderEditor();
        renderList();
        renderStats();
        renderIssues();
        setDataStatus('Dimuat dari ' + result.source + ' · ' + published.length + ' item.', 'ok');

        if (opts.log) logEvent('reload', 'Feed dimuat ulang dari ' + result.source);
        return true;
    }

    /* ------------------------------ validation --------------------------- */

    function validateItem(item, all) {
        const issues = [];
        const push = (level, field, msg) => issues.push({ level, field, msg });

        if (!item.title) push('error', 'title', 'Judul wajib diisi.');
        else if (item.title.length > 90) push('warn', 'title', 'Judul lebih dari 90 karakter.');

        if (!item.slug) {
            push('error', 'slug', 'Slug wajib diisi.');
        } else {
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) {
                push('warn', 'slug', 'Slug sebaiknya hanya huruf kecil, angka, dan tanda hubung.');
            }
            if (all.filter((entry) => entry.slug === item.slug).length > 1) {
                push('error', 'slug', 'Slug dipakai lebih dari satu item.');
            }
        }

        if (!item.date || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
            push('error', 'date', 'Tanggal harus berformat YYYY-MM-DD.');
        } else if (item.date > todayISO()) {
            push('warn', 'date', 'Tanggal berada di masa depan.');
        }

        if (!item.category) push('warn', 'category', 'Kategori kosong.');

        if (!item.excerpt && !item.body) {
            push('error', 'body', 'Ringkasan atau isi markdown wajib diisi.');
        } else if (!item.excerpt) {
            push('warn', 'excerpt', 'Ringkasan kosong; kartu tidak punya teks pendek.');
        } else if (item.excerpt.length > 240) {
            push('warn', 'excerpt', 'Ringkasan lebih dari 240 karakter.');
        }

        if (!item.body) push('warn', 'body', 'Isi markdown kosong.');
        else if (item.body.length < 120) push('warn', 'body', 'Isi kurang dari 120 karakter.');

        if (item.images.length === 0) {
            push('warn', 'images', 'Tanpa gambar; kartu memakai placeholder bertulisan NEWS.');
        }
        item.images.forEach((url) => {
            if (!isHttpUrl(url)) push('error', 'images', 'URL gambar tidak valid: ' + url);
        });

        item.badges.forEach((url) => {
            if (!isHttpUrl(url)) push('error', 'badges', 'URL badge tidak valid: ' + url);
        });
        if (item.badges.length > 5) push('info', 'badges', 'Kartu hanya menampilkan 5 badge pertama.');

        if (item.url && !isHttpUrl(item.url)) {
            push('error', 'url', 'URL tautan eksternal tidak valid.');
        }

        if (item.source === 'ai') {
            if (!/^##\s+/m.test(item.body)) push('warn', 'body', 'Artikel AI tanpa subjudul "## ".');
            if (!/```/.test(item.body)) push('info', 'body', 'Artikel AI tanpa blok kode.');
            if (!item.model) push('info', 'body', 'Model generator tidak tercatat.');
        }

        return issues;
    }

    function collectIssues() {
        const issues = [];
        working.forEach((item) => {
            validateItem(item, working).forEach((issue) => {
                issues.push({
                    ...issue,
                    id: item.id,
                    title: item.title || item.slug || 'Tanpa judul'
                });
            });
        });

        if (working.length > MAX_ITEMS) {
            issues.push({
                level: 'warn',
                field: '',
                id: null,
                title: 'Feed',
                msg:
                    'Ada ' +
                    working.length +
                    ' item; publish menyimpan maksimal ' +
                    MAX_ITEMS +
                    ' item terbaru.'
            });
        }

        published
            .filter((entry) => !working.some((item) => item.id === entry.id))
            .forEach((entry) => {
                issues.push({
                    level: 'warn',
                    field: 'delete',
                    id: null,
                    title: entry.title || entry.slug || 'Tanpa judul',
                    msg: 'Item terpublikasi akan dihapus saat publish.'
                });
            });

        return issues;
    }

    function focusIssue(issue) {
        const map = {
            title: 'f-title',
            slug: 'f-slug',
            date: 'f-date',
            category: 'f-category',
            excerpt: 'f-excerpt',
            images: 'f-images',
            badges: 'f-badges',
            body: 'f-body',
            url: 'f-url'
        };
        const field = map[issue.field];
        if (!field) return;
        const input = $(field);
        if (!input) return;
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /* ------------------------------- render ------------------------------ */

    function statusOf(item) {
        const match = published.find((entry) => entry.id === item.id);
        if (!match) return { key: 'new', label: 'Baru' };
        return JSON.stringify(match) === JSON.stringify(item)
            ? { key: 'published', label: 'Terbit' }
            : { key: 'modified', label: 'Diubah' };
    }

    function renderList() {
        if (!els.itemList) return;
        const query = els.search.value.trim().toLowerCase();
        const filter = els.filterStatus.value;
        const sorted = working.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));

        els.itemList.innerHTML = '';
        const visible = sorted.filter((item) => {
            const status = statusOf(item).key;
            if (filter !== 'all' && status !== filter) return false;
            if (!query) return true;
            return [item.title, item.slug, item.category]
                .join(' ')
                .toLowerCase()
                .includes(query);
        });

        if (visible.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'hint';
            empty.textContent = working.length === 0 ? 'Belum ada item.' : 'Tidak ada item yang cocok.';
            els.itemList.appendChild(empty);
            return;
        }

        visible.forEach((item) => {
            const status = statusOf(item);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'audit-list-item' + (item.id === selectedId ? ' is-active' : '');
            button.dataset.id = item.id;

            const dot = document.createElement('span');
            dot.className = 'dot ' + status.key;

            const main = document.createElement('span');
            main.className = 'item-main';
            const title = document.createElement('strong');
            title.textContent = item.title || '(tanpa judul)';
            const sub = document.createElement('span');
            sub.textContent = [item.date, item.category || 'tanpa kategori'].filter(Boolean).join(' · ');
            main.append(title, sub);

            const state = document.createElement('span');
            state.className = 'item-state';
            state.textContent = status.label;

            button.append(dot, main, state);
            button.addEventListener('click', () => selectItem(item.id));
            els.itemList.appendChild(button);
        });
    }

    function renderStats() {
        const issues = collectIssues();
        const errors = issues.filter((issue) => issue.level === 'error').length;
        const warnings = issues.filter((issue) => issue.level === 'warn').length;

        els.statTotal.textContent = String(working.length);
        els.statErrors.textContent = String(errors);
        els.statWarnings.textContent = String(warnings);

        els.auditSummary.innerHTML = '';
        const chips = [
            { text: working.length + ' item', tone: '' },
            { text: errors + ' error', tone: errors > 0 ? 'is-error' : 'is-ok' },
            { text: warnings + ' warning', tone: warnings > 0 ? 'is-warn' : 'is-ok' }
        ];
        chips.forEach((chip) => {
            const span = document.createElement('span');
            span.className = 'summary-chip ' + chip.tone;
            span.textContent = chip.text;
            els.auditSummary.appendChild(span);
        });
    }

    function renderIssues() {
        if (!els.auditIssues) return;
        const issues = collectIssues();
        els.auditIssues.innerHTML = '';

        if (issues.length === 0) return;

        issues.forEach((issue) => {
            const row = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'issue-item level-' + issue.level;

            const level = document.createElement('span');
            level.className = 'issue-level';
            level.textContent = issue.level === 'warn' ? 'warning' : issue.level;

            const body = document.createElement('span');
            body.className = 'issue-body';
            const title = document.createElement('strong');
            title.textContent = issue.title;
            const message = document.createElement('span');
            message.textContent = issue.msg;
            body.append(title, message);

            button.append(level, body);

            if (issue.id) {
                button.addEventListener('click', () => {
                    selectItem(issue.id);
                    focusIssue(issue);
                });
            } else {
                button.disabled = true;
            }

            row.appendChild(button);
            els.auditIssues.appendChild(row);
        });
    }

    function updateEditorMeta(item) {
        if (!item) {
            els.editorMeta.textContent = '';
            return;
        }
        const status = statusOf(item);
        const source = item.source === 'ai' ? 'AI' + (item.model ? ' · ' + item.model : '') : 'Manual';
        els.editorMeta.textContent =
            source + ' · ' + status.label + ' · ' + item.images.length + ' gambar · id ' + item.id;
    }

    function renderEditor() {
        const item = working.find((entry) => entry.id === selectedId);
        els.editorForm.hidden = !item;
        els.editorEmpty.hidden = Boolean(item);
        if (!item) return;
        updateEditorMeta(item);
        els.excerptCount.textContent = String(item.excerpt.length);
    }

    function fillForm(item) {
        els.fTitle.value = item.title;
        els.fSlug.value = item.slug;
        els.fDate.value = item.date;
        els.fCategory.value = item.category;
        els.fExcerpt.value = item.excerpt;
        els.fImages.value = item.images.join('\n');
        els.fBadges.value = item.badges.join('\n');
        els.fUrl.value = item.url;
        els.fBody.value = item.body;
        els.excerptCount.textContent = String(item.excerpt.length);
        els.editorStatus.textContent = '';
    }

    function selectItem(id) {
        const item = working.find((entry) => entry.id === id);
        selectedId = item ? id : null;
        slugAuto = false;
        if (item) fillForm(item);
        renderEditor();
        renderList();
        if (item) updateEditorMeta(item);
    }

    function readForm() {
        return {
            title: els.fTitle.value.trim(),
            slug: els.fSlug.value.trim(),
            date: els.fDate.value,
            category: els.fCategory.value.trim(),
            excerpt: els.fExcerpt.value.trim(),
            images: linesOf(els.fImages.value),
            badges: linesOf(els.fBadges.value),
            body: els.fBody.value,
            url: els.fUrl.value.trim()
        };
    }

    function applyForm() {
        const item = working.find((entry) => entry.id === selectedId);
        if (!item) return;
        Object.assign(item, readForm());
        els.excerptCount.textContent = String(item.excerpt.length);
        renderList();
        renderStats();
        renderIssues();
        updateEditorMeta(item);
        scheduleAutosave();
    }

    /* ------------------------------- actions ----------------------------- */

    function createItem() {
        const item = normalizeItem({
            id: uid(),
            title: '',
            slug: '',
            date: todayISO(),
            category: '',
            excerpt: '',
            images: [],
            badges: [],
            body: '',
            url: '',
            source: 'manual'
        });
        item.slug = '';
        working.unshift(item);
        saveWorking(false);
        logEvent('create', 'Item baru dibuat');
        selectItem(item.id);
        slugAuto = true;
        els.fTitle.focus();
    }

    function deleteItem() {
        const item = working.find((entry) => entry.id === selectedId);
        if (!item) return;
        const wasPublished = published.some((entry) => entry.id === item.id);
        if (!confirm('Hapus "' + (item.title || item.slug || 'item') + '" dari draft?')) return;

        working = working.filter((entry) => entry.id !== item.id);
        selectedId = null;
        saveWorking(false);
        logEvent('delete', (wasPublished ? 'Item terpublikasi dihapus: ' : 'Draft dihapus: ') + (item.slug || item.title));
        renderEditor();
        renderList();
        renderStats();
        renderIssues();
    }

    function duplicateItem() {
        const item = working.find((entry) => entry.id === selectedId);
        if (!item) return;
        const copy = normalizeItem({
            ...deepCopy(item),
            id: uid(),
            slug: item.slug ? item.slug + '-copy' : '',
            title: item.title ? item.title + ' (copy)' : '',
            date: todayISO()
        });
        working.unshift(copy);
        saveWorking(false);
        logEvent('duplicate', 'Duplikat dibuat dari ' + (item.slug || item.title));
        selectItem(copy.id);
    }

    function previewItem() {
        const item = working.find((entry) => entry.id === selectedId);
        if (!item) return;

        const meta = [item.date, item.category].filter(Boolean).join(' · ');
        const lines = [];
        if (item.title) lines.push('# ' + item.title);
        if (meta) lines.push('> ' + meta);
        if (item.excerpt) lines.push(item.excerpt);
        if (item.body) lines.push(item.body);
        if (item.url) lines.push('[' + item.url + '](' + item.url + ')');
        if (item.source === 'ai') {
            const note = t('news-ai-note');
            if (note) lines.push('_' + note + '_');
        }

        if (typeof openModal !== 'function') {
            setDataStatus('Pratinjau modal tidak tersedia.', 'error');
            return;
        }

        openModal({
            title: item.title,
            subtitle: meta,
            desc: '<p>' + escapeHtml(item.excerpt) + '</p>',
            image: item.images[0] || '',
            readme: lines.join('\n\n')
        });
    }

    function buildPayload() {
        const items = working
            .slice()
            .sort((a, b) => String(b.date).localeCompare(String(a.date)))
            .slice(0, MAX_ITEMS)
            .map((item) => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                date: item.date,
                category: item.category,
                excerpt: item.excerpt,
                images: item.images,
                badges: item.badges,
                body: item.body,
                url: item.url,
                source: item.source || 'manual',
                model: item.model || ''
            }));

        return {
            lastUpdated: new Date().toISOString(),
            total: items.length,
            items
        };
    }

    function downloadJson() {
        const payload = buildPayload();
        const blob = new Blob([JSON.stringify(payload, null, 2) + '\n'], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'news.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        logEvent('export', payload.total + ' item diunduh sebagai news.json');
        setDataStatus('news.json diunduh. Commit ke ' + getSettings().path + ' untuk menerbitkan.', 'ok');
    }

    function previewSite() {
        const payload = buildPayload();
        try {
            localStorage.setItem(STORAGE.preview, JSON.stringify(payload));
        } catch (error) {
            setDataStatus('Gagal menyimpan pratinjau lokal.', 'error');
            return;
        }
        logEvent('preview', 'Membuka /news?preview=1 dengan ' + payload.total + ' item');
        window.open('../?preview=1', '_blank', 'noopener');
    }

    /* ------------------------------ settings ----------------------------- */

    function getSettings() {
        return {
            owner: els.ghOwner.value.trim() || 'widifirmaan',
            repo: els.ghRepo.value.trim() || 'widifirmaan.github.io',
            branch: els.ghBranch.value.trim() || 'master',
            path: els.ghPath.value.trim() || 'news.json'
        };
    }

    function saveSettings() {
        try {
            localStorage.setItem(STORAGE.settings, JSON.stringify(getSettings()));
        } catch (e) {}
    }

    function restoreSettings() {
        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(STORAGE.settings) || '{}') || {};
        } catch (e) {}
        els.ghOwner.value = saved.owner || 'widifirmaan';
        els.ghRepo.value = saved.repo || 'widifirmaan.github.io';
        els.ghBranch.value = saved.branch || 'master';
        els.ghPath.value = saved.path === 'news/news.json' ? 'news.json' : saved.path || 'news.json';
    }

    function apiHeaders(token) {
        return {
            Authorization: 'Bearer ' + token,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
        };
    }

    function activeToken() {
        try {
            return sessionStorage.getItem(STORAGE.token) || els.ghToken.value.trim();
        } catch (e) {
            return els.ghToken.value.trim();
        }
    }

    /* ------------------------------- publish ----------------------------- */

    function setDataStatus(message, tone) {
        els.dataStatus.className = 'panel-status' + (tone ? ' is-' + tone : '');
        els.dataStatus.textContent = message;
    }

    function setPublishStatus(message, tone, linkUrl) {
        els.publishStatus.className = 'panel-status' + (tone ? ' is-' + tone : '');
        els.publishStatus.textContent = message;
        if (linkUrl) {
            const link = document.createElement('a');
            link.href = linkUrl;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = ' Buka commit';
            els.publishStatus.appendChild(link);
        }
    }

    function toBase64(text) {
        const bytes = new TextEncoder().encode(text);
        let binary = '';
        const chunk = 0x8000;
        for (let index = 0; index < bytes.length; index += chunk) {
            binary += String.fromCharCode.apply(null, bytes.subarray(index, index + chunk));
        }
        return btoa(binary);
    }

    function fromBase64(value) {
        const binary = atob(String(value || '').replace(/\s/g, ''));
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    }

    async function verifyToken() {
        const token = activeToken();
        if (!token) {
            setPublishStatus('Isi token GitHub terlebih dahulu.', 'warn');
            return false;
        }

        setPublishStatus('Memeriksa token...', 'pending');
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: apiHeaders(token)
            });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const user = await response.json();
            sessionStorage.setItem(STORAGE.token, token);
            els.ghToken.value = '';
            logEvent('token', 'Token diverifikasi untuk @' + user.login);
            setPublishStatus('Token valid untuk @' + user.login + '.', 'ok');
            return true;
        } catch (error) {
            try {
                sessionStorage.removeItem(STORAGE.token);
            } catch (e) {}
            setPublishStatus('Token tidak valid: ' + error.message, 'error');
            return false;
        }
    }

    async function publish() {
        const token = activeToken();
        if (!token) {
            setPublishStatus('Token belum ada. Verifikasi token atau gunakan Export news.json.', 'warn');
            return;
        }

        const errors = collectIssues().filter((issue) => issue.level === 'error');
        if (errors.length > 0 && !confirm('Masih ada ' + errors.length + ' error audit. Tetap publish?')) {
            return;
        }

        if (currentPublishedStamp && draftBaseStamp && draftBaseStamp !== currentPublishedStamp) {
            setPublishStatus(
                'Draft lokal dibuat dari versi news.json yang berbeda. Muat ulang feed (draft akan dibuang) atau export draft, lalu publish ulang. Ini mencegah artikel baru dari generator AI tertimpa.',
                'error'
            );
            return;
        }

        if (
            currentPublishedStamp &&
            !draftBaseStamp &&
            !confirm('Draft ini tidak mencatat versi news.json asalnya. Publish bisa menimpa perubahan remote. Lanjut?')
        ) {
            return;
        }

        const missing = published.filter((entry) => !working.some((item) => item.id === entry.id));
        if (missing.length > 0 && !confirm(missing.length + ' item terpublikasi tidak ada di draft dan akan terhapus. Lanjut?')) {
            return;
        }

        const settings = getSettings();
        saveSettings();

        const payload = buildPayload();
        const json = JSON.stringify(payload, null, 2) + '\n';
        const apiUrl =
            'https://api.github.com/repos/' +
            encodeURIComponent(settings.owner) +
            '/' +
            encodeURIComponent(settings.repo) +
            '/contents/' +
            settings.path.split('/').map(encodeURIComponent).join('/');

        els.btnPublish.disabled = true;
        setPublishStatus('Mengunggah news.json ke GitHub...', 'pending');

        try {
            let sha = null;
            let remoteStamp = '';

            const head = await fetch(apiUrl + '?ref=' + encodeURIComponent(settings.branch), {
                headers: apiHeaders(token)
            });

            if (head.ok) {
                const info = await head.json();
                sha = info.sha;
                try {
                    const remote = JSON.parse(fromBase64(info.content));
                    remoteStamp = remote.lastUpdated || '';
                } catch (e) {}
            } else if (head.status !== 404) {
                throw new Error('Gagal membaca berkas di GitHub: HTTP ' + head.status);
            }

            if (remoteStamp && currentPublishedStamp && remoteStamp !== currentPublishedStamp) {
                setPublishStatus(
                    'news.json di GitHub sudah berubah (kemungkinan dari generator AI). Muat ulang news.json dulu supaya artikel baru tidak tertimpa.',
                    'error'
                );
                return;
            }

            if (!remoteStamp) {
                try {
                    const rawUrl =
                        'https://raw.githubusercontent.com/' +
                        encodeURIComponent(settings.owner) +
                        '/' +
                        encodeURIComponent(settings.repo) +
                        '/' +
                        encodeURIComponent(settings.branch) +
                        '/' +
                        settings.path.split('/').map(encodeURIComponent).join('/') +
                        '?v=' +
                        Date.now();
                    const rawResponse = await fetch(rawUrl, { cache: 'no-store' });
                    if (rawResponse.ok) {
                        const remote = await rawResponse.json();
                        remoteStamp = remote.lastUpdated || '';
                    }
                } catch (e) {}

                if (remoteStamp && currentPublishedStamp && remoteStamp !== currentPublishedStamp) {
                    setPublishStatus(
                        'news.json di GitHub sudah berubah (kemungkinan dari generator AI). Muat ulang news.json dulu supaya artikel baru tidak tertimpa.',
                        'error'
                    );
                    return;
                }
            }

            const body = {
                message: 'chore(news): publish ' + payload.total + ' item',
                content: toBase64(json),
                branch: settings.branch
            };
            if (sha) body.sha = sha;

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: apiHeaders(token),
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const detail = await response.json().catch(() => ({}));
                throw new Error(detail.message || 'HTTP ' + response.status);
            }

            const result = await response.json();
            published = payload.items.map(normalizeItem);
            working = deepCopy(published);
            ensureIds(working);
            currentPublishedStamp = payload.lastUpdated;
            draftBaseStamp = currentPublishedStamp;
            saveWorking(false);
            logEvent('publish', payload.total + ' item → ' + settings.owner + '/' + settings.repo + '@' + settings.branch);
            renderList();
            renderStats();
            renderIssues();
            updateEditorMeta(working.find((entry) => entry.id === selectedId));

            const commitUrl = result.commit && result.commit.html_url ? result.commit.html_url : '';
            setPublishStatus('Berhasil dipublikasikan. ' + payload.total + ' item di ' + settings.path + '.', 'ok', commitUrl);
        } catch (error) {
            setPublishStatus('Publish gagal: ' + error.message, 'error');
        } finally {
            els.btnPublish.disabled = false;
        }
    }

    /* --------------------------- AI generation --------------------------- */

    function setAiStatus(message, tone, linkUrl) {
        els.aiStatus.className = 'panel-status' + (tone ? ' is-' + tone : '');
        els.aiStatus.textContent = message;
        if (linkUrl) {
            const link = document.createElement('a');
            link.href = linkUrl;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = ' Lihat run';
            els.aiStatus.appendChild(link);
        }
    }

    function stopPolling() {
        clearTimeout(pollTimer);
        pollTimer = 0;
    }

    async function pollRun(owner, repo, startedAt, attempt) {
        const token = activeToken();
        if (!token) {
            setAiStatus('Token hilang dari sesi. Verifikasi ulang.', 'error');
            els.btnGenerate.disabled = false;
            return;
        }

        if (attempt >= POLL_LIMIT) {
            setAiStatus('Melebihi batas tunggu. Periksa tab Actions di GitHub.', 'warn');
            els.btnGenerate.disabled = false;
            return;
        }

        try {
            const url =
                'https://api.github.com/repos/' +
                encodeURIComponent(owner) +
                '/' +
                encodeURIComponent(repo) +
                '/actions/workflows/' +
                encodeURIComponent(WORKFLOW_FILE) +
                '/runs?event=workflow_dispatch&per_page=10';
            const response = await fetch(url, { headers: apiHeaders(token) });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            const runs = data.workflow_runs || [];
            const run = runs.find((entry) => new Date(entry.created_at).getTime() >= startedAt - 15000);

            if (!run) {
                setAiStatus('Menunggu workflow mulai...', 'pending');
            } else if (run.status !== 'completed') {
                setAiStatus('Workflow ' + run.status + '. Menunggu...', 'pending', run.html_url);
            } else if (run.conclusion === 'success') {
                setAiStatus('Selesai. Memuat news.json terbaru...', 'pending', run.html_url);
                const reloaded = await reloadFeed({});
                if (!reloaded) {
                    setAiStatus(
                        'Workflow selesai, tetapi news.json gagal dimuat. Tekan "Muat ulang news.json".',
                        'warn',
                        run.html_url
                    );
                } else if (hasLocalChanges()) {
                    setAiStatus(
                        'Artikel baru sudah masuk news.json, tetapi draft lokal belum memuatnya. Muat ulang feed sebelum publish agar artikel baru tidak tertimpa.',
                        'warn',
                        run.html_url
                    );
                } else {
                    setAiStatus('Selesai. Artikel baru sudah masuk news.json.', 'ok', run.html_url);
                    logEvent('generate', 'Workflow selesai; feed dimuat ulang');
                }
                els.btnGenerate.disabled = false;
                return;
            } else {
                setAiStatus('Workflow selesai dengan status ' + run.conclusion + '.', 'error', run.html_url);
                els.btnGenerate.disabled = false;
                return;
            }
        } catch (error) {
            setAiStatus('Gagal membaca status workflow: ' + error.message, 'error');
            els.btnGenerate.disabled = false;
            return;
        }

        pollTimer = setTimeout(() => pollRun(owner, repo, startedAt, attempt + 1), POLL_INTERVAL);
    }

    async function generate() {
        const token = activeToken();
        if (!token) {
            setAiStatus('Verifikasi token GitHub dulu (butuh Actions: read/write).', 'warn');
            return;
        }

        if (hasLocalChanges() && !confirm('Draft lokal belum dipublikasikan. Generator akan menambah artikel ke news.json; draft lokal bisa menimpa artikel baru jika langsung di-publish. Lanjut?')) {
            return;
        }

        const settings = getSettings();
        saveSettings();
        const startedAt = Date.now();
        const inputs = {
            count: els.aiCount.value,
            topic: els.aiTopic.value.trim(),
            category: els.aiCategory.value.trim(),
            language: els.aiLanguage.value
        };

        stopPolling();
        els.btnGenerate.disabled = true;
        setAiStatus('Mengirim permintaan ke GitHub Actions...', 'pending');

        try {
            const url =
                'https://api.github.com/repos/' +
                encodeURIComponent(settings.owner) +
                '/' +
                encodeURIComponent(settings.repo) +
                '/actions/workflows/' +
                encodeURIComponent(WORKFLOW_FILE) +
                '/dispatches';

            const response = await fetch(url, {
                method: 'POST',
                headers: apiHeaders(token),
                body: JSON.stringify({ ref: settings.branch, inputs })
            });

            if (response.status !== 204) {
                const detail = await response.json().catch(() => ({}));
                throw new Error(detail.message || 'HTTP ' + response.status);
            }

            logEvent('generate', inputs.count + ' artikel · ' + (inputs.topic || 'topik otomatis'));
            setAiStatus('Workflow dijalankan. Menunggu hasil...', 'pending');
            pollTimer = setTimeout(() => pollRun(settings.owner, settings.repo, startedAt, 0), 3000);
        } catch (error) {
            const hint = /404|403/.test(error.message)
                ? ' Pastikan token punya akses Actions dan file .github/workflows/' + WORKFLOW_FILE + ' ada di branch ' + settings.branch + '.'
                : '';
            setAiStatus('Gagal memicu generator: ' + error.message + '.' + hint, 'error');
            els.btnGenerate.disabled = false;
        }
    }

    /* ------------------------------ bindings ----------------------------- */

    els.editorForm.addEventListener('submit', (event) => event.preventDefault());

    els.fTitle.addEventListener('input', () => {
        if (slugAuto) els.fSlug.value = slugify(els.fTitle.value);
        applyForm();
    });
    els.fSlug.addEventListener('input', () => {
        slugAuto = false;
        applyForm();
    });

    [
        els.fDate,
        els.fCategory,
        els.fExcerpt,
        els.fImages,
        els.fBadges,
        els.fUrl,
        els.fBody
    ].forEach((input) => input.addEventListener('input', applyForm));

    els.btnNew.addEventListener('click', createItem);
    els.btnDelete.addEventListener('click', deleteItem);
    els.btnDuplicate.addEventListener('click', duplicateItem);
    els.btnPreview.addEventListener('click', previewItem);
    els.btnSave.addEventListener('click', () => {
        saveWorking(true);
        els.editorStatus.textContent = 'Tersimpan lokal';
    });

    els.search.addEventListener('input', renderList);
    els.filterStatus.addEventListener('change', renderList);

    els.btnReset.addEventListener('click', () => {
        if (!confirm('Buang semua perubahan draft dan muat ulang dari news.json?')) return;
        working = deepCopy(published);
        ensureIds(working);
        draftBaseStamp = currentPublishedStamp;
        selectedId = null;
        saveWorking(false);
        renderEditor();
        renderList();
        renderStats();
        renderIssues();
        logEvent('reset', 'Draft dikembalikan ke news.json');
    });

    els.btnExport.addEventListener('click', downloadJson);
    els.btnImport.addEventListener('click', () => els.importFile.click());
    els.importFile.addEventListener('change', async () => {
        const file = els.importFile.files && els.importFile.files[0];
        if (!file) return;
        try {
            const parsed = JSON.parse(await file.text());
            const list = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.items) ? parsed.items : null;
            if (!list) throw new Error('tidak ada array items');
            const normalized = ensureIds(list.map(normalizeItem));
            if (
                !confirm(
                    'Ganti draft dengan ' +
                        normalized.length +
                        ' item dari ' +
                        file.name +
                        '? Publish setelah import akan menimpa news.json saat ini.'
                )
            ) {
                return;
            }
            working = normalized;
            draftBaseStamp = currentPublishedStamp;
            selectedId = null;
            saveWorking(false);
            renderEditor();
            renderList();
            renderStats();
            renderIssues();
            logEvent('import', normalized.length + ' item dari ' + file.name);
            setDataStatus('Import selesai: ' + normalized.length + ' item.', 'ok');
        } catch (error) {
            setDataStatus('Import gagal: ' + error.message, 'error');
        } finally {
            els.importFile.value = '';
        }
    });

    els.btnPreviewSite.addEventListener('click', previewSite);
    els.btnReload.addEventListener('click', async () => {
        if (hasLocalChanges() && !confirm('Buang draft lokal dan muat ulang dari news.json?')) return;
        await reloadFeed({ force: true, log: true });
    });

    els.btnClearLog.addEventListener('click', () => {
        if (!confirm('Bersihkan audit log?')) return;
        writeLog([]);
    });

    els.btnVerify.addEventListener('click', verifyToken);
    els.btnForget.addEventListener('click', () => {
        try {
            sessionStorage.removeItem(STORAGE.token);
        } catch (e) {}
        els.ghToken.value = '';
        setPublishStatus('Token dihapus dari sesi ini.', '');
    });
    els.btnPublish.addEventListener('click', publish);
    els.btnGenerate.addEventListener('click', generate);

    [els.ghOwner, els.ghRepo, els.ghBranch, els.ghPath].forEach((input) => {
        input.addEventListener('change', saveSettings);
    });

    /* -------------------------------- boot ------------------------------- */

    async function boot() {
        restoreSettings();
        const publishedOk = await loadPublished();
        const hasDraft = loadDraft();

        if (hasDraft) {
            els.draftNote.textContent =
                'Draft lokal · basis ' + (draftBaseStamp ? formatDateTime(draftBaseStamp) : 'tidak diketahui');
        } else {
            working = deepCopy(published);
            ensureIds(working);
            draftBaseStamp = currentPublishedStamp;
        }

        let token = '';
        try {
            token = sessionStorage.getItem(STORAGE.token) || '';
        } catch (e) {}
        if (token) setPublishStatus('Token sesi tersedia. Publish siap dijalankan.', '');

        renderList();
        renderStats();
        renderIssues();
        renderLog();
        renderEditor();

        if (!publishedOk) {
            setPublishStatus('news.json belum bisa dibaca. Publish pertama akan membuat berkas baru.', 'warn');
        } else if (hasDraft && draftBaseStamp && currentPublishedStamp && draftBaseStamp !== currentPublishedStamp) {
            setDataStatus(
                'news.json punya update yang belum ada di draft lokal. Muat ulang feed, atau publish akan menimpa update tersebut.',
                'warn'
            );
        } else {
            setDataStatus(published.length + ' item terpublikasi dimuat dari news.json.', '');
        }
    }

    boot();
})();
