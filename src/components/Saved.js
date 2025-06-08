import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

const SavedComponent = () => {
  const { currentUser } = useAuth();
  const [savedQueries, setSavedQueries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true); // start with loading true

  // Fetch saved queries from Firestore
  useEffect(() => {
    const fetchSavedQueries = async () => {
      if (currentUser?.uid) {
        try {
          const q = query(
            collection(db, "saved_queries"),
            where("userId", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSavedQueries(data);
        } catch (error) {
          console.error("❌ Error retrieving saved queries:", error);
        }
      }
    };

    fetchSavedQueries();
  }, [currentUser]);

  // Timer to switch off loading after 4 seconds (on mount)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);
  
  // Filter saved queries based on the search query
  const filteredSavedQueries = savedQueries.filter((item) =>
    item.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update suggestions based on the search query
  useEffect(() => {
    setSuggestions(
      searchQuery
        ? [...new Set(savedQueries.map((item) => item.query))] // unique queries
            .filter((query) =>
              query.toLowerCase().startsWith(searchQuery.toLowerCase())
            )
        : []
    );
  }, [searchQuery, savedQueries]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-6xl mx-auto mt-8 p-8 border bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-blue-500/50 rounded-lg">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-300 dark:bg-blue-700 rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-8 border bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-blue-500/50 rounded-lg">
      <h1 className="text-2xl font-bold text-center p-2 text-green-600 dark:text-green-300 mb-4">
        Saved Queries
      </h1>

      <div className="mt-4 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Saved Scenarios"
          className="pl-10 pr-4 py-2 w-full md:w-1/2 border rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search saved scenarios"
          title="Type to search for saved scenarios"
        />
        {suggestions.length > 0 && (
          <ul
            className="mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-md max-h-40 overflow-y-auto"
            role="listbox"
            aria-live="polite"
            title="Click a suggestion to autofill the search"
          >
            {suggestions.map((s, i) => (
              <li
                key={i}
                role="option"
                tabIndex={0}
                onClick={() => setSearchQuery(s)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && setSearchQuery(s)
                }
                className="px-4 py-2 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-600"
                title={`Click to search for "${s}"`}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Flex container for horizontal layout */}
      <div className="flex gap-8 mt-8">
  {/* Saved Queries Card */}
  <div className="flex-1 space-y-4">
    {savedQueries.length === 0 ? (
      <p className="text-center text-gray-500 dark:text-gray-400">
        No saved queries available.
      </p>
    ) : searchQuery && filteredSavedQueries.length === 0 ? (
      // Show no matches message only if searchQuery is not empty
      <p className="text-center text-gray-500 dark:text-gray-400">
        No matching queries found for "{searchQuery}".
      </p>
    ) : (
      filteredSavedQueries.map((item) => (
        <div
          key={item.id}
          className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow"
        >
          <p className="text-green-600 font-semibold">Query:</p>
          <p className="text-gray-900 dark:text-white">{item.query}</p>
          <p className="text-green-600 font-semibold mt-2">Response:</p>
          <p className="text-gray-900 dark:text-gray-300">
            {item.response || "No response recorded"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {item.timestamp?.seconds
              ? new Date(item.timestamp.seconds * 1000).toLocaleString()
              : "No timestamp available"}
          </p>
        </div>
      ))
    )}
  </div>
      </div>
    </div>
  );
};

export default SavedComponent;
