# WDPORT

Personal portfolio and multilingual coding news platform for Widi Firmansyah, featuring a Three.js particle canvas, Lenis + GSAP scroll choreography, tri-locale UI switching (`id`, `en`, `zh`), and a static site generator outputting `_site/`.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-r128-000000?style=flat-square&logo=threedotjs&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.12.2-88CE02?style=flat-square&logo=greensock&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)

## Live URL

- **Production**: [https://widifirmaan.web.id](https://widifirmaan.web.id)

## Features

- **Interactive Three.js WebGL Canvas (`script.js`)**: Particle field and interactive avatar texture (`memoji.png`) with mouse parallax, scroll vertical offset, and adaptive blending modes for light and dark themes.
- **Smooth Scrolling & Animations**: Lenis momentum scrolling synced to GSAP `ScrollTrigger` ticker animations plus decorative cursor follower.
- **Dynamic Project Catalog (`projects.json`)**: Grid populated from `projects.json` with `localStorage` fallback and live GitHub REST API fallback, opening full Markdown project READMEs via Marked.js inside a detail modal.
- **Multilingual Coding News & Static Generator (`scripts/build-pages.mjs`)**: Compiles news articles (`news/data/articles/*.json`, sharded indices, `news.json` fallback) into `_site/` with pre-rendered `/news/`, `/en/news/`, and `/zh/news/` feeds, per-article pages, Open Graph tags, JSON-LD `TechArticle`, and `sitemap.xml`.
- **Automated Daily Sync (`.github/workflows/update-projects.yml`)**: Runs `scripts/fetch-projects.mjs` daily (`00:00 WIB` / `17:00 UTC`) to update `projects.json` from repository READMEs, and `deploy-pages.yml` builds `_site/` onto GitHub Pages.
- **Tri-Locale Translation & Theme Switcher (`translations.js`, `ui-core.js`)**: Instant client-side switching across Indonesian (`id`), English (`en`), and Chinese (`zh`), paired with persistent Dark/Light/System theme modes.

## Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Core Frontend** | Semantic HTML5, CSS3, Vanilla JS | Portfolio layout, theme tokens (`data-theme`), and locale dictionary |
| **3D & Motion** | Three.js `r128`, GSAP `3.12.2`, ScrollTrigger, Lenis `1.0.19` | WebGL particle field and scroll-linked animations |
| **Content & Markdown** | Marked.js, `projects.json`, Sharded News JSON + `news.json` | Project README modals and multilingual news feeds |
| **Build & Automation** | Node.js `>=20` (`scripts/build-pages.mjs`, `fetch-projects.mjs`) | `_site/` static site build, `sitemap.xml` generation, and README sync |
| **CI / Hosting** | GitHub Actions, GitHub Pages, `vercel.json` | Scheduled sync + static deployment |

## Screenshots

| Desktop Light | Desktop Dark | Mobile Light | Mobile Dark |
| :---: | :---: | :---: | :---: |
| **Hero Stage**<br>![Hero Stage Light Desktop](screenshots/Portfolio%20Hero%20Desktop.png) | **Hero Stage**<br>![Hero Stage Dark Desktop](screenshots/Portfolio%20Hero%20Dark%20Desktop.png) | **Hero Stage**<br>![Hero Stage Light Mobile](screenshots/Portfolio%20Hero%20Mobile.png) | **Hero Stage**<br>![Hero Stage Dark Mobile](screenshots/Portfolio%20Hero%20Dark%20Mobile.png) |
| **Project Grid**<br>![Project Grid Light Desktop](screenshots/Portfolio%20Works%20Desktop.png) | **Project Grid**<br>![Project Grid Dark Desktop](screenshots/Portfolio%20Works%20Dark%20Desktop.png) | **Project Grid**<br>![Project Grid Light Mobile](screenshots/Portfolio%20Works%20Mobile.png) | **Project Grid**<br>![Project Grid Dark Mobile](screenshots/Portfolio%20Works%20Dark%20Mobile.png) |
| **Project Modal**<br>![Project Modal Light Desktop](screenshots/Portfolio%20Case%20Study%20Modal%20Desktop.png) | **Project Modal**<br>![Project Modal Dark Desktop](screenshots/Portfolio%20Case%20Study%20Modal%20Dark%20Desktop.png) | **Project Modal**<br>![Project Modal Light Mobile](screenshots/Portfolio%20Case%20Study%20Modal%20Mobile.png) | **Project Modal**<br>![Project Modal Dark Mobile](screenshots/Portfolio%20Case%20Study%20Modal%20Mobile.png) |
| **About & Experience**<br>![About Light Desktop](screenshots/Portfolio%20About%20Desktop.png) | **About & Experience**<br>![About Dark Desktop](screenshots/Portfolio%20About%20Dark%20Desktop.png) | **About & Experience**<br>![About Light Mobile](screenshots/Portfolio%20About%20Mobile.png) | **About & Experience**<br>![About Dark Mobile](screenshots/Portfolio%20About%20Dark%20Mobile.png) |
| **Contact & Footer**<br>![Contact Light Desktop](screenshots/Portfolio%20Contact%20Desktop.png) | **Contact & Footer**<br>![Contact Dark Desktop](screenshots/Portfolio%20Contact%20Dark%20Desktop.png) | **Contact & Footer**<br>![Contact Light Mobile](screenshots/Portfolio%20Contact%20Mobile.png) | **Contact & Footer**<br>![Contact Dark Mobile](screenshots/Portfolio%20Contact%20Dark%20Mobile.png) |

## Local Setup

### Prerequisites

- **Node.js `>=20`** (`22` used in CI) to build `_site/` (including generated `/news/` routes and `sitemap.xml`)
- **No database required** (uses static JSON files `projects.json`, `news/data/articles/*.json`, and `news.json`)

### Quick Start

```bash
git clone https://github.com/widifirmaan/widifirmaan.github.io.git
cd widifirmaan.github.io

# Build static output into _site/ and start local server on port 3000
npm run dev
```

Or build `_site/` manually and serve with Python:

```bash
npm run build
python3 -m http.server 8000 --directory _site
```

Open `http://localhost:3000` (or `http://localhost:8000` for Python) in your browser, or browse `/news/`, `/en/news/`, and `/zh/news/`.

To regenerate `projects.json` from local sibling repositories or GitHub (optional `GITHUB_TOKEN`):

```bash
npm run sync:projects
```

Optional environment variables:
- `SITE_URL`: Override canonical base URL used when building `_site/` (defaults to `https://widifirmaan.web.id`)
- `GITHUB_TOKEN`: Optional token for GitHub API rate-limit relief during `sync:projects`

## Author

**Widi Firmansyah** · [widifirmaan.web.id](https://widifirmaan.web.id)
