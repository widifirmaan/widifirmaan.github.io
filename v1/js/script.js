window.addEventListener("DOMContentLoaded", () => {
  const e = document.getElementById("preloader");
  e && e.classList.add("loaded");
});
let currentLang = localStorage.getItem("portfolioLang") || "en";
function t(e) {
  const t = PORTFOLIO_DATA.translations;
  return t[currentLang]?.[e] || t.en?.[e] || e;
}
function setLanguage(e) {
  ((currentLang = e),
    localStorage.setItem("portfolioLang", e),
    document.querySelectorAll("[data-i18n]").forEach((e) => {
      const o = t(e.getAttribute("data-i18n"));
      o && (e.innerHTML = o);
    }),
    document.querySelectorAll("[data-i18n-placeholder]").forEach((e) => {
      const o = t(e.getAttribute("data-i18n-placeholder"));
      o && (e.placeholder = o);
    }));
  const o = document.getElementById("lang-toggle");
  (o &&
    (o.textContent = { en: "🌐 EN", id: "🌐 ID", zh: "🌐 ZH" }[e] || "🌐 EN"),
    document.querySelectorAll("#lang-dropdown button").forEach((t) => {
      t.classList.toggle("lang-active", t.getAttribute("data-lang") === e);
    }),
    updateDynamicTexts());
}
function updateDynamicTexts() {
  document.querySelectorAll(".project-btn").forEach((e) => {
    e.textContent = t("viewDetails");
  });
}
function optimizeImageUrl(e) {
  return e || "";
}
async function getReadmeResponse(repo, branch) {
  const variations = ["README.md", "Readme.md", "readme.md", "ReadMe.md"];
  for (const file of variations) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${repo}/${branch}/${file}`,
      );
      if (response.ok) return response;
    } catch (e) {}
  }
  return null;
}
async function initPortfolio() {
  try {
    const e = PORTFOLIO_DATA,
      o = "portfolioGithubData_v1.2",
      n = 864e5;
    let r = null;
    try {
      const e = localStorage.getItem(o);
      if (e) {
        const t = JSON.parse(e);
        Date.now() - t.timestamp < n && (r = t.data);
      }
    } catch (e) {
      console.error("Error reading cache:", e);
    }
    if (r) e.projects.list = r;
    else
      try {
        const t = await fetch(
          "https://api.github.com/users/widifirmaan/repos?sort=updated&type=owner&per_page=30",
        );
        if (t.ok) {
          const o = await t.json(),
            n = [
              "#00E5FF",
              "#FF5E5B",
              "#FFFF00",
              "#FFC0CB",
              "#00FF00",
              "#FFFFFF",
            ],
            r = [
              "widifirmaan.github.io",
              "nextjs-telefish",
              "bash-android-aio-bypass-kit",
              "clover-asus-vivobookflip-tp410ua",
            ];
          e.projects.list = o
            .filter((e) => !e.fork && !r.includes(e.name.toLowerCase()))
            .map((e, t) => {
              const o = n[t % n.length];
              let r = e.language || "Multiple Technologies";
              return (
                e.topics && e.topics.length > 0 && (r = e.topics.join(", ")),
                {
                  title: e.name.replace(/[-_]/g, " "),
                  tech: r,
                  color: o,
                  repo: e.full_name,
                  branch: e.default_branch || "main",
                  images: [
                    optimizeImageUrl(
                      `https://opengraph.githubassets.com/1/${e.full_name}`,
                    ),
                  ],
                  description:
                    e.description ||
                    "No description available for this repository.",
                  link:
                    e.homepage && "" !== e.homepage ? e.homepage : e.html_url,
                }
              );
            });
        }
      } catch (e) {
        console.error("Error fetching GitHub repos:", e);
      }
    document.getElementById("projects-title").innerText = t("projectsTitle");
    const a = document.getElementById("project-grid");
    if (
      (e.projects.list.forEach((e, o) => {
        const n = document.createElement("div");
        ((n.className = "project-card reveal"),
          (n.innerHTML = `\n                <div class="project-image" id="project-image-${o}" style="background-color: ${e.color};">\n                    ${e.images && e.images.length > 0 ? `<img src="${e.images[0]}" alt="${e.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">` : ""}\n                </div>\n                <div class="project-info">\n                    <h3>${e.title.toUpperCase()}</h3>\n                    <button class="btn btn-primary project-btn" data-index="${o}">${t("viewDetails")}</button>\n                </div>\n            `),
          a.appendChild(n));
      }),
      requestAnimationFrame(() => setupHorizontalScroll()),
      r)
    )
      e.projects.list.forEach((e, t) => {
        const o = document.getElementById(`project-image-${t}`);
        if (o && e.images && e.images.length > 1) {
          let t = "project-image-grid-1";
          (2 === e.images.length
            ? (t = "project-image-grid-2")
            : 3 === e.images.length
              ? (t = "project-image-grid-3")
              : e.images.length >= 4 && (t = "project-image-grid-4"),
            (o.className = `project-image project-image-grid ${t}`),
            (o.style.backgroundColor = "var(--black)"));
          const n = Math.min(e.images.length, 4);
          let r = "";
          for (let t = 0; t < n; t++)
            r += `<img src="${e.images[t]}" alt="${e.title}" loading="lazy">`;
          o.innerHTML = r;
        }
      });
    else {
      const t = e.projects.list.map(async (e, t) => {
        if (e.repo)
          try {
            const o = await getReadmeResponse(e.repo, e.branch);
            if (!o || !o.ok) throw new Error("README not found");
            const n = await o.text(),
              r =
                /!\[.*?\]\(((?:[^)(]+|\([^)(]*\))+)\)|<img.*?src=["'](.*?)["']/g;
            let a,
              c = [],
              i = 0;
            for (; null !== (a = r.exec(n)) && i < 8; ) {
              let t = a[1] || a[2];
              !t ||
                t.includes("shields.io") ||
                t.includes("badge") ||
                (t.startsWith("http") ||
                  (t = `https://raw.githubusercontent.com/${e.repo}/${e.branch}/${t.replace(/^\.\//, "")}`),
                c.push(optimizeImageUrl(t)),
                i++);
            }
            if (((c = [...new Set(c)]), c.length > 0)) {
              const o = e.images && e.images[0] ? e.images[0] : null;
              e.images = o ? [o, ...c] : c;
              const n = document.getElementById(`project-image-${t}`);
              if (n) {
                let t = "project-image-grid-1";
                (2 === e.images.length
                  ? (t = "project-image-grid-2")
                  : 3 === e.images.length
                    ? (t = "project-image-grid-3")
                    : e.images.length >= 4 && (t = "project-image-grid-4"),
                  (n.className = `project-image project-image-grid ${t}`),
                  (n.style.backgroundColor = "var(--black)"));
                const o = Math.min(e.images.length, 4);
                let r = "";
                for (let t = 0; t < o; t++)
                  r += `<img src="${e.images[t]}" alt="${e.title}" loading="lazy">`;
                n.innerHTML = r;
              }
            }
          } catch (e) {}
      });
      await Promise.all(t);
      try {
        localStorage.setItem(
          o,
          JSON.stringify({ timestamp: Date.now(), data: e.projects.list }),
        );
      } catch (e) {
        console.warn("Could not cache github data:", e);
      }
    }
    const c = e.projects.list.flatMap((e) => e.images || []);
    if (c.length > 0) {
      const e = c.map(
        (e) =>
          new Promise((t) => {
            const o = new Image();
            ((o.onload = t), (o.onerror = t), (o.src = e));
          }),
      );
      await Promise.all(e);
    }
    const i = document.getElementById("project-modal"),
      s = document.getElementById("modal-body"),
      l = document.querySelector(".close-modal");
    (document.querySelectorAll(".project-btn").forEach((o) => {
      o.addEventListener("click", (o) => {
        const n = o.target.getAttribute("data-index"),
          r = e.projects.list[n];
        let a = `\n                    <h2 class="section-title">${r.title.toUpperCase()}</h2>\n                    \n                    <div class="modal-links" style="margin-bottom: 20px;">\n                        <a href="${r.link}" target="_blank" class="btn btn-primary">${t("liveDemo")}</a>\n                        ${r.repo ? `<a href="https://github.com/${r.repo}" target="_blank" class="btn btn-secondary">${t("sourceCode")}</a>` : `<a href="#" class="btn btn-secondary">${t("sourceCode")}</a>`}\n                    </div>\n                `;
        if (
          ((a += `\n                    <div class="modal-desc" id="modal-desc-container">\n                        <p>${r.description}</p>\n                    </div>\n                `),
          (s.innerHTML = a),
          r.repo)
        ) {
          const e = s.querySelector("#modal-desc-container");
          ((e.innerHTML = `<p>${t("loadingReadme")}</p>`),
          getReadmeResponse(r.repo, r.branch)
            .then((e) => {
              if (!e || !e.ok) throw new Error("README not found");
              return e.text();
            })

              .then((t) => {
                let o = t.replace(
                  /!\[([^\]]*)\]\((?!http|https)((?:[^)(]+|\([^)(]*\))+)\)/g,
                  `![$1](https://raw.githubusercontent.com/${r.repo}/${r.branch}/$2)`,
                );
                "undefined" != typeof marked
                  ? ((e.innerHTML = marked.parse(o)),
                    e.classList.add("markdown-body"))
                  : (e.innerHTML = `<pre>${o}</pre>`);
              })
              .catch((t) => {
                (console.error("Error loading README:", t),
                  (e.innerHTML = `<p>${r.description}</p>`));
              }));
        }
        (window.loadMarked && window.loadMarked(),
          (i.style.display = "block"),
          (document.body.style.overflow = "hidden"));
      });
    }),
      (l.onclick = () => {
        ((i.style.display = "none"), (document.body.style.overflow = "auto"));
      }),
      window.addEventListener("click", (e) => {
        e.target == i &&
          ((i.style.display = "none"), (document.body.style.overflow = "auto"));
      }),
      refreshDynamicEvents(),
      setLanguage(currentLang));
  } catch (e) {
    console.error("Error loading portfolio data:", e);
  }
}
function refreshDynamicEvents() {
  document
    .querySelectorAll(
      ".reveal, .skills-container, .project-grid, .experience-timeline, .contact-box, .project-card",
    )
    .forEach((e) => observer.observe(e));
  (document
    .querySelectorAll("a, button, .project-card, .skill-tag, .curtain-panel")
    .forEach((e) => {
      e.dataset.cursorBound ||
        ((e.dataset.cursorBound = "true"),
        e.addEventListener("mouseenter", () => {
          ((cursor.style.transform = "scale(3)"),
            (cursor.style.backgroundColor = "var(--secondary)"));
        }),
        e.addEventListener("mouseleave", () => {
          ((cursor.style.transform = "scale(1)"),
            (cursor.style.backgroundColor = "var(--primary)"));
        }));
    }),
    document.querySelectorAll(".hero .reveal").forEach((e) => {
      e.classList.add("active");
    }));
}
const cursor = document.querySelector(".custom-cursor");
document.addEventListener("mousemove", (e) => {
  ((cursor.style.left = e.clientX + "px"),
    (cursor.style.top = e.clientY + "px"));
  const t = document.querySelectorAll(".shape"),
    o = e.clientX / window.innerWidth,
    n = e.clientY / window.innerHeight;
  t.forEach((e, t) => {
    const r = 20 * (t + 1),
      a = (o - 0.5) * r,
      c = (n - 0.5) * r;
    e.style.transform = `translate(${a}px, ${c}px) rotate(${15 * t}deg)`;
  });
});
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  observer = new IntersectionObserver((e) => {
    e.forEach((e) => {
      if (e.isIntersecting) {
        if (
          (e.target.classList.add("active"),
          e.target.classList.contains("skills-container"))
        ) {
          const t = e.target.querySelectorAll(".skill-tag");
          (e.target._timeouts &&
            e.target._timeouts.forEach((e) => clearTimeout(e)),
            (e.target._timeouts = []),
            t.forEach((t, o) => {
              const n = setTimeout(() => {
                ((t.style.opacity = "1"),
                  (t.style.transform = "translateY(0) scale(1)"));
              }, 100 * o);
              e.target._timeouts.push(n);
            }));
        }
        if (e.target.classList.contains("project-grid")) {
          e.target.querySelectorAll(".project-card").forEach((e, t) => {
            setTimeout(() => {
              e.classList.add("active");
            }, 200 * t);
          });
        }
        if (e.target.classList.contains("experience-timeline")) {
          e.target.querySelectorAll(".experience-item").forEach((e, t) => {
            setTimeout(() => {
              e.classList.add("active");
            }, 200 * t);
          });
        }
      } else {
        if (
          (e.target.classList.remove("active"),
          e.target.classList.contains("skills-container"))
        ) {
          e.target._timeouts &&
            e.target._timeouts.forEach((e) => clearTimeout(e));
          e.target.querySelectorAll(".skill-tag").forEach((e) => {
            ((e.style.opacity = "0"),
              (e.style.transform = "translateY(20px) scale(0.9)"));
          });
        }
        if (e.target.classList.contains("project-grid")) {
          e.target.querySelectorAll(".project-card").forEach((e) => {
            e.classList.remove("active");
          });
        }
        if (e.target.classList.contains("experience-timeline")) {
          e.target.querySelectorAll(".experience-item").forEach((e) => {
            e.classList.remove("active");
          });
        }
      }
    });
  }, observerOptions),
  leftPanel = document.querySelector(".curtain-panel.left"),
  rightPanel = document.querySelector(".curtain-panel.right");
