import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ChevronDown, ChevronRight } from 'lucide-react';

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// Full 15-day labels and accuracy data
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
  const [activeChart, setActiveChart] = useState("bar");
  
  useEffect(() => {
    localStorage.setItem('isOpen', isOpen);
  }, [isOpen]);

  

  // derive filtered labels & data based on range
  const labels = range === "all" ? allLabels : allLabels.slice(-range);
  const dataPoints = range === "all" ? allAccuracy : allAccuracy.slice(-range);

  const data = {
    labels,
    datasets: [
      {
        label: "Scenario Accuracy (%)",
        data: dataPoints,
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.2)", // Tailwind blue-500 20%
        borderColor: "#3b82f6",                   // Tailwind blue-500
        pointBackgroundColor: "#3b82f6",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,    // allow manual height
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

  // width per point in px; adjust as needed
  const pointWidth = 60;
  const minWidth = labels.length * pointWidth;

  return (
    <div className="w-full md:w-10/12 border bg-white mt-8 dark:bg-gray-900 p-6 rounded-3xl shadow-lg">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer mb-4"
      >
              <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-300">
        📊 Scenario Accuracy Over Time
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
            className={`py-1 px-3 text-sm rounded-md font-medium transition ${
              range === d
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300"
            }`}
          >
            {d === "all" ? "All" : `Last ${d} Days`}
          </button>
        ))}
      </div>

      {/* Scrollable chart container */}
      <div className=" Overflow-x-auto flex flex-col lg:flex-row gap-6 items-start ">
        <div
          className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]"
          style={{ minWidth: `${minWidth}px` }}
        >
          <Line data={data} options={options} />
        </div>
      </div>
      </div>

    </div>
  );
}
