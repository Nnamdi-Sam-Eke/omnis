import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

const SavedComponent = () => {
  const { currentUser } = useAuth();
  const [savedQueries, setSavedQueries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

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
        ? [...new Set(savedQueries.map((item) => item.query))].filter((query) =>
            query.toLowerCase().startsWith(searchQuery.toLowerCase())
          )
        : []
    );
  }, [searchQuery, savedQueries]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-6xl mx-auto p-8">
        <div className="space-y-4">
          <div className="h-8 bg-gradient-to-r from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl"></div>
          <div className="h-12 bg-gradient-to-r from-emerald-200 to-teal-200 dark:from-emerald-800 dark:to-teal-800 rounded-xl"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl"></div>
            <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl"></div>
            <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center pt-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Saved Queries
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 mx-auto rounded-full"></div>
        </div>

        {/* Search Container */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-slate-400 dark:text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved queries..."
              className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 shadow-lg"
            />
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="max-h-40 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => setSearchQuery(suggestion)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                      {suggestion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Saved Queries Container */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="p-6">
            {/* Unified conditional rendering */}
            {searchQuery ? (
              filteredSavedQueries.length > 0 ? (
                // Display search results
                <div className="space-y-6">
                  {filteredSavedQueries.map((item, index) => (
                    <div key={item.id} className="group bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">{item.query}</p>
                    </div>
                  ))}
                </div>
              ) : (
                // Search: No results
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    No saved scenarios found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Your genius archive is waiting to be filled with amazing scenarios.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Clear Search
                  </button>
                </div>
              )
            ) : savedQueries.length === 0 ? (
              // Default: No saved queries yet
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  No Saved Queries Yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Your saved queries will appear here once you start saving them.
                </p>
              </div>
            ) : (
              // Default: Show all saved queries
              <div className="space-y-6">
                {savedQueries.map((item, index) => (
                  <div key={item.id} className="group bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">{item.query}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedComponent;
