/* XY Tools Service Worker (simple, framework-free)
   Strategy:
   - Precache app shell (HTML/CSS/JS/icons)
   - Navigation: network-first, fallback to cache/offline
   - Assets: stale-while-revalidate
*/

const VERSION = "v1.1.0";
const PRECACHE = `xy-precache-${VERSION}`;
const RUNTIME = `xy-runtime-${VERSION}`;

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.json",
  "./css/index.css",
  "./css/calculadora.css",
  "./css/etiquetas.css",
  "./css/painel-analise.css",
  "./js/index.js",
  "./js/calculadora.js",
  "./js/etiquetas.js",
  "./js/painel-analise.js",
  "./assets/favicon.ico",
  "./assets/favicon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-192.png",
  "./assets/icons/icon-maskable-512.png",
  "./pages/ferramentas.html",
  "./pages/integracoes.html",
  "./pages/automacoes.html",
  "./pages/playbook.html",
  "./pages/templates.html",
  "./pages/fornecedores.html",
  "./pages/login.html",
  "./pages/tools/calculadora.html",
  "./pages/tools/etiquetas.html",
  "./pages/tools/painel-analise.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("xy-") && ![PRECACHE, RUNTIME].includes(k))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const fresh = await fetch(request);
    // cache copy for next time
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // fallback to offline page for navigations
    return caches.match("./offline.html");
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      // only cache valid responses
      if (response && (response.status === 200 || response.type === "opaque")) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== "GET") return;

  // Navigation requests (HTML pages)
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Same-origin assets
  event.respondWith(staleWhileRevalidate(req));
});
