import React, { lazy, Suspense } from "react";
// Tooltip and tab controls removed since no tab buttons should display

// Lazy loaded components
const NewScenarioPage = lazy(() => import("../components/OmnisCore"));
// const AiMatchPage = lazy(() => import("../components/AI_Match")); // AI Match (commented out)

const ScenarioTabs = () => {
  // No tabs or tab state — render Omnis Core directly
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mt-4 sm:mt-6 lg:mt-8 mb-2">
            Creation Playground
          </h1>
          <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto sm:mx-0"></div>
        </div>

        {/* Directly render Omnis Core (no tab buttons) */}
        <div className="relative">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-16">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-500"></div>
                  <div className="mt-4 text-center">
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Loading Core...</p>
                  </div>
                </div>
              </div>
            }
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
              <NewScenarioPage />
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ScenarioTabs;