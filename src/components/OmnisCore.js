import React from 'react';
import ScenarioInput from './ScenarioInput'; // Input Form
import ScenarioSimulationCard from './SimulationResult'; // Results
import ScenarioInsightsCard from './ScenarioInsightsCard'; // Insights

const NewScenarioPage = () => {
  return (
    <div className="p-6 space-y-10">

      {/* Page Header */}
      <header>
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-300">
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
          <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-300 mb-2">
            Scenario Preview
          </h2>
          <p className="text-gray-500  dark:text-gray-400 text-center mt-6">
            Your live scenario preview will appear here based on current inputs.
          </p>
        </div>
      </section>

      {/* Simulation Output Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Left: Simulation Result */}
        <div>
          <ScenarioSimulationCard />
        </div>

        {/* Right: Scenario Insights */}
        <div>
          <ScenarioInsightsCard />
        </div>
      </section>

    </div>
  );
};

export default NewScenarioPage;
