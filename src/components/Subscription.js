// File: components/SubscriptionInfo.jsx
import React, { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from "../AuthContext";

const SubscriptionInfo = ({ userDetails, discountActive }) => {
  const [loading, setLoading] = useState(true);
  const functions = getFunctions();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 🔁 Optional: Firebase Functions fallback checkout (if needed)
  const handleCheckout = async (priceId) => {
    const createSession = httpsCallable(functions, "createCheckoutSession");
    const { data } = await createSession({
      priceId,
      successUrl: window.location.href + "?subscribed=true",
      cancelUrl: window.location.href,
    });
    console.log("Checkout session created:", data);
  };

  // ✅ Main Stripe API-based upgrade handler
  const handleUpgrade = async (priceId) => {
    if (!user) return alert("User not logged in.");
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.uid, email: user.email, priceId })
    });

    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert("Failed to initiate upgrade session.");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-6 w-2/3 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Current Plan</h4>
          <p className="text-xl text-blue-600 dark:text-blue-400 font-bold">
            {userDetails?.subscription?.plan || "Free Plan"}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Next Payment</h4>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {userDetails?.subscription?.nextPaymentDate || "No payment scheduled"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Manage Your Subscription
        </h4>

        {discountActive && (
          <div className="mb-4 text-green-700 dark:text-green-300 font-medium">
            🎁 20% discount if you upgrade within 7 days!
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleUpgrade(userDetails?.subscription?.premiumPriceId || 'price_pro_123')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Upgrade to Pro
          </button>
          <button
            onClick={() => handleUpgrade(userDetails?.subscription?.basicPriceId || 'price_ent_123')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Upgrade to Enterprise
          </button>
          <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
            Cancel Subscription
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          Billing Information
        </h4>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
          Your subscription will automatically renew. You can cancel anytime before your next billing date.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionInfo;
