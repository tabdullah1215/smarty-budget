/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core';

clientsClaim();

// Force the service worker to bypass caching and always fetch resources from the network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            console.error('Network fetch failed for:', event.request.url);
            return new Response('Network fetch failed.');
        })
    );
});

// Allow the service worker to be immediately activated and control clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Ensure immediate activation of the service worker
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// No precaching logic is used in this service worker
