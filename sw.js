/**
 * E-LIBRARY Service Worker v6
 * Network-first: data selalu segar dari Google Sheets, cache hanya dipakai saat offline.
 */
const CACHE = 'e-library-v6';
const SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  // Lewati non-GET, skema non-http, dan API Google Apps Script (harus online)
  if (r.method !== 'GET' || !r.url.startsWith('http') || /script\.google(usercontent)?\.com/.test(r.url)) return;

  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).catch(() => caches.match('./index.html')));
    return;
  }

  e.respondWith(
    fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(r, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(r))
  );
});
