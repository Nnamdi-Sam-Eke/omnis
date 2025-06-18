import { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  startAfter,
  limit,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { debounce } from "lodash";

const PAGE_SIZE = 5;

const History = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInteractions, setUserInteractions] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Debounce input
  const debounceInput = useMemo(
    () => debounce((value) => setDebouncedSearch(value), 300),
    []
  );

  useEffect(() => {
    return () => debounceInput.cancel();
  }, [debounceInput]);

  useEffect(() => {
    debounceInput(searchQuery);
  }, [searchQuery, debounceInput]);

  useEffect(() => {
    if (user) {
      loadChatHistory();
      loadUserInteractions(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const loadChatHistory = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "userInteractions"),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      setChatHistory(snapshot.docs.map((doc) => doc.data()));
    } catch (error) {
      console.error("❌ Error loading chat history:", error);
    }
  };

  const loadUserInteractions = async (loadMore = false) => {
    try {
      setLoadingMore(loadMore);
      const userInteractionsRef = collection(db, "userInteractions");

      const q = query(
        userInteractionsRef,
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        ...(loadMore && lastVisible ? [startAfter(lastVisible)] : []),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const interactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUserInteractions((prev) =>
        loadMore ? [...prev, ...interactions] : interactions
      );

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setLoadingMore(false);
    } catch (error) {
      console.error("❌ Error fetching user interactions:", error);
      setLoadingMore(false);
    }
  };

  const { history: activeHistory, fallback: isFallback } = useMemo(() => {
    if (userInteractions.length > 0) return { history: userInteractions, fallback: false };
    if (chatHistory.length > 0) return { history: chatHistory, fallback: true };
    return { history: [], fallback: false };
  }, [userInteractions, chatHistory]);

  const filteredInteractions = useMemo(() => {
    return debouncedSearch
      ? activeHistory.filter((interaction) =>
          interaction.details?.scenarios?.some((scenario) =>
            scenario.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        )
      : activeHistory;
  }, [debouncedSearch, activeHistory]);

  const suggestions = useMemo(() => {
    return debouncedSearch
      ? activeHistory.flatMap((interaction) =>
          interaction.details?.scenarios?.filter((scenario) =>
            scenario.toLowerCase().startsWith(debouncedSearch.toLowerCase())
          ) || []
        )
      : [];
  }, [debouncedSearch, activeHistory]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-6xl mx-auto mt-8 p-8 border bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-300 dark:bg-blue-700 rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl overflow-y-auto max-h-[500px] mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border">
      <h1 className="text-2xl font-bold text-center text-green-600 dark:text-green-300 mb-4">
        Interaction History
      </h1>

      {isFallback && (
        <p className="text-sm text-yellow-600 dark:text-yellow-300 mb-4 text-center">
          ⚠️ Showing unsynced local history. Log in to sync with your account.
        </p>
      )}

      <input
        type="text"
        placeholder="Search past queries..."
        className="w-full p-2 mb-4 border text-black dark:text-white focus:ring-2 focus:ring-blue-500 rounded bg-white dark:bg-gray-700"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {suggestions.length > 0 && (
        <ul className="bg-gray-100 border rounded-lg max-h-32 text-black dark:text-white overflow-y-auto mb-4">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => setSearchQuery(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {filteredInteractions.length > 0 ? (
        <div className="mt-4 space-y-4">
          {filteredInteractions.map((interaction) => (
            <div key={interaction.id} className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
              <p className="font-semibold text-blue-600 dark:text-blue-300">
                {interaction.action}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {interaction.details?.scenarios?.join(", ")}
              </p>
              <p className="text-xs text-gray-500">
                {interaction.timestamp?.toDate?.().toLocaleString() ?? "Recent"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 mt-6">No interactions found.</p>
      )}

      {hasMore && !loadingMore && (
        <div className="text-center mt-4">
          <button
            onClick={() => loadUserInteractions(true)}
            className="px-4 py-2 bg-green-600 hover:bg-blue-700 text-white rounded"
          >
            Load More
          </button>
        </div>
      )}

      {loadingMore && (
        <p className="text-center text-gray-500 mt-2">Loading more...</p>
      )}
    </div>
  );
};

export default History;
