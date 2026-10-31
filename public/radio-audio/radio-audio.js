document.addEventListener("DOMContentLoaded", () => {
  const categoryButtons = [...document.querySelectorAll("[data-category]")];
  const searchInput = document.getElementById("recording-search");
  const list = document.getElementById("recording-list");
  const count = document.getElementById("recording-count");
  let selectedCategory = "all";
  let recordings = [];
  let collectionOpen = false;
  let activeIndex = -1;

  const audio = new Audio();
  audio.preload = "metadata";
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateProgress);
  audio.addEventListener("durationchange", updateProgress);
  audio.addEventListener("play", updatePlayButton);
  audio.addEventListener("pause", updatePlayButton);
  audio.addEventListener("ended", () => {
    updatePlayButton();
    if (activeIndex > 0) selectEpisode(activeIndex - 1, true);
  });
  audio.addEventListener("error", () => {
    const status = document.getElementById("ra-player-status");
    if (status) status.textContent = "Unable to load this episode. Please try another recording.";
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    })[character]);
  }
  function safeAudioUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "nzart.org.nz" && url.pathname.endsWith(".mp3") ? url.href : "";
    } catch { return ""; }
  }
  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2,"0");
    return mins + ":" + secs;
  }
  function updateProgress() {
    const progress = document.getElementById("ra-progress");
    const current = document.getElementById("ra-current-time");
    const duration = document.getElementById("ra-duration");
    if (!progress) return;
    progress.max = Number.isFinite(audio.duration) ? audio.duration : 0;
    progress.value = audio.currentTime || 0;
    progress.style.setProperty("--progress", progress.max ? (progress.value / progress.max * 100) + "%" : "0%");
    if (current) current.textContent = formatTime(audio.currentTime);
    if (duration) duration.textContent = formatTime(audio.duration);
  }
  function updatePlayButton() {
    const button = document.getElementById("ra-play");
    if (!button) return;
    button.textContent = audio.paused ? "▶" : "Ⅱ";
    button.setAttribute("aria-label", audio.paused ? "Play audio" : "Pause audio");
  }
  function selectEpisode(index, autoplay) {
    const episode = recordings[index];
    if (!episode) return;
    const source = safeAudioUrl(episode.audioUrl);
    if (!source) return;
    activeIndex = index;
    audio.src = source;
    audio.load();
    const title = document.getElementById("ra-player-title");
    const status = document.getElementById("ra-player-status");
    if (title) title.textContent = episode.title;
    if (status) status.textContent = "Ready to play";
    document.querySelectorAll(".ra-episode").forEach((button) => {
      const active = Number(button.dataset.index) === index;
      button.classList.toggle("is-current", active);
      button.setAttribute("aria-current", active ? "true" : "false");
    });
    updateProgress();
    updatePlayButton();
    if (autoplay) {
      audio.play().then(() => {
        if (status) status.textContent = "Now playing";
      }).catch(() => {
        if (status) status.textContent = "Press play to start listening";
      });
    }
    const player = document.getElementById("ra-player");
    if (player) player.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  function render() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const filtered = recordings.map((episode,index)=>({episode,index})).filter(({episode}) => {
      const categoryMatch = selectedCategory === "all" || episode.category === selectedCategory;
      const text = [episode.title,episode.description,episode.categoryLabel,episode.date].join(" ").toLowerCase();
      return categoryMatch && (!query || text.includes(query));
    });
    if (count) count.textContent = recordings.length + (recordings.length === 1 ? " recording" : " recordings");
    if (!list) return;
    if (!recordings.length) {
      list.innerHTML = '<div class="ra-empty"><span class="ra-empty-icon" aria-hidden="true">♫</span><p class="ra-kicker">THE ARCHIVE IS GETTING READY</p><h3>Recordings coming soon</h3><p>The listening library is being prepared.</p></div>';
      return;
    }
    const episodes = filtered.map(({episode,index}) =>
      '<button class="ra-episode" type="button" data-index="' + index + '"><span class="ra-episode-play" aria-hidden="true">▶</span><span class="ra-episode-copy"><strong>' + escapeHtml(episode.title) + '</strong><small>' + escapeHtml(episode.date || "") + '</small></span><span class="ra-episode-action">Listen <span aria-hidden="true">›</span></span></button>'
    ).join("");
    list.innerHTML =
      '<article class="ra-collection-card">' +
        '<button class="ra-collection-toggle" id="ra-collection-toggle" type="button" aria-expanded="' + collectionOpen + '">' +
          '<img src="https://i.postimg.cc/Hx5kLXwT/image.png" alt="" class="ra-collection-art">' +
          '<span class="ra-collection-copy"><span class="ra-collection-label">OFFICIAL NZART ARCHIVE</span><strong>NZART Official Broadcasts</strong><small>' + recordings.length + ' monthly episodes · February 2020 – October 2026</small></span>' +
          '<span class="ra-collection-chevron" aria-hidden="true">' + (collectionOpen ? "−" : "+") + '</span>' +
        '</button>' +
        (collectionOpen ? '<div class="ra-collection-content">' +
          '<section class="ra-player" id="ra-player" aria-label="NZART audio player">' +
            '<div class="ra-player-heading"><span class="ra-player-live-dot"></span><span>NOW LISTENING ON ZL3TOM</span></div>' +
            '<h3 id="ra-player-title">Choose an episode below</h3>' +
            '<p id="ra-player-status" role="status">Select a monthly broadcast to begin.</p>' +
            '<div class="ra-player-controls"><button id="ra-play" class="ra-play-button" type="button" aria-label="Play audio" disabled>▶</button><div class="ra-track-controls"><input id="ra-progress" class="ra-progress" type="range" min="0" max="0" value="0" step="1" aria-label="Seek audio"><div class="ra-time-row"><span id="ra-current-time">0:00</span><span id="ra-duration">0:00</span></div></div><label class="ra-volume-label" for="ra-volume">VOL</label><input id="ra-volume" class="ra-volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume"></div>' +
          '</section>' +
          '<div class="ra-episode-heading"><strong>All monthly broadcasts</strong><span>Newest first</span></div>' +
          '<div class="ra-episode-list">' + (episodes || '<p class="ra-no-results">No episodes match that search.</p>') + '</div>' +
        '</div>' : '') +
      '</article>';
    document.getElementById("ra-collection-toggle")?.addEventListener("click", () => {
      collectionOpen = !collectionOpen;
      render();
    });
    document.querySelectorAll(".ra-episode").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      selectEpisode(index,true);
    }));
    const play = document.getElementById("ra-play");
    if (play) {
      play.disabled = activeIndex < 0;
      play.addEventListener("click", () => {
        if (audio.paused) audio.play().catch(() => {
          const status = document.getElementById("ra-player-status");
          if (status) status.textContent = "Playback could not start. Please try again.";
        });
        else audio.pause();
      });
    }
    document.getElementById("ra-progress")?.addEventListener("input", (event) => {
      if (Number.isFinite(audio.duration)) audio.currentTime = Number(event.target.value);
    });
    document.getElementById("ra-volume")?.addEventListener("input", (event) => {
      audio.volume = Number(event.target.value);
    });
    updatePlayButton();
    updateProgress();
    if (activeIndex >= 0) {
      const selected = document.querySelector('.ra-episode[data-index="' + activeIndex + '"]');
      if (selected) selected.classList.add("is-current");
      const title = document.getElementById("ra-player-title");
      if (title) title.textContent = recordings[activeIndex].title;
      const playButton = document.getElementById("ra-play");
      if (playButton) playButton.disabled = false;
    }
  }
  categoryButtons.forEach((button) => button.addEventListener("click", () => {
    selectedCategory = button.dataset.category || "all";
    categoryButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active",active);
      item.setAttribute("aria-pressed",String(active));
    });
    render();
  }));
  searchInput?.addEventListener("input",render);
  fetch("/radio-audio/recordings.json?v=20261031-2",{cache:"no-store"})
    .then(response => response.ok ? response.json() : [])
    .then(data => {
      recordings = Array.isArray(data) ? data.filter(item => item && item.published === true && safeAudioUrl(item.audioUrl)).sort((a,b)=>(b.sortDate||"").localeCompare(a.sortDate||"")) : [];
      render();
    })
    .catch(() => render());
});
