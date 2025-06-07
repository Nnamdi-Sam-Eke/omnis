import { useState, useEffect } from "react";
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
import { ChevronRight, ChevronUp } from "lucide-react";
import ScenarioSimulationCard from "./SimulationResult";

// Component to simulate multiple scenarios and store the results in memory
export default function ScenarioInput({ onSimulate }) {
  const [scenarios, setScenarios] = useState([""]);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { memory, saveToFirestore } = useMemory(); // ✅ AI Memory Hook
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]); // ✅ Store previous interactions
  const [userInteractions, setUserInteractions] = useState([]); // ✅ Store user interactions
  const [trialExpired, setTrialExpired] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth(); // ✅ Get current user
  const [discountDeadline, setDiscountDeadline] = useState(null);
  // ✅ Get current user from Auth context
  

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
    const tier = userData.subscriptionTier || "free";
    const trialStart = userData.trialStartedAt?.toDate?.();
    const now = new Date();

    if (tier === "free") {
      if (!trialStart) {
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
      } else {
        const trialEnd = new Date(trialStart);
        trialEnd.setDate(trialEnd.getDate() + 7);

        if (now > trialEnd) {
          setTrialExpired(true);
          setShowUpgradeModal(true);

          // Handle discount availability
          const discountDeadline = userData.discountAvailableUntil?.toDate?.();
          if (!discountDeadline || now > discountDeadline) {
            const newDiscountEnd = new Date();
            newDiscountEnd.setDate(now.getDate() + 7);

            const discountEndTimestamp = Timestamp.fromDate(newDiscountEnd);
            await setDoc(userRef, { discountAvailableUntil: discountEndTimestamp }, { merge: true });
            setDiscountDeadline(newDiscountEnd);
          } else {
            setDiscountDeadline(discountDeadline);
          }
        } else {
          setTrialExpired(false);
          setShowUpgradeModal(false);
        }
      }
    } else {
      // User is not on a free tier
      setTrialExpired(false);
      setShowUpgradeModal(false);
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

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      subscriptionTier: "free",
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

  setLoading(true);
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
      setLoading(false);
    }, delay);
  } catch (err) {
    setError("An error occurred during simulation.");
    console.error("Simulation error:", err);
    setLoading(false);
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

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-blue-500/50 rounded-lg p-6 border text-gray-900 dark:text-white mt-8">
        <div
          className="flex justify-between items-center cursor-pointer p-3 bg-white rounded-md dark:bg-gray-800"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-300">Scenario Input</h2>
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

        {/* Simulation button - disabled if trial expired */}
        <button
          className={`w-full mt-6 rounded-lg py-3 font-semibold ${
            trialExpired ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-800"
          } text-white transition`}
          onClick={handleSimulate}
          disabled={loading || trialExpired}
        >
          {trialExpired ? "Upgrade to Continue Simulations" : loading ? "Simulating..." : "Simulate"}
        </button>

        {/* Error message */}
        {error && (
          <p className="mt-4 text-red-600 font-semibold">
            {error}
          </p>
        )}
      </div>


      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md text-center">
            <h3 className="text-xl font-bold mb-4 text-blue-600">Upgrade Available!</h3>
            <p className="mb-4 dark:text-gray-300">Your 7-day free multi-path simulation trial has ended.</p>
            <p className="mb-6 dark:text-gray-300">
              Get a 20% discount if you upgrade within the next 7 days.
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-6 rounded font-semibold"
              onClick={() => {
                // Link to upgrade page or open subscription modal
                window.location.href = "/pricing";
              }}
            >
              Upgrade Now
            </button>
            <button
              className="mt-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              onClick={() => setShowUpgradeModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Results and loading skeleton */}
      {loading ? (
        <div className="mt-12">
          <div className="bg-white dark:bg-gray-800 shadow-lg border rounded-lg p-6 text-gray-900 dark:text-white">
            <div className="space-y-4 mt-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse space-y-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-500 rounded w-full" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-500 rounded w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        results.length > 0 && (
          <div className="mt-12">
            <ScenarioSimulationCard results={results} />
          </div>
        )
      )}
    </>
  );
}