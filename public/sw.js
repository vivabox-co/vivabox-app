const CACHE_NAME = "vivabox-static-v1"

// Uniquement les assets vraiment statiques (icônes, logos, JS/CSS buildés par
// Next). Les pages et les appels /api/* ne sont jamais mis en cache ici : le
// statut d'une réservation ou d'une activation doit toujours venir du réseau,
// jamais d'une réponse figée.
const STATIC_PATH_PREFIXES = ["/pwa/", "/icons/", "/logo/", "/_next/static/"]

function isStaticAsset(url) {
  return STATIC_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
}

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return
  if (!isStaticAsset(url)) return

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request)
      if (cached) return cached
      const response = await fetch(event.request)
      if (response.ok) cache.put(event.request, response.clone())
      return response
    })
  )
})
