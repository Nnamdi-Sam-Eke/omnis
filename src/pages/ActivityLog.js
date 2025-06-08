import React, { useEffect, useState, lazy, Suspense } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

const ActivityLogRow = lazy(() => import("../components/ActivityLogRow")); // Each row is lazy-loaded

const ActivityLogPage = () => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
   const [loading, setLoading] = React.useState(true);
  
  
  
    // Timer to switch off loading after 4 seconds (on mount)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);
  
   

  useEffect(() => {
    if (currentUser?.uid) {
      fetchActivityData();
    }
  }, [currentUser]);

  const fetchActivityData = async () => {
    setIsLoading(true);
    try {
      // Fetch user data to get activities like 'lastLogin', 'profileUpdated', etc.
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Build activity log based on user data (fields like lastLogin, profileUpdated, etc.)
        const activityLogs = [];

        if (userData.lastLogin) {
          activityLogs.push({
            id: "lastLogin",
            activityType: "Last Login",
            description: `User last logged in on ${userData.lastLogin.toDate().toLocaleString()}`,
            timestamp: userData.lastLogin.toDate(),
          });
        }

        if (userData.profileUpdated) {
          activityLogs.push({
            id: "profileUpdated",
            activityType: "Profile Updated",
            description: `User updated their profile on ${userData.profileUpdated.toDate().toLocaleString()}`,
            timestamp: userData.profileUpdated.toDate(),
          });
        }

        setLogs(activityLogs);
      }
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
    setIsLoading(false);
  };

   // If subscriptions is undefined, show loading state
   if (loading) {
      return (
        <div className="animate-pulse  w-10/12 item-center justify-center mx-auto space-y-4">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      );
    }
  

  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-2xl font-semibold text-blue-500 dark:text-blue-300  mt-6 mb-8">
        Activity Log
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr className="bg-blue-100 dark:bg-gray-700">
              <th className="py-2 px-4 text-left text-gray-700 dark:text-gray-300 text-sm font-semibold">Activity</th>
              <th className="py-2 px-4 text-left text-gray-700 dark:text-gray-300 text-sm font-semibold">Description</th>
              <th className="py-2 px-4 text-left text-gray-700 dark:text-gray-300 text-sm font-semibold">Time</th>
            </tr>
          </thead>
          <tbody>
            <Suspense fallback={<tr><td colSpan={3} className="text-center py-8">Loading activity...</td></tr>}>
              {logs.map(log => (
                <ActivityLogRow key={log.id} log={log} />
              ))}
            </Suspense>
          </tbody>
        </table>
      </div>

      {isLoading && (
        <div className="text-center text-blue-500 py-4">Loading activity...</div>
      )}
    </div>
  );
};

export default ActivityLogPage;
