const CACHE_NAME = 'custom-cache-v2'; // Increment for updates

// eslint-disable-next-line no-restricted-globals
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
    // eslint-disable-next-line no-restricted-globals
    self.skipWaiting(); // Skip waiting and move to "activate"
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // First clear old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Then claim clients after activation
            // eslint-disable-next-line no-restricted-globals
            self.clients.claim()
        ]).then(() => {
            // eslint-disable-next-line no-restricted-globals
            return self.clients.matchAll({ type: 'window' });
        }).then((clients) => {
            clients.forEach((client) => {
                client.navigate(client.url);
            });
        })
    );
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
            .catch(() => caches.match(event.request)) // Fallback to cache
    );
});
