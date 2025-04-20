import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { ChevronDown, ChevronRight } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function DashboardCharts() {
  const [activeChart, setActiveChart] = useState("bar");
  const [range, setRange] = useState(7);
  const storedIsOpen = localStorage.getItem('isOpen');
  const [isOpen, setIsOpen] = useState(storedIsOpen === 'false' ? false : true);

  useEffect(() => {
    localStorage.setItem('isOpen', isOpen);
  }, [isOpen]);

  const labelsAll = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const baseDataAll = [
    2, 5, 3, 7, 8, 6, 10, 4, 9, 2.5, 3.5, 6.2, 7.1, 5.3, 8.4,
    6.8, 7.7, 5.5, 4.4, 3.3, 6.6, 8.8, 9.9, 4.1, 5.2, 6.3, 7.4,
    8.5, 4.6, 2.7
  ];

  const sliceStart = range === "all" ? 0 : labelsAll.length - range;
  const labels = labelsAll.slice(sliceStart);
  const baseData = baseDataAll.slice(sliceStart);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Total Simulations",
        data: baseData,
        backgroundColor: "orange",
        borderRadius: 10,
      },
    ],
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

  const colorPalette = [
    "#FFA500", "#FFB347", "#FFD700", "#FFC107", "#FF8C00", "#FFA07A", "#FF6347",
    "#FF7F50", "#FF4500", "#FF6F61", "#FDB813", "#F28C28", "#F5A623", "#00CED1",
    "#20B2AA", "#3CB371", "#32CD32", "#ADFF2F", "#7FFF00", "#9ACD32", "#6B8E23",
    "#556B2F", "#8FBC8F", "#2E8B57", "#4682B4", "#1E90FF", "#4169E1", "#6A5ACD",
    "#8A2BE2", "#9370DB"
  ];

  const pieData = {
    labels: labels,
    datasets: [
      {
        label: "Simulations",
        data: baseData,
        backgroundColor: colorPalette.slice(0, baseData.length),
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
      tooltip: { mode: "index", intersect: false },
    },
  };

  return (
    <div className="w-full md:w-10/12 border p-6 mt-8 bg-white dark:bg-gray-900 rounded-3xl shadow-lg">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer mb-4"
      >
        <h3 className="text-xl font-semibold text-blue-500 dark:text-blue-300">
          Total Simulations Run
        </h3>
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

        <div>
          {activeChart === "bar" && (
            <div className="overflow-x-auto relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
              <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
                <Bar data={chartData} options={commonOptions} />
              </div>
            </div>
          )}

          {activeChart === "line" && (
            <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
              <Line data={chartData} options={commonOptions} />
            </div>
          )}

{activeChart === "pie" && (
  <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
    <Doughnut data={pieData} options={pieOptions} />
  </div>
)}

        </div>
      </div>
    </div>
  );
}
