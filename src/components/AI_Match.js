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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Smart Recommendations
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            AI-powered suggestions tailored to you. Experience the future of personalized recommendations.
          </p>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Coming soon: persona & prediction
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="lg:sticky lg:top-8 h-fit">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Scenario Input
                  </h2>
                </div>

                <div className="space-y-4">
                  <label htmlFor="userInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Describe your criteria or challenge
                  </label>
                  <div className="relative">
                    <input
                      id="userInput"
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 text-lg transition-all duration-200"
                      placeholder="E.g., 'Budget optimization for project X'"
                      required
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold text-lg shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Get AI Match
                  </div>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* AI Results */}
          <div className="space-y-6">
            {loading && (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                </div>
                <p className="text-center text-gray-600 dark:text-gray-300 font-medium">
                  AI is analyzing your input...
                </p>
              </div>
            )}

            {aiResults && !loading && (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    AI Recommendations
                  </h3>
                </div>

                <div className="space-y-4">
                  {aiResults.recommendations.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01]"
                    >
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 mt-0.5">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
                          {item}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        AI Confidence Level
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                        {aiResults.confidence}
                      </span>
                      <div className="ml-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder when no results */}
            {!aiResults && !loading && (
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-3xl p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Ready for AI Magic
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Enter your criteria above to get personalized recommendations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiMatchPage;