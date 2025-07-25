import React, { useState, useEffect, useMemo } from "react";
import { FiBellOff, FiPlus, FiShield, FiLock, FiSettings, FiTrash2, FiX, FiUser, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";

// Mock components for demo
const SkeletonLoader = ({ height = "h-full", width = "w-full" }) => (
  <div className={`${height} ${width} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded-xl`} />
);

const AccountPage = () => {
  // Mock auth context - moved outside component or use useMemo to prevent recreation
  const currentUser = useMemo(() => ({ uid: "demo-user" }), []);
  
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isLinked = (provider) => linkedAccounts.includes(provider);

  const linkAccount = (provider) => {
    setLinkingProvider(provider);
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
        const user = { isOnline: true };
        setUserData(user);
        setIsOnline(user.isOnline || false);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      } finally {
        setIsLoading(false);
        setInitialLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const togglePopUp = (setting) => {
    setShowPopUp(showPopUp === setting ? null : setting);
  };

  useEffect(() => {
    if (showPopUp === "enable2FA") {
      // Reset 2FA state
      setSelectedMethod("");
      setPhoneNumber("");
      setAuthCode("");
    }
  }, [showPopUp]);

  const handle2FAToggle = async (enabled) => {
    try {
      console.log("2FA toggle:", enabled);
      alert(`2FA ${enabled ? "enabled" : "disabled"}.`);
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      alert("Error updating 2FA.");
    }
  };

  const handleEmailChange = async (newEmail) => {
    try {
      console.log("Email changed to:", newEmail);
      alert("Email updated successfully.");
      setShowPopUp(null);
    } catch (error) {
      console.error("Error updating email:", error);
      alert("Error updating email.");
    }
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      if (newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }

      // Mock password change
      console.log("Password change:", { currentPassword, newPassword });
      alert("Password updated successfully.");
      setShowPopUp(null);
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Error updating password.");
    }
  };

  const handleLinkedAccount = async (platform, action) => {
    try {
      console.log("Linked account:", { platform, action });
      alert(`${platform} account ${action === "link" ? "linked" : "unlinked"}.`);
    } catch (error) {
      console.error("Error updating linked accounts:", error);
      alert("Error managing linked account.");
    }
  };

  const renderPopup = (title, contentJSX) => (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/30 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-900 shadow-2xl p-8 rounded-3xl max-w-md w-full mx-4 relative border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto">
        <button
          onClick={() => setShowPopUp(null)}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <FiX size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h2>
        <div>{contentJSX}</div>
      </div>
    </div>
  );

  if (initialLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader height="h-96" width="w-full" />
        </div>
      </div>
    );
  }

  const settingsItems = [
    {
      id: "changePassword",
      icon: FiLock,
      title: "Change Password",
      description: "Update your account password",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      id: "enable2FA",
      icon: FiShield,
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security",
      color: "text-green-600 dark:text-green-400"
    },
    {
      id: "linkedAccounts",
      icon: FiPlus,
      title: "Linked Accounts",
      description: "Manage your connected accounts",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      id: "notificationPreferences",
      icon: FiBellOff,
      title: "Notifications",
      description: "Control your notification preferences",
      color: "text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
            <FiUser className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account security and preferences
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => togglePopUp(item.id)}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${item.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
                    <IconComponent className={`text-2xl ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {item.description}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <FiPlus className="text-white text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Popups */}

        {showPopUp === "notificationPreferences" &&
          renderPopup("Notification Preferences", (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Preferences saved!");
              }}
              className="space-y-6"
            >
              <div className="space-y-4">
                {[
                  { id: "emailNotifications", label: "Email Notifications", icon: "📧" },
                  { id: "pushNotifications", label: "Push Notifications", icon: "🔔" },
                  { id: "smsNotifications", label: "SMS Notifications", icon: "📱" }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.icon}</span>
                      <label htmlFor={item.id} className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        {item.label}
                      </label>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id={item.id}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Save Preferences
                </button>
                <button
                  type="button"
                  onClick={() => setShowPopUp(null)}
                  className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ))}

        {showPopUp === "linkedAccounts" &&
          renderPopup("Linked Accounts", (
            <div className="space-y-6">
              <div className="space-y-3">
                {linkedAccounts.map((account) => (
                  <div key={account} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">G</span>
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{account}</span>
                    </div>
                    <button
                      onClick={() => unlinkAccount(account)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {!isRedirecting && (
                <button
                  onClick={() => linkAccount("Google")}
                  className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                >
                  <FiPlus size={20} />
                  <span>Link Google Account</span>
                </button>
              )}

              {isRedirecting && (
                <div className="flex flex-col items-center space-y-4 p-6">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Redirecting to {linkingProvider}...
                  </p>
                </div>
              )}
            </div>
          ))}

        {showPopUp === "enable2FA" &&
          renderPopup("Two-Factor Authentication", (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Two-Factor Authentication (2FA) adds an extra layer of security to your account. 
                  You'll verify your identity using a code sent to your phone or generated by an authentication app.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  Choose your preferred method:
                </label>
                <div className="space-y-3">
                  {[
                    { id: "sms", label: "SMS Text Message", icon: "📱", desc: "Receive codes via text" },
                    { id: "authApp", label: "Authentication App", icon: "🔐", desc: "Use Google Authenticator or similar" }
                  ].map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedMethod === method.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="2faMethod"
                          id={method.id}
                          checked={selectedMethod === method.id}
                          onChange={() => setSelectedMethod(method.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <label htmlFor={method.id} className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            {method.label}
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{method.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMethod === "sms" && (
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>
              )}

              {selectedMethod === "authApp" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      Scan this QR code with your authentication app:
                    </p>
                    <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                      <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Or enter this key manually:</p>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border font-mono text-sm text-center">
                      {secretKey}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="authCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="authCode"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-center text-lg font-mono"
                      maxLength={6}
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  onClick={() => {
                    if (selectedMethod === "sms" && phoneNumber) {
                      console.log("Send code to:", phoneNumber);
                    } else if (selectedMethod === "authApp" && authCode) {
                      console.log("Verify TOTP code:", authCode);
                    } else {
                      alert("Please complete the setup.");
                    }
                  }}
                >
                  Enable 2FA
                </button>
                <button
                  onClick={() => setShowPopUp(null)}
                  className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
     
        {showPopUp === "changePassword" &&
          renderPopup("Change Password", (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const currentPassword = e.target.currentPassword.value;
                const newPassword = e.target.newPassword.value;
                handlePasswordChange(currentPassword, newPassword);
              }}
              className="space-y-6"
            >
              <div className="relative">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  placeholder="Enter your current password"
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-[46px] text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              <div className="relative">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  placeholder="Enter your new password"
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-[46px] text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPopUp(null)}
                  className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ))}

        {showPopUp === "changeEmail" &&
          renderPopup("Change Email", (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEmailChange(e.target.newEmail.value);
              }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Email
                </label>
                <input
                  type="email"
                  id="newEmail"
                  name="newEmail"
                  placeholder="Enter your new email"
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Update Email
                </button>
                <button
                  type="button"
                  onClick={() => setShowPopUp(null)}
                  className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ))}

      </div>
    </div>
  );
};

export default AccountPage;