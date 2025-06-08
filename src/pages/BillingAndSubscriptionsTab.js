import React, { useState, Suspense, lazy } from "react";

// Lazy load the modular components for better performance
const BillingInfo = lazy(() => import("../components/BillingInfo"));
const SubscriptionInfo = lazy(() => import("../components/Subscription"));

const tabLabels = {
  billing: "Billing Info",
  subscriptions: "Subscriptions",
};

const BillingAndSubscriptionsTab = () => {
  const [activeTab, setActiveTab] = useState("billing");

  async function onSaveBillingInfo({ paymentMethodId, billingAddress }) {
  const response = await fetch("/api/save-payment-method", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "currentUserId", // get this from your auth/user context
      paymentMethodId,
      billingAddress,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save billing info");
  }

  const data = await response.json();
  return data;
}




  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Tabs Navigation */}
      <div
        role="tablist"
        aria-label="Billing and Subscription Tabs"
        className="flex gap-4 justify-center sm:justify-start mb-6"
      >
        {Object.entries(tabLabels).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            aria-controls={`${key}-panel`}
            id={`${key}-tab`}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeTab === key
                ? "bg-blue-500 text-white border border-blue-700"
                : "bg-gray-300 text-gray-800 hover:bg-green-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="relative h-full transition-all">
        {activeTab === "billing" && (
  <Suspense 
      fallback={
              <div className="flex justify-center items-center h-40">
                <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            }
>
    <div
      id="billing-panel"
      role="tabpanel"
      aria-labelledby="billing-tab"
      tabIndex={0}
    >
      <BillingInfo onSaveBillingInfo={onSaveBillingInfo} />
    </div>
  </Suspense>
)}


        {activeTab === "subscriptions" && (
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-40">
                <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <div
              id="subscriptions-panel"
              role="tabpanel"
              aria-labelledby="subscriptions-tab"
              tabIndex={0}
            >
              <SubscriptionInfo />
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default BillingAndSubscriptionsTab;
