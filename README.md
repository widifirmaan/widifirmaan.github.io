# widifirmaan.web.id

> Official personal portfolio website of Widi Firmansyah, featuring a real-time Three.js 3D viewport, Lenis smooth scrolling, bilingual i18n localization, and an interactive project catalog.

This repository powers the production deployment of [https://widifirmaan.web.id](https://widifirmaan.web.id), engineered with zero build tools or framework overhead. Built with high-performance Vanilla ES6+ JavaScript, Studio Freight Lenis smooth scrolling, GSAP ScrollTrigger timeline synchronization, dynamic asynchronous project indexing via `projects.json`, client-side i18n localization, and an interactive 3D WebGL animoji canvas.

[![Live Demo](https://img.shields.io/badge/Demo-widifirmaan.web.id-10B981?style=flat-square&logo=googlechrome&logoColor=white)](https://widifirmaan.web.id)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--Dependency_Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#features)
[![3D Engine](https://img.shields.io/badge/3D_Engine-Three.js_r128-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Motion](https://img.shields.io/badge/Scroll-Lenis_%26_GSAP-88CE02?style=flat-square&logo=greensock&logoColor=white)](https://gsap.com/)
[![Localization](https://img.shields.io/badge/i18n-ID_%7C_EN-007ACC?style=flat-square)](#features)
[![Performance](https://img.shields.io/badge/Lighthouse-100%25_Performance-success?style=flat-square)](#features)

---

## Live Production

- **URL:** [https://widifirmaan.web.id](https://widifirmaan.web.id)
- **Deployment:** GitHub Pages + Custom Domain CDN (`CNAME: widifirmaan.web.id`)

---

## Showcase

| Desktop Interface (MacBook Pro M4) | Mobile Interface (iPhone 16 Pro) |
| :---: | :---: |
| **Hero Stage & 3D Memoji Desktop**<br>![Hero Stage Desktop](screenshots/Portfolio%20Hero%20Desktop.png) | **Hero Stage Mobile**<br>![Hero Stage Mobile](screenshots/Portfolio%20Hero%20Mobile.png) |
| **Selected Works Filterable Grid Desktop**<br>![Selected Works Desktop](screenshots/Portfolio%20Works%20Desktop.png) | **Selected Works Mobile**<br>![Selected Works Mobile](screenshots/Portfolio%20Works%20Mobile.png) |
| **Project Case Study Modal Desktop**<br>![Project Modal Desktop](screenshots/Portfolio%20Case%20Study%20Modal%20Desktop.png) | **Project Case Study Modal Mobile**<br>![Project Modal Mobile](screenshots/Portfolio%20Case%20Study%20Modal%20Mobile.png) |
| **About & Engineering Background Desktop**<br>![About Desktop](screenshots/Portfolio%20About%20Desktop.png) | **About & Engineering Background Mobile**<br>![About Mobile](screenshots/Portfolio%20About%20Mobile.png) |
| **Direct Contact & Socials Desktop**<br>![Contact Desktop](screenshots/Portfolio%20Contact%20Desktop.png) | **Direct Contact & Socials Mobile**<br>![Contact Mobile](screenshots/Portfolio%20Contact%20Mobile.png) |

---

## Features

- **Zero-Dependency Native Architecture**: Built with 100% semantic HTML5, modern CSS custom properties, and native ES6+ modules running directly in browsers with zero bundler or compilation overhead.
- **Synchronized Lenis & GSAP Scroll Engine**: Integrated `@studio-freight/lenis` smooth vertical scrolling coupled directly with `gsap.ticker` and `ScrollTrigger` updates for fluid 60fps kinetic parallax choreography.
- **Real-Time Three.js WebGL Particle Viewport**: Interactive 3D WebGL canvas rendering custom particle field geometry with real-time mouse tracking and mode-adaptive blending (`NormalBlending` for light mode vs `AdditiveBlending` for dark mode).
- **Dynamic Case Study Catalog (`projects.json`)**: Non-blocking client-side project fetching with instantaneous category filtering across Web Applications, Mobile, UI/UX, and Open Source software.
- **Interactive Career Case Study Modal**: Deep-dive animated modal detailing professional backend engineering experience at Manulife Indonesia, Indonesia Financial Group (IFG), and Geekgarden.
- **Bilingual i18n Localization Engine (`translations.js`)**: Real-time client-side language switching between English (`en`) and Bahasa Indonesia (`id`) with instant DOM updates and persistent language preferences.
- **Tri-State Theme Manager**: Tactile switcher cycling between Light, Dark, and System states with dynamic `<meta name="theme-color">` updates, media query listeners, and Three.js material synchronization.
- **Custom Cursor Follower & Micro-Interactions**: Smooth lerp cursor tracking with magnetic hover responses across interactive project cards and navigation links.

---

## Tech Stack

| Category | Technologies | Purpose |
| :--- | :--- | :--- |
| **Core Architecture** | Semantic HTML5, CSS3 Custom Properties, Vanilla ES6+ | Lightweight foundation with zero compilation overhead |
| **3D & Graphics** | Three.js `r128`, WebGL Canvas | 3D GLTF asset rendering and responsive particle physics |
| **Scroll & Motion** | Lenis Smooth Scroll, GSAP, ScrollTrigger | Momentum scrolling and scroll-linked element choreography |
| **Data & Content** | JSON (`projects.json`), Vanilla Fetch API | Decoupled case study catalog with asynchronous rendering |
| **Localization** | Custom JS Dictionary (`translations.js`) | Instant client-side English & Indonesian translation dictionary |
| **Deployment & Hosting** | GitHub Pages, Cloudflare DNS | Edge CDN static delivery with custom domain SSL routing |

---

## Project Structure

```bash
/
├── index.html            # Main portfolio layout and semantic landmark markup
├── style.css             # Unified CSS variables, dark/light tokens, and animations
├── script.js             # Lenis scroll, Three.js canvas, GSAP triggers, and modal logic
├── translations.js       # Indonesian & English bilingual locale dictionary
├── projects.json         # Decoupled case studies, live links, and repository metadata
├── animoji.glb           # 3D GLTF binary model for WebGL canvas
├── memoji.png            # Optimized 2D fallback portrait graphic
├── screenshots/          # High-resolution MacBook Pro M4 & iPhone 16 Pro mockups
├── CNAME                 # Custom apex domain routing (widifirmaan.web.id)
└── README.md
```

---

## Getting Started & Local Development

### Prerequisites

No compilers, Node modules, or build configurations required. All libraries are self-contained.

### Local Development

> **Environment Variables:** No `.env` file or external API keys are required. All asset loading, 3D rendering, and project indexing run 100% locally in the browser.

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

---

## Author

Developed by **[Widi Firmansyah](https://widifirmaan.web.id)**.
