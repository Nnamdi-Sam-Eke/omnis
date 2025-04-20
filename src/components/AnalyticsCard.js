import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Register chart components
ChartJS.register(
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function CategoryDistributionChart() {
  const storedIsOpen = localStorage.getItem('categoryChartIsOpen');
  const [isOpen, setIsOpen] = useState(storedIsOpen === 'false' ? false : true);
  const [range, setRange] = useState(7);
  const [activeChart, setActiveChart] = useState("bar");

  useEffect(() => {
    localStorage.setItem('categoryChartIsOpen', isOpen);
  }, [isOpen]);

  const fullLabels = Array.from({ length: 31 }, (_, i) => `Apr ${i + 1}`);
  const baseData = [
    1, 8, 4, 1.2, 2, 9, 7, 9, 6, 5.5, 16, 4.5, 11,
    2.3, 5, 6.8, 4.2, 3.9, 7.7, 8.1, 5.2, 6.3, 9.8, 3.5, 6.6, 7.1, 2.2, 5.5, 4.4, 6.0, 3.3
  ];
  const bonusData = [
    0.2, 1.5, 1, 0.3, 0.1, 1.2, 1.5, 1.3, 0.9, 1.1, 3.5, 1, 2.5,
    0.8, 1.2, 1.0, 1.3, 1.4, 2.1, 0.5, 0.9, 1.5, 2.0, 1.1, 0.7, 1.8, 1.3, 1.4, 0.9, 2.3, 1.6
  ];
  const referralData = Array(fullLabels.length).fill(0);

  const getSlicedData = (data) => {
    if (range === 'all') return data;
    return data.slice(-range);
  };

  const labels = getSlicedData(fullLabels);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Base Time",
        data: getSlicedData(baseData),
        backgroundColor: "#22C55E",
        borderColor: "#22C55E",
        fill: false,
        borderRadius: 10,
      },
      {
        label: "Bonus Time",
        data: getSlicedData(bonusData),
        backgroundColor: "#FB7185",
        borderColor: "#FB7185",
        fill: false,
        borderRadius: 10,
      },
      {
        label: "Referral Time",
        data: getSlicedData(referralData),
        backgroundColor: "#A78BFA",
        borderColor: "#A78BFA",
        fill: false,
        borderRadius: 10,
      },
    ],
  };

  const getPieData = () => {
    const slice = (arr) => (range === 'all' ? arr : arr.slice(-range));

    const baseTotal = slice(baseData).reduce((acc, val) => acc + val, 0);
    const bonusTotal = slice(bonusData).reduce((acc, val) => acc + val, 0);
    const referralTotal = slice(referralData).reduce((acc, val) => acc + val, 0);

    return {
      labels: ['Base Time', 'Bonus Time', 'Referral Time'],
      datasets: [
        {
          data: [baseTotal, bonusTotal, referralTotal],
          backgroundColor: ['#22C55E', '#FB7185', '#A78BFA'],
          borderColor: ['#22C55E', '#FB7185', '#A78BFA'],
          borderWidth: 1,
        },
      ],
    };
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { mode: "index", intersect: false },
      legend: { position: "top" },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(2) + "%";
            return `${context.label}: ${value} (${percentage})`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
    rotation: Math.PI / 2,
    cutout: "60%",
  };

  return (
    <div className="w-full md:w-10/12 border mt-8 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-lg">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer mb-4"
      >
        <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-300">
          🌍 Daily Uptime
        </h2>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-blue-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-blue-500" />
        )}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Chart Type & Range Toggles */}
        <div className="flex flex-wrap gap-4 mb-4">
          {["bar", "line", "pie"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveChart(type)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeChart === type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Chart
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

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-3/4 overflow-x-auto">
            {activeChart === "bar" && (
              <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
                <Bar data={chartData} options={commonOptions} />
              </div>
            )}
            {activeChart === "line" && (
              <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
                <Line data={chartData} options={commonOptions} />
              </div>
            )}
            {activeChart === "pie" && (
              <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
                <Pie data={getPieData()} options={pieOptions} />
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/4 flex flex-col gap-16">
            <div className="flex items-center gap-4">
              <div className="text-gray-500 dark:text-gray-400 text-2xl">🕒</div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Total Uptime</div>
                <div className="text-2xl font-bold text-black dark:text-white">21d 9h 36m</div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            <div className="flex items-center gap-4">
              <div className="text-gray-500 dark:text-gray-400 text-2xl">📅</div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Today's Time</div>
                <div className="text-2xl font-bold text-black dark:text-white">14h 24m</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
