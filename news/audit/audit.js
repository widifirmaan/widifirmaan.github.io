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

    function statusOf(item) {
        const pub = published.find((p) => p.id === item.id);
        if (!pub) return { key: 'new', label: 'Draft baru' };
        const same = JSON.stringify(normalizeItem(pub)) === JSON.stringify(normalizeItem(item));
        return same ? { key: 'published', label: 'Terbit' } : { key: 'modified', label: 'Diubah' };
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

    function logEvent() {}

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
        const rawUrl = 'https://raw.githubusercontent.com/widifirmaan/widifirmaan.github.io/master/news.json?v=' + Date.now();
        try {
            const response = await fetch(rawUrl, { cache: 'no-store' });
            if (response.ok) return { data: await response.json(), source: 'GitHub' };
        } catch (e) {}
        try {
            const response = await fetch(LOCAL_FEED + '?v=' + Date.now(), { cache: 'no-store' });
            if (response.ok) return { data: await response.json(), source: 'situs' };
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
        setDataStatus('Dimuat dari ' + result.source + ' · ' + published.length + ' item.', 'ok');

        if (opts.log) logEvent('reload', 'Feed dimuat ulang dari ' + result.source);
        return true;
    }

    /* ------------------------------ validation --------------------------- */

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
            empty.textContent = working.length === 0 ? 'Belum ada artikel.' : 'Tidak ada artikel yang cocok.';
            els.itemList.appendChild(empty);
            return;
        }

        visible.forEach((item) => {
            const status = statusOf(item);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'audit-list-item' + (item.id === selectedId ? ' is-active' : '');
            button.dataset.id = item.id;

            const main = document.createElement('span');
            main.className = 'item-main';
            const title = document.createElement('strong');
            title.textContent = item.title || '(tanpa judul)';
            const sub = document.createElement('span');
            sub.textContent = [item.date, item.category || 'tanpa kategori'].filter(Boolean).join(' · ');
            main.append(title, sub);

            const state = document.createElement('span');
            state.className = 'item-state state-' + status.key;
            state.textContent = status.key === 'published' ? 'Published' : 'Draft';

            button.append(main, state);
            button.addEventListener('click', () => selectItem(item.id));
            els.itemList.appendChild(button);
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
        setDataStatus('news.json diunduh. Siap di-commit sebagai news.json.', 'ok');
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

    /* ------------------------------ AI / settings ----------------------------- */

    const GH = {
        owner: 'widifirmaan',
        repo: 'widifirmaan.github.io',
        branch: 'master',
        workflow: WORKFLOW_FILE
    };

    function activeToken() {
        try { return sessionStorage.getItem(STORAGE.token) || ''; } catch (e) { return ''; }
    }

    function setDataStatus(message, tone) {
        if (!els.dataStatus) return;
        els.dataStatus.className = 'panel-status' + (tone ? ' is-' + tone : '');
        els.dataStatus.textContent = message;
    }

    function apiHeaders(token) {
        return {
            Authorization: 'Bearer ' + token,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
        };
    }

    function setAiStatus(message, tone, linkUrl) {
        if (!els.aiStatus) return;
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

    async function pollRun(startedAt, attempt) {
        const token = activeToken();
        if (!token) {
            setAiStatus('Token hilang dari sesi. Set sessionStorage.news_cms_token lalu coba lagi.', 'error');
            if (els.btnGenerate) els.btnGenerate.disabled = false;
            return;
        }
        if (attempt >= POLL_LIMIT) {
            setAiStatus('Melebihi batas tunggu. Periksa tab Actions di GitHub.', 'warn');
            if (els.btnGenerate) els.btnGenerate.disabled = false;
            return;
        }
        try {
            const url = 'https://api.github.com/repos/' + GH.owner + '/' + GH.repo +
                '/actions/workflows/' + encodeURIComponent(GH.workflow) +
                '/runs?event=workflow_dispatch&per_page=10';
            const response = await fetch(url, { headers: apiHeaders(token) });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            const runs = data.workflow_runs || [];
            const run = runs.find((entry) => new Date(entry.created_at).getTime() >= startedAt - 15000);

            if (!run) {
                setAiStatus('Menunggu workflow mulai...', 'pending');
            } else if (run.status !== 'completed') {
                setAiStatus('Workflow ' + run.status + '...', 'pending', run.html_url);
            } else if (run.conclusion === 'success') {
                setAiStatus('Selesai. Memuat news.json terbaru...', 'pending', run.html_url);
                const reloaded = await reloadFeed({});
                if (reloaded) {
                    setAiStatus('Selesai. news.json dimuat ulang.', 'ok', run.html_url);
                } else {
                    setAiStatus('Workflow selesai, tetapi news.json gagal dimuat. Klik Muat ulang.', 'warn', run.html_url);
                }
                if (els.btnGenerate) els.btnGenerate.disabled = false;
                return;
            } else {
                setAiStatus('Workflow selesai dengan status ' + run.conclusion + '.', 'error', run.html_url);
                if (els.btnGenerate) els.btnGenerate.disabled = false;
                return;
            }
        } catch (error) {
            setAiStatus('Gagal membaca status workflow: ' + error.message, 'error');
            if (els.btnGenerate) els.btnGenerate.disabled = false;
            return;
        }
        pollTimer = setTimeout(() => pollRun(startedAt, attempt + 1), POLL_INTERVAL);
    }

    async function generate() {
        const token = activeToken();
        if (!token) {
            const entered = prompt('Masukkan GitHub PAT (Contents/Actions read-write). Disimpan di sessionStorage saja:');
            if (!entered) {
                setAiStatus('Token diperlukan untuk memicu workflow.', 'warn');
                return;
            }
            try { sessionStorage.setItem(STORAGE.token, entered.trim()); } catch (e) {}
        }
        const useToken = activeToken();
        if (!useToken) return;

        const startedAt = Date.now();
        const inputs = {
            count: els.aiCount ? els.aiCount.value : '1',
            topic: els.aiTopic ? els.aiTopic.value.trim() : '',
            category: els.aiCategory ? els.aiCategory.value.trim() : '',
            language: els.aiLanguage ? els.aiLanguage.value : 'id'
        };

        stopPolling();
        if (els.btnGenerate) els.btnGenerate.disabled = true;
        setAiStatus('Mengirim permintaan ke GitHub Actions...', 'pending');

        try {
            const url = 'https://api.github.com/repos/' + GH.owner + '/' + GH.repo +
                '/actions/workflows/' + encodeURIComponent(GH.workflow) + '/dispatches';
            const response = await fetch(url, {
                method: 'POST',
                headers: apiHeaders(useToken),
                body: JSON.stringify({ ref: GH.branch, inputs })
            });
            if (response.status !== 204) {
                const detail = await response.json().catch(() => ({}));
                throw new Error(detail.message || 'HTTP ' + response.status);
            }
            setAiStatus('Workflow dijalankan. Menunggu hasil...', 'pending');
            pollTimer = setTimeout(() => pollRun(startedAt, 0), 3000);
        } catch (error) {
            setAiStatus('Gagal memicu generator: ' + error.message, 'error');
            if (els.btnGenerate) els.btnGenerate.disabled = false;
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

    els.btnGenerate.addEventListener('click', generate);

    /* -------------------------------- boot ------------------------------- */

    async function boot() {
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

        renderList();
        renderEditor();

        if (!publishedOk) {
            setDataStatus('news.json belum bisa dibaca. Export/import tetap bisa digunakan.', 'warn');
        } else {
            setDataStatus(published.length + ' item dimuat dari news.json.', '');
        }
    }

    boot();
})();
