import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";


// ✅ Fetch Account Settings
export const getAccountSettings = async (userId) => {
  if (!userId) return null;

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    return userSnap.exists() ? userSnap.data().settings || {} : {};
  } catch (error) {
    console.error("❌ Error fetching account settings:", error);
    return {};
  }
};

// ✅ Save Account Settings
export const saveAccountSettings = async (userId, settings) => {
  if (!userId) return;

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { settings });
    console.log("✅ Account settings updated successfully.");
  } catch (error) {
    console.error("❌ Error updating account settings:", error);
  }
};

// ✅ Fetch Social Links from Firestore
export const getSocialLinks = async (userId) => {
  if (!userId) return null;
  
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data().socials || {}; // Return social links or empty object
    } else {
      console.warn("No social links found for user.");
      return {};
    }
  } catch (error) {
    console.error("❌ Error fetching social links:", error);
    return {};
  }
};

// ✅ Save or Update Social Links
export const saveSocialLinks = async (userId, socials) => {
  if (!userId) return;
  
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { socials });
    console.log("✅ Social links updated successfully.");
  } catch (error) {
    console.error("❌ Error updating social links:", error);
  }
};
