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
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Unified Auth State + Firestore User Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userRef);
        const data = docSnap.exists() ? docSnap.data() : {};

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          tier: data.tier || "Free",
          firstName: data.firstname || "",
          lastName: data.lastname || "",
          profilePicture: data.profilePicture || null,
          ...data
        });

        // Store session version locally
        const sessionVersion = data.sessionVersion || 1;
        localStorage.setItem("sessionVersion", sessionVersion.toString());
      } else {
        setUser(null);
        localStorage.removeItem("sessionVersion");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Real-time Session Version Check
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

  // ✅ Signup
  const signup = async (firstname, lastname, phone, email, password, location, country, profilePicture) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      const userRef = doc(db, "users", newUser.uid);
      await setDoc(userRef, {
        firstname,
        lastname,
        phone,
        email,
        location,
        country,
        profilePicture,
        tier: "Free",
        sessionVersion: 1,
        createdAt: new Date()
      });

      localStorage.setItem("sessionVersion", "1");
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
  const logout = async (delay = 0) => {
    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

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
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        signup,
        login,
        logout,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
