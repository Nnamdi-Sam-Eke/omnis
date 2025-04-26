import React, { useEffect, useState, lazy, Suspense } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

const HistoryComponent = lazy(() => import("../components/History"));
const SavedComponent = lazy(() => import("../components/Saved"));

const SavedScenariosPage = () => {
  const { currentUser } = useAuth();
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const simulateSpinnerDelay = () => {
    const start = Date.now();
    const spinnerDelay = 2000;
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

    const loadScenarios = async () => {
      await simulateSpinnerDelay();
      await fetchSavedScenarios();
      setIsLoading(false);
    };

    loadScenarios();
  }, [currentUser]);

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

      {/* Search Input with Tooltip */}
      <div className="mt-4 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Saved Scenarios"
          className="pl-10 pr-4 py-2 w-1/4 border rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search saved scenarios"
          title="Type to search for saved scenarios"  // Tooltip for the search input
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
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSearchQuery(s)}
                className="px-4 py-2 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-600"
                title={`Click to search for "${s}"`}  // Tooltip for each suggestion
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Full-screen Spinner with Tooltip */}
      {isLoading && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition"
          role="status"
          aria-live="polite"
          title="Loading saved scenarios..."  // Tooltip for the loading spinner
        >
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
            <Suspense fallback={<div>Loading Saved...</div>}>
              <SavedComponent scenarios={filteredSavedScenarios} />
            </Suspense>
          </div>
          <div className="w-full">
            <Suspense fallback={<div>Loading History...</div>}>
              <HistoryComponent />
            </Suspense>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {!isLoading && filteredSavedScenarios.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
          No saved scenarios found.
        </div>
      )}
    </div>
  );
};

export default SavedScenariosPage;
