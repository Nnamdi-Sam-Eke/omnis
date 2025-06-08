import React, { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#32325d",
      "::placeholder": {
        color: "#a0aec0",
      },
      fontFamily: "Arial, sans-serif",
      ":-webkit-autofill": {
        color: "#32325d",
      },
    },
    invalid: {
      color: "#e53e3e",
    },
  },
};

const BillingInfo = ({ onSaveBillingInfo }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [error, setError] = useState(null);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    if (!billingAddress) {
      setToast("Please fill in the billing address.");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    setSaving(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      setSaving(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    // Create payment method with Stripe
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        address: {
          line1: billingAddress,
        },
      },
    });

    if (stripeError) {
      setError(stripeError.message);
      setSaving(false);
      return;
    }

    try {
      // Pass paymentMethod.id and billingAddress to your backend or parent component
      await onSaveBillingInfo({
        paymentMethodId: paymentMethod.id,
        billingAddress,
      });
      setToast("Billing info saved successfully!");
    } catch {
      setToast("Failed to save billing info.");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(""), 3000);
    }
  };

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


  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-blue-300 dark:bg-blue-700 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      {error && (
        <div className="mb-4 text-red-600 font-semibold">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Payment Method
        </h4>

        <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Billing Address
        </h4>

        <input
          id="billingAddress"
          name="billingAddress"
          type="text"
          placeholder="123 Main St, City, State 12345"
          value={billingAddress}
          onChange={(e) => setBillingAddress(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {saving ? "Saving..." : "Save Billing Info"}
        </button>
      </div>
    </div>
  );
};

export default BillingInfo;
