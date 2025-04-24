import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import WeatherDataCard from './WeatherDataCard';
import GeolocationMapCard from './GeolocationMapCard';

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
    <div className="grid grid-cols-1 lg:grid-cols-2  mt-8 w-full">
      {/* Environment Info Card */}
      {/*
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 w-full">
        <button
          onClick={toggleExpand}
          className="w-full flex justify-between items-center text-lg font-semibold text-left text-blue-600 dark:text-white"
        >
          <span>Environment Info</span>
          <span>{isExpanded ? "▲" : "▼"}</span>
        </button>

        {isExpanded && (
          <div className="mt-4 max-h-[400px] overflow-y-auto space-y-4 pr-2">
            <WeatherDataCard />
            <GeolocationMapCard />
          </div>
        )}
      </div>
      */}

      {/* Create Report Button */}
      <div className="flex items-center mt-8 justify-center">
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-md flex items-center space-x-1 w-auto">
          <FiPlus className="text-base" />
          <span>Create Report</span>
        </button>
      </div>

      {/* Add New Data Button */}
      <div className="flex items-center justify-center">
        <button className="bg-green-500 hover:bg-green-600 mt-8 text-white text-sm py-2 px-3 rounded-md flex items-center space-x-1 w-auto">
          <FiPlus className="text-base" />
          <span>Add Data</span>
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
