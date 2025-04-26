import { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "./firebase";

import {
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // ✅ Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Real-time session version check
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userRef, (docSnap) => {
      const session = docSnap.data()?.sessionVersion || 1;
      const local = Number(localStorage.getItem("sessionVersion")) || 1;

      if (session !== local) {
        alert("You've been logged out on this device.");
        signOut(auth);
      }
    });

    return () => unsub();
  }, [user]);

  // ✅ One-time session version check on load
  useEffect(() => {
    const checkSession = async () => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      const sessionVersion = docSnap.data()?.sessionVersion || 1;
      const localVersion = localStorage.getItem("sessionVersion") || "1";

      if (sessionVersion.toString() !== localVersion) {
        alert("You've been signed out because your session expired or was revoked.");
        await signOut(auth);
      }
    };

    checkSession();
  }, [user]);

  // ✅ Signup
  const signup = async (firstname, lastname, phone, email, password, location, country) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Save profile to Firestore with sessionVersion
      const userRef = doc(db, "users", newUser.uid);
      await setDoc(userRef, {
        firstname,
        lastname,
        phone,
        email,
        location,
        country,
        sessionVersion: 1,
        createdAt: new Date()
      });

      localStorage.setItem("sessionVersion", "1"); // Save locally
      setUser(newUser);
      console.log("✅ User signed up and data saved");
    } catch (error) {
      console.error("❌ Signup error:", error.message);
      throw error;
    }
  };

  // ✅ Login
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      const sessionVersion = docSnap.data()?.sessionVersion || 1;
      localStorage.setItem("sessionVersion", sessionVersion.toString());

      console.log("✅ User logged in successfully");
    } catch (error) {
      console.error("❌ Login error:", error.message);
      throw error;
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("sessionVersion");
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Logout error:", error.message);
      throw error;
    }
  };

  // ✅ Password Reset
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("📩 Password reset email sent!");
    } catch (error) {
      console.error("❌ Reset error:", error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signup, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
export default AuthContext;