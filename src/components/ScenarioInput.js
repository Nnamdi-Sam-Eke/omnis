import React, { useState, useEffect, useRef } from "react";
import { saveUserInteraction } from "../services/userBehaviourService";
import { useMemory } from "../MemoryContext";
import { db } from "../firebase";
import { Trash2, Plus, Target, Tag } from "lucide-react";
import { generateOmnisContent } from "../services/omnis-actions";
import {
  writeBatch,
  doc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  setDoc,
  getDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

import { useAuth } from "../AuthContext";
import { ChevronRight, ChevronUp, Lock, Crown, Copy, Undo, Redo, Type, Sparkles, Edit3, Zap } from "lucide-react";
import ScenarioSimulationCard from "./SimulationResult";
import ShimmerLoader from "./ShimmerLoader";

const BACKEND_URL = process.env.NODE_ENV === "development"
  ? "http://localhost:8000/run"
  : "https://your-production-backend.com/run";

// Simplified InputForm component without markdown
const SimplifiedInputForm = ({ scenario, onScenarioChange, onCategoryChange, placeholder = "Type your scenario here..." }) => {
  const [history, setHistory] = useState([scenario?.text || ""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const textareaRef = useRef(null);

  // Initialize history when value changes from parent
  useEffect(() => {
    if (scenario?.text !== history[historyIndex]) {
      setHistory([scenario?.text || ""]);
      setHistoryIndex(0);
    }
  }, []);

  // Update input and version history
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    // Update parent component
    onScenarioChange({ ...scenario, text: newValue });
    
    // Update history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    onCategoryChange({ ...scenario, category: newCategory });
  };

  // Copy input text to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scenario?.text || "");
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
      }
    }
  };

  // Undo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      const previousValue = history[historyIndex - 1];
      onScenarioChange({ ...scenario, text: previousValue });
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextValue = history[historyIndex + 1];
      onScenarioChange({ ...scenario, text: nextValue });
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Calculate word and character counts
  const wordCount = scenario?.text ? scenario.text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = scenario?.text ? scenario.text.length : 0;

  return (
    <div className="space-y-6">
      {/* Modern Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="group flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Undo</span>
          </button>
          
          <button
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
            className="group flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Redo</span>
          </button>
          
          <button
            onClick={handleCopy}
            className={`group flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
              showCopySuccess 
                ? 'bg-emerald-500 text-white shadow-emerald-500/25' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
            }`}
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>{showCopySuccess ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Type className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{wordCount}</span>
            <span className="text-slate-400">words</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="font-medium">{charCount}</span>
            <span className="text-slate-400">chars</span>
          </div>
        </div>
      </div>

      {/* Category and Input Form */}
      <div className="space-y-4">
        {/* Category Input */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-sm font-medium">
              <Tag className="w-4 h-4" />
              <span>Category</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600"></div>
          </div>
          
          <div className="relative group">
            <input
              type="text"
              value={scenario?.category || ""}
              onChange={handleCategoryChange}
              className="w-full p-4 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-slate-400 dark:group-hover:border-slate-500 shadow-lg"
              placeholder="e.g., Business Strategy, Risk Assessment, Market Analysis..."
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </div>
        </div>

        {/* Scenario Input */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium">
              <Edit3 className="w-4 h-4" />
              <span>Scenario</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600"></div>
          </div>
          
          <div className="relative group">
            <textarea
              ref={textareaRef}
              value={scenario?.text || ""}
              onChange={handleInputChange}
              className="w-full p-6 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[200px] group-hover:border-slate-400 dark:group-hover:border-slate-500 shadow-lg"
              placeholder={placeholder}
              spellCheck="false"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Describe your scenario in detail for better analysis results.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main ScenarioInput component with updated structure
export default function ScenarioInput({ onSimulate }) {
  const [scenarios, setScenarios] = useState([{ text: "", category: "" }]);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const { memory, saveToFirestore } = useMemory();
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInteractions, setUserInteractions] = useState([]);
  const [trialExpired, setTrialExpired] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth();
  const [discountDeadline, setDiscountDeadline] = useState(null);
  const [loading, setLoading] = React.useState(true);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationInput, setSimulationInput] = useState(""); // NEW: For Gemini prompt
  const [generatedResults, setGeneratedResults] = useState([]); // NEW: For Gemini output
  const [isSimulating, setIsSimulating] = useState(false); // NEW: Simulate loading per scenario
  const [isModalOpen, setIsModalOpen] = useState(false); // Add this state if not present
  
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
      loadUserInteractions();
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

  const loadUserInteractions = async () => {
    if (!user) return;
    try {
      const userInteractionsRef = collection(db, 'userInteractions');
      const q = query(
        userInteractionsRef, 
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
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

      if (tier !== "free") {
        setTrialExpired(false);
        setShowUpgradeModal(false);
        console.log("✅ User is on paid tier:", tier);
        return;
      }

      const trialStart = userData.trialStartedAt?.toDate?.() || user.trialStartedAt?.toDate?.();

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
        console.log("🎉 Trial started");
      } else {
        const trialEnd = new Date(trialStart);
        trialEnd.setDate(trialEnd.getDate() + 7);

        if (now > trialEnd) {
          setTrialExpired(true);
          setShowUpgradeModal(true);

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
          setTrialExpired(false);
          setShowUpgradeModal(false);
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

  const handleScenarioSubmit = async (query, response, category) => {
    try {
      const historyEntry = {
        query,
        response,
        category, // Include category in the database entry
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(db, "users", user.uid, "userInteractions"), historyEntry);
      setChatHistory((prev) => [...prev, historyEntry]);
      console.log("✅ History saved with category!");
    } catch (error) {
      console.error("❌ Error saving history:", error);
    }
  };

  // --- Updated: Handle Run Simulation with Gemini ---
  const handleSimulate = async () => {
    if (!user) {
      setError("Please log in to run simulations.");
      return;
    }

    if (isFreeTier && trialExpired) {
      setShowUpgradeModal(true);
      return;
    }

    // Get all non-empty scenarios
    const filteredScenarios = scenarios.filter((s) => s.text.trim() !== "");
    if (!filteredScenarios.length) {
      setError("Please provide at least one valid scenario.");
      return;
    }

    setSimulationLoading(true);
    setError(null);

    try {
      // Send all scenarios to Gemini and collect results
      const results = await Promise.all(
        filteredScenarios.map(async (scenario) => {
          if (!scenario.text || scenario.text.trim() === "") {
            throw new Error("Invalid or missing prompt");
          }
          console.log('Submitting prompt:', scenario.text);
          let content = "";
          await generateOmnisContent(scenario.text, (c) => {
            content = c;
          });

          return {
            query: scenario.text,
            category: scenario.category,
            response: { result: content, task: "Generated Content" },
          };
        })
      );

      // Store in batches
      await storeResultsInBatches(results, user, db, 5);

      setGeneratedResults(results);
      setSimulationInput(filteredScenarios.map(s => s.text).join("\n"));
      setIsModalOpen(true);
    } catch (error) {
      console.error("Simulation error:", error);
      setError(error.message || "Failed to run simulation. Please try again.");
    } finally {
      setSimulationLoading(false);
    }
  };

  // --- Updated: Simulate function (per-scenario) ---
  const handleSimulateScenario = async (scenario, index) => {
    try {
      setIsSimulating(true);

      if (!scenario.text || scenario.text.trim() === "") {
        throw new Error("Invalid or missing prompt");
      }
      console.log('Submitting scenario prompt:', scenario.text);

      // Call Omnis Gemini action
      const content = await generateOmnisContent(scenario.text);

      // Store result tied to this scenario
      setGeneratedResults((prev) => [
        ...prev,
        {
          input: scenario.text,
          category: scenario.category,
          output: content,
          index,
        },
      ]);

      // Save to Firestore
      await handleScenarioSubmit(scenario.text, content, scenario.category);
    } catch (error) {
      console.error("Error simulating scenario:", error);
      setError(error.message || "Failed to simulate scenario. Please try again.");
    } finally {
      setIsSimulating(false);
    }
  };

  // Handle scenario changes (both text and category)
  const handleScenarioChange = (index, updatedScenario) => {
    const updated = [...scenarios];
    updated[index] = updatedScenario;
    setScenarios(updated);
  };

  const handleAddScenario = () => setScenarios([...scenarios, { text: "", category: "" }]);

  const handleRemoveScenario = (index) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter((_, i) => i !== index));
    }
  };

  // helper to split results into chunks of size N
  function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // batching logic (configurable batch size)
  async function storeResultsInBatches(results, user, db, batchSize = 5) {
    const chunks = chunkArray(results, batchSize);

    for (const group of chunks) {
      const batch = writeBatch(db);

      group.forEach((newResult) => {
        const ref = doc(collection(db, "userInteractions")); // auto-ID
        batch.set(ref, {
          ...newResult,
          userId: user?.uid,
          timestamp: new Date(),
        });
      });

      await batch.commit(); // commit one group at a time
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <ShimmerLoader height="h-32" width="w-full" rounded="rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-8 w-full max-w-7xl mx-auto">
        {/* Left Panel - Scenario Input */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
            {/* Header */}
            <div 
              className="flex justify-between items-center cursor-pointer p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Scenario Builder</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create and simulate categorized scenarios</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    Ready
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {/* Collapsible Content */}
            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[610px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
              <div className="p-6 space-y-6">
                {/* Scenarios List */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {scenarios.map((scenario, index) => (
                    <div key={index} className="group relative">
                      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
                        {/* Scenario Header */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                              {index + 1}
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                              Scenario {index + 1}
                            </h4>
                            {scenario.category && (
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                                {scenario.category}
                              </span>
                            )}
                          </div>
                          
                          {scenarios.length > 1 && (
                            <button
                              onClick={() => handleRemoveScenario(index)}
                              className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                              aria-label={`Remove scenario ${index + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Input Form */}
                        <SimplifiedInputForm
                          scenario={scenario}
                          onScenarioChange={(updatedScenario) => handleScenarioChange(index, updatedScenario)}
                          onCategoryChange={(updatedScenario) => handleScenarioChange(index, updatedScenario)}
                          placeholder={`Describe scenario ${index + 1}... Be detailed for better analysis.`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Add Scenario Button */}
                <button
                  onClick={handleAddScenario}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Add New Scenario
                </button>
              </div>
            </div>

            {/* Simulation Button */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700">
              <button
                className={`
                  relative w-full rounded-xl py-4 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl
                  ${isFreeTier && trialExpired
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white transform hover:scale-[1.02] active:scale-[0.98]'
                  }
                  ${simulationLoading ? 'opacity-70 cursor-not-allowed' : ''}
                `}
                onClick={handleSimulate}
                disabled={simulationLoading}
              >
                {simulationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Analyzing Scenarios...</span>
                  </>
                ) : isFreeTier && trialExpired ? (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Unlock Advanced Simulations</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Run Simulation</span>
                  </>
                )}
                
                {/* Tier Badge */}
                {isPaidTier && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                    {userTier.toUpperCase()}
                  </div>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 font-medium text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 min-w-0">
          {simulationLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Processing Scenarios...
                </h3>
              </div>
              <div className="space-y-4">
                {[...Array(scenarios.length)].map((_, i) => (
                  <div key={i} className="space-y-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <ShimmerLoader height="h-4" width="w-2/3" rounded="rounded-md" />
                    <ShimmerLoader height="h-3" width="w-full" rounded="rounded-md" />
                    <ShimmerLoader height="h-3" width="w-5/6" rounded="rounded-md" />
                    <ShimmerLoader height="h-6" width="w-3/4" rounded="rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ) : generatedResults.length > 0 ? (
            // Pass generatedResults and simulationInput to ScenarioSimulationCard
            <ScenarioSimulationCard results={generatedResults} simulationInput={simulationInput} />
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ready for Simulation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Add your categorized scenarios and click "Run Simulation" to see results here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full mx-4 relative shadow-2xl border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
            
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Unlock Advanced Simulations
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Upgrade to Pro or Enterprise to access unlimited simulations and advanced features.
              </p>
              
              <div className="space-y-4 mb-8 text-left">
                {['Unlimited simulations', 'Advanced analytics & insights', 'Priority support & faster processing', 'Custom scenario templates'].map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mr-3 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Maybe Later
                </button>
                <button 
                  onClick={() => {
                    window.location.href = "/payments";
                    setShowUpgradeModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgb(156 163 175);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgb(107 114 128);
        }
      `}</style>
    </>
  );
}