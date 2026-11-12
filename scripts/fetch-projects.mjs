#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'projects.json');

const USERNAME = 'widifirmaan';
const EXCLUDED_REPOS = [
  'widifirmaan.github.io',
  'nextjs-telefish',
  'bash-android-aio-bypass-kit',
  'expressjs-server-manager-lightweight',
  'clover-asus-vivobookflip-tp410ua'
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

  // Fallback: scrape public profile if API rate-limited
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
  const branches = [repo.default_branch, 'main', 'master'].filter(Boolean);
  const uniqueBranches = [...new Set(branches)];

  for (const branch of uniqueBranches) {
    const url = `https://raw.githubusercontent.com/${repo.full_name}/${branch}/README.md`;
    try {
      const res = await fetchWithRetry(url, {
        headers: { 'User-Agent': 'widifirmaan-project-fetcher' }
      });
      if (res.ok) {
        const text = await res.text();
        return { text, branch };
      }
    } catch (e) {
      // ignore and try next branch
    }
  }
  return { text: '', branch: repo.default_branch || 'main' };
}

function processReadme(repo, readmeText, branch) {
  const ogImage = `https://opengraph.githubassets.com/1/${repo.full_name}`;
  let images = [ogImage];
  let badges = [];
  let fullReadme = readmeText || '';

  if (fullReadme) {
    const imgRegex = /!\[.*?\]\(((?:[^)(]+|\([^)(]*\))+)\)|<img.*?src=["'](.*?)["']/g;
    let match;
    let extracted = [];
    while ((match = imgRegex.exec(fullReadme)) !== null) {
      let url = match[1] || match[2];
      if (url) {
        if (!url.startsWith('http')) {
          url = `https://raw.githubusercontent.com/${repo.full_name}/${branch}/${url.replace(/^[./]+/, '')}`;
        }
        if (url.includes('shields.io') || url.includes('badge')) {
          if (badges.length < 5) badges.push(url);
        } else if (extracted.length < 4) {
          extracted.push(url);
        }
      }
    }
    if (extracted.length > 0) images = extracted;

    // Fix relative paths in full README text
    fullReadme = fullReadme
      .replace(
        /!\[([^\]]*)\]\((?!http|https)((?:[^)(]+|\([^)(]*\))+)\)/g,
        (m, alt, path) => `![${alt}](https://raw.githubusercontent.com/${repo.full_name}/${branch}/${path.replace(/^[./]+/, '')})`
      )
      .replace(
        /<img[^>]+src=["'](?!http|https)([^"']+)["'][^>]*>/g,
        (match, src) => match.replace(src, `https://raw.githubusercontent.com/${repo.full_name}/${branch}/${src.replace(/^[./]+/, '')}`)
      );
  }

  const tech = repo.language || 'Web Technology';
  const badgeHtml = badges.length > 0
    ? `<div class="card-badges" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">${badges.map(b => `<img src="${b}" alt="badge">`).join('')}</div>`
    : `<p>${tech}</p>`;

  const title = repo.name.replace(/[-_]/g, ' ').toUpperCase();
  const description = repo.description || 'No description available.';
  const desc = `
    <div class="readme-content">
        ${fullReadme ? 'Loading detail...' : description}
    </div>
    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
        <a href="${repo.html_url}" target="_blank" class="cta-btn" style="font-size: 0.8rem; padding: 0.6rem 1.2rem;">Source Code</a>
        ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="cta-btn" style="font-size: 0.8rem; padding: 0.6rem 1.2rem; background: var(--accent-color);">Live Demo</a>` : ''}
    </div>
  `.trim();

  return {
    name: repo.name,
    title,
    tech,
    description,
    html_url: repo.html_url,
    homepage: repo.homepage || '',
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
