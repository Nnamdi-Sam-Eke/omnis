import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function ScenarioSimulationChart() {
  const [activeChart, setActiveChart] = useState('bar');
  const [range, setRange] = useState(7);
  // Retrieve the stored state of the collapsible section or default to true (open)
  const storedIsOpen = localStorage.getItem('isOpen');
  const [isOpen, setIsOpen] = useState(storedIsOpen === 'false' ? false : true);

  // Save the state of the collapsible section to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isOpen', isOpen);
  }, [isOpen]);

  const labels = Array.from({ length: 21 }, (_, i) => `Apr ${i + 1}`);
  const dataValues = [12, 15, 9, 7, 11, 14, 10, 16, 13, 8, 9, 17, 12, 14, 11, 18, 15, 13, 10, 12, 16];

  const sliceStart = range === 'all' ? 0 : labels.length - range;
  const filteredLabels = labels.slice(sliceStart);
  const filteredValues = dataValues.slice(sliceStart);

  const chartData = {
    labels: filteredLabels,
    datasets: [
      {
        label: 'Scenarios Simulated',
        data: filteredValues,
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { beginAtZero: true, title: { display: true, text: 'Scenarios Run' } }
    }
  };

  return (
    <div className=" w-full border md:w-full mt-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      {/* Header with toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer mb-4"
      >
        <h3 className="text-xl font-semibold text-blue-500 dark:text-blue-300">
          Total Scenarios Run
        </h3>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-blue-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-blue-500" />
        )}
      </div>

      {/* Collapsible section */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Chart Type Toggle */}
        <div className="flex flex-wrap gap-4 mb-4">
          {['bar', 'line'].map(type => (
            <button
              key={type}
              onClick={() => setActiveChart(type)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeChart === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type === 'bar' ? 'Bar Chart' : 'Line Chart'}
            </button>
          ))}
        </div>

        {/* Date Range Selector */}
        <div className="flex justify-end space-x-2 mb-4">
          {[7, 14, 30, 'all'].map(d => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`py-1 px-3 text-sm rounded-md font-medium ${
                range === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {d === 'all' ? 'All' : `Last ${d} Days`}
            </button>
          ))}
        </div>

        {/* Chart Display */}
        <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
          {activeChart === 'bar' ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
}
