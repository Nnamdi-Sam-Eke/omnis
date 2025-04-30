import { useEffect, useState } from 'react';
import { db } from '../firebase'; // Your Firebase config file
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useAuth } from '../AuthContext'; // Ensure authentication context

const ChatHistory = () => {
  const { currentUser } = useAuth(); // Get logged-in user
  const [chatHistory, setChatHistory] = useState([]); // Store the fetched history data
  const [searchQuery, setSearchQuery] = useState(""); // Manage search input
  const [suggestions, setSuggestions] = useState([]); // Manage autocomplete suggestions
  const [loading, setLoading] = useState(true); // Manage loading state

  // Fetch chat history from Firestore based on the current user
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false); // No need to fetch history if no user is found
      return;
    }

    const fetchChatHistory = async () => {
      try {
        const q = query(
          collection(db, 'chatHistory'),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.seconds
            ? new Date(doc.data().timestamp.seconds * 1000).toLocaleString()
            : 'Unknown',
        }));
        setChatHistory(historyData);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('❌ Error retrieving history:', error);
        setLoading(false); // Set loading to false on error
      }
    };

    fetchChatHistory();
  }, [currentUser]); // Ensure this runs when currentUser changes

  // Filter the history based on search query
  const filteredHistory = chatHistory.filter((item) =>
    item.scenarios.some((scenario) => scenario.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Generate suggestions for autocomplete based on partial matches
  useEffect(() => {
    setSuggestions(
      searchQuery
        ? chatHistory.flatMap((item) =>
            item.scenarios.filter((scenario) => scenario.toLowerCase().startsWith(searchQuery.toLowerCase()))
          )
        : []
    );
  }, [searchQuery, chatHistory]);

  return (
    <div className="max-w-6xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-blue-500/50 rounded-lg border">
      <h1 className="text-2xl font-bold text-center p-6 text-blue-600 dark:text-blue-300 mb-4">Interaction History</h1>

      {/* Search bar with autocomplete */}
      <input
        type="text"
        placeholder="Search past queries..."
        className="w-full p-2 mb-4 border focus:ring-2 focus:ring-blue-500 rounded bg-white dark:bg-gray-700"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="bg-gray-100 border rounded-lg max-h-32 overflow-y-auto mb-4">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => setSearchQuery(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">Loading history...</div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <div key={item.id} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow">
                <p className="text-green-600 font-semibold">Action:</p>
                <p className="text-gray-900 dark:text-white">{item.action}</p>
                <p className="text-green-600 font-semibold mt-2">Scenarios:</p>
                <ul className="list-disc pl-5 text-gray-900 dark:text-gray-300">
                  {item.scenarios.map((scenario, index) => (
                    <li key={index}>{scenario}</li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{item.timestamp}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No results found for "{searchQuery}".</p> // No result message
          )}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
