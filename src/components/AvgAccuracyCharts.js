import React, { useState, useEffect, lazy, Suspense } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import SkeletonLoader from './SkeletonLoader'; // Import the SkeletonLoader component

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

// Lazy load the chart components
const LineChart = lazy(() => import("react-chartjs-2").then(mod => ({ default: mod.Line })));
const DoughnutChart = lazy(() => import("react-chartjs-2").then(mod => ({ default: mod.Doughnut })));

export default function AvgAccuracyChartTabs() {
  const [activeTab, setActiveTab] = useState("line");
  const [range, setRange] = useState(7);

  // Initialize from localStorage (default to true)
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem("avgAccuracyIsOpen");
    return stored === "false" ? false : true;
  });

  // Persist open/closed state
  useEffect(() => {
    localStorage.setItem("avgAccuracyIsOpen", isOpen);
  }, [isOpen]);

  const labels = [
    "Apr 1", "Apr 2", "Apr 3", "Apr 4", "Apr 5", "Apr 6", "Apr 7",
    "Apr 8", "Apr 9", "Apr 10", "Apr 11", "Apr 12", "Apr 13",
    "Apr 14", "Apr 15", "Apr 16", "Apr 17", "Apr 18", "Apr 19",
    "Apr 20", "Apr 21"
  ];

  const accuracyValues = [
    82, 84, 85, 83, 87, 88, 90,
    86, 85, 89, 91, 88, 87,
    89, 88, 90, 92, 91, 89, 88, 90
  ];

  const sliceStart = range === "all" ? 0 : labels.length - Number(range);
  const filteredLabels = labels.slice(sliceStart);
  const filteredAccuracy = accuracyValues.slice(sliceStart);

  const lineData = {
    labels: filteredLabels,
    datasets: [
      {
        label: "Avg Scenario Accuracy (%)",
        data: filteredAccuracy,
        fill: false,
        borderColor: "#4f46e5",
        backgroundColor: "#4f46e5",
        tension: 0.4,
        pointRadius: 4
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Scenario Accuracy Over Selected Period"
      },
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false }
    },
    scales: {
      x: {
        ticks: { maxRotation: 90, minRotation: 45 },
        title: { display: true, text: "Date" }
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: "Accuracy (%)" }
      }
    }
  };

  const currentAccuracy = 88;
  const gaugeData = {
    labels: ["Accuracy", "Remaining"],
    datasets: [
      {
        data: [currentAccuracy, 100 - currentAccuracy],
        backgroundColor: ["#10b981", "#e5e7eb"],
        cutout: "80%",
        circumference: 180,
        rotation: 270,
        borderWidth: 0
      }
    ]
  };

  const gaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false }
    }
  };

  return (
    <div className="bg-white w-full md:w-10/12 border md:w-full dark:bg-gray-800  p-6 rounded-2xl shadow-md mt-6">
      {/* Header with toggle */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-semibold text-green-500 dark:text-green-500">
          Scenario Accuracy Stats
        </h2>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-blue-600 dark:text-white" />
        ) : (
          <ChevronRight className="w-5 h-5 text-blue-600 dark:text-white" />
        )}
      </div>

      {isOpen && (
        <>
          {/* Date Range Selector */}
          <div className="space-x-2 mt-4 mb-2">
            {[7, 14, 30, "all"].map((d) => (
              <button
                key={d}
                onClick={() => setRange(d)}
                className={`py-1 px-3 text-sm rounded-md font-medium ${
                  range === d
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                {d === "all" ? "All" : `Last ${d} Days`}
              </button>
            ))}
          </div>

          {/* Toggle Buttons */}
          <div className="flex space-x-2 mb-4 justify-end">
            {["line", "gauge"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  activeTab === tab
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                }`}
              >
                {tab === "line" ? "Line Chart" : "Gauge Chart"}
              </button>
            ))}
          </div>

          {/* Chart Display */}
          {activeTab === "line" ? (
            <div className="overflow-x-auto">
              <div className="min-w-[700px] h-[50vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh]">
                <Suspense fallback={<SkeletonLoader height="h-[200px]" />}>
                  <LineChart data={lineData} options={lineOptions} />
                </Suspense>
              </div>
            </div>
          ) : (
            <div className="relative h-[50vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh]">
              <Suspense fallback={<SkeletonLoader height="h-[200px]" />}>
                <DoughnutChart data={gaugeData} options={gaugeOptions} />
              </Suspense>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-green-600">
                  {currentAccuracy}%
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
