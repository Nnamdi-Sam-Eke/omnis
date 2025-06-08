import React, { useState, useEffect, Suspense } from "react";
import { ChevronRight, ChevronUp } from "lucide-react";
import SkeletonLoader from './SkeletonLoader'; // Ensure this component exists and is styled

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = React.lazy(() =>
  import("react-chartjs-2").then((module) => ({ default: module.Bar }))
);

const allUsersData = [
  { userId: "user1", simulations: 5 },
  { userId: "user2", simulations: 15 },
  { userId: "user3", simulations: 50 },
  { userId: "user4", simulations: 200 },
  { userId: "user5", simulations: 30 },
  { userId: "user6", simulations: 120 },
];

export default function SimulationByUserChart() {
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem("simulationByUserIsExpanded");
    return stored === "false" ? false : true;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("simulationByUserIsExpanded", isExpanded);
    if (isExpanded) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isExpanded]);

  const aggregateData = () => {
    const sortedData = allUsersData.sort((a, b) => b.simulations - a.simulations);
    const totalUsers = sortedData.length;
    const highCount = Math.ceil(totalUsers * 0.2);
    const mediumCount = Math.ceil(totalUsers * 0.3);
    const lowCount = totalUsers - highCount - mediumCount;

    const high = sortedData.slice(0, highCount).reduce((sum, user) => sum + user.simulations, 0);
    const medium = sortedData.slice(highCount, highCount + mediumCount).reduce((sum, user) => sum + user.simulations, 0);
    const low = sortedData.slice(highCount + mediumCount).reduce((sum, user) => sum + user.simulations, 0);

    return { high, medium, low };
  };

  const { high, medium, low } = aggregateData();

  const chartData = {
    labels: ["High Activity", "Medium Activity", "Low Activity"],
    datasets: [
      {
        label: "Total Simulations",
        data: [high, medium, low],
        backgroundColor: ["#3b82f6", "#34d399", "#fbbf24"],
        borderColor: ["#2563eb", "#10b981", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="bg-white dark:bg-gray-800 mt-8 border w-full  hover:shadow-blue-500/50 transition px-6 py-6 border p-6 mt-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg transition-all duration-300 ease-in-out rounded-2xl shadow-md transition-all duration-300 ease-in-out">
      <div
        className="flex justify-between items-center cursor-pointer mb-4"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
      >
        <h2 className="text-xl font-semibold  text-green-500 dark:text-green-500">
          Simulation By User
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
          <div className="relative w-full max-w-5xl mx-auto h-[50vh]">
            {loading ? (
              <SkeletonLoader height="h-full" />
            ) : (
              <Suspense fallback={<SkeletonLoader height="h-full" />}>
                <BarChart data={chartData} options={options} />
              </Suspense>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
