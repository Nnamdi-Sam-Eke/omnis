import React, { useState, useEffect, Suspense } from "react";
import { ChevronRight, ChevronUp } from "lucide-react";
import SkeletonLoader from './SkeletonLoader';

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const LineChart = React.lazy(() =>
  import("react-chartjs-2").then((module) => ({ default: module.Line }))
);

const allData = [
  { date: "2025-03-16", simulations: 5 },
  { date: "2025-03-17", simulations: 7 },
  { date: "2025-03-18", simulations: 12 },
  { date: "2025-03-19", simulations: 9 },
  { date: "2025-03-20", simulations: 15 },
  { date: "2025-03-21", simulations: 18 },
  { date: "2025-03-22", simulations: 25 },
  { date: "2025-03-23", simulations: 30 },
  { date: "2025-03-24", simulations: 26 },
  { date: "2025-03-25", simulations: 29 },
  { date: "2025-03-26", simulations: 32 },
  { date: "2025-03-27", simulations: 35 },
  { date: "2025-03-28", simulations: 38 },
  { date: "2025-03-29", simulations: 40 },
  { date: "2025-03-30", simulations: 42 },
  { date: "2025-03-31", simulations: 45 },
  { date: "2025-04-01", simulations: 47 },
  { date: "2025-04-02", simulations: 50 },
  { date: "2025-04-03", simulations: 52 },
  { date: "2025-04-04", simulations: 60 },
  { date: "2025-04-05", simulations: 64 },
  { date: "2025-04-06", simulations: 67 },
  { date: "2025-04-07", simulations: 70 },
  { date: "2025-04-08", simulations: 74 },
  { date: "2025-04-09", simulations: 77 },
  { date: "2025-04-10", simulations: 79 },
  { date: "2025-04-11", simulations: 82 },
  { date: "2025-04-12", simulations: 85 },
  { date: "2025-04-13", simulations: 88 },
  { date: "2025-04-14", simulations: 90 },
];

export default function SimulationTrendsChart() {
  const [range, setRange] = useState(7);
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem("simulationIsExpanded");
    return stored === "false" ? false : true;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("simulationIsExpanded", isExpanded);
    if (isExpanded) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isExpanded]);

  const sliceStart = range === "all" ? 0 : allData.length - Number(range);
  const filtered = allData.slice(sliceStart);

  const chartData = {
    labels: filtered.map((d) => d.date),
    datasets: [
      {
        label: "Simulations",
        data: filtered.map((d) => d.simulations),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.3)",
        tension: 0.4,
        pointRadius: 4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        ticks: { maxRotation: 90, minRotation: 45 },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white mt-8 hover:shadow-blue-500/50 transition px-6 py-6 dark:bg-gray-800 border rounded-2xl shadow-md transition-all duration-300">
      <div
        className="flex justify-between items-center cursor-pointer mb-4"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
      >
        <h2 className="text-xl font-semibold  text-green-500 dark:text-green-500 mb-4">
          Simulation Trend
        </h2>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-blue-600 dark:text-white" />
        ) : (
          <ChevronRight className="w-5 h-5 text-blue-600 dark:text-white" />
        )}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {isExpanded && (
          <>
            <div className="flex justify-end mb-4 space-x-2">
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

            <div className="relative w-full max-w-5xl mx-auto h-[50vh]">
              {loading ? (
                <SkeletonLoader height="h-full" />
              ) : (
                <Suspense fallback={<SkeletonLoader height="h-full" />}>
                  <LineChart data={chartData} options={options} />
                </Suspense>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
