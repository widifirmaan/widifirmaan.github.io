import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const screenshotsDir = path.join(projectRoot, 'screenshots');
const downloadsDir = '/home/widifirmaan/Downloads';

function encodeImage(filename) {
  const filePath = path.join(screenshotsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Warning: Screenshot not found: ${filePath}`);
    return '';
  }
  const fileBuffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${fileBuffer.toString('base64')}`;
}

console.log('🌌 Encoding Portfolio website screenshots...');

const images = {
  heroDarkDesktop: encodeImage('Portfolio Hero Dark Desktop.png'),
  heroDarkMobile: encodeImage('Portfolio Hero Dark Mobile.png'),
  heroLightDesktop: encodeImage('Portfolio Hero Desktop.png'),
  worksDarkDesktop: encodeImage('Portfolio Works Dark Desktop.png'),
  worksDarkMobile: encodeImage('Portfolio Works Dark Mobile.png'),
  worksLightDesktop: encodeImage('Portfolio Works Desktop.png'),
  modalDarkDesktop: encodeImage('Portfolio Case Study Modal Dark Desktop.png'),
  modalDarkMobile: encodeImage('Portfolio Case Study Modal Dark Mobile.png'),
  aboutDarkDesktop: encodeImage('Portfolio About Dark Desktop.png'),
  aboutDarkMobile: encodeImage('Portfolio About Dark Mobile.png'),
  contactDarkDesktop: encodeImage('Portfolio Contact Dark Desktop.png'),
  contactDarkMobile: encodeImage('Portfolio Contact Dark Mobile.png'),
};

console.log('🎨 Constructing Creative Portfolio Presentation Deck HTML...');

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>widifirmaan.web.id - 3D WebGL Portfolio & Interactive Architecture</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-cosmic: #07090E;
      --bg-card: rgba(13, 17, 23, 0.85);
      --bg-surface: #111622;
      --border-cosmic: rgba(99, 102, 241, 0.25);
      --border-hairline: rgba(255, 255, 255, 0.08);
      --accent-indigo: #818CF8;
      --accent-cyan: #38BDF8;
      --accent-emerald: #10B981;
      --accent-violet: #C084FC;
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --radius-cosmic: 12px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      background-color: #020408;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--text-main);
      line-height: 1.4;
    }

    @page {
      size: 297mm 210mm;
      margin: 0;
    }

    .slide {
      width: 297mm;
      height: 210mm;
      page-break-after: always;
      position: relative;
      background: var(--bg-cosmic);
      display: flex;
      flex-direction: column;
      padding: 16mm 18mm;
      overflow: hidden;
      background-image: 
        radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.12) 0%, transparent 60%),
        radial-gradient(circle at 15% 85%, rgba(56, 189, 248, 0.08) 0%, transparent 60%),
        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 36px 36px, 36px 36px;
    }

    /* Ambient top glow */
    .slide::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #6366F1, #38BDF8, #818CF8, #C084FC);
      z-index: 50;
    }

    /* Header */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5mm;
      border-bottom: 1px solid var(--border-cosmic);
      padding-bottom: 3.5mm;
    }

    .brand-cluster {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .portfolio-pill {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid var(--accent-indigo);
      color: var(--accent-indigo);
      padding: 3px 12px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-radius: 20px;
    }

    .slide-section-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13.5px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .slide-page-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      background: var(--bg-surface);
      border: 1px solid var(--border-cosmic);
      color: var(--accent-cyan);
      padding: 3px 12px;
      border-radius: 20px;
    }

    /* Layout */
    .slide-body {
      display: grid;
      grid-template-columns: 1fr 1.35fr;
      gap: 22px;
      flex: 1;
      min-height: 0;
    }

    .slide-info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 0;
    }

    .headline-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .route-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-surface);
      border: 1px solid var(--border-hairline);
      padding: 3px 10px;
      width: fit-content;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      color: var(--accent-cyan);
      border-radius: 6px;
    }

    .slide-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 800;
      line-height: 1.15;
      color: #FFFFFF;
      letter-spacing: -0.02em;
    }

    .slide-subtitle {
      font-size: 12.5px;
      color: var(--text-muted);
      font-weight: 400;
      line-height: 1.5;
    }

    /* Feature Cards */
    .feature-blocks {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 10px 0;
    }

    .cosmic-card {
      background: var(--bg-card);
      border: 1px solid var(--border-cosmic);
      backdrop-filter: blur(12px);
      border-radius: 8px;
      padding: 11px 15px;
      border-left: 3px solid var(--accent-indigo);
    }

    .cosmic-card.cyan-border {
      border-left-color: var(--accent-cyan);
    }

    .cosmic-card.violet-border {
      border-left-color: var(--accent-violet);
    }

    .cosmic-card.emerald-border {
      border-left-color: var(--accent-emerald);
    }

    .card-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-text {
      font-size: 11px;
      line-height: 1.45;
      color: #CBD5E1;
    }

    /* Metrics Grid */
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .metric-box {
      background: var(--bg-card);
      border: 1px solid var(--border-cosmic);
      border-radius: 8px;
      padding: 7px 10px;
      text-align: center;
    }

    .metric-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px;
      font-weight: 800;
      color: var(--accent-cyan);
    }

    .metric-desc {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
    }

    /* Media Mockup */
    .slide-visual {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 0;
    }

    .device-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .desktop-frame {
      width: 90%;
      background: #0B0E14;
      border: 1px solid var(--border-cosmic);
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.7);
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .frame-bar {
      height: 24px;
      background: #101520;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      padding: 0 10px;
      gap: 6px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot.red { background: #FF5F56; }
    .dot.yellow { background: #FFBD2E; }
    .dot.green { background: #27C93F; }

    .url-chip {
      margin-left: 12px;
      background: #06090F;
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 1px 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      font-weight: 600;
      color: var(--accent-cyan);
      border-radius: 4px;
    }

    .desktop-img {
      width: 100%;
      height: auto;
      max-height: 380px;
      object-fit: contain;
      background: #0B0E14;
      display: block;
    }

    .mobile-frame {
      position: absolute;
      right: -8px;
      bottom: -12px;
      width: 27%;
      background: #0B0E14;
      border: 2px solid var(--border-cosmic);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.8);
      border-radius: 14px;
      overflow: hidden;
      z-index: 10;
    }

    .mobile-notch {
      height: 12px;
      background: #04060A;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .notch-speaker {
      width: 28px;
      height: 2px;
      background: #475569;
      border-radius: 2px;
    }

    .mobile-img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Footer */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border-cosmic);
      padding-top: 3.5mm;
      margin-top: 4mm;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #64748B;
      font-weight: 600;
    }

    /* Cover Slide */
    .cover-slide {
      background: 
        radial-gradient(circle at 75% 20%, rgba(99, 102, 241, 0.18) 0%, transparent 55%),
        #07090E;
      justify-content: space-between;
      padding: 18mm 20mm;
    }

    .cover-giant-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 48px;
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: #FFFFFF;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .cover-giant-title span {
      background: linear-gradient(90deg, #818CF8, #38BDF8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .cover-desc {
      font-size: 15.5px;
      line-height: 1.5;
      color: #94A3B8;
      font-weight: 400;
      max-width: 720px;
    }

    .cover-split {
      display: grid;
      grid-template-columns: 1.05fr 1fr;
      gap: 28px;
      align-items: center;
      margin: 10px 0;
    }

    .cover-specs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .cover-spec-card {
      background: var(--bg-card);
      border: 1px solid var(--border-cosmic);
      border-radius: 8px;
      padding: 12px 14px;
    }

    .cover-spec-k {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 700;
      color: var(--accent-cyan);
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    .cover-spec-v {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #FFFFFF;
    }

    /* Architecture Grid */
    .arch-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 10px;
      flex: 1;
    }

    .arch-col {
      background: var(--bg-card);
      border: 1px solid var(--border-cosmic);
      border-radius: 8px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .arch-col-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 12.5px;
      font-weight: 800;
      text-transform: uppercase;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border-cosmic);
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #FFFFFF;
    }

    .arch-item {
      background: #090D15;
      border: 1px solid var(--border-hairline);
      border-radius: 5px;
      padding: 8px 10px;
      font-size: 11px;
    }

    .arch-item-name {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: var(--accent-indigo);
      margin-bottom: 2px;
    }

    .arch-item-detail {
      font-size: 10px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* Closing Slide */
    .closing-slide {
      background: radial-gradient(circle at 50% 40%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), #07090E;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20mm;
      gap: 18px;
    }

    .closing-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -0.03em;
      text-transform: uppercase;
      color: #FFFFFF;
    }

    .closing-pills {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
      max-width: 760px;
    }

    .live-hero-card {
      background: var(--bg-card);
      border: 1px solid var(--accent-indigo);
      box-shadow: 0 12px 30px rgba(99, 102, 241, 0.2);
      border-radius: 8px;
      padding: 16px 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
    }

    .live-url-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 18px;
      font-weight: 800;
      color: var(--accent-cyan);
    }
  </style>
