// ParentComponent.js - CORRECTED VERSION
import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import ScenarioInput from "./ScenarioInput";
import History from "./History";
import ScenarioSimulationCard from "./SimulationResult";

const ParentComponent = () => {
  const { user } = useAuth();
  
  // ✅ ADD THESE - State for simulation results
  const [generatedResults, setGeneratedResults] = useState([]);
  const [simulationInput, setSimulationInput] = useState("");
  const [simulationLoading, setSimulationLoading] = useState(false);
  
  // Existing state
  const [simulationResults, setSimulationResults] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInteractions, setUserInteractions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load interactions from Firestore
  const loadUserInteractions = async () => {
    if (!user) return;
    try {
      // Read from userInteractions/{userId}/interactions subcollection directly
      const ref = collection(db, 'userInteractions', user.uid, 'interactions');
      const q = query(ref, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserInteractions(data);
    } catch (error) {
      console.error('❌ Failed to fetch user interactions:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserInteractions();
    } else {
      setUserInteractions([]);
    }
  }, [user]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('chatHistory');
    const storedResults = localStorage.getItem('simulationResults');
    if (storedHistory) setChatHistory(JSON.parse(storedHistory));
    if (storedResults) setSimulationResults(JSON.parse(storedResults));
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* MOBILE LAYOUT: Stacked (< 768px) */}
      <div className="md:hidden space-y-6 p-4">
        <ScenarioInput
          setGeneratedResults={setGeneratedResults}
          setSimulationInput={setSimulationInput}
          setSimulationLoading={setSimulationLoading}
          setChatHistory={setChatHistory}
          onSimulationComplete={handleSimulationComplete}
          refreshUserInteractions={refreshUserInteractions}
          userInteractions={userInteractions}
        />

        <ScenarioSimulationCard
          results={generatedResults}
          setResults={setGeneratedResults}
          loading={simulationLoading}
          simulationInput={simulationInput}
        />
      </div>

      {/* DESKTOP/TABLET: Side-by-Side (≥ 768px) */}
      <div className="hidden md:flex h-screen gap-4 p-4">
        {/* LEFT: Input (420px fixed) */}
        <div className="w-[420px] flex-shrink-0">
          <ScenarioInput
            setGeneratedResults={setGeneratedResults}
            setSimulationInput={setSimulationInput}
            setSimulationLoading={setSimulationLoading}
            setChatHistory={setChatHistory}
            onSimulationComplete={handleSimulationComplete}
            refreshUserInteractions={refreshUserInteractions}
            userInteractions={userInteractions}
          />
        </div>

        {/* RIGHT: Results (flex grow) */}
        <div className="flex-1 min-w-0">
          <ScenarioSimulationCard
            results={generatedResults}
            setResults={setGeneratedResults}
            loading={simulationLoading}
            simulationInput={simulationInput}
          />
        </div>
      </div>

      {/* History Component (below on all screens) */}
      <div className="p-4">
        <History 
          user={user}
          db={db}
          userInteractions={userInteractions}
          setUserInteractions={setUserInteractions}
          refreshInteractions={refreshUserInteractions}
          chatHistory={chatHistory}
        />
      </div>

      {/* Debug Panel (development only) */}
      {process.env.NODE_ENV === 'development' && simulationResults.length > 0 && (
        <div className="p-4">
          <details className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <summary className="cursor-pointer font-semibold">Debug: Simulation Results</summary>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(simulationResults, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* User Activity Summary */}
      {userInteractions.length > 0 && (
        <div className="p-4">
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
        </div>
      )}
    </div>
  );
};

export default ParentComponent;