import React, { useState } from "react";
import NewScenarioPage from "../components/OmnisCore"; // Omnis Core Component
import AiMatchPage from "../components/AI_Match"; // Placeholder for AI_Match (future features)

const ScenarioTabs = () => {
  const [activeTab, setActiveTab] = useState("core");

  return (
    <div className="p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-300 mb-4 sm:mb-6">
        Creation Playground
      </h1>

      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-4 justify-center sm:justify-start mb-4 sm:mb-6">
        {["core", "ai_match"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 sm:px-5 sm:py-2 rounded-full font-semibold transition-all ${
              activeTab === tab
                ? "bg-blue-500 text-white border border-blue-700"
                : "bg-gray-300 text-gray-800 hover:bg-green-300"
            }`}
          >
            {tab === "core" ? "Omnis Core" : "AI_Match"}
          </button>
        ))}
      </div>

      {/* Tab Panels with fade effect */}
      <div className="relative">
        {activeTab === "core" && (
          <div
            className={`transition-opacity duration-500 ease-in-out ${
              activeTab === "core" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <NewScenarioPage />
          </div>
        )}
        {activeTab === "ai_match" && (
          <div
            className={`transition-opacity duration-500 ease-in-out ${
              activeTab === "ai_match" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <AiMatchPage />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioTabs;
