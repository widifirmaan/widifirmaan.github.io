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
    console.warn(`Warning: Screenshot file not found: ${filePath}`);
    return '';
  }
  const fileBuffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${fileBuffer.toString('base64')}`;
}

console.log('Encoding Portfolio screenshots...');

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

console.log('Assembling English Portfolio WebGL Void & Neon Crimson Presentation Deck HTML...');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
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
        <div class="brand-subtitle">3D WebGL Portfolio &amp; Fluid Interaction Architecture</div>
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
          <h1 style="font-size: 38px; font-weight: 900; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 16px;">
            3D WebGL Portfolio &amp; Fluid Interaction Architecture
          </h1>
          <p style="font-size: 15px; color: var(--text-muted); line-height: 1.55; margin-bottom: 24px;">
            A high-performance software engineering showcase blending GPU-accelerated interactive WebGL particle physics, pointer dynamics, floating dock navigation, and glassmorphic Void &amp; Neon Crimson aesthetics.
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

  <!-- SLIDE 2: BACKGROUND & ENGINEERING OBJECTIVES -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Architecture &amp; Foundations</div>
        <div class="brand-subtitle">Web Engineering Requirements</div>
      </div>
      <div class="badge-pill">DECK-PORT-02 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Web Engineering Foundations</div>
        <h2 class="slide-title">Balancing Cinematic Visuals with GPU Compute Efficiency</h2>
        <p class="slide-subtitle">Delivering real-time graphics and spatial depth without compromising web accessibility, battery consumption, or frame stability.</p>
      </div>

      <div class="layout-grid-3">
        <div class="glass-panel">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent-crimson); margin-bottom: 8px;">01 &bull; GPU OVERHEAD CHALLENGE</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">3D Rendering Constraints</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            Unconstrained WebGL canvas animation loops induce severe battery drain and CPU thermals if not throttled via requestAnimationFrame and frustum culling.
          </p>
        </div>

        <div class="glass-panel">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent-crimson); margin-bottom: 8px;">02 &bull; SHADER OPTIMIZATION</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Lightweight GLSL Particles</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            Compressed buffer geometries calculate particle coordinate deltas directly inside GPU vertex shaders, maintaining stable sub-16ms frame intervals.
          </p>
        </div>

        <div class="glass-panel">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent-crimson); margin-bottom: 8px;">03 &bull; UI ERGONOMICS</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Void Glassmorphism</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            High-contrast frosted glass panels safeguard technical typography legibility across dynamic, continuously flowing background particle fields.
          </p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDIFIRMAAN.WEB.ID &bull; SYSTEM SPECIFICATIONS</div>
      <div>GPU RENDERING STANDARDS</div>
      <div>02 / 10</div>
    </div>
  </div>

  <!-- SLIDE 3: HERO CANVAS & POINTER PHYSICS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Interactive Stage</div>
        <div class="brand-subtitle">WebGL Hero Canvas &amp; Custom Cursor</div>
      </div>
      <div class="badge-pill">DECK-PORT-03 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Spatial Interaction</div>
        <h2 class="slide-title">Fullscreen WebGL Canvas &amp; Interactive Pointer Physics</h2>
        <p class="slide-subtitle">Particle field responding dynamically to pointer coordinates with an adaptive dual-ring cursor tracking interactive elements.</p>
      </div>

      <div class="layout-split">
        <div class="visual-stage">
          <img src="${images.heroDarkMobile}" alt="Portfolio Hero Dark Mobile">
        </div>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-item-title">Dual-Ring Cursor Engine (Dot &amp; Follower)</div>
            <div class="feature-item-desc">
              An 8px Neon Crimson (#FF3366) core and a 40px outer ring utilizing smooth lerp interpolation, adapting shape over buttons and anchor tags.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Pointer Particle Dispersion Dynamics</div>
            <div class="feature-item-desc">
              WebGL particles repel from active cursor positions via local inverse-gravity vectors, snapping back elastically to baseline coordinates.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Zero-CLS Heading Typography</div>
            <div class="feature-item-desc">
              Rigid font bounding box reservation with Inter 900 guarantees zero layout shifts (CLS 0.00) during initial shader compilation and fade-in.
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
        <div class="brand-title">Primary Navigation</div>
        <div class="brand-subtitle">Floating Dock &amp; Light/Dark Theme Switcher</div>
      </div>
      <div class="badge-pill">DECK-PORT-04 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Interface Control System</div>
        <h2 class="slide-title">Floating Dock Navigation &amp; Theme Transition Engine</h2>
        <p class="slide-subtitle">Centered 50px pill floating dock delivering fluid route hopping and instant client-side theme switching.</p>
      </div>

      <div class="layout-split-reversed">
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-item-title">50px Pill Floating Dock Navigation</div>
            <div class="feature-item-desc">
              Fixed top-anchored glassmorphic dock (12px blur, 8% white border) providing a suspended stage aesthetic with tactile touch targets.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">CSS Custom Property Theme Switcher</div>
            <div class="feature-item-desc">
              Seamless manipulation of CSS variables (--bg-color, --text-color, --accent-color) persisted in localStorage without flash of unstyled content (FOUC).
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Active Route Indicator Tracking</div>
            <div class="feature-item-desc">
              Dynamic Crimson accent underlines responding automatically to IntersectionObserver triggers as sections enter the user's viewport.
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
        <div class="brand-title">Project Catalog</div>
        <div class="brand-subtitle">Interactive Works Grid &amp; Project Cards</div>
      </div>
      <div class="badge-pill">DECK-PORT-05 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Systems Catalog</div>
        <h2 class="slide-title">Curated Works Grid with Elevated Spatial Hierarchy</h2>
        <p class="slide-subtitle">Interactive project showcase cards featuring micro-interaction hover states, tech stack tags, and integrated architecture breakdowns.</p>
      </div>

      <div class="layout-split">
        <div class="visual-stage">
          <img src="${images.worksDarkDesktop}" alt="Portfolio Works Dark Desktop">
        </div>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-item-title">Isolated Glass Panels (.glass-panel)</div>
            <div class="feature-item-desc">
              16px corner radii with smooth border and background gradient transitions under cursor focus for tactile visual depth.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Monospace Tech Stack Badges</div>
            <div class="feature-item-desc">
              JetBrains Mono badges providing instant technology attribution across frameworks, runtimes, and engineering protocols.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Aspect-Preserving Mockup Displays</div>
            <div class="feature-item-desc">
              Responsive asset containers maintaining device-accurate aspect ratios across diverse workstation displays and mobile viewports.
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
        <div class="brand-title">Case Studies</div>
        <div class="brand-subtitle">Case Study Modal &amp; Technical Breakdown</div>
      </div>
      <div class="badge-pill">DECK-PORT-06 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Technical Deep Dive</div>
        <h2 class="slide-title">Comprehensive Case Study Inspection Modal</h2>
        <p class="slide-subtitle">Accessible dialog presenting architectural problem statements, implementation trade-offs, and production metrics.</p>
      </div>

      <div class="layout-split-reversed">
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-item-title">Standardized WAI-ARIA Dialog Compliance</div>
            <div class="feature-item-desc">
              Strict keyboard focus trap within open modal instances, Escape key dismissal, and click-outside backdrop isolation.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Dual Viewport Visual Carousel</div>
            <div class="feature-item-desc">
              Side-by-side inspection of desktop and mobile interface viewports validating responsive breakpoint fidelity.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Production Links &amp; Repository Access</div>
            <div class="feature-item-desc">
              Direct access triggers connecting to production deployments and verified GitHub repositories with live commit provenance.
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
        <div class="brand-title">Personal Experience</div>
        <div class="brand-subtitle">Interactive Terminal &amp; Engineering Skills</div>
      </div>
      <div class="badge-pill">DECK-PORT-07 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Engineering Profile</div>
        <h2 class="slide-title">Client-Side Interactive Terminal &amp; Competency Matrix</h2>
        <p class="slide-subtitle">Developer profile presentation featuring an in-browser command terminal emulator and technical competency mapping.</p>
      </div>

      <div class="layout-split">
        <div class="visual-stage">
          <img src="${images.aboutDarkDesktop}" alt="Portfolio About Section Dark Desktop">
        </div>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-item-title">Interactive Client-Side Terminal CLI</div>
            <div class="feature-item-desc">
              In-browser command parser (help, bio, skills, contact, clear) simulating authentic POSIX terminal behavior and output formatting.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Full-Stack Competency Matrix</div>
            <div class="feature-item-desc">
              Structured categorization across Frontend, Backend, Systems Engineering, WebGL shaders, and automated CI/CD pipelines.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Engineering Career Timeline</div>
            <div class="feature-item-desc">
              Documented milestones covering enterprise software development, open-source initiatives, and technical architecture leadership.
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

  <!-- SLIDE 8: MOBILE VIEWPORT & TOUCH ERGONOMICS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Mobile Ergonomics</div>
        <div class="brand-subtitle">Mobile Viewport &amp; Responsive Navigation</div>
      </div>
      <div class="badge-pill">DECK-PORT-08 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Mobile User Experience</div>
        <h2 class="slide-title">Mobile Touch Ergonomics &amp; Responsive Canvas Adaptation</h2>
        <p class="slide-subtitle">Dynamic GPU load scaling and single-handed thumb-zone layout restructuring for high-density mobile devices.</p>
      </div>

      <div class="layout-split-reversed">
        <div class="visual-stage">
          <img src="${images.worksDarkMobile}" alt="Portfolio Works Dark Mobile View">
        </div>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-item-title">High-DPI Screen Clamping (Retina Optimization)</div>
            <div class="feature-item-desc">
              Capping window.devicePixelRatio at 2.0 to eliminate mobile GPU thermal throttling and frame drops on quad-HD screens.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Glassmorphic Mobile Drawer Menu</div>
            <div class="feature-item-desc">
              Smooth sliding overlay navigation designed for single-hand reach with automated drawer collapse upon selection.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-item-title">Pointer Coarse Fallbacks</div>
            <div class="feature-item-desc">
              Automatic media query evaluation (pointer: coarse) to cleanly suppress desktop follower cursors on touch screens.
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

  <!-- SLIDE 9: PERFORMANCE ENGINEERING & WEB VITALS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Performance Engineering</div>
        <div class="brand-subtitle">Shader Optimization &amp; Web Vitals</div>
      </div>
      <div class="badge-pill">DECK-PORT-09 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">GPU &amp; Browser Runtime Optimization</div>
        <h2 class="slide-title">Shader Render Loop Efficiency &amp; Layout Stability</h2>
        <p class="slide-subtitle">Tab visibility throttles, zero-CLS layout isolation, and WebGL context restoration achieving top-tier Lighthouse benchmarks.</p>
      </div>

      <div class="layout-grid-3">
        <div class="glass-panel">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent-crimson); margin-bottom: 8px;">GPU POWER MANAGEMENT</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Visibility API Pause</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            Halting the requestAnimationFrame loop when the browser tab loses focus (document.hidden) to reduce idle battery draw to zero.
          </p>
        </div>

        <div class="glass-panel">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent-crimson); margin-bottom: 8px;">ZERO CLS STABILITY</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Fixed Canvas Layer</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            Decoupling the WebGL canvas into an absolute layer with pointer-events: none at z-index -1, guaranteeing 0.00 Cumulative Layout Shift.
          </p>
        </div>

        <div class="glass-panel">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent-crimson); margin-bottom: 8px;">CONTEXT RESILIENCE</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Context Loss Recovery</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            Handling webglcontextlost and webglcontextrestored events to cleanly reinitialize GPU buffers upon browser memory pressure.
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

  <!-- SLIDE 10: ARCHITECTURAL SYNTHESIS & RELEASE READINESS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Architecture Synthesis</div>
        <div class="brand-subtitle">System Summary &amp; Release Readiness</div>
      </div>
      <div class="badge-pill">DECK-PORT-10 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-block">
        <div class="slide-category">Final Engineering Synthesis</div>
        <h2 class="slide-title">Architectural Synthesis &amp; Production Verification</h2>
        <p class="slide-subtitle">Seamless fusion of GPU-accelerated graphics, modular component architecture, and responsive web performance standards.</p>
      </div>

      <div class="layout-grid-4">
        <div class="glass-panel">
          <div style="font-size: 11px; color: var(--text-subtle); font-family: 'JetBrains Mono', monospace;">GRAPHICS</div>
          <div style="font-size: 18px; font-weight: 800; color: var(--accent-crimson); margin-top: 4px; margin-bottom: 4px;">WebGL 3D</div>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.45;">Interactive 60 FPS GLSL particle canvas.</p>
        </div>

        <div class="glass-panel">
          <div style="font-size: 11px; color: var(--text-subtle); font-family: 'JetBrains Mono', monospace;">DESIGN SYSTEM</div>
          <div style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin-top: 4px; margin-bottom: 4px;">Void Crimson</div>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.45;">Frosted glass panels with Neon Crimson (#FF3366) accents.</p>
        </div>

        <div class="glass-panel">
          <div style="font-size: 11px; color: var(--text-subtle); font-family: 'JetBrains Mono', monospace;">ERGONOMICS</div>
          <div style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin-top: 4px; margin-bottom: 4px;">Fluid Dock</div>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.45;">Touch-accessible 50px pill floating navigation.</p>
        </div>

        <div class="glass-panel">
          <div style="font-size: 11px; color: var(--text-subtle); font-family: 'JetBrains Mono', monospace;">DEPLOYMENT</div>
          <div style="font-size: 18px; font-weight: 800; color: #10B981; margin-top: 4px; margin-bottom: 4px;">Production</div>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.45;">Live on widifirmaan.web.id via GitHub Pages.</p>
        </div>
      </div>

      <div class="visual-stage" style="min-height: 160px; max-height: 180px; margin-top: 15px;">
        <img src="${images.contactDarkDesktop}" alt="Portfolio Contact Section Dark Desktop">
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDIFIRMAAN.WEB.ID &bull; ENGINEERING SYNTHESIS</div>
      <div>WIDI FIRMANSYAH &bull; PRINCIPAL ARCHITECT</div>
      <div>10 / 10</div>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(projectRoot, 'presentation.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`Presentation HTML written to: ${htmlFilePath}`);

console.log('Launching Chromium with Playwright to render English Portfolio WebGL Void & Neon Crimson PDFs...');

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

  console.log('\nPortfolio English PDFs successfully generated:');
  console.log(`- Multi-Page Deck: ${(slideStat.size / 1024 / 1024).toFixed(2)} MB (${slidePdfPath})`);
  console.log(`- Continuous Poster: ${(contStat.size / 1024 / 1024).toFixed(2)} MB (${continuousPdfPath})\n`);
}

renderPDF().catch((err) => {
  console.error('Error during PDF rendering:', err);
  process.exit(1);
});
