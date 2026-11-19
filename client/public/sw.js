// Lokma service worker: önce ağ, bağlantı yoksa önbellek.
// Menü bir kez açıldıysa internet kesilse bile görüntülenebilir.
const CACHE = "lokma-v1";
const SHELL = "/__shell";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

function cacheable(url, request) {
  if (request.mode === "navigate") return true;
  return ["/assets/", "/uploads/", "/icons/", "/landing/", "/api/public/"].some((p) => url.pathname.startsWith(p));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Yönetim ve oturum istekleri asla önbelleğe alınmaz
  if (url.pathname.startsWith("/api/admin") || url.pathname.startsWith("/api/auth")) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response.ok && cacheable(url, request)) {
          const cache = await caches.open(CACHE);
          cache.put(request, response.clone());
          if (request.mode === "navigate") cache.put(SHELL, response.clone());
        }
        return response;
      } catch (err) {
        const hit = await caches.match(request);
        if (hit) return hit;
        if (request.mode === "navigate") {
          const shell = await caches.match(SHELL);
          if (shell) return shell;
        }
        throw err;
      }
    })(),
  );
});
