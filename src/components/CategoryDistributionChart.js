import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

const DoughnutChart = lazy(() =>
  import('react-chartjs-2').then(mod => ({ default: mod.Doughnut }))
);

ChartJS.register(ArcElement, Tooltip, Legend);

const chartData = {
  labels: ['Finance', 'Logistics', 'Health', 'Energy', 'Retail', 'Agriculture'],
  datasets: [
    {
      label: 'Scenario Count',
      data: [25, 15, 20, 10, 12, 18],
      backgroundColor: [
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6',
        '#14b8a6',
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
        color: '#6b7280',
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
  const storedIsOpen = localStorage.getItem('categoryChartIsOpen');
  const [isOpen, setIsOpen] = useState(
    storedIsOpen === 'false' ? false : true
  );

  // skeleton loader flag
  const [isLoading, setIsLoading] = useState(true);

  // when expanded/collapsed, trigger loading
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const t = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('categoryChartIsOpen', isOpen);
  }, [isOpen]);

  return (
    <div className="w-full border bg-white mt-6 dark:bg-gray-800 p-6  hover:shadow-blue-500/50 transition px-6 py-6 rounded-3xl shadow-lg transition-all duration-300">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer mb-4"
      >
        <h2 className="text-xl font-semibold  text-green-500 dark:text-green-500">
          🌍 Scenario Category Distribution
        </h2>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-blue-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-blue-500" />
        )}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="h-96 flex items-center justify-center transition-all duration-300">
          {isLoading ? (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
          ) : (
            <Suspense fallback={<div className="w-full h-full bg-gray-200 animate-pulse rounded-md" />}>
              <DoughnutChart data={chartData} options={chartOptions} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
