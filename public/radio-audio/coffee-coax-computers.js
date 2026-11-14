document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const videoTab = $("ccc-video-tab");
  const audioTab = $("ccc-audio-tab");
  const videoPanel = $("ccc-video-panel");
  const audioPanel = $("ccc-audio-panel");
  const videoFrame = $("ccc-video-frame");

  const audio = $("ccc-audio");
  const play = $("ccc-play");
  const playIcon = $("ccc-play-icon");
  const seek = $("ccc-seek");
  const current = $("ccc-current");
  const duration = $("ccc-duration");
  const volume = $("ccc-volume");
  const speedButton = $("ccc-speed");
  const state = $("ccc-player-state");
  const message = $("ccc-audio-message");
  const download = $("ccc-download");
  const title = $("ccc-player-title");
  const status = $("ccc-player-status");

  const audioUrl = "https://ia601807.us.archive.org/1/items/news-coffee-coax-computers-qso-one-developer-frank-kd-8-jkk-reveals-whats-next-a/news%20-%20Coffee%2C%20Coax%20%26%20Computers%20-%20QSO%20One%20Developer%20Frank%20KD8JKK%20Reveals%20What's%20Next%21%20%EF%BD%9C%20App%20Store%20Announcement%20%26%20Interview.mp3";
  const videoUrl = "https://www.youtube-nocookie.com/embed/aBx0-Kt4aZg?enablejsapi=1&origin=https%3A%2F%2Fzl3tom.com&rel=0";
  const speeds = [1, 1.25, 1.5, 1.75, 2, 0.75];


  let speedIndex = 0;
  let seeking = false;
  let videoPlayer = null;
  const playTrackers = {
    "qso-one-audio": { elapsed: 0, startedAt: null, timer: null, counted: false },
    "qso-one-video": { elapsed: 0, startedAt: null, timer: null, counted: false }
  };

  const playLabels = {
    "qso-one-audio": $("ccc-audio-plays"),
    "qso-one-video": $("ccc-video-plays")
  };

  function updatePlayCounts(counts) {
    for (const [mediaId, label] of Object.entries(playLabels)) {
      if (label && Number.isFinite(counts?.[mediaId])) {
        const name = mediaId.endsWith("-audio") ? "Audio" : "Video";
        label.textContent = name + " plays: " + counts[mediaId].toLocaleString();
      }
    }
  }

  async function loadPlayCounts() {
    try {
      const response = await fetch("/api/media-plays", { cache: "no-store" });
      if (!response.ok) throw new Error("Play counts unavailable");
      const result = await response.json();
      updatePlayCounts(result.counts);
    } catch {
      for (const label of Object.values(playLabels)) {
        if (label) label.textContent = "Play count unavailable";
      }
    }
  }

  async function recordMediaPlay(mediaId) {
    const tracker = playTrackers[mediaId];
    if (!tracker || tracker.counted) return;

    tracker.counted = true;

    try {
      const response = await fetch("/api/media-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId })
      });

      if (!response.ok) throw new Error("Could not record playback");

      const result = await response.json();
      updatePlayCounts(result.counts);
    } catch {
      tracker.counted = false;
    }
  }

  function stopPlayTimer(mediaId) {
    const tracker = playTrackers[mediaId];
    if (!tracker || tracker.startedAt === null) return;

    tracker.elapsed += (performance.now() - tracker.startedAt) / 1000;
    tracker.startedAt = null;
    clearInterval(tracker.timer);
    tracker.timer = null;
  }

  function resetPlaySession(mediaId) {
    const tracker = playTrackers[mediaId];
    if (!tracker) return;

    stopPlayTimer(mediaId);
    tracker.elapsed = 0;
    tracker.counted = false;
  }

  function startPlayTimer(mediaId) {
    const tracker = playTrackers[mediaId];
    if (!tracker || tracker.startedAt !== null || tracker.counted) return;

    tracker.startedAt = performance.now();

    tracker.timer = setInterval(() => {
      const total = tracker.elapsed +
        (performance.now() - tracker.startedAt) / 1000;

      if (total >= 10) {
        stopPlayTimer(mediaId);
        recordMediaPlay(mediaId);
      }
    }, 250);
  }

  function loadYouTubeApi() {
    if (window.YT && window.YT.Player) {
      initialiseYouTubePlayer();
      return;
    }

    if (document.querySelector('script[data-zl3tom-youtube-api]')) return;

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.dataset.zl3tomYoutubeApi = "true";
    document.head.appendChild(script);
  }

  function initialiseYouTubePlayer() {
    if (!window.YT || !window.YT.Player || videoPlayer) return;

    videoPlayer = new window.YT.Player("ccc-video-frame", {
      events: {
        onStateChange(event) {
          if (event.data === window.YT.PlayerState.PLAYING) {
            startPlayTimer("qso-one-video");
          } else {
            stopPlayTimer("qso-one-video");

            if (event.data === window.YT.PlayerState.ENDED) {
              resetPlaySession("qso-one-video");
            }
          }
        }
      }
    });
  }

  const previousYouTubeReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () {
    if (typeof previousYouTubeReady === "function") {
      previousYouTubeReady();
    }
    initialiseYouTubePlayer();
  };

  loadPlayCounts();
  loadYouTubeApi();

  const formatTime = value => {
    if (!Number.isFinite(value) || value < 0) return "--:--";

    const seconds = Math.floor(value);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remaining = seconds % 60;

    return hours
      ? hours + ":" + String(minutes).padStart(2, "0") + ":" + String(remaining).padStart(2, "0")
      : minutes + ":" + String(remaining).padStart(2, "0");
  };

  function setMessage(text, label) {
    message.textContent = text;
    if (label) state.textContent = label;
  }

  function selectMode(mode) {
    const isVideo = mode === "video";

    videoPanel.hidden = !isVideo;
    audioPanel.hidden = isVideo;

    videoTab.classList.toggle("is-active", isVideo);
    audioTab.classList.toggle("is-active", !isVideo);

    videoTab.setAttribute("aria-pressed", String(isVideo));
    audioTab.setAttribute("aria-pressed", String(!isVideo));

    title.textContent = isVideo ? "Watch the video" : "Listen to the audio";
    status.textContent = isVideo ? "VIDEO · YOUTUBE" : "AUDIO · MP3";

    if (isVideo) {
      audio.pause();
    } else {
      // Stop video playback when switching to audio.
      if (videoPlayer && typeof videoPlayer.pauseVideo === "function") {
        videoPlayer.pauseVideo();
      }
    }
  }

  async function startPlayback() {
    try {
      await audio.play();
    } catch (error) {
      setMessage(
        error?.name === "NotAllowedError"
          ? "Press Play to start listening."
          : "The recording could not start. Use the download link to open the MP3.",
        "PLAYBACK NEEDS A TAP"
      );
    }
  }

  audio.src = audioUrl;
  audio.volume = Number(volume.value);
  download.href = audioUrl;
  audio.load();

  videoTab.addEventListener("click", () => selectMode("video"));
  audioTab.addEventListener("click", () => selectMode("audio"));

  play.addEventListener("click", () => {
    if (audio.paused) startPlayback();
    else audio.pause();
  });

  $("ccc-back").addEventListener("click", () => {
    audio.currentTime = Math.max(0, audio.currentTime - 15);
  });

  $("ccc-forward").addEventListener("click", () => {
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 30);
    }
  });

  speedButton.addEventListener("click", () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    audio.playbackRate = speeds[speedIndex];
    speedButton.textContent = speeds[speedIndex] + "×";
  });

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
  });

  seek.addEventListener("input", () => {
    seeking = true;

    if (Number.isFinite(audio.duration)) {
      current.textContent = formatTime(audio.duration * Number(seek.value) / 1000);
    }
  });

  seek.addEventListener("change", () => {
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = audio.duration * Number(seek.value) / 1000;
    }
    seeking = false;
  });

  audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
    seek.disabled = false;
    play.disabled = false;
    $("ccc-back").disabled = false;
    $("ccc-forward").disabled = false;
    setMessage("The recording is ready. Press Play to listen.", "AUDIO READY");
  });

  audio.addEventListener("timeupdate", () => {
    current.textContent = formatTime(audio.currentTime);

    if (!seeking && Number.isFinite(audio.duration) && audio.duration > 0) {
      seek.value = String(Math.round(audio.currentTime / audio.duration * 1000));
    }
  });

  audio.addEventListener("play", () => {
    playIcon.textContent = "Ⅱ";
    play.setAttribute("aria-label", "Pause recording");
    status.textContent = "PLAYING · MP3";
  });

  audio.addEventListener("pause", () => {
    playIcon.textContent = "▶";
    play.setAttribute("aria-label", "Play recording");

    if (!audio.ended) {
      status.textContent = "AUDIO · MP3";
    }
  });

  audio.addEventListener("playing", () => {
    setMessage("You're listening to the QSO One episode.", "PLAYING");
  });

  audio.addEventListener("playing", () => {
    startPlayTimer("qso-one-audio");
  });

  audio.addEventListener("pause", () => {
    stopPlayTimer("qso-one-audio");
  });

  audio.addEventListener("waiting", () => {
    stopPlayTimer("qso-one-audio");
  });

  audio.addEventListener("ended", () => {
    resetPlaySession("qso-one-audio");
  });

  audio.addEventListener("waiting", () => {
    state.textContent = "BUFFERING AUDIO…";
  });

  audio.addEventListener("ended", () => {
    setMessage("You've reached the end of this recording.", "RECORDING COMPLETE");
  });

  audio.addEventListener("error", () => {
    setMessage(
      "The MP3 could not be played in this browser. Use the download link to open the original file.",
      "AUDIO UNAVAILABLE"
    );
    play.disabled = false;
  });

  selectMode("video");
});
