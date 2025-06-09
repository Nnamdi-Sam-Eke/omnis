import React,{ useState, useEffect } from "react";
import { saveUserInteraction } from "../services/userBehaviourService";
import { useMemory } from "../MemoryContext"; // ✅ Import Memory Context
import { db } from "../firebase"; // Import Firestore database
import { Timestamp } from "firebase/firestore";

import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  where, // ✅ Added where import
} from "firebase/firestore"; // Consolidated imports
import { useAuth } from "../AuthContext"; // ✅ Import Auth
import { ChevronRight, ChevronUp, Lock, Play, Crown } from "lucide-react";
import ScenarioSimulationCard from "./SimulationResult";

// Component to simulate multiple scenarios and store the results in memory
export default function ScenarioInput({ onSimulate }) {
  const [scenarios, setScenarios] = useState([""]);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const { memory, saveToFirestore } = useMemory(); // ✅ AI Memory Hook
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]); // ✅ Store previous interactions
  const [userInteractions, setUserInteractions] = useState([]); // ✅ Store user interactions
  const [trialExpired, setTrialExpired] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth(); // ✅ Get current user
  const [discountDeadline, setDiscountDeadline] = useState(null);
  const [loading, setLoading] = React.useState(true);
  const [simulationLoading, setSimulationLoading] = useState(false); // ✅ Separate loading state for simulation
  
  // Get user tier for button logic
  const userTier = (
    user?.subscriptionTier || 
    user?.tier?.toLowerCase?.() || 
    "free"
  ).toLowerCase();
  
  const isFreeTier = userTier === "free";
  const isPaidTier = userTier === "pro" || userTier === "enterprise";
  
  // Timer to switch off loading after 4 seconds (on mount)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) {
      loadFirestoreMemory();
      checkTrialStatus();
      loadChatHistory();
      loadUserInteractions(); // ✅ Load user interactions
    }
  }, [user]);

  const loadFirestoreMemory = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "memory"),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const loadedMemory = querySnapshot.docs.map((doc) => doc.data());
      console.log("✅ Firestore Memory Loaded:", loadedMemory);
      // Optionally: update memory context
      // saveToFirestore(loadedMemory);
    } catch (error) {
      console.error("❌ Error loading Firestore memory:", error);
    }
  };

  const loadChatHistory = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "userInteractions"),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const loadedChat = querySnapshot.docs.map((doc) => doc.data());
      setChatHistory(loadedChat);
      console.log("✅ Chat history loaded");
    } catch (error) {
      console.error("❌ Error loading chat history:", error);
    }
  };

  // ✅ New function to load user interactions from main collection
  const loadUserInteractions = async () => {
    if (!user) return;
    try {
      const userInteractionsRef = collection(db, 'userInteractions');
      const q = query(
        userInteractionsRef, 
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc') // Most recent first
      );
      
      const snapshot = await getDocs(q);
      const interactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUserInteractions(interactions);
      console.log("✅ User interactions loaded:", interactions);
    } catch (error) {
      console.error("❌ Error fetching user interactions:", error);
    }
  };

