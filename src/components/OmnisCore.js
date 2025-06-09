import React from 'react';
import ScenarioInput from './ScenarioInput'; // Input Form
import ScenarioInsightsCard from './ScenarioInsightsCard'; // Insights
import ScenarioPreview from './ScenarioPreview';

const NewScenarioPage = () => {
  
  return (
    <div className="p-6 space-y-10">

      {/* Page Header */}
      <header>
        <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-300">
          Omnis' Core
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Design and test your decision-making scenarios here.
        </p>
      </header>

      {/* Input & Preview Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Left: Scenario Input Form */}
        <div className="w-full">
          <ScenarioInput />
        </div>

        {/* Right: Live Preview */}
        <div className="bg-white dark:bg-gray-800 border shadow-lg hover:shadow-blue-500/50 rounded-lg p-6 ">
          <h2 className="text-xl max-h-48px font-semibold text-green-500 dark:text-green-500 mb-2">
            Scenario Preview
          </h2>
          <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 p-2">
            {/* Placeholder for live scenario preview */}
           <ScenarioPreview />
          </div>
        </div>
      </section>

      {/* Simulation Output Section */}
      <section className="grid grid-cols-1 sm:grid-cols-1 gap-6">
        {/* Left: Simulation Result */}
        
  
          <ScenarioInsightsCard />
        </section>

    </div>
  );
};

export default NewScenarioPage;