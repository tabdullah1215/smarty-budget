/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core';

clientsClaim();

// Force the service worker to bypass caching and always fetch resources from the network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            // Optionally, add fallback logic if the network request fails
            console.error('Network fetch failed for:', event.request.url);
            return new Response('Network fetch failed.');
        })
    );
});

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Ensure immediate activation of the service worker
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Any other custom service worker logic can go here.
