const CACHE_NAME = "zl3tom-radio-companion-v5";
const OFFLINE_URL = "/offline.html";
const SITEMAP_URL = "/sitemap.xml";

const CORE_URLS = [
  "/",
  "/about",
  "/guides",
  "/tools",
  "/tools/install-radio-companion",
  "/tools/offline-radio-toolkit",
  "/tools/nz-repeater-finder",
  "/repeater-finder.js",
  "/radio-fun",
  "/community",
  "/qsl",
  "/contact",
  "/style.css?v=20260904-fullfix1",
  "/site-extras.css?v=20260904-fullfix1",
  "/accessibility.css?v=20261006",
  "/contact-form.css",
  "/gallery.css",
  "/script.js",
  "/accessibility.js",
  "/pwa.js",
  "/favicon.svg",
  "/search-index.json",
  "/manifest.webmanifest",
  SITEMAP_URL,
  OFFLINE_URL
];

async function cacheResponse(cache, request) {
  try {
    const response = await fetch(request, { cache: "reload" });
    if (response && response.ok) {
      await cache.put(request, response.clone());
      return true;
    }
  } catch (_) {
    // A failed optional resource must not prevent the PWA installing.
  }
  return false;
}

async function getSiteUrls() {
  try {
    const response = await fetch(SITEMAP_URL, { cache: "reload" });
    if (!response.ok) return [];
    const xml = await response.text();
    const origin = self.location.origin;
    const urls = [];
    const locPattern = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
    let match;

    while ((match = locPattern.exec(xml)) !== null) {
      try {
        const url = new URL(match[1].replace(/&amp;/g, "&"));
        if (url.origin === origin) {
          urls.push(url.pathname + url.search);
        }
      } catch (_) {
        // Ignore malformed sitemap entries.
      }
    }

    return [...new Set(urls)];
  } catch (_) {
    return [];
  }
}

async function cacheWholeSite() {
  const cache = await caches.open(CACHE_NAME);
  const siteUrls = await getSiteUrls();
  const urls = [...new Set([...CORE_URLS, ...siteUrls])];
  await Promise.all(urls.map((url) => cacheResponse(cache, url)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    cacheWholeSite().then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API endpoints require a live connection and should never be frozen offline.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(async () => {
          return (await caches.match(request))
            || (await caches.match(url.pathname))
            || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
