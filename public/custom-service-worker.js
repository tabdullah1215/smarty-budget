const CACHE_NAME = 'custom-cache-v1'; // Increment the version for each update

self.addEventListener('install', (event) => {
    console.log('Custom service worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',               // Cache the root
                '/index.html',     // Cache the main HTML file
                '/static/js/main.js', // Cache main JavaScript bundle
                '/static/css/main.css', // Cache main CSS bundle
                '/favicon.ico',    // Cache favicon
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Custom service worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});
