import React, { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { FiBell, FiCloud, FiDatabase, FiSettings, FiShield, FiUser, FiGlobe, FiDownload, FiTrash2, FiLogOut, FiSave, FiCheck, FiX, FiUpload } from "react-icons/fi";
import { AiOutlineAppstore, AiOutlineGlobal } from "react-icons/ai";
import AccountPage from "../components/AccountPage";
import ThemeToggle from "../components/ThemeToggle";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, query, where, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";




const ReauthModal = ({ onSuccess, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Account Deletion</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <FiX className="w-5 h-5" />
        </button>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This action cannot be undone. Please re-authenticate to continue.
      </p>
      <div className="flex space-x-3">
        <button
          onClick={onSuccess}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Delete Account
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDestructive }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors font-medium ${
              isDestructive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState({ uid: 'demo-user', email: 'user@example.com' });
  const [userData, setUserData] = useState({ isOnline: true });
  const [isOnline, setIsOnline] = useState(true);
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
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setDataLoaded(true);
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setNotifications(parsed.notifications || notifications);
        setLanguage(parsed.language || "English");
        setPrivacy(parsed.privacy || privacy);
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
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setSaveSuccess(false);
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error("Save failed:", error);
      setIsSaving(false);
    }
  }, [notifications, language, privacy]);

  const handleNotificationChange = useCallback((key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handlePrivacyChange = useCallback((key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearHistory = () => {
    console.log("User history cleared.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const resetSavedItems = () => {
    console.log("Saved items reset.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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

    setTimeout(() => setIsExporting(false), 1000);
  }, [currentUser, notifications, language, privacy, userData]);

  const handleDeleteAccount = () => {
    setShowReauth(true);
  };

  const performFinalDelete = async () => {
    console.log("Account deletion process started");
    alert("Demo: Account would be deleted in real implementation");
  };

  const handleSessionLogout = useCallback(async () => {
    if (!currentUser) return;
    if (window.confirm("Log out from all other devices?")) {
      console.log("Logging out from other devices");
      alert("Logged out on all other devices.");
    }
  }, [currentUser]);

  // Loading screen with modern skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 dark:bg-gray-700 rounded-2xl h-96"></div>
              <div className="bg-gray-300 dark:bg-gray-700 rounded-2xl h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Settings & Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your preferences and account settings
          </p>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-6 right-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 z-50 flex items-center space-x-3 animate-[slideInRight_0.3s_ease-out]">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <FiCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Success!</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {saveSuccess ? "Settings saved successfully" : "Action completed"}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <FiSettings className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                App Settings
              </h2>
            </div>

            <div className="space-y-6">
              {/* Theme Section */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Theme Settings
                </h3>
                <ThemeToggle />
              </div>

              {/* Notifications Section */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {key === 'WeatherUpdates' && <FiCloud className="w-5 h-5 text-blue-500" />}
                        {key === 'AIResponses' && <AiOutlineAppstore className="w-5 h-5 text-purple-500" />}
                        {key === 'AppUpdates' && <FiBell className="w-5 h-5 text-green-500" />}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Section */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Privacy Settings
                </h3>
                <div className="space-y-3">
                  {Object.entries(privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {key === 'LocationAccess' && <FiGlobe className="w-5 h-5 text-orange-500" />}
                        {key === 'DataCollection' && <FiDatabase className="w-5 h-5 text-red-500" />}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                      <button
                        onClick={() => handlePrivacyChange(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language Section */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  Language Selection
                </h3>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              {/* Data Management Section */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                  Data Management
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={clearHistory}
                    className="flex items-center justify-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span className="font-medium">Clear History</span>
                  </button>
                  <button
                    onClick={resetSavedItems}
                    className="flex items-center justify-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span className="font-medium">Reset Saved Items</span>
                  </button>
                  <button
                    onClick={exportUserData}
                    disabled={isExporting}
                    className="flex items-center justify-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span className="font-medium">
                      {isExporting ? "Exporting..." : "Export My Data"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Session Management */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  Session Management
                </h3>
                <button
                  onClick={handleSessionLogout}
                  className="flex items-center justify-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors w-full"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="font-medium">Log Out of Other Devices</span>
                </button>
              </div>

              {/* Danger Zone */}
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
                  <FiShield className="w-4 h-4 mr-2" />
                  Danger Zone
                </h3>
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center justify-center space-x-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span className="font-medium">Delete My Account</span>
                </button>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] font-medium"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="w-5 h-5" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div>
            <AccountPage />
          </div>
        </div>
      </div>

      {/* Reauth Modal */}
      {showReauth && (
        <ReauthModal
          onSuccess={() => {
            setShowReauth(false);
            performFinalDelete();
          }}
          onClose={() => setShowReauth(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;