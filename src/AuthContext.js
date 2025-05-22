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

  // ✅ Track auth state for primary user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setUser({
            ...currentUser,
            firstName: profileData.firstname,
            lastName: profileData.lastname,
            profilePicture: profileData.profilePicture || null
          });
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
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

  // ✅ Signup (primary)
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

  // ✅ Login (primary)
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      const sessionVersion = docSnap.data()?.sessionVersion || 1;
      localStorage.setItem("sessionVersion", sessionVersion.toString());

      console.log("✅ Primary user logged in successfully");
    } catch (error) {
      console.error("❌ Login error:", error.message);
      throw error;
    }
  };



  // ✅ Logout (primary only)
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
    <AuthContext.Provider value={{
      user,
      loading,
      setUser,
      signup,
      login,
      logout,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
export default AuthContext;
export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail };
