#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'projects.json');

const USERNAME = 'widifirmaan';

const EXCLUDED_REPOS = [
  'widifirmaan.github.io',
  'nextjs-telefish',
  'bash-android-aio-bypass-kit',
  'clover-asus-vivobookflip-tp410ua',
  'selikur-cldxtrm-web',
  'ecu_database',
  'expressjs-server-manager-lightweight',
  'fuckingexsandbox',
  'penjurusansmkmatlab-skripsi-',
  'tools'
];

const PRIORITY_ORDER = [
  'springboot-simple-pos',
  'nextjs-velvetsnap-photobox',
  'nextjs-pwa-moneymanagement',
  'reactjs-coffee-shop-management',
  'reactjs-airpro-template',
  'reactjs-tryngo-programming-learning',
  'nextjs-book-games',
  'bootstrap-portograph-template',
  'bootstrap-javex-template',
  'javascript-aio-tools'
];

async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function getRepos() {
  const token = process.env.GITHUB_TOKEN;

  // 1. Primary for local workspace: discover sibling repositories (zero rate-limits & always fresh)
  try {
    const parentDir = path.resolve(ROOT_DIR, '..');
    const entries = await fs.readdir(parentDir, { withFileTypes: true });
    const localRepos = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const repoDir = path.join(parentDir, entry.name);
      try {
        await fs.access(path.join(repoDir, '.git'));
        const remote = execSync('git remote get-url origin', { cwd: repoDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        const branch = execSync('git branch --show-current', { cwd: repoDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim() || 'main';
        const match = remote.match(/\/([^/]+?)(?:\.git)?$/);
        const name = match ? match[1] : entry.name;
        localRepos.push({
          name,
          full_name: `${USERNAME}/${name}`,
          fork: false,
          description: '',
          language: '',
          html_url: `https://github.com/${USERNAME}/${name}`,
          homepage: '',
          default_branch: branch,
          localPath: repoDir
        });
      } catch {}
    }
    if (localRepos.length > 5) {
      console.log(`Discovered ${localRepos.length} local repositories in workspace`);
      return localRepos;
    }
  } catch (err) {
    // Continue to GitHub API if local scan fails
  }

  // 2. Primary for CI/Actions: GitHub REST API
  const headers = {
    'User-Agent': 'widifirmaan-project-fetcher',
    'Accept': 'application/vnd.github.v3+json'
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
    console.log('Using authenticated GITHUB_TOKEN');
  } else {
    console.log('No GITHUB_TOKEN detected, running in unauthenticated mode');
  }

  try {
    const res = await fetchWithRetry(`https://api.github.com/users/${USERNAME}/repos?sort=updated&type=owner&per_page=100`, { headers });
    if (res.ok) {
      const data = await res.json();
      console.log(`Fetched ${data.length} repositories from GitHub API`);
      return data;
    } else {
      console.warn(`GitHub API responded with status ${res.status}: ${res.statusText}`);
    }
  } catch (err) {
    console.warn('GitHub API request failed:', err.message);
  }

  // 3. Fallback: scrape public profile if API rate-limited without token
  console.log('Attempting fallback: scraping public repositories page...');
  try {
    const htmlRes = await fetchWithRetry(`https://github.com/${USERNAME}?tab=repositories`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const items = html.match(/<li[^>]*itemprop="owns"[^>]*>([\s\S]*?)<\/li>/g) || [];
      const fallbackRepos = [];
      for (const item of items) {
        const nameMatch = item.match(/itemprop="name codeRepository"[^>]*>\s*([^\s<]+)\s*</);
        if (!nameMatch) continue;
        const name = nameMatch[1].trim();
        const isFork = item.includes('forked from');
        const descMatch = item.match(/itemprop="description"[^>]*>\s*([^<\n]+)\s*</);
        const langMatch = item.match(/itemprop="programmingLanguage">([^<]+)</);
        fallbackRepos.push({
          name,
          full_name: `${USERNAME}/${name}`,
          fork: isFork,
          description: descMatch ? descMatch[1].trim() : '',
          language: langMatch ? langMatch[1].trim() : '',
          html_url: `https://github.com/${USERNAME}/${name}`,
          homepage: '',
          default_branch: 'main'
        });
      }
      if (fallbackRepos.length > 0) {
        console.log(`Fallback parsed ${fallbackRepos.length} repositories`);
        return fallbackRepos;
      }
    }
  } catch (err) {
    console.error('Fallback scraping also failed:', err.message);
  }

  return null;
}

async function fetchReadme(repo) {
  // If local path is available, read directly from file system
  if (repo.localPath) {
    try {
      const localReadme = await fs.readFile(path.join(repo.localPath, 'README.md'), 'utf-8');
      if (localReadme && localReadme.trim().length > 0) {
        return { text: localReadme, branch: repo.default_branch || 'main' };
      }
    } catch {}
  }

  const token = process.env.GITHUB_TOKEN;
  const apiHeaders = {
    'User-Agent': 'widifirmaan-project-fetcher',
    'Accept': 'application/vnd.github.raw+json'
  };
  if (token) {
    apiHeaders['Authorization'] = `token ${token}`;
  }

  // 1. Primary: GitHub REST API
  try {
    const apiRes = await fetchWithRetry(`https://api.github.com/repos/${repo.full_name}/readme`, {
      headers: apiHeaders
    });
    if (apiRes.ok) {
      const text = await apiRes.text();
      if (text && text.trim().length > 0) {
        return { text, branch: repo.default_branch || 'main' };
      }
    } else {
      console.warn(`GitHub API README for ${repo.name} responded with ${apiRes.status}`);
    }
  } catch (err) {
    console.warn(`GitHub API README failed for ${repo.name}:`, err.message);
  }

  // 2. Fallback: raw.githubusercontent.com
  const branches = [repo.default_branch, 'main', 'master', 'development'].filter(Boolean);
  const uniqueBranches = [...new Set(branches)];

  for (const branch of uniqueBranches) {
    const rawHeaders = { 'User-Agent': 'widifirmaan-project-fetcher' };
    if (token) rawHeaders['Authorization'] = `token ${token}`;

    const url = `https://raw.githubusercontent.com/${repo.full_name}/${branch}/README.md?v=${Date.now()}`;
    try {
      const res = await fetchWithRetry(url, { headers: rawHeaders });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) {
          return { text, branch };
        }
      }
    } catch (e) {
      // try next
    }
  }

  return { text: '', branch: repo.default_branch || 'main' };
}

function processReadme(repo, readmeText, branch) {
  const ogImage = `https://opengraph.githubassets.com/1/${repo.full_name}`;
  let fullReadme = readmeText || '';

  // Extract tagline from blockquote `> Tagline` or first summary paragraph if description is not set
  let description = repo.description || '';
  if (!description && fullReadme) {
    const taglineMatch = fullReadme.match(/^>\s*(.+)$/m);
    if (taglineMatch) {
      description = taglineMatch[1].trim();
    } else {
      const lines = fullReadme.split(/\r?\n/);
      let pastH1 = false;
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        if (!pastH1 && /^#\s+/.test(line)) {
          pastH1 = true;
          continue;
        }
        if (/^(#|!\[|\[!\[|<img|---|\*\*\*|\|)/.test(line)) break;
        description = line;
        break;
      }
    }
  }
  if (!description) description = 'No description available.';

  // Extract title from first H1 if available
  let title = repo.name.replace(/[-_]/g, ' ').toUpperCase();
  if (fullReadme) {
    const titleMatch = fullReadme.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    }
  }

  // Detect tech stack deterministically
  let tech = repo.language;
  const nameLower = repo.name.toLowerCase();
  if (nameLower.startsWith('springboot-')) tech = 'Java / Spring Boot';
  else if (nameLower.startsWith('nextjs-')) tech = 'Next.js / TypeScript';
  else if (nameLower.startsWith('reactjs-')) tech = 'React / JavaScript';
  else if (nameLower.startsWith('bootstrap-')) tech = 'HTML5 / Bootstrap';
  else if (nameLower.includes('clover-')) tech = 'macOS Bootloader / ACPI';
  else if (nameLower === 'ecu_database') tech = 'Automotive Telematics / PRG';
  else if (nameLower.includes('bash-android')) tech = 'Bash / Android EDL';
  else if (nameLower.includes('javascript-aio')) tech = 'JavaScript / HTML5';
  else if (!tech && fullReadme) {
    if (fullReadme.includes('Spring Boot')) tech = 'Java / Spring Boot';
    else if (fullReadme.includes('Next.js')) tech = 'Next.js / TypeScript';
    else if (fullReadme.includes('React')) tech = 'React / JavaScript';
    else if (fullReadme.includes('BMW') || fullReadme.includes('EDIABAS')) tech = 'Automotive Telematics / PRG';
    else if (fullReadme.includes('Clover') || fullReadme.includes('Hackintosh')) tech = 'macOS Bootloader / ACPI';
    else if (fullReadme.includes('Android') || fullReadme.includes('Qualcomm')) tech = 'Bash / Android EDL';
    else if (fullReadme.includes('Bootstrap')) tech = 'HTML5 / Bootstrap';
    else tech = 'Web Technology';
  }
  if (!tech) tech = 'Web Technology';

  // Detect homepage / live demo
  let homepage = repo.homepage && !/localhost|127\.0\.0\.1|pos\.widifirmaan\.web\.id/.test(repo.homepage)
    ? repo.homepage
    : '';
  if (!homepage && fullReadme) {
    const demoMatch = fullReadme.match(/\[(?:Live Demo|Demo Web|Website|Production)\]\((https:\/\/[^)]+)\)/i);
    if (demoMatch && !demoMatch[1].includes('github.com')) {
      homepage = demoMatch[1];
    } else {
      const liveSectionMatch = fullReadme.match(/##\s+Live\s+URL\b([\s\S]*?)(?:\n##\s+|$)/i);
      if (liveSectionMatch) {
        const urlMatch = liveSectionMatch[1].match(/https:\/\/[^\s)\]>]+/);
        if (urlMatch && !urlMatch[0].includes('github.com') && !urlMatch[0].includes('shields.io')) {
          homepage = urlMatch[0];
        }
      }
    }
  }

  let images = [ogImage];
  let badges = [];

  if (fullReadme) {
    const cleanRel = (raw) => String(raw || '').trim().replace(/^(?:\.\/)+|^\/+/, '');
    const imgRegex = /!\[.*?\]\(((?:[^)(]+|\([^)(]*\))+)\)|<img.*?src=["'](.*?)["']/g;
    let match;
    let extracted = [];
    while ((match = imgRegex.exec(fullReadme)) !== null) {
      let url = match[1] || match[2];
      if (url) {
        if (!/^https?:/i.test(url) && !url.startsWith('data:')) {
          url = `https://raw.githubusercontent.com/${repo.full_name}/${branch}/${cleanRel(url)}`;
        }
        if (url.includes('shields.io') || url.includes('badge')) {
          if (badges.length < 5) badges.push(url);
        } else if (extracted.length < 2) {
          extracted.push(url);
        }
      }
    }
    if (extracted.length > 0) images = extracted;

    // Fix relative image and file links outside fenced code blocks so README modals work on web.
    const isExternalOrSpecial = (u) => /^(?:https?:|mailto:|tel:|data:|#)/i.test(String(u || '').trim());
    const rewriteSegment = (seg) =>
      seg
        .replace(
          /!\[([^\]]*)\]\((?!https?:|data:|#)([^)\s]+(?:\([^)]*\)[^)\s]*)*)\)/gi,
          (m, alt, rel) => `![${alt}](https://raw.githubusercontent.com/${repo.full_name}/${branch}/${cleanRel(rel)})`
        )
        .replace(
          /<img\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>/gi,
          (m, pre, src, post) =>
            isExternalOrSpecial(src)
              ? m
              : `<img${pre}src="https://raw.githubusercontent.com/${repo.full_name}/${branch}/${cleanRel(src)}"${post}>`
        )
        .replace(
          /(?<!!)\[([^\]]+)\]\(([^)\s]+)\)/g,
          (m, label, target) =>
            isExternalOrSpecial(target)
              ? m
              : `[${label}](https://github.com/${repo.full_name}/blob/${branch}/${cleanRel(target)})`
        )
        .replace(
          /<a\b([^>]*?)\bhref=["']([^"']+)["']([^>]*)>/gi,
          (m, pre, href, post) =>
            isExternalOrSpecial(href)
              ? m
              : `<a${pre}href="https://github.com/${repo.full_name}/blob/${branch}/${cleanRel(href)}"${post}>`
        );

    fullReadme = fullReadme
      .split(/(```[\s\S]*?```)/g)
      .map((part, idx) => (idx % 2 === 1 ? part : rewriteSegment(part)))
      .join('');
  }

  const badgeHtml = badges.length > 0
    ? `<div class="card-badges" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">${badges.map(b => `<img src="${b}" alt="badge">`).join('')}</div>`
    : `<p>${tech}</p>`;

  const desc = `
    <div class="readme-content">
        ${fullReadme ? 'Loading detail...' : description}
    </div>
    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
        <a href="${repo.html_url}" target="_blank" class="cta-btn" style="font-size: 0.8rem; padding: 0.6rem 1.2rem;">Source Code</a>
        ${homepage ? `<a href="${homepage}" target="_blank" class="cta-btn" style="font-size: 0.8rem; padding: 0.6rem 1.2rem; background: var(--accent-color);">Live Demo</a>` : ''}
    </div>
  `.trim();

  return {
    name: repo.name,
    title,
    tech,
    description,
    html_url: repo.html_url,
    homepage,
    images,
    badges,
    badgeHtml,
    fullReadme,
    desc
  };
}

