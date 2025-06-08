import React, { useState, useEffect, Suspense } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Line } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const allLabels = [
  "Mar 25", "Mar 26", "Mar 27", "Mar 28", "Mar 29",
  "Mar 30", "Mar 31", "Apr 1",  "Apr 2",  "Apr 3",
  "Apr 4",  "Apr 5",  "Apr 6",  "Apr 7",  "Apr 8"
];
const allAccuracy = [72, 75, 74, 76, 78, 80, 77, 79, 82, 85, 86, 88, 89, 91, 93];

export default function ScenarioAccuracyChart() {
  const [range, setRange] = useState(7);
  const storedIsOpen = localStorage.getItem('isOpen');
  const [isOpen, setIsOpen] = useState(storedIsOpen === 'false' ? false : true);

  // skeleton loading flag
  const [isLoading, setIsLoading] = useState(true);

  // whenever card expands or range changes, show skeleton then chart
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const t = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOpen, range]);

  useEffect(() => {
    localStorage.setItem('isOpen', isOpen);
  }, [isOpen]);

  const labels = range === "all" ? allLabels : allLabels.slice(-range);
  const dataPoints = range === "all" ? allAccuracy : allAccuracy.slice(-range);

  const data = {
    labels,
    datasets: [
      {
        label: "Scenario Accuracy (%)",
        data: dataPoints,
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "#3b82f6",
        pointBackgroundColor: "#3b82f6",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#6b7280", font: { size: 12 } },
      },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280", autoSkip: false },
        title: { display: true, text: "Date", color: "#374151", font: { weight: "bold" } },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: "#6b7280" },
        title: { display: true, text: "Accuracy (%)", color: "#374151", font: { weight: "bold" } },
      },
    },
  };

  const pointWidth = 60;
  const minWidth = labels.length * pointWidth;

  return (
    <div className="w-full border mt-8 bg-white dark:bg-gray-800 w-full  hover:shadow-blue-500/50 transition px-6 py-6 border p-6 mt-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg transition-all duration-300 ease-in-out rounded-3xl shadow-lg transition-all duration-300">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer mb-4"
      >
        <h2 className="text-xl font-semibold  text-green-500 dark:text-green-500">
          📊 Scenario Prediction Accuracy Over Time
        </h2>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-blue-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-blue-500" />
        )}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-x-auto ${
          isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Range buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[7, 14, 30, "all"].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`py-1 px-3 text-sm rounded-md font-medium transition-all duration-200 ${
                range === d
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300"
              }`}
            >
              {d === "all" ? "All" : `Last ${d} Days`}
            </button>
          ))}
        </div>

        {/* Chart area or skeleton */}
        <div className="relative w-full max-w-5xl mx-auto h-[50vh] sm:h-[45vh] md:h-[40vh] lg:h-[35vh] xl:h-[30vh] overflow-x-auto transition-all duration-300">
          {isLoading ? (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
          ) : (
            <div
              className="relative"
              style={{ minWidth: `${minWidth}px`, height: "100%" }}
            >
              <Suspense fallback={<div className="w-full h-full bg-gray-200 animate-pulse rounded-md" />}>
                <Line data={data} options={options} />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
