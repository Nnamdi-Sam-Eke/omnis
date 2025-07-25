import React, { useState, useEffect } from "react";
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";

const ScenarioSimulationCard = ({ results, setResults, loading }) => {
  // Mock the useOmnisContext hook since it's not available
  const addFeedback = (timestamp, feedback) => {
    console.log(`Adding feedback: ${timestamp} - ${feedback}`);
  };

  const [clickedButtons, setClickedButtons] = useState({});
  const [localResults, setLocalResults] = useState(results || []);

  // Update local results when props change
  useEffect(() => {
    setLocalResults(results || []);
  }, [results]);

  const handleReset = () => {
    // Simply clear the local results to hide the component content
    setLocalResults([]);
    if (setResults) {
      setResults([]);
    }
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
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 dark:border-slate-700 rounded-2xl p-8 border border-slate-200 text-slate-900 dark:text-white col-span-2 w-full transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">⚡</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Scenario Output</h2>
        </div>
        <button 
          onClick={() => handleReset()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          aria-label="Remove scenario simulation results"
        >
          <span className="text-sm">🔄</span>
          <span>Reset</span>
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200 dark:scrollbar-thumb-slate-600 dark:scrollbar-track-slate-800 space-y-4 pr-2">
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

              <div className="flex justify-start space-x-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <button
                  aria-label="Give positive feedback"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg ${
                    clickedButtons[timestamp] === "positive"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                  onClick={() => handleFeedback(timestamp, "positive")}
                >
                  <FiThumbsUp className="text-lg" />
                  <span>Helpful</span>
                </button>
                <button
                  aria-label="Give negative feedback"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg ${
                    clickedButtons[timestamp] === "negative"
                      ? "bg-rose-600 text-white"
                      : "bg-rose-500 hover:bg-rose-600 text-white"
                  }`}
                  onClick={() => handleFeedback(timestamp, "negative")}
                >
                  <FiThumbsDown className="text-lg" />
                  <span>Not Helpful</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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

export default ScenarioSimulationCard;