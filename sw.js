
const CACHE = 'copd-emergency-v4-5';

const ASSETS = [
  './',
  './index.html',
  './app.js',
  './icon.svg',
  './manifest.webmanifest',
  './understanding-the-invisible-struggle.mp4',
  './copd-group-banner.jpg',
  './wise-qr.png',
  './joeling-signature.png'
];

// Install the new offline cache.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Remove old caches and activate immediately.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('copd-emergency-') && key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Check online first, fall back to offline files.
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE).then(cache =>
              cache.put(request, copy)
            )
          );
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
