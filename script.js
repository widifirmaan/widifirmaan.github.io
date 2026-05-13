// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis for Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu and smooth scroll when clicking links
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            const href = e.target.getAttribute('href');
            
            // Close mobile menu
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            
            // Only intercept internal anchor links
            if (href.startsWith('#')) {
                e.preventDefault();
                
                // Subtle click animation for the link
                gsap.to(e.target, {
                    scale: 0.9,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });

                // Smooth scroll to target using Lenis
                lenis.scrollTo(href, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        }
    });
}

// Add smooth scroll for desktop nav links as well
document.querySelectorAll('.nav-links a:not(.lang-btn)').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (window.innerWidth > 768 && href.startsWith('#')) {
            e.preventDefault();
            
            gsap.to(link, {
                color: "var(--accent-color)",
                duration: 0.2,
                yoyo: true,
                repeat: 1
            });

            lenis.scrollTo(href, {
                duration: 1.5
            });
        }
    });
});

// GitHub Projects Fetching
async function fetchGitHubProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    try {
        const response = await fetch('https://api.github.com/users/widifirmaan/repos?sort=updated&type=owner&per_page=30');
        if (!response.ok) throw new Error('Failed to fetch repos');

        const repos = await response.json();

        // Filter out specific repos and forks
        const excludedRepos = ['widifirmaan.github.io', 'nextjs-telefish', 'bash-android-aio-bypass-kit', 'expressjs-server-manager-lightweight', 'clover-asus-vivobookflip-tp410ua'];
        const filteredRepos = repos.filter(repo => !repo.fork && !excludedRepos.includes(repo.name.toLowerCase()));

        // Clear existing static projects
        projectsGrid.innerHTML = '';

        // Render projects in order
        for (const repo of filteredRepos) {
            const card = document.createElement('div');
            card.className = 'project-card glass-panel';
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';

            const tech = repo.language || 'Web Technology';
            const ogImage = `https://opengraph.githubassets.com/1/${repo.full_name}`;
            const title = repo.name.replace(/[-_]/g, ' ').toUpperCase();
            const description = repo.description || 'No description available.';

            // Try to fetch images from README
            let images = [ogImage];
            let fullReadme = '';
            try {
                const readmeRes = await fetch(`https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch || 'main'}/README.md`);
                if (readmeRes.ok) {
                    fullReadme = await readmeRes.text();
                    const imgRegex = /!\[.*?\]\(((?:[^)(]+|\([^)(]*\))+)\)|<img.*?src=["'](.*?)["']/g;
                    let match;
                    let extracted = [];
                    let badges = [];
                    while ((match = imgRegex.exec(fullReadme)) !== null) {
                        let url = match[1] || match[2];
                        if (url) {
                            if (!url.startsWith('http')) {
                                url = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch || 'main'}/${url.replace(/^\.\//, '')}`;
                            }

                            if (url.includes('shields.io') || url.includes('badge')) {
                                if (badges.length < 5) badges.push(url);
                            } else if (extracted.length < 4) {
                                extracted.push(url);
                            }
                        }
                    }
                    if (extracted.length > 0) images = extracted;

                    const badgeHtml = badges.length > 0
                        ? `<div class="card-badges" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">${badges.map(b => `<img src="${b}" alt="badge">`).join('')}</div>`
                        : `<p>${tech}</p>`;
                    card.dataset.badgeHtml = badgeHtml;

                    // Fix relative paths in the full README text for the modal
                    const branch = repo.default_branch || 'main';
                    fullReadme = fullReadme.replace(
                        /!\[([^\]]*)\]\((?!http|https)((?:[^)(]+|\([^)(]*\))+)\)/g,
                        `![$1](https://raw.githubusercontent.com/${repo.full_name}/${branch}/$2)`
                    ).replace(
                        /<img[^>]+src=["'](?!http|https)([^"']+)["'][^>]*>/g,
                        (match, src) => match.replace(src, `https://raw.githubusercontent.com/${repo.full_name}/${branch}/${src}`)
                    );
                }
            } catch (e) {
                console.warn('Could not fetch README for', repo.name);
            }

            // Set data attributes for modal
            card.dataset.title = title;
            card.dataset.subtitle = tech;
            card.dataset.image = images[0];

            // Store README text for later use in modal
            card.dataset.readme = fullReadme;

            // Initial short description for the card if needed
            card.dataset.desc = `
                <div class="readme-content">
                    ${fullReadme ? 'Loading detail...' : description}
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <a href="${repo.html_url}" target="_blank" class="cta-btn" style="font-size: 0.8rem; padding: 0.6rem 1.2rem;">Source Code</a>
                    ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="cta-btn" style="font-size: 0.8rem; padding: 0.6rem 1.2rem; background: var(--accent-color);">Live Demo</a>` : ''}
                </div>
            `;

            const gridClass = images.length > 1 ? `grid-${Math.min(images.length, 4)}` : '';
            const imagesHtml = images.slice(0, 4).map(src => `<img src="${src}" alt="${title}" loading="lazy">`).join('');

            card.innerHTML = `
                <div class="project-image ${gridClass}">
                    ${imagesHtml}
                </div>
                <div class="project-info">
                    <h3>${title}</h3>
                    ${card.dataset.badgeHtml || `<p>${tech}</p>`}
                </div>
            `;

            projectsGrid.appendChild(card);

            // Animate reveal using GSAP
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                },
                y: 0,
                opacity: 1,
                duration: 0.5,
                delay: 0.1,
                ease: "power3.out"
            });
        }

    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        projectsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.5;">Gagal memuat proyek dari GitHub.</p>';
    }
}

// Initialize projects
fetchGitHubProjects();

// Custom Cursor
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const links = document.querySelectorAll('a, .cta-btn, .project-card');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Immediate cursor update
    gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.1
    });
});

// Smooth follower update
gsap.ticker.add(() => {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;

    gsap.set(follower, {
        x: followerX,
        y: followerY
    });
});

// Hover effect
links.forEach(link => {
    link.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    link.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
});

// THREE.JS Background Animation
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

// Lights for 3D Model
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Cahaya diturunkan agar lebih gelap dan dramatis
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Intensitas diturunkan
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Objects - Particles / Stars
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    // Spread particles over a large area
    posArray[i] = (Math.random() - 0.5) * 15;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.015,
    color: 0xff3366,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Load the user's 2D Animoji Image as a 3D Plane (2.5D Effect)
let character;

// Buat grup secara sinkron agar tidak menyebabkan error GSAP
const characterGroup = new THREE.Group();
characterGroup.position.y = -10; // Starts hidden below screen
characterGroup.scale.set(1.5, 1.5, 1.5);
scene.add(characterGroup);

character = characterGroup; // Assign langsung agar terdefinisi saat GSAP dipanggil

// Load the image texture
const textureLoader = new THREE.TextureLoader();
textureLoader.load(
    'memoji.png', // Pastikan gambar user dinamakan memoji.png
    (texture) => {
        // Create a plane geometry
        const geometry = new THREE.PlaneGeometry(2, 2);

        // Use a material that supports transparency (PNG)
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.position.y = 1;
        characterGroup.add(plane);
    },
    undefined,
    (err) => {
        console.error("Gagal memuat memoji.png. Pastikan file gambar telah disimpan di folder webclean dengan nama 'memoji.png'.");
    }
);


// Mouse Interactivity for 3D
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    targetX = (event.clientX - windowHalfX) * 0.001;
    targetY = (event.clientY - windowHalfY) * 0.001;
});

// Scroll interaction for 3D
let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const clock = new THREE.Clock();

let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Rotate particles
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;

    // Update Character (2.5D Tilt Effect)
    if (character) {
        // Smoothly tilt the entire image plane to follow the mouse
        const targetRotationY = targetX * 0.8;
        const targetRotationX = targetY * 0.8;

        character.rotation.y += 0.05 * (targetRotationY - character.rotation.y);
        character.rotation.x += 0.05 * (targetRotationX - character.rotation.x);
    }

    // Mouse interaction ease for particles
    particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
    particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

    // Scroll interaction for particles
    particlesMesh.position.y = -scrollY * 0.001;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

// GSAP Animations

// Hero Timeline
const tl = gsap.timeline();
tl.from('.nav-links li, .logo', {
    y: -20,
    opacity: 0,
    duration: 0.5,
    stagger: 0.05,
    ease: "power3.out"
})
    .from('.hero-content h1', {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power4.out"
    }, "-=0.3")
    .from('.hero-content p', {
        y: 15,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
    }, "-=0.3")
    .from('.cta-btn', {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: "back.out(1.7)"
    }, "-=0.2")
    .from('.scroll-indicator', {
        opacity: 0,
        duration: 0.6,
        delay: 0.2
    });

// View Work Click Animation
const viewWorkBtn = document.querySelector('.cta-btn');
if (viewWorkBtn) {
    viewWorkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = viewWorkBtn.getAttribute('href');

        // Button click animation (scale down effect)
        gsap.to(viewWorkBtn, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
        });

        // Character reaction (slight scale up)
        if (character) {
            gsap.to(character.scale, {
                x: 1.6,
                y: 1.6,
                z: 1.6,
                duration: 0.2,
                yoyo: true,
                repeat: 1
            });
        }

        // Smooth scroll to target using Lenis
        lenis.scrollTo(targetId, {
            offset: -50,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
    });
}

// Section Titles Reveal
gsap.utils.toArray('.section-title').forEach(title => {
    gsap.to(title, {
        scrollTrigger: {
            trigger: title,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
    });
});

// About Text Scroll Reveal
gsap.to('.reveal-text', {
    scrollTrigger: {
        trigger: '.about',
        start: "top 60%",
        end: "bottom 40%",
        scrub: 1
    },
    opacity: 1,
    ease: "none"
});

// Character pops up at Contact section (Menempel di bawah layar)
if (character) {
    // Ensure it starts fully hidden
    character.visible = false;

    gsap.to(character.position, {
        y: -3.8,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".contact",
            start: "top 90%",
            end: "top 30%",
            scrub: 1,
            onEnter: () => { character.visible = true; },
            onLeaveBack: () => { character.visible = false; }
        }
    });
}

// Language Switcher Logic
const langBtns = document.querySelectorAll('.lang-btn');
let currentLang = localStorage.getItem('lang') || 'id';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Update active button state
    langBtns.forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update text content safely
    if (typeof translations !== 'undefined') {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (translations[lang] && translations[lang][key]) {
                if (el.classList.contains('glitch')) {
                    el.setAttribute('data-text', translations[lang][key]);
                    el.innerText = translations[lang][key];
                } else {
                    el.innerText = translations[lang][key];
                }
            }
        });

        // Also update data attributes for experience items
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (translations[lang][key]) el.setAttribute('data-title', translations[lang][key]);
        });
        document.querySelectorAll('[data-i18n-subtitle]').forEach(el => {
            const key = el.getAttribute('data-i18n-subtitle');
            if (translations[lang][key]) el.setAttribute('data-subtitle', translations[lang][key]);
        });
        document.querySelectorAll('[data-i18n-desc]').forEach(el => {
            const key = el.getAttribute('data-i18n-desc');
            if (translations[lang][key]) el.setAttribute('data-desc', translations[lang][key]);
        });

        // Also update meta content
        document.querySelectorAll('[data-i18n-content]').forEach(el => {
            const key = el.getAttribute('data-i18n-content');
            if (translations[lang][key]) el.setAttribute('content', translations[lang][key]);
        });
    }
}

// Initialize on load
setLanguage(currentLang);

langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
    });
});

// Modal Logic
const modal = document.getElementById('detail-modal');
const modalOverlay = modal.querySelector('.modal-overlay');
const modalContent = modal.querySelector('.modal-content');
const modalClose = modal.querySelector('.modal-close');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalDescription = document.getElementById('modal-description');
const clickableItems = document.querySelectorAll('.experience-item, .project-card');

function openModal(data) {
    const currentLang = document.querySelector('.lang-btn.active').dataset.lang;
    
    // If it's an experience item, check for translated data
    if (data.type === 'experience') {
        const roleKey = data.element.getAttribute('data-i18n-role'); // wait, I used exp1-role
        // Actually, we've already updated the data attributes in the updateLanguage function
    }
    // If we have README content, parse it with marked
    if (data.readme && typeof marked !== 'undefined') {
        const htmlContent = marked.parse(data.readme);
        modalDescription.innerHTML = `
            <div class="modal-actions" style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2.5rem; padding-top: 1rem;">
                ${data.desc.includes('Source Code') ? data.desc.substring(data.desc.indexOf('<a')) : ''}
            </div>
            <div class="markdown-body">
                ${htmlContent}
            </div>
        `;
    } else {
        // Fallback for Experience or if README fails
        modalDescription.innerHTML = `
            <h2 style="font-family: 'Syncopate', sans-serif; margin-bottom: 0.5rem; color: var(--accent-color);">${data.title}</h2>
            <p style="opacity: 0.7; margin-bottom: 2rem;">${data.subtitle}</p>
            ${data.desc}
        `;
    }

    // Show modal container
    modal.style.display = 'flex';

    // Animate with GSAP
    const modalTl = gsap.timeline();

    modalTl.to(modalOverlay, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
    })
        .fromTo(modalContent,
            { scale: 0.9, opacity: 0, y: 30 },
            { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" },
            "-=0.15"
        );

    // Disable body scroll
    lenis.stop();
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modalTl = gsap.timeline({
        onComplete: () => {
            modal.style.display = 'none';
            lenis.start();
            document.body.style.overflow = '';
        }
    });

    modalTl.to(modalContent, {
        scale: 0.9,
        opacity: 0,
        y: 30,
        duration: 0.3,
        ease: "power2.in"
    })
        .to(modalOverlay, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
        }, "-=0.1");
}

// Use event delegation for clickable items (Experience & Dynamic Projects)
document.addEventListener('click', (e) => {
    const clickable = e.target.closest('.experience-item, .project-card');
    if (clickable) {
        const data = {
            title: clickable.dataset.title,
            subtitle: clickable.dataset.subtitle,
            desc: clickable.dataset.desc,
            image: clickable.dataset.image,
            readme: clickable.dataset.readme
        };
        openModal(data);
    }
});

// Update custom cursor on hover (Event Delegation)
document.addEventListener('mouseover', (e) => {
    const clickable = e.target.closest('.experience-item, .project-card, a, button');
    if (clickable) {
        cursor.classList.add('hovered');
    }
});

document.addEventListener('mouseout', (e) => {
    const clickable = e.target.closest('.experience-item, .project-card, a, button');
    if (clickable) {
        cursor.classList.remove('hovered');
    }
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Close on ESC
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
    }
});
