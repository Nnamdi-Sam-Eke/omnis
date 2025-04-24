import { createContext, useContext, useState, useEffect } from "react";
import { db } from "./firebase"; // ✅ Import Firestore
import { collection, addDoc, getDocs, query, orderBy, writeBatch } from "firebase/firestore";
import { useAuth } from "./AuthContext"; // ✅ Get user info from AuthContext

// ✅ Create Memory Context
const MemoryContext = createContext();

// 🔹 Memory Provider Component
export const MemoryProvider = ({ children }) => {
  const [memory, setMemory] = useState([]);
  const [localCache, setLocalCache] = useState([]); // 🔄 Cache for batching writes
  const { user } = useAuth(); // ✅ Get logged-in user

  useEffect(() => {
    if (user) {
      loadFirestoreMemory();
    }
  }, [user]);

  // 🔹 Load Memory from Firestore (Previous Queries & Responses)
  const loadFirestoreMemory = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "users", user.uid, "memory"),
        orderBy("timestamp", "desc") // ✅ Load latest memories first
      );
      const querySnapshot = await getDocs(q);
      const loadedMemory = querySnapshot.docs.map((doc) => doc.data());

      setMemory(loadedMemory);
      console.log("✅ Firestore Memory Loaded:", loadedMemory);
    } catch (error) {
      console.error("❌ Error loading Firestore memory:", error);
    }
  };

  // 🔹 Save to Firestore with Batching
  const saveToFirestore = async (query, response) => {
    if (!user) return;

    const entry = { query, response, timestamp: new Date().toISOString() };
    setLocalCache((prevCache) => [...prevCache, entry]);

    // 🔄 Write to Firestore in batches of 5
    if (localCache.length >= 5) {
      try {
        const batch = writeBatch(db);
        localCache.forEach((cachedEntry) => {
          const docRef = collection(db, "users", user.uid, "memory");
          batch.set(addDoc(docRef), cachedEntry);
        });

        await batch.commit();
        console.log("✅ Batch written to Firestore:", localCache);
        setLocalCache([]); // 🔄 Clear the cache after successful batch write
      } catch (error) {
        console.error("❌ Error writing batch to Firestore:", error);
      }
    }

    // ✅ Update local memory immediately
    setMemory((prev) => [...prev, entry]);
  };

  return (
    <MemoryContext.Provider value={{ memory, saveToFirestore }}>
      {children}
    </MemoryContext.Provider>
  );
};

// ✅ Custom Hook to Use Memory
export const useMemory = () => {
  return useContext(MemoryContext);
};
