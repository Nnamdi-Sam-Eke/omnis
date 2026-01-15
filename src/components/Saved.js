import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

const SavedComponent = () => {
  const { user } = useAuth();
  const [savedQueries, setSavedQueries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Fetch saved queries from Firestore (new structure: savedScenarios/{userId}/saved)
  useEffect(() => {
    const fetchSavedQueries = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        
        const savedRef = collection(db, "userInteractions", user.uid, "savedScenarios");
        const q = query(savedRef, orderBy("savedAt", "desc"));

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSavedQueries(data);
        console.log("✅ Loaded", data.length, "saved scenarios");

      } catch (error) {
        console.error("❌ Error retrieving saved scenarios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedQueries();
  }, [user]);

  // Timer to switch off loading after 4 seconds (on mount)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Helper: export item(s) as PDF-like printable HTML (opens print dialog)
  const exportItemsAsPDF = (items) => {
    const htmlSections = items.map((item) => {
      const content = item.response?.result || JSON.stringify(item.response || {}, null, 2);
      return `
        <section style="page-break-inside:avoid;margin-bottom:32px;">
          <h2 style="font-family: Arial, Helvetica, sans-serif; color:#0f172a;">${escapeHtml(item.query || 'Untitled')}</h2>
          <p style="color:#334155;font-size:0.95rem;">Category: <strong>${escapeHtml(item.category || 'Uncategorized')}</strong></p>
          <hr/>
          <div style="font-family: Georgia, serif; color:#0f172a; white-space:pre-wrap;">${escapeHtml(content)}</div>
        </section>
      `;
    }).join('\n');

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Saved Scenarios Export</title></head><body style="padding:24px;">${htmlSections}</body></html>`;
    const newWin = window.open('', '_blank');
    if (!newWin) {
      alert('Popup blocked. Please allow popups to export.');
      return;
    }
    newWin.document.write(html);
    newWin.document.close();
    newWin.focus();
    // Give browser a moment to render before printing
    setTimeout(() => newWin.print(), 500);
  };

  const escapeHtml = (unsafe) => {
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    const baseList = searchQuery ? filteredSavedQueries : savedQueries;
    const start = (page - 1) * pageSize;
    const list = baseList.slice(start, start + pageSize).map(i => i.id);
    if (list.length === 0) return;
    const allSelected = list.every(id => selectedIds.has(id));
    if (allSelected) {
      // clear
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(list));
    }
  };

  // Reset page when search or savedQueries change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, savedQueries.length]);

  const baseList = searchQuery ? filteredSavedQueries : savedQueries;
  const totalPages = Math.max(1, Math.ceil(baseList.length / pageSize));
  const visibleItems = baseList.slice((page - 1) * pageSize, page * pageSize);

  const deleteItem = async (itemId) => {
    if (!user?.uid) return;
    try {
      await deleteDoc(doc(db, 'savedScenarios', user.uid, 'saved', itemId));
      setSavedQueries(prev => prev.filter(i => i.id !== itemId));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    } catch (err) {
      console.error('Failed to delete saved item', err);
      alert('Failed to delete saved item.');
    }
  };

  const deleteSelected = async () => {
    if (!user?.uid) return;
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    const confirmDelete = window.confirm(`Delete ${ids.length} saved scenario(s)?`);
    if (!confirmDelete) return;
    try {
      await Promise.all(ids.map(id => deleteDoc(doc(db, 'savedScenarios', user.uid, 'saved', id))));
      setSavedQueries(prev => prev.filter(i => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Bulk delete failed', err);
      alert('Bulk delete failed.');
    }
  };

  const exportSelected = () => {
    const items = savedQueries.filter(i => selectedIds.has(i.id));
    if (!items.length) { window.alert('No items selected'); return; }
    exportItemsAsPDF(items);
  };

  // Update the filtering to work with new structure (search both query and category)
  const filteredSavedQueries = savedQueries.filter((item) =>
    (item.query?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (item.category?.toLowerCase() || "").includes(searchQuery.toLowerCase())
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600 dark:text-slate-300">Total saved:</div>
                <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 font-semibold text-sm">{savedQueries.length}</div>
                {selectedIds.size > 0 && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">Selected: {selectedIds.size}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button onClick={selectAllVisible} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-sm">Select Visible</button>
                <button onClick={exportSelected} className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-white rounded-md text-sm">Export Selected</button>
                <button onClick={deleteSelected} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm">Delete Selected</button>
              </div>
            </div>
            {/* Unified conditional rendering */}
            {searchQuery ? (
              filteredSavedQueries.length > 0 ? (
                // Display search results
                <div className="space-y-6">
                  {filteredSavedQueries.map((item, index) => {
                    const isOpen = expandedId === item.id;
                    return (
                      <div key={item.id} className="group bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                          <div className="flex items-start gap-3">
                            <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="mt-2" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                                  className="w-full text-left flex items-center justify-between gap-4"
                                  aria-expanded={isOpen}
                                >
                                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed truncate">{item.query}</p>
                                  <span className="text-xs text-slate-400">{isOpen ? '▾' : '▸'}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                        {isOpen && (
                          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-slate-500">Category: <span className="font-medium text-slate-800 dark:text-slate-100">{item.category || 'Uncategorized'}</span></div>
                              <div className="text-xs text-slate-400">Saved: <span className="font-medium text-slate-700 dark:text-slate-300">{item.savedDate ? new Date(item.savedDate).toLocaleString() : (item.savedAt?.toDate ? item.savedAt.toDate().toLocaleString() : 'Unknown')}</span></div>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none mb-3 break-words">
                              {item.response?.result ? (
                                <div>{item.response.result}</div>
                              ) : (
                                <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(item.response || {}, null, 2)}</pre>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                {visibleItems.map((item, index) => {
                  const isOpen = expandedId === item.id;
                  return (
                    <div key={item.id} className="group bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <button
                        onClick={() => setExpandedId(isOpen ? null : item.id)}
                        className="w-full text-left flex items-center justify-between gap-4"
                        aria-expanded={isOpen}
                      >
                        <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed truncate">{item.query}</p>
                        <span className="text-xs text-slate-400">{isOpen ? '▾' : '▸'}</span>
                      </button>

                      {isOpen && (
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs text-slate-500">Category: <span className="font-medium text-slate-800 dark:text-slate-100">{item.category || 'Uncategorized'}</span></div>
                            <div className="text-xs text-slate-400">Saved: <span className="font-medium text-slate-700 dark:text-slate-300">{item.savedDate ? new Date(item.savedDate).toLocaleString() : (item.savedAt?.toDate ? item.savedAt.toDate().toLocaleString() : 'Unknown')}</span></div>
                          </div>
                          <div className="prose prose-sm dark:prose-invert max-w-none mb-3 break-words">
                            {item.response?.result ? (
                              <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-100">{item.response.result}</div>
                            ) : (
                              <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(item.response || {}, null, 2)}</pre>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => exportItemsAsPDF([item])} className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-white rounded-md text-sm">Export</button>
                            <button onClick={() => deleteItem(item.id)} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm">Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Pagination controls */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-slate-600">Page {page} of {totalPages}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-sm disabled:opacity-50">Previous</button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-sm disabled:opacity-50">Next</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedComponent;
