import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import WeatherDataCard from './WeatherDataCard';
import GeolocationMapCard from './GeolocationMapCard';
import Tooltip from './Tooltip'; // Assuming Tooltip component exists

const ActionButtons = () => {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("envInfoExpanded");
    return saved === "true";
  });

  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem("envInfoExpanded", newState.toString());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 mt-8 min-w-[250px]  border bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
      {/* Create Report Button */}
      <div className="flex items-center mt-8 justify-center">
        <Tooltip text="Create a new report with the data">
          <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-md flex items-center space-x-1 w-auto">
            <FiPlus className="text-base" />
            <span>Create Report</span>
          </button>
        </Tooltip>
      </div>

      {/* Add New Data Button */}
      <div className="flex items-center justify-center">
        <Tooltip text="Add new data for analysis">
          <button className="bg-green-500 hover:bg-green-600 mt-8 text-white text-sm py-2 px-3 rounded-md flex items-center space-x-1 w-auto">
            <FiPlus className="text-base" />
            <span>Add Data</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ActionButtons;
