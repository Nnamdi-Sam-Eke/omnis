import React, { useState, useEffect, lazy, Suspense } from "react";
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { getAuth, deleteUser } from "firebase/auth";
import { FiBell, FiCloud, FiDatabase } from "react-icons/fi";
import { AiOutlineAppstore, AiOutlineGlobal } from "react-icons/ai";

// Lazy-loaded components
const ThemeToggle = lazy(() => import('./ThemeToggle'));
const ReauthModal = lazy(() => import('./ReauthModal'));
const ActivityLog = lazy(() => import('./ActivityLog'));

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [currentPage, setCurrentPage] = useState("settings");
  const [showReauth, setShowReauth] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [notifications, setNotifications] = useState({
    WeatherUpdates: true,
    AIResponses: true,
    AppUpdates: false,
  });

  const [language, setLanguage] = useState('English');
  const [privacy, setPrivacy] = useState({
    LocationAccess: true,
    DataCollection: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        setIsOnline(docSnap.data().isOnline);
      } else {
        setUserData(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleNotificationChange = (event) => {
    const { name, checked } = event.target;
    setNotifications({ ...notifications, [name]: checked });
  };

  const handlePrivacyChange = (event) => {
    const { name, checked } = event.target;
    setPrivacy({ ...privacy, [name]: checked });
  };

  const handleSave = () => {
    setIsSaving(true);
    setLoading(true);
    const settings = { notifications, language, privacy };
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      setTimeout(() => {
        setLoading(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }, 500);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your history?')) {
      console.log('History cleared');
    }
  };

  const resetSavedItems = () => {
    if (window.confirm('Reset all saved items?')) {
      console.log('Saved items reset');
    }
  };

  const exportUserData = async () => {
    setIsExporting(true);
    const settings = { notifications, language, privacy };
    const userExport = {
      uid: currentUser?.uid,
      email: currentUser?.email,
      settings,
      fetchedUserData: userData,
    };

    try {
      const blob = new Blob([JSON.stringify(userExport, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Omnis_UserData_${currentUser?.uid || "unknown"}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Error exporting data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const performFinalDelete = async () => {
    try {
      await deleteUser(currentUser);
      alert("Account deleted.");
      getAuth().signOut();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Account deletion failed. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    setShowReauth(true);
  };

const handleSessionLogout = async () => {
    if (!currentUser) return;

    if (window.confirm("Log out from all other devices?")) {
      const userRef = doc(db, "users", currentUser.uid);
      const newVersion = Date.now();
      await updateDoc(userRef, { sessionVersion: newVersion });
      localStorage.setItem("sessionVersion", newVersion.toString());
      alert("Sessions on other devices will be logged out on next activity.");
    }
  };


  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mb-4">
        Deeper config and app-wide settings...
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
              className="bg-white shadow-lg rounded-lg dark:bg-gray-800 p-6 border rounded-xl shadow-lg hover:shadow-blue-500/50 transition"
              role="region"
              aria-labelledby="settings-heading"
            >
              <h2 id="settings-heading" className="text-2xl font-semibold text-blue-500 dark:text-blue-300">
                Settings
              </h2>

              {/* Theme */}
              <div className="mt-4">
                <h3 className="font-semibold">Theme Settings</h3>
                <Suspense fallback={<div>Loading Theme Toggle...</div>}>
                  <ThemeToggle />
                </Suspense>
              </div>

              <hr className="my-4 border-gray-300 dark:border-gray-600" />

              {/* Notifications */}
              <div className="mt-6">
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
              <div className="mt-6">
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
                    <span className="flex items-center">
                      {key === 'LocationAccess' && <AiOutlineGlobal className="mr-2 text-orange-500" />}
                      {key === 'DataCollection' && <FiDatabase className="mr-2 text-red-500" />}
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>

              <hr className="my-4 border-gray-300 dark:border-gray-600" />

              {/* Language */}
              <div className="mt-6">
                <h3 className="font-semibold">Language Selection</h3>
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
              <div className="mt-4">
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
              <div className="mt-4">
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
              <div className="mt-4">
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
              <div className="flex justify-end">
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
            <Suspense fallback={<div>Loading Activity Log...</div>}>
              <ActivityLog />
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
