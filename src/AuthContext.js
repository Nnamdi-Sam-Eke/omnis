import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
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
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";

// ✅ NEW: Import persistence tools
import { setPersistence, browserLocalPersistence } from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);
  const [authTimeout, setAuthTimeout] = useState(false);

  const userDocListenerRef = useRef(null);
  const lastSessionTrackRef = useRef(0);
  const sessionVersionCacheRef = useRef(null);
  const authTimeoutRef = useRef(null);
  const forcedLogoutRef = useRef(false);

  const isQuotaExceeded = (error) => {
    return error?.code === "resource-exhausted" ||
           error?.message?.includes("Quota exceeded") ||
           error?.message?.includes("resource-exhausted");
  };

  const handleFirestoreError = (error, operation) => {
    console.error(`❌ Firestore error in ${operation}:`, error);

    if (isQuotaExceeded(error)) {
      console.warn("🚨 QUOTA EXCEEDED - Firestore operations limited");
      setFirestoreError("Firestore quota exceeded. Some features may be limited.");
      return true;
    }

    return false;
  };

  const trackSession = async (user) => {
    const now = Date.now();
    const THROTTLE_DURATION = 5 * 60 * 1000;
    if (now - lastSessionTrackRef.current < THROTTLE_DURATION) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const sessionsCollectionRef = collection(db, "users", user.uid, "sessions");

      await Promise.all([
        updateDoc(userRef, { lastLogin: serverTimestamp() }).catch(() =>
          setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true })
        ),
        addDoc(sessionsCollectionRef, {
          userAgent: navigator.userAgent,
          createdAt: serverTimestamp(),
        }),
      ]);
      lastSessionTrackRef.current = now;
    } catch (error) {
      const isQuotaError = handleFirestoreError(error, "trackSession");
      if (!isQuotaError) throw error;
    }
  };

  const clearSessionData = () => {
    localStorage.removeItem("sessionVersion");
    setFirestoreError(null);
    sessionVersionCacheRef.current = null;
    lastSessionTrackRef.current = 0;
  };

  const resetUIState = () => {
    setUser(null);
    setFirestoreError(null);

    if (userDocListenerRef.current) {
      userDocListenerRef.current();
      userDocListenerRef.current = null;
    }
  };

  const checkSessionVersion = async (userId) => {
    if (firestoreError) return true;

    try {
      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const serverVersion = docSnap.data()?.sessionVersion || 1;
        const localVersion = Number(localStorage.getItem("sessionVersion")) || 1;

        if (serverVersion !== localVersion) {
          alert("You've been logged out on this device.");
          await signOut(auth);
          return false;
        }
      }
      return true;
    } catch (error) {
      const isQuotaError = handleFirestoreError(error, "checkSessionVersion");
      return isQuotaError;
    }
  };

  // ✅ NEW: Set persistence once before auth listener
  useEffect(() => {
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log("✅ Firebase persistence set to localStorage");
      } catch (error) {
        console.error("❌ Failed to set persistence:", error);
      }

      authTimeoutRef.current = setTimeout(() => {
        if (loading) {
          setAuthTimeout(true);
          setLoading(false);
        }
      }, 10000);

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            let userData = {};
            try {
              const userRef = doc(db, "users", firebaseUser.uid);
              const docSnap = await getDoc(userRef);
              userData = docSnap.exists() ? docSnap.data() : {};
            } catch (firestoreError) {
              const isQuotaError = handleFirestoreError(firestoreError, "getDoc in auth state");
              if (isQuotaError) {
                userData = {
                  tier: "Free",
                  firstname: firebaseUser.displayName?.split(" ")[0] || "",
                  lastname: firebaseUser.displayName?.split(" ")[1] || "",
                  sessionVersion: 1,
                };
              } else throw firestoreError;
            }

            const finalUserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              tier: userData.tier || "Free",
              firstName: userData.firstname || "",
              lastName: userData.lastname || "",
              profilePicture: userData.profilePicture || null,
              ...userData,
            };

            const sessionOk = await checkSessionVersion(firebaseUser.uid);
            if (!sessionOk) return;

            const sessionVersion = userData.sessionVersion || 1;
            localStorage.setItem("sessionVersion", sessionVersion.toString());
            sessionVersionCacheRef.current = sessionVersion;

            setUser(finalUserData);
            await trackSession(firebaseUser);

            if (!firestoreError && !userDocListenerRef.current) {
              const userRef = doc(db, "users", firebaseUser.uid);
              userDocListenerRef.current = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                  const data = docSnap.data();
                  setUser((prev) => ({
                    ...prev,
                    ...data,
                    tier: data.tier || "Free",
                  }));
                }
              });
            }
          } else {
            forcedLogoutRef.current = false;
            clearSessionData();
            resetUIState();
          }
        } catch (error) {
          console.error("❌ Error in auth state change handler:", error);
          setUser(null);
        } finally {
          clearTimeout(authTimeoutRef.current);
          authTimeoutRef.current = null;
          setLoading(false);
        }
      });

      return () => {
        if (authTimeoutRef.current) clearTimeout(authTimeoutRef.current);
        unsubscribe();
      };
    };

    initAuth();
  }, []);

  useEffect(() => {
    return () => {
      if (userDocListenerRef.current) userDocListenerRef.current();
    };
  }, []);

  const signup = async (firstname, lastname, phone, email, password, location, country, profilePicture) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    try {
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
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } catch (firestoreError) {
      const isQuotaError = handleFirestoreError(firestoreError, "signup setDoc");
      if (!isQuotaError) throw firestoreError;
    }

    localStorage.setItem("sessionVersion", "1");
  };

  const login = async (email, password) => {
    console.log("🔑 Attempting login for:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Firebase authentication successful for:", userCredential.user.email);
  };

  const logout = async (delay = 0) => {
    if (delay > 0) await new Promise((res) => setTimeout(res, delay));
    await signOut(auth);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshUserData = async () => {
    if (!user?.uid || firestoreError) return;

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setUser((prev) => ({
        ...prev,
        ...data,
        tier: data.tier || "Free",
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const hasAuthError = (!user && !loading && (firestoreError || authTimeout)) ||
                       (!user && !loading && !navigator.onLine);

  if (hasAuthError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {authTimeout ? "Connection Timeout" : "Error Loading User"}
          </h2>
          <p className="text-gray-600 mb-4">
            {authTimeout
              ? "Authentication is taking longer than expected. Please check your connection and try again."
              : firestoreError
              ? "Our servers are currently experiencing high traffic. Please try again later."
              : "Please check your internet connection and try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firestoreError,
        setUser,
        signup,
        login,
        logout,
        resetPassword,
        trackSession,
        refreshUserData,
        checkSessionVersion,
      }}
    >
      {firestoreError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <div>
              <p className="font-bold">Limited Functionality</p>
              <p className="text-sm">Some features may be temporarily unavailable due to high server load.</p>
            </div>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
