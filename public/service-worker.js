/* Basic service worker for offline caching */
const CACHE_NAME = 'fwms-cache-v3';
const APP_SHELL = ['index.html'];

self.addEventListener('install', event => {
  // Take control asap on update
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => (key !== CACHE_NAME ? caches.delete(key) : undefined)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const accept = request.headers.get('accept') || '';
  const url = new URL(request.url);

  // Only handle same-origin requests (avoid caching API on other domains)
  const sameOrigin = url.origin === self.location.origin;

  // HTML navigation: network-first with offline fallback
  if (accept.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('index.html', copy));
          return resp;
        })
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  // Skip non same-origin assets entirely
  if (!sameOrigin) return;

  // Do not cache API calls; adjust path checks to your API routes if needed
  const isApi = url.pathname.startsWith('/api') || url.pathname.includes('/auth') || url.pathname.includes('/token');
  if (isApi) return;

  // Cache-first for static assets only
  const isStatic = /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|eot|mp3|mp4|json)$/i.test(url.pathname);
  if (!isStatic) return;

  event.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return resp;
      })
    )
  );
});
