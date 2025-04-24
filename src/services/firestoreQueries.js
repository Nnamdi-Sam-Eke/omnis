import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, where } from "firebase/firestore";

// ✅ Save Query to History
export const saveQueryToHistory = async (userId, query, response) => {
  try {
    await addDoc(collection(db, "history"), {
      userId,
      query,
      response,
      timestamp: serverTimestamp(),
    });
    console.log("✅ Query saved to history");
  } catch (error) {
    console.error("❌ Error saving query to history:", error);
  }
};

// ✅ Retrieve History (Only for Current User)
export const getHistory = async (userId) => {
  try {
    if (!userId) return [];
    const q = query(collection(db, "history"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Error retrieving history:", error);
    return [];
  }
};

// ✅ Save Query to Favorites
export const saveQueryToFavorites = async (userId, query, response) => {
  try {
    await addDoc(collection(db, "saved_queries"), {
      userId,
      query,
      response,
      timestamp: serverTimestamp(),
    });
    console.log("✅ Query saved to favorites");
  } catch (error) {
    console.error("❌ Error saving query to favorites:", error);
  }
};

// ✅ Retrieve Saved Queries (Only for Current User)
export const getSavedQueries = async (userId) => {
  try {
    if (!userId) return [];
    const q = query(collection(db, "saved_queries"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Error retrieving saved queries:", error);
    return [];
  }
};

// ✅ Delete Query from History
export const deleteHistoryQuery = async (queryId) => {
  try {
    await deleteDoc(doc(db, "history", queryId));
    console.log("✅ Query deleted from history");
  } catch (error) {
    console.error("❌ Error deleting history query:", error);
  }
};

// ✅ Remove Query from Favorites
export const removeSavedQuery = async (queryId) => {
  try {
    await deleteDoc(doc(db, "saved_queries", queryId));
    console.log("✅ Query removed from favorites");
  } catch (error) {
    console.error("❌ Error removing saved query:", error);
  }
};
