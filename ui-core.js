// Lightweight shared UI shell: mobile menu, 3-state theme switcher, and language switcher.
(() => {
    'use strict';

    // Mobile hamburger drawer (anchor smooth scroll on home is enhanced in script.js when Lenis loads).
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('active');
            navLinks.classList.toggle('active', isActive);
            hamburger.setAttribute('aria-expanded', String(isActive));
        });

        navLinks.addEventListener('click', (e) => {
            if (e.target && e.target.tagName === 'A') {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Language switcher
    const VALID_LANGS = ['id', 'en', 'zh'];
    const langBtns = document.querySelectorAll('.lang-btn');
    const pageDeclaredLang = document.documentElement.dataset.pageLang;

    let currentLang = VALID_LANGS.includes(pageDeclaredLang)
        ? pageDeclaredLang
        : (() => {
              try {
                  return localStorage.getItem('lang') || 'id';
              } catch (e) {
                  return 'id';
              }
          })();
    if (!VALID_LANGS.includes(currentLang)) currentLang = 'id';

    function setLanguage(lang) {
        if (!VALID_LANGS.includes(lang)) lang = 'id';
        currentLang = lang;
        try {
            localStorage.setItem('lang', lang);
        } catch (e) {}

        document.documentElement.setAttribute('lang', lang);

        langBtns.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        if (document.body && document.body.dataset.page === 'home') {
            document.querySelectorAll('a[data-i18n="nav-news"]').forEach((link) => {
                link.setAttribute('href', lang === 'id' ? 'news/' : lang + '/news/');
            });
        }

        if (typeof translations !== 'undefined' && translations[lang]) {
            const dict = translations[lang];
            document.querySelectorAll('[data-i18n]').forEach((el) => {
                const key = el.dataset.i18n;
                if (dict[key]) {
                    if (el.classList.contains('glitch')) {
                        el.setAttribute('data-text', dict[key]);
                    }
                    el.innerText = dict[key];
                }
            });

            document.querySelectorAll('[data-i18n-title]').forEach((el) => {
                const key = el.getAttribute('data-i18n-title');
                if (dict[key]) el.setAttribute('data-title', dict[key]);
            });
            document.querySelectorAll('[data-i18n-subtitle]').forEach((el) => {
                const key = el.getAttribute('data-i18n-subtitle');
                if (dict[key]) el.setAttribute('data-subtitle', dict[key]);
            });
            document.querySelectorAll('[data-i18n-desc]').forEach((el) => {
                const key = el.getAttribute('data-i18n-desc');
                if (dict[key]) el.setAttribute('data-desc', dict[key]);
            });
            document.querySelectorAll('[data-i18n-content]').forEach((el) => {
                const key = el.getAttribute('data-i18n-content');
                if (dict[key]) el.setAttribute('content', dict[key]);
            });
        }
    }

    setLanguage(currentLang);

    langBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetLang = btn.dataset.lang;
            setLanguage(targetLang);
            const langUrlsRaw = document.body && document.body.dataset.langUrls;
            if (langUrlsRaw) {
                try {
                    const langUrls = JSON.parse(langUrlsRaw);
                    const targetUrl = langUrls && langUrls[targetLang];
                    if (targetUrl && targetUrl !== window.location.pathname) {
                        window.location.assign(targetUrl);
                    }
                } catch (e) {}
            }
        });
    });

    // Theme Manager (3-state: system / light / dark)
    const ThemeManager = (() => {
        const STORAGE_KEY = 'theme';
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeIconEl = document.getElementById('theme-icon-active');
        const themeLabelEl = document.getElementById('theme-label');
        const root = document.documentElement;

        const SVG_OPEN =
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
        const ICONS = {
            system:
                SVG_OPEN +
                '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
            light:
                SVG_OPEN +
                '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
            dark:
                SVG_OPEN +
                '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
        };

        const META = {
            system: { icon: ICONS.system, label: 'system', next: 'light' },
            light: { icon: ICONS.light, label: 'light', next: 'dark' },
            dark: { icon: ICONS.dark, label: 'dark', next: 'system' }
        };

        let currentMode = 'system';
        let lastToggleAt = 0;

        function getSystemEffective() {
            try {
                return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
            } catch (e) {
                return 'dark';
            }
        }

        function getStoredMode() {
            try {
                const v = localStorage.getItem(STORAGE_KEY);
                return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
            } catch (e) {
                return 'system';
            }
        }

        function resolveEffective(mode) {
            if (mode === 'light' || mode === 'dark') return mode;
            return getSystemEffective();
        }

        function updateButton(mode) {
            const meta = META[mode] || META.system;
            if (themeToggleBtn) {
                themeToggleBtn.setAttribute('aria-label', 'Theme: ' + meta.label);
                themeToggleBtn.setAttribute(
                    'title',
                    'Theme: ' + meta.label + ' (click for ' + META[meta.next].label + ')'
                );
            }
            if (themeLabelEl) {
                themeLabelEl.textContent = meta.label;
            }
            if (!themeIconEl) return;
            themeIconEl.classList.remove('visible');
            themeIconEl.classList.add('hidden');
            setTimeout(() => {
                themeIconEl.innerHTML = meta.icon;
                themeIconEl.classList.remove('hidden');
                themeIconEl.classList.add('visible');
            }, 150);
        }

        function updateMetaTheme(effective) {
            let meta = document.querySelector('meta[name="theme-color"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', 'theme-color');
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', effective === 'light' ? '#ffffff' : '#050505');
            try {
                root.style.colorScheme = effective;
            } catch (e) {}
        }

        function applyMode(mode) {
            if (mode !== 'light' && mode !== 'dark' && mode !== 'system') mode = 'system';
            currentMode = mode;
            const effective = resolveEffective(mode);

            root.setAttribute('data-theme', effective);

            if (effective === 'light') {
                document.documentElement.style.backgroundColor = '#ffffff';
                document.body.style.backgroundColor = '#ffffff';
                document.body.style.color = '#000000';
            } else {
                document.documentElement.style.backgroundColor = '#050505';
                document.body.style.backgroundColor = '#050505';
                document.body.style.color = '#ffffff';
            }

            updateButton(mode);
            updateMetaTheme(effective);
            window.dispatchEvent(new CustomEvent('themechange', { detail: { mode, effective } }));
        }

        function init() {
            applyMode(getStoredMode());

            if (themeToggleBtn) {
                themeToggleBtn.addEventListener('click', (e) => {
                    if (e && e.preventDefault) e.preventDefault();
                    if (e && e.stopPropagation) e.stopPropagation();
                    const now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
                    if (now - lastToggleAt < 350) return;
                    lastToggleAt = now;

                    const next = META[currentMode] ? META[currentMode].next : 'system';
                    try {
                        localStorage.setItem(STORAGE_KEY, next);
                    } catch (err) {}
                    applyMode(next);
                });
            }

            try {
                const mq = window.matchMedia('(prefers-color-scheme: light)');
                const onChange = () => {
                    if (currentMode === 'system') applyMode('system');
                };
                if (mq.addEventListener) mq.addEventListener('change', onChange);
                else if (mq.addListener) mq.addListener(onChange);
            } catch (e) {}
        }

        return {
            init,
            applyMode,
            get mode() {
                return currentMode;
            },
            get effective() {
                return resolveEffective(currentMode);
            }
        };
    })();

    ThemeManager.init();

    window.__theme = {
        get mode() {
            return ThemeManager.mode;
        },
        get effective() {
            return ThemeManager.effective;
        },
        set: (m) => ThemeManager.applyMode(m)
    };
    window.__ui = {
        setLanguage,
        getCurrentLang: () => currentLang
    };
})();
