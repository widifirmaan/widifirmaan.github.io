# WDPORT

> WDPORT is the official personal portfolio website of Widi Firmansyah, built with semantic HTML5, CSS3, and plain JavaScript. It features an interactive Three.js 3D particle canvas, Lenis smooth scrolling with GSAP ScrollTrigger, a language switcher for Indonesian, English, and Chinese, a project catalog generated daily from GitHub README files into `projects.json`, and a paginated coding news feed with a local-first CMS and AI-assisted article generation.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-r128-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.12.2-88CE02?style=flat-square&logo=greensock&logoColor=white)](https://gsap.com/)
[![Lenis](https://img.shields.io/badge/Lenis-1.0.19-111111?style=flat-square)](https://lenis.darkroom.engineering/)
[![Marked](https://img.shields.io/badge/Marked.js-111111?style=flat-square)](https://marked.js.org/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Node.js](https://img.shields.io/badge/Node.js-22-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

---

## Live URL

- **URL:** [https://widifirmaan.web.id](https://widifirmaan.web.id)

---

## Screenshots

| Desktop Light (MacBook Pro M4) | Desktop Dark (MacBook Pro M4) | Mobile Light (iPhone 16 Pro) | Mobile Dark (iPhone 16 Pro) |
| :---: | :---: | :---: | :---: |
| **Hero Stage**<br>![Hero Stage Light Desktop](screenshots/Portfolio%20Hero%20Desktop.png) | **Hero Stage**<br>![Hero Stage Dark Desktop](screenshots/Portfolio%20Hero%20Dark%20Desktop.png) | **Hero Stage**<br>![Hero Stage Light Mobile](screenshots/Portfolio%20Hero%20Mobile.png) | **Hero Stage**<br>![Hero Stage Dark Mobile](screenshots/Portfolio%20Hero%20Dark%20Mobile.png) |
| **Project Grid**<br>![Project Grid Light Desktop](screenshots/Portfolio%20Works%20Desktop.png) | **Project Grid**<br>![Project Grid Dark Desktop](screenshots/Portfolio%20Works%20Dark%20Desktop.png) | **Project Grid**<br>![Project Grid Light Mobile](screenshots/Portfolio%20Works%20Mobile.png) | **Project Grid**<br>![Project Grid Dark Mobile](screenshots/Portfolio%20Works%20Dark%20Mobile.png) |
| **Project Modal**<br>![Project Modal Light Desktop](screenshots/Portfolio%20Case%20Study%20Modal%20Desktop.png) | **Project Modal**<br>![Project Modal Dark Desktop](screenshots/Portfolio%20Case%20Study%20Modal%20Dark%20Desktop.png) | **Project Modal**<br>![Project Modal Light Mobile](screenshots/Portfolio%20Case%20Study%20Modal%20Mobile.png) | **Project Modal**<br>![Project Modal Dark Mobile](screenshots/Portfolio%20Case%20Study%20Modal%20Dark%20Mobile.png) |
| **About & Engineering Background**<br>![About Light Desktop](screenshots/Portfolio%20About%20Desktop.png) | **About & Engineering Background**<br>![About Dark Desktop](screenshots/Portfolio%20About%20Dark%20Desktop.png) | **About & Engineering Background**<br>![About Light Mobile](screenshots/Portfolio%20About%20Mobile.png) | **About & Engineering Background**<br>![About Dark Mobile](screenshots/Portfolio%20About%20Dark%20Mobile.png) |
| **Direct Contact & Socials**<br>![Contact Light Desktop](screenshots/Portfolio%20Contact%20Desktop.png) | **Direct Contact & Socials**<br>![Contact Dark Desktop](screenshots/Portfolio%20Contact%20Dark%20Desktop.png) | **Direct Contact & Socials**<br>![Contact Light Mobile](screenshots/Portfolio%20Contact%20Mobile.png) | **Direct Contact & Socials**<br>![Contact Dark Mobile](screenshots/Portfolio%20Contact%20Dark%20Mobile.png) |

---

## Fitur

- **Interactive WebGL Canvas**: Real-time field of 2,000 particles with an interactive 2D avatar plane rendered via Three.js (r128), featuring mouse-parallax tracking, scroll-linked vertical drift, and mode-adaptive material blending (`NormalBlending` for light mode and `AdditiveBlending` for dark mode).
- **Synchronized Smooth Scrolling**: Integrated Lenis smooth scrolling coupled directly with `gsap.ticker` and `ScrollTrigger` for scroll-linked element animations.
- **Dynamic Project Catalog (`projects.json`)**: Client-side rendering of `projects.json` into an animated grid with interactive case study modal overlays, live demo links, and GitHub source links. If the file cannot be loaded, the site falls back to a `localStorage` cache and then to the live GitHub REST API. Each modal renders the repository's full README with Marked.js.
- **Automated Project Sync (GitHub Actions)**: The `Daily Projects Sync` workflow runs every day at 00:00 WIB (and on manual dispatch), executes `scripts/fetch-projects.mjs` on Node.js 22, and commits the regenerated `projects.json`. For each repository it reads the README through the GitHub API (with a `raw.githubusercontent.com` fallback) and extracts the H1 title, the `>` blockquote tagline, shield badges (up to 5), the first 2 images, and the Live Demo link, then detects the tech label from the repository name. Forks and excluded repositories are skipped, and a priority order controls the grid sequence.
- **Coding News Feed (`/news`)**: A paginated archive (12 items per page) that reuses the showcase's glass cards, shared modal, Three.js canvas, theme switcher, and trilingual UI. Articles render from `news.json`; markdown bodies are parsed with Marked.js inside the same detail modal. Pagination is reflected in the URL (`?page=N`) and stays in sync with browser history.
- **News CMS (`/news/audit`)**: A local-first editor with search and status filters, a validation/audit panel (required fields, duplicate slugs, URL checks, AI-article structure), an audit log, JSON import/export, and a local preview that writes to `localStorage` and opens `/news?preview=1`. Publishing writes `news.json` through the GitHub Contents API with a fine-grained PAT kept in `sessionStorage`, and refuses to overwrite a feed that changed remotely.
- **AI-Assisted News Generation (GitHub Actions)**: The `Daily News Generation` workflow runs daily at 01:00 WIB and can be dispatched from the CMS with a topic, category, count, and language. `scripts/generate-news.mjs` supports any OpenAI-compatible endpoint or Gemini, asks for strict JSON, validates and deduplicates articles against existing slugs/titles, marks them with `source: "ai"` and the generating model, and commits the updated `news.json`. The public modal discloses AI assistance on those items.
- **Language Switcher (`translations.js`)**: Switches between Bahasa Indonesia (`id`), English (`en`), and Chinese Mandarin (`zh`) by swapping text in elements marked with `data-i18n` attributes from a plain JavaScript dictionary. The choice is saved in `localStorage` and the `<html lang>` attribute is updated.
- **Glitch Headline & Glass UI**: Animated glitch effect on the hero headline (`.glitch`) and frosted-glass panels (`backdrop-filter: blur`) on the about card, experience cards, and modal in dark mode. Light mode uses solid opaque panels on purpose to avoid GPU rendering issues over the WebGL canvas.
- **Tri-State Theme Switcher**: Persisted Light, Dark, and System theme preferences with dynamic `<meta name="theme-color">` updates and system `prefers-color-scheme` listeners.
- **Career History**: Experience list of professional software engineering roles at Manulife Indonesia, Indonesia Financial Group (IFG), and Geekgarden Indonesia. Each card opens the shared detail modal.
- **Custom Cursor Follower**: Decorative ring that follows the pointer with lerp smoothing through `gsap.ticker`. The system cursor stays visible.
- **SEO Metadata**: Open Graph tags, JSON-LD structured data, `sitemap.xml`, and `robots.txt`.

---

## Tech Stack

| Category | Technologies | Purpose |
| :--- | :--- | :--- |
| **Core Architecture** | Semantic HTML5, CSS3 Custom Properties, JavaScript | Lightweight foundation with design tokens (`data-theme`) and no build step; libraries are loaded from CDN |
| **3D & Graphics** | Three.js `r128` (0.128.0), WebGL Canvas | 2,000-point particle field and avatar plane with mouse parallax; additive blending in dark mode and normal blending in light mode. `GLTFLoader` is loaded but not used yet |
| **Scroll & Motion** | Lenis `1.0.19`, GSAP `3.12.2`, ScrollTrigger `3.12.2` | Momentum scrolling synced to `gsap.ticker` and scroll-linked element choreography |
| **Data & Content** | JSON (`projects.json`, `news.json`), Marked.js, Vanilla Fetch API | Static case study catalog and coding news feed with `localStorage` cache/fallback; README and markdown article bodies rendered in the shared modal |
| **Automation** | GitHub Actions (daily crons), Node.js 22, `scripts/fetch-projects.mjs`, `scripts/generate-news.mjs` | Regenerates `projects.json` from repository READMEs and generates audited AI news articles into `news.json`, committing both automatically |
| **Localization** | Manual JS dictionary (`translations.js`), `data-i18n` attributes | Client-side Indonesian, English, and Chinese text switching |
| **Typography & Design** | Google Fonts (Inter, Syncopate), CSS glass panels, glitch effect | Glassmorphism panels (`backdrop-filter` blur) and an animated glitch headline |

## Tutorial Run Local & Setup

### Project Structure

```bash
/
├── index.html            # Main portfolio layout and semantic landmark markup
├── style.css             # Unified CSS variables, dark/light tokens, and animations
├── script.js             # Lenis scroll, Three.js canvas, GSAP triggers, and modal logic
├── translations.js       # Indonesian, English & Chinese locale dictionary
├── projects.json         # Generated case studies, live links, and repository metadata (auto-updated daily)
├── news.json             # Published coding news feed (CMS + AI generator)
├── news/
│   ├── index.html        # /news archive: shared nav, card grid, pagination, modal
│   ├── news.css          # Page-specific styles layered over style.css
│   ├── news.js           # Feed loading, 12-per-page pagination, URL state, preview mode
│   └── audit/
│       ├── index.html    # /news/audit CMS (noindex)
│       ├── audit.css     # CMS chrome
│       └── audit.js      # Editor, validation, draft storage, publish, AI trigger
├── memoji.png            # Portrait graphic texture mapped to Three.js avatar plane
├── animoji.glb           # Reserved asset placeholder (not loaded yet)
├── scripts/
│   ├── fetch-projects.mjs        # Reads repository READMEs and generates projects.json
│   ├── generate-news.mjs         # Generates coding articles and updates news.json
│   └── generate-presentation.mjs # Builds a presentation from the screenshots
├── .github/workflows/
│   ├── update-projects.yml       # Daily Projects Sync (cron 00:00 WIB + manual dispatch)
│   └── update-news.yml           # Daily News Generation (cron 01:00 WIB + manual dispatch)
├── screenshots/          # High-resolution MacBook Pro M4 & iPhone 16 Pro mockups
├── v1/                   # Legacy version of the portfolio
├── CNAME                 # Custom apex domain routing (widifirmaan.web.id)
├── favicon.png           # Site icon
├── robots.txt            # Crawler rules
├── sitemap.xml           # Sitemap for search engines
└── README.md
```

### Prerequisites

No compilers, Node modules, or build configurations are required to run the site. Libraries are loaded from CDN (cdnjs and jsDelivr). Node.js 22 is only needed to regenerate content locally with `node scripts/fetch-projects.mjs` or `node scripts/generate-news.mjs` (optional `GITHUB_TOKEN` to avoid API rate limits).

### Local Development

> **Environment Variables:** No `.env` file or API keys are required to browse the site. Rendering, project loading, and news loading happen in the browser from the committed `projects.json` and `news.json`; the unauthenticated GitHub API fallback is subject to GitHub's rate limit.

```bash
# 1. Clone the repository
git clone https://github.com/widifirmaan/widifirmaan.github.io.git
cd widifirmaan.github.io

# 2. Start any local static web server
python3 -m http.server 8000
# or using Node.js:
npx serve .
```

Open [http://localhost:8000](http://localhost:8000) in your web browser.

### News CMS & AI Automation

- **Editor:** open `/news/audit/` and edit the working draft. Drafts and the audit log live in `localStorage`; nothing is written to the site until you publish or export.
- **Publish:** paste a fine-grained GitHub PAT with **Contents: read/write** and **Actions: read/write** for this repository, verify it, then press **Publish news.json**. The token is kept in `sessionStorage` only. Publishing aborts if `news.json` changed on GitHub after it was loaded, so AI-generated articles are not silently overwritten.
- **Manual fallback:** **Export news.json**, commit the file to the repository root, or use **Import JSON** to restore a previous export.
- **Preview:** **Pratinjau /news** writes the draft to `localStorage.news_preview` and opens `/news/?preview=1`; the public feed is untouched.
- **AI generation:** the **AI Generator** panel dispatches `update-news.yml` with an optional topic, category, count (1-3), and language, then polls the run and reloads the feed. The same workflow also runs daily at 01:00 WIB.

Repository configuration for `scripts/generate-news.mjs` and `update-news.yml`:

| Name | Kind | Required | Default | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `NEWS_AI_API_KEY` | Secret | Yes | — | API key for the selected provider. Without it the workflow logs a warning and exits without changing `news.json` |
| `NEWS_AI_PROVIDER` | Variable | No | `openai` | `openai` for any OpenAI-compatible endpoint, or `gemini` |
| `NEWS_AI_BASE_URL` | Variable | No | provider default | Override for proxies, Azure-compatible gateways, or self-hosted endpoints |
| `NEWS_AI_MODEL` | Variable | No | `gpt-4.1-mini` / `gemini-2.5-flash` | Model name sent to the provider |

Generated items carry `source: "ai"` and `model`, and the public modal shows a disclosure line. The generator rejects articles shorter than 400 characters, caps the feed at 120 items, and skips duplicate slugs and titles.

---

## Author

Made with ❤️ by **Widi Firmansyah** / [widifirmaan.web.id](https://widifirmaan.web.id)
