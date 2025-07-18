const CACHE_NAME = 'bytime-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/script.js',
  '/icons/icon-192x192.png',
  '/icons/badge-72x72.png',
  '/sounds/alarm_sound.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('push', (event) => {
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Notification',
      body: 'New notification',
      type: 'generic'
    };
  }

  const isAlarm = data.type === 'alarm';
  
  const notificationOptions = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: isAlarm ? [200, 100, 200, 100, 200] : [200, 100, 200],
    requireInteraction: isAlarm,
    data: { 
      alarmId: data.alarmId || null,
      type: data.type || 'generic'
    }
  };

  if (isAlarm) {
    notificationOptions.actions = [
      { action: 'snooze', title: 'Snooze' },
      { action: 'dismiss', title: 'Dismiss' }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

self.addEventListener('notificationclick', (event) => {
  const { notification, action } = event;
  const { alarmId, type } = notification.data;
  
  notification.close();

  if (type === 'alarm') {
    event.waitUntil(
      handleAlarmNotificationClick(action, alarmId)
    );
  } else {
    event.waitUntil(
      handleDefaultNotificationClick()
    );
  }
});

self.addEventListener('notificationclose', (event) => {
  const { notification } = event;
  if (notification.data.type === 'alarm') {
    event.waitUntil(
      sendMessageToClients({
        type: 'stopAlarm'
      })
    );
  }
});

self.addEventListener('message', (event) => {
  const { data } = event;
  
  switch(data.type) {
    case 'stopAlarm':
      // Stop any ongoing alarm sounds
      sendMessageToClients({ type: 'stopAlarm' });
      break;
      
    case 'snoozeAlarm':
      sendMessageToClients({
        type: 'snoozeAlarm',
        alarmId: data.alarmId,
        minutes: data.minutes || 5
      });
      break;
      
    case 'dismissAlarm':
      sendMessageToClients({
        type: 'dismissAlarm',
        alarmId: data.alarmId,
        dismissPermanently: data.dismissPermanently || false
      });
      break;
  }
});

// Helper functions
async function handleAlarmNotificationClick(action, alarmId) {
  switch(action) {
    case 'snooze':
      await sendMessageToClients({
        type: 'snoozeAlarm',
        alarmId: alarmId,
        minutes: 5
      });
      break;
      
    case 'dismiss':
      await sendMessageToClients({
        type: 'dismissAlarm',
        alarmId: alarmId,
        dismissPermanently: false
      });
      break;
      
    default:
      // Default click behavior for alarm
      await sendMessageToClients({
        type: 'focusApp'
      });
      break;
  }
}

async function handleDefaultNotificationClick() {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });
  
  if (clients.length > 0) {
    await clients[0].focus();
  } else {
    await self.clients.openWindow('/');
  }
}

async function sendMessageToClients(message) {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true
  });
  
  clients.forEach(client => {
    client.postMessage(message);
  });
}