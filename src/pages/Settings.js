import React, { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { db } from "../firebase";
import { doc, getDoc,  deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth, deleteUser, signOut } from "firebase/auth";
import { FiBell, FiCloud, FiDatabase, FiSettings } from "react-icons/fi";
import { AiOutlineAppstore, AiOutlineGlobal } from "react-icons/ai";

const ThemeToggle = lazy(() => import('../components/ThemeToggle'));
const ReauthModal = lazy(() => import('../components/ReauthModal'));
const AccountPage = lazy(() => import('../components/AccountPage'));

const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentPage, setCurrentPage] = useState("settings");
  const [notifications, setNotifications] = useState({
    WeatherUpdates: true,
    AIResponses: true,
    AppUpdates: false,
  });
  const [language, setLanguage] = useState("English");
  const [privacy, setPrivacy] = useState({
    LocationAccess: true,
    DataCollection: false,
  });
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showReauth, setShowReauth] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Timer to ensure loader shows for minimum 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dataLoaded) {
        setLoading(false);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [dataLoaded]);

  // Check if we can hide loading when data is loaded
  useEffect(() => {
    if (dataLoaded) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [dataLoaded]);
    
  // Fetch user from Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    setCurrentUser(user);
  }, []);

  // Fetch Firestore user data
  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setIsOnline(data?.isOnline || false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setDataLoaded(true);
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setNotifications(parsed.notifications || {});
        setLanguage(parsed.language || "English");
        setPrivacy(parsed.privacy || {});
      } catch (error) {
        console.error("Failed to load saved settings:", error);
      }
    }
  }, []);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    const settings = { notifications, language, privacy };

    try {
      localStorage.setItem("userSettings", JSON.stringify(settings));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  }, [notifications, language, privacy]);

  const handleNotificationChange = useCallback((e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  }, []);

  const handlePrivacyChange = useCallback((e) => {
    const { name, checked } = e.target;
    setPrivacy((prev) => ({ ...prev, [name]: checked }));
  }, []);

  const clearHistory = () => {
    console.log("User history cleared.");
    // TODO: implement actual history clearing
  };

  const resetSavedItems = () => {
    console.log("Saved items reset.");
    // TODO: implement actual reset logic
  };

  const exportUserData = useCallback(() => {
    if (!currentUser) return;

    setIsExporting(true);

    const data = {
      uid: currentUser.uid,
      email: currentUser.email,
      settings: { notifications, language, privacy },
      userData,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Omnis_Export_${currentUser.uid}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setIsExporting(false);
  }, [currentUser, notifications, language, privacy, userData]);

  const handleDeleteAccount = () => {
    setShowReauth(true);
  };

  // Perform final delete after re-authentication
  const performFinalDelete = async () => {
    if (!currentUser) return;

    try {
      const uid = currentUser.uid;

      // Delete Firestore user doc
      await deleteDoc(doc(db, 'users', uid));

      // Delete Firestore session doc
      await deleteDoc(doc(db, 'sessions', uid));

      // Delete Firebase Auth user
      await deleteUser(currentUser);

      // Sign out and redirect
      await signOut(getAuth());

    } catch (error) {
      console.error("Account deletion failed:", error);
      alert("Something went wrong while deleting your account. Please try again.");
    }
  };

  // Handle session logout
  const handleSessionLogout = useCallback(async () => {
    if (!currentUser) return;
    if (window.confirm("Log out from all other devices?")) {
      const userRef = doc(db, "users", currentUser.uid);
      const newVersion = Date.now();
      await updateDoc(userRef, { sessionVersion: newVersion });
      localStorage.setItem("sessionVersion", newVersion.toString());
      alert("Logged out on all other devices.");
    }
  }, [currentUser]);

  // Show loading screen
  if (loading) {  
    return (
      
        <div className="animate-pulse mx-auto w-10/12 mt-6 max-w-4xl space-y-4">
          <div className="h-80 bg-gray-300 dark:bg-gray-700 rounded w-full mb-8" />
        </div>
    
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-10 mb-4">
        Deeper config and app-wide settings
      </h1>

      {showToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          Settings saved successfully!
        </div>
      )}

      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full max-w-6xl mx-auto">
          {currentPage === "settings" && (
            <div
              className="bg-white shadow-lg rounded-lg dark:bg-gray-800 dark:text-white p-6 border rounded-xl shadow-lg hover:shadow-blue-500/50 transition"
              role="region"
              aria-labelledby="settings-heading"
            >
              <h2 id="settings-heading" className="text-2xl font-semibold text-green-500 flex items-center justify-center">
                <FiSettings className="mr-2" /> App Settings
              </h2>

              {/* Theme */}
              <div className="mt-4" title="Click to change themes">
                <h3 className="font-semibold">Theme Settings</h3>
                <Suspense fallback={<div>Loading Theme Toggle...</div>}>
                  <ThemeToggle />
                </Suspense>
              </div>

              <hr className="my-4 border-gray-300 dark:border-gray-600" />

              {/* Notifications */}
              <div className="mt-6" title="Click to select your preferred notifications">
                <h3 className="font-semibold">Notification Preferences</h3>
                {Object.keys(notifications).map((key) => (
                  <label key={key} className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      name={key}
                      checked={notifications[key]}
                      onChange={handleNotificationChange}
                      aria-label={`${key} notification toggle`}
                    />
                    <span className="flex items-center">
                      {key === 'WeatherUpdates' && <FiCloud className="mr-2 text-blue-500" />}
                      {key === 'AIResponses' && <AiOutlineAppstore className="mr-2 text-purple-500" />}
                      {key === 'AppUpdates' && <FiBell className="mr-2 text-green-500" />}
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>

              <hr className="my-4 border-gray-300 dark:border-gray-600" />

              {/* Privacy */}
              <div className="mt-6" title="Select your privacy settings">
                <h3 className="font-semibold">Privacy Settings</h3>
                {Object.keys(privacy).map((key) => (
                  <label key={key} className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      name={key}
                      checked={privacy[key]}
                      onChange={handlePrivacyChange}
                      aria-label={`${key} privacy toggle`}
                    />
                    <span className="flex items-center dark:text-white">
                      {key === 'LocationAccess' && <AiOutlineGlobal className="mr-2 text-orange-500" />}
                      {key === 'DataCollection' && <FiDatabase className="mr-2 text-red-500" />}
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>

              <hr className="my-4 border-gray-300 dark:border-gray-600" />

              {/* Language */}
              <div className="mt-6" title="Select your preferred language">
                <h3 className="font-semibold ">Language Selection</h3>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="p-2 mt-8 border rounded-md dark:bg-gray-700"
                  aria-label="Language selector"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <hr className="my-4 border-gray-300 dark:border-gray-600" />

              {/* Data Management */}
              <div className="mt-4" title="Manage your data and history">
                <h3 className="font-semibold hover:scale-105">Data Management</h3>
                <button
                  onClick={clearHistory}
                  className="hover:scale-105 mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && clearHistory()}
                  aria-label="Clear history"
                >
                  Clear History
                </button>
                <button
                  onClick={resetSavedItems}
                  className="hover:scale-105 mt-6 ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-red-600 transition"
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && resetSavedItems()}
                  aria-label="Reset saved items"
                >
                  Reset Saved Items
                </button>
                <button
                  onClick={exportUserData}
                  disabled={isExporting}
                  className={`hover:scale-105 mt-6 ml-2 px-4 py-2 ${
                    isExporting ? 'bg-gray-400' : 'bg-blue-600'
                  } text-white rounded-md hover:bg-blue-700 transition`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && exportUserData()}
                  aria-label="Export user data"
                >
                  {isExporting ? "Exporting..." : "Export My Data"}
                </button>
              </div>

              <hr className="my-4 border-gray-300 dark:border-gray-600" />

              {/* Session Management */}
              <div className="mt-4" title="Manage your sessions">
                <h3 className="font-semibold hover:scale-105">Session Management</h3>
                <button
                  onClick={handleSessionLogout}
                  className="hover:scale-105 mt-6 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSessionLogout()}
                  aria-label="Log out of other devices"
                >
                  Log Out of Other Devices
                </button>
              </div>

              <hr className="my-4 border-gray-300 dark:border-gray-600" />

              {/* Danger Zone */}
              <div className="mt-4" title="Delete your account">
                <h3 className="font-semibold text-red-500 hover:scale-105">Danger Zone</h3>
                <button
                  onClick={handleDeleteAccount}
                  className="hover:scale-105 mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleDeleteAccount()}
                  aria-label="Delete my account"
                >
                  Delete My Account
                </button>
              </div>

              <hr className="my-4 border-gray-300 dark:border-gray-600" />

              {/* Save Button */}
              <div className="flex justify-end" title="Save your settings">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`mt-6 px-8 hover:scale-105 py-2 transform ${
                    isSaving ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-green-500'
                  } text-white rounded-md hover:bg-gradient-to-r from-blue-500 to-green-600 transition`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSave()}
                  aria-label="Save settings"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>

            </div>
          )}
          <div>
            <Suspense fallback={<div>Loading Account Page..</div>}>
              <AccountPage />
            </Suspense>
          </div>
        </div>
      </div>

      {showReauth && (
        <Suspense fallback={<div>Loading modal...</div>}>
          <ReauthModal
            onSuccess={() => {
              setShowReauth(false);
              performFinalDelete();
            }}
            onClose={() => setShowReauth(false)}
          />
        </Suspense>
      )}

    </div>
  );
};

export default ProfilePage;