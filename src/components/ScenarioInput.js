import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import html2pdf from "html2pdf.js";
import "highlight.js/styles/github-dark.css";
import { saveUserInteraction } from "../services/userBehaviourService";
import { useMemory } from "../MemoryContext";
import { db } from "../firebase";
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
  where,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { ChevronRight, ChevronUp, Lock, Play, Crown, FileText, Copy, Undo, Redo, Download, Type } from "lucide-react";
import ScenarioSimulationCard from "./SimulationResult";

// Enhanced InputPreview component with right-side preview and all features integrated
const EnhancedInputPreview = ({ value, onChange, placeholder = "Type your scenario here..." }) => {
  const [history, setHistory] = useState([value || ""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const previewRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize history when value changes from parent
  useEffect(() => {
    if (value !== history[historyIndex]) {
      setHistory([value || ""]);
      setHistoryIndex(0);
    }
  }, []);

  // Update input and version history
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    // Update parent component
    onChange(newValue);
    
    // Update history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Export preview as PDF
  const handleExportPDF = () => {
    if (previewRef.current) {
      const opt = {
        margin: 1,
        filename: 'scenario-preview.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(previewRef.current).save();
    }
  };

  // Copy input markdown to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
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
      onChange(previousValue);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextValue = history[historyIndex + 1];
      onChange(nextValue);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Calculate word and character counts
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = value ? value.length : 0;

  return (
    <div className="space-y-4">
      {/* Toolbar with all features */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
            Undo
          </button>
          
          <button
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
            Redo
          </button>
          
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
              showCopySuccess 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
            {showCopySuccess ? 'Copied!' : 'Copy'}
          </button>
          
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            title="Export preview as PDF"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Type className="w-4 h-4" />
            {wordCount} words
          </span>
          <span>{charCount} characters</span>
        </div>
      </div>

      {/* Side-by-side Editor and Preview - Fixed Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-[400px]">
        {/* Input Section - Left Side */}
        <div className="flex flex-col space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            <FileText className="w-4 h-4 inline mr-2" />
            Scenario Input (Markdown Supported)
          </label>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            className="flex-1 w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[350px]"
            placeholder={placeholder}
            spellCheck="false"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            💡 Tip: Use markdown formatting like **bold**, *italic*, # headers, - lists, etc.
          </div>
        </div>

        {/* Live Preview Section - Right Side */}
        <div className="flex flex-col space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            <span className="flex items-center gap-2">
              Live Preview
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                Real-time
              </span>
            </span>
          </label>
          <div
            ref={previewRef}
            className="flex-1 p-4 overflow-y-auto border-2 border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-gray-900 prose prose-sm dark:prose-invert max-w-none min-h-[350px]"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E0 transparent'
            }}
          >
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                components={{
                  // Custom styling for better preview
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="mb-3 pl-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="mb-3 pl-4" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-400 pl-4 italic my-4" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline ? 
                      <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm" {...props} /> :
                      <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto" {...props} />
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 italic text-center">
                <div className="mb-4">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Start typing to see your live preview...</p>
                </div>
                <div className="text-xs text-left bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-semibold mb-2">Try some markdown:</div>
                  <div className="font-mono space-y-1">
                    <div># Heading</div>
                    <div>**Bold text**</div>
                    <div>*Italic text*</div>
                    <div>- List item</div>
                    <div>&gt; Quote</div>
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

// Main ScenarioInput component
export default function ScenarioInput({ onSimulate }) {
  const [scenarios, setScenarios] = useState([""]);
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

    const filteredScenarios = scenarios.filter((s) => s.trim() !== "");
    if (!filteredScenarios.length) return;

    console.log("📊 Simulating scenarios:", filteredScenarios);
    await saveUserInteraction(user.uid, "simulate_scenario", { scenarios: filteredScenarios });
    await loadUserInteractions();

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
        setSimulationLoading(false);
      }, delay);
    } catch (err) {
      setError("An error occurred during simulation.");
      console.error("Simulation error:", err);
      setSimulationLoading(false);
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
    <div className="flex flex-col md:flex-row gap-4 w-full ">
      <div className="bg-white dark:bg-gray-800 shadow-lg flex-1 hover:shadow-blue-500/50 rounded-lg p-6 border text-gray-900 dark:text-white mt-8">
        <div
          className="flex justify-between items-center cursor-pointer p-3 bg-white rounded-md dark:bg-gray-800"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h2 className="text-xl font-semibold text-green-500 dark:text-green-500">Scenario Input</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
              Markdown Enabled
            </span>
            <span className="text-blue-500 dark:text-blue-300 font-medium">
              {isOpen ? <ChevronUp /> : <ChevronRight />}
            </span>
          </div>
        </div>

        {isOpen && (
          <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 transition-all duration-300 max-h-[800px] opacity-100 mt-4">
            {scenarios.map((scenario, index) => (
              <div key={index} className="mb-8 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    Scenario {index + 1}
                  </h4>
                  {scenarios.length > 1 && (
                    <button
                      onClick={() => handleRemoveScenario(index)}
                      className="text-red-500 hover:text-red-700 px-3 py-1 text-sm font-medium border border-red-300 rounded-lg hover:border-red-500 transition-colors"
                      aria-label={`Remove scenario ${index + 1}`}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <EnhancedInputPreview
                  value={scenario}
                  onChange={(value) => handleInputChange(index, value)}
                  placeholder={`Describe scenario ${index + 1} here... You can use markdown formatting like **bold**, *italic*, # headings, - lists, etc.`}
                />
              </div>
            ))}
            
            <button
              onClick={handleAddScenario}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Another Scenario
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

      {/* Results and loading skeleton logic */}
        {/* Right: Scenario Output or Simulation Results */}
  <div className="flex-1">
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
    </div>
  </div>
    </>
  );
}