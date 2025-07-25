import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronUp, BarChart3, TrendingUp, PieChart, Activity, Filter, Zap } from "lucide-react";
import {
  Bar,
  Line,
  Pie,
  Doughnut,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler
} from 'chart.js';

// Register all required chart elements and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

// Shimmer loader component
const ShimmerLoader = ({ height = "h-32", width = "w-full", rounded = "rounded" }) => (
  <div className={`${height} ${width} ${rounded} bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%] animate-pulse`}></div>
);

const ScenarioInsightsCard = ({ processedData = [] }) => {
  const [chartType, setChartType] = useState("bar");
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState(0);
  const [loading, setLoading] = useState(true);

  // Dummy fallback with more realistic data
  if (!processedData || processedData.length === 0) {
    processedData = [
      { label: "Performance", value: 85 },
      { label: "Efficiency", value: 72 },
      { label: "Innovation", value: 91 },
      { label: "Sustainability", value: 68 },
      { label: "Growth", value: 79 },
      { label: "Quality", value: 94 }
    ];
  }

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Filter data dynamically
  const filteredData = processedData.filter(item => item.value >= filterValue);

  // Modern gradient colors
  const gradientColors = [
    'rgba(99, 102, 241, 0.8)',   // Indigo
    'rgba(16, 185, 129, 0.8)',   // Emerald
    'rgba(245, 158, 11, 0.8)',   // Amber
    'rgba(239, 68, 68, 0.8)',    // Red
    'rgba(139, 92, 246, 0.8)',   // Violet
    'rgba(236, 72, 153, 0.8)',   // Pink
  ];

  const borderColors = [
    'rgb(99, 102, 241)',
    'rgb(16, 185, 129)',
    'rgb(245, 158, 11)',
    'rgb(239, 68, 68)',
    'rgb(139, 92, 246)',
    'rgb(236, 72, 153)',
  ];

  const chartData = {
    labels: filteredData.map(item => item.label),
    datasets: [
      {
        label: "Scenario Values",
        data: filteredData.map(item => item.value),
        backgroundColor: gradientColors.slice(0, filteredData.length),
        borderColor: borderColors.slice(0, filteredData.length),
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
        pointBackgroundColor: '#ffffff',
        borderRadius: chartType === 'bar' ? 8 : 0,
        borderSkipped: false,
      }
    ]
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
      },
      legend: {
        display: chartType === 'pie' || chartType === 'circular-progress',
        position: 'bottom',
        labels: {
          color: '#6b7280',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
    },
    scales: chartType === 'pie' || chartType === 'circular-progress' ? {} : {
      x: {
        ticks: { 
          color: '#6b7280',
          font: {
            size: 11,
            weight: '500',
          },
        },
        grid: { 
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: { 
          color: '#6b7280',
          font: {
            size: 11,
            weight: '500',
          },
        },
        grid: { 
          color: 'rgba(229, 231, 235, 0.5)',
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const chartOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      ...(chartType === 'circular-progress' && {
        cutout: '70%',
      }),
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case "bar": return <Bar data={chartData} options={chartOptions} />;
      case "line": return <Line data={chartData} options={chartOptions} />;
      case "pie": return <Pie data={chartData} options={chartOptions} />;
      case "circular-progress": return <Doughnut data={chartData} options={chartOptions} />;
      default: return <p className="text-gray-500">Chart type not supported.</p>;
    }
  };

  const getChartIcon = (type) => {
    switch (type) {
      case "bar": return <BarChart3 className="w-4 h-4" />;
      case "line": return <TrendingUp className="w-4 h-4" />;
      case "pie": return <PieChart className="w-4 h-4" />;
      case "circular-progress": return <Activity className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="space-y-4">
          <ShimmerLoader height="h-8" width="w-48" rounded="rounded-lg" />
          <ShimmerLoader height="h-64" width="w-full" rounded="rounded-xl" />
          <div className="flex gap-3">
            <ShimmerLoader height="h-10" width="w-32" rounded="rounded-lg" />
            <ShimmerLoader height="h-10" width="w-32" rounded="rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Scenario Insights
          </h2>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            Analyze trends and patterns from scenario data with interactive visualizations and dynamic filtering.
          </p>

          {/* Chart Type Selector */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <BarChart3 className="w-4 h-4" />
              Chart Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'bar', label: 'Bar Chart' },
                { value: 'line', label: 'Line Chart' },
                { value: 'pie', label: 'Pie Chart' },
                { value: 'circular-progress', label: 'Donut Chart' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setChartType(option.value)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${
                    chartType === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {getChartIcon(option.value)}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Value Filter */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Filter className="w-4 h-4" />
              Minimum Value Filter
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={filterValue}
                onChange={(e) => setFilterValue(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${filterValue}%, #e5e7eb ${filterValue}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0</span>
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium">
                  ≥ {filterValue}
                </span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Chart Preview */}
          <div className="relative">
            <div className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                {getChartIcon(chartType)}
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1).replace('-', ' ')} Preview
                </h3>
              </div>
              <div className="h-64">
                {renderChart()}
              </div>
            </div>
            
            {/* Data Summary */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Showing {filteredData.length} of {processedData.length} scenarios
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Avg: {Math.round(filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #6366f1;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(99, 102, 241, 0.4);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #6366f1;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(99, 102, 241, 0.4);
        }
        
        .animate-in {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ScenarioInsightsCard;