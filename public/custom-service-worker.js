const CACHE_NAME = 'custom-cache-v1'; // Increment the version for each update

// Install event: Cache critical files only (minimal caching)
self.addEventListener('install', (event) => {
    console.log('Custom service worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',               // Cache the root
                '/index.html',     // Cache the main HTML file
                '/favicon.ico',    // Cache favicon
            ]);
        })
    );
    self.skipWaiting(); // Skip waiting and activate immediately
});

// Activate event: Clean up old caches
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
    self.clients.claim(); // Immediately take control of all open clients
});

// Fetch event: Always fetch from the network, fallback to cache if offline
self.addEventListener('fetch', (event) => {
    const requestURL = new URL(event.request.url);

    // Handle static assets (main.js, main.css) with dynamic matching
    if (requestURL.pathname.startsWith('/static/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Optionally cache the response
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    // If network fails, serve from cache
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Default behavior for other requests
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // Fallback to cache if network fails
                return caches.match(event.request);
            })
    );
});
