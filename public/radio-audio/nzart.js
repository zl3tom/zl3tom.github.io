document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("nzart-list");
  const count = document.getElementById("nzart-count");
  const audio = document.getElementById("nzart-audio");
  const title = document.getElementById("nzart-title");
  const status = document.getElementById("nzart-status");
  const download = document.getElementById("nzart-download");
  let episodes = [];
  let active = -1;

  const safeAudioUrl = value => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" &&
        (url.hostname === "nzart.org.nz" || url.hostname.endsWith(".nzart.org.nz")) &&
        /\\.mp3$/i.test(url.pathname) ? url.href : "";
    } catch { return ""; }
  };
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  })[char]);

  function chooseEpisode(index, play) {
    const episode = episodes[index];
    if (!episode) return;
    const url = safeAudioUrl(episode.audioUrl);
    if (!url) {
      status.textContent = "This episode does not have a valid audio link.";
      return;
    }
    active = index;
    audio.pause();
    audio.src = url;
    audio.load();
    title.textContent = episode.title;
    status.textContent = "Selected: " + episode.date + ". Press play to listen.";
    download.href = url;
    download.hidden = false;
    list.querySelectorAll(".ra-episode").forEach(row => {
      const selected = Number(row.dataset.index) === index;
      row.classList.toggle("is-current", selected);
      row.setAttribute("aria-pressed", String(selected));
    });
    if (play) {
      const attempt = audio.play();
      if (attempt && typeof attempt.then === "function") {
        attempt.then(() => { status.textContent = "Playing " + episode.date; })
          .catch(() => { status.textContent = "Playback was blocked or the audio source could not be loaded. Use the play button on the audio player to try again."; });
      }
    }
  }

  audio.addEventListener("playing", () => { status.textContent = "Now playing."; });
  audio.addEventListener("pause", () => {
    if (active >= 0 && audio.currentTime > 0 && !audio.ended) status.textContent = "Playback paused.";
  });
  audio.addEventListener("ended", () => {
    if (active >= 0 && active < episodes.length - 1) chooseEpisode(active + 1, true);
    else status.textContent = "You have reached the oldest broadcast in this archive.";
  });
  audio.addEventListener("error", () => {
    status.textContent = "This audio file could not be played. Try another episode; the NZART source may be temporarily unavailable.";
  });

  fetch("/radio-audio/recordings.json?v=20261031-4", { cache: "no-store" })
    .then(response => { if (!response.ok) throw new Error("Archive request failed"); return response.json(); })
    .then(data => {
      episodes = Array.isArray(data) ? data
        .filter(episode => episode && episode.published && safeAudioUrl(episode.audioUrl) &&
          /NZART Official Broadcast/i.test(episode.title))
        .sort((a, b) => String(b.sortDate || "").localeCompare(String(a.sortDate || ""))) : [];
      count.textContent = episodes.length + " monthly episodes";
      if (!episodes.length) {
        list.innerHTML = "<p>No playable episodes are currently listed.</p>";
        status.textContent = "No episodes are available.";
        return;
      }
      list.innerHTML = episodes.map((episode, index) =>
        '<button class="ra-episode" type="button" data-index="' + index + '" aria-pressed="false">' +
          '<span class="ra-episode-play" aria-hidden="true">▶</span>' +
          '<span class="ra-episode-copy"><strong>' + escapeHtml(episode.title) + '</strong>' +
          '<small>' + escapeHtml(episode.date) + '</small></span>' +
          '<span class="ra-episode-action">Play</span></button>'
      ).join("");
      list.querySelectorAll(".ra-episode").forEach(row =>
        row.addEventListener("click", () => chooseEpisode(Number(row.dataset.index), true))
      );
      // Load the newest episode into the player without autoplaying.
      chooseEpisode(0, false);
    })
    .catch(() => {
      list.innerHTML = "<p>The NZART archive could not be loaded. Please refresh the page.</p>";
      status.textContent = "Unable to load the episode list.";
    });
});
