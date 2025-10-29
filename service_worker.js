const CACHE_NAME = 'hoops-cache-v6';
const urlsToCache = [
  './',
  './index.html',
  './admin-standalone.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests except Firebase
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('firebase') &&
      !event.request.url.includes('gstatic')) {
    return;
  }

  // For navigation requests, use network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache with new version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(event.request)
            .then(response => {
              return response || caches.match('./index.html');
            });
        })
    );
    return;
  }

  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Return cached version and update in background
          fetch(event.request).then(fetchResponse => {
            if (fetchResponse && fetchResponse.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, fetchResponse);
              });
            }
          }).catch(() => {});
          
          return response;
        }
        
        // Not in cache, fetch from network
        return fetch(event.request).then(fetchResponse => {
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type === 'error') {
            return fetchResponse;
          }

          // Cache successful responses
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return fetchResponse;
        }).catch(() => {
          // Network request failed and not in cache
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.action === 'skipWaiting') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    console.log('[SW] Cache update requested');
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(urlsToCache);
      })
    );
  }
});

// Push notification handler
self.addEventListener('push', event => {
  console.log('[SW] Push notification received:', event);
  
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const title = data.notification?.title || 'Hoops';
    const options = {
      body: data.notification?.body || 'Nova obavijest',
      icon: './assets/icon-192.png',
      badge: './assets/icon-192.png',
      tag: 'hoops-notification',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Vidi',
          icon: './assets/icon-192.png'
        }
      ],
      requireInteraction: false,
      vibrate: [200, 100, 200]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('[SW] Error handling push:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // If app is already open, focus it
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Background sync (for offline reservations)
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-reservations') {
    event.waitUntil(syncReservations());
  }
});

async function syncReservations() {
  // Implementation for syncing offline reservations
  console.log('[SW] Syncing reservations...');
  // This would sync any offline-queued reservations
}

console.log('[SW] Service worker loaded');