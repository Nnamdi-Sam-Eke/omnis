// firebase-messaging.js
import { messaging } from "./firebase-config"; // Adjust path if needed
import { getToken } from "firebase-messaging";

async function requestPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");

      // Get FCM Token
      const token = await getToken(messaging, {
        vapidKey: "YOUR_PUBLIC_VAPID_KEY", // Replace with your actual VAPID key
      });
      console.log("FCM Token:", token);
    } else {
      console.log("Notification permission denied.");
    }
  } catch (error) {
    console.error("Error getting permission or token", error);
  }
}

export default requestPermission;
