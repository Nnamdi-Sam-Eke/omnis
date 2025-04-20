import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register required components
ChartJS.register(ArcElement, Tooltip, Legend);

// Sample scenario category distribution
const chartData = {
  labels: ["Finance", "Logistics", "Health", "Energy", "Retail", "Agriculture"],
  datasets: [
    {
      label: "Scenario Count",
      data: [25, 15, 20, 10, 12, 18],
      backgroundColor: [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#14b8a6",
      ],
      borderWidth: 1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#6b7280', // Tailwind gray-500
        font: { size: 12 },
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = chartData.labels[context.dataIndex] || '';
          const value = chartData.datasets[0].data[context.dataIndex] || 0;
          return `${label}: ${value} scenarios`;
        },
      },
    },
  },
};

export default function CategoryDistributionChart() {
  // Retrieve stored state or default to open
  const storedIsOpen = localStorage.getItem('categoryChartIsOpen');
  const [isOpen, setIsOpen] = useState(
    storedIsOpen === 'false' ? false : true
  );

  // Persist open/closed state
  useEffect(() => {
    localStorage.setItem('categoryChartIsOpen', isOpen);
  }, [isOpen]);

  return (
    <div className="w-full md:w-10/12 border bg-white mt-8 dark:bg-gray-900 p-6 rounded-3xl shadow-lg">
      {/* Header with toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer mb-4"
      >
        <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-300">
          🌍 Scenario Category Distribution
        </h2>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-blue-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-blue-500" />
        )}
      </div>

      {/* Collapsible chart section */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="h-96 flex items-center justify-center">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
