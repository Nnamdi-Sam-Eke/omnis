import React, { useState, useEffect, lazy, Suspense, forwardRef } from 'react';
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
        '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16'
      ],
      borderColor: [
        '#0284c7', '#0891b2', '#0d9488', '#059669', '#16a34a', '#65a30d'
      ],
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverBorderColor: '#ffffff',
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#64748b',
        font: { size: 13, weight: '500' },
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: "rgba(8, 51, 68, 0.95)",
      titleColor: "#f8fafc",
      bodyColor: "#e2e8f0",
      borderColor: "#0ea5e9",
      borderWidth: 1,
      cornerRadius: 12,
      displayColors: true,
      padding: 14,
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
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

const CategoryDistributionChart = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div
      ref={ref}
      className="w-full mt-8 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-teal-900/20 hover:shadow-cyan-500/25 transition-all duration-500 ease-out px-8 py-8 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-2xl hover:shadow-cyan-500/30 backdrop-blur-sm"
    >
      <div
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center justify-between cursor-pointer mb-6 group"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl shadow-lg">
            <span className="text-white text-lg font-bold">🌍</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 dark:from-cyan-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent group-hover:from-cyan-700 group-hover:via-teal-700 group-hover:to-emerald-700 dark:group-hover:from-cyan-300 dark:group-hover:via-teal-300 dark:group-hover:to-emerald-300 transition-all duration-300">
            Scenario Category Distribution
          </h2>
        </div>
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-800/50 dark:to-teal-800/50 rounded-xl group-hover:from-cyan-200 group-hover:to-teal-200 dark:group-hover:from-cyan-700/60 dark:group-hover:to-teal-700/60 transition-all duration-300">
          {isOpen ? (
            <ChevronDown className="text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-200" size={20} />
          ) : (
            <ChevronRight className="text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-200" size={20} />
          )}
        </div>
      </div>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="h-96 flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-white via-slate-50/50 to-cyan-50/30 dark:from-slate-800 dark:via-slate-800/80 dark:to-teal-900/20 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-inner p-6">
          {isLoading ? (
            <div className="w-full h-full relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-cyan-100 to-slate-200 dark:from-slate-700 dark:via-cyan-800/30 dark:to-slate-700 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-cyan-400/10 animate-shimmer"
                   style={{
                     backgroundImage: 'linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.2), transparent)',
                     backgroundSize: '200% 100%',
                     animation: 'shimmer 2s ease-in-out infinite'
                   }} />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-cyan-300 to-teal-300 dark:from-cyan-600 dark:to-teal-600 rounded-full animate-pulse shadow-2xl" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-full animate-pulse" />
              <div className="absolute top-6 right-6 space-y-2">
                <div className="w-24 h-3 bg-gradient-to-r from-cyan-300 to-teal-300 dark:from-cyan-600 dark:to-teal-600 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gradient-to-r from-teal-300 to-emerald-300 dark:from-teal-600 dark:to-emerald-600 rounded animate-pulse" />
                <div className="w-28 h-3 bg-gradient-to-r from-emerald-300 to-cyan-300 dark:from-emerald-600 dark:to-cyan-600 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <Suspense fallback={
              <div className="w-full h-full relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-cyan-100 to-slate-200 dark:from-slate-700 dark:via-cyan-800/30 dark:to-slate-700 animate-pulse" />
              </div>
            }>
              <DoughnutChart data={chartData} options={chartOptions} />
            </Suspense>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

export default CategoryDistributionChart;
// This component renders a category distribution chart using Chart.js and React.
// It includes a toggleable section with a loading state and a shimmer effect while the chart is loading.