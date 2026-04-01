const CACHE_NAME = 'foodscrap-v1';
const ASSETS = ['/', '/index.html', '/style.css', '/app.js', '/data/menu.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/data/menu.json')) {
    // menu.json: 네트워크 우선, 실패 시 캐시
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // 나머지: 캐시 우선
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
