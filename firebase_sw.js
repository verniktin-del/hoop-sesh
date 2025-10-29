// Firebase messaging service worker for push notifications
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
const firebaseConfig = {
  apiKey: "AIzaSyAnFYrebR69a2rmYeT-TWrX1RB_Tzsh3Tk",
  authDomain: "hoops-165ec.firebaseapp.com",
  projectId: "hoops-165ec",
  storageBucket: "hoops-165ec.firebasestorage.app",
  messagingSenderId: "563400604791",
  appId: "1:563400604791:web:50183bcf65de09bd019a72",
  measurementId: "G-C3YPHXZCXN"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[Firebase SW] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'Hoops';
  const notificationOptions = {
    body: payload.notification?.body || 'Nova rezervacija',
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    tag: 'hoops-reservation',
    data: payload.data || {},
    actions: [
      {
        action: 'join_yes',
        title: 'Dolazim',
        icon: './assets/icon-192.png'
      },
      {
        action: 'join_no', 
        title: 'Ne dolazim',
        icon: './assets/icon-192.png'
      },
      {
        action: 'view',
        title: 'Vidi',
        icon: './assets/icon-192.png'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    timestamp: Date.now()
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[Firebase SW] Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const reservationId = event.notification.data?.reservationId;
  
  if (action === 'join_yes' || action === 'join_no') {
    // Handle join response
    const response = action === 'join_yes' ? 'yes' : 'no';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // Send message to all open clients
          for (let client of clientList) {
            client.postMessage({
              type: 'respondToJoinRequest',
              reservationId: reservationId,
              response: response
            });
          }
          
          // Focus or open window
          for (let client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  } else {
    // Default action - just open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          for (let client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  console.log('[Firebase SW] Message received:', event.data);
  
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

console.log('[Firebase SW] Firebase messaging service worker loaded');