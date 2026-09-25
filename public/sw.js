/* Sofreh service worker — hand-rolled, no dependencies.
 *
 * Strategy:
 *  - Navigations (page HTML): network-first, fall back to a cached copy.
 *    This keeps the app fresh when online and alive in a dead store aisle.
 *  - RSC data requests (?_rsc=…): cache-first with network fill. These are
 *    plain GETs that Next fires for client-side navigation; without them
 *    cached, an offline client-side nav dies with Response.error().
 *  - Immutable static assets (/_next/static/*, icons, manifest): cache-first.
 *  - Everything else: network-first with cache fallback.
 *
 * Bump VERSION to invalidate all caches after a deploy.
 */
const VERSION = "v4";
const NAV_CACHE = `sofreh-nav-${VERSION}`;
const STATIC_CACHE = `sofreh-static-${VERSION}`;

// Pages we want to be able to open with zero signal at all.
const PRECACHE_URLS = ["/", "/shopping", "/plan"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const navCache = await self.caches.open(NAV_CACHE);
      // Cache each page shell (HTML only — its JS/CSS come via the
      // cache-first static rule below when the page loads).
      await Promise.allSettled(PRECACHE_URLS.map((url) => navCache.add(url)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await self.caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              !key.startsWith(`sofreh-nav-${VERSION}`) &&
              !key.startsWith(`sofreh-static-${VERSION}`)
          )
          .map((key) => self.caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: network-first with cache fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await self.caches.open(NAV_CACHE);
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          const cached =
            (await cache.match(request)) || (await cache.match("/"));
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // RSC data requests (?_rsc=…): cache-first, fill on first online hit.
  if (url.searchParams.has("_rsc")) {
    event.respondWith(
      (async () => {
        const cache = await self.caches.open(NAV_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return Response.error();
        }
      })()
    );
    return;
  }

  // Immutable hashed assets: cache-first, fill on first hit.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      (async () => {
        const cache = await self.caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return Response.error();
        }
      })()
    );
    return;
  }

  // Everything else: network-first with cache fallback.
  event.respondWith(
    (async () => {
      const cache = await self.caches.open(NAV_CACHE);
      try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      } catch {
        const cached = await cache.match(request);
        return cached || Response.error();
      }
    })()
  );
});
