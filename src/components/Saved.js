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
              <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved queries..."
              className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 shadow-lg"
              aria-label="Search saved queries"
              title="Type to search for saved queries"
            />
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="max-h-40 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    role="option"
                    tabIndex={0}
                    onClick={() => setSearchQuery(suggestion)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && setSearchQuery(suggestion)
                    }
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-200 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                    title={`Click to search for "${suggestion}"`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                        {suggestion}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Saved Queries Container */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="p-6">
            {/* Case 1: No saved queries at all */}
            {savedQueries.length === 0 ? (
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
            ) : /* Case 2: Have saved queries but search returned no results */
            searchQuery && filteredSavedQueries.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  No Matching Queries Found
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  No saved queries match your search for "{searchQuery}".
                </p>
              </div>
            ) : /* Case 3: Display filtered results */
            (
              <div className="space-y-6">
                {filteredSavedQueries.map((item, index) => (
                  <div
                    key={item.id}
                    className="group bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                              Query
                            </h3>
                            <div className="flex-1 h-px bg-gradient-to-r from-emerald-300 to-transparent dark:from-emerald-600"></div>
                          </div>
                          <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                            {item.query}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                              Response
                            </h3>
                            <div className="flex-1 h-px bg-gradient-to-r from-teal-300 to-transparent dark:from-teal-600"></div>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {item.response || "No response recorded"}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {item.timestamp?.seconds
                              ? new Date(item.timestamp.seconds * 1000).toLocaleString()
                              : "No timestamp available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
          animation: fade-in 0.6s ease-out forwards;
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

export default SavedComponent;