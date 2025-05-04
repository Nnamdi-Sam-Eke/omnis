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
    <div className="p-4 sm:p-6 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-300 mb-4 sm:mb-6">
        Creation Playground
      </h1>

      {/* Tab List */}
      <div role="tablist" aria-label="Scenario tabs" className="flex flex-wrap gap-4 justify-center sm:justify-start mb-4 sm:mb-6">
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
              className={`px-4 py-2 sm:px-5 sm:py-2 rounded-full font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-400 ${
                activeTab === tab
                  ? "bg-blue-500 text-white border border-blue-700"
                  : "bg-gray-300 text-gray-800 hover:bg-green-300"
              }`}
            >
              {tab === 'core' ? 'Omnis Core' : 'AI_Match'}
            </button>
          </Tooltip>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="relative">
        <Suspense fallback={<div>Loading Core...</div>}>
          {activeTab === 'core' && (
            <div
              role="tabpanel"
              id="panel-core"
              aria-labelledby="tab-core"
              tabIndex={0}
              className="transition-opacity duration-500 ease-in-out opacity-100"
            >
              <NewScenarioPage />
            </div>
          )}
        </Suspense>
        <Suspense fallback={<div>Loading AI Match...</div>}>
          {activeTab === 'ai_match' && (
            <div
              role="tabpanel"
              id="panel-ai_match"
              aria-labelledby="tab-ai_match"
              tabIndex={0}
              className="transition-opacity duration-500 ease-in-out opacity-100"
            >
              <AiMatchPage />
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default ScenarioTabs;
