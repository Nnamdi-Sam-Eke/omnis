import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "../firebase";
import { FiUser, FiPlayCircle, FiLogIn, FiMessageCircle } from "react-icons/fi";

// Define icon map for activity types
const activityIcons = {
  simulation: <FiPlayCircle className="text-blue-500" />,
  login: <FiLogIn className="text-green-500" />,
  feedback: <FiMessageCircle className="text-yellow-500" />,
  default: <FiUser className="text-gray-500" />
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "activities"), orderBy("timestamp", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(logs);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-blue-500 dark:text-blue-300">Recent Activity</h2>
      <ul className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No recent activity.</p>
        ) : (
          activities.map((log) => (
            <li key={log.id} className="flex items-start gap-3">
              <div className="mt-1">
                {activityIcons[log.type || "default"]}
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-200">{log.action}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString() : "Unknown time"}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ActivityFeed;