function setupHorizontalScroll() {
  const e = document.getElementById("projects-scroll-outer"),
    t = document.getElementById("project-grid");
  if (!e || !t) return;
  const o = t.scrollWidth,
    n = window.innerWidth,
    r = o - n + 0.1 * n;
  e.style.height = `calc(100vh + ${r}px)`;
}
function updateHorizontalScroll() {
  const e = document.getElementById("projects-scroll-outer"),
    t = document.getElementById("project-grid");
  if (!e || !t) return;
  const o = e.getBoundingClientRect(),
    n = e.offsetHeight - window.innerHeight,
    r = -o.top;
  if (r < 0 || r > n) return;
  const a = r / n,
    c = t.scrollWidth,
    i = window.innerWidth,
    s = a * (c - i + 0.1 * i);
  t.style.transform = `translateX(-${s}px)`;
}
(window.addEventListener("resize", setupHorizontalScroll),
  window.addEventListener("scroll", () => {
    const e = document.getElementById("hero-content"),
      t = window.scrollY,
      o = window.innerHeight,
      n = document.documentElement.scrollHeight - o;
    let r = Math.min(t / o, 1),
      a = (t / n) * 100;
    window.innerWidth <= 768
      ? ((leftPanel.style.transform = `translate3d(0, -${100 * r}%, 0)`),
        (rightPanel.style.transform = `translate3d(0, ${100 * r}%, 0)`))
      : ((leftPanel.style.transform = `translate3d(-${100 * r}%, 0, 0)`),
        (rightPanel.style.transform = `translate3d(${100 * r}%, 0, 0)`));
    const c = document.querySelector(".scroll-progress-bar");
    (c && (c.style.height = a + "%"),
      e &&
        ((e.style.opacity = 1 - r),
        (e.style.transform = `translateY(-${50 * r}px)`)));
    const i = document.querySelector(".hero");
    (r >= 1
      ? ((i.style.pointerEvents = "none"),
        (i.style.opacity = "0"),
        (i.style.visibility = "hidden"))
      : ((i.style.pointerEvents = "all"),
        (i.style.opacity = "1"),
        (i.style.visibility = "visible")),
      updateHorizontalScroll());
  }),
  document.addEventListener("DOMContentLoaded", () => {
    initPortfolio();
    const e = document.getElementById("lang-toggle"),
      o = document.getElementById("lang-dropdown");
    e &&
      o &&
      (e.addEventListener("click", (e) => {
        (e.stopPropagation(), o.classList.toggle("active"));
      }),
      o.querySelectorAll("button[data-lang]").forEach((e) => {
        e.addEventListener("click", (t) => {
          t.stopPropagation();
          (setLanguage(e.getAttribute("data-lang")),
            o.classList.remove("active"));
        });
      }),
      document.addEventListener("click", (e) => {
        e.target.closest(".lang-switcher") || o.classList.remove("active");
      }));
    const refreshBtn = document.getElementById("refresh-projects");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        refreshBtn.classList.add("spinning");
        localStorage.removeItem("portfolioGithubData_v1.2");
        const grid = document.getElementById("project-grid");
        if (grid) grid.innerHTML = "";
        await initPortfolio();
        setTimeout(() => refreshBtn.classList.remove("spinning"), 500);
      });
    }
    const n = document.getElementById("hamburger"),
      r = document.getElementById("nav-links");
    n &&
      r &&
      (n.addEventListener("click", (e) => {
        (e.stopPropagation(),
          n.classList.toggle("active"),
          r.classList.toggle("active"));
      }),
      r.querySelectorAll("a").forEach((e) => {
        e.addEventListener("click", () => {
          (n.classList.remove("active"), r.classList.remove("active"));
        });
      }),
      document.addEventListener("click", (e) => {
        e.target.closest(".navbar") ||
          (n.classList.remove("active"), r.classList.remove("active"));
      }));
    const a = document.getElementById("contact-form");
    a &&
      a.addEventListener("submit", (e) => {
        e.preventDefault();
        const o = document.getElementById("contact-name").value,
          n = document.getElementById("contact-email").value,
          r = document.getElementById("contact-message").value,
          c = encodeURIComponent(`Portfolio Inquiry from ${o}`),
          i = encodeURIComponent(`Name: ${o}\nEmail: ${n}\n\nMessage:\n${r}`);
        window.location.href = `mailto:widifirmaan@outlook.com?subject=${c}&body=${i}`;
        const s = a.querySelector("button");
        s.innerText;
        ((s.innerText = t("contactSending")),
          (s.style.background = "#00E5FF"),
          setTimeout(() => {
            ((s.innerText = t("contactSend")),
              (s.style.background = ""),
              a.reset());
          }, 3e3));
      });
  }),
  "serviceWorker" in navigator &&
    navigator.serviceWorker.register("./sw.js").catch(() => {}),
  (window.loadMarked = function () {
    if ("undefined" == typeof marked) {
      var e = document.createElement("script");
      ((e.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js"),
        document.head.appendChild(e));
    }
  }));
