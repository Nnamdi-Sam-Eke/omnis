import { useEffect, useState, useRef } from "react";
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
import { Bell, Dot, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [latest, setLatest] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const prevNotifRef = useRef([]);
  const dropdownRef = useRef(null);
  const position = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

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
    const iconClass = "w-3 h-3 mr-2 flex-shrink-0";
    switch (type) {
      case "success": return <Dot className={`${iconClass} text-green-500`} />;
      case "alert": return <Dot className={`${iconClass} text-red-500`} />;
      case "feature": return <Dot className={`${iconClass} text-blue-500`} />;
      default: return <Dot className={`${iconClass} text-gray-400`} />;
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

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="fixed w-80 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 z-50"
      style={{ top: "100px", left: "calc(100% - 350px)" }}
    >
      <div
        className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-move"
        onMouseDown={handleMouseDown}
      >
        <h4 className="text-sm font-bold text-gray-600 dark:text-gray-300">
          Recent Notifications
        </h4>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(prev => !prev)}>
            <span className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-lg font-bold leading-none">
              {isMinimized ? "+" : "–"}
            </span>
          </button>
          <button onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="max-h-96 overflow-y-auto">
            {latest.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No new notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {latest.map((n) => (
                  <li
                    key={n.id}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out transform ${
                      !n.read && n.source !== "synthetic" ? "bg-blue-50 dark:bg-blue-900/20 scale-[1.02]" : ""
                    }`}
                    onClick={() => {
                      if (!n.read && n.source !== "synthetic") markAsRead(n.id);
                      setIsOpen(false);
                    }}
                  >
                    <Link to={n.url || "#"} className="flex items-start gap-2 w-full h-full no-underline">
                      {getNotificationIcon(n.type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-700 dark:text-gray-200 truncate">
                          {n.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                          {n.message}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(n.timestamp)}
                        </div>
                      </div>
                      {!n.read && n.source !== "synthetic" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {latest.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/notifications"
                className="w-full block text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
