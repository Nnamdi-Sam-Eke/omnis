import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronUp } from "lucide-react";

const ScenarioInsightsCard = ({ processedData = [] }) => {
  const [chartType, setChartType] = useState("bar");
  const [isOpen, setIsOpen] = useState(false);

  // Dummy Data for testing purposes (remove or replace as needed)
  if (processedData.length === 0) {
    processedData = [
      { label: "Scenario A", value: 45 },
      { label: "Scenario B", value: 75 },
      { label: "Scenario C", value: 30 },
    ];
  }

  // Load the collapse/expand state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('scenarioCardIsOpen');
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState)); // Set the state based on localStorage value
    }
  }, []);

  // Save the collapse/expand state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('scenarioCardIsOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const renderChart = () => {
    if (!processedData || processedData.length === 0) {
      return <p className="text-gray-500">No data available</p>; // Handle empty data
    }

    // Example dummy chart logic (replace with your real chart)
    return (
      <div className="border p-4 rounded-lg bg-gray-100">
        <h3 className="text-lg font-bold mb-2">Chart Preview ({chartType})</h3>
        <ul className="space-y-2">
          {processedData.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-blue-500/50 rounded-lg p-6 border text-gray-900 dark:text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-300">
          Scenario Insights
        </h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-500 dark:text-blue-300 font-mediu"
        >
          {isOpen ? <ChevronUp /> :<ChevronRight/>}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Analyze trends and patterns from scenario data.
          </p>

          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Select Chart Type:
          </label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="mb-6 p-2 border rounded w-full dark:bg-gray-700 dark:text-white"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="heatmap">Heatmap</option>
            <option value="pie">Pie Chart</option>
            <option value="circular-progress">Circular Progress</option>
          </select>

          {renderChart()} {/* This will render dummy data */}
        </div>
      )}
    </div>
  );
};

export default ScenarioInsightsCard;
// In this code, we have added a new component called ScenarioInsightsCard that allows users to visualize scenario data using different chart types. The component uses dummy data for demonstration purposes, and you can replace it with your actual data processing logic. The collapse/expand functionality is implemented using localStorage to persist the state across page reloads.