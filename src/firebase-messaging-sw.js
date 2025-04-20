// firebase-messaging-sw.js
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
    apiKey: "AIzaSyBc3CNH5hAatFsuvAhrsOoNBZxIgUdfdCU",
    authDomain: "the-digital-twin-app-3e2b1.firebaseapp.com",
    projectId: "the-digital-twin-app-3e2b1",
    storageBucket: "the-digital-twin-app-3e2b1.firebasestorage.app",
    messagingSenderId: "404132163896",
    appId: "1:404132163896:web:4be038cbee416c56c7d1cd"
  };
  
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  // Customize the notification
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/firebase-logo.png",
  });
});
