import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// ✅ Save to localStorage
const saveUserLocally = (userProfile) => {
  localStorage.setItem("userProfile", JSON.stringify(userProfile));
};

// 🔹 Sign Up User & Store Profile Locally
export const signUp = async (email, password, firstName, lastName, phone, location, city) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const userProfile = {
    uid: user.uid,
    email: user.email,
    firstName,
    lastName,
    phone,
    location,
    city,
    avatar: "",
    preferences: {
      theme: "light",
      notifications: true,
    },
  };

  // ✅ Store profile in Firestore
  await setDoc(doc(db, "users", user.uid), userProfile);

  // ✅ Store profile locally
  saveUserLocally(userProfile);

  return user;
};

// 🔹 Login User & Retrieve Profile from Firestore
export const logIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // ✅ Fetch user profile from Firestore
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userProfile = userSnap.data();
    saveUserLocally(userProfile); // ✅ Store profile locally
  }

  return user;
};

// 🔹 Logout User & Clear Local Storage
export const logOut = async () => {
  await signOut(auth);
  localStorage.removeItem("userProfile"); // ✅ Clear local storage on logout
};

// after sign-in:
await setDoc(doc(db, "users", user.uid), {
  sessionVersion: 1,
  // other data...
}, { merge: true });

