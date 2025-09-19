import React, { useState, useEffect , useRef } from "react";
import { FiThumbsUp, FiThumbsDown, FiHelpCircle, FiX, FiGitBranch, FiLock } from "react-icons/fi";
import { motion, AnimatePresence } from 'framer-motion';
// Simple Branching Visualization Component
import BranchingVisualization from "./BranchingVisualization";
import { generateOmnisContent, expandOmnisText } from "../services/omnis-actions";

const ScenarioSimulationCard = ({ results, setResults, loading, simulationInput }) => {
  // Mock the useOmnisContext hook since it's not available
  const addFeedback = (timestamp, feedback) => {
    console.log(`Adding feedback: ${timestamp} - ${feedback}`);
  };
 const [toastMessage, setToastMessage] = useState(null);
  const [clickedButtons, setClickedButtons] = useState({});
  const [localResults, setLocalResults] = useState(results || []);
  const [rawResults, setRawResults] = useState({}); // Store raw results from /run
  const [narrativeCache, setNarrativeCache] = useState({}); // Cache narratives
  const [explanationModal, setExplanationModal] = useState({
    isOpen: false,
    content: '',
    loading: false,
    error: null,
    timestamp: null
  });

  // NEW: Branching modal state
  const [showBranchingModal, setShowBranchingModal] = useState(false);
  const [branchingData, setBranchingData] = useState(null);
  const [isBranchingLoading, setIsBranchingLoading] = useState(false);

  // Text-to-speech state
  const [speechState, setSpeechState] = useState({
    isSpeaking: false,
    selectedVoice: null,
    speechRate: 1,
    availableVoices: [],
    currentSentenceIndex: -1,
    sentences: []
  });

  // Export and tagging state
  const [exportState, setExportState] = useState({
    showTagInput: false,
    customTags: '',
    suggestedTags: []
  });

  // Mobile modal state - Updated for better mobile handling
  const [modalState, setModalState] = useState({
    currentSection: 'content', // 'controls', 'content', 'export'
    isMobile: false,
    showFullscreenMode: false
  });

  const handleExportReportClick = () => {
    setToastMessage("Branching paths under development, try again soon.");
    setTimeout(() => setToastMessage(""), 4000);
  };
  // NEW: Handle explore branches functionality
  const handleExploreBranches = async () => {
    try {
      setIsBranchingLoading(true);
      const response = await fetch("http://localhost:8000/branch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: simulationInput,
          num_paths: 6,
        }),
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value);
      }
      
      const lines = fullText.split("data: ").filter(Boolean);
      const parsedResults = lines.map(line => JSON.parse(line.trim()));
      
      const toTree = (nodes, index = 0) => {
        const base = nodes[index];
        const children = nodes.slice(index + 1).map((n, i) => ({
          ...n,
          children: [],
          summary: n.label,
          recommended: n.recommended,
          anomaly: n.anomaly_flagged,
        }));
        return {
          summary: base.label,
          recommended: base.recommended,
          anomaly: base.anomaly_flagged,
          children,
        };
      };
      
      const rootNode = toTree(parsedResults);
      setBranchingData(rootNode);
      setShowBranchingModal(true);
    } catch (err) {
      console.error("Branching error:", err);
    } finally {
      setIsBranchingLoading(false);
    }
  };

   useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load available voices and detect screen size
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
      setSpeechState(prev => ({
        ...prev,
        availableVoices: englishVoices,
        selectedVoice: englishVoices.find(voice => voice.default) || englishVoices[0] || null
      }));
    };

    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768;
      setModalState(prev => ({ ...prev, isMobile }));
    };

    loadVoices();
    checkScreenSize();
    
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }
    
    window.addEventListener('resize', checkScreenSize);

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      }
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Update local results when props change
  useEffect(() => {
    setLocalResults(results || []);
    
    // Store raw results for later narration
    if (results && Array.isArray(results)) {
      const rawData = {};
      results.forEach((result, index) => {
        const timestamp = result?.timestamp || index;
        rawData[timestamp] = result;
      });
      setRawResults(rawData);
    }
  }, [results]);

  // Text-to-speech functions
  function splitIntoSentences(text) {
    // Clean the text and split into sentences
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n+/g, ' ');
    const sentences = cleanText.match(/[^\.!?]+[\.!?]+/g) || [cleanText];
    return sentences.map(s => s.trim()).filter(s => s.length > 0);
  }

  function generateSuggestedTags(content, result) {
    const tags = [];
    
    // Time-based tags
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    tags.push(`#Q${quarter}`, `#${now.getFullYear()}`);
    
    // Content-based tags
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('cost') || lowerContent.includes('saving') || lowerContent.includes('budget')) {
      tags.push('#cost-savings');
    }
    if (lowerContent.includes('risk') || lowerContent.includes('threat')) {
      tags.push('#risk-analysis');
    }
    if (lowerContent.includes('recommend') || lowerContent.includes('suggest')) {
      tags.push('#recommendations');
    }
    if (lowerContent.includes('predict') || lowerContent.includes('forecast')) {
      tags.push('#predictions');
    }
    if (lowerContent.includes('anomaly') || lowerContent.includes('unusual')) {
      tags.push('#anomaly-detection');
    }
    
    // Confidence-based tags
    if (lowerContent.includes('uncertain') || lowerContent.includes('might') || lowerContent.includes('possibly')) {
      tags.push('#low-confidence');
    } else if (lowerContent.includes('certain') || lowerContent.includes('definitely') || lowerContent.includes('confirmed')) {
      tags.push('#high-confidence');
    }
    
    // Result-based tags
    if (result?.error) {
      tags.push('#error', '#needs-review');
    } else if (result?.response?.task) {
      const task = result.response.task.toLowerCase();
      if (task.includes('analysis')) tags.push('#analysis');
      if (task.includes('optimization')) tags.push('#optimization');
      if (task.includes('simulation')) tags.push('#simulation');
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }

  function speakNarrative(text) {
    if (!window.speechSynthesis) {
      alert("Your browser doesn't support speech synthesis.");
      return;
    }
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Split into sentences and prepare for highlighting
    const sentences = splitIntoSentences(text);
    setSpeechState(prev => ({ ...prev, sentences, currentSentenceIndex: 0 }));
    
    let currentIndex = 0;
    
    function speakSentence(index) {
      if (index >= sentences.length) {
        setSpeechState(prev => ({ ...prev, isSpeaking: false, currentSentenceIndex: -1 }));
        return;
      }
      
      setSpeechState(prev => ({ ...prev, currentSentenceIndex: index }));
      
      const utterance = new SpeechSynthesisUtterance(sentences[index]);
      utterance.lang = "en-US";
      utterance.rate = speechState.speechRate;
      utterance.pitch = 1;
      
      if (speechState.selectedVoice) {
        utterance.voice = speechState.selectedVoice;
      }
      
      utterance.onend = () => {
        speakSentence(index + 1);
      };
      
      utterance.onerror = () => {
        setSpeechState(prev => ({ ...prev, isSpeaking: false, currentSentenceIndex: -1 }));
      };
      
      window.speechSynthesis.speak(utterance);
    }
    
    setSpeechState(prev => ({ ...prev, isSpeaking: true }));
    speakSentence(0);
  }

  function stopNarration() {
    window.speechSynthesis.cancel();
    setSpeechState(prev => ({ ...prev, isSpeaking: false, currentSentenceIndex: -1 }));
  }

  function exportAsMarkdown(content, tags = [], result = null) {
    const timestamp = new Date().toISOString();
    const query = result?.query || 'Unknown Query';
    
    const markdown = `# Scenario Analysis Report

**Query:** ${query}
**Generated:** ${new Date().toLocaleString()}
**Tags:** ${tags.join(' ')}

---

## Detailed Explanation

${content}

---

## Raw Data
\`\`\`json
${JSON.stringify(result, null, 2)}
\`\`\`

---
*Generated by Scenario Simulation Tool*
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-report-${timestamp.split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportAsPDF(content, tags = [], result = null) {
    // Create a printable HTML version
    const timestamp = new Date().toISOString();
    const query = result?.query || 'Unknown Query';
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Scenario Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .tags { background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .tag { background: #007acc; color: white; padding: 2px 8px; border-radius: 3px; margin-right: 5px; font-size: 0.9em; }
        .content { margin: 20px 0; }
        .raw-data { background: #f8f8f8; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 0.9em; }
        @media print {
            body { print-color-adjust: exact; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Scenario Analysis Report</h1>
        <p><strong>Query:</strong> ${query}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <div class="tags">
            <strong>Tags:</strong> ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    </div>
    
    <div class="content">
        <h2>Detailed Explanation</h2>
        <div>${content.replace(/\n/g, '<br>')}</div>
    </div>
    
    <div class="raw-data">
        <h3>Raw Data</h3>
        <pre>${JSON.stringify(result, null, 2)}</pre>
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; color: #666; font-size: 0.9em;">
        <em>Generated by Scenario Simulation Tool</em>
    </div>
</body>
</html>`;

    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.print();
  }

  const handleReset = () => {
    // Simply clear the local results to hide the component content
    setLocalResults([]);
    if (setResults) {
      setResults([]);
    }
  };

  const handleExplainFurther = async (result, timestamp) => {
    // Check cache first
    if (narrativeCache[timestamp]) {
      const tags = generateSuggestedTags(narrativeCache[timestamp], result);
      setExportState(prev => ({ ...prev, suggestedTags: tags }));
      setExplanationModal({
        isOpen: true,
        content: narrativeCache[timestamp],
        loading: false,
        error: null,
        timestamp: timestamp
      });
      return;
    }

    setExplanationModal({
      isOpen: true,
      content: '',
      loading: true,
      error: null,
      timestamp: timestamp
    });

    try {
      // Get the raw result data
      const rawResult = rawResults[timestamp] || result;
      
      const response = await fetch('http://localhost:8000/narrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result.response)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const narrative = data.narrative || data.explanation || data.message || 'No explanation provided.';
      
      // Generate suggested tags
      const tags = generateSuggestedTags(narrative, result);
      setExportState(prev => ({ ...prev, suggestedTags: tags }));
      
      // Cache the narrative
      setNarrativeCache(prev => ({
        ...prev,
        [timestamp]: narrative
      }));
      
      setExplanationModal(prev => ({
        ...prev,
        loading: false,
        content: narrative,
        error: null
      }));
    } catch (error) {
      console.error('Error fetching explanation:', error);
      setExplanationModal(prev => ({
        ...prev,
        loading: false,
        error: `Failed to fetch explanation: ${error.message}`,
        content: ''
      }));
    }
  };

  const closeModal = () => {
    // Stop any ongoing speech when closing modal
    stopNarration();
    setExplanationModal({
      isOpen: false,
      content: '',
      loading: false,
      error: null,
      timestamp: null
    });
    setExportState({
      showTagInput: false,
      customTags: '',
      suggestedTags: []
    });
    setModalState(prev => ({ 
      ...prev, 
      currentSection: 'content',
      showFullscreenMode: false 
    }));
  };

  const navigateModalSection = (direction) => {
    const sections = ['controls', 'content', 'export'];
    const currentIndex = sections.indexOf(modalState.currentSection);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % sections.length;
    } else {
      newIndex = currentIndex === 0 ? sections.length - 1 : currentIndex - 1;
    }
    
    setModalState(prev => ({ ...prev, currentSection: sections[newIndex] }));
  };

  const toggleFullscreen = () => {
    setModalState(prev => ({ ...prev, showFullscreenMode: !prev.showFullscreenMode }));
  };

  // NEW: State for generated content and expanded content
  const [generatedContent, setGeneratedContent] = useState("");
  const [expandedContent, setExpandedContent] = useState("");

  // --- Hook up generateOmnisContent to display result in output component ---
  useEffect(() => {
    if (simulationInput) {
      generateOmnisContent(simulationInput, (content) => {
        setGeneratedContent(content);
        // Optionally update localResults to show in output card
        setLocalResults([{ query: simulationInput, response: { result: content, task: "Generated Content" }, timestamp: Date.now() }]);
        if (setResults) setResults([{ query: simulationInput, response: { result: content, task: "Generated Content" }, timestamp: Date.now() }]);
      });
    }
  }, [simulationInput]);

  // --- Hook up expandOmnisText to Expand button ---
  const handleExpandClick = (result, timestamp) => {
    setExplanationModal({
      isOpen: true,
      content: '',
      loading: true,
      error: null,
      timestamp: timestamp
    });

    expandOmnisText((expanded) => {
      setExpandedContent(expanded);
      setExplanationModal(prev => ({
        ...prev,
        loading: false,
        content: expanded,
        error: null
      }));
    });
  };

  if (!localResults || localResults.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/20 rounded-2xl p-8 text-slate-900 dark:text-white transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">⚡</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Scenario Output</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl opacity-50">📊</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">No results to display.</p>
        </div>
      </div>
    );
  }

  const handleFeedback = (timestamp, feedback) => {
    if (!timestamp) return;

    setClickedButtons((prev) => ({ ...prev, [timestamp]: feedback }));

    setTimeout(() => {
      setClickedButtons((prev) => {
        const copy = { ...prev };
        delete copy[timestamp];
        return copy;
      });
    }, 5000);

    addFeedback(timestamp, feedback);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-slate-900 dark:text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white font-bold">⚡</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Scenario Output</h2>
        </div>
        <div className="space-y-4 mt-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex flex-col space-y-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="h-5 bg-slate-300 dark:bg-slate-600 rounded-lg w-2/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-5/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 dark:border-slate-700 rounded-2xl p-8 border border-slate-200 text-slate-900 dark:text-white col-span-2 w-full transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">⚡</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Scenario Output</h2>
          </div>
          <div className="flex items-center gap-3">
            
            {/* Responsive Reset Button */}
            <button 
              onClick={() => handleReset()}
              className="group relative flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm lg:text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              aria-label="Remove scenario simulation results"
            >
              <span className="text-xs sm:text-sm">🔄</span>
              <span className="whitespace-nowrap">Reset</span>
              <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-rose-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200 dark:scrollbar-thumb-slate-600 dark:scrollbar-track-slate-800 space-y-4 pr-2">
          {/* Show generated content in output card */}
          {generatedContent && (
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                Generated Scenario
              </h4>
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                {generatedContent}
              </div>
              {/* Expand button */}
              <button
                aria-label="Expand"
                className="group relative flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg bg-blue-500 hover:bg-blue-600 text-white mt-4"
                onClick={() => handleExpandClick({ response: { result: generatedContent, task: "Generated Content" } }, Date.now())}
              >
                <FiHelpCircle className="text-sm" />
                <span>Expand</span>
              </button>
            </div>
          )}
          {localResults.filter(Boolean).map((result, index) => {
            const timestamp = result?.timestamp || index;
            return (
              <div key={timestamp} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  {result?.query || "Unknown Query"}
                </h4>
                {result?.error ? (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <span className="text-red-500">❌</span>
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{result.error}</p>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                    {formatResponse(result?.response)}
                  </div>
                )}

                {/* Responsive Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-start gap-2 sm:gap-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <button
                    aria-label="Give positive feedback"
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm lg:text-base transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => handleFeedback(timestamp, "positive")}
                  >
                    <FiThumbsUp className="text-sm sm:text-lg" />
                    <span className="sm:hidden"></span>
                  </button>
                  
                  <button
                    aria-label="Give negative feedback"
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm lg:text-base transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleFeedback(timestamp, "negative")}
                  >
                    <FiThumbsDown className="text-sm sm:text-lg" />
                    <span className="sm:hidden"></span>
                  </button>
                  
                  {/* Responsive Explain Button */}
                  <button
                    aria-label="Explain further"
                    className={`group relative flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm lg:text-base transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex-1 sm:flex-none ${
                      narrativeCache[timestamp] 
                        ? "bg-indigo-500 hover:bg-indigo-600 text-white" 
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                    onClick={() => handleExplainFurther(result, timestamp)}
                  >
                    <FiHelpCircle className="text-sm sm:text-lg flex-shrink-0" />
                    <span className="whitespace-nowrap truncate">
                      {narrativeCache[timestamp] ? "View Explanation" : "Explain"}
                    </span>
                    <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                  </button>
                  
                  {/* Responsive Branch Button + Toast above it */}
                  <div className="relative flex flex-col items-center">
                    {/* Toast notification appears above the branch button */}
                    <AnimatePresence>
                      {toastMessage && (
                        <motion.div
                          key="toast"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                          className="z-[1000]"
                          style={{
                            position: "absolute",
                            bottom: "100%",
                            left: "50%",
                            transform: "translateX(-50%) translateY(-25px)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl p-4 max-w-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">Coming Soon</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{toastMessage}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button
                      onClick={handleExportReportClick}
                      // onClick={handleExploreBranches}
                      disabled={isBranchingLoading}
                      className={`group relative flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-purple-300 disabled:to-indigo-300 text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm lg:text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none flex-1 sm:flex-none
      ${toastMessage ? "branch-overlay-active" : ""}
    `}
    style={{ position: "relative", overflow: "hidden" }}
  >
    <FiGitBranch className="text-sm sm:text-lg flex-shrink-0" />
    <span className="whitespace-nowrap truncate">
      {isBranchingLoading ? 'Loading...' : 'Branch'}
    </span>
    {!isBranchingLoading && (
      <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
    )}
    {/* Overlay and padlock when toastMessage is active */}
    {toastMessage && (
      <>
        <span
          className="absolute inset-0 rounded-lg sm:rounded-xl bg-gray-900/60 dark:bg-gray-800/70 pointer-events-none flex items-center justify-center"
          style={{ zIndex: 2 }}
        >
          <FiLock className="text-2xl text-white opacity-90 drop-shadow-lg" />
        </span>
      </>
    )}
  </button>
</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UPDATED: Mobile-Responsive Branching Modal */}
      {showBranchingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-2 sm:p-4">
          <div className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-h-[95vh] overflow-hidden transition-all duration-300 ${
            modalState.isMobile 
              ? 'max-w-full mx-2' 
              : 'max-w-6xl mx-4'
          }`}>
            {/* Header with close button */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiGitBranch className="text-white text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white truncate">
                      Branching Simulation
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                      Explore different decision paths and outcomes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBranchingModal(false)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Close modal"
                >
                  <FiX size={modalState.isMobile ? 20 : 24} />
                </button>
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 120px)' }}>
              <div className="p-4 sm:p-6">
                {branchingData ? (
                  <div className={`${modalState.isMobile ? 'min-h-[400px]' : 'h-[500px]'}`}>
                    <BranchingVisualization treeData={branchingData} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiGitBranch className="text-2xl text-gray-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">No branching data available.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATED: Mobile-Responsive Explanation Modal */}
      {explanationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-h-[95vh] overflow-hidden relative transition-all duration-300 ${
            modalState.isMobile 
              ? `${modalState.showFullscreenMode ? 'max-w-full h-full' : 'max-w-full'} mx-2` 
              : 'max-w-4xl mx-4'
          }`}>
            
            {/* Mobile Navigation Bar - Only show on mobile */}
            {modalState.isMobile && (
              <div className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 px-4 py-2">
                <div className="flex items-center justify-between">
                  {/* Section Navigation */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateModalSection('prev')}
                      className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                      aria-label="Previous section"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button
                    >
                    
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 px-2 py-1 bg-white dark:bg-slate-800 rounded-full border">
                      {modalState.currentSection === 'controls' && '🔊 Voice'}
                      {modalState.currentSection === 'content' && '💡 Content'}
                      {modalState.currentSection === 'export' && '🏷️ Export'}
                    </div>
                    
                    <button
                      onClick={() => navigateModalSection('next')}
                      className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                      aria-label="Next section"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Mobile Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleFullscreen}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                      aria-label="Toggle fullscreen"
                    >
                      {modalState.showFullscreenMode ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6M21 3v18H3V3h18z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5v4m0-4h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      )}
                    </button>
                    
                    <button
                      onClick={closeModal}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label="Close modal"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Header */}
            {!modalState.isMobile && (
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <FiHelpCircle className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Detailed Explanation
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <FiX className="text-xl text-slate-500 dark:text-slate-400" />
                </button>
              </div>
            )}

            {/* Scrollable Content Container */}
            <div className={`overflow-y-auto ${
              modalState.isMobile 
                ? modalState.showFullscreenMode 
                  ? 'h-full' 
                  : 'max-h-[calc(95vh-120px)]'
                : 'max-h-[calc(90vh-120px)]'
            }`}>
              
              {/* Voice Controls Section - Always show on desktop, conditional on mobile */}
              <div className={`${
                modalState.isMobile && modalState.currentSection !== 'controls' ? 'hidden' : 'block'
              } ${!explanationModal.loading && !explanationModal.error && explanationModal.content ? 'block' : 'hidden'}`}>
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Voice Controls
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className={`w-2 h-2 rounded-full ${speechState.isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        {speechState.isSpeaking ? 'Speaking...' : 'Ready'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Voice:</label>
                        <select
                          value={speechState.selectedVoice?.name || ''}
                          onChange={(e) => {
                            const voice = speechState.availableVoices.find(v => v.name === e.target.value);
                            setSpeechState(prev => ({ ...prev, selectedVoice: voice }));
                          }}
                          className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {speechState.availableVoices.map((voice) => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name.split(' ')[0]} ({voice.gender || 'Unknown'})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Speed:</label>
                        <select
                          value={speechState.speechRate}
                          onChange={(e) => setSpeechState(prev => ({ ...prev, speechRate: parseFloat(e.target.value) }))}
                          className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          <option value={0.5}>🐢 Slow</option>
                          <option value={1}>🚶 Normal</option>
                          <option value={1.5}>🏃 Fast</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                      <button
                        onClick={() => speakNarrative(explanationModal.content)}
                        disabled={speechState.isSpeaking}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
                      >
                        <span className="text-lg">🔊</span>
                        {speechState.isSpeaking ? 'Speaking...' : 'Listen'}
                      </button>
                      
                      {speechState.isSpeaking && (
                        <button
                          onClick={stopNarration}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
                        >
                          <span className="text-lg">⏹</span>
                          Stop
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section - Always show on desktop, conditional on mobile */}
              <div className={`${
                modalState.isMobile && modalState.currentSection !== 'content' ? 'hidden' : 'block'
              }`}>
                <div className="p-4 sm:p-6">
                  {explanationModal.loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-t-4 border-blue-500 absolute top-0 left-0"></div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-6 text-base sm:text-lg font-medium">Thinking...</p>
                      <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Generating detailed explanation</p>
                    </div>
                  ) : explanationModal.error ? (
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <span className="text-red-500 text-xl flex-shrink-0">❌</span>
                      <div className="min-w-0">
                        <p className="font-medium text-red-800 dark:text-red-200">Error</p>
                        <p className="text-red-600 dark:text-red-400 text-sm break-words">{explanationModal.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Cache indicator */}
                      {narrativeCache[explanationModal.timestamp] && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Cached explanation</span>
                        </div>
                      )}
                      
                      {/* Main Narrative Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-white text-xs sm:text-sm">💡</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-base sm:text-lg">
                              Detailed Explanation
                            </h4>
                            <div className="prose dark:prose-invert prose-blue max-w-none prose-sm sm:prose-base">
                              <div className="text-blue-900 dark:text-blue-100 whitespace-pre-wrap leading-relaxed text-sm sm:text-base break-words">
                                {formatNarrative(explanationModal.content, speechState.currentSentenceIndex, speechState.sentences)}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Divider */}
                        <div className="my-6 border-t border-blue-200 dark:border-blue-800"></div>
                        {/* Next Step Suggestion */}
                        <div className="flex items-center gap-2 mt-4">
                          <span className="text-green-500 text-lg">➡️</span>
                          <span className="font-semibold text-green-700 dark:text-green-300">Next Step:</span>
                          <span className="text-green-700 dark:text-green-300">
                            {getNextStepSuggestion(explanationModal.content)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Export Section - Always show on desktop, conditional on mobile */}
              <div className={`${
                modalState.isMobile && modalState.currentSection !== 'export' ? 'hidden' : 'block'
              }`}>
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-t border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs sm:text-sm">🏷️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-3 text-base sm:text-lg">
                        Save & Export
                      </h4>
                      
                      {/* Suggested Tags */}
                      {exportState.suggestedTags.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">Suggested Tags:</p>
                          <div className="flex flex-wrap gap-2">
                            {exportState.suggestedTags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 sm:px-3 py-1 bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 rounded-full text-xs sm:text-sm font-medium cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-700 transition-colors break-words"
                                onClick={() => {
                                  const currentTags = exportState.customTags.split(',').map(t => t.trim()).filter(t => t);
                                  if (!currentTags.includes(tag)) {
                                    setExportState(prev => ({
                                      ...prev,
                                      customTags: currentTags.length > 0 ? `${exportState.customTags}, ${tag}` : tag
                                    }));
                                  }
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Custom Tags Input */}
                      <div className="mb-4">
                        <button
                          onClick={() => setExportState(prev => ({ ...prev, showTagInput: !prev.showTagInput }))}
                          className="text-sm text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 font-medium mb-2"
                        >
                          {exportState.showTagInput ? '− Hide' : '+ Add'} Custom Tags
                        </button>
                        {exportState.showTagInput && (
                          <input
                            type="text"
                            placeholder="Add custom tags (comma-separated): #urgent, #follow-up"
                            value={exportState.customTags}
                            onChange={(e) => setExportState(prev => ({ ...prev, customTags: e.target.value }))}
                            className="w-full px-3 py-2 border border-emerald-300 dark:border-emerald-600 rounded-lg bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-100 text-sm"
                          />
                        )}
                      </div>
                      
                      {/* Export Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            const tags = exportState.customTags.split(',').map(t => t.trim()).filter(t => t);
                            const result = rawResults[explanationModal.timestamp];
                            exportAsMarkdown(explanationModal.content, tags, result);
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg text-sm"
                        >
                          📄 Export Markdown
                        </button>
                        <button
                          onClick={() => {
                            const tags = exportState.customTags.split(',').map(t => t.trim()).filter(t => t);
                            const result = rawResults[explanationModal.timestamp];
                            exportAsPDF(explanationModal.content, tags, result);
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg text-sm"
                        >
                          📋 Export PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Footer - Only show on desktop */}
              {!modalState.isMobile && (
                <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {narrativeCache[explanationModal.timestamp] ? (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Retrieved from cache
                        </span>
                      ) : (
                        <span>Generated fresh explanation</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {!explanationModal.loading && !explanationModal.error && explanationModal.content && (
                        <>
                          <button
                            onClick={() => speakNarrative(explanationModal.content)}
                            disabled={speechState.isSpeaking}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                          >
                            🔊 Listen
                          </button>
                          
                          {speechState.isSpeaking && (
                            <button
                              onClick={stopNarration}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                              ⏹ Stop
                            </button>
                          )}
                        </>
                      )}
                      
                      <button
                        onClick={closeModal}
                        className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Footer - Only show on mobile */}
            {modalState.isMobile && (
              <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3">
                <div className="flex justify-between items-center gap-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    {narrativeCache[explanationModal.timestamp] ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span className="hidden sm:inline">Cached</span>
                        <span className="sm:hidden">💾</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        <span className="hidden sm:inline">Fresh</span>
                        <span className="sm:hidden">✨</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!explanationModal.loading && !explanationModal.error && explanationModal.content && (
                      <>
                        <button
                          onClick={() => speakNarrative(explanationModal.content)}
                          disabled={speechState.isSpeaking}
                          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white rounded-lg font-medium transition-colors text-xs flex items-center gap-1"
                        >
                          <span>🔊</span>
                          <span className="hidden xs:inline">{speechState.isSpeaking ? 'Speaking' : 'Listen'}</span>
                        </button>
                        
                        {speechState.isSpeaking && (
                          <button
                            onClick={stopNarration}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-xs flex items-center gap-1"
                          >
                            <span>⏹</span>
                            <span className="hidden xs:inline">Stop</span>
                          </button>
                        )}
                      </>
                    )}
                    
                    <button
                      onClick={closeModal}
                      className="px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

     {/* Modern Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
            className="fixed top-6 left-6 z-[1000]"
          >
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl p-4 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Coming Soon</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{toastMessage}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Helper function to format narrative content with sentence highlighting
function formatNarrative(content, currentSentenceIndex = -1, sentences = []) {
  if (!content) return '';
  
  // If we have sentences for highlighting, use them
  if (sentences.length > 0 && currentSentenceIndex >= 0) {
    return (
      <div className="space-y-2">
        {sentences.map((sentence, index) => (
          <span
            key={index}
            className={`inline-block transition-all duration-300 ${
              index === currentSentenceIndex
                ? 'bg-yellow-200 dark:bg-yellow-800 px-1 py-0.5 rounded shadow-lg transform scale-105'
                : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 py-0.5 rounded'
            }`}
          >
            {sentence}{index < sentences.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    );
  }
  
  // Default formatting without highlighting
  return content
    .split('\n\n')
    .map((paragraph, index) => (
      <div key={index} className="mb-4 last:mb-0">
        {paragraph.split('\n').map((line, lineIndex) => {
          // Handle bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={lineIndex} className="flex items-start gap-2 mb-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="break-words">{line.trim().substring(2)}</span>
              </div>
            );
          }
          
          // Handle numbered lists
          const numberedMatch = line.trim().match(/^(\d+)\.\s(.+)$/);
          if (numberedMatch) {
            return (
              <div key={lineIndex} className="flex items-start gap-2 mb-1">
                <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {numberedMatch[1]}
                </span>
                <span className="break-words">{numberedMatch[2]}</span>
              </div>
            );
          }
          
          // Handle bold text (simple **text** format)
          let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          
          return (
            <div key={lineIndex} className="mb-1 break-words" dangerouslySetInnerHTML={{ __html: formattedLine }} />
          );
        })}
      </div>
    ));
}

function formatResponse(response) {
  if (!response || typeof response !== "object") {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <span className="text-red-500">❌</span>
        <p className="text-red-600 dark:text-red-400 font-medium">Invalid response received.</p>
      </div>
    );
  }

  // === Simulation logic ===
  if (response.task && response.result) {
    const { task, result } = response;
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm">🧠</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Task</p>
            <p className="text-blue-700 dark:text-blue-300">{task}</p>
          </div>
        </div>
        
        {"prediction" in result && (
          <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">📈</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-purple-800 dark:text-purple-200 mb-1">Prediction</p>
              <p className="text-purple-700 dark:text-purple-300 font-mono text-sm bg-purple-100 dark:bg-purple-800/30 px-2 py-1 rounded">
                {JSON.stringify(result.prediction)}
              </p>
            </div>
          </div>
        )}
        
        {"recommendation" in result && result.recommendation && (
          <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">🎯</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Recommendations</p>
              <ul className="space-y-1">
                {Array.isArray(result.recommendation.suggestions)
                  ? result.recommendation.suggestions.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{rec}</span>
                      </li>
                    ))
                  : typeof result.recommendation === "object"
                  ? Object.values(result.recommendation).map((val, i) => (
                      <li key={i} className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{String(val)}</span>
                      </li>
                    ))
                  : <li className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{String(result.recommendation)}</span>
                    </li>}
              </ul>
            </div>
          </div>
        )}
        
        {"anomaly" in result && result.anomaly && result.anomaly.predictions && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">🧪</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Anomaly Detection</p>
              <div className="space-y-1">
                <p className="text-amber-700 dark:text-amber-300">
                  <span className="font-medium">Anomaly Score(s):</span> {result.anomaly.scores?.join(", ") || "N/A"}
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  <span className="font-medium">📊 Anomaly Prediction(s):</span> {result.anomaly.predictions?.join(", ") || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === Fallback to legacy format ===
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-slate-400">📭</span>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Unstructured or legacy response.</p>
      </div>
      <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap bg-slate-100 dark:bg-slate-900 p-3 rounded-lg overflow-x-auto">
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}

function getNextStepSuggestion(content) {
  // Simple rule-based suggestion
  if (!content) return "Review the above explanation and consider running a branching simulation.";
  const lc = content.toLowerCase();
  if (lc.includes("risk")) return "Consider running a risk analysis branch.";
  if (lc.includes("recommend")) return "Apply the recommendations or simulate alternative scenarios.";
  if (lc.includes("anomaly")) return "Investigate anomalies further or consult with your team.";
  if (lc.includes("predict")) return "Use the prediction to inform your next business decision.";
  if (lc.includes("cost")) return "Review cost-saving measures and optimize your strategy.";
  return "Review the above explanation and consider running a branching simulation.";
}

export default ScenarioSimulationCard;