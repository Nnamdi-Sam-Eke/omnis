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

          <div className="max-h-50 p-2">
          {/* Simulation Insights Section */}
            <ScenarioInsightsCard />
          </div>
      </section>

      {/* Placeholder for live scenario preview */}
      <section className="grid grid-cols-1 sm:grid-cols-1 gap-6">
        
      <ScenarioPreview />
      </section>
    </div>
  );
};

export default NewScenarioPage;