self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data?.text?.() || 'You have a new BloodConnect notification.' };
  }

  const title = data.title || 'BloodConnect';
  const options = {
    body: data.body || 'You have a new blood request notification.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.tag || 'bloodconnect-notification',
    renotify: true,
    data: { url: data.url || '/' },
    requireInteraction: data.urgency === 'Emergency'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return undefined;
    })
  );
});
