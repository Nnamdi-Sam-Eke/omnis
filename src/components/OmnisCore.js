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

      {/* Input + Simulation Text Section */}
      <section className="flex flex-col md:flex-row gap-6 w-full">
        {/* Left: Scenario Input */}
        <div className="w-full">
          <ScenarioInput />
        </div>

      </section>

      {/* Scenario Insights & Preview */}
      <section className="grid grid-cols-1 gap-6">
        <div>
          <ScenarioInsightsCard />
        </div>
        <div>
          <ScenarioPreview />
        </div>
      </section>

    </div>
  );
};

export default NewScenarioPage;