const checkTrialStatus = async () => {
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const tier = (userData.subscriptionTier || user?.tier?.toLowerCase?.() || "free").toLowerCase();
    const now = new Date();

    // If user is Pro or Enterprise, no trial or upgrade modal logic applies
    if (tier !== "free") {
      setTrialExpired(false);
      setShowUpgradeModal(false);
      console.log("✅ User is on paid tier:", tier);
      return;
    }

    // Free tier logic
    const trialStart = userData.trialStartedAt?.toDate?.() || user.trialStartedAt?.toDate?.();

    if (!trialStart) {
      // First time trial use
      await setDoc(
        userRef,
        {
          trialStartedAt: serverTimestamp(),
          hasUsedSimulationTrial: true,
        },
        { merge: true }
      );
      setTrialExpired(false);
      setShowUpgradeModal(false);
      console.log("🎉 Trial started");
    } else {
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + 7);

      if (now > trialEnd) {
        // Trial expired
        setTrialExpired(true);
        setShowUpgradeModal(true);

        // Handle discount availability
        const discountDeadline = userData.discountAvailableUntil?.toDate?.() || user.discountAvailableUntil?.toDate?.();
        if (!discountDeadline || now > discountDeadline) {
          const newDiscountEnd = new Date();
          newDiscountEnd.setDate(now.getDate() + 7);

          const discountEndTimestamp = Timestamp.fromDate(newDiscountEnd);
          await setDoc(
            userRef,
            {
              discountAvailableUntil: discountEndTimestamp,
            },
            { merge: true }
          );
          setDiscountDeadline(newDiscountEnd);
        } else {
          setDiscountDeadline(discountDeadline);
        }

        console.log("⏰ Trial expired");
      } else {
        // Trial still active
        setTrialExpired(false);
        setShowUpgradeModal(false);
        // Calculate remaining time
        const msLeft = trialEnd - now;
        const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
        console.log(`✅ Trial still active: ${daysLeft}d ${hoursLeft}h ${minutesLeft}m left`);
      }
    }

    console.log("✅ Trial status checked for user:", user.uid);
  } catch (err) {
    console.error("❌ Error checking trial:", err);
  }
};

  const handleScenarioSubmit = async (query, response) => {
    try {
      const historyEntry = {
        query,
        response,
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(db, "users", user.uid, "userInteractions"), historyEntry);
      setChatHistory((prev) => [...prev, historyEntry]);
      console.log("✅ History saved!");
    } catch (error) {
      console.error("❌ Error saving history:", error);
    }
  };


