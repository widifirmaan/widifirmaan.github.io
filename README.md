# widifirmaan.web.id

> Official personal portfolio website of Widi Firmansyah, featuring a real-time Three.js 3D viewport, bilingual i18n localization, and an interactive project catalog.

This repository powers the production deployment of [https://widifirmaan.web.id](https://widifirmaan.web.id), built entirely with zero frontend build tools or framework overhead. It implements high-performance Vanilla JavaScript, CSS custom properties, asynchronous project indexing via `projects.json`, client-side i18n routing, and an interactive 3D WebGL animoji canvas.

[![Live Demo](https://img.shields.io/badge/Demo-widifirmaan.web.id-10B981?style=flat-square&logo=googlechrome&logoColor=white)](https://widifirmaan.web.id)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--Dependency_Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#features)
[![3D Engine](https://img.shields.io/badge/3D_Engine-Three.js_r128-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Localization](https://img.shields.io/badge/i18n-ID_%7C_EN-007ACC?style=flat-square)](#features)
[![Performance](https://img.shields.io/badge/Lighthouse-100%25_Performance-success?style=flat-square)](#features)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## Live Production

- **URL:** [https://widifirmaan.web.id](https://widifirmaan.web.id)
- **Deployment:** GitHub Pages + Custom Domain CDN (`CNAME: widifirmaan.web.id`)

---

## Showcase

| Desktop Interface | Mobile Interface |
| :---: | :---: |
| **Hero Stage & 3D Memoji Desktop**<br>![Hero Stage Desktop](screenshots/Portfolio%20Hero%20Desktop.png) | **Hero Stage Mobile**<br>![Hero Stage Mobile](screenshots/Portfolio%20Hero%20Mobile.png) |
| **Selected Works Filterable Grid Desktop**<br>![Selected Works Desktop](screenshots/Portfolio%20Works%20Desktop.png) | **Selected Works Mobile**<br>![Selected Works Mobile](screenshots/Portfolio%20Works%20Mobile.png) |
| **Project Case Study Modal Desktop**<br>![Project Modal Desktop](screenshots/Portfolio%20Case%20Study%20Modal%20Desktop.png) | **Project Case Study Modal Mobile**<br>![Project Modal Mobile](screenshots/Portfolio%20Case%20Study%20Modal%20Mobile.png) |
| **About & Engineering Background Desktop**<br>![About Desktop](screenshots/Portfolio%20About%20Desktop.png) | **About & Engineering Background Mobile**<br>![About Mobile](screenshots/Portfolio%20About%20Mobile.png) |
| **Direct Contact & Socials Desktop**<br>![Contact Desktop](screenshots/Portfolio%20Contact%20Desktop.png) | **Direct Contact & Socials Mobile**<br>![Contact Mobile](screenshots/Portfolio%20Contact%20Mobile.png) |

---

## Core Features

- **Zero-Dependency Vanilla Stack**: Pure semantic HTML5, modern CSS3 (Custom Properties & Flex/Grid), and Vanilla ES6+ modules with zero build step requirements.
- **Interactive 3D WebGL Canvas**: Embedded Three.js r128 viewport rendering a customized GLTF 3D model with mouse tracking, touch responsiveness, and ambient lighting.
- **Dynamic Project Catalog**: Dynamic asynchronous project rendering loaded from `projects.json`, supporting instant category filtering (All, Web Apps, Mobile, UI/UX, Open Source).
- **Interactive Case Study Modal**: Deep-dive project modal showcasing live links, source repositories, tech tags, and detailed engineering architecture write-ups.
- **Bilingual i18n Localization**: Instant client-side language toggle supporting Bahasa Indonesia (`id`) and English (`en`) backed by `translations.js`.
- **System Theme Auto-Detection**: Supports Dark Mode, Light Mode, and System Theme preference with persistent `localStorage` synchronization.

---

## Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Markup & Semantics** | HTML5 | Accessible landmark roles, meta tags, and structured microdata |
| **Styling & Design** | CSS3 | Custom properties, responsive CSS grid, glassmorphism UI |
| **3D Rendering** | Three.js `r128` | WebGL canvas with GLTFLoader and OrbitControls integration |
| **Client Scripting** | Vanilla ES6+ | Native DOM operations, intersection observers, and event delegation |
| **Data Architecture** | JSON | Decoupled project metadata storage (`projects.json`) |
| **Deployment** | GitHub Pages | Fast CDN delivery with custom DNS routing via Cloudflare |

---

## Project Structure

```text
widifirmaan.github.io/
├── index.html            # Main portfolio layout and semantic markup
├── style.css             # Unified stylesheets and responsive design tokens
├── script.js             # Core DOM interactions, Three.js runtime, and catalog logic
├── translations.js       # Indonesian & English i18n locale dictionary
├── projects.json         # Structured project case studies and repository metadata
├── animoji.glb           # 3D GLTF binary model asset for WebGL canvas
├── memoji.png            # Fallback 2D portrait asset
├── raw_screenshots/      # High-resolution production screen captures
└── screenshots/          # MacBook Pro M4 & iPhone 16 Pro showcase mockups
```

---

## Getting Started & Local Development

### Prerequisites

No compilers, package managers, or build steps required. All dependencies are loaded natively.

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/widifirmaan/widifirmaan.github.io.git
   cd widifirmaan.github.io
   ```

2. **Start a local development server**:
   Any lightweight static server will work:
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Or using Node.js npx
   npx serve .
   ```

3. **Open in browser**:
   Navigate to [http://localhost:8000](http://localhost:8000).

---

## License

This project is licensed under the [MIT License](LICENSE).