async function main() {
  console.log('--- Starting GitHub Projects Sync ---');
  const repos = await getRepos();

  if (!repos || repos.length === 0) {
    console.error('Failed to retrieve repositories.');
    try {
      await fs.readFile(OUTPUT_FILE, 'utf-8');
      console.log('Preserving existing projects.json');
      return;
    } catch {
      process.exit(1);
    }
  }

  const filteredRepos = repos.filter(repo => {
    if (repo.fork) return false;
    const nameLower = repo.name.toLowerCase();
    return !EXCLUDED_REPOS.some(ex => ex.toLowerCase() === nameLower);
  });

  console.log(`Processing ${filteredRepos.length} filtered repositories...`);

  const processedProjects = [];
  for (const repo of filteredRepos) {
    console.log(`Fetching README for: ${repo.name}`);
    const { text, branch } = await fetchReadme(repo);
    const project = processReadme(repo, text, branch);
    processedProjects.push(project);
  }

  // Sort by priority order
  processedProjects.sort((a, b) => {
    const idxA = PRIORITY_ORDER.indexOf(a.name);
    const idxB = PRIORITY_ORDER.indexOf(b.name);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const outputData = {
    lastUpdated: new Date().toISOString(),
    total: processedProjects.length,
    projects: processedProjects
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`Successfully generated ${OUTPUT_FILE} with ${processedProjects.length} projects!`);
}

main().catch(err => {
  console.error('Fatal error during project sync:', err);
  process.exit(1);
});
