// src/pages/PaymentsPage.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

import {
  SubscriptionCard,
  BillingInfoForm,
} from "../components/SubscriptionAndBilling";
import SubscriptionHistory from "../components/SubscriptionHistory";
import SavedCardDetails from "../components/SavedCardDetails";
import ReceiptGenerator from "../components/RecieptGenerator";

const PaymentsPage = () => {
  const { currentUser } = useAuth();

  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Listen for real-time updates to user document
  useEffect(() => {
    if (!currentUser) {
      setUserDetails(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsub = onSnapshot(
      doc(db, "users", currentUser.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          setUserDetails(null);
        }
        setIsLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser]);
 const [receiptData, setReceiptData] = useState(null);

  // Save billing info handler
  const handleSaveBillingInfo = async (info) => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      "billing.cardNumber": info.cardNumber,
      "billing.billingAddress": info.billingAddress,
    });
  };

  // Update subscription handler (if you want to add in future)
  const handleUpdateSubscription = async (plan) => {
    if (!currentUser) return;

    const ref = doc(db, "users", currentUser.uid);
    await updateDoc(ref, {
      "subscription.plan": plan,
      "subscription.nextPaymentDate": new Date().toLocaleDateString(),
    });
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mb-4">
        Payment and Subscription...
      </h1> 


    <main className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Two-column layout like Contact page */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left column: Subscription History + Receipt Generator */}
          <section className="flex-1 space-y-8">
            <SubscriptionHistory setReceiptData={setReceiptData} />
            <ReceiptGenerator receiptData={receiptData} />
          </section>

          {/* Right column: Subscription Card + Billing Form + Saved Card Details */}
          <section className="bg-white flex-1 space-y-4 border dark:bg-gray-800 p-6 rounded-xl shadow-lg transition hover:shadow-blue-500/50"
            role="region"
            aria-labelledby="sub-bill-heading">
              <h2 id="sub-bill-heading" className="text-xl font-semibold text-green-500 dark:text-green-500 mb-4">
              Subscription & Billing Info
            </h2>
            <SubscriptionCard />
            <BillingInfoForm />
          </section>
        </div>
        <div className="flex-1">
            <SavedCardDetails />
        </div>
        {/* You can add more stacked sections below if needed */}
      </div>
    </main>
    </div>
  );
};

export default PaymentsPage;
