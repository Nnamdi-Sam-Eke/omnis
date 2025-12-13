import React, { useEffect, useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Title,
  Legend,
} from "chart.js";
import { Zap } from "lucide-react";

// Register only what's needed
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Title, Legend);

const ScenarioInsightsCard = ({ processedData = [] }) => {
  const [chartData, setChartData] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // Collapsed by default

  // Stable fallback data to prevent infinite loop
  const defaultData = useMemo(
    () => [
      { label: "Performance", value: 85 },
      { label: "Efficiency", value: 72 },
      { label: "Innovation", value: 91 },
      { label: "Sustainability", value: 68 },
      { label: "Growth", value: 79 },
    ],
    []
  );

  useEffect(() => {
    const dataToUse = processedData.length > 0 ? processedData : defaultData;

    const newChartData = {
      labels: dataToUse.map((item) => item.label),
      datasets: [
        {
          label: "Simulation Insights",
          data: dataToUse.map((item) => item.value),
          backgroundColor: [
            "rgba(99, 102, 241, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(139, 92, 246, 0.8)",
          ],
          borderColor: [
            "rgb(99, 102, 241)",
            "rgb(16, 185, 129)",
            "rgb(245, 158, 11)",
            "rgb(239, 68, 68)",
            "rgb(139, 92, 246)",
          ],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };

    // Only update state if data changed
    setChartData((prev) => {
      return JSON.stringify(prev) !== JSON.stringify(newChartData)
        ? newChartData
        : prev;
    });
  }, [processedData, defaultData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 10,
        padding: 12,
      },
    },
    scales: {
      x: { ticks: { color: "#6b7280" }, grid: { display: false } },
      y: { beginAtZero: true, ticks: { color: "#6b7280" }, grid: { color: "rgba(229, 231, 235, 0.5)" } },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Simulation Insights
          </h2>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 transition font-bold text-xl"
        >
          {isOpen ? "−" : "+"}
        </button>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <>
          {/* Chart Section */}
          <div className="h-72 w-full mb-4">
            {chartData ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                Loading insights...
              </div>
            )}
          </div>

          {/* Footer summary */}
          {processedData.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 flex justify-between">
              <span>{processedData.length} metrics analyzed</span>
              <span>
                Avg:{" "}
                {Math.round(
                  processedData.reduce((s, i) => s + i.value, 0) / processedData.length
                ) || 0}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScenarioInsightsCard;
