self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    // eventualmente focus su app
    event.waitUntil(clients.openWindow('/'));
});
