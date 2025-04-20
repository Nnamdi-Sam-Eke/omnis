import React, { useState } from "react";
import ScenarioInput from "./components/ScenarioInput"; // Adjust the path based on your project structure

const ParentComponent = () => {
  const [simulationResults, setSimulationResults] = useState([]);

  return (
    <div>
      <ScenarioInput setSimulationResults={setSimulationResults} />
      <div>
        {simulationResults.length > 0 && (
          <pre>{JSON.stringify(simulationResults, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default ParentComponent;
