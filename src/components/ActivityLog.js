import React, { useEffect, useState, lazy, Suspense } from "react";
import { collection, query, where, orderBy, limit, getDocs, startAfter } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

const ActivityLogRow = lazy(() => import("../components/ActivityLogRow")); // Each row is lazy

const PAGE_SIZE = 10;

const ActivityLogPage = () => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchLogs();
    }
  }, [currentUser]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "activity_log"),
        where("userId", "==", currentUser.uid),
        orderBy("timestamp", "desc"),
        ...(lastVisible ? [startAfter(lastVisible)] : []),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);

      const newLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(prev => [...prev, ...newLogs]);

      if (snapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mb-4">
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
        <div className="text-center text-blue-500 py-4">Loading more...</div>
      )}

      {!isLoading && hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={fetchLogs}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
          >
            Load More
          </button>
        </div>
      )}

      {!hasMore && (
        <div className="text-center text-gray-400 py-6">No more activity logs.</div>
      )}
    </div>
  );
};

export default ActivityLogPage;
