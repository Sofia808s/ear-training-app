const CACHE_NAME = "ear-training-pwa-v4";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon.svg"
];

const OFFLINE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#020617" />
    <title>Ear Training Offline</title>
    <style>
      html, body {
        min-height: 100%;
        margin: 0;
        color: #f8fafc;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at 50% 24%, rgba(34, 211, 238, 0.16), transparent 30%),
          radial-gradient(circle at 24% 74%, rgba(168, 85, 247, 0.18), transparent 34%),
          linear-gradient(135deg, #030512 0%, #0b1024 52%, #020817 100%);
      }
      main {
        min-height: 100dvh;
        display: grid;
        place-items: center;
        padding: 24px;
        text-align: center;
      }
      section {
        width: min(520px, 100%);
        display: grid;
        gap: 14px;
        padding: 34px 28px;
        border-radius: 28px;
        background: rgba(15, 23, 42, 0.66);
        border: 1px solid rgba(125, 211, 252, 0.22);
        box-shadow: 0 30px 100px rgba(0, 0, 0, 0.42);
      }
      h1, p { margin: 0; }
      h1 { font-size: clamp(2rem, 8vw, 3.5rem); line-height: 1; }
      p { color: #dbeafe; line-height: 1.55; }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>Ear Training</h1>
        <p>Offline mode will be available after opening the app once online.</p>
      </section>
    </main>
  </body>
</html>`;

async function findBuildAssets() {
  try {
    const response = await fetch("/index.html", { cache: "no-store" });
    const html = await response.text();
    return Array.from(new Set(Array.from(html.matchAll(/["'](\/assets\/[^"']+\.(?:js|css))["']/g)).map((match) => match[1])));
  } catch {
    return [];
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([caches.open(CACHE_NAME), findBuildAssets()])
      .then(([cache, buildAssets]) => cache.addAll([...CORE_ASSETS, ...buildAssets]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isNavigationRequest(request) {
  return request.mode === "navigate" || (request.headers.get("accept") || "").includes("text/html");
}

function shouldCache(request, response) {
  if (!response || response.status !== 200 || request.method !== "GET") return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  return true;
}

async function cacheResponse(request, response) {
  if (!shouldCache(request, response)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (shouldCache(request, response)) {
      await cache.put("/", response.clone());
      await cache.put("/index.html", response.clone());
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cachedRequest = await cache.match(request);
    const cachedRoot = await cache.match("/") || await cache.match("/index.html");
    return cachedRequest || cachedRoot || new Response(OFFLINE_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
      status: 200
    });
  }
}

async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  await cacheResponse(request, response);
  return response;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (isNavigationRequest(event.request)) {
    event.respondWith(networkFirstNavigation(event.request));
    return;
  }

  event.respondWith(cacheFirstAsset(event.request));
});
