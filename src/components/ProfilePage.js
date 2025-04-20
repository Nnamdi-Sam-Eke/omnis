import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { FiBellOff, FiPlus, FiShield, FiLock, FiSettings } from "react-icons/fi";
import Dashboard from "../Dashboard";

const AccountPage = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        setIsOnline(docSnap.data().isOnline);
      } else {
        setUserData(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-6">


      {/* Main Wrapper with Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full max-w-6xl mx-auto">

        {/* Status & Account Settings Card */}
        <div className="bg-white h-96 border-2 dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-blue-500/50 transition">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img
                src={userData?.profilePic || "default-profile.png"}
                alt="Profile"
                className="w-14 h-14 rounded-full"
              />
              <div className="ml-4">
                <p className="text-gray-900 dark:text-white">{userData?.firstName || "User"}</p>
              </div>
            </div>

            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{isOnline ? "Online" : "Offline"}</span>
            </div>
          </div>

          <hr className="border-gray-300 dark:border-gray-600 my-4" />

          <h2 className="text-lg font-semibold text-center text-blue-500 flex items-center justify-center">
            <FiSettings className="mr-2" /> Account Settings
          </h2>
          <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
            <p className="flex items-center">
              <FiLock className="mr-2" />
              <span>Change Password</span>
            </p>
            <p className="flex items-center">
              <FiShield className="mr-2" />
              <span>Enable Two-Factor Authentication</span>
            </p>
            <p className="flex items-center">
              <FiPlus className="mr-2" />
              <span>Manage Linked Accounts</span>
            </p>
            <p className="flex items-center">
              <FiBellOff className="mr-2" />
              <span>Notification Preferences</span>
            </p>
          </div>
        </div>

        {/* Subscriptions & Billing Card */}
        <div className="bg-white border-2 h-96 dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-blue-500/50 transition">
          <h2 className="text-xl font-semibold text-center text-blue-500">Subscriptions & Billing</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mt-2">Manage your subscriptions and billing details.</p>
        </div>

        {/* Activity Log Card */}
        <div className="bg-white border-2 h-96 dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-blue-500/50 transition">
          <h2 className="text-xl font-semibold text-center text-blue-500">Activity Log</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mt-2">Your recent activities will be displayed here.</p>
          <button className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700 transition">Download Log</button>
        </div>

        {/* Social Links Card */}
        <div className="bg-white border-2  h-96 dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-blue-500/50 transition">
          <h2 className="text-xl font-semibold text-center text-blue-500">Social Links</h2>
          <div className="mt-4 space-y-4">
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Link Facebook</button>
            <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">Link LinkedIn</button>
            <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition">Link X (Twitter)</button>
          </div>
        </div>
      </div>

    </div>
  );
};


export default AccountPage;
