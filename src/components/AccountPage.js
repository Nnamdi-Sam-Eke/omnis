import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { FiBellOff, FiPlus, FiShield, FiLock, FiSettings, FiTrash2, FiX } from "react-icons/fi";
import { updatePassword } from "firebase/auth";
import SkeletonLoader from "./SkeletonLoader"; // Assuming you have a skeleton loader component

const AccountPage = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [showPopUp, setShowPopUp] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [secretKey, setSecretKey] = useState("JBSWY3DPEHPK3PXP");
  const [qrCodeUrl, setQrCodeUrl] = useState(
    `https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/OmnisApp?secret=JBSWY3DPEHPK3PXP&size=200x200`
  );
  const [linkedAccounts, setLinkedAccounts] = useState(["Google"]);
  const [linkingProvider, setLinkingProvider] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [unlinkingProvider, setUnlinkingProvider] = useState(null);

  const isLinked = (provider) => linkedAccounts.includes(provider);

  const linkAccount = (provider) => {
    setIsRedirecting(true);
    setTimeout(() => {
      handleLinkedAccount(provider, "link");
      setLinkedAccounts((prev) => [...prev, provider]);
      setIsRedirecting(false);
      setLinkingProvider(null);
      setShowPopUp(null);
    }, 2000);
  };

  const unlinkAccount = (provider) => {
    setUnlinkingProvider(provider);
    setTimeout(() => {
      handleLinkedAccount(provider, "unlink");
      setLinkedAccounts((prev) => prev.filter((p) => p !== provider));
      setUnlinkingProvider(null);
    }, 1500);
  };

  useEffect(() => {
    if (!currentUser) {
      console.log("No current user");
      setInitialLoading(false);
      setIsLoading(false);
      return;
    }
  
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const user = userSnap.data();
          setUserData(user);
          setIsOnline(user.isOnline || false);
        } else {
          console.error("No user data found in Firestore!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    setInitialLoading(true);
    fetchUserData();
  
    const timeout = setTimeout(() => {
      setInitialLoading(false);
    }, 1000); // 1 second skeleton minimum
  
    return () => clearTimeout(timeout);
  }, [currentUser]);
  

  const togglePopUp = (setting) => {
    setShowPopUp(showPopUp === setting ? null : setting);
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      const user = currentUser;
      await updatePassword(user, newPassword);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        lastPasswordChange: new Date(),
      });
      alert("Password updated successfully.");
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Error updating password.");
    }
  };

  const handle2FAToggle = async (enabled) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        twoFactorEnabled: enabled,
      });
      alert(`2FA ${enabled ? "enabled" : "disabled"}.`);
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      alert("Error updating 2FA.");
    }
  };

  const handleLinkedAccount = async (platform, action) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      let update = {};
      if (action === "link") {
        update = {
          linkedAccounts: arrayUnion(platform),
        };
      } else if (action === "unlink") {
        update = {
          linkedAccounts: arrayRemove(platform),
        };
      }

      await updateDoc(userRef, update);
      alert(`${platform} account ${action === "link" ? "linked" : "unlinked"}.`);
    } catch (error) {
      console.error("Error updating linked accounts:", error);
      alert("Error managing linked account.");
    }
  };

  const renderPopup = (title, contentJSX) => (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl max-w-md w-full mx-4 relative text-sm leading-relaxed max-h-[80vh] sm:max-h-[70vh] overflow-y-auto">
        <button
          onClick={() => setShowPopUp(null)}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          <FiX size={30} />
        </button>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div>{contentJSX}</div>
      </div>
    </div>
  );

  // Animated loading screen
  if (initialLoading || isLoading) {
    return (
      <SkeletonLoader height="h-full" width="w-full" />
  )
  }
  

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900 p-4 w-full" role="main">
      <div className="bg-white w-full dark:bg-gray-800 border-2 p-6 rounded-xl shadow-lg hover:shadow-blue-500/50 transition w-full max-w-lg mx-auto" role="region" aria-label="Account settings section">
        <h2 className="text-2xl font-semibold text-center text-blue-500 dark:text-blue-300 flex items-center justify-center" role="heading" aria-level="2">
          <FiSettings className="mr-2" /> Account Settings
        </h2>

        <div className="mt-4 space-y-4 text-sm md:text-base text-gray-700 dark:text-gray-300" role="list">
          <div className="setting-item relative" role="listitem">
            <p
              role="button"
              tabIndex={0}
              className="flex items-center cursor-pointer hover:text-blue-500 transition"
              onClick={() => togglePopUp("changePassword")}
            >
              <FiLock className="mr-2" />
              <span className="truncate">Change Password</span>
            </p>
          </div>
          <div className="setting-item relative" role="listitem">
            <p
              role="button"
              tabIndex={0}
              className="flex items-center cursor-pointer hover:text-blue-500 transition"
              onClick={() => togglePopUp("enable2FA")}
            >
              <FiShield className="mr-2" />
              <span className="truncate">Enable Two-Factor Authentication</span>
            </p>
          </div>
          <div className="setting-item relative" role="listitem">
            <p
              role="button"
              tabIndex={0}
              className="flex items-center cursor-pointer hover:text-blue-500 transition"
              onClick={() => togglePopUp("linkedAccounts")}
            >
              <FiPlus className="mr-2" />
              <span className="truncate">Manage Linked Accounts</span>
            </p>
          </div>
          <div className="setting-item relative" role="listitem">
            <p
              role="button"
              tabIndex={0}
              className="flex items-center cursor-pointer hover:text-blue-500 transition"
              onClick={() => togglePopUp("notificationPreferences")}
            >
              <FiBellOff className="mr-2" />
              <span className="truncate">Notification Preferences</span>
            </p>
          </div>
        </div>
      </div>

      {/* Continue your popups here as needed */}
      {showPopUp === "changePassword" &&
        renderPopup("Change Password", (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordChange(e.target.currentPassword.value, e.target.newPassword.value);
            }}
          >
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              className="w-full p-2 mb-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              className="w-full p-2 mb-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              className="w-full p-2 mb-2 border border-gray-300 rounded-md"
              required
            />
            <button type="submit" className="w-full bg-blue-500 text-white py-2 mt-3 rounded-md">
              Save Changes
            </button>
          </form>
        ))}
        {showPopUp === "notificationPreferences" &&
        renderPopup(
          "Notification Preferences",
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Preferences saved!");
            }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-6 h-6 text-blue-500 rounded-lg border-gray-300 dark:border-gray-600"
                id="emailNotifications"
              />
              <label
                htmlFor="emailNotifications"
                className="text-lg font-medium text-gray-700 dark:text-gray-300"
              >
                Email Notifications
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-6 h-6 text-blue-500 rounded-lg border-gray-300 dark:border-gray-600"
                id="pushNotifications"
              />
              <label
                htmlFor="pushNotifications"
                className="text-lg font-medium text-gray-700 dark:text-gray-300"
              >
                Push Notifications
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-6 h-6 text-blue-500 rounded-lg border-gray-300 dark:border-gray-600"
                id="smsNotifications"
              />
              <label
                htmlFor="smsNotifications"
                className="text-lg font-medium text-gray-700 dark:text-gray-300"
              >
                SMS Notifications
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md text-lg"
            >
              Save Preferences
            </button>
            <button
              type="button"
              onClick={() => setShowPopUp(null)}
              className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-md text-lg"
            >
              Cancel
            </button>
          </form>
        )}

