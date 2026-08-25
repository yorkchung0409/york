const APP_VERSION = "88";
const CACHE_NAME = `poker-insurance-v${APP_VERSION}`;
const APP_SHELL = [
  "./",
  "./index.html",
  `./styles.css?v=${APP_VERSION}`,
  `./poker-core.js?v=${APP_VERSION}`,
  `./app-hand-analysis.js?v=${APP_VERSION}`,
  `./app.js?v=${APP_VERSION}`,
  "./manifest.json",
  "./icons/icon-180-v38.png",
  "./icons/icon-512-v38.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
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

function isCacheable(response) {
  return response && response.ok && response.type === "basic";
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const response = await fetch(event.request);
      if (event.request.mode === "navigate" && !response.ok) {
        return (await caches.match("./index.html")) || response;
      }
      if (isCacheable(response)) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      // Only document navigations may fall back to the cached app shell.
      if (event.request.mode === "navigate") {
        return (await caches.match("./index.html")) || Response.error();
      }
      return Response.error();
    }
  })());
});
