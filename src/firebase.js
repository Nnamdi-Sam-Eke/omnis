import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBc3CNH5hAatFsuvAhrsOoNBZxIgUdfdCU",
  authDomain: "the-digital-twin-app-3e2b1.firebaseapp.com",
  projectId: "the-digital-twin-app-3e2b1",
  storageBucket: "the-digital-twin-app-3e2b1.appspot.com",
  messagingSenderId: "404132163896",
  appId: "1:404132163896:web:4be038cbee416c56c7d1cd",
  measurementId: "G-BZNSJW940T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Messaging (safe check for environment support)
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (err) {
  console.warn("Firebase messaging is not supported in this environment", err);
}

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("✅ Service Worker registered:", registration);
    })
    .catch((err) => {
      console.error("❌ Service Worker registration failed:", err);
    });
}

// Exports
export {
  db,
  auth,
  messaging,
  getToken,
  onMessage,
  storage,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  functions
};
