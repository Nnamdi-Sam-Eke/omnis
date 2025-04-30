import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

const SavedComponent = () => {
  const { currentUser } = useAuth();
  const [savedQueries, setSavedQueries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Fetch saved queries from Firestore
  useEffect(() => {
    const fetchSavedQueries = async () => {
      if (currentUser?.uid) {
        try {
          const q = query(collection(db, "saved_queries"), where("userId", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setSavedQueries(data);
        } catch (error) {
          console.error("❌ Error retrieving saved queries:", error);
        }
      }
    };

    fetchSavedQueries();
  }, [currentUser]);

  // Filter saved queries based on the search query
  const filteredSavedQueries = savedQueries.filter((item) =>
    item.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update suggestions based on the search query
  useEffect(() => {
    setSuggestions(
      searchQuery
        ? [...new Set(savedQueries.map((item) => item.query))] // Remove duplicates
            .filter((query) => query.toLowerCase().startsWith(searchQuery.toLowerCase()))
        : []
    );
  }, [searchQuery, savedQueries]);

  return (
    <div className="max-w-6xl mx-auto mt-8 p-8 border bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-blue-500/50 rounded-lg">
      <h1 className="text-2xl font-bold text-center p-2 text-blue-600 dark:text-blue-300 mb-4">Saved Queries</h1>

      <input
        type="text"
        placeholder="Search saved queries..."
        className="w-full p-2 mb-4 border focus:ring-2 focus:ring-blue-500 rounded bg-white dark:bg-gray-700"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {/* Display search suggestions */}
      {suggestions.length > 0 && (
        <ul className="bg-gray-100 border rounded-lg max-h-32 overflow-y-auto mb-4">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => setSearchQuery(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {/* Flex container for horizontal layout */}
      <div className="flex gap-8 mt-8">
        {/* Saved Queries Card */}
        <div className="flex-1 space-y-4">
          {savedQueries.length === 0 ? (
            // Show message if no saved queries at all
            <p className="text-center text-gray-500 dark:text-gray-400">No saved queries available.</p>
          ) : filteredSavedQueries.length === 0 ? (
            // Show message if no queries match the search
            <p className="text-center text-gray-500 dark:text-gray-400">No matching queries found for "{searchQuery}".</p>
          ) : (
            // Display saved queries
            filteredSavedQueries.map((item) => (
              <div key={item.id} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow">
                <p className="text-green-600 font-semibold">Query:</p>
                <p className="text-gray-900 dark:text-white">{item.query}</p>
                <p className="text-green-600 font-semibold mt-2">Response:</p>
                <p className="text-gray-900 dark:text-gray-300">{item.response || "No response recorded"}</p>
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
