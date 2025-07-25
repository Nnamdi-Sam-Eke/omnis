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
      <div className="animate-pulse space-y-6 max-w-6xl mx-auto p-8">
        <div className="space-y-4">
          <div className="h-8 bg-gradient-to-r from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl"></div>
          <div className="h-12 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-xl"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl"></div>
            <div className="h-20 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl"></div>
            <div className="h-20 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          Interaction History
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto rounded-full"></div>
      </div>

      {/* Fallback Warning */}
      {isFallback && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Showing unsynced local history
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-300">
                Log in to sync with your account
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search past queries..."
          className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 shadow-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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

      {/* Interactions List */}
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden">
        <div className="max-h-96 overflow-y-auto p-6">
          {filteredInteractions.length > 0 ? (
            <div className="space-y-4">
              {filteredInteractions.map((interaction, index) => (
                <div
                  key={interaction.id}
                  className="group bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {interaction.action}
                      </h3>
                      {interaction.details?.scenarios && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                          {interaction.details.scenarios.join(", ")}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {interaction.timestamp?.toDate?.().toLocaleString() ?? "Recent"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                No interactions found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your interaction history will appear here as you explore.
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

export default History;