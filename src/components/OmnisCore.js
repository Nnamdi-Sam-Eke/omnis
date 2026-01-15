import React, { useState } from "react";
import ScenarioInput from "./ScenarioInput";
import ScenarioSimulationCard from "./SimulationResult"; // ✅ Import the actual component

const NewScenarioPage = () => {
  // ✅ Add these state variables
  const [simulationResults, setSimulationResults] = useState([]);
  const [simulationInput, setSimulationInput] = useState("");
  const [simulationLoading, setSimulationLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">

      {/* ======================
          MOBILE (< md)
          ====================== */}
      <div className="md:hidden max-w-7xl mx-auto p-6 space-y-12">
        {/* Header */}
        <header className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-2xl blur-xl" />
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 shadow-xl">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Omnis' Core
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Design and test your decision-making scenarios here.
            </p>
          </div>
        </header>

        {/* Input - Pass setters so it can update parent state */}
        <ScenarioInput 
          setGeneratedResults={setSimulationResults}
          setSimulationInput={setSimulationInput}
          setSimulationLoading={setSimulationLoading}
        />

        {/* Results - Receives data from parent */}
        <ScenarioSimulationCard 
          results={simulationResults}
          setResults={setSimulationResults}
          loading={simulationLoading}
          simulationInput={simulationInput}
        />
      </div>

      {/* ======================
          TABLET & DESKTOP (≥ md)
          ====================== */}
      <div className="hidden md:flex h-screen">
        {/* LEFT – INPUT */}
        <aside className="w-[40%] lg:w-[38%] overflow-y-auto bg-white/80 dark:bg-slate-800/90 border-r border-white/10 p-6">
          <ScenarioInput 
            setGeneratedResults={setSimulationResults}
            setSimulationInput={setSimulationInput}
            setSimulationLoading={setSimulationLoading}
          />
        </aside>

        {/* DIVIDER */}
        <div className="w-px bg-gradient-to-b from-transparent via-indigo-500/60 to-transparent shadow-[0_0_10px_rgba(99,102,241,0.4)]" />

        {/* RIGHT – RESULTS */}
        <main className="w-[60%] lg:w-[62%] overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6">
          <ScenarioSimulationCard 
            results={simulationResults}
            setResults={setSimulationResults}
            loading={simulationLoading}
            simulationInput={simulationInput}
          />
        </main>
      </div>
    </div>
  );
};

export default NewScenarioPage;