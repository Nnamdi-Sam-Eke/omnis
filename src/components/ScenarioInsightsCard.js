import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronUp } from "lucide-react";
import {
  Bar,
  Line,
  Pie,
  Doughnut,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

// Register all required chart elements and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler,
  zoomPlugin
);

const ScenarioInsightsCard = ({ processedData = [] }) => {
  const [chartType, setChartType] = useState("bar");
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState(0);

  // Dummy fallback
  if (!processedData || processedData.length === 0) {
    processedData = [
      { label: "Scenario A", value: 45 },
      { label: "Scenario B", value: 75 },
      { label: "Scenario C", value: 30 },
    ];
  }

  useEffect(() => {
    const savedState = localStorage.getItem('scenarioCardIsOpen');
    if (savedState !== null) setIsOpen(JSON.parse(savedState));
  }, []);

  useEffect(() => {
    localStorage.setItem('scenarioCardIsOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  // Filter data dynamically
  const filteredData = processedData.filter(item => item.value >= filterValue);

  const chartData = {
    labels: filteredData.map(item => item.label),
    datasets: [
      {
        label: "Scenario Values",
        data: filteredData.map(item => item.value),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderColor: '#1e3a8a',
        borderWidth: 1,
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Chart Preview (${chartType})`,
        color: '#3b82f6',
        font: { size: 16 },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      },
      legend: {
        display: true,
        labels: {
          color: '#6b7280',
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x',
        },
        limits: {
          x: { min: 'original', max: 'original' },
          y: { min: 0 },
        },
      }
    },
    scales: {
      x: {
        ticks: { color: '#6b7280' },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#6b7280' },
        grid: { color: '#e5e7eb' },
      },
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case "bar": return <Bar data={chartData} options={chartOptions} />;
      case "line": return <Line data={chartData} options={chartOptions} />;
      case "pie": return <Pie data={chartData} options={chartOptions} />;
      case "circular-progress": return <Doughnut data={chartData} options={chartOptions} />;
      default: return <p className="text-gray-500">Chart type not supported.</p>;
    }
  };
  const [loading, setLoading] = React.useState(true);
 
 
 
   // Timer to switch off loading after 4 seconds (on mount)
   useEffect(() => {
     const timer = setTimeout(() => setLoading(false), 3000);
     return () => clearTimeout(timer);
   }, []);
 
   // If subscriptions is undefined, show loading state
  if (loading) {
     return (
       <div className="animate-pulse space-y-4">
         <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
         <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
         <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded" />
       </div>
     );
   }
  // Render the component
  return (
    <div className="bg-white overflow-y-auto max-h-[300px] dark:bg-gray-800 shadow-lg hover:shadow-blue-500/50 rounded-lg p-6 border text-gray-900 dark:text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-green-500 mb-12 dark:text-green-500">Scenario Insights</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-500 dark:text-blue-300 font-medium"
        >
          {isOpen ? <ChevronUp  className='text-blue-300 dark:text-blue-300'/> : <ChevronRight  className='text-blue-300 dark:text-blue-300'/>}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Analyze trends and patterns from scenario data.
          </p>

          {/* Chart Type Selector */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Select Chart Type:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="p-2 border rounded w-full dark:bg-gray-700 dark:text-white"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="circular-progress">Circular Progress</option>
            </select>
          </div>

          {/* Value Filter */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Minimum Value Filter:</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filterValue}
              onChange={(e) => setFilterValue(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showing items with value ≥ {filterValue}
            </p>
          </div>

          {/* Chart Preview */}
          <div className="h-96 bg-white dark:bg-gray-900 rounded-lg p-4 border">
            {renderChart()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioInsightsCard;
// This component provides insights into scenario data using various chart types.
// It allows users to select chart types, filter data, and view dynamic visualizations.
// The component is designed to be interactive and responsive, adapting to user inputs. 