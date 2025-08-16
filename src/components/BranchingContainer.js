import React, { useState, useEffect } from "react";
import BranchingVisualization from "./BranchingVisualization";

export default function BranchingContainer({ scenario, numPaths = 3, userDefinedForks = null }) {
  const [branchingData, setBranchingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBranchData() {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/branch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario,
            num_paths: numPaths,
            user_defined_forks: userDefinedForks
          })
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        setBranchingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBranchData();
  }, [scenario, numPaths, userDefinedForks]);

  if (loading) return <p>Loading simulation...</p>;
  if (error) return <p>Error: {error}</p>;

  return <BranchingVisualization branchingData={branchingData} />;
}
