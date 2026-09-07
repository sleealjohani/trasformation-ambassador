/**
 * خدمة العمل — القراءة دون اتصال.
 * تخزّن الأصداف والمحتوى المنشور فقط. لا تخزّن أي مسار إداري ولا أي طلب إرسال.
 */
const CACHE = "bridge-v1";
const SHELL = ["/", "/issues", "/knowledge", "/answers", "/journey", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

function isCacheable(url) {
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/admin")) return false;
  if (url.pathname.startsWith("/track") || url.pathname.startsWith("/api/track")) return false;
  if (url.pathname.startsWith("/ask")) return false;
  return true;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !isCacheable(url)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const offline = await caches.match("/offline");
          if (offline) return offline;
        }
        return new Response("", { status: 504 });
      }),
  );
});
