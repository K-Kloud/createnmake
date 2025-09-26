const CACHE_NAME = 'opentech-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
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
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification('OpenTech', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

async function doBackgroundSync() {
  // Handle background synchronization
  try {
    // Sync pending data when online
    const pendingData = await getStoredData('pendingSync');
    if (pendingData && pendingData.length > 0) {
      for (const item of pendingData) {
        await syncData(item);
      }
      await clearStoredData('pendingSync');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getStoredData(key) {
  // Get data from IndexedDB or localStorage
  return JSON.parse(localStorage.getItem(key) || '[]');
}

async function clearStoredData(key) {
  localStorage.removeItem(key);
}

async function syncData(item) {
  // Sync individual data item
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify(item),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Sync failed for item:', item, error);
    return false;
  }
}