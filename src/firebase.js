import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// Storage (modular import!)
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBc3CNH5hAatFsuvAhrsOoNBZxIgUdfdCU",
  authDomain: "the-digital-twin-app-3e2b1.firebaseapp.com",
  projectId: "the-digital-twin-app-3e2b1",
  storageBucket: "the-digital-twin-app-3e2b1.firebasestorage.appspot.com",
  messagingSenderId: "404132163896",
  appId: "1:404132163896:web:4be038cbee416c56c7d1cd",
  measurementId: "G-BZNSJW940T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Services Initialization
const auth = getAuth(app); // ✅ Correctly initializing Firebase Auth
const db = getFirestore(app);
const storage = getStorage(app); // ✅ Correctly initializing Firebase Storage



// Initialize messaging only if it's available
let messaging;
try {
  messaging = getMessaging(app);
} catch (err) {
  console.warn("Firebase messaging is not supported in this environment", err);
}

// ✅ Correct Export (Ensure these functions are exported)
export { db, auth, messaging, storage, sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };
