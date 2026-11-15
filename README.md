# Widi Firmansyah — Personal Portfolio

> Official personal portfolio and software engineering project showcase of Widi Firmansyah.

A fast, lightweight, and responsive personal portfolio website built with modern semantic HTML5, CSS3, and vanilla JavaScript. Deployed on GitHub Pages with custom domain edge delivery, featuring dynamic bilingual content (ID/EN), light and dark themes, and an interactive project catalog.

[![Live Demo](https://img.shields.io/badge/Demo-widifirmaan.web.id-10B981?style=flat-square&logo=cloudflare&logoColor=white)](https://widifirmaan.web.id)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--Build_Static-8B5CF6?style=flat-square)](#tech-stack)
[![Deployment](https://img.shields.io/badge/Deployment-GitHub_Pages-181717?style=flat-square&logo=github)](https://pages.github.com/)
[![HTML5](https://img.shields.io/badge/HTML5-Semantic_Web-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/)
[![CSS3](https://img.shields.io/badge/CSS3-Custom_Properties-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![License](https://img.shields.io/badge/License-MIT-3B82F6?style=flat-square)](LICENSE)

---

## Live Production

- **URL:** [https://widifirmaan.web.id](https://widifirmaan.web.id)
- **Deployment:** GitHub Pages (Custom apex domain `widifirmaan.web.id` via Cloudflare DNS)

---

## Showcase

| Desktop (MacBook Pro) | Mobile (iPhone 16 Pro) |
| :---: | :---: |
| **Portfolio Homepage Desktop**<br>![Portfolio Desktop](screenshots/Portfolio%20Desktop.png) | **Portfolio Homepage Mobile**<br>![Portfolio Mobile](screenshots/Portfolio%20Mobile.png) |

---

## Features

- **Zero-Build Architecture**: Pure vanilla HTML5, CSS3, and ES6+ JavaScript running directly in any modern browser without bundlers or transpilation overhead.
- **Dynamic Project Directory**: Projects and technical case studies are dynamically loaded from `projects.json`, with real-time category filtering, live demo links, source code links, and modal details.
- **Bilingual Internationalization (i18n)**: Instant client-side language toggle between Bahasa Indonesia and English (`translations.js`) with persistent user preference in `localStorage`.
- **Tactile Light & Dark Theme**: Custom CSS variable design system adapting to system preferences (`prefers-color-scheme`) with manual toggle and smooth transitions.
- **Performance & SEO Optimized**: Complete Open Graph protocol metadata, canonical links, semantic tags, Twitter Card cards, and clean sitemap for search indexing.

---

## Tech Stack

| Layer | Technologies | Description |
| :--- | :--- | :--- |
| **Markup** | HTML5 Semantic Elements | Accessible and responsive document structure |
| **Styling** | Modern CSS3 | Custom properties (CSS variables), Flexbox, CSS Grid, media queries |
| **Interactivity** | Vanilla JavaScript (ES6+) | DOM manipulation, async fetch API, theme & language state engines |
| **Data Store** | JSON (`projects.json`) | Centralized portfolio item metadata, badges, and project specs |
| **Hosting & DNS** | GitHub Pages + Cloudflare | Edge CDN delivery with custom domain SSL/TLS |

---

## Project Structure

```bash
/
├── index.html          # Main homepage layout and semantic markup
├── style.css           # Core stylesheet, theme variables, and responsive rules
├── script.js           # Interactive controller, project card rendering, modals
├── translations.js     # Bilingual dictionary (Indonesian & English)
├── projects.json       # Structured project catalog and badge data
├── screenshots/        # High-resolution Retina showcase mockups
├── raw_screenshots/    # Raw browser screen captures
├── CNAME               # Custom apex domain routing (widifirmaan.web.id)
├── sitemap.xml         # XML sitemap for search engines
├── robots.txt          # Crawler instructions
└── README.md
```

---

## Getting Started & Local Development

### Prerequisites
- Any modern web browser (Google Chrome, Firefox, Safari, Edge)
- Python 3, Node.js (npx serve), or VS Code Live Server for local testing

### Running Locally
```bash
# 1. Clone the repository
git clone https://github.com/widifirmaan/widifirmaan.github.io.git
cd widifirmaan.github.io

# 2. Start a local static file server
python3 -m http.server 8000
# or using npx:
# npx serve .
```
Open `http://localhost:8000` in your browser.

---

## Author

Developed with ❤️ by **Widi Firmansyah**.
