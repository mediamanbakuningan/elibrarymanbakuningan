// Service Worker E-LIBRARY (v8.5) - opsional, mempercepat buka ulang & memberi fallback offline.
// Halaman: network-first (selalu ambil versi terbaru, cache hanya cadangan saat offline).
// Library CDN: cache-first + perbarui di latar belakang. Permintaan ke Google Apps Script TIDAK pernah di-cache.
const VER = 'elib-v8.5';
const CDN = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'cdn.tailwindcss.com'];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(VER).then(ch => ch.put(r, c)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./'))));
    return;
  }
  if (CDN.includes(u.hostname)) {
    e.respondWith(caches.open(VER).then(ch => ch.match(r).then(hit => {
      const net = fetch(r).then(res => { if (res.ok || res.type === 'opaque') ch.put(r, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
