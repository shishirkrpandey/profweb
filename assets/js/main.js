(() => {
  const storageKey = "prof-site-theme";
  const themeToggle = document.querySelector("[data-theme-toggle]");

  const getStoredTheme = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const getPreferredTheme = () => {
    const stored = getStoredTheme();
    if (stored === "light" || stored === "dark") return stored;
    // Default to light mode when there is no stored preference
    return "light";
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
      themeToggle.innerHTML = theme === "dark" ? "☀" : "☾";
    }
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      /* ignore */
    }
  };

  const initTheme = () => {
    const theme = getPreferredTheme();
    applyTheme(theme);
  };

  const fetchJSON = async (path) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return response.json();
  };

  const retargetExternalLinks = () => {
    const origin = window.location.origin;
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      const isExternal =
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//");
      if (isExternal && !href.startsWith(origin)) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
      }
    });
  };

  const renderNews = (items) => {
    const container = document.getElementById("news-list");
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) {
      container.innerHTML = "<li class='news-item'>No announcements yet.</li>";
      return;
    }
    items
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .forEach((item) => {
        const li = document.createElement("li");
        li.className = "news-item card";
        li.innerHTML = `
          <div class="news-item__date">${item.date}</div>
          <div class="news-item__title"><strong>${item.title}</strong></div>
          <div class="muted">${item.summary || ""}</div>
          ${
            item.link
              ? `<div class="link-row"><a class="resource-link" href="${item.link}">Details</a></div>`
              : ""
          }
        `;
        container.appendChild(li);
      });
  };

  const renderTeaching = (courses, options = {}) => {
    const { emptyMessage } = options;
    const container = document.getElementById("teaching-list");
    if (!container) return;
    container.innerHTML = "";
    if (!courses.length) {
      container.innerHTML = `<p class='muted'>${
        emptyMessage || "No teaching items yet. Update data/teaching.json."
      }</p>`;
      return;
    }
    courses.forEach((course) => {
      const section = document.createElement("article");
      section.className = "card";
      const resources = (course.resources || [])
        .map(
          (res) =>
            `<li><a class="resource-link" href="${res.file}">${res.label}</a></li>`
        )
        .join("");
      section.innerHTML = `
        <h3>${course.course}</h3>
        <div class="muted">${course.term}</div>
        <p>${course.description || ""}</p>
        ${
          resources
            ? `<ul class="resources" aria-label="Course materials">${resources}</ul>`
            : ""
        }
      `;
      container.appendChild(section);
    });
  };

  const setupTeachingSearch = (courses) => {
    const input = document.getElementById("teaching-search");
    const clearBtn = document.getElementById("teaching-search-clear");
    if (!input) return;

    const updateClearState = (hasText) => {
      if (clearBtn) {
        clearBtn.disabled = !hasText;
      }
    };

    const applyFilter = () => {
      const rawQuery = input.value || "";
      const query = rawQuery.trim().toLowerCase();
      updateClearState(Boolean(query));
      if (!query) {
        renderTeaching(courses);
        return;
      }
      const filtered = courses.filter((course) => {
        const haystack = [
          course.course || "",
          course.term || "",
          course.description || "",
          ...(course.resources || []).map((res) => res.label || ""),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
      renderTeaching(filtered, {
        emptyMessage: `No courses match “${rawQuery.trim()}”.`,
      });
    };

    input.addEventListener("input", applyFilter);
    clearBtn?.addEventListener("click", () => {
      input.value = "";
      input.focus();
      applyFilter();
    });

    updateClearState(false);
  };

  const renderPublications = (data, sortMode = "newest") => {
    const container = document.getElementById("publications-list");
    if (!container) return;
    container.innerHTML = "";

    const sortItems = (items) => {
      if (sortMode === "oldest") return items.slice().sort((a, b) => (a.year > b.year ? 1 : -1));
      if (sortMode === "title") return items.slice().sort((a, b) => a.title.localeCompare(b.title));
      return items.slice().sort((a, b) => (a.year < b.year ? 1 : -1)); // newest default
    };

    const addSection = (title, items) => {
      const section = document.createElement("section");
      section.className = "pub-section";
      section.innerHTML = `<div class="badge">${title}</div>`;
      if (!items.length) {
        section.innerHTML += `<p class="muted">No entries yet.</p>`;
        container.appendChild(section);
        return;
      }
      sortItems(items).forEach((pub) => {
        const div = document.createElement("div");
        div.className = "card publication";
        div.innerHTML = `
          <div class="pub-main">
            <h3>${pub.title}</h3>
            <div class="publication__meta">${pub.authors}</div>
            <div class="publication__meta">${pub.venue}</div>
          </div>
          <div class="pub-right">
            <span class="tag-year">${pub.year || ""}</span>
            <div class="link-row">
              ${pub.pdf ? `<a class="resource-link" href="${pub.pdf}">PDF</a>` : ""}
              ${pub.link ? `<a class="resource-link" href="${pub.link}">Link</a>` : ""}
              ${pub.bibtex ? `<a class="resource-link" href="${pub.bibtex}">BibTeX</a>` : ""}
            </div>
          </div>
        `;
        section.appendChild(div);
      });
      container.appendChild(section);
    };

    addSection("Preprints / In Communication", data.preprints || []);
    addSection("Peer-reviewed", data.peerReviewed || []);
  };

  const renderPresentations = (talks) => {
    const container = document.getElementById("presentations-list");
    if (!container) return;
    container.innerHTML = "";
    if (!talks.length) {
      container.innerHTML =
        "<p class='muted'>No presentations yet. Update data/presentations.json.</p>";
      return;
    }
    talks.forEach((talk) => {
      const item = document.createElement("article");
      item.className = "card";
      item.innerHTML = `
        <h3>${talk.title}</h3>
        <div class="muted">${talk.event} · ${talk.date}</div>
        ${
          talk.file
            ? `<div class="link-row"><a class="resource-link" href="${talk.file}">Slides</a></div>`
            : ""
        }
      `;
      container.appendChild(item);
    });
  };

  const renderResearch = (data) => {
    const leadEl = document.getElementById("research-lead");
    const topicsEl = document.getElementById("research-topics");
    if (!leadEl && !topicsEl) return;
    if (leadEl) leadEl.textContent = data.lead || "";
    if (topicsEl) {
      topicsEl.innerHTML = "";
      (data.topics || []).forEach((topic) => {
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `
          <h3>${topic.title}</h3>
          <p>${topic.summary || ""}</p>
        `;
        topicsEl.appendChild(card);
      });
      if (!(data.topics || []).length) {
        topicsEl.innerHTML = "<p class='muted'>No research topics added yet.</p>";
      }
    }
  };

  const loadData = async () => {
    try {
      if (document.getElementById("news-list")) {
        const news = await fetchJSON("data/news.json");
        renderNews(news);
      }
      if (document.getElementById("teaching-list")) {
        const teaching = await fetchJSON("data/teaching.json");
        window.__teachingData = teaching;
        renderTeaching(teaching);
        setupTeachingSearch(teaching);
      }
      if (document.getElementById("publications-list")) {
        const pubs = await fetchJSON("data/publications.json");
        window.__pubsData = pubs;
        const select = document.getElementById("pub-sort");
        const initialSort = select?.value || "newest";
        renderPublications(pubs, initialSort);
        if (select) {
          select.addEventListener("change", (e) => {
            renderPublications(window.__pubsData, e.target.value);
            retargetExternalLinks();
          });
        }
      }
      if (document.getElementById("presentations-list")) {
        const talks = await fetchJSON("data/presentations.json");
        renderPresentations(talks);
      }
      if (document.getElementById("research-topics")) {
        const research = await fetchJSON("data/research.json");
        renderResearch(research);
      }
      retargetExternalLinks();
    } catch (error) {
      console.error(error);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();

    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    const navOverlay = document.querySelector(".nav-overlay");
    const navClose = document.querySelector(".nav-close");
    const closeNav = () => {
      navLinks?.classList.remove("open");
      navOverlay?.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    };
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        navOverlay?.classList.toggle("open", isOpen);
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      navOverlay?.addEventListener("click", closeNav);
      navClose?.addEventListener("click", closeNav);
      navLinks.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", closeNav)
      );
      window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
          closeNav();
        }
      });
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeNav();
      });
    }

    themeToggle?.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
    loadData();
  });
})();