</head>
<body>

  <!-- ==================== SLIDE 01: COVER ==================== -->
  <div class="slide cover-slide">
    <div>
      <div style="display:flex; gap:12px; align-items:center;">
        <div class="portfolio-pill">CREATIVE DEVELOPER PORTFOLIO</div>
        <div class="route-pill">THREE.JS r128 • LENIS SCROLL • GSAP • i18n</div>
        <div class="portfolio-pill" style="border-color:#10B981; color:#10B981;">PRODUCTION DEPLOYED</div>
      </div>
      <div style="margin-top: 20px; max-width: 85%;">
        <div class="cover-giant-title">
          <span>WIDIFIRMAAN.WEB.ID</span><br>
          3D WEBGL PORTFOLIO & ENGINEERING HUB
        </div>
        <p class="cover-desc">
          Website portofolio rekayasa perangkat lunak interaktif menampilkan kanvas partikel WebGL Three.js, inersia scroll mulus Lenis, lokalisasi bilingual i18n ID/EN, state machine tema ganda, dan katalog proyek dinamis.
        </p>
      </div>
    </div>

    <div class="cover-split">
      <div class="cover-specs-grid">
        <div class="cover-spec-card">
          <div class="cover-spec-k">3D GRAPHICS ENGINE</div>
          <div class="cover-spec-v">Three.js r128 WebGL Canvas</div>
        </div>
        <div class="cover-spec-card">
          <div class="cover-spec-k">SCROLL INERTIA</div>
          <div class="cover-spec-v">Lenis + GSAP ScrollTrigger</div>
        </div>
        <div class="cover-spec-card">
          <div class="cover-spec-k">INTERNATIONALIZATION</div>
          <div class="cover-spec-v">Bilingual i18n (ID & EN)</div>
        </div>
        <div class="cover-spec-card">
          <div class="cover-spec-k">LIGHT / DARK THEME</div>
          <div class="cover-spec-v">CSS Custom Property Engine</div>
        </div>
      </div>

      <div style="position: relative;">
        <div class="desktop-frame" style="width: 100%;">
          <div class="frame-bar">
            <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
            <div class="url-chip">https://widifirmaan.web.id</div>
          </div>
          <img src="${images.heroDarkDesktop}" class="desktop-img" alt="Portfolio Cover">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>AUTHOR: WIDI FIRMANSYAH</div>
      <div>PROJECT: WIDIFIRMAAN PERSONAL PORTFOLIO</div>
      <div>PAGE 01 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 02: 3D HERO CANVAS ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="portfolio-pill">WEBGL STAGE</div>
        <div class="slide-section-title">THREE.JS 3D PARTICLE FIELD & HERO STAGE</div>
      </div>
      <div class="slide-page-badge">SLIDE 02</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">CANVAS: #webgl • THREE.JS r128</div>
          <h2 class="slide-title">Interactive 3D Particle Cloud & Dynamic Coordinates</h2>
          <p class="slide-subtitle">
            Latar belakang grafis 3D interaktif yang merespons koordinat kursor mouse pengguna secara halus melalui sistem inersia pegas (spring damping physics).
          </p>
        </div>

        <div class="feature-blocks">
          <div class="cosmic-card">
            <div class="card-label">✨ Hardware-Accelerated Particle Buffer</div>
            <div class="card-text">
              Ribuan titik partikel dirender menggunakan BufferGeometry dan PointsMaterial dengan optimasi GPU shader untuk menjaga kinerja stabil pada 60 FPS.
            </div>
          </div>
          <div class="cosmic-card cyan-border">
            <div class="card-label">📐 Responsive Camera Frustum Recalculation</div>
            <div class="card-text">
              Penyesuaian aspek rasio kamera perspektif otomatis saat orientasi layar atau ukuran viewport browser berubah pada desktop maupun ponsel.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">60 fps</div>
            <div class="metric-desc">WebGL Render</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">1000+</div>
            <div class="metric-desc">Particle Buffer</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Zero-Lag</div>
            <div class="metric-desc">Mouse Tracking</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">widifirmaan.web.id/#hero</div>
            </div>
            <img src="${images.heroDarkDesktop}" class="desktop-img" alt="Hero Dark Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.heroDarkMobile}" class="mobile-img" alt="Hero Dark Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>PORTFOLIO WEB ARCHITECTURE</div>
      <div>THREE.JS BUFFER GEOMETRY & VIEWPORT LOOP</div>
      <div>PAGE 02 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 03: WORKS GRID ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="portfolio-pill">PROJECTS CATALOG</div>
        <div class="slide-section-title">DYNAMIC PROJECT INDEXING & FILTER GRID</div>
      </div>
      <div class="slide-page-badge">SLIDE 03</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">DATA: projects.json • DYNAMIC INGESTION</div>
          <h2 class="slide-title">Modular Project Grid & Metadata Tagging</h2>
          <p class="slide-subtitle">
            Katalog showcase rekayasa perangkat lunak yang diindeks secara dinamis dari projects.json lengkap dengan tag teknologi, badge rilis, dan tautan repositori.
          </p>
        </div>

        <div class="feature-blocks">
          <div class="cosmic-card violet-border">
            <div class="card-label">📁 Automated Metadata Parsing</div>
            <div class="card-text">
              Struktur JSON terindeks memuat ringkasan arsitektur, stack framework (React, Next.js, Cloudflare, Go), dan tautan live deployment.
            </div>
          </div>
          <div class="cosmic-card">
            <div class="card-label">🔍 Live Categorical Filter Tabs</div>
            <div class="card-text">
              Filter kategori instan untuk memilah proyek berdasarkan domain Web Applications, Fullstack Systems, Creative Tools, dan Cloud Backends.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">13+</div>
            <div class="metric-desc">Web Projects</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-desc">JSON Decoupled</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Direct</div>
            <div class="metric-desc">Source Links</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">widifirmaan.web.id/#works</div>
            </div>
            <img src="${images.worksDarkDesktop}" class="desktop-img" alt="Works Dark Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.worksDarkMobile}" class="mobile-img" alt="Works Dark Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>PORTFOLIO WEB ARCHITECTURE</div>
      <div>DECOUPLED JSON INGESTION & CARD GENERATION</div>
      <div>PAGE 03 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 04: CASE STUDY MODAL ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="portfolio-pill">DEEP DIVE MODAL</div>
        <div class="slide-section-title">INTERACTIVE CASE STUDY MODAL & SPECS</div>
      </div>
      <div class="slide-page-badge">SLIDE 04</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">MODAL: #case-study-modal • ACCESSIBLE POPUP</div>
          <h2 class="slide-title">Engineering Deep-Dive & Architectural Specs</h2>
          <p class="slide-subtitle">
            Modal detail proyek interaktif yang membedah arsitektur teknis, sorotan fitur rekayasa, tangkapan layar antarmuka resolusi tinggi, dan tautan demo langsung.
          </p>
        </div>

        <div class="feature-blocks">
          <div class="cosmic-card cyan-border">
            <div class="card-label">📐 Architectural Breakdown Panels</div>
            <div class="card-text">
              Rincian komprehensif mengenai tantangan teknis, keputusan arsitektur frontend/backend, dan metrik performa masing-masing proyek web.
            </div>
          </div>
          <div class="cosmic-card">
            <div class="card-label">♿ Focus Trap & Body Scroll Lock</div>
            <div class="card-text">
              Manajemen interaksi modal yang mengunci scroll latar belakang dan menangani tombol Escape untuk aksesibilitas navigasi tanpa disorientasi.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Deep</div>
            <div class="metric-desc">Case Studies</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Locked</div>
            <div class="metric-desc">Scroll Lock</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Accessible</div>
            <div class="metric-desc">Escape / Overlay</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">widifirmaan.web.id/case-study</div>
            </div>
            <img src="${images.modalDarkDesktop}" class="desktop-img" alt="Case Study Modal Dark">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.modalDarkMobile}" class="mobile-img" alt="Case Study Modal Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>PORTFOLIO WEB ARCHITECTURE</div>
      <div>ACCESSIBLE MODAL LIFECYCLE & EVENT BUS</div>
      <div>PAGE 04 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 05: DUAL THEME ENGINE ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="portfolio-pill">THEME ENGINE</div>
        <div class="slide-section-title">LIGHT / DARK DUAL THEME ENGINE & STORAGE PERSISTENCE</div>
      </div>
      <div class="slide-page-badge">SLIDE 05</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">DOM: [data-theme] • ZERO-FLASH TRANSITION</div>
          <h2 class="slide-title">System-Aware Dark / Light Mode Architecture</h2>
          <p class="slide-subtitle">
            Mesin pergantian tema instan berbasis atribut data-theme pada elemen root HTML yang membaca preferensi OS dan mempertahankan pilihan via localStorage.
          </p>
        </div>

        <div class="feature-blocks">
          <div class="cosmic-card">
            <div class="card-label">⚡ Flash of Unstyled Theme (FOUT) Prevention</div>
            <div class="card-text">
              Script inisiasi tema berjalan di bagian paling atas dokumen HTML sebelum perenderan DOM, memastikan tidak ada kilatan putih saat memuat tema gelap.
            </div>
          </div>
          <div class="cosmic-card emerald-border">
            <div class="card-label">🎨 Synchronized WebGL Shaders</div>
            <div class="card-text">
              Kanvas 3D Three.js turut mendeteksi perubahan tema dan menyesuaikan warna titik partikel serta intensitas latar belakang secara harmonis.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Zero</div>
            <div class="metric-desc">Theme Flash</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Auto</div>
            <div class="metric-desc">OS Preference</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Sync</div>
            <div class="metric-desc">WebGL Sync</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">widifirmaan.web.id (Light Mode)</div>
            </div>
            <img src="${images.worksLightDesktop}" class="desktop-img" alt="Works Light Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.worksDarkMobile}" class="mobile-img" alt="Works Dark Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>PORTFOLIO WEB ARCHITECTURE</div>
      <div>CSS CUSTOM TOKENS & DOM ATTRIBUTE SWITCHER</div>
      <div>PAGE 05 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 06: BILINGUAL i18n ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="portfolio-pill">LOCALIZATION</div>
        <div class="slide-section-title">BILINGUAL i18n LOCALIZATION ENGINE (ID / EN)</div>
      </div>
      <div class="slide-page-badge">SLIDE 06</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">i18n: [data-i18n] • ZERO-RELOAD DICTIONARY</div>
          <h2 class="slide-title">Client-Side Bilingual Translation Engine</h2>
          <p class="slide-subtitle">
            Sistem pergantian bahasa instan antara Bahasa Indonesia dan Bahasa Inggris tanpa muat ulang halaman, menggunakan binding atribut data-i18n deklaratif.
          </p>
        </div>

        <div class="feature-blocks">
          <div class="cosmic-card violet-border">
            <div class="card-label">📖 In-Memory Key-Value Dictionary</div>
            <div class="card-text">
              Kamus terjemahan terstruktur yang memetakan seluruh string antarmuka (tentang saya, pengalaman, keahlian, dan tombol aksi) ke kunci teks unik.
            </div>
          </div>
          <div class="cosmic-card cyan-border">
            <div class="card-label">💾 Browser Locale Auto-Detection</div>
            <div class="card-text">
              Membaca preferensi bahasa navigator.language pengunjung saat pertama kali berkunjung dan menyimpan pilihan bahasa ke localStorage.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">ID / EN</div>
            <div class="metric-desc">Supported Locales</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">0 ms</div>
            <div class="metric-desc">Switch Latency</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-desc">Coverage Ratio</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">widifirmaan.web.id/#about</div>
            </div>
            <img src="${images.aboutDarkDesktop}" class="desktop-img" alt="About Dark Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.aboutDarkMobile}" class="mobile-img" alt="About Dark Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>PORTFOLIO WEB ARCHITECTURE</div>
      <div>DECLARATIVE DOM DATA-i18n OBSERVER</div>
      <div>PAGE 06 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 07: CONTACT & TELEMETRY ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="portfolio-pill" style="border-color:#10B981; color:#10B981;">CONTACT HUB</div>
        <div class="slide-section-title">DIRECT CONTACT PORTAL & VERIFIED SOCIAL ENDPOINTS</div>
      </div>
      <div class="slide-page-badge">SLIDE 07</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">SECTION: #contact • SECURE CHANNELS</div>
          <h2 class="slide-title">Direct Outreach Portal & Telemetry Links</h2>
          <p class="slide-subtitle">
            Pusat komunikasi profesional langsung yang menyediakan saluran surat elektronik (Email), GitHub profile, LinkedIn, dan Telegram dengan validasi rel="noopener".
          </p>
        </div>

        <div class="feature-blocks">
          <div class="cosmic-card emerald-border">
            <div class="card-label">📬 Mailto & Direct Outreach Integrations</div>
            <div class="card-text">
              Tautan kontak satu klik yang membuka klien email pengguna dengan subjek terformat, mempermudah diskusi peluang kerja sama dan perekrutan.
            </div>
          </div>
          <div class="cosmic-card">
            <div class="card-label">🛡️ Hardened Rel="noopener noreferrer" Security</div>
            <div class="card-text">
              Seluruh tautan eksternal dilindungi protokol keamanan web modern untuk mencegah serangan reverse tab-nabbing pada peramban pengguna.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Direct</div>
            <div class="metric-desc">Email Trigger</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Verified</div>
            <div class="metric-desc">Social Profiles</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-desc">Secure Links</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">widifirmaan.web.id/#contact</div>
            </div>
            <img src="${images.contactDarkDesktop}" class="desktop-img" alt="Contact Dark Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.contactDarkMobile}" class="mobile-img" alt="Contact Dark Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>PORTFOLIO WEB ARCHITECTURE</div>
      <div>SECURE OUTREACH & ENDPOINT VALIDATION</div>
      <div>PAGE 07 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 08: LENIS SCROLL & GSAP ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="portfolio-pill">MOTION PIPELINE</div>
        <div class="slide-section-title">LENIS SMOOTH SCROLL & GSAP SCROLLTRIGGER</div>
      </div>
      <div class="slide-page-badge">SLIDE 08</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">ENGINE: LENIS + GSAP • INERTIAL PHYSICS</div>
          <h2 class="slide-title">Normalized Inertial Scrolling & Motion Pipeline</h2>
          <p class="slide-subtitle">
            Pengalaman berselancar web yang luar biasa mulus berkat sinkronisasi Lenis smooth scrolling dan GSAP ScrollTrigger untuk animasi kemunculan elemen.
          </p>
        </div>

        <div class="feature-blocks">
          <div class="cosmic-card cyan-border">
            <div class="card-label">🌊 Lenis Smooth Scroll Engine</div>
            <div class="card-text">
              Menormalkan akselerasi roda mouse dan trackpad pada peramban Windows maupun macOS, menghasilkan gerakan scroll inersial yang lembut dan responsif.
            </div>
          </div>
          <div class="cosmic-card">
            <div class="card-label">🎯 GSAP ScrollTrigger Synchronization</div>
            <div class="card-text">
              Pemicu timeline animasi elemen teks, garis pembatas, dan kartu portofolio yang disinkronkan tepat saat elemen memasuki viewport browser.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">60 fps</div>
            <div class="metric-desc">Scroll Inertia</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Normalized</div>
            <div class="metric-desc">Wheel Events</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">GSAP</div>
            <div class="metric-desc">Trigger Timelines</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">widifirmaan.web.id (Scroll Physics)</div>
            </div>
            <img src="${images.worksDarkDesktop}" class="desktop-img" alt="Scroll Physics Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.worksDarkMobile}" class="mobile-img" alt="Scroll Physics Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>PORTFOLIO WEB ARCHITECTURE</div>
      <div>INERTIAL SCROLL INTERPOLATION & RAF LOOP</div>
      <div>PAGE 08 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 09: SYSTEM ARCHITECTURE ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="portfolio-pill">TECH STACK</div>
        <div class="slide-section-title">FULLSTACK RUNTIME & WEB ARCHITECTURE</div>
      </div>
      <div class="slide-page-badge">SLIDE 09</div>
    </div>

    <div style="margin-bottom: 8px;">
      <h2 class="slide-title">Zero-Dependency Architecture & Performance Topology</h2>
      <p class="slide-subtitle">
        Arsitektur web modern yang dibangun di atas fondasi Vanilla JavaScript ES6+, memadukan grafis 3D WebGL, inersia scroll mutakhir, dan skor Lighthouse optimal.
      </p>
    </div>

    <div class="arch-grid">
      <!-- 3D & Graphics -->
      <div class="arch-col">
        <div class="arch-col-title">
          <span>01. GRAPHICS & MOTION</span>
          <span style="color:var(--accent-indigo);">●</span>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Three.js r128</div>
          <div class="arch-item-detail">Inti render WebGL untuk kanvas partikel 3D dengan alokasi buffer geometry performa tinggi.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Lenis Scroll</div>
          <div class="arch-item-detail">Library scroll inersial ringan tanpa ketergantungan framework yang menyajikan gerakan halus.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">GSAP ScrollTrigger</div>
          <div class="arch-item-detail">Orkestrasi animasi viewport canggih dengan kontrol scrub, toggle actions, dan pin pinning.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Glassmorphism UI</div>
          <div class="arch-item-detail">Sistem visual modern dengan backdrop blur berlapis dan hairline border bernuansa kosmik.</div>
        </div>
      </div>

      <!-- Core Runtime -->
      <div class="arch-col">
        <div class="arch-col-title">
          <span>02. VANILLA CORE RUNTIME</span>
          <span style="color:var(--accent-cyan);">●</span>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Vanilla ES6+ Modules</div>
          <div class="arch-item-detail">Bebas overhead framework berat (zero virtual-DOM diffing overhead), menjamin startup kilat.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Decoupled projects.json</div>
          <div class="arch-item-detail">Pemisahan data proyek dari markup tampilan mempermudah pembaruan portofolio berkelanjutan.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">i18n Translation Matrix</div>
          <div class="arch-item-detail">Engine terjemahan berbasis data attribute yang mengganti konten tanpa reload browser.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Dark / Light Engine</div>
          <div class="arch-item-detail">Manajemen state tema visual tersinkronisasi antara DOM dan shader WebGL 3D.</div>
        </div>
      </div>

      <!-- Delivery Tier -->
      <div class="arch-col">
        <div class="arch-col-title">
          <span>03. CLOUD DEPLOYMENT</span>
          <span style="color:var(--accent-emerald);">●</span>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">GitHub Pages Edge</div>
          <div class="arch-item-detail">Penyajian berkas statis terdistribusi pada CDN global dengan sertifikat SSL otomatis.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Custom Domain Routing</div>
          <div class="arch-item-detail">Konfigurasi DNS CNAME mandiri mengarahkan domain widifirmaan.web.id dengan latensi rendah.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">100% Lighthouse Score</div>
          <div class="arch-item-detail">Pengoptimalan aset statis, font swap, dan kompresi menghasilkan performa maksimal.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Playwright E2E Suite</div>
          <div class="arch-item-detail">Rangkaian pengujian otomatis memastikan seluruh interaksi modal dan tema lulus uji 100%.</div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>PORTFOLIO WEB ARCHITECTURE</div>
      <div>CORE TECH STACK & SYSTEM TOPOLOGY</div>
      <div>PAGE 09 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 10: CLOSING ==================== -->
  <div class="slide closing-slide">
    <div class="portfolio-pill" style="font-size:12px; padding:6px 16px;">
      OFFICIAL PERSONAL PORTFOLIO
    </div>
    <h1 class="closing-title">INTERACTIVE 3D WEBGL PORTFOLIO<br>& ENGINEERING SHOWCASE</h1>
    
    <p style="font-size: 15px; color: #94A3B8; max-width: 680px; font-weight: 500; line-height: 1.5;">
      Etalase rekayasa perangkat lunak modern yang memadukan keindahan grafis 3D WebGL Three.js, inersia scroll mulus Lenis, dukungan dwibahasa terpadu, dan arsitektur vanilla tanpa overhead server.
    </p>

    <div class="closing-pills">
      <div class="cosmic-card" style="padding: 6px 14px; font-weight: 800; font-size: 11px;">🌌 THREE.JS WEBGL</div>
      <div class="cosmic-card cyan-border" style="padding: 6px 14px; font-weight: 800; font-size: 11px;">🌊 LENIS SCROLL</div>
      <div class="cosmic-card violet-border" style="padding: 6px 14px; font-weight: 800; font-size: 11px;">🌐 BILINGUAL i18n</div>
      <div class="cosmic-card emerald-border" style="padding: 6px 14px; font-weight: 800; font-size: 11px;">🌗 DUAL THEME</div>
      <div class="cosmic-card" style="padding: 6px 14px; font-weight: 800; font-size: 11px;">⚡ 100% LIGHTHOUSE</div>
    </div>

    <div class="live-hero-card">
      <div style="font-family:'Space Grotesk',sans-serif; font-size:11px; font-weight:700; color:#94A3B8; letter-spacing:0.08em; text-transform:uppercase;">
        LIVE PRODUCTION ENVIRONMENT
      </div>
      <div class="live-url-text">https://widifirmaan.web.id</div>
      <div style="font-size:11px; color:#94A3B8; font-weight:500;">
        Crafted with Three.js r128 • Lenis • GSAP ScrollTrigger • Vanilla JavaScript
      </div>
    </div>

    <div class="slide-footer" style="width: 100%; margin-top: 15px;">
      <div>ENGINEERED BY WIDI FIRMANSYAH</div>
      <div>PRODUCTION-READY WEB PLATFORM</div>
      <div>PAGE 10 / 10</div>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(projectRoot, 'presentation.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`📄 Presentation HTML written to: ${htmlFilePath}`);

console.log('🚀 Launching Chromium with Playwright to render Portfolio PDF...');

async function renderPDF() {
  const playwrightPath = '/home/widifirmaan/Projects/qa-toolkit/node_modules/playwright/index.mjs';
  const { chromium } = await import(playwrightPath);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlFilePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const slidePdfPath = path.join(downloadsDir, 'Portfolio.pdf');
  const continuousPdfPath = path.join(downloadsDir, 'Portfolio-Continuous.pdf');

  // 1. Multi-Page Deck Mode (10 Slides A4 Landscape)
  console.log('🖨️  Rendering Multi-Page A4 Landscape Presentation PDF (Slide Mode)...');
  await page.pdf({
    path: slidePdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
  });

  // 2. Continuous Poster Mode (Single tall scroll)
  console.log('📜 Rendering Continuous Single-Scroll Showcase PDF (Poster Mode)...');
  await page.addStyleTag({
    content: `
      @page {
        size: auto;
        margin: 0;
      }
      body {
        background: #07090E !important;
      }
      .slide {
        page-break-after: unset !important;
        page-break-inside: avoid !important;
        margin-bottom: 0px !important;
        box-shadow: none !important;
      }
    `
  });

  await page.waitForTimeout(500);

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.pdf({
    path: continuousPdfPath,
    width: '1428px',
    height: `${scrollHeight}px`,
    printBackground: true,
    pageRanges: '1',
  });

  await browser.close();

  const slideStat = fs.statSync(slidePdfPath);
  const contStat = fs.statSync(continuousPdfPath);

  console.log('\n================================================================================');
  console.log('🎉 PORTFOLIO WEB ARCHITECTURE PDFS SUCCESSFULLY GENERATED!');
  console.log(`📦 Multi-Page Deck (Slides)   : ${(slideStat.size / 1024 / 1024).toFixed(2)} MB (10 Pages A4 Landscape)`);
  console.log(`   -> Saved: ${slidePdfPath}`);
  console.log(`📦 Continuous Poster (Scroll) : ${(contStat.size / 1024 / 1024).toFixed(2)} MB (1 Long Showcase Page)`);
  console.log(`   -> Saved: ${continuousPdfPath}`);
  console.log('================================================================================\n');
}

renderPDF().catch((err) => {
  console.error('❌ Error during PDF generation:', err);
  process.exit(1);
});
