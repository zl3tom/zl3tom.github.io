document.addEventListener("DOMContentLoaded", () => {
  const buttons = [...document.querySelectorAll("[data-category]")];
  const search = document.getElementById("recording-search");
  const list = document.getElementById("recording-list");
  const count = document.getElementById("recording-count");
  let records = [];
  let category = "all";
  const esc = value => String(value || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  function render() {
    const q = (search?.value || "").trim().toLowerCase();
    const matching = records.filter(r => (category === "all" || r.category === category) &&
      [r.title,r.description,r.categoryLabel,r.date].join(" ").toLowerCase().includes(q));
    if (count) count.textContent = matching.length + (matching.length === 1 ? " recording" : " recordings");
    if (!list) return;
    const nzart = matching.some(r => r.category === "special" && /NZART Official Broadcast/i.test(r.title));
    const other = matching.filter(r => !(r.category === "special" && /NZART Official Broadcast/i.test(r.title)));
    let cards = "";
    if (nzart) cards += '<a class="ra-collection-card ra-collection-link" href="/radio-audio/nzart/"><img src="https://i.postimg.cc/Hx5kLXwT/image.png" alt="" class="ra-collection-art"><span class="ra-collection-copy"><span class="ra-collection-label">OFFICIAL NZART PODCAST COLLECTION</span><strong>NZART Official Broadcasts</strong><small>74 monthly episodes · February 2020 – October 2026</small><span class="ra-collection-cta">Explore collection and listen <span aria-hidden="true">→</span></span></span><span class="ra-collection-chevron" aria-hidden="true">→</span></a>';
    other.forEach(r => { cards += '<article class="ra-collection-card ra-recording-card"><div class="ra-recording-card-copy"><span class="ra-collection-label">'+esc(r.categoryLabel || "RADIO AUDIO")+'</span><strong>'+esc(r.title)+'</strong><p>'+esc(r.description)+'</p></div></article>'; });
    list.innerHTML = cards || '<p class="ra-no-results">No recordings found in this category yet. Check back as the listening library grows.</p>';
  }
  buttons.forEach(button => button.addEventListener("click", () => {
    category = button.dataset.category || "all";
    buttons.forEach(item => { const active = item === button; item.classList.toggle("is-active",active); item.setAttribute("aria-pressed",String(active)); });
    render();
  }));
  search?.addEventListener("input",render);
  fetch("/radio-audio/recordings.json?v=20261031-3",{cache:"no-store"}).then(r => r.ok ? r.json() : []).then(data => {
    records = Array.isArray(data) ? data.filter(r => r && r.published === true) : [];
    render();
  }).catch(() => { if (list) list.innerHTML = '<p class="ra-no-results">The archive could not be loaded. Please refresh the page.</p>'; });
});