{showPopUp === "linkedAccounts" &&
            renderPopup("Linked Accounts", (
              <div className="space-y-4">
                {linkedAccounts.map((account) => (
                  <div key={account} className="flex items-center justify-between">
                    <span>{account}</span>
                    <button
                      onClick={() => unlinkAccount(account)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
                {!isRedirecting && (
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => linkAccount("Google")}
                      className="flex items-center gap-2 text-blue-500"
                    >
                      <FiPlus />
                      Link Google Account
                    </button>
                  </div>
                )}
                {isRedirecting && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Redirecting to {linkingProvider}...
                    </p>
                  </div>
                )}
              </div>
            ))}

{showPopUp === "enable2FA" &&
  renderPopup(
    "Enable Two-Factor Authentication",
    <div className="space-y-4">
      <p className="text-gray-700 dark:text-gray-300">
        Two-Factor Authentication (2FA) adds an extra layer of security to your account. By enabling 2FA, you'll verify your identity using a code sent to your phone or generated by an authentication app.
      </p>

      {/* Step 1: Choose Method */}
      <div>
        <label className="block text-sm font-medium mb-2 text-green-500">
          Choose a method:
        </label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              name="2faMethod"
              id="sms"
              checked={selectedMethod === "sms"}
              onChange={() => setSelectedMethod("sms")}
              className="mr-2"
            />
            <label htmlFor="sms" className="text-gray-700 dark:text-gray-300">
              Receive via SMS
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              name="2faMethod"
              id="authApp"
              checked={selectedMethod === "authApp"}
              onChange={() => setSelectedMethod("authApp")}
              className="mr-2"
            />
            <label htmlFor="authApp" className="text-gray-700 dark:text-gray-300">
              Use Authentication App (e.g., Google Authenticator)
            </label>
          </div>
        </div>
      </div>

      {/* Step 2: Conditional Form Fields */}
      {selectedMethod === "sms" && (
        <div className="space-y-2">
          <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter your phone number:
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      )}

      {selectedMethod === "authApp" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Scan this QR code with your authentication app (e.g., Google Authenticator), or enter the secret key manually.
          </p>
          <div className="flex justify-center">
            <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-center text-sm text-gray-800 dark:text-gray-200">
            Secret Key: <strong>{secretKey}</strong>
          </div>
          <div>
            <label htmlFor="authCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter the 6-digit code from your app:
            </label>
            <input
              type="text"
              id="authCode"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="123456"
              className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-x-4 mt-6">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => {
            if (selectedMethod === "sms" && phoneNumber) {
              // Handle SMS logic
              console.log("Send code to:", phoneNumber);
            } else if (selectedMethod === "authApp" && authCode) {
              // Validate code logic
              console.log("Verify TOTP code:", authCode);
            } else {
              alert("Please complete the setup.");
            }
          }}
        >
          Enable
        </button>
        <button
              onClick={() => setShowPopUp(null)}
              className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-md text-lg"
            >
              Cancel
            </button>
      </div>
    </div>
  )}

    </div>
  );
};
export default AccountPage;
