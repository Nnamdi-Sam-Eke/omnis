// src/components/UserProfilePage.js
import React, { useState, useEffect, lazy, Suspense } from "react";
// import { useStripe } from "@stripe/react-stripe-js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { onSnapshot } from "firebase/firestore";
import { ChevronDown, ChevronRight } from "lucide-react";
import ProfilePage from "../components/SimpleProfilePage";
import AccountPage from "../components/AccountPage";

// ── SubscriptionCard with Stripe checkout & skeleton on expand ─────────────────────────────
const SubscriptionCard = ({ userDetails }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // const stripe = useStripe();
  const functions = getFunctions();

  const toggleOpen = () => {
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
      }
      return next;
    });
  };

  const handleCheckout = async (priceId) => {
  const createSession = httpsCallable(functions, "createCheckoutSession");
  const { data } = await createSession({
    priceId,
    successUrl: window.location.href + "?subscribed=true",
    cancelUrl: window.location.href,
  });

  // if (stripe) {
  //   const { error } = await stripe.redirectToCheckout({
  //     sessionId: data.sessionId,
  //   });

  //   if (error) {
  //     console.error("Stripe Checkout error: ", error);
  //   }
  // }
};


  return (
    <div className="bg-white dark:bg-gray-800 border shadow-lg rounded-xl p-6 transition hover:shadow-blue-500/50">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls="subscription-content"
        aria-label="Toggle Subscription Section"
        onClick={toggleOpen}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && toggleOpen()}
        className="flex justify-between items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <h2 className="text-2xl font-semibold text-blue-500 dark:text-blue-300">Subscription</h2>
        {isOpen ? <ChevronDown className="w-5 h-5 dark:text-white" /> : <ChevronRight className="w-5 h-5 dark:text-white" />}
      </div>

      <div
        id="subscription-content"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-64 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-5 w-2/3 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-5 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-10 w-full bg-blue-300 dark:bg-blue-700 rounded" />
          </div>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-400">Current Plan: {userDetails?.subscription?.plan || "N/A"}</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Next Payment: {userDetails?.subscription?.nextPaymentDate || "N/A"}
            </p>
            <div className="flex space-x-2">
              <button
                aria-label="Upgrade to premium"
                onClick={() => handleCheckout(userDetails.subscription.premiumPriceId)}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Upgrade
              </button>
              <button
                aria-label="Downgrade to basic"
                onClick={() => handleCheckout(userDetails.subscription.basicPriceId)}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Downgrade
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── BillingInfoForm with skeleton on expand ───────────────────────────────────────────────────
const BillingInfoForm = ({ onSaveBillingInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ cardNumber: "", billingAddress: "" });

  const toggleOpen = () => {
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
      }
      return next;
    });
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveBillingInfo(form);
      setToast("Billing info saved!");
    } catch {
      setToast("Save failed.");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(""), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg border rounded-xl p-6 transition hover:shadow-blue-500/50 relative">
      {toast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded animate-fade-in z-50">
          {toast}
        </div>
      )}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls="billing-content"
        aria-label="Toggle Billing Information Section"
        onClick={toggleOpen}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && toggleOpen()}
        className="flex justify-between items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <h2 className="text-2xl font-semibold text-blue-500 dark:text-blue-300">Billing Information</h2>
        {isOpen ? <ChevronDown className="w-5 h-5 dark:text-white" /> : <ChevronRight className="w-5 h-5 dark:text-white" />}
      </div>

      <div
        id="billing-content"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-10 bg-blue-300 dark:bg-blue-700 rounded" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-gray-600 dark:text-white">
                Card Number
              </label>
              <input
                id="cardNumber"
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="billingAddress" className="block text-gray-600 dark:text-white">
                Billing Address
              </label>
              <input
                id="billingAddress"
                name="billingAddress"
                value={form.billingAddress}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
  bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {saving ? "Saving…" : "Save Billing Info"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Main UserProfilePage ─────────────────────────────────────────────────────────────────────
const UserProfilePage = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, "users", currentUser.uid), snap => {
      if (snap.exists()) {
        setUserData(snap.data());
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, [currentUser]);

  const handleUpdateSubscription = async plan => {
    const ref = doc(db, "users", currentUser.uid);
    await updateDoc(ref, {
      "subscription.plan": plan,
      "subscription.nextPaymentDate": new Date().toLocaleDateString()
    });
  };

  const handleSaveBillingInfo = async info => {
    const ref = doc(db, "users", currentUser.uid);
    await updateDoc(ref, {
      "billing.cardNumber": info.cardNumber,
      "billing.billingAddress": info.billingAddress
    });
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-blue-500 dark:text-blue-300">
        Personal Settings & Preferences
      </h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Suspense fallback={<div>Loading Profile…</div>}>
            <ProfilePage userDetails={userData} isLoading={isLoading} />
          </Suspense>
        </div>
        <div className="flex-1">
          <Suspense fallback={<div>Loading Account…</div>}>
            <AccountPage userDetails={userData} isLoading={isLoading} />
          </Suspense>
        </div>
        <div className="flex-1">
          <section
            className="bg-white  border dark:bg-gray-800 p-6 rounded-xl shadow-lg transition hover:shadow-blue-500/50"
            role="region"
            aria-labelledby="sub-bill-heading"
          >
            <h2 id="sub-bill-heading" className="text-xl font-semibold text-blue-500 dark:text-blue-300 mb-4">
              Subscription & Billing
            </h2>
            <SubscriptionCard userDetails={userData} onUpdateSubscription={handleUpdateSubscription} />
            <div className="mt-6">
              <BillingInfoForm onSaveBillingInfo={handleSaveBillingInfo} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export { SubscriptionCard, BillingInfoForm };
export default UserProfilePage;
