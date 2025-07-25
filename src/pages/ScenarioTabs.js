import React, { useState, lazy, Suspense, useRef } from "react";
import Tooltip from '../components/Tooltip'; // Assuming you have a Tooltip component

// Lazy loaded components
const NewScenarioPage = lazy(() => import("../components/OmnisCore"));
const AiMatchPage = lazy(() => import("../components/AI_Match"));

const ScenarioTabs = () => {
  const [activeTab, setActiveTab] = useState("core");
  const tabs = ['core', 'ai_match'];
  const tabRefs = useRef([]);

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % tabs.length;
      tabRefs.current[nextIndex].focus();
      setActiveTab(tabs[nextIndex]);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      tabRefs.current[prevIndex].focus();
      setActiveTab(tabs[prevIndex]);
    } else if (e.key === 'Enter' || e.key === ' ') {
      setActiveTab(tabs[index]);
    }
  };

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

        {/* Tab List */}
        <div role="tablist" aria-label="Scenario tabs" className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6 sm:mb-8">
          {tabs.map((tab, index) => (
            <Tooltip key={tab} text={tab === 'core' ? 'Go to Omnis Core' : 'Switch to AI Match'}>
              <button
                ref={(el) => (tabRefs.current[index] = el)}
                role="tab"
                id={`tab-${tab}`}
                aria-selected={activeTab === tab}
                aria-controls={`panel-${tab}`}
                tabIndex={activeTab === tab ? 0 : -1}
                onClick={() => setActiveTab(tab)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`
                  group relative px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base
                  transition-all duration-300 ease-out transform hover:scale-105 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent
                  ${activeTab === tab
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                    : "bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow-md backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                  }
                `}
              >
                {/* Active indicator */}
                {activeTab === tab && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl opacity-100 animate-pulse"></div>
                )}
                
                {/* Content */}
                <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                  {tab === 'core' ? (
                    <>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="whitespace-nowrap">Omnis Core</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="whitespace-nowrap">AI Match</span>
                    </>
                  )}
                </span>
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="relative">
          <Suspense fallback={
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-500"></div>
                <div className="mt-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Loading Core...</p>
                </div>
              </div>
            </div>
          }>
            {activeTab === 'core' && (
              <div
                role="tabpanel"
                id="panel-core"
                aria-labelledby="tab-core"
                tabIndex={0}
                className="transition-all duration-500 ease-in-out opacity-100 transform translate-y-0"
              >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
                  <NewScenarioPage />
                </div>
              </div>
            )}
          </Suspense>
          
          <Suspense fallback={
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin border-t-purple-500"></div>
                <div className="mt-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Loading AI Match...</p>
                </div>
              </div>
            </div>
          }>
            {activeTab === 'ai_match' && (
              <div
                role="tabpanel"
                id="panel-ai_match"
                aria-labelledby="tab-ai_match"
                tabIndex={0}
                className="transition-all duration-500 ease-in-out opacity-100 transform translate-y-0"
              >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
                  <AiMatchPage />
                </div>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ScenarioTabs;