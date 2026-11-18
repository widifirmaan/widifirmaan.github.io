# widifirmaan.web.id

> Official personal portfolio website of Widi Firmansyah, featuring a real-time Three.js 3D viewport, Lenis smooth scrolling, bilingual i18n localization, and an interactive project catalog.

widifirmaan.web.id is the personal portfolio website of Widi Firmansyah, built with semantic HTML5, modern CSS, and Vanilla JavaScript (ES6+). It features an interactive 3D WebGL particle canvas powered by Three.js, smooth scrolling using Lenis and GSAP ScrollTrigger, bilingual English and Indonesian localization, and dynamic project indexing from `projects.json`.

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

| Desktop Light (MacBook Pro M4) | Desktop Dark (MacBook Pro M4) | Mobile Light (iPhone 16 Pro) | Mobile Dark (iPhone 16 Pro) |
| :---: | :---: | :---: | :---: |
| **Hero Stage**<br>![Hero Stage Light Desktop](screenshots/Portfolio%20Hero%20Desktop.png) | **Hero Stage**<br>![Hero Stage Dark Desktop](screenshots/Portfolio%20Hero%20Dark%20Desktop.png) | **Hero Stage**<br>![Hero Stage Light Mobile](screenshots/Portfolio%20Hero%20Mobile.png) | **Hero Stage**<br>![Hero Stage Dark Mobile](screenshots/Portfolio%20Hero%20Dark%20Mobile.png) |
| **Project Grid**<br>![Project Grid Light Desktop](screenshots/Portfolio%20Works%20Desktop.png) | **Project Grid**<br>![Project Grid Dark Desktop](screenshots/Portfolio%20Works%20Dark%20Desktop.png) | **Project Grid**<br>![Project Grid Light Mobile](screenshots/Portfolio%20Works%20Mobile.png) | **Project Grid**<br>![Project Grid Dark Mobile](screenshots/Portfolio%20Works%20Dark%20Mobile.png) |
| **Project Modal**<br>![Project Modal Light Desktop](screenshots/Portfolio%20Case%20Study%20Modal%20Desktop.png) | **Project Modal**<br>![Project Modal Dark Desktop](screenshots/Portfolio%20Case%20Study%20Modal%20Dark%20Desktop.png) | **Project Modal**<br>![Project Modal Light Mobile](screenshots/Portfolio%20Case%20Study%20Modal%20Mobile.png) | **Project Modal**<br>![Project Modal Dark Mobile](screenshots/Portfolio%20Case%20Study%20Modal%20Dark%20Mobile.png) |
| **About & Engineering Background**<br>![About Light Desktop](screenshots/Portfolio%20About%20Desktop.png) | **About & Engineering Background**<br>![About Dark Desktop](screenshots/Portfolio%20About%20Dark%20Desktop.png) | **About & Engineering Background**<br>![About Light Mobile](screenshots/Portfolio%20About%20Mobile.png) | **About & Engineering Background**<br>![About Dark Mobile](screenshots/Portfolio%20About%20Dark%20Mobile.png) |
| **Direct Contact & Socials**<br>![Contact Light Desktop](screenshots/Portfolio%20Contact%20Desktop.png) | **Direct Contact & Socials**<br>![Contact Dark Desktop](screenshots/Portfolio%20Contact%20Dark%20Desktop.png) | **Direct Contact & Socials**<br>![Contact Light Mobile](screenshots/Portfolio%20Contact%20Mobile.png) | **Direct Contact & Socials**<br>![Contact Dark Mobile](screenshots/Portfolio%20Contact%20Dark%20Mobile.png) |

---

## Features

- **Interactive 3D WebGL Canvas**: Real-time particle field and avatar model rendered via Three.js (r128) with mouse-parallax tracking and mode-adaptive material blending (`NormalBlending` for light mode and `AdditiveBlending` for dark mode).
- **Synchronized Smooth Scrolling**: Integrated Lenis smooth scrolling coupled directly with `gsap.ticker` and `ScrollTrigger` for scroll-linked element animations.
- **Dynamic Project Catalog (`projects.json`)**: Client-side project indexing with category filtering (All, Web App, Mobile, Template) and detailed modal overlays.
- **Bilingual Localization (`translations.js`)**: Real-time language switching between English and Bahasa Indonesia across all page sections, inputs, and modals.
- **Tri-State Theme Switcher**: Persisted Light, Dark, and System theme preferences with dynamic `<meta name="theme-color">` updates and system `prefers-color-scheme` listeners.
- **Career History Modal**: Detailed interactive modal highlighting professional software engineering roles at Manulife Indonesia, Indonesia Financial Group (IFG), and Geekgarden.
- **Custom Cursor Follower**: Smooth lerp cursor tracking with magnetic hover responses on interactive cards and navigation links.

---

## Tech Stack

| Category | Technologies | Purpose |
| :--- | :--- | :--- |
| **Core Architecture** | Semantic HTML5, CSS3 Custom Properties, Vanilla ES6+ | Lightweight foundation with zero compilation overhead |
| **3D & Graphics** | Three.js `r128`, WebGL Canvas | 3D model rendering and interactive particle field |
| **Scroll & Motion** | Lenis Smooth Scroll, GSAP, ScrollTrigger | Momentum scrolling and scroll-linked element choreography |
| **Data & Content** | JSON (`projects.json`), Vanilla Fetch API | Decoupled case study catalog with asynchronous rendering |
| **Localization** | Custom JS Dictionary (`translations.js`) | Instant client-side English & Indonesian translation dictionary |

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

## Tutorial Run Local & Setup

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

## Testing & QA Automation

Automated testing and QA verification are powered by the system's `qa-toolkit`:

### 1. Playwright Test Suite
End-to-end smoke verification covering 3D canvas viewport, hero brand typography, and dynamic `#works` project catalog rendering:

```bash
cd /home/widifirmaan/Projects/qa-toolkit
npx playwright test tests/playwright/portfolio.spec.js
```

### 2. Cypress E2E Verification
Cross-browser regression testing on DOM structure and production stability:

```bash
cd /home/widifirmaan/Projects/qa-toolkit
npx cypress run --spec cypress/e2e/portfolio.cy.js
```

### 3. QA Execution Summary
- **Playwright**: 2 tests passed (Brand Hero Header & Projects Catalog `#works` DOM Mount)
- **Cypress**: 2 specs passed (Homepage DOM Mount & Case Studies Verification)
- **Status**: ✅ All automated tests verified and passing

---

## Author

Made with ❤️ by **Widi Firmansyah** / [widifirmaan.web.id](https://widifirmaan.web.id)
