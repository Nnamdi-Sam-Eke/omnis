import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  limit,
  startAfter,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch initial notifications and listen for real-time updates
  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(fetchedNotifications);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setLoading(false);
      setHasMore(snapshot.docs.length === 10);
    });

    return () => unsubscribe();
  }, []);

  const showError = (message) => toast.error(message);
  const showSuccess = (message) => toast.success(message);

  // Load more notifications (pagination)
  const loadMoreNotifications = async () => {
    if (!lastVisible) return;

    setLoadingMore(true);

    try {
      const nextQuery = query(
        collection(db, "notifications"),
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(10)
      );

      const snapshot = await getDocs(nextQuery);
      const newNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications((prev) => [...prev, ...newNotifications]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error(error);
      showError("Error loading more notifications");
    } finally {
      setLoadingMore(false);
    }
  };

  // Mark all notifications as read (batch)
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((notif) => !notif.read);
      if (unreadNotifications.length === 0) {
        toast("All notifications are already read.", { icon: "ℹ️" });
        return;
      }

      const batch = writeBatch(db);

      unreadNotifications.forEach((notif) => {
        const notificationRef = doc(db, "notifications", notif.id);
        batch.update(notificationRef, { read: true });
      });

      await batch.commit();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      showSuccess("All notifications marked as read.");
    } catch (error) {
      console.error("Error marking all as read:", error.message);
      showError("Error marking all as read.");
    }
  };

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      const notificationRef = doc(db, "notifications", id);
      await updateDoc(notificationRef, { read: true });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      showSuccess("Notification marked as read.");
    } catch (error) {
      console.error("Error marking as read:", error.message);
      showError("Error marking notification as read.");
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      showSuccess("Notification deleted.");
    } catch (error) {
      console.error("Error deleting notification:", error.message);
      showError("Error deleting notification.");
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading notifications...</p>;
  }

  return (
    <div className="p-4">
      <Toaster position="top-right" reverseOrder={false} />

      <h1 className="text-2xl text-blue-600 dark:text-blue-300 font-bold mb-4">Notifications</h1>

      {/* Mark All as Read button */}
      {notifications.some((notif) => !notif.read) && (
        <button
          onClick={markAllAsRead}
          aria-label="Mark all notifications as read"
          className="mb-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Mark All as Read
        </button>
      )}

      {notifications.length === 0 ? (
        <div className="dark:text-gray-100 flex flex-col items-center">
          <p>No notifications found.</p>
          <p className="mt-2 text-sm italic">You’ll see updates here soon 🚀</p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg shadow-md mb-3 ${
                notification.read
                  ? "bg-gray-50"
                  : "bg-white border-blue-500"
              }`}
            >
              <h2 className="font-semibold">{notification.title}</h2>
              <p className="text-sm">{notification.message}</p>

              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {notification.timestamp
                    ? moment(notification.timestamp.toDate()).fromNow()
                    : "Just now"}
                </span>

                <div className="flex items-center space-x-4">
                  {!notification.read && (
                    <button
                      className="text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                      aria-label="Mark notification as read"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="Delete notification"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Load More button for pagination */}
          {hasMore && (
            <button
              onClick={loadMoreNotifications}
              disabled={loadingMore}
              className={`mt-4 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                loadingMore ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="Load more notifications"
            >
              {loadingMore ? "Loading..." : "Load More Notifications"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
