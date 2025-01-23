
/* eslint-disable no-restricted-globals */

// Install event: Cache specific files during service worker installation
self.addEventListener('install', (event) => {
    console.log('Custom service worker installing...');
    event.waitUntil(
        caches.open('custom-cache').then((cache) => {
            return cache.addAll([
                '/',               // Cache the root
                '/index.html',     // Cache the main HTML file
                '/static/js/main.js', // Cache main JavaScript bundle
                '/static/css/main.css', // Cache main CSS bundle
                '/favicon.ico',    // Cache favicon
                // Add any other files you want to cache
            ]);
        })
    );
    self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Custom service worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== 'custom-cache') {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event: Serve cached files, fallback to network if not cached
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});
