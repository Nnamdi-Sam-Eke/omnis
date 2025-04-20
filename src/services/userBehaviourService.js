import { db } from "../firebase";  // ✅ CORRECT path
  // ✅ Make sure it's imported only once
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const saveUserInteraction = async (userId, action, details) => {
  try {
    console.log("📤 Saving user interaction:", { userId, action, details }); // Debug log
    const docRef = await addDoc(collection(db, "userInteractions"), {
      userId,
      action,
      details,
      timestamp: serverTimestamp(),
    });
    console.log("✅ User interaction saved with ID:", docRef.id);
  } catch (error) {
    console.error("❌ Error saving user interaction:", error);
  }
};
