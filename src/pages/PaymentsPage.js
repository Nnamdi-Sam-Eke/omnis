// src/pages/PaymentsPage.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import SkeletonLoader from "../components/SkeletonLoader";
import { Suspense } from "react";
import SubscriptionHistory from "../components/SubscriptionHistory";
import ReceiptGenerator from "../components/RecieptGenerator";
import SavedCardDetails from "../components/SavedCardDetails";
import BillingAndSubscriptionsTab from "./BillingAndSubscriptionsTab";

const PaymentsPage = () => {
  const { currentUser } = useAuth();

  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setUserDetails(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
      } else {
        setUserDetails(null);
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

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
      <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-10 mb-4">
        Manage Billing & Subscription
      </h1>

      <main className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left column: stacked vertically */}
            <section className="flex flex-col flex-1 space-y-8">
              <Suspense fallback={<SkeletonLoader height="h-[250px]" />}>
              <SubscriptionHistory setReceiptData={setReceiptData} />
              </Suspense>
              <Suspense fallback={<SkeletonLoader height="h-[250px]" />}>
              <ReceiptGenerator receiptData={receiptData} />
              </Suspense>
              <Suspense fallback={<SkeletonLoader height="h-[250px]" />}>
              <SavedCardDetails onSave={handleSaveBillingInfo} />
              </Suspense>
            </section>

            {/* Right column: UserProfilePage takes full height & width of right column */}
            <section
              className="flex-1 bg-white dark:bg-gray-800  border p-6 rounded-xl shadow-lg transition hover:shadow-blue-500/50"
              role="region"
              aria-labelledby="user-profile-heading"
            >
              <h2
                id="user-profile-heading"
                className="text-xl font-semibold text-green-500 dark:text-green-500 mb-4"
              >
                Billing And Subscriptions
              </h2>
              <Suspense fallback={<SkeletonLoader height="h-[250px]" />}>
              <BillingAndSubscriptionsTab />
              </Suspense>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentsPage;