const handleSimulate = async () => {
  if (!user) return;

  // Only block simulation if user is free tier AND trial has expired
  if (isFreeTier && trialExpired) {
    setShowUpgradeModal(true);
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      subscriptionTier: userTier,
      trialStartedAt: serverTimestamp(),
      hasUsedSimulationTrial: true,
    });
  } else {
    const userData = userSnap.data();
    if (!userData.trialStartedAt || userData.hasUsedSimulationTrial !== true) {
      await setDoc(
        userRef,
        {
          trialStartedAt: serverTimestamp(),
          hasUsedSimulationTrial: true,
        },
        { merge: true }
      );
    }
  }


  

  

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      subscriptionTier: userTier,
      trialStartedAt: serverTimestamp(),
      hasUsedSimulationTrial: true,
    });
  } else {
    const userData = userSnap.data();
    if (!userData.trialStartedAt || userData.hasUsedSimulationTrial !== true) {
      await setDoc(
        userRef,
        {
          trialStartedAt: serverTimestamp(),
          hasUsedSimulationTrial: true,
        },
        { merge: true }
      );
    }
  }

  const filteredScenarios = scenarios.filter((s) => s.trim() !== "");
  if (!filteredScenarios.length) return;

  console.log("📊 Simulating scenarios:", filteredScenarios);
  await saveUserInteraction(user.uid, "simulate_scenario", { scenarios: filteredScenarios });

  await loadUserInteractions();

  // ✅ Set simulation loading to true and clear previous results
  setSimulationLoading(true);
  setError(null);
  setResults([]);

  try {
    const simulationStart = Date.now();

    const simulationPromises = filteredScenarios.map(async (scenario) => {
    const payload = {
  input_type: "text",
  text: scenario,
  user_id: user?.uid
};

      console.log("📤 Sending to /api/simulate:", payload);

      try {
        const response = await fetch("http://localhost:5000/api/simulate", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Simulation request failed");
        }

        const result = await response.json();
        await handleScenarioSubmit(scenario, result);
        return { query: scenario, response: result };
      } catch (err) {
        console.error("❌ Simulation fetch error:", err);
        return { query: scenario, response: { error: err.message } };
      }
    });

    const allResults = await Promise.all(simulationPromises);

    const elapsed = Date.now() - simulationStart;
    const delay = Math.max(0, 4000 - elapsed);

    setTimeout(() => {
      setResults(allResults);
      setSimulationLoading(false); // ✅ Turn off simulation loading
    }, delay);
  } catch (err) {
    setError("An error occurred during simulation.");
    console.error("Simulation error:", err);
    setSimulationLoading(false); // ✅ Turn off simulation loading on error
  }

  if (onSimulate) onSimulate(filteredScenarios);
};

  // Handle input changes for scenarios
  const handleInputChange = (index, value) => {
    const updated = [...scenarios];
    updated[index] = value;
    setScenarios(updated);
  };

  const handleAddScenario = () => setScenarios([...scenarios, ""]);

  const handleRemoveScenario = (index) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter((_, i) => i !== index));
    }
  };

  // If subscriptions is undefined, show loading state
 if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-blue-300 dark:bg-blue-700 rounded" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-blue-500/50 rounded-lg p-6 border text-gray-900 dark:text-white mt-8">
        <div
          className="flex justify-between items-center cursor-pointer p-3 bg-white rounded-md dark:bg-gray-800"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h2 className="text-xl font-semibold  text-green-500 dark:text-green-500">Scenario Input</h2>
          <span className="text-blue-500 dark:text-blue-300 font-medium">
            {isOpen ? <ChevronUp /> : <ChevronRight />}
          </span>
        </div>

        {isOpen && (
          <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 transition-all duration-300 max-h-[300px] opacity-100 mt-4">
            {scenarios.map((scenario, index) => (
              <div key={index} className="mb-4 p-4 rounded-lg shadow-sm border border-gray-300">
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={scenario}
                  placeholder="Describe your scenario here..."
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
                {scenarios.length > 1 && (
                  <button
                    onClick={() => handleRemoveScenario(index)}
                    className="text-red-600 hover:text-red-800 mt-2"
                    aria-label={`Remove scenario ${index + 1}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddScenario}
              className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              + Add Scenario
            </button>
          </div>
        )}

        {/* Enhanced Tier-Based Simulation Button */}
        <button
          className={`
            relative w-full mt-6 rounded-lg py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2
            ${isFreeTier 
              ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 cursor-pointer' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 active:scale-95'
            }
            ${simulationLoading ? 'opacity-70 cursor-not-allowed' : ''}
          `}
          onClick={handleSimulate}
          disabled={simulationLoading}
        >
          {simulationLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Simulating...</span>
            </>
          ) : isFreeTier && trialExpired ? (
            <>
              <Lock className="w-5 h-5" />
              <span>Unlock Simulations (Pro or Enterprise Required)</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Run Simulation</span>
            </>
          )}
          
          {/* Premium badge for paid users */}
          {isPaidTier && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              {userTier.toUpperCase()}
            </span>
          )}
        </button>

        {/* Error message */}
        {error && (
          <p className="mt-4 text-red-600 font-semibold">
            {error}
          </p>
        )}
      </div>

      {/* Enhanced Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md mx-4 relative">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Unlock Simulations
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Upgrade to Pro or Enterprise to access advanced simulation features and unlock your full potential.
              </p>
              
              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Unlimited simulations
                </div>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Advanced analytics
                </div>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Priority support
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Maybe Later
                </button>
                <button 
                  onClick={() => {
                    window.location.href = "/payments";
                    setShowUpgradeModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Fixed Results and loading skeleton logic */}
      {simulationLoading ? (
        <div className="mt-12">
          <div className="bg-white dark:bg-gray-800 shadow-lg border rounded-lg p-6 text-gray-900 dark:text-white">
            <h3 className="text-lg font-semibold mb-4 text-green-500">
              Analyzing Scenarios...
            </h3>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse space-y-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-500 rounded w-full" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-500 rounded w-5/6" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-500 rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : results.length > 0 ? (
        <div className="mt-12">
          <ScenarioSimulationCard results={results} />
        </div>
      ) : null}
    </>
  );
}