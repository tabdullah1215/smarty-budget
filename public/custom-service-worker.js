const CACHE_NAME = 'custom-cache-v2'; // Increment for updates

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
    self.skipWaiting(); // Skip waiting and move to "activate"
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

    // Claim clients after activation
    event.waitUntil(
        self.clients.claim().then(() => {
            console.log('Clients claimed by active service worker');
            self.clients.matchAll({ type: 'window' }).then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'WORKER_ACTIVATED' });
                });
            });
        })
    );
});

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
