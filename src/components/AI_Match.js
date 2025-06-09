import React, { useState } from "react";

// Simulated AI function to process user inputs and return recommendations
const mockAiProcess = (userInput) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        recommendations: [
          `Match 1 for "${userInput}" - Optimize your approach`,
          `Match 2 for "${userInput}" - Suggested adjustment`,
          `Match 3 for "${userInput}" - Key improvement idea`,
        ],
        confidence: "High",
      });
    }, 2000);
  });
};

const AiMatchPage = () => {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAiResults(null);
    setError(null);

    try {
      const results = await mockAiProcess(userInput);
      setAiResults(results);
    } catch (err) {
      setError("Something went wrong during AI processing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-10">
      {/* Page Header */}
      <header>
        <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-300">
          Smart Recommendations
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          AI-powered suggestions tailored to you.<br /> Coming soon: persona & prediction..
        </p>
      </header>

      {/* Input + AI Results Flex Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full md:w-3/4 space-y-4">
          <div className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-blue-500/50 rounded-lg p-6 border text-gray-900 dark:text-white">
            <div className="p-3 rounded-md">
              <h2 className="text-xl font-semibold  text-green-500 dark:text-green-500 mb-4">
                Scenario Input
              </h2>

              <label
                htmlFor="userInput"
                className="block text-sm font-medium text-black dark:text-white mb-6"
              >
                Enter your criteria
              </label>
              <input
                id="userInput"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="E.g., 'Budget optimization for project X'"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 hover:scale-105 transition-all focus:outline-none"
          >
            {loading ? (
              <div className="fixed inset-0 bg-black transition bg-opacity-50 flex items-center justify-center z-50">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-16 h-16 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className=" w-12 h-12 border-8 border-green-500 border-t-transparent rounded-full animate-[spin_1s_linear_reverse_infinite]"></div>
                </div>
              </div>
            ) : (
              "Get AI Match"
            )}
          </button>

          {/* Loading/Error Feedback */}
          {loading && (
            <div className="text-center text-blue-500 font-medium">
              Loading AI results...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 font-medium">
              {error}
            </div>
          )}
        </form>

        {/* AI Results */}
        {aiResults && !loading && (
          <div className="w-full md:w-3/4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border space-y-4">
            <h3 className="text-lg font-semibold text-green-500">
              AI Recommendations
            </h3>
            <ul className="list-disc list-inside space-y-2">
              {aiResults.recommendations.map((item, index) => (
                <li
                  key={index}
                  className="text-gray-700 dark:text-gray-300 text-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI Confidence Level:{" "}
              <span className="font-semibold">{aiResults.confidence}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiMatchPage;
