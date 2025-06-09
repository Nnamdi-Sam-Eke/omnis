import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "./firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time listener for user document changes
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser((prev) => ({
          ...prev,
          ...data,
          tier: data.tier || "Free", // Ensure tier is present
        }));
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Initial Auth State Setup
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
          ...data,
        });

        localStorage.setItem("sessionVersion", (data.sessionVersion || 1).toString());
      } else {
        setUser(null);
        localStorage.removeItem("sessionVersion");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time session version check
  useEffect(() => {
    if (!user?.uid) return;

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
  }, [user?.uid]);

  // Signup
  const signup = async (firstname, lastname, phone, email, password, location, country, profilePicture) => {
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
      createdAt: new Date(),
    });

    localStorage.setItem("sessionVersion", "1");
    console.log("✅ User signed up and data saved");
  };

  // Login
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    const sessionVersion = docSnap.data()?.sessionVersion || 1;

    localStorage.setItem("sessionVersion", sessionVersion.toString());
    console.log("✅ User logged in successfully");
  };

  // Logout
  const logout = async (delay = 0) => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    await signOut(auth);
    setUser(null);
    localStorage.removeItem("sessionVersion");
    console.log("✅ User logged out successfully");
  };

  // Password Reset
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
    console.log("📩 Password reset email sent!");
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
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
