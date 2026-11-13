document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("ccc-episode-list");
  const search = document.getElementById("ccc-search");
  const clear = document.getElementById("ccc-clear");
  const sort = document.getElementById("ccc-sort");
  const count = document.getElementById("ccc-count");
  const total = document.getElementById("ccc-total");
  let episodes = [];
  let oldestFirst = false;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  function render() {
    const q = (search?.value || "").trim().toLowerCase();
    const rows = episodes.filter(e => [e.title,e.description,e.date,...(Array.isArray(e.tags)?e.tags:[])].join(" ").toLowerCase().includes(q))
      .sort((a,b) => oldestFirst
        ? String(a.sortDate || "").localeCompare(String(b.sortDate || ""))
        : String(b.sortDate || "").localeCompare(String(a.sortDate || "")));
    if (count) count.textContent = rows.length + (rows.length === 1 ? " episode" : " episodes");
    if (total) total.textContent = String(episodes.length).padStart(2,"0");
    if (clear) clear.hidden = !search.value;
    if (sort) sort.textContent = oldestFirst ? "Latest first ↓" : "Oldest first ↑";
    if (!list) return;
    if (!rows.length) {
      list.innerHTML = '<div class="nzart-empty"><strong>No episodes found</strong><span>Try another search, or check back as more episodes are added.</span></div>';
      return;
    }
    list.innerHTML = rows.map((e,index) => {
      const href = "/radio-audio/" + String(e.slug || "").split("/").map(encodeURIComponent).join("/") + "/";
      const tags = (Array.isArray(e.tags) ? e.tags : []).map(tag => '<span>'+esc(tag)+'</span>').join("");
      return '<a class="ccc-episode-card" href="'+esc(href)+'"><span class="ccc-episode-number">EPISODE '+String(index+1).padStart(2,"0")+'</span><span class="ccc-episode-copy"><strong>'+esc(e.title)+'</strong><small>'+esc(e.description || "")+'</small><span class="ccc-episode-tags">'+tags+'</span></span><span class="ccc-episode-arrow" aria-hidden="true">→</span></a>';
    }).join("");
  }
  search?.addEventListener("input", render);
  clear?.addEventListener("click", () => { search.value = ""; search.focus(); render(); });
  sort?.addEventListener("click", () => { oldestFirst = !oldestFirst; render(); });
  fetch("/radio-audio/recordings.json?v=20261113-2", {cache:"no-store"})
    .then(response => { if (!response.ok) throw new Error("Archive unavailable"); return response.json(); })
    .then(data => {
      episodes = Array.isArray(data) ? data.filter(e => e && e.published === true && e.collectionSlug === "coffee-coax-computers" && e.slug) : [];
      render();
    })
    .catch(() => {
      if (list) list.innerHTML = '<div class="nzart-empty"><strong>The episode archive could not be loaded</strong><span>Please refresh the page in a moment.</span></div>';
    });
});