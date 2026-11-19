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
    console.warn(`Peringatan: Screenshot tidak ditemukan: ${filePath}`);
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
  modalDarkDesktop: encodeImage('Portfolio Case Study Modal Dark Desktop.png'),
  modalDarkMobile: encodeImage('Portfolio Case Study Modal Dark Mobile.png'),
  aboutDarkDesktop: encodeImage('Portfolio About Dark Desktop.png'),
  aboutDarkMobile: encodeImage('Portfolio About Dark Mobile.png'),
  contactDarkDesktop: encodeImage('Portfolio Contact Dark Desktop.png'),
  contactDarkMobile: encodeImage('Portfolio Contact Dark Mobile.png'),
};

console.log('Menyusun HTML presentasi dengan style murni WebGL Void & Neon Crimson...');

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>widifirmaan.web.id - Web Engineering Presentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-void: #050505;
      --card-glass: rgba(255, 255, 255, 0.03);
      --card-glass-elevated: rgba(255, 255, 255, 0.06);
      --border-glass: rgba(255, 255, 255, 0.08);
      --border-glass-highlight: rgba(255, 51, 102, 0.35);
      --accent-crimson: #FF3366;
      --text-pure: #FFFFFF;
      --text-muted: #A1A1AA;
      --text-subtle: #71717A;
      --radius-glass: 16px;
      --radius-dock: 50px;
      --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
      --shadow-crimson: 0 0 20px rgba(255, 51, 102, 0.3);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      background-color: var(--bg-void);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text-pure);
      line-height: 1.45;
      letter-spacing: -0.01em;
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
      background: var(--bg-void);
      display: flex;
      flex-direction: column;
      padding: 16mm 20mm;
      overflow: hidden;
      background-image: 
        radial-gradient(circle at 85% 15%, rgba(255, 51, 102, 0.06) 0%, transparent 50%),
        radial-gradient(circle at 15% 85%, rgba(255, 255, 255, 0.02) 0%, transparent 40%);
    }

    /* Slide Header */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6mm;
      z-index: 10;
    }

    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: var(--card-glass);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-dock);
      padding: 6px 18px;
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow-glass);
    }

    .brand-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-crimson);
      box-shadow: var(--shadow-crimson);
    }

    .brand-title {
      font-size: 13.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--text-pure);
      text-transform: uppercase;
    }

    .brand-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      border-left: 1px solid var(--border-glass);
      padding-left: 12px;
      margin-left: 2px;
    }

    .badge-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      color: var(--accent-crimson);
      background: rgba(255, 51, 102, 0.08);
      border: 1px solid rgba(255, 51, 102, 0.25);
      border-radius: var(--radius-dock);
      padding: 6px 14px;
    }

    /* Content Layout */
    .slide-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 10;
    }

    .title-block {
      margin-bottom: 5mm;
    }

    .slide-category {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: var(--accent-crimson);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 4px;
    }

    .slide-title {
      font-size: 27px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #FFFFFF;
      line-height: 1.15;
    }

    .slide-subtitle {
      font-size: 13.5px;
      color: var(--text-muted);
      margin-top: 4px;
      max-width: 900px;
    }

    /* Glass Panels */
    .glass-panel {
      background: var(--card-glass);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-glass);
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow-glass);
      padding: 18px 22px;
    }

    .glass-panel-elevated {
      background: var(--card-glass-elevated);
      border: 1px solid var(--border-glass-highlight);
      border-radius: var(--radius-glass);
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow-glass);
      padding: 18px 22px;
    }

    /* Layout Splits */
    .layout-split {
      display: grid;
      grid-template-columns: 1.12fr 0.88fr;
      gap: 20px;
      align-items: stretch;
      flex: 1;
    }

    .layout-split-reversed {
      display: grid;
      grid-template-columns: 0.88fr 1.12fr;
      gap: 20px;
      align-items: stretch;
      flex: 1;
    }

    .layout-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      flex: 1;
    }

    .layout-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      flex: 1;
    }

    /* Visual Stage */
    .visual-stage {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-glass);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      height: 100%;
      min-height: 290px;
      padding: 12px;
    }

    .visual-stage img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.7));
    }

    /* Feature Items */
    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      justify-content: center;
    }

    .feature-item {
      background: var(--card-glass);
      border: 1px solid var(--border-glass);
      border-radius: 12px;
      padding: 13px 16px;
    }

    .feature-item-title {
      font-size: 14px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 3px;
    }

    .feature-item-desc {
      font-size: 12.5px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* Footer */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 5mm;
      padding-top: 3.5mm;
      border-top: 1px solid var(--border-glass);
      font-size: 11px;
      color: var(--text-subtle);
      font-family: 'JetBrains Mono', monospace;
    }

    .tech-pill {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-dock);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      color: var(--accent-crimson);
      margin-right: 6px;
      margin-top: 5px;
    }
  </style>
