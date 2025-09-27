const CACHE_NAME = 'kc-keuangan-v1';
const urlsToCache = [
  '/',
  'index.html',
  'dashboard.html',
  'dashboard.js',
  'icon-192.png',
  'icon-512.png'
  // Kamu bisa tambahkan file lain jika ada
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Ambil dari cache jika ada
        }
        return fetch(event.request); // Jika tidak, ambil dari network
      }
    )
  );
});