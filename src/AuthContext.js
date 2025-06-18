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
  serverTimestamp 
} from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);
  const [authTimeout, setAuthTimeout] = useState(false);
  
  // Refs to prevent duplicate operations and manage cleanup
  const userDocListenerRef = useRef(null);
  const lastSessionTrackRef = useRef(0);
  const sessionVersionCacheRef = useRef(null);
  const authTimeoutRef = useRef(null);

  const isQuotaExceeded = (error) => {
    return error?.code === 'resource-exhausted' || 
           error?.message?.includes('Quota exceeded') ||
           error?.message?.includes('resource-exhausted');
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

  // Throttled session tracking - only track once per 5 minutes
  const trackSession = async (user) => {
    const now = Date.now();
    const THROTTLE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    if (now - lastSessionTrackRef.current < THROTTLE_DURATION) {
      console.log("🚫 Session tracking throttled - too recent");
      return;
    }

    try {
      const sessionRef = doc(db, 'sessions', user.uid);
      const userRef = doc(db, 'users', user.uid);
      
      // Use updateDoc instead of setDoc for existing documents
      const sessionUpdate = {
        userAgent: navigator.userAgent,
        lastLogin: serverTimestamp(),
        timestamp: new Date().toISOString(),
      };
      
      const userUpdate = {
        lastLogin: serverTimestamp(),
      };

      // Batch these operations conceptually (using Promise.all)
      await Promise.all([
        updateDoc(sessionRef, sessionUpdate).catch(() => 
          setDoc(sessionRef, sessionUpdate, { merge: true })
        ),
        updateDoc(userRef, userUpdate).catch(() => 
          setDoc(userRef, userUpdate, { merge: true })
        )
      ]);
      
      lastSessionTrackRef.current = now;
      console.log("✅ Session tracked successfully");
    } catch (error) {
      const isQuotaError = handleFirestoreError(error, "trackSession");
      if (!isQuotaError) {
        throw error;
      }
    }
  };

  const clearSessionData = () => {
    console.log("🧹 Clearing session data...");
    localStorage.removeItem("sessionVersion");
    setFirestoreError(null);
    sessionVersionCacheRef.current = null;
    lastSessionTrackRef.current = 0;
    console.log("✅ Session data cleared successfully");
  };

  const resetUIState = () => {
    console.log("🔄 Resetting UI state...");
    setUser(null);
    setFirestoreError(null);
    
    // Clean up any active listeners
    if (userDocListenerRef.current) {
      userDocListenerRef.current();
      userDocListenerRef.current = null;
    }
    
    console.log("✅ UI state reset complete");
  };

  // Check session version on demand (not real-time)
  const checkSessionVersion = async (userId) => {
    if (firestoreError) return true; // Skip check if quota exceeded
    
    try {
      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const serverVersion = docSnap.data()?.sessionVersion || 1;
        const localVersion = Number(localStorage.getItem("sessionVersion")) || 1;
        
        console.log("🔍 Session version check:", { server: serverVersion, local: localVersion });
        
        if (serverVersion !== localVersion) {
          console.log("⚠️ Session version mismatch - logging out");
          alert("You've been logged out on this device.");
          await signOut(auth);
          return false;
        }
      }
      return true;
    } catch (error) {
      const isQuotaError = handleFirestoreError(error, "checkSessionVersion");
      return isQuotaError; // Continue if quota exceeded, fail if other error
    }
  };

  // Enhanced Auth State Setup with optimizations
  const forcedLogoutRef = useRef(false); // Add this at the top of the component

