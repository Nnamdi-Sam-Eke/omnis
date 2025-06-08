import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { FiClock, FiCheckCircle } from "react-icons/fi";

const RecentActivityCard = () => {
  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch recent activity logs from Firestore
  useEffect(() => {
    const activitiesRef = collection(db, "activityLog"); // Assumes you have an "activityLog" collection
    const q = query(activitiesRef, orderBy("timestamp", "desc"), limit(5)); // Get the latest 5 activities

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map((doc) => doc.data());
      setRecentActivities(activitiesData); // Update the state with the latest activities
    });

    return () => unsubscribe(); // Cleanup the listener when the component is unmounted
  }, []);

  return (
    <div className="min-w-[250px]  border bg-white hover:shadow-blue-500/50 transition px-6 py-3 dark:bg-gray-800 p-6 rounded-2xl shadow-md">
      <h3 className="text-xl font-semibold  text-green-500 dark:text-green-500">Recent Activity</h3>
      <div className="space-y-2">
        {recentActivities.length === 0 ? (
          <p className="justify-center p-2 text-gray-400">No recent activity.</p>
        ) : (
          recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-2">
              <FiClock className="text-gray-500" />
              <div>
                <p className="text-sm">{activity.action}</p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp.seconds * 1000).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivityCard;
