document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("ra-year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Recordings will be loaded from the archive data file as they are published.
  const categoryButtons = [...document.querySelectorAll("[data-category]")];
  const searchInput = document.getElementById("recording-search");
  const list = document.getElementById("recording-list");
  const count = document.getElementById("recording-count");
  let selectedCategory = "all";
  let recordings = [];

  function render() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const filtered = recordings.filter((recording) => {
      const categoryMatch = selectedCategory === "all" || recording.category === selectedCategory;
      const text = [recording.title, recording.description, recording.categoryLabel, recording.date].join(" ").toLowerCase();
      return categoryMatch && (!query || text.includes(query));
    });

    if (count) count.textContent = recordings.length === 1 ? "1 recording" : recordings.length + " recordings";
    if (!list) return;
    if (recordings.length === 0) return;
    if (filtered.length === 0) {
      list.innerHTML = '<p class="ra-no-results">No recordings match that search. Try another title or category.</p>';
      return;
    }

    list.innerHTML = filtered.map((recording) => {
      const title = escapeHtml(recording.title || "Untitled recording");
      const description = escapeHtml(recording.description || "");
      const date = escapeHtml(recording.date || "");
      const category = escapeHtml(recording.categoryLabel || "Radio Audio");
      const source = safeAudioUrl(recording.audioUrl);
      const image = safeImageUrl(recording.imageUrl);
      const article = safeArticleUrl(recording.articleUrl);
      const artwork = image ? '<img class="ra-podcast-art" src="' + image + '" alt="' + title + ' cover artwork" loading="lazy">' : '<div class="ra-card-art" aria-hidden="true">♫</div>';
      const linkedTitle = article ? '<a href="' + article + '" target="_blank" rel="noopener noreferrer">' + title + ' <span aria-hidden="true">↗</span></a>' : title;
      return '<article class="ra-card ra-podcast-card">' + artwork + '<div class="ra-card-body"><div class="ra-card-meta"><span>' + date + '</span><span> PODCAST</span></div><h3>' + linkedTitle + '</h3><p>' + description + '</p><span class="ra-card-category">' + category + '</span>' + (source ? '<audio controls preload="none" src="' + source + '">Your browser does not support audio playback.</audio>' : '') + '</div></article>';
    }).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
  }

  function safeAudioUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && (url.hostname === "archive.org" || url.hostname.endsWith(".archive.org") || url.hostname === "nzart.org.nz") ? escapeHtml(url.href) : "";
    } catch { return ""; }
  }

  function safeImageUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "i.postimg.cc" ? escapeHtml(url.href) : "";
    } catch { return ""; }
  }

  function safeArticleUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "nzart.org.nz" ? escapeHtml(url.href) : "";
    } catch { return ""; }
  }

  categoryButtons.forEach((button) => button.addEventListener("click", () => {
    selectedCategory = button.dataset.category || "all";
    categoryButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    render();
  }));
  searchInput?.addEventListener("input", render);

  fetch("/radio-audio/recordings.json?v=20261031-1", { cache: "no-store" })
    .then((response) => response.ok ? response.json() : [])
    .then((data) => {
      recordings = Array.isArray(data) ? data.filter((item) => item && item.published === true) : [];
      render();
    })
    .catch(() => render());
});