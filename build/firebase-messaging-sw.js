// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBc3CNH5hAatFsuvAhrsOoNBZxIgUdfdCU",
  authDomain: "the-digital-twin-app-3e2b1.firebaseapp.com",
  projectId: "the-digital-twin-app-3e2b1",
  messagingSenderId: "404132163896",
  appId: "1:404132163896:web:4be038cbee416c56c7d1cd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification?.title || "Omnis";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/logo192.png",
    data: {
      url: "/notifications" // 🔗 Custom route
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🧭 Handle notification click
self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  const redirectUrl = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList) {
      // If any window is open, focus and navigate
      for (const client of clientList) {
        if (client.url.includes(redirectUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(redirectUrl);
      }
    })
  );
});
// 🛠️ Handle foreground messages
messaging.onMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received foreground message ", payload);
}); 