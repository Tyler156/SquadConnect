// simple cache-first service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('squadconnect-cache').then(cache => {
      return cache.addAll([
        '/', // your main page
        '/styles.css',
        '/script.js'
        // add more assets you want cached
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
