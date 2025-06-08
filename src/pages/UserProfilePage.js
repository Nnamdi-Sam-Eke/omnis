// src/components/UserProfilePage.js
import React, { useState, useEffect, lazy, Suspense } from "react";
// import { useStripe } from "@stripe/react-stripe-js";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { onSnapshot } from "firebase/firestore";
import ProfilePage from "../components/SimpleProfilePage";
import AccountPage from "../components/AccountPage";

   

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

 

 return (
  <div className="p-4 space-y-6 min-h-screen">
    <h1 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mt-10 mb-4">
      Personal Settings & Preferences
    </h1>
    
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-1/2">
        <Suspense fallback={<div>Loading Profile…</div>}>
          <ProfilePage userDetails={userData} isLoading={isLoading} />
        </Suspense>
      </div>
      <div className="w-full lg:w-1/2 mr-8">
        <Suspense fallback={<div>Loading Account…</div>}>
          <AccountPage userDetails={userData} isLoading={isLoading} />
        </Suspense>
      </div>
    </div>
  </div>
);

};


export default UserProfilePage;
