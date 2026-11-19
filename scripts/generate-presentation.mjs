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
    console.warn(`Screenshot tidak ditemukan: ${filePath}`);
    return '';
  }
  const fileBuffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${fileBuffer.toString('base64')}`;
}

console.log('Memproses screenshot Portfolio Widi...');

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

console.log('Menyusun HTML dokumen presentasi Portfolio...');

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
      --bg-card: #0F131E;
      --bg-surface: #171E2F;
      --border-card: #1D2436;
      --border-glow: #2D374D;
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --accent-violet: #8B5CF6;
      --accent-cyan: #06B6D4;
      --accent-emerald: #10B981;
      --accent-indigo: #6366F1;
      --accent-rose: #F43F5E;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      background-color: #030407;
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
        radial-gradient(circle at 80% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
        radial-gradient(circle at 10% 100%, rgba(6, 182, 212, 0.06) 0%, transparent 50%),
        linear-gradient(to right, rgba(29, 36, 54, 0.2) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(29, 36, 54, 0.2) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 32px 32px, 32px 32px;
    }

    .slide::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-violet), var(--accent-cyan), var(--accent-emerald));
      z-index: 50;
    }

    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5mm;
      border-bottom: 1px solid var(--border-card);
      padding-bottom: 3.5mm;
    }

    .brand-cluster {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-badge {
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid var(--accent-violet);
      color: #C4B5FD;
      padding: 4px 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-radius: 4px;
    }

    .slide-section-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .slide-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: var(--accent-violet);
    }

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

    .slide-title {
      font-size: 24px;
      font-weight: 800;
      line-height: 1.2;
      color: #FFFFFF;
      letter-spacing: -0.02em;
    }

    .slide-desc {
      font-size: 12.5px;
      color: var(--text-muted);
      line-height: 1.55;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 10px 0;
    }

    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 8px;
      padding: 10px 14px;
      border-left: 3px solid var(--accent-violet);
    }

    .feature-card.cyan {
      border-left-color: var(--accent-cyan);
    }

    .feature-card.emerald {
      border-left-color: var(--accent-emerald);
    }

    .feature-card.indigo {
      border-left-color: var(--accent-indigo);
    }

    .feature-card-title {
      font-size: 12.5px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 3px;
      letter-spacing: -0.01em;
    }

    .feature-card-text {
      font-size: 11px;
      color: var(--text-muted);
      line-height: 1.45;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .metric-box {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 6px;
      padding: 8px 10px;
      text-align: center;
    }

    .metric-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      font-weight: 800;
      color: var(--accent-violet);
    }

    .metric-lbl {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .visual-stage {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      min-height: 0;
    }

    .screenshot-desktop {
      max-width: 95%;
      max-height: 380px;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.6));
    }

    .screenshot-mobile {
      position: absolute;
      right: 0px;
      bottom: -8px;
      max-height: 280px;
      max-width: 28%;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 16px 32px rgba(0, 0, 0, 0.7));
    }

    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 5mm;
      border-top: 1px solid var(--border-card);
      padding-top: 3mm;
    }

    .footer-tech {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--text-muted);
    }

    .footer-url {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--accent-violet);
    }

    /* Cover Styling */
    .cover-body {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 30px;
      align-items: center;
      flex: 1;
      min-height: 0;
    }

    .cover-tagline {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: var(--accent-violet);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .cover-title {
      font-size: 38px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 14px;
    }

    .cover-desc {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .cover-specs {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .spec-card {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 8px;
      padding: 10px 14px;
    }

    .spec-k {
      font-size: 9px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .spec-v {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      color: #FFFFFF;
      margin-top: 2px;
    }

    /* Architecture Grid */
    .arch-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      flex: 1;
      min-height: 0;
      margin-top: 10px;
    }

    .arch-card {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 10px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .arch-title {
      font-size: 14px;
      font-weight: 800;
      color: #FFFFFF;
      border-bottom: 1px solid var(--border-card);
      padding-bottom: 8px;
    }

    .arch-item {
      font-size: 11px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .arch-item strong {
      color: #FFFFFF;
    }
  </style>
</head>
<body>

  <!-- SLIDE 1: COVER -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">DEVELOPER PORTFOLIO</span>
        <span class="slide-section-title">Dokumentasi Rekayasa Perangkat Lunak</span>
      </div>
      <div class="slide-number">01 / 10</div>
    </div>

    <div class="cover-body">
      <div>
        <div class="cover-tagline">3D WebGL & Motion Architecture</div>
        <h1 class="cover-title">widifirmaan.web.id Portofolio Rekayasa Web</h1>
        <p class="cover-desc">
          Website portofolio interaktif yang mengintegrasikan Three.js particle field, animasi scroll Lenis & GSAP, modal studi kasus teknis mendalam, serta dukungan bilingual dan dual tema gelap-terang.
        </p>

        <div class="cover-specs">
          <div class="spec-card">
            <div class="spec-k">3D Graphics Engine</div>
            <div class="spec-v">Three.js WebGL Particle</div>
          </div>
          <div class="spec-card">
            <div class="spec-k">Motion Pipeline</div>
            <div class="spec-v">GSAP & Lenis Smooth Scroll</div>
          </div>
          <div class="spec-card">
            <div class="spec-k">Localization</div>
            <div class="spec-v">Bilingual i18n (ID / EN)</div>
          </div>
          <div class="spec-card">
            <div class="spec-k">Theme System</div>
            <div class="spec-v">Dual Dark / Light Mode</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.heroDarkDesktop}" class="screenshot-desktop" alt="Portfolio Cover">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Three.js + GSAP + Lenis + Tailwind CSS + Vanilla JS</span>
      <span class="footer-url">widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 2: ARSITEKTUR & DESAIN -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">ARCHITECTURE</span>
        <span class="slide-section-title">Fondasi Sistem & Struktur Visual</span>
      </div>
      <div class="slide-number">02 / 10</div>
    </div>

    <div class="headline-group" style="margin-bottom: 12px;">
      <h2 class="slide-title">Arsitektur Kreatif & Rekayasa Antarmuka</h2>
      <p class="slide-desc">Desain sistem modern yang memadukan komputasi grafis 3D real-time dengan animasi pengguliran inersia tanpa mengorbankan aksesibilitas dan performa.</p>
    </div>

    <div class="arch-grid">
      <div class="arch-card">
        <div class="arch-title" style="color: var(--accent-violet);">Grafis 3D WebGL & Canvas</div>
        <div class="arch-item"><strong>Three.js Particle Cloud:</strong> Ribuan partikel 3D yang bereaksi halus terhadap pergerakan kursor mouse dan orientasi perangkat gawai.</div>
        <div class="arch-item"><strong>Loop Render Teroptimasi:</strong> Pemanfaatan requestAnimationFrame dengan throttling saat canvas berada di luar viewport layar.</div>
        <div class="arch-item"><strong>Fallback Graceful:</strong> Pengalihan otomatis ke latar belakang gradien CSS jika perangkat klien tidak mendukung WebGL.</div>
      </div>

      <div class="arch-card">
        <div class="arch-title" style="color: var(--accent-cyan);">Manajemen Gerak & Scroll</div>
        <div class="arch-item"><strong>Lenis Smooth Scroll:</strong> Normalisasi kecepatan gulir antar perangkat untuk sensasi interaksi yang konsisten dan mulus.</div>
        <div class="arch-item"><strong>GSAP ScrollTrigger:</strong> Sinkronisasi kemunculan elemen antarmuka secara bertahap berdasarkan posisi scroll.</div>
        <div class="arch-item"><strong>Transform Terakselerasi GPU:</strong> Seluruh pergerakan elemen menggunakan translasi 3D untuk menjaga stabilitas 60fps.</div>
      </div>

      <div class="arch-card">
        <div class="arch-title" style="color: var(--accent-emerald);">State & Preferensi Klien</div>
        <div class="arch-item"><strong>Dual Theme Engine:</strong> Pendeteksian skema warna sistem bawaan (prefers-color-scheme) dengan tombol toggle manual yang tersimpan di localStorage.</div>
        <div class="arch-item"><strong>Lokalisasi Bilingual i18n:</strong> Mesin translasi sisi klien untuk beralih instan antara Bahasa Indonesia dan Bahasa Inggris.</div>
        <div class="arch-item"><strong>Modal Studi Kasus Terisolasi:</strong> Dialog mendalam dengan pencegahan scroll latar belakang saat modal aktif.</div>
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">widifirmaan.web.id Architecture Blueprint</span>
      <span class="footer-url">widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 3: THREE.JS HERO -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">HERO STAGE</span>
        <span class="slide-section-title">Hero Section & Canvas Partikel 3D</span>
      </div>
      <div class="slide-number">03 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Hero Sinematik & Partikel Interaktif</h2>
          <p class="slide-desc">Penyambutan interaktif dengan latar partikel Three.js yang merespons koordinat kursor, tipografi modern, dan status ketersediaan kerja.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Awan Partikel Interaktif</div>
            <div class="feature-card-text">Simulasi fisika partikel ringan yang memencar saat didekati kursor mouse dan kembali ke posisi semula.</div>
          </div>
          <div class="feature-card cyan">
            <div class="feature-card-title">Indikator Ketersediaan Kerja</div>
            <div class="feature-card-text">Badge status realtime dengan titik hijau berdenyut yang menandakan status kesiapan menerima proyek baru.</div>
          </div>
          <div class="feature-card emerald">
            <div class="feature-card-title">Navigasi Utama Melayang</div>
            <div class="feature-card-text">Navbar dengan efek glassmorphism yang mengikuti pergerakan scroll dengan transisi transparansi adaptif.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Three.js</div>
            <div class="metric-lbl">Canvas Engine</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">60 FPS</div>
            <div class="metric-lbl">Particle Loop</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Interactive</div>
            <div class="metric-lbl">Cursor Motion</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.heroDarkDesktop}" class="screenshot-desktop" alt="Hero Dark Desktop">
        <img src="${images.heroDarkMobile}" class="screenshot-mobile" alt="Hero Dark Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Canvas: assets/js/three-particles.js</span>
      <span class="footer-url">widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 4: GALERI KARYA PROYEK -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">PROJECT WORKS</span>
        <span class="slide-section-title">Katalog Karya & Filter Kategori</span>
      </div>
      <div class="slide-number">04 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Katalog Portofolio & Filter Proyek</h2>
          <p class="slide-desc">Pameran proyek rekayasa perangkat lunak dengan kategori filter (Web App, Open Source, Template) dan tag teknologi spesifik.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Filter Kategori Real-Time</div>
            <div class="feature-card-text">Pengelompokan instan kartu proyek tanpa perlu memuat ulang halaman dengan animasi transisi rapi.</div>
          </div>
          <div class="feature-card cyan">
            <div class="feature-card-title">Badge Tag Teknologi</div>
            <div class="feature-card-text">Setiap kartu menampilkan tumpukan teknologi utama seperti React, Next.js, Spring Boot, dan Tailwind CSS.</div>
          </div>
          <div class="feature-card emerald">
            <div class="feature-card-title">Tautan Langsung Live Demo</div>
            <div class="feature-card-text">Akses satu-klik menuju deployment produksi dan repositori kode sumber resmi di GitHub.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">12+ Projects</div>
            <div class="metric-lbl">Production Apps</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Instant</div>
            <div class="metric-lbl">Tab Filter</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Responsive</div>
            <div class="metric-lbl">Card Masonry</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.worksDarkDesktop}" class="screenshot-desktop" alt="Works Dark Desktop">
        <img src="${images.worksDarkMobile}" class="screenshot-mobile" alt="Works Dark Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Section: #works & Dynamic Filter Grid</span>
      <span class="footer-url">widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 5: MODAL STUDI KASUS -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">CASE STUDY</span>
        <span class="slide-section-title">Modal Studi Kasus Rekayasa Teknis</span>
      </div>
      <div class="slide-number">05 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Modal Studi Kasus & Rincian Fitur</h2>
          <p class="slide-desc">Paparan komprehensif mengenai tantangan arsitektur, solusi teknis yang diterapkan, serta metrik hasil dari tiap karya perangkat lunak.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Dokumentasi Arsitektur Rinci</div>
            <div class="feature-card-text">Penjelasan menyeluruh mengenai pola desain, state store, dan alasan pemilihan tumpukan teknologi terkait.</div>
          </div>
          <div class="feature-card cyan">
            <div class="feature-card-title">Galeri Pratinjau Layar</div>
            <div class="feature-card-text">Cuplikan antarmuka antarmuka aplikasi dalam resolusi tinggi untuk memperjelas alur interaksi pengguna.</div>
          </div>
          <div class="feature-card emerald">
            <div class="feature-card-title">Aksesibilitas Dialog Modal</div>
            <div class="feature-card-text">Penguncian fokus keyboard (Focus Trap), dukungan tombol escape, dan penonaktifan scroll latar belakang.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Detailed</div>
            <div class="metric-lbl">Case Breakdown</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Trap Focus</div>
            <div class="metric-lbl">A11y Standard</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Zero Leak</div>
            <div class="metric-lbl">Scroll Locking</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.modalDarkDesktop}" class="screenshot-desktop" alt="Case Study Modal Desktop">
        <img src="${images.modalDarkMobile}" class="screenshot-mobile" alt="Case Study Modal Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Component: Case Study Modal Dialog</span>
      <span class="footer-url">widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 6: DUAL THEME ENGINE -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">THEME ENGINE</span>
        <span class="slide-section-title">Sistem Tema Dual Gelap / Terang</span>
      </div>
      <div class="slide-number">06 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Transisi Tema Gelap & Terang</h2>
          <p class="slide-desc">Pengelolaan skema warna berbasis variabel CSS yang mendukung preferensi sistem operasi serta penyimpanan manual di peramban.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Penyelarasan Variabel CSS</div>
            <div class="feature-card-text">Semua nilai warna latar, teks, dan border terpetakan secara sistematis pada selector :root dan .light-theme.</div>
          </div>
          <div class="feature-card cyan">
            <div class="feature-card-title">Pencegahan Kedipan Layar (FOUC)</div>
            <div class="feature-card-text">Skrip inisialisasi awal di bagian head yang mengevaluasi tema sebelum seluruh elemen DOM dirender.</div>
          </div>
          <div class="feature-card emerald">
            <div class="feature-card-title">Transisi Warna Halus</div>
            <div class="feature-card-text">Efek transisi warna elemen yang mulus saat pengguna menekan tombol pergantian mode tema.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Zero FOUC</div>
            <div class="metric-lbl">Theme Load</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">CSS Vars</div>
            <div class="metric-lbl">Color Tokens</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Persistent</div>
            <div class="metric-lbl">Local Storage</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.heroLightDesktop}" class="screenshot-desktop" alt="Hero Light Desktop">
        <img src="${images.heroDarkMobile}" class="screenshot-mobile" alt="Hero Dark Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Module: assets/js/theme-switcher.js</span>
      <span class="footer-url">widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 7: BILINGUAL I18N -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">LOCALIZATION</span>
        <span class="slide-section-title">Mesin Lokalisasi Bahasa Bilingual</span>
      </div>
      <div class="slide-number">07 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Dukungan Bahasa Bilingual (ID / EN)</h2>
          <p class="slide-desc">Mesin terjemahan berbasis data atribut DOM yang memungkinkan transisi seketika antara Bahasa Indonesia dan Bahasa Inggris.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Kamus Terjemahan Klien</div>
            <div class="feature-card-text">Pustaka teks bilingual terstruktur dalam berkas JSON ringan untuk mempercepat pergantian bahasa tanpa jeda.</div>
          </div>
          <div class="feature-card cyan">
            <div class="feature-card-title">Pembaruan DOM Instan</div>
            <div class="feature-card-text">Elemen dengan atribut data-i18n diperbarui teksnya secara otomatis tanpa memerlukan muat ulang halaman.</div>
          </div>
          <div class="feature-card emerald">
            <div class="feature-card-title">Penyimpanan Preferensi Bahasa</div>
            <div class="feature-card-text">Pilihan bahasa disimpan di localStorage sehingga sesi kunjungan berikutnya tetap konsisten.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">ID / EN</div>
            <div class="metric-lbl">Bilingual Modes</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">&lt; 5ms</div>
            <div class="metric-lbl">Switch Time</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Zero Reload</div>
            <div class="metric-lbl">DOM Update</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.aboutDarkDesktop}" class="screenshot-desktop" alt="About Dark Desktop">
        <img src="${images.aboutDarkMobile}" class="screenshot-mobile" alt="About Dark Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Module: assets/js/i18n.js</span>
      <span class="footer-url">widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 8: PORTAL KONTAK -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">CONTACT</span>
        <span class="slide-section-title">Formulir Kontak & Jaringan Komunikasi</span>
      </div>
      <div class="slide-number">08 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Formulir Kontak & Saluran Diskusi</h2>
          <p class="slide-desc">Pintu komunikasi langsung bagi perekrut dan klien dengan formulir pesan terverifikasi serta tautan media profesional terverifikasi.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Validasi Formulir Interaktif</div>
            <div class="feature-card-text">Pengecekan kelengkapan format email dan pesan secara realtime sebelum pengiriman formulir.</div>
          </div>
          <div class="feature-card cyan">
            <div class="feature-card-title">Integrasi Saluran Profesional</div>
            <div class="feature-card-text">Tautan terverifikasi menuju akun GitHub, LinkedIn, dan email resmi untuk komunikasi profesional.</div>
          </div>
          <div class="feature-card emerald">
            <div class="feature-card-title">Umpan Balik Pengiriman Jelas</div>
            <div class="feature-card-text">Notifikasi visual status pengiriman pesan yang informatif untuk memastikan kenyamanan pengguna.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Direct</div>
            <div class="metric-lbl">Contact Flow</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Verified</div>
            <div class="metric-lbl">Social Links</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Spam Guard</div>
            <div class="metric-lbl">Form Protect</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.contactDarkDesktop}" class="screenshot-desktop" alt="Contact Dark Desktop">
        <img src="${images.contactDarkMobile}" class="screenshot-mobile" alt="Contact Dark Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Section: #contact & Form Handler</span>
      <span class="footer-url">widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 9: MOTION & LENIS SCROLL -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">MOTION SYSTEM</span>
        <span class="slide-section-title">Inersia Lenis Scroll & Animasi GSAP</span>
      </div>
      <div class="slide-number">09 / 10</div>
    </div>

    <div class="headline-group" style="margin-bottom: 12px;">
      <h2 class="slide-title">Manajemen Pergerakan Halus & Efisiensi Frame</h2>
      <p class="slide-desc">Implementasi pipeline animasi yang menjaga fluiditas scrolling layar, menghindari pergeseran tata letak, dan memaksimalkan performa CPU/GPU.</p>
    </div>

    <div class="arch-grid">
      <div class="arch-card">
        <div class="arch-title" style="color: var(--accent-violet);">Lenis Inertial Scrolling</div>
        <div class="arch-item"><strong>Normalisasi Scroll:</strong> Menghilangkan lompatan kasar dari roda scroll mouse dan trackpad lintas sistem operasi.</div>
        <div class="arch-item"><strong>Integrasi RAF Sinkron:</strong> Siklus pembaruan Lenis diikat erat pada siklus requestAnimationFrame utama antarmuka.</div>
        <div class="arch-item"><strong>Penonaktifan Selektif:</strong> Kemampuan menonaktifkan inersia saat berinteraksi dengan komponen modal dialog.</div>
      </div>

      <div class="arch-card">
        <div class="arch-title" style="color: var(--accent-cyan);">GSAP ScrollTrigger Pipeline</div>
        <div class="arch-item"><strong>Entrance Reveal:</strong> Animasi masuk bertahap dengan jeda stagger rapi pada daftar proyek dan teks biografi.</div>
        <div class="arch-item"><strong>Penetapan Trigger Presisi:</strong> Titik pemicu animasi dikalibrasi secara akurat terhadap tinggi viewport peramban.</div>
        <div class="arch-item"><strong>Will-Change Optimasi:</strong> Atribut CSS will-change diterapkan hanya saat animasi aktif untuk menghemat VRAM perangkat.</div>
      </div>

      <div class="arch-card">
        <div class="arch-title" style="color: var(--accent-emerald);">Aksesibilitas Gerakan</div>
        <div class="arch-item"><strong>Prefers-Reduced-Motion:</strong> Pengecekan otomatis preferensi pengguna untuk menonaktifkan animasi bagi pengguna sensitif gerak.</div>
        <div class="arch-item"><strong>Audit Beban Memori:</strong> Monitoring pembersihan event listener saat elemen halaman diperbarui secara dinamis.</div>
        <div class="arch-item"><strong>Toleransi Baterai Rendah:</strong> Throttling kecepatan render partikel saat sistem berada dalam mode penghemat baterai.</div>
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Engine: Lenis Smooth Scroll + GSAP ScrollTrigger</span>
      <span class="footer-url">widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 10: SPESIFIKASI PRODUKSI -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">SPECIFICATION</span>
        <span class="slide-section-title">Ringkasan Spesifikasi & Kesiapan Produksi</span>
      </div>
      <div class="slide-number">10 / 10</div>
    </div>

    <div class="headline-group" style="margin-bottom: 12px;">
      <h2 class="slide-title">Spesifikasi Teknis & Kesiapan Distribusi</h2>
      <p class="slide-desc">Ringkasan metrik audit performa web, optimasi SEO global, dan standarisasi arsitektur frontend untuk penayangan produksi.</p>
    </div>

    <div class="arch-grid">
      <div class="arch-card">
        <div class="arch-title" style="color: var(--accent-violet);">Metrik Performa & Audit Web</div>
        <div class="arch-item"><strong>Lighthouse Score:</strong> 98+ pada Performance, Accessibility, Best Practices, dan SEO.</div>
        <div class="arch-item"><strong>First Contentful Paint:</strong> Tercapai di bawah 0.7 detik dengan pemisahan skrip rendering kritis.</div>
        <div class="arch-item"><strong>Cumulative Layout Shift:</strong> Nilai 0.00 yang memastikan tidak ada pergeseran tata letak saat aset dimuat.</div>
      </div>

      <div class="arch-card">
        <div class="arch-title" style="color: var(--accent-cyan);">Aksesibilitas & Standar W3C</div>
        <div class="arch-item"><strong>Kontras Teks Teruji:</strong> Seluruh kombinasi warna memenuhi standar kontras WCAG AA baik di mode terang maupun gelap.</div>
        <div class="arch-item"><strong>Navigasi Keyboard Penuh:</strong> Indikator fokus yang jelas untuk seluruh elemen tautan, tombol, dan field formulir.</div>
        <div class="arch-item"><strong>Metadata Terstruktur:</strong> Tag Schema.org, Open Graph, dan Twitter Card tersemat lengkap untuk indeks mesin telusur.</div>
      </div>

      <div class="arch-card">
        <div class="arch-title" style="color: var(--accent-emerald);">Infrastruktur & Deployment</div>
        <div class="arch-item"><strong>Static Edge Delivery:</strong> Distribusi global melalui jaringan CDN dengan latensi rendah di seluruh penjuru dunia.</div>
        <div class="arch-item"><strong>Keamanan HTTPS Ketat:</strong> Konfigurasi header keamanan modern untuk perlindungan terhadap serangan web umum.</div>
        <div class="arch-item"><strong>Reliabilitas Tinggi:</strong> Ketersediaan operasional 99.9% tanpa memerlukan pemeliharaan server komputasi backend.</div>
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">widifirmaan.web.id Production Specification Document</span>
      <span class="footer-url">widifirmaan.web.id</span>
    </div>
  </section>

</body>
</html>
`;

