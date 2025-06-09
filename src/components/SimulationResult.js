// This file is part of the Omnis AI project. 


import React, { useState } from "react";
import { useOmnisContext } from "../context/OmnisContext";
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";

const ScenarioSimulationCard = ({ results, setResults, loading }) => {
  const { addFeedback } = useOmnisContext();
  const [clickedButtons, setClickedButtons] = useState({});

  if (!results || results.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg border hover:shadow-blue-500/50 rounded-lg p-6 border text-gray-900 dark:text-white">
        <h2 className="text-xl font-semibold  text-green-500 dark:text-green-500">Scenario Output</h2>
        <p className="text-gray-500 text-center mt-4">No results to display.</p>
      </div>
    );
  }

  const handleReset = () => {
    if (setResults) setResults([]);
  };

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
    <div className="bg-white dark:bg-gray-800 shadow-lg border rounded-lg p-6 text-gray-900 dark:text-white">
      <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-300">Scenario Output</h2>
      <div className="space-y-4 mt-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex flex-col space-y-2 bg-gray-200 dark:bg-gray-700 rounded-lg p-4"
          >
            <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-2/3" />
            <div className="h-3 bg-gray-300 dark:bg-gray-500 rounded w-full" />
            <div className="h-3 bg-gray-300 dark:bg-gray-500 rounded w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

  return (
    <div className="bg-white shadow-lg hover:shadow-blue-500/50 dark:bg-gray-900 rounded-lg p-6 border dark:border text-gray-900 dark:text-white text-2xl col-span-2 w-full">
      <h2 className="text-xl font-semibold text-green-500 ">Scenario Output</h2>

      <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 p-2 mt-3">
        {results.filter(Boolean).map((result, index) => {
          const timestamp = result?.timestamp || index;
          return (
            <div key={timestamp} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full shadow border border-gray-200 dark:border-gray-700 mb-3 group hover:scale-100 transition-transform duration-200">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-200">
                {result?.query || "Unknown Query"}
              </h4>
              {result?.error ? (
                <p className="text-red-500 text-sm">❌ {result.error}</p>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {formatResponse(result?.response)}
                </div>
              )}

              <div className="flex justify-start space-x-4 mt-2">
                <button
                  aria-label="Give positive feedback"
                  className={`${
                    clickedButtons[timestamp] === "positive"
                      ? "bg-green-600"
                      : "bg-green-500"
                  } hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-transform transform hover:scale-105`}
                  onClick={() => handleFeedback(timestamp, "positive")}
                >
                  <FiThumbsUp className="text-xl" />
                </button>
                <button
                  aria-label="Give negative feedback"
                  className={`${
                    clickedButtons[timestamp] === "negative"
                      ? "bg-red-600"
                      : "bg-red-500"
                  } hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-transform transform hover:scale-105`}
                  onClick={() => handleFeedback(timestamp, "negative")}
                >
                  <FiThumbsDown className="text-xl" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={handleReset} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-transform transform hover:scale-105 active:scale-95">
          Reset
        </button>
      </div>
    </div>
  );
};

function formatResponse(response) {
  if (!response || typeof response !== "object") {
    return <p className="group-hover:scale-100 text-3xl transition-transform duration-200">❌ Invalid response received.</p>;
  }

  // === Simulation logic ===
  if (response.task && response.result) {
    const { task, result } = response;
    return (
      <div className="space-y-2 group hover:scale-[1.01] transition-transform duration-200">
        <p>🧠 <strong>Task:</strong> {task}</p>
        {"prediction" in result && (
          <p>📈 <strong>Prediction:</strong> {JSON.stringify(result.prediction)}</p>
        )}
        {"recommendation" in result && result.recommendation && (
          <div>
            <p>🎯 <strong>Recommendations:</strong></p>
            <ul className="list-disc list-inside">
              {Array.isArray(result.recommendation.suggestions)
                ? result.recommendation.suggestions.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))
                : typeof result.recommendation === "object"
                ? Object.values(result.recommendation).map((val, i) => <li key={i}>{String(val)}</li>)
                : <li>{String(result.recommendation)}</li>}
            </ul>
          </div>
        )}
        {"anomaly" in result && result.anomaly && result.anomaly.predictions && (
          <div>
            <p>🧪 <strong>Anomaly Score(s):</strong> {result.anomaly.scores?.join(", ") || "N/A"}</p>
            <p>📊 <strong>Anomaly Prediction(s):</strong> {result.anomaly.predictions?.join(", ") || "N/A"}</p>
          </div>
        )}
      </div>
    );
  }

  // === Fallback to legacy format ===
  return (
    <div>
      <p className="text-sm text-gray-500">📭 Unstructured or legacy response.</p>
      <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}

export default ScenarioSimulationCard;
// This component displays the results of scenario simulations, allowing users to provide feedback on each result.
// It includes buttons for positive and negative feedback, which are tracked per result timestamp.
// The component also handles resetting the results and formats the response data for display.  