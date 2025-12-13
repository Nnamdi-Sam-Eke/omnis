import React, { useState } from 'react';
import ScenarioInput from './ScenarioInput'; // Input Form
import ScenarioInsightsCard from './ScenarioInsightsCard'; // Insights
// import ScenarioPreview from './ScenarioPreview';


const NewScenarioPage = () => {
  const [simulationResults, setSimulationResults] = useState([]);

  const handleSimulate = (results) => {
    setSimulationResults(results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {/* Page Header */}
        <header className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Omnis' Core
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
              Design and test your decision-making scenarios here.
            </p>
          </div>
        </header>

        {/* Input + Simulation Text Section */}
        <section className="flex flex-col md:flex-row gap-8 w-full">
          {/* Left: Scenario Input */}
          <div className="w-full">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl">            
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
                  <ScenarioInput onSimulate={handleSimulate} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scenario Insights & Preview */}
        <section className="grid grid-cols-1 gap-8">
          <div className="group">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
              <div className="p-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
                  <ScenarioInsightsCard results={simulationResults} />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="group">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
              <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
                  <ScenarioPreview />
                </div>
              </div>
            </div>
          </div> */}
        </section>
      </div>
    </div>
  );
};

export default NewScenarioPage;