const htmlFilePath = path.join(projectRoot, 'presentation.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`HTML presentasi disimpan di: ${htmlFilePath}`);

async function renderPDF() {
  console.log('Menjalankan Playwright Chromium untuk render PDF Portfolio...');
  
  const playwrightPath = '/home/widifirmaan/Projects/qa-toolkit/node_modules/playwright/index.mjs';
  const { chromium } = await import(playwrightPath);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlFilePath}`, { waitUntil: 'networkidle' });
  await page.evaluateHandle('document.fonts.ready');

  const slidePdfPath = path.join(downloadsDir, 'Portfolio.pdf');
  console.log('Rendering Multi-Page A4 Landscape (Slide Mode)...');
  await page.pdf({
    path: slidePdfPath,
    width: '297mm',
    height: '210mm',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  console.log('Rendering Continuous Single-Scroll Showcase (Poster Mode)...');
  await page.addStyleTag({
    content: `
      @page {
        size: auto;
        margin: 0;
      }
      body {
        background-color: #07090E !important;
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
  const contPdfPath = path.join(downloadsDir, 'Portfolio-Continuous.pdf');
  await page.pdf({
    path: contPdfPath,
    width: '1428px',
    height: `${scrollHeight}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();

  const slideStat = fs.statSync(slidePdfPath);
  const contStat = fs.statSync(contPdfPath);

  console.log('\nPDF Portfolio berhasil dibuat:');
  console.log(`- Multi-Page Deck: ${(slideStat.size / 1024 / 1024).toFixed(2)} MB (${slidePdfPath})`);
  console.log(`- Continuous Poster: ${(contStat.size / 1024 / 1024).toFixed(2)} MB (${contPdfPath})\n`);
}

renderPDF().catch((err) => {
  console.error('Gagal membuat PDF:', err);
  process.exit(1);
});
