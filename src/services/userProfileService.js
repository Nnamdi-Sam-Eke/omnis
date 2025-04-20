import { db, doc, setDoc, getDoc, updateDoc } from "../firebase";

// 🔹 Save user profile details to Firestore
export const saveUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, "users", userId), profileData, { merge: true });
    console.log("✅ User profile saved successfully!");
  } catch (error) {
    console.error("❌ Error saving user profile:", error.message);
  }
};

// 🔹 Get user profile from Firestore
export const getUserProfile = async (userId) => {
  const userRef = doc(db, "userProfiles", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    throw new Error("User profile not found");
  }
};