useEffect(() => {
  console.log("🔧 Setting up onAuthStateChanged listener");

  authTimeoutRef.current = setTimeout(() => {
    if (loading) {
      console.warn("⏰ Auth timeout reached");
      setAuthTimeout(true);
      setLoading(false);
    }
  }, 3000);

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    console.log("🔄 Auth state changed:", firebaseUser ? `User: ${firebaseUser.email}` : "User logged out");

    try {
      if (firebaseUser) {
        console.log("👤 Processing user login for:", firebaseUser.email);

        // Fetch user doc
        let userData = {};
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(userRef);
          userData = docSnap.exists() ? docSnap.data() : {};
          console.log("📄 User document data retrieved successfully");
        } catch (firestoreError) {
          const isQuotaError = handleFirestoreError(firestoreError, "getDoc in auth state");
          if (isQuotaError) {
            console.warn("⚠️ Using fallback user data due to quota exceeded");
            userData = {
              tier: "Free",
              firstname: firebaseUser.displayName?.split(' ')[0] || "",
              lastname: firebaseUser.displayName?.split(' ')[1] || "",
              sessionVersion: 1
            };
          } else {
            throw firestoreError;
          }
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

        // ⚠️ Check session version before setting localStorage
        const sessionOk = await checkSessionVersion(firebaseUser.uid);
        if (!sessionOk) return;

        const sessionVersion = userData.sessionVersion || 1;
        localStorage.setItem("sessionVersion", sessionVersion.toString());
        sessionVersionCacheRef.current = sessionVersion;

        setUser(finalUserData);

        // ✅ Track session
        await trackSession(firebaseUser);

        // ✅ Real-time listener (optional)
        if (!firestoreError && !userDocListenerRef.current) {
          console.log("📡 Setting up user document listener");
          const userRef = doc(db, "users", firebaseUser.uid);
          userDocListenerRef.current = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              console.log("🔄 User document updated");

              setUser((prev) => ({
                ...prev,
                ...data,
                tier: data.tier || "Free",
              }));
            }
          }, (error) => {
            const isQuotaError = handleFirestoreError(error, "user document listener");
            if (!isQuotaError) {
              console.error("❌ Critical error in user document listener:", error);
            }
          });
        }

      } else {
        console.log("👋 User signed out - cleaning up");
        forcedLogoutRef.current = false; // Reset
        clearSessionData();
        resetUIState();
      }
    } catch (error) {
      console.error("❌ Error in auth state change handler:", error);
      setUser(null);
    } finally {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
      setLoading(false);
      console.log("✅ Auth state processing complete");
    }
  });

  return () => {
    console.log("🔌 Cleaning up onAuthStateChanged listener");
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
    }
    unsubscribe();
  };
}, []);


  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      if (userDocListenerRef.current) {
        userDocListenerRef.current();
      }
    };
  }, []);

  // Optimized signup with single setDoc call
  const signup = async (firstname, lastname, phone, email, password, location, country, profilePicture) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Single document write with all user data
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
        console.log("✅ User document saved successfully");
      } catch (firestoreError) {
        const isQuotaError = handleFirestoreError(firestoreError, "signup setDoc");
        if (!isQuotaError) {
          throw firestoreError;
        }
        console.warn("⚠️ User created but document save failed due to quota");
      }

      localStorage.setItem("sessionVersion", "1");
      
      // Don't track session immediately after signup - auth state change will handle it
      console.log("✅ User signed up successfully");
    } catch (error) {
      console.error("❌ Signup error:", error);
      throw error;
    }
  };

  // Optimized login - let auth state change handle everything
  const login = async (email, password) => {
    console.log("🔑 Attempting login for:", email);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Firebase authentication successful for:", userCredential.user.email);
      
      // Everything else handled by onAuthStateChanged
      console.log("✅ User logged in successfully");
    } catch (error) {
      console.error("❌ Login error:", error.code, error.message);
      throw error;
    }
  };

  const logout = async (delay = 0) => {
    console.log("👋 Initiating logout process...");
    
    try {
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      await signOut(auth);
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Logout error:", error);
      clearSessionData();
      resetUIState();
      setLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("📩 Password reset email sent!");
    } catch (error) {
      console.error("❌ Password reset error:", error);
      throw error;
    }
  };

  // Utility function to refresh user data on demand
  const refreshUserData = async () => {
    if (!user?.uid || firestoreError) return;
    
    try {
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
    } catch (error) {
      handleFirestoreError(error, "refreshUserData");
    }
  };

  // Loading fallback component
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

  // Error fallback when auth fails completely
  const hasAuthError = (!user && !loading && (firestoreError || authTimeout)) || 
                      (!user && !loading && window.navigator.onLine === false);
  
  if (hasAuthError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {authTimeout ? "Connection Timeout" : "Error Loading User"}
          </h2>
          <p className="text-gray-600 mb-4">
            {authTimeout ? 
              "Authentication is taking longer than expected. Please check your connection and try again." :
              (firestoreError ? 
                "Our servers are currently experiencing high traffic. Please try again later." :
                "Please check your internet connection and try again."
              )
            }
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
        refreshUserData, // New utility function
        checkSessionVersion, // Expose for manual checks
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