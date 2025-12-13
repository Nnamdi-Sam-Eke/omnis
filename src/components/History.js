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
import { Tag, Search, Clock, MessageSquare, Filter, AlertCircle } from "lucide-react";

const PAGE_SIZE = 10;

const History = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Load chat history from user's subcollection
  const loadChatHistory = async () => {
    if (!user) return;
    
    try {
      console.log("📥 Loading chat history for user:", user.uid);
      
      const q = query(
        collection(db, "users", user.uid, "userInteractions"),
        orderBy("timestamp", "desc")
      );
      
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      console.log("✅ Chat history loaded:", history.length, "items");
      console.log("📋 Sample data:", history[0]);
      
      setChatHistory(history);
      setUsingFallback(history.length === 0);
    } catch (error) {
      console.error("❌ Error loading chat history:", error);
      setUsingFallback(true);
    }
  };

  // Load user interactions with pagination
  const loadUserInteractions = async (loadMore = false) => {
    if (!user) return;
    
    try {
      setLoadingMore(loadMore);
      console.log(loadMore ? "📥 Loading more interactions..." : "📥 Loading initial interactions...");
      
      // Query from user's subcollection (where ScenarioInput saves data)
      const userInteractionsRef = collection(db, "users", user.uid, "userInteractions");

      const q = query(
        userInteractionsRef,
        orderBy("timestamp", "desc"),
        ...(loadMore && lastVisible ? [startAfter(lastVisible)] : []),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const interactions = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Log the raw response structure for debugging
        if (data.response && typeof data.response === 'object') {
          console.log("🔍 Response structure:", {
            type: typeof data.response,
            keys: Object.keys(data.response),
            value: data.response
          });
        }
        
        return {
          id: doc.id,
          query: data.query || "",
          response: data.response || "",
          category: data.category || "Uncategorized",
          timestamp: data.timestamp,
          ...data,
        };
      });

      console.log("✅ Loaded", interactions.length, "interactions");
      console.log("📋 Sample interaction:", interactions[0]);

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

  // Determine which history to use
  const { history: activeHistory, fallback: isFallback } = useMemo(() => {
    if (userInteractions.length > 0) {
      console.log("Using userInteractions:", userInteractions.length);
      return { history: userInteractions, fallback: false };
    }
    if (chatHistory.length > 0) {
      console.log("Using chatHistory (fallback):", chatHistory.length);
      return { history: chatHistory, fallback: true };
    }
    console.log("No history available");
    return { history: [], fallback: false };
  }, [userInteractions, chatHistory]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(
      activeHistory
        .map((item) => item.category)
        .filter((cat) => cat && cat !== "")
    );
    return ["all", ...Array.from(cats)];
  }, [activeHistory]);

  // Filter interactions by search query and category
  const filteredInteractions = useMemo(() => {
    let filtered = activeHistory;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (interaction) => interaction.category === selectedCategory
      );
    }

    // Filter by search query
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((interaction) => {
        // Safely handle response type for .toLowerCase
        const queryStr = typeof interaction.query === "string" ? interaction.query : "";
        const responseStr = typeof interaction.response === "string" ? interaction.response : "";
        const categoryStr = typeof interaction.category === "string" ? interaction.category : "";

        return (
          queryStr.toLowerCase().includes(searchLower) ||
          responseStr.toLowerCase().includes(searchLower) ||
          categoryStr.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [debouncedSearch, selectedCategory, activeHistory]);

  // Search suggestions based on queries
  const suggestions = useMemo(() => {
    if (!debouncedSearch) return [];
    
    const searchLower = debouncedSearch.toLowerCase();
    const suggestionSet = new Set();
    
    activeHistory.forEach((interaction) => {
      if (interaction.query?.toLowerCase().includes(searchLower)) {
        suggestionSet.add(interaction.query);
      }
    });
    
    return Array.from(suggestionSet).slice(0, 5);
  }, [debouncedSearch, activeHistory]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-6xl mx-auto p-8">
        <div className="space-y-4">
          <div className="h-8 bg-gradient-to-r from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl"></div>
          <div className="h-12 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-xl"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
          Interaction History
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          View all your scenario simulations with categories
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto rounded-full mt-3"></div>
      </div>

      {/* Fallback Warning */}
      {isFallback && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Showing unsynced local history
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-300">
                Some data may be incomplete. Refresh to sync.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search scenarios, responses, or categories..."
            className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 shadow-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 flex-shrink-0">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filter:</span>
            </div>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0
                  ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }
                `}
              >
                {category === "all" ? "All Categories" : category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-200 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                onClick={() => setSearchQuery(suggestion)}
              >
                <div className="flex items-center space-x-3">
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                    {suggestion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactions List */}
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto p-6">
          {filteredInteractions.length > 0 ? (
            <div className="space-y-4">
              {filteredInteractions.map((interaction, index) => (
                <div
                  key={interaction.id}
                  className="group bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] animate-in fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Header with Category Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Scenario Simulation
                        </h3>
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    {interaction.category && interaction.category !== "Uncategorized" && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-xs font-medium shadow-lg">
                        <Tag className="w-3 h-3" />
                        <span>{interaction.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Query Section */}
                  {interaction.query && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Query
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                        {interaction.query}
                      </p>
                    </div>
                  )}

                  {/* Response Section */}
                  {interaction.response && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        AI Analysis
                      </p>
                      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        {(() => {
                          // If response is a string, render directly
                          if (typeof interaction.response === 'string') {
                            return <p className="line-clamp-3">{interaction.response}</p>;
                          }

                          // If response is an array, render each item as a string
                          if (Array.isArray(interaction.response)) {
                            return (
                              <ul className="space-y-1 list-disc pl-5">
                                {interaction.response.map((item, idx) => (
                                  <li key={idx}>
                                    {typeof item === "object"
                                      ? <pre className="whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
                                      : String(item)}
                                  </li>
                                ))}
                              </ul>
                            );
                          }

                          // If response is an object, pretty print it
                          if (typeof interaction.response === 'object' && interaction.response !== null) {
                            return (
                              <pre className="whitespace-pre-wrap text-xs">
                                {JSON.stringify(interaction.response, null, 2)}
                              </pre>
                            );
                          }

                          // Fallback: render as string
                          return <p className="line-clamp-3 text-xs">{String(interaction.response)}</p>;
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {interaction.timestamp?.toDate?.().toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) ?? "Recent"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                No interactions found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filter"
                  : "Your scenario simulations will appear here after you run your first simulation"}
              </p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMore && !loadingMore && filteredInteractions.length > 0 && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <button
              onClick={() => loadUserInteractions(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              Load More Interactions
            </button>
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Loading more interactions...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {activeHistory.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {activeHistory.length}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Total Simulations
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {categories.length - 1}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Categories
              </p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {filteredInteractions.length}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Filtered Results
              </p>
            </div>
          </div>
        </div>
      )}

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
          animation: fade-in 0.4s ease-out forwards;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }
        
        /* Scrollbar styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .dark .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default History;