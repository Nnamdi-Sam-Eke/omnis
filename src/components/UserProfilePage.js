import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { onSnapshot } from "firebase/firestore";
import { ChevronDown, ChevronRight } from "lucide-react";
import ProfilePage from "./SimpleProfilePage";
import AccountPage from "./AccountPage";

// Subscription details component
const SubscriptionCard = ({ userDetails, onUpdateSubscription }) => {
  const [isOpen, setIsOpen] = useState(true); // default open

  useEffect(() => {
    const storedState = localStorage.getItem("subscriptionCardOpen");
    if (storedState !== null) {
      setIsOpen(storedState === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("subscriptionCardOpen", isOpen.toString());
  }, [isOpen]);

  return (
    <div className="bg-white shadow-lg rounded-lg dark:bg-gray-800 p-6 border rounded-xl hover:shadow-blue-500/50 transition">
      <div onClick={() => setIsOpen(!isOpen)} className="flex justify-between items-center cursor-pointer">
        <h2 className="text-xl font-semibold text-blue-500">Subscription</h2>
        {isOpen ? <ChevronDown className="w-5 h-5 text-blue-500" /> : <ChevronRight className="w-5 h-5 text-blue-500" />}
      </div>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"}`}>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Current Plan: {userDetails?.subscription?.plan || "N/A"}
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Next Payment Date: {userDetails?.subscription?.nextPaymentDate || "N/A"}
        </p>
        <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <button onClick={() => onUpdateSubscription("premium")} className="bg-blue-600 text-white py-1.5 px-3 text-sm sm:text-base rounded hover:bg-blue-700 transition w-full sm:w-auto">
            Upgrade
          </button>
          <button onClick={() => onUpdateSubscription("basic")} className="bg-green-600 text-white py-1.5 px-3 text-sm sm:text-base rounded hover:bg-green-700 transition w-full sm:w-auto">
            Downgrade
          </button>
        </div>
      </div>
    </div>
  );
};

// Billing Information Update Form

const BillingInfoForm = ({ onSaveBillingInfo }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Persist accordion open state
  useEffect(() => {
    const stored = localStorage.getItem("billingInfoFormOpen");
    if (stored !== null) setIsOpen(stored === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("billingInfoFormOpen", isOpen.toString());
  }, [isOpen]);

  // Toast component
  const ToastMessage = ({ message, visible }) => {
    if (!visible) return null;
    return (
      <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
        {message}
      </div>
    );
  };

  const handleBillingUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await onSaveBillingInfo({ cardNumber, billingAddress });
      setToastMessage("Billing information saved successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch {
      setToastMessage("Failed to save billing information.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg dark:bg-gray-800 p-6 border rounded-xl hover:shadow-blue-500/50 transition relative">
      {/* Toast */}
      <ToastMessage message={toastMessage} visible={showToast} />

      {/* Accordion Header */}
      <div
        onClick={() => setIsOpen((o) => !o)}
        className="flex justify-between items-center cursor-pointer"
      >
        <h2 className="text-xl font-semibold text-blue-500">
          Update Billing Information
        </h2>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-blue-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-blue-500" />
        )}
      </div>

      {/* Accordion Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <form onSubmit={handleBillingUpdate} className="space-y-4">
          {/* Card Number Field */}
          <div>
            <label className="block text-gray-600 dark:text-gray-400">
              Card Number
            </label>
            {actionLoading ? (
              <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse" />
            ) : (
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Enter your card number"
                className="w-full p-2 border rounded-md"
                required
              />
            )}
          </div>

          {/* Billing Address Field */}
          <div>
            <label className="block text-gray-600 dark:text-gray-400">
              Billing Address
            </label>
            {actionLoading ? (
              <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse" />
            ) : (
              <input
                type="text"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="Enter your billing address"
                className="w-full p-2 border rounded-md"
                required
              />
            )}
          </div>

          {/* Save Button */}
          <div>
            {actionLoading ? (
              <div className="h-10 w-full bg-blue-400 rounded animate-pulse" />
            ) : (
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Save Billing Information
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// User Profile Page
const UserProfilePage = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("settings");

  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleUpdateSubscription = async (newPlan) => {
    if (!userData) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        "subscription.plan": newPlan,
        "subscription.nextPaymentDate": new Date().toLocaleDateString(),
      });
      alert(`Successfully updated to ${newPlan} plan!`);
    } catch (error) {
      alert("Failed to update subscription.");
    }
  };

  const handleSaveBillingInfo = async (billingInfo) => {
    if (!userData) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        "billing.cardNumber": billingInfo.cardNumber,
        "billing.billingAddress": billingInfo.billingAddress,
      });
      alert("Billing information saved successfully!");
    } catch (error) {
      alert("Failed to save billing information.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mb-4">Personal settings / preferences...</h1>
      <div className="flex flex-col md:flex-row gap-6 p-4 h-9/10">
        <div className="w-full md:w-3/4">
          <ProfilePage userDetails={userData} isLoading={isLoading} />
        </div>
        <div className="w-full md:w-3/4 p-6 rounded-xl h-9/10">
          <AccountPage userDetails={userData} isLoading={isLoading} />
        </div>
        <div className="w-full md:w-3/4">
          {currentPage === "settings" && (
            <div className="bg-white shadow-lg rounded-lg dark:bg-gray-800 p-6 border rounded-xl shadow-lg hover:shadow-blue-500/50 transition">
              <h2 className="text-2xl font-semibold text-blue-500 dark:text-blue-300">Subscription & Billing</h2>
              <div className="mt-6">
                <SubscriptionCard userDetails={userData} onUpdateSubscription={handleUpdateSubscription} />
              </div>
              <div className="mt-6">
                <BillingInfoForm onSaveBillingInfo={handleSaveBillingInfo} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { SubscriptionCard, BillingInfoForm }; // Export components for testing or reuse
export default UserProfilePage;