import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import HistoryComponent from "../components/History";
import SavedComponent from "../components/Saved";

const SavedScenariosPage = () => {
  const { currentUser } = useAuth();
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to simulate spinner delay
  const simulateSpinnerDelay = () => {
    const start = Date.now();
    const spinnerDelay = 2000; // 2 seconds

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, spinnerDelay - (Date.now() - start));
    });
  };

  useEffect(() => {
    const fetchSavedScenarios = async () => {
      if (!currentUser?.uid) return;

      try {
        // Fetch saved scenarios
        const q = query(
          collection(db, "saved_scenarios"),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSavedScenarios(data);
      } catch (error) {
        console.error("❌ Error retrieving saved scenarios:", error);
      }
    };

    // Start fetching and simulate spinner delay
    const loadScenarios = async () => {
      await simulateSpinnerDelay(); // Wait for 2 seconds before loading
      await fetchSavedScenarios();  // Fetch data after spinner delay
      setIsLoading(false);           // Stop loading after the delay
    };

    loadScenarios();
  }, [currentUser]);

  // Filter and suggestions logic
  const filteredSavedScenarios = savedScenarios.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
    } else {
      const names = [...new Set(savedScenarios.map((i) => i.name))];
      setSuggestions(
        names.filter((name) =>
          name.toLowerCase().startsWith(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, savedScenarios]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mb-4">
        Archive of Genius...
      </h1>

      {/* Search Input */}
      <div className="mt-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Saved Scenarios"
          className="p-2 border rounded-md dark:bg-gray-700"
        />
        {suggestions.length > 0 && (
          <ul className="mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-md max-h-40 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => setSearchQuery(s)}
                className="px-4 py-2 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-600"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Full-screen Spinner */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 border-8 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="w-12 h-12 border-8 border-green-500 border-t-transparent rounded-full animate-[spin_1s_linear_reverse_infinite]" />
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && (
 <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
 <div className="w-full">
 <SavedComponent scenarios={filteredSavedScenarios}  />
 </div>
 <div className="w-full">
 <HistoryComponent />
 </div>
</div>
      )}

      {/* No Results Message */}
      {!isLoading && filteredSavedScenarios.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No saved scenarios found.
        </div>  
      )}
    </div>
  );
};

export default SavedScenariosPage;
