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
    const nzart = matching.some(r => r.category === "special" && /NZART Official Broadcast/i.test(r.title));
    const worldDay = matching.some(r => r.collectionSlug === "world-amateur-radio-day");
    const ariss = matching.some(r => r.collectionSlug === "ariss");
    const wia = matching.some(r => r.collectionSlug === "wia-news");
    const arrl = matching.some(r => r.collectionSlug === "arrl-on-the-air");
    const arrlNews = matching.some(r => r.collectionSlug === "arrl-audio-news");
    const other = matching.filter(r => !(r.category === "special" && /NZART Official Broadcast/i.test(r.title)) && !["world-amateur-radio-day","ariss","wia-news","arrl-on-the-air","arrl-audio-news"].includes(r.collectionSlug));
    const visibleCount = (nzart ? 1 : 0) + (worldDay ? 1 : 0) + (ariss ? 1 : 0) + (wia ? 1 : 0) + (arrl ? 1 : 0) + (arrlNews ? 1 : 0) + other.length;
    if (count) count.textContent = visibleCount + (visibleCount === 1 ? " item shown" : " items shown");
    if (!list) return;
    const cards = [];
    if (ariss) cards.push({title:"ARISS Audio Archive",html:'<a class="ra-collection-card ra-collection-link" href="https://zl3tom.com/radio-audio/ariss/index.html"><img src="https://i.postimg.cc/QMZ9YRyg/image.png" alt="" class="ra-collection-art"><span class="ra-collection-copy"><span class="ra-collection-label">ARISS · AMATEUR RADIO ON THE ISS</span><strong>ARISS Audio Archive</strong><small>Explore recordings of Amateur Radio on the International Space Station, featuring contacts between astronauts, students and amateur radio operators around the world.</small><span class="ra-collection-cta">Browse ARISS recordings <span aria-hidden="true">→</span></span></span><span class="ra-collection-chevron" aria-hidden="true">→</span></a>'});
    if (nzart) cards.push({title:"NZART Official Broadcasts",html:'<a class="ra-collection-card ra-collection-link" href="/radio-audio/nzart/"><img src="https://i.postimg.cc/Hx5kLXwT/image.png" alt="" class="ra-collection-art"><span class="ra-collection-copy"><span class="ra-collection-label">OFFICIAL NZART PODCAST COLLECTION</span><strong>NZART Official Broadcasts</strong><small>Monthly NZART news, association updates and amateur radio reports from across New Zealand.</small><span class="ra-collection-cta">Browse available episodes and listen <span aria-hidden="true">→</span></span></span><span class="ra-collection-chevron" aria-hidden="true">→</span></a>'});
    if (wia) cards.push({title:"WIA News",html:'<a class="ra-collection-card ra-collection-link" href="/radio-audio/wia-news/"><img src="https://i.postimg.cc/G2VKvJky/image.png" alt="" class="ra-collection-art"><span class="ra-collection-copy"><span class="ra-collection-label">WIRELESS INSTITUTE OF AUSTRALIA · PODCAST</span><strong>WIA News</strong><small>Weekly amateur radio news and association updates from Australia.</small><span class="ra-collection-cta">Listen to the latest broadcasts <span aria-hidden="true">→</span></span></span><span class="ra-collection-chevron" aria-hidden="true">→</span></a>'});
    if (arrl) cards.push({title:"ARRL - On The Air",html:'<a class="ra-collection-card ra-collection-link" href="/radio-audio/arrl-on-the-air/"><img src="https://i.postimg.cc/2j16Sp2q/a-HR0c-HM6Ly9hc3Nld-HMu-Ymx1Yn-Jye-S5jb20v-Y292ZXJhcn-Qvb3Jp-Zy85Mz-A0NDkt-Nz-Ix-Nj-Mx-Lmpw-Zw.webp" alt="ARRL - On The Air podcast cover" class="ra-collection-art"><span class="ra-collection-copy"><span class="ra-collection-label">ARRL · ON THE AIR PODCAST</span><strong>ARRL - On The Air</strong><small>The monthly On the Air podcast is a companion to ARRL’s magazine for beginner-to-intermediate amateur radio operators.</small><span class="ra-collection-cta">Browse episodes and listen <span aria-hidden="true">→</span></span></span><span class="ra-collection-chevron" aria-hidden="true">→</span></a>'});
    if (arrlNews) cards.push({title:"ARRL Audio News",html:'<a class="ra-collection-card ra-collection-link" href="/radio-audio/arrl-audio-news/"><img src="https://assets.blubrry.com/coverart/orig/28672-252658.jpg" alt="ARRL Audio News podcast cover" class="ra-collection-art"><span class="ra-collection-copy"><span class="ra-collection-label">ARRL · WEEKLY AUDIO NEWS</span><strong>ARRL Audio News</strong><small>Weekly amateur radio news and events from ARRL, the National Association for Amateur Radio. This podcast contains no music, so it can be aired over amateur radio repeaters.</small><span class="ra-collection-cta">Browse episodes and listen <span aria-hidden="true">→</span></span></span><span class="ra-collection-chevron" aria-hidden="true">→</span></a>'});
    if (worldDay) cards.push({title:"World Amateur Radio Day",html:'<a class="ra-collection-card ra-collection-link" href="/radio-audio/world-amateur-radio-day/"><img src="https://i.postimg.cc/gk4LtXHT/image.png" alt="" class="ra-collection-art"><span class="ra-collection-copy"><span class="ra-collection-label">RADIO EVENTS · ANNUAL COLLECTION</span><strong>World Amateur Radio Day</strong><small>Recordings and celebrations from World Amateur Radio Day, held each year on 18 April.</small><span class="ra-collection-cta">Browse recordings by year <span aria-hidden="true">→</span></span><span class="ra-collection-formats">Available downloads: M4A · MP3</span></span><span class="ra-collection-chevron" aria-hidden="true">→</span></a>'});
    other.forEach(r => { const href = r.slug ? "/radio-audio/" + encodeURIComponent(r.slug) + "/" : ""; const card = '<div class="ra-collection-card ra-recording-card"><img src="'+esc(r.imageUrl || "")+'" alt="" class="ra-collection-art" loading="lazy"><div class="ra-recording-card-copy"><span class="ra-collection-label">'+esc(r.categoryLabel || "RADIO AUDIO")+'</span><strong>'+esc(r.title)+'</strong><p>'+esc(r.description)+'</p>'+(href?'<span class="ra-collection-cta">Listen to recording <span aria-hidden="true">→</span></span>':"")+'</div></div>'; cards.push({title:r.title || "",html:href ? '<a class="ra-recording-link" href="'+href+'" style="text-decoration:none;color:inherit">'+card+'</a>' : card}); });
    cards.sort((a,b) => a.title.localeCompare(b.title, undefined, {sensitivity:"base"}));
    list.innerHTML = cards.map(card => card.html).join("") || '<p class="ra-no-results">No recordings are available in this selection yet. Choose another category or check back as the library grows.</p>';
  }
  buttons.forEach(button => button.addEventListener("click", () => {
    category = button.dataset.category || "all";
    buttons.forEach(item => { const active = item === button; item.classList.toggle("is-active",active); item.setAttribute("aria-pressed",String(active)); });
    render();
  }));
  search?.addEventListener("input",render);
  fetch("/radio-audio/recordings.json?v=20261103-2",{cache:"no-store"}).then(r => r.ok ? r.json() : []).then(data => {
    records = Array.isArray(data) ? data.filter(r => r && r.published === true) : [];
    render();
  }).catch(() => { if (list) list.innerHTML = '<p class="ra-no-results">The archive could not be loaded. Please refresh the page.</p>'; });
});