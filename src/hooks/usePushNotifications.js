// File: src/hooks/usePushNotifications.js
import { useEffect, useState } from "react";
import { messaging, getToken } from "../firebase"; // your initialized firebase exports
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext"; // assumes you expose user in context

const VAPID_KEY = "BFveQiuE4CB3JCME_cu9PwiMXC5u182pdWhj-565aflrWt-RyA2ByEKpITKRr6dEehynw5iOHsD8TRBku-Lt-Wk"; // Replace with your Firebase project's VAPID key

export const usePushNotifications = () => {
  const { currentUser } = useAuth(); // assumes currentUser.uid exists
  const [permission, setPermission] = useState(Notification.permission);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const register = async () => {
      if (!messaging || !currentUser) return;

      try {
        const status = await Notification.requestPermission();
        setPermission(status);

        if (status !== "granted") {
          throw new Error("Notification permission denied");
        }

        const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });

        if (fcmToken) {
          setToken(fcmToken);

          // Save token under user doc in Firestore
          const userRef = doc(db, "users", currentUser.uid);
          await setDoc(userRef, { fcmToken }, { merge: true });
        }
      } catch (err) {
        console.error("Notification setup failed:", err);
        setError(err.message || "Unknown error");
      }
    };

    register();
  }, [currentUser]);

  return { permission, token, error };
};
