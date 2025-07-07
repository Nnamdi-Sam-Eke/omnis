import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Clock, Activity, CheckCircle, AlertCircle, User, FileText, Settings } from "lucide-react";

const RecentActivityCard = () => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch recent activity logs from Firestore
  useEffect(() => {
    const activitiesRef = collection(db, "activityLog");
    const q = query(activitiesRef, orderBy("timestamp", "desc"), limit(5));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map((doc) => doc.data());
      setRecentActivities(activitiesData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get icon based on activity type
  const getActivityIcon = (activity) => {
    const action = activity.action?.toLowerCase() || '';
    if (action.includes('completed') || action.includes('finished')) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (action.includes('created') || action.includes('added')) {
      return <FileText className="w-4 h-4 text-blue-500" />;
    } else if (action.includes('updated') || action.includes('modified')) {
      return <Settings className="w-4 h-4 text-amber-500" />;
    } else if (action.includes('user') || action.includes('login')) {
      return <User className="w-4 h-4 text-purple-500" />;
    } else if (action.includes('error') || action.includes('failed')) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'Unknown time';
    
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-w-[300px] h-[290px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Recent Activity</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Latest updates and actions</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No recent activity</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Activity will appear here as you use the app
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 group"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  {getActivityIcon(activity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white leading-relaxed">
                    {activity.action || 'Unknown action'}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                  {activity.details && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                      {activity.details}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {recentActivities.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          <button className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivityCard;