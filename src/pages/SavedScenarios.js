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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Archive of Genius
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-10">
          <div
            role="tablist"
            aria-label="Saved and History Tabs"
            className="inline-flex bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20 dark:border-slate-700/50"
          >
            {Object.entries(tabLabels).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                aria-controls={`${key}-panel`}
                id={`${key}-tab`}
                onClick={() => setActiveTab(key)}
                className={`relative px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  activeTab === key
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                {activeTab === key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-sm opacity-30 -z-10"></div>
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
            role="status"
            aria-live="polite"
            title="Loading saved scenarios..."
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin animation-delay-150"></div>
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin animation-delay-300"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Tabs Content */}
        {!isLoading && (
          <div className="relative">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 transition-all duration-500">
              {activeTab === "saved" && (
                <Suspense
                  fallback={
                    <div className="flex justify-center items-center h-40">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin animation-delay-150"></div>
                      </div>
                    </div>
                  }
                >
                  <div
                    id="saved-panel"
                    role="tabpanel"
                    aria-labelledby="saved-tab"
                    tabIndex={0}
                    className="animate-in fade-in duration-500"
                  >
                    <SavedComponent scenarios={filteredSavedScenarios} />
                  </div>
                </Suspense>
              )}

              {activeTab === "history" && (
                <Suspense
                  fallback={
                    <div className="flex justify-center items-center h-40">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin animation-delay-150"></div>
                      </div>
                    </div>
                  }
                >
                  <div
                    id="history-panel"
                    role="tabpanel"
                    aria-labelledby="history-tab"
                    tabIndex={0}
                    className="animate-in fade-in duration-500"
                  >
                    <HistoryComponent />
                  </div>
                </Suspense>
              )}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!isLoading && activeTab === "saved" && filteredSavedScenarios.length === 0 && (
          <div
            className="text-center mt-12 animate-in fade-in duration-500"
            role="status"
            aria-live="polite"
          >
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/20 dark:border-slate-700/50">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                No saved scenarios found
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Your genius archive is waiting to be filled with amazing scenarios.
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
        
        .backdrop-blur-lg {
          backdrop-filter: blur(16px);
        }
      `}</style>
    </div>
  );
};

export default SavedScenariosTabs;