</head>
<body>

  <!-- SLIDE 1: COVER -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Widi Firmansyah</div>
        <div class="brand-subtitle">3D WebGL Portfolio &amp; Liquid Interaction Architecture</div>
      </div>
      <div class="badge-pill">DECK-PORT-01 / 10</div>
    </div>

    <div class="slide-content">
      <div class="layout-split">
        <div style="display: flex; flex-direction: column; justify-content: center; padding-right: 15px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <span class="tech-pill">Three.js / WebGL</span>
            <span class="tech-pill">Shader Canvas</span>
            <span class="tech-pill">Glassmorphism</span>
            <span class="tech-pill">Fluid Dock</span>
          </div>
          <h1 style="font-size: 40px; font-weight: 900; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 16px;">
            Arsitektur Web Portofolio WebGL 3D &amp; Liquid Interaction
          </h1>
          <p style="font-size: 15px; color: var(--text-muted); line-height: 1.55; margin-bottom: 24px;">
            Platform showcase rekayasa perangkat lunak modern yang memadukan latar belakang partikel WebGL interaktif, kursor kustom berbasis fisika, navigasi dock melayang, dan panel kaca glassmorphism berestetika Void &amp; Neon Crimson.
          </p>
          <div class="glass-panel" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 14px 18px;">
            <div>
              <div style="font-size: 11px; color: var(--text-subtle); font-family: 'JetBrains Mono', monospace;">WEBGL ENGINE</div>
              <div style="font-size: 19px; font-weight: 800; color: var(--accent-crimson); margin-top: 2px;">60 FPS</div>
              <div style="font-size: 11px; color: var(--text-muted);">Particle Shaders</div>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--text-subtle); font-family: 'JetBrains Mono', monospace;">INTERFACE DOCK</div>
              <div style="font-size: 19px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">50px Pill</div>
              <div style="font-size: 11px; color: var(--text-muted);">Liquid Glass</div>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--text-subtle); font-family: 'JetBrains Mono', monospace;">INTERACTION</div>
              <div style="font-size: 19px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">Zero Lag</div>
              <div style="font-size: 11px; color: var(--text-muted);">Pointer Physics</div>
            </div>
          </div>
        </div>

        <div class="visual-stage">
          <img src="${images.heroDarkDesktop}" alt="Portfolio Hero Dark Desktop">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDIFIRMAAN.WEB.ID &bull; PORTFOLIO ARCHITECTURE</div>
      <div>WIDI FIRMANSYAH &bull; PRINCIPAL ARCHITECT</div>
      <div>01 / 10</div>
    </div>
  </div>

  <!-- SLIDE 2: LATAR BELAKANG & TUJUAN REKAYASA -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Arsitektur &amp; Fondasi</div>
        <div class="brand-subtitle">Spesifikasi Kebutuhan Web</div>
      </div>
      <div class="badge-pill">DECK-PORT-02 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Fondasi Rekayasa Web</div>
        <h2 class="slide-title">Keseimbangan Visual Sinematik &amp; Efisiensi Komputasi GPU</h2>
        <p class="slide-subtitle">Membangun kehadiran digital seorang pengembang senior dengan grafis real-time tanpa mengorbankan aksesibilitas dan performa.</p>
      </div>

      <div class="layout-grid-3">
        <div class="glass-panel">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent-crimson); margin-bottom: 8px;">01 &bull; TANTANGAN GPU</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Overhead Rendering 3D</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            Animasi kanvas WebGL sering menguras daya baterai dan memicu kenaikan suhu CPU jika tidak dioptimasi dengan requestAnimationFrame dan frustum culling.
          </p>
        </div>

        <div class="glass-panel">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent-crimson); margin-bottom: 8px;">02 &bull; SOLUSI SHADER</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Partikel GLSL Ringan</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            Penggunaan buffer geometry terkompresi dengan kalkulasi posisi partikel langsung di shader GPU (vertex shader) untuk menjaga frame time di bawah 16ms.
          </p>
        </div>

        <div class="glass-panel">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent-crimson); margin-bottom: 8px;">03 &bull; ERGONOMI UI</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Glassmorphism Void</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            Desain panel kaca semi-transparan dengan kontras tinggi yang melindungi keterbacaan teks teknis di atas partikel yang bergerak dinamis di latar belakang.
          </p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDIFIRMAAN.WEB.ID &bull; SPESIFIKASI SISTEM</div>
      <div>GPU RENDERING STANDARDS</div>
      <div>02 / 10</div>
    </div>
  </div>

  <!-- SLIDE 3: HERO CANVAS & POINTER PHYSICS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Panggung Interaktif</div>
        <div class="brand-subtitle">WebGL Hero Canvas &amp; Custom Cursor</div>
      </div>
      <div class="badge-pill">DECK-PORT-03 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Interaksi Spasial</div>
        <h2 class="slide-title">Kanvas WebGL Penuh &amp; Fisika Kursor Interaktif</h2>
        <p class="slide-subtitle">Sistem partikel responsif terhadap koordinat pointer dengan kursor ganda yang beradaptasi saat melintasi elemen interaktif.</p>
      </div>

      <div class="layout-split">
        <div class="visual-stage">
          <img src="${images.heroDarkMobile}" alt="Portfolio Hero Dark Mobile">
        </div>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-item-title">Sistem Kursor Lingkaran Ganda (Dot &amp; Follower)</div>
            <div class="feature-item-desc">
              Titik pusat 8px berwarna Neon Crimson (#ff3366) dan lingkaran luar 40px dengan interpolasi lerp halus yang merespons elemen anchor dan tombol.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Interaksi Hamburan Partikel Pointer</div>
            <div class="feature-item-desc">
              Partikel WebGL bereaksi terhadap pergerakan kursor dengan gaya tolak gravitasi lokal dan kembali ke formasi semula secara elastis.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Zero CLS Heading Typography</div>
            <div class="feature-item-desc">
              Hierarki tipografi font Inter 900 dengan display inline-block yang tidak memicu pergeseran layout saat animasi fade-in pertama kali dieksekusi.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDIFIRMAAN.WEB.ID &bull; HERO STAGE</div>
      <div>POINTER DYNAMICS &amp; WEBGL</div>
      <div>03 / 10</div>
    </div>
  </div>

  <!-- SLIDE 4: GLASSMORPHIC DOCK NAVIGATION -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Navigasi Utama</div>
        <div class="brand-subtitle">Floating Dock &amp; Light/Dark Theme Switcher</div>
      </div>
      <div class="badge-pill">DECK-PORT-04 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Sistem Kendali Antarmuka</div>
        <h2 class="slide-title">Bilah Navigasi Gaya Dock Mengambang</h2>
        <p class="slide-subtitle">Komponen navigasi terpusat berbentuk kapsul melayang 50px yang dilengkapi transisi tema terang/gelap real-time.</p>
      </div>

      <div class="layout-split-reversed">
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-item-title">Floating Dock Style Nav 50px Pill</div>
            <div class="feature-item-desc">
              Posisi tetap top-1.5rem dengan efek kaca glass-panel (blur 12px, border putih transparan 8%) yang memberikan ilusi panggung melayang.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Peralihan Variabel CSS Light / Dark</div>
            <div class="feature-item-desc">
              Manipulasi variabel tema (--bg-color, --text-color, --accent-color) yang tersimpan di localStorage tanpa jeda kedipan layar (FOUC).
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Indikator Status Aktif Segmen</div>
            <div class="feature-item-desc">
              Garis bawah aksen Crimson yang berpindah secara otomatis mengikuti posisi bagian halaman yang sedang berada di area pandang pengguna.
            </div>
          </div>
        </div>

        <div class="visual-stage">
          <img src="${images.heroLightDesktop}" alt="Portfolio Hero Light Mode Desktop">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDIFIRMAAN.WEB.ID &bull; DOCK NAVIGATION</div>
      <div>THEME PERSISTENCE ENGINE</div>
      <div>04 / 10</div>
    </div>
  </div>

  <!-- SLIDE 5: WORKS SHOWCASE & HOVER PHYSICS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Pameran Proyek</div>
        <div class="brand-subtitle">Interactive Works Grid &amp; Project Cards</div>
      </div>
      <div class="badge-pill">DECK-PORT-05 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Katalog Rekayasa Sistem</div>
        <h2 class="slide-title">Grid Karya Terpilih dengan Efek Kedalaman Visual</h2>
        <p class="slide-subtitle">Kartu pameran proyek dengan efek hover mikro-interaksi, label stack teknologi, dan pratinjau arsitektur terintegrasi.</p>
      </div>

      <div class="layout-split">
        <div class="visual-stage">
          <img src="${images.worksDarkDesktop}" alt="Portfolio Works Dark Desktop">
        </div>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-item-title">Panel Kaca Terisolasi (.glass-panel)</div>
            <div class="feature-item-desc">
              Radius 16px dengan transisi background dan border halus saat kursor melintas, menciptakan elevasi kedalaman ruang yang mewah.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Badge Tag Teknologi Berbasis JetBrains Mono</div>
            <div class="feature-item-desc">
              Kapsul kecil penanda framework dan bahasa pemrograman yang mempermudah perekrut teknis memverifikasi keahlian rekayasa.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Pratinjau Gambar Beraspek Rasio Presisi</div>
            <div class="feature-item-desc">
              Gambar mock visual beresolusi tinggi yang teroptimasi tanpa distorsi proporsi pada beragam ukuran monitor dan gawai.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDIFIRMAAN.WEB.ID &bull; WORKS SHOWCASE</div>
      <div>PROJECT GRID ARCHITECTURE</div>
      <div>05 / 10</div>
    </div>
  </div>

  <!-- SLIDE 6: CASE STUDY MODAL & DEEP INSPECTION -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Studi Kasus</div>
        <div class="brand-subtitle">Case Study Modal &amp; Technical Breakdown</div>
      </div>
      <div class="badge-pill">DECK-PORT-06 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Inspeksi Solusi Teknis</div>
        <h2 class="slide-title">Modal Studi Kasus dengan Narasi Arsitektur Menyeluruh</h2>
        <p class="slide-subtitle">Dialog inspeksi teknis mendalam yang menjabarkan latar belakang masalah, keputusan arsitektur, dan hasil metrik produksi.</p>
      </div>

      <div class="layout-split-reversed">
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-item-title">Aksesibilitas Dialog WAI-ARIA Terpadu</div>
            <div class="feature-item-desc">
              Penguncian fokus tab keyboard (focus trap) di dalam modal dan penutupan instan dengan tombol Escape atau klik pada overlay backdrop.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Multi-Screenshot Showcase Carousel</div>
            <div class="feature-item-desc">
              Penelusuran tangkapan layar antarmuka desktop dan seluler secara berdampingan untuk memperlihatkan fleksibilitas responsif karya.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Daftar Capaian &amp; Tautan Repositori</div>
            <div class="feature-item-desc">
              Tombol langsung menuju kode sumber GitHub dan live production deployment yang dilengkapi indikator status teruji.
            </div>
          </div>
        </div>

        <div class="visual-stage">
          <img src="${images.modalDarkDesktop}" alt="Portfolio Case Study Modal Dark Desktop">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDIFIRMAAN.WEB.ID &bull; CASE STUDY MODAL</div>
      <div>ACCESSIBLE DIALOG SYSTEM</div>
      <div>06 / 10</div>
    </div>
  </div>

  <!-- SLIDE 7: INTERACTIVE TERMINAL & ABOUT SECTION -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Pengalaman Personal</div>
        <div class="brand-subtitle">Interactive Terminal &amp; Engineering Skills</div>
      </div>
      <div class="badge-pill">DECK-PORT-07 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Profil Rekayasa</div>
        <h2 class="slide-title">Terminal Interaktif &amp; Peta Keahlian Teknologi</h2>
        <p class="slide-subtitle">Penyajian profil pengembang melalui emulator terminal perintah Linux dan visualisasi tingkat kemahiran teknologi.</p>
      </div>

      <div class="layout-split">
        <div class="visual-stage">
          <img src="${images.aboutDarkDesktop}" alt="Portfolio About Section Dark Desktop">
        </div>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-item-title">Terminal CLI Interaktif Sisi Klien</div>
            <div class="feature-item-desc">
              Interpreter perintah (help, bio, skills, contact, clear) yang merespons masukan teks pengguna layaknya console bash asli.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Peta Kompetensi Frontend &amp; Backend</div>
            <div class="feature-item-desc">
              Pengelompokan keahlian mulai dari JavaScript/TypeScript, React/Next.js, Spring Boot, WebGL, hingga infrastruktur CI/CD terpadu.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Linimasa Rekayasa Profesional</div>
            <div class="feature-item-desc">
              Pencatatan riwayat kontribusi proyek open source dan kepemimpinan teknis dalam pengembangan solusi perangkat lunak enterprise.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDIFIRMAAN.WEB.ID &bull; ABOUT &amp; TERMINAL</div>
      <div>ENGINEERING PROFILE</div>
      <div>07 / 10</div>
    </div>
  </div>

  <!-- SLIDE 8: ADAPTASI ERGONOMI SELULER -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Ergonomi Seluler</div>
        <div class="brand-subtitle">Mobile Viewport &amp; Responsive Navigation</div>
      </div>
      <div class="badge-pill">DECK-PORT-08 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Pengalaman Pengguna Seluler</div>
        <h2 class="slide-title">Optimasi Layar Sentuh &amp; Penyesuaian Kanvas Seluler</h2>
        <p class="slide-subtitle">Penskalaan dinamis kerapatan partikel WebGL dan penataan ulang tombol menu untuk operasional jempol satu tangan.</p>
      </div>

      <div class="layout-split-reversed">
        <div class="visual-stage">
          <img src="${images.worksDarkMobile}" alt="Portfolio Works Dark Mobile View">
        </div>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-item-title">Kompensasi DPI Layar Tinggi (Retina)</div>
            <div class="feature-item-desc">
              Pembatasan window.devicePixelRatio maksimum ke angka 2 guna mencegah overheat GPU seluler pada layar berspesifikasi tinggi.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Hamburger Drawer dengan Blur Glassmorphism</div>
            <div class="feature-item-desc">
              Bilah menu seluler yang meluncur halus dari atas layar dengan penutupan otomatis saat salah satu target tautan dipilih.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Penonaktifan Custom Cursor pada Layar Sentuh</div>
            <div class="feature-item-desc">
              Deteksi otomatis media (pointer: fine) yang menyembunyikan lingkaran kursor kustom pada gawai berbasis layar sentuh murni.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDIFIRMAAN.WEB.ID &bull; MOBILE ERGONOMICS</div>
      <div>TOUCH &amp; RETINA COMPLIANCE</div>
      <div>08 / 10</div>
    </div>
  </div>

  <!-- SLIDE 9: REKAYASA KINERJA & CORE WEB VITALS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Rekayasa Kinerja</div>
        <div class="brand-subtitle">Shader Optimization &amp; Web Vitals</div>
      </div>
      <div class="badge-pill">DECK-PORT-09 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Optimasi Runtime GPU &amp; Browser</div>
        <h2 class="slide-title">Efisiensi Siklus Render Shader &amp; Stabilitas Tata Letak</h2>
        <p class="slide-subtitle">Penghentian loop rendering saat tab tidak aktif dan isolasi lapisan komposit untuk mencapai skor Lighthouse sempurna.</p>
      </div>

      <div class="layout-grid-3">
        <div class="glass-panel">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent-crimson); margin-bottom: 8px;">GPU THROTTLING</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Visibility API Pause</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            Penghentian requestAnimationFrame secara instan ketika pengguna berpindah tab (document.hidden) untuk menghemat 100% alokasi komputasi baterai.
          </p>
        </div>

        <div class="glass-panel">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent-crimson); margin-bottom: 8px;">ZERO CLS SCORE</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Fixed Canvas Layer</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            Kanvas WebGL diposisikan secara absolut dengan pointer-events none di layer z-index -1, menjamin tidak ada pergeseran tata letak konten DOM (CLS 0.00).
          </p>
        </div>

        <div class="glass-panel">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent-crimson); margin-bottom: 8px;">MEMORY ISOLATION</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Context Loss Recovery</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            Penanganan event webglcontextlost dan webglcontextrestored guna mencegah crash halaman jika peramban kehabisan alokasi sumber daya VRAM.
          </p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDIFIRMAAN.WEB.ID &bull; PERFORMANCE AUDIT</div>
      <div>GPU RUNTIME OPTIMIZATION</div>
      <div>09 / 10</div>
    </div>
  </div>

  <!-- SLIDE 10: RANGKUMAN ARSITEKTUR & PRODUKSI -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Ringkasan Proyek</div>
        <div class="brand-subtitle">Spesifikasi Akhir &amp; Kesiapan Rilis</div>
      </div>
      <div class="badge-pill">DECK-PORT-10 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Rangkuman Akhir Rekayasa</div>
        <h2 class="slide-title">Kesimpulan Implementasi Web Portofolio Widi</h2>
        <p class="slide-subtitle">Sinergi antara estetika visual mutakhir dan arsitektur web modern yang andal untuk representasi profesional.</p>
      </div>

      <div class="layout-grid-4">
        <div class="glass-panel">
          <div style="font-size: 11px; color: var(--text-subtle); font-family: 'JetBrains Mono', monospace;">GRAPHICS</div>
          <div style="font-size: 18px; font-weight: 800; color: var(--accent-crimson); margin-top: 4px; margin-bottom: 4px;">WebGL 3D</div>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.45;">Shader partikel interaktif berkecepatan 60 FPS.</p>
        </div>

        <div class="glass-panel">
          <div style="font-size: 11px; color: var(--text-subtle); font-family: 'JetBrains Mono', monospace;">DESIGN</div>
          <div style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin-top: 4px; margin-bottom: 4px;">Void Crimson</div>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.45;">Panel kaca transparan dengan aksen Neon Crimson.</p>
        </div>

        <div class="glass-panel">
          <div style="font-size: 11px; color: var(--text-subtle); font-family: 'JetBrains Mono', monospace;">ERGONOMICS</div>
          <div style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin-top: 4px; margin-bottom: 4px;">Fluid Dock</div>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.45;">Navigasi mengambang 50px pill ramah sentuhan.</p>
        </div>

        <div class="glass-panel">
          <div style="font-size: 11px; color: var(--text-subtle); font-family: 'JetBrains Mono', monospace;">DEPLOYMENT</div>
          <div style="font-size: 18px; font-weight: 800; color: #10B981; margin-top: 4px; margin-bottom: 4px;">Production</div>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.45;">Live di widifirmaan.web.id via GitHub Pages.</p>
        </div>
      </div>

      <div class="visual-stage" style="min-height: 160px; max-height: 180px; margin-top: 15px;">
        <img src="${images.contactDarkDesktop}" alt="Portfolio Contact Section Dark Desktop">
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDIFIRMAAN.WEB.ID &bull; KESIMPULAN REKAYASA</div>
      <div>WIDI FIRMANSYAH &bull; PRINCIPAL ARCHITECT</div>
      <div>10 / 10</div>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(projectRoot, 'presentation.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`HTML presentasi disimpan di: ${htmlFilePath}`);

console.log('Menjalankan Playwright Chromium untuk render PDF Portfolio WebGL Void & Neon Crimson...');

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
  console.log('Rendering Multi-Page A4 Landscape (Slide Mode)...');
  await page.pdf({
    path: slidePdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
  });

  // 2. Continuous Poster Mode (Single tall scroll)
  console.log('Rendering Continuous Single-Scroll Showcase (Poster Mode)...');
  await page.addStyleTag({
    content: `
      @page {
        size: auto;
        margin: 0;
      }
      body {
        background: #050505 !important;
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

  console.log('\nPDF Portfolio WebGL Void & Neon Crimson berhasil dibuat:');
  console.log(`- Multi-Page Deck: ${(slideStat.size / 1024 / 1024).toFixed(2)} MB (${slidePdfPath})`);
  console.log(`- Continuous Poster: ${(contStat.size / 1024 / 1024).toFixed(2)} MB (${continuousPdfPath})\n`);
}

renderPDF().catch((err) => {
  console.error('Error saat render PDF:', err);
  process.exit(1);
});
