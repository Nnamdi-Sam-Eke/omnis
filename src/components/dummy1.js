import { useState, useEffect, useMemo } from 'react';

const History = ({
  userInteractions = [],
  chatHistory = [],
  refreshInteractions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [activeHistory, setActiveHistory] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Memoize the logic to prevent unnecessary recalculations
  const computedActiveHistory = useMemo(() => {
    if (userInteractions.length > 0) {
      return { history: userInteractions, fallback: false };
    } else if (chatHistory.length > 0) {
      return { history: chatHistory, fallback: true };
    } else {
      return { history: [], fallback: false };
    }
  }, [userInteractions.length, chatHistory.length]); // Only depend on lengths

  useEffect(() => {
    setActiveHistory(computedActiveHistory.history);
    setUsingFallback(computedActiveHistory.fallback);
  }, [computedActiveHistory]);

  const filteredInteractions = searchQuery
    ? activeHistory.filter((interaction) =>
        interaction.details?.scenarios?.some((scenario) =>
          scenario.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : activeHistory;

  const suggestions = searchQuery
    ? activeHistory.flatMap((interaction) =>
        interaction.details?.scenarios?.filter((scenario) =>
          scenario.toLowerCase().startsWith(searchQuery.toLowerCase())
        ) || []
      )
    : [];

  const handleRefresh = async () => {
    setLoading(true);
    if (refreshInteractions) await refreshInteractions();
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-6xl mx-auto mt-8 p-8 border bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-blue-500/50">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-300 dark:bg-blue-700 rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border">
      <h1 className="text-2xl font-bold text-center p-6 text-blue-600 dark:text-blue-300 mb-4">
        Interaction History
      </h1>

      {usingFallback && (
        <p className="text-sm text-yellow-600 dark:text-yellow-300 mb-4 text-center">
          ⚠️ Showing unsynced local history. Log in to sync with your account.
        </p>
      )}

      <input
        type="text"
        placeholder="Search past queries..."
        className="w-full p-2 mb-4 border focus:ring-2 focus:ring-blue-500 rounded bg-white dark:bg-gray-700"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="mb-4 text-right">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Refresh
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul className="bg-gray-100 border rounded-lg max-h-32 overflow-y-auto mb-4">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => setSearchQuery(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {filteredInteractions.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-blue-500 dark:text-blue-300 mb-4">
            Recent User Interactions
          </h3>
          <div className="space-y-3">
            {filteredInteractions.slice(0, 5).map((interaction, i) => (
              <div
                key={interaction.id || i}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm text-blue-600 dark:text-blue-400">
                    {interaction.action || 'Simulated'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {interaction.timestamp?.toDate?.()?.toLocaleDateString?.() ||
                      interaction.timestamp ||
                      'Recent'}
                  </span>
                </div>
                {interaction.details?.scenarios && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Scenarios: {interaction.details.scenarios.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No results found for "{searchQuery}"
        </p>
      )}
    </div>
  );
};

export default History;