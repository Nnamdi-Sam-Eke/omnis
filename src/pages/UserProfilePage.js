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

  // Modern loading skeleton component
  const LoadingSkeleton = ({ title }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg w-3/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header with glassmorphism effect */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Personal Settings & Preferences
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your profile and account settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Profile Information
              </h2>
            </div>
            
            <div className="transform hover:scale-[1.02] transition-all duration-300">
              <Suspense fallback={<LoadingSkeleton title="Profile" />}>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <ProfilePage userDetails={userData} isLoading={isLoading} />
                </div>
              </Suspense>
            </div>
          </div>

          {/* Account Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Account Settings
              </h2>
            </div>
            
            <div className="transform hover:scale-[1.02] transition-all duration-300">
              <Suspense fallback={<LoadingSkeleton title="Account" />}>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <AccountPage userDetails={userData} isLoading={isLoading} />
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default UserProfilePage;