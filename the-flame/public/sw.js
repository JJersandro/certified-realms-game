// Minimal stale-while-revalidate service worker -- no build-time asset
// manifest (Vite's hashed filenames aren't known here), so this caches
// whatever gets requested as it's requested instead of precaching a fixed
// list. Serves from cache immediately when available (instant load,
// works offline) while refreshing the cache from the network in the
// background for next time.
const CACHE = 'the-flame-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(response => {
        if(response.ok){
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);

      return cached || network;
    })
  );
});
