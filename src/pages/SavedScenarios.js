import React, { useEffect, useState, lazy, Suspense } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

const SavedComponent = lazy(() => import("../components/Saved"));
const HistoryComponent = lazy(() => import("../components/History"));

const tabLabels = {
  saved: "Saved Scenarios",
  history: "History",
};

const SavedScenariosTabs = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("saved");
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
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
    <div className="p-4 min-h-screen mx-auto">
      <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-300  mt-8 mb-8">
        Archive of Genius
      </h1>

      {/* Tabs Navigation */}
      <div
        role="tablist"
        aria-label="Saved and History Tabs"
        className="flex gap-4 justify-center sm:justify-start mb-6"
      >
        {Object.entries(tabLabels).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            aria-controls={`${key}-panel`}
            id={`${key}-tab`}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeTab === key
                ? "bg-blue-500 text-white border border-blue-700"
                : "bg-gray-300 text-gray-800 hover:bg-green-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition"
          role="status"
          aria-live="polite"
          title="Loading saved scenarios..."
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 border-8 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="w-12 h-12 border-8 border-green-500 border-t-transparent rounded-full animate-[spin_1s_linear_reverse_infinite]" />
          </div>
        </div>
      )}

      {/* Tabs Content */}
      {!isLoading && (
        <div className="relative transition-all">
          {activeTab === "saved" && (
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-40">
                  <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <div
                id="saved-panel"
                role="tabpanel"
                aria-labelledby="saved-tab"
                tabIndex={0}
              >
                <SavedComponent scenarios={filteredSavedScenarios} />
              </div>
            </Suspense>
          )}

          {activeTab === "history" && (
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-40">
                  <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <div
                id="history-panel"
                role="tabpanel"
                aria-labelledby="history-tab"
                tabIndex={0}
              >
                <HistoryComponent />
              </div>
            </Suspense>
          )}
        </div>
      )}

      {/* No Results Message */}
      {!isLoading && activeTab === "saved" && filteredSavedScenarios.length === 0 && (
        <div
          className="text-center text-gray-500 dark:text-gray-400 mt-8"
          role="status"
          aria-live="polite"
        >
          No saved scenarios found.
        </div>
      )}
    </div>
  );
};

export default SavedScenariosTabs;
