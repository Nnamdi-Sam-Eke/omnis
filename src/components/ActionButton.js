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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border w-full">
      {/* Environment Info Card */}
      {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 w-full">
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
      </div> */}

      {/* Create Report Button */}
      <div className="flex items-center justify-center">
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg flex items-center space-x-2 w-full justify-center">
          <FiPlus />
          <span>Create New Report</span>
        </button>
      </div>

      {/* Add New Data Button */}
      <div className="flex items-center justify-center">
        <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg flex items-center space-x-2 w-full justify-center">
          <FiPlus />
          <span>Add New Data</span>
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
// This component is a simple action button that can be used to create new reports or add new data. It also includes a toggleable section for displaying environment information, which includes weather data and geolocation maps. The state of the toggle is saved in local storage so that it persists across page reloads.
// The component uses Tailwind CSS for styling and React Icons for the plus icon. The buttons are styled to be visually appealing and user-friendly. The component is responsive and adjusts its layout based on the screen size.