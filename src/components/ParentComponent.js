import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { useAuth } from "../AuthContext"; // Adjust path as needed
import ScenarioInput from "./components/ScenarioInput";
import History from "./components/History";
import ScenarioSimulationCard from "./components/ScenarioSimulationCard";

const ParentComponent = () => {
 
  const { user } = useAuth(); // Adjust based on your auth context
  const [simulationResults, setSimulationResults] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInteractions, setUserInteractions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load interactions from Firestore
const loadUserInteractions = async () => {
  if (!user) return;
  try {
    const ref = collection(db, 'userInteractions');

    try {
      // ✅ Use user.uid instead of user.id to match History component
      const q = query(ref, where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserInteractions(data);
    } catch (indexError) {
      // Fallback without orderBy
      console.warn('⚠️ Index missing, falling back to local sort:', indexError.message);
      const q = query(ref, where('userId', '==', user.uid)); // ✅ Also use user.uid here
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserInteractions(data.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(0);
        const timeB = b.timestamp?.toDate?.() || new Date(0);
        return timeB - timeA;
      }));
    }
  } catch (error) {
    console.error('❌ Failed to fetch user interactions:', error);
  }
};
  // Load user interactions on user change
  useEffect(() => {
    if (user) {
      loadUserInteractions();
    } else {
      setUserInteractions([]);
    }
  }, [user]);

  // Load backup data from localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem('chatHistory');
    const storedResults = localStorage.getItem('simulationResults');
    if (storedHistory) setChatHistory(JSON.parse(storedHistory));
    if (storedResults) setSimulationResults(JSON.parse(storedResults));
  }, []);

  // Store chatHistory changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Store simulationResults changes
  useEffect(() => {
    if (simulationResults.length > 0) {
      localStorage.setItem('simulationResults', JSON.stringify(simulationResults));
    }
  }, [simulationResults]);

  const refreshUserInteractions = () => {
    loadUserInteractions();
  };

  const handleSimulationComplete = (results) => {
    setSimulationResults(results);
    refreshUserInteractions();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-10">
      <ScenarioInput
        setSimulationResults={setSimulationResults}
        setChatHistory={setChatHistory}
        onSimulationComplete={handleSimulationComplete}
        refreshUserInteractions={refreshUserInteractions}
        userInteractions={userInteractions}
      />

        
      <History 
        user={user}                           // ✅ Pass user prop
        db={db}                              // ✅ Pass db prop
        userInteractions={userInteractions}   // ✅ Pass userInteractions
        setUserInteractions={setUserInteractions} // ✅ Pass setter function
        refreshInteractions={refreshUserInteractions} // ✅ Pass refresh function
        chatHistory={chatHistory}             // ✅ Pass chatHistory
        />

      {process.env.NODE_ENV === 'development' && simulationResults.length > 0 && (
        <details className="bg-gray-100 p-4 rounded-lg">
          <summary className="cursor-pointer font-semibold">Debug: Simulation Results</summary>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(simulationResults, null, 2)}
          </pre>
        </details>
      )}

      <ScenarioSimulationCard
        results={simulationResults}
        setResults={setSimulationResults}
        loading={loading}
      />

      {userInteractions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-700 dark:text-blue-300">
            User Activity Summary
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Total interactions: {userInteractions.length} |{' '}
            Latest: {userInteractions[0]?.action || 'None'} |{' '}
            Last updated: {userInteractions[0]?.timestamp?.toDate?.()?.toLocaleString?.() || 'Unknown'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ParentComponent;