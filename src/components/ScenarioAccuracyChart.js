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
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // whenever card expands or range changes, show skeleton then chart
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const t = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(t);
    }
  }, [isOpen, range]);

  const labels = range === "all" ? allLabels : allLabels.slice(-range);
  const dataPoints = range === "all" ? allAccuracy : allAccuracy.slice(-range);

  const data = {
    labels,
    datasets: [
      {
        label: "Scenario Accuracy (%)",
        data: dataPoints,
        fill: true,
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        borderColor: "#10b981",
        pointBackgroundColor: "#059669",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        right: 30,
        bottom: 20,
        left: 10
      }
    },
    plugins: {
      legend: {
        position: "top",
        labels: { 
          color: "#374151", 
          font: { size: 14, weight: 'bold' },
          padding: 25,
          usePointStyle: true,
          pointStyle: 'circle'
        },
      },
      tooltip: { 
        mode: "index", 
        intersect: false,
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#f9fafb",
        bodyColor: "#f3f4f6",
        borderColor: "#10b981",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      },
    },
    scales: {
      x: {
        ticks: { 
          color: "#6b7280", 
          autoSkip: false,
          font: { size: 12, weight: '500' },
          padding: 8
        },
        title: { 
          display: true, 
          text: "Date", 
          color: "#059669", 
          font: { weight: "bold", size: 14 },
          padding: { top: 15 }
        },
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
          drawBorder: false
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { 
          color: "#6b7280",
          font: { size: 12, weight: '500' },
          padding: 8,
          stepSize: 10,
          callback: function(value) {
            return value + '%';
          }
        },
        title: { 
          display: true, 
          text: "Accuracy (%)", 
          color: "#059669", 
          font: { weight: "bold", size: 14 },
          padding: { bottom: 15 }
        },
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
          drawBorder: false
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        hoverBackgroundColor: "#047857",
        hoverBorderColor: "#ffffff",
        hoverBorderWidth: 3
      }
    }
  };

  const pointWidth = 60;
  const minWidth = labels.length * pointWidth;

  return (
    <div className="w-full mt-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-emerald-500/20 transition-all duration-300 ease-in-out px-6 py-6 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl hover:shadow-2xl">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer mb-4 group"
      >
        <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-200">
          📈 Scenario Prediction Accuracy Over Time
        </h2>
        {isOpen ? (
          <ChevronDown className="text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-600 transition-colors duration-200" />
        ) : (
          <ChevronRight className="text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-600 transition-colors duration-200" />
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
              className={`py-2 px-4 text-sm rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                range === d
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md"
              }`}
            >
              {d === "all" ? "All Data" : `${d} Days`}
            </button>
          ))}
        </div>

        {/* Chart area or skeleton */}
        <div className="relative w-full max-w-5xl mx-auto h-[50vh] sm:h-[45vh] md:h-[40vh] lg:h-[35vh] xl:h-[30vh] overflow-x-auto transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          {isLoading ? (
            <div className="w-full h-full relative overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-gray-500/20 animate-shimmer" 
                   style={{
                     backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                     backgroundSize: '200% 100%',
                     animation: 'shimmer 1.5s ease-in-out infinite'
                   }} />
              <div className="absolute top-4 left-4 w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
              <div className="absolute bottom-4 left-4 right-4 h-2 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
              <div className="absolute bottom-8 left-4 w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
              <div className="absolute bottom-16 left-16 w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
              <div className="absolute bottom-12 left-24 w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
            </div>
          ) : (
            <div
              className="relative"
              style={{ minWidth: `${minWidth}px`, height: "250%" }}
            >
              <Suspense fallback={
                <div className="w-full h-full relative overflow-hidden rounded-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
                </div>
              }>
                <Line data={data} options={options} />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}