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
} from "firebase/firestore";
import { db } from "../firebase";
import moment from "moment";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch initial notifications and listen for real-time updates
  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(10));

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

  // Load more notifications (pagination)
  const loadMoreNotifications = async () => {
    if (!lastVisible) return;

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
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((notif) => !notif.read);
      for (const notif of unreadNotifications) {
        const notificationRef = doc(db, "notifications", notif.id);
        await updateDoc(notificationRef, { read: true });
      }
      console.log("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error.message);
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      console.log("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error.message);
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading notifications...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl text-blue-600 font-bold mb-4">Notifications</h1>

      {/* Mark All as Read button */}
      {notifications.some((notif) => !notif.read) && (
        <button
          onClick={markAllAsRead}
          className="mb-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Mark All as Read
        </button>
      )}

      {notifications.length === 0 ? (
        <p className="text-gray-600">No notifications found.</p>
      ) : (
        <div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg shadow-md mb-3 ${
                notification.read ? "bg-gray-50" : "bg-white border-blue-500"
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

                <div>
                  <button
                    className="text-red-600 hover:text-red-800 ml-4"
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
              className="mt-4 p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Load More Notifications
            </button>
          )}
        </div>
      )}
    </div>
  );
}
