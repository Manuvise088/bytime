const CACHE_NAME = 'my-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Gestione unificata delle notifiche push
self.addEventListener('push', (event) => {
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('Push data not in JSON format');
    data = {
      title: 'Alarm',
      body: 'Time is up!',
      type: 'alarm'
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
      url: '/',
      alarmId: data.alarmId || null
    },
    tag: isAlarm ? 'alarm-notification' : 'timer-notification'
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

// Gestione unificata dei click sulle notifiche
self.addEventListener('notificationclick', (event) => {
  const { notification, action } = event;
  const alarmId = notification.data.alarmId;
  
  notification.close();

  if (action === 'snooze') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        if (clients.length > 0) {
          clients.forEach(client => {
            client.postMessage({
              type: 'snoozeAlarm',
              alarmId: alarmId
            });
          });
        } else {
          return self.clients.openWindow(`alarms.html?id=${alarmId}`);
        }
      })
    );
  } else if (action === 'dismiss') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'dismissAlarm',
            alarmId: alarmId
          });
        });
      })
    );
  } else {
    // Default click handler
    event.waitUntil(
      self.clients.matchAll({type: 'window'}).then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return self.clients.openWindow('/');
      })
    );
  }
});

// Gestione della chiusura della notifica
self.addEventListener('notificationclose', (event) => {
  const notification = event.notification;
  if (notification.data.alarmId) {
    event.waitUntil(
      self.clients.matchAll().then(clientList => {
        clientList.forEach(client => {
          client.postMessage({ type: 'stopAlarm' });
        });
      })
    );
  }
});

// Gestione messaggi dai client
self.addEventListener('message', (event) => {
  const { data } = event;
  
  switch(data.type) {
    case 'alarmWindowOpen':
      // Ferma la notifica quando la finestra è aperta
      self.registration.getNotifications({ tag: 'alarm-notification' })
        .then(notifications => {
          notifications.forEach(n => n.close());
        });
      break;
      
    case 'snoozeAlarm':
      // Posticipa la sveglia
      event.waitUntil(
        self.clients.matchAll().then(clients => {
          if (clients.length > 0) {
            clients.forEach(client => {
              client.postMessage({
                type: 'snoozeAlarm',
                alarmId: data.alarmId,
                minutes: data.minutes || 5
              });
            });
          }
        })
      );
      break;
      
    case 'dismissAlarm':
      // Termina la sveglia
      event.waitUntil(
        self.clients.matchAll().then(clients => {
          if (clients.length > 0) {
            clients.forEach(client => {
              client.postMessage({
                type: 'dismissAlarm',
                alarmId: data.alarmId,
                dismissPermanently: data.dismissPermanently || false
              });
            });
          }
        })
      );
      break;
  }
});

// Funzioni helper per la gestione delle azioni (mantenute per compatibilità)
async function handleSnooze(notification) {
  const clients = await self.clients.matchAll();
  if (clients.length > 0) {
    clients.forEach(client => {
      client.postMessage({
        type: 'snoozeAlarm',
        alarmId: notification.data.alarmId
      });
    });
  } else {
    await self.clients.openWindow(`alarms.html=${notification.data.alarmId}`);
  }
}

async function handleDismiss(notification) {
  const clients = await self.clients.matchAll();
  if (clients.length > 0) {
    clients.forEach(client => {
      client.postMessage({ 
        type: 'dismissAlarm',
        alarmId: notification.data.alarmId
      });
    });
  } else {
    notification.close();
  }
}

async function handleDefaultClick(notification) {
  const clients = await self.clients.matchAll();
  if (clients.length > 0) {
    await clients[0].focus();
  } else {
    await self.clients.openWindow('/');
  }
}