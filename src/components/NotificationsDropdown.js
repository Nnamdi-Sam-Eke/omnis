import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { generateUserNotifications } from "../components/GenerateUserNotification";
import moment from "moment";
import { Bell, Dot, X, Minus, Plus, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [latest, setLatest] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const prevNotifRef = useRef([]);
  const dropdownRef = useRef(null);
  const dragging = useRef(false);
  const position = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const firestoreNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      const syntheticNotifications = generateUserNotifications(userData, [])
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 2);

      const combined = [...firestoreNotifications, ...syntheticNotifications];
      const deduped = Array.from(new Map(combined.map(n => [n.id, n])).values())
        .sort((a, b) => {
          const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : a.timestamp;
          const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : b.timestamp;
          return bTime - aTime;
        })
        .slice(0, 5);

      const newNotifExists = deduped.some(
        (n) => !prevNotifRef.current.find((p) => p.id === n.id)
      );
      if (newNotifExists) setIsOpen(true);

      prevNotifRef.current = deduped;
      setLatest(deduped);

      const unreadFirestore = firestoreNotifications.filter(n => !n.read).length;
      setUnreadCount(unreadFirestore);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const markAsRead = async (id) => {
    try {
      const notifRef = doc(db, "notifications", id);
      await updateDoc(notifRef, { read: true });
      setLatest((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-3 h-3 mr-3 flex-shrink-0";
    switch (type) {
      case "success": return <Dot className={`${iconClass} text-emerald-500`} />;
      case "alert": return <Dot className={`${iconClass} text-rose-500`} />;
      case "feature": return <Dot className={`${iconClass} text-violet-500`} />;
      default: return <Dot className={`${iconClass} text-slate-400`} />;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : timestamp;
    return moment(date).fromNow();
  };

  const handleMouseDown = (e) => {
    dragging.current = true;
    const rect = dropdownRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    position.current = {
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y
    };
    dropdownRef.current.style.left = `${position.current.x}px`;
    dropdownRef.current.style.top = `${position.current.y}px`;
  };

  const handleMouseUp = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleViewAllClick = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.95 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1],
            scale: { duration: 0.3 }
          }}
          className="fixed top-[100px] right-4 sm:right-10 w-[90vw] max-w-sm sm:max-w-md z-50"
        >
          {/* Glassmorphism container */}
          <div className="relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />
            
            {/* Header */}
            <div
              className="relative p-5 border-b border-white/10 dark:border-gray-700/50 flex items-center justify-between cursor-move group"
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-sm font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Recent Notifications
                </h4>
                {unreadCount > 0 && (
                  <div className="px-2 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center shadow-lg">
                    {unreadCount}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMinimized(prev => !prev)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {isMinimized ? 
                    <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : 
                    <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  }
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="max-h-[60vh] overflow-y-auto">
                    {latest.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No new notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/10 dark:divide-gray-700/50">
                        {latest.map((n, index) => (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group relative overflow-hidden ${
                              !n.read && n.source !== "synthetic"
                                ? "bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10"
                                : ""
                            }`}
                          >
                            <div
                              className="p-4 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-300 cursor-pointer"
                              onClick={() => {
                                if (!n.read && n.source !== "synthetic") markAsRead(n.id);
                                setIsOpen(false);
                              }}
                            >
                              <Link to={n.url || "#"} className="flex items-start gap-3 w-full h-full no-underline">
                                {getNotificationIcon(n.type)}
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate mb-1">
                                    {n.title}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2 leading-relaxed">
                                    {n.message}
                                  </div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                    {formatTimestamp(n.timestamp)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {!n.read && n.source !== "synthetic" && (
                                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm animate-pulse"></div>
                                  )}
                                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100" />
                                </div>
                              </Link>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {latest.length > 0 && (
                    <div className="p-4 border-t border-white/10 dark:border-gray-700/50">
                      <Link
                        to="/notifications"
                        onClick={handleViewAllClick}
                        className="w-full block text-center py-3 px-4 text-sm font-semibold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                      >
                        View All Notifications
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}