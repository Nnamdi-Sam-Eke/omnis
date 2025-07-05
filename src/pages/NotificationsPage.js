import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  limit,
  startAfter,
  getDocs,
  writeBatch,
  where,
  getDoc
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
import { generateUserNotifications } from "../components/GenerateUserNotification";
import { Bell, Info, Zap, CheckCircle, Inbox } from "lucide-react";
import { Link } from "react-router-dom"; // or use next/link if using Next.js

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const { user } = useAuth();
  const topRef = useRef();

  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(10)
        );

        const [snapshot, userDoc, sessionSnap] = await Promise.all([
          getDocs(q),
          getDoc(doc(db, "users", user.uid)),
          getDocs(query(collection(db, "sessions"), where("userId", "==", user.uid)))
        ]);

        const firestoreNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        }));

        const userData = userDoc.exists() ? userDoc.data() : null;
        const sessionDocs = sessionSnap.docs;

        const syntheticNotifications = generateUserNotifications(userData, sessionDocs).map(notif => ({
          ...notif,
          read: true // Mark all synthetic notifications as read by default
        }));
        const combined = [...firestoreNotifications, ...syntheticNotifications];
        const deduped = Array.from(new Map(combined.map(n => [n.id, n])).values());

        setNotifications(deduped.sort((a, b) => b.timestamp - a.timestamp));
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === 10);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch notifications or user data:", error);
        toast.error("Failed to load notifications.");
      }
    };

    fetchData();
  }, [user?.uid]);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [notifications]);

  useEffect(() => {
    if (notifications.length === 0) return;

    const timeout = setTimeout(() => {
      markAllAsRead();
    }, 5000); // ⏱ Auto-mark as read after 5s

    return () => clearTimeout(timeout);
  }, [notifications]);

  const loadMoreNotifications = async () => {
    if (!lastVisible || !user?.uid) return;
    setLoadingMore(true);
    try {
      const nextQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(10)
      );
      const snapshot = await getDocs(nextQuery);
      const newNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));

      setNotifications((prev) => [...prev, ...newNotifications]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error(error);
      toast.error("Error loading more notifications");
    } finally {
      setLoadingMore(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "info": return <Info className="text-blue-500 dark:text-blue-400 w-5 h-5" />;
      case "alert": return <Bell className="text-red-500 dark:text-red-400 w-5 h-5" />;
      case "feature": return <Zap className="text-green-500 dark:text-green-400 w-5 h-5" />;
      case "success": return <CheckCircle className="text-emerald-500 dark:text-emerald-400 w-5 h-5" />;
      default: return <Bell className="text-gray-400 dark:text-gray-500 w-5 h-5" />;
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        (notif) => !notif.read && notif.source !== "synthetic"
      );
      
      if (unreadNotifications.length > 0) {
        const batch = writeBatch(db);
        unreadNotifications.forEach((notif) => {
          const notificationRef = doc(db, "notifications", notif.id);
          batch.update(notificationRef, { read: true });
        });
        await batch.commit();
        toast.success("All notifications marked as read.");
      }
      
      // Update all notifications in local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error.message);
      toast.error("Error marking all as read.");
    }
  };

  const filtered = notifications
    .filter((n) => filterType === "all" || n.type === filterType)
    .filter((n) =>
      readFilter === "unread" ? !n.read : readFilter === "read" ? n.read : true
    );

  const grouped = filtered.reduce((acc, notif) => {
    const date = moment(notif.timestamp).startOf("day");
    const label = moment().diff(date, "days") === 0
      ? "Today"
      : moment().diff(date, "days") === 1
      ? "Yesterday"
      : date.format("MMMM D, YYYY");
    acc[label] = acc[label] || [];
    acc[label].push(notif);
    return acc;
  }, {});

  return (
    <div className="p-4 min-h-screen w-full h-full bg-white dark:bg-black text-black dark:text-white">
      <Toaster position="top-right" reverseOrder={false} />
      <div ref={topRef} />

      <h1 className="text-2xl text-blue-600 dark:text-blue-300 font-bold mb-4">
        Notifications
      </h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "info", "alert", "feature", "success"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filterType === type
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}

        {["unread", "read"].map((status) => (
          <button
            key={status}
            onClick={() => setReadFilter(status)}
            className={`px-3 py-1 rounded-full text-sm border ${
              readFilter === status
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {Object.entries(grouped).map(([dateLabel, notifs]) => (
        <div key={dateLabel} className="mb-6">
          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 my-2">
            {dateLabel}
          </h3>
          {notifs.map((notification) => (
            <Link to={notification.url || "#"} key={notification.id}>
              <div
                className={`p-4 border rounded-lg shadow-md mb-3 flex items-start gap-2 transition-all duration-300 ease-in-out transform ${
                  notification.read 
                    ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75" 
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-500 dark:border-blue-300 scale-[1.02] animate-pulse shadow-lg shadow-blue-500/20"
                }`}
              >
                {getIcon(notification.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className={`font-semibold ${
                      notification.read 
                        ? "text-gray-600 dark:text-gray-400" 
                        : "text-gray-900 dark:text-white font-bold"
                    }`}>
                      {notification.title}
                    </h2>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <p className={`text-sm ${
                    notification.read 
                      ? "text-gray-500 dark:text-gray-500" 
                      : "text-gray-700 dark:text-gray-200"
                  }`}>
                    {notification.message}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-sm ${
                      notification.read 
                        ? "text-gray-400 dark:text-gray-600" 
                        : "text-blue-600 dark:text-blue-400 font-medium"
                    }`}>
                      {notification.timestamp
                        ? moment(notification.timestamp).fromNow()
                        : "Just now"}
                    </span>
                    {!notification.read && (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ))}

      {hasMore && (
        <button
          onClick={loadMoreNotifications}
          disabled={loadingMore}
          className="mt-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
        >
          {loadingMore ? "Loading..." : "Load More Notifications"}
        </button>
      )}
    </div>
  );
}
// This code defines a NotificationsPage component that fetches and displays user notifications from Firebase Firestore.
// It includes features like filtering by type and read status, and automatically marks notifications as read after 5 seconds.