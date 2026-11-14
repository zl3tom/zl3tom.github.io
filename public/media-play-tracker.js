(() => {
  "use strict";

  if (window.__mediaPlayTrackerLoaded) return;
  window.__mediaPlayTrackerLoaded = true;

  const REQUIRED_SECONDS = 10;
  const states = new WeakMap();

  const style = document.createElement("style");
  style.textContent = `
    .media-play-count {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-left: 12px;
      color: #8fa8b3;
      font-size: .78rem;
      font-weight: 650;
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);

  function mediaUrl(media) {
    return media.dataset.mediaUrl ||
      media.currentSrc ||
      media.src ||
      "";
  }

  function createCounter(media) {
    if (media.id === "ccc-audio") return null;
    if (media.dataset.mediaPlayTracker === "off") return null;

    const footer = media.closest('[class*="player-foot"]');
    const counter = document.createElement("span");

    counter.className = "media-play-count";
    counter.setAttribute("aria-live", "polite");
    counter.textContent = "▶ Loading plays…";

    if (footer) {
      footer.appendChild(counter);
    } else {
      media.insertAdjacentElement("afterend", counter);
    }

    return counter;
  }

  async function refreshCount(state) {
    const url = state.url;
    if (!url) return;

    try {
      const response = await fetch(
        "/api/media-plays?url=" + encodeURIComponent(url),
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error("Counter unavailable");

      const result = await response.json();

      if (state.url !== url || !result.ok) return;

      state.count = Number(result.count) || 0;
      state.counter.textContent =
        "▶ " + state.count.toLocaleString() +
        (state.count === 1 ? " play" : " plays");
    } catch {
      if (state.url === url) {
        state.counter.textContent = "▶ Plays unavailable";
      }
    }
  }

  async function recordPlay(state) {
    if (state.counted || !state.url) return;

    const url = state.url;
    state.counted = true;

    try {
      const response = await fetch("/api/media-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaUrl: url })
      });

      if (!response.ok) throw new Error("Could not record play");

      const result = await response.json();

      if (state.url !== url) return;

      if (Number.isFinite(result.count)) {
        state.count = result.count;
      } else {
        state.count += 1;
      }

      state.counter.textContent =
        "▶ " + state.count.toLocaleString() +
        (state.count === 1 ? " play" : " plays");
    } catch {
      if (state.url === url) {
        state.counted = false;
        state.counter.textContent = "▶ Counter update failed";
      }
    }
  }

  function resetForSource(state, url) {
    if (state.url === url) return;

    state.url = url;
    state.elapsed = 0;
    state.counted = false;
    state.seeking = false;
    state.lastTime = null;

    state.counter.textContent = "▶ Loading plays…";
    refreshCount(state);
  }

  function initialise(media) {
    if (!(media instanceof HTMLMediaElement)) return;
    if (states.has(media)) return;

    const counter = createCounter(media);
    if (!counter) return;

    const state = {
      url: "",
      counter,
      count: 0,
      elapsed: 0,
      counted: false,
      seeking: false,
      lastTime: null
    };

    states.set(media, state);

    function checkSource() {
      const url = mediaUrl(media);
      if (url) resetForSource(state, url);
    }

    [
      "loadstart",
      "emptied",
      "loadedmetadata",
      "playing",
      "timeupdate"
    ].forEach(event => media.addEventListener(event, checkSource));

    media.addEventListener("seeking", () => {
      state.seeking = true;
      state.lastTime = null;
    });

    media.addEventListener("seeked", () => {
      state.seeking = false;
      state.lastTime = media.currentTime;
    });

    media.addEventListener("ended", () => {
      state.elapsed = 0;
      state.counted = false;
      state.lastTime = null;
    });

    ["pause", "waiting", "stalled"].forEach(event => {
      media.addEventListener(event, () => {
        state.lastTime = null;
      });
    });

    checkSource();
  }

  function scan(root) {
    if (root instanceof HTMLMediaElement) initialise(root);

    if (root.querySelectorAll) {
      root.querySelectorAll("audio, video").forEach(initialise);
    }
  }

  scan(document);

  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === "childList") {
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) scan(node);
        });
      }

      if (
        record.type === "attributes" &&
        record.target instanceof HTMLMediaElement
      ) {
        const state = states.get(record.target);
        if (state) {
          const url = mediaUrl(record.target);
          if (url) resetForSource(state, url);
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "data-media-url"]
  });

  window.setInterval(() => {
    for (const media of document.querySelectorAll("audio, video")) {
      const state = states.get(media);
      if (!state) continue;

      const url = mediaUrl(media);
      if (url) resetForSource(state, url);

      if (
        !state.url ||
        state.counted ||
        media.paused ||
        media.ended ||
        media.seeking ||
        state.seeking ||
        media.readyState < HTMLMediaElement.HAVE_FUTURE_DATA
      ) {
        state.lastTime = null;
        continue;
      }

      const currentTime = media.currentTime;

      if (state.lastTime !== null && currentTime > state.lastTime) {
        const elapsed = (Date.now() - state.lastSample) / 1000;

        if (elapsed > 0 && elapsed <= 2) {
          state.elapsed += elapsed;

          if (state.elapsed >= REQUIRED_SECONDS) {
            recordPlay(state);
          }
        }
      }

      state.lastTime = currentTime;
      state.lastSample = Date.now();
    }
  }, 250);

})();

// Shared YouTube play counters. QSO One retains its existing counter.
(() => {
  if (window.__zl3tomYouTubeTrackerLoaded) return;
  window.__zl3tomYouTubeTrackerLoaded = true;

  const REQUIRED_SECONDS = 10;
  const states = new Map();
  let apiLoading = false;

  function addCounter(iframe, videoId) {
    if (iframe.id === "ccc-video-frame" || videoId === "aBx0-Kt4aZg") return;
    if (states.has(iframe)) return;

    const mediaUrl = "https://www.youtube-nocookie.com/embed/" + videoId;
    const counter = document.createElement("span");
    counter.className = "media-play-count";
    counter.textContent = "▶ Loading plays…";

    const state = {
      iframe, videoId, mediaUrl, counter,
      elapsed: 0, started: 0, timer: null,
      counted: false, player: null
    };

    states.set(iframe, state);
    (iframe.parentElement || iframe).insertAdjacentElement("afterend", counter);

    fetch("/api/media-plays?url=" + encodeURIComponent(mediaUrl))
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => {
        counter.textContent = "▶ " + Number(data.count || 0).toLocaleString() +
          (Number(data.count) === 1 ? " play" : " plays");
      })
      .catch(() => { counter.textContent = "▶ Plays unavailable"; });

    return state;
  }

  async function record(state) {
    if (state.counted) return;
    state.counted = true;
    try {
      const response = await fetch("/api/media-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaUrl: state.mediaUrl })
      });
      if (!response.ok) throw new Error("Counter update failed");
      const data = await response.json();
      state.counter.textContent = "▶ " + Number(data.count || 0).toLocaleString() +
        (Number(data.count) === 1 ? " play" : " plays");
    } catch {
      state.counted = false;
      state.counter.textContent = "▶ Counter update failed";
    }
  }

  function stop(state) {
    if (state.started) {
      state.elapsed += (Date.now() - state.started) / 1000;
      state.started = 0;
    }
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  }

  function playing(state) {
    if (state.started || state.counted) return;
    state.started = Date.now();
    state.timer = setInterval(() => {
      if (!state.started) return;
      const elapsed = state.elapsed + (Date.now() - state.started) / 1000;
      if (elapsed >= REQUIRED_SECONDS) {
        stop(state);
        record(state);
      }
    }, 250);
  }

  function initialisePlayers() {
    if (!window.YT || !window.YT.Player) return;

    for (const state of states.values()) {
      if (state.player) continue;

      const url = new URL(state.iframe.src);
      url.searchParams.set("enablejsapi", "1");
      url.searchParams.set("origin", window.location.origin);
      state.iframe.src = url.toString();

      state.player = new window.YT.Player(state.iframe, {
        events: {
          onStateChange(event) {
            if (event.data === window.YT.PlayerState.PLAYING) {
              playing(state);
            } else {
              stop(state);
              if (event.data === window.YT.PlayerState.ENDED) {
                state.elapsed = 0;
                state.counted = false;
              }
            }
          }
        }
      });
    }
  }

  function loadApi() {
    if (window.YT && window.YT.Player) {
      initialisePlayers();
      return;
    }

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof previous === "function") previous();
      initialisePlayers();
    };

    if (apiLoading) return;
    apiLoading = true;

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  }

  function scan(root = document) {
    const frames = [];
    if (root.matches && root.matches("iframe")) frames.push(root);
    if (root.querySelectorAll) frames.push(...root.querySelectorAll("iframe"));

    for (const iframe of frames) {
      if (iframe.id === "ccc-video-frame") continue;
      try {
        const url = new URL(iframe.src, location.href);
        if (!/(^|\.)youtube(?:-nocookie)?\.com$/.test(url.hostname)) continue;
        const match = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]+)/);
        if (!match) continue;

        const state = addCounter(iframe, match[1]);
        if (state) loadApi();
      } catch {}
    }
  }

  scan();
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === "childList") {
        record.addedNodes.forEach(node => {
          if (node.nodeType === 1) scan(node);
        });
      }
      if (record.type === "attributes") scan(record.target);
    }
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src"]
  });
})();
