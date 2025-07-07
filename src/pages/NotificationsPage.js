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
import { Bell, Info, Zap, CheckCircle, Inbox, MoreVertical, Filter, Trash2, Settings, Search, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
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
    const iconProps = "w-5 h-5";
    switch (type) {
      case "info": return <Info className={`text-blue-500 ${iconProps}`} />;
      case "alert": return <Bell className={`text-red-500 ${iconProps}`} />;
      case "feature": return <Zap className={`text-emerald-500 ${iconProps}`} />;
      case "success": return <CheckCircle className={`text-green-500 ${iconProps}`} />;
      default: return <Bell className={`text-gray-400 ${iconProps}`} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "info": return "bg-blue-50 border-blue-200 text-blue-800";
      case "alert": return "bg-red-50 border-red-200 text-red-800";
      case "feature": return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "success": return "bg-green-50 border-green-200 text-green-800";
      default: return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
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

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filtered = notifications
    .filter((n) => filterType === "all" || n.type === filterType)
    .filter((n) => readFilter === "unread" ? !n.read : readFilter === "read" ? n.read : true)
    .filter((n) => searchQuery === "" || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (timestamp) => {
    return moment(timestamp).fromNow();
  };

  const groupedNotifications = filtered.reduce((acc, notif) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Toaster position="top-right" reverseOrder={false} />
      <div ref={topRef} />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className={`mb-6 space-y-4 transition-all duration-300 ${showFilters ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 py-2">Type:</span>
            {["all", "info", "alert", "feature", "success"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  filterType === type
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 py-2">Status:</span>
            {["all", "unread", "read"].map((status) => (
              <button
                key={status}
                onClick={() => setReadFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  readFilter === status
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        {Object.keys(groupedNotifications).length === 0 ? (
          <div className="text-center py-12">
            <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? "Try adjusting your search or filters" : "You're all caught up!"}
            </p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([dateLabel, notifs]) => (
            <div key={dateLabel} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {dateLabel}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {notifs.length} {notifs.length === 1 ? 'notification' : 'notifications'}
                </span>
              </div>
              
              <div className="space-y-3">
                {notifs.map((notification) => (
                  <Link to={notification.url || "#"} key={notification.id}>
                    <div
                      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg ${
                        notification.read
                          ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          : "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-700 shadow-md hover:shadow-lg"
                      }`}
                    >
                      {!notification.read && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                      )}
                      
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                            {getIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold text-gray-900 dark:text-white ${
                                !notification.read ? 'font-bold' : ''
                              }`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {formatTime(notification.timestamp)}
                              </span>
                              
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {!notification.read && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      markAsRead(notification.id);
                                    }}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                    title="Mark as read"
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    deleteNotification(notification.id);
                                  }}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMoreNotifications}
              disabled={loadingMore}
              className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load More Notifications"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}