import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBc3CNH5hAatFsuvAhrsOoNBZxIgUdfdCU",
  authDomain: "the-digital-twin-app-3e2b1.firebaseapp.com",
  projectId: "the-digital-twin-app-3e2b1",
  storageBucket: "the-digital-twin-app-3e2b1.firebasestorage.app",
  messagingSenderId: "404132163896",
  appId: "1:404132163896:web:4be038cbee416c56c7d1cd",
  measurementId: "G-BZNSJW940T"
};

/// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // ✅ Correctly initializing Firebase Auth
const db = getFirestore(app);

// Initialize messaging only if it's available
let messaging; // Declare messaging
try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn("Firebase Messaging initialization failed:", error);
}


// ✅ Correct Export (Ensure these functions are exported)
export { db, auth, messaging, sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };
