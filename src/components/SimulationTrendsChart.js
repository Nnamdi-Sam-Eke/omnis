import React, { useState, useEffect, Suspense } from "react";
import { ChevronRight, ChevronUp, TrendingUp, BarChart3 } from "lucide-react";

// Modern Professional Loader Component
const ModernLoader = ({ height = "h-full" }) => {
  return (
    <div className={`${height} flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl`}>
      <div className="relative">
        {/* Orbital rings */}
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-t-violet-500 animate-spin"></div>
        <div className="absolute inset-2 w-16 h-16 rounded-full border-2 border-transparent border-r-cyan-500 animate-spin animation-delay-75" style={{animationDirection: 'reverse'}}></div>
        <div className="absolute inset-4 w-12 h-12 rounded-full border-2 border-transparent border-b-emerald-500 animate-spin animation-delay-150"></div>
        
        {/* Center pulse */}
        <div className="absolute inset-6 w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 animate-pulse shadow-lg"></div>
        
        {/* Floating particles */}
        <div className="absolute -top-2 -left-2 w-2 h-2 bg-violet-400 rounded-full animate-bounce animation-delay-300"></div>
        <div className="absolute -top-2 -right-2 w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-500"></div>
        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-emerald-400 rounded-full animate-bounce animation-delay-700"></div>
        <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-900"></div>
      </div>
      
      <div className="ml-8 text-center">
        <div className="text-lg font-semibold bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
          Loading Analytics
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Preparing your data visualization...
        </div>
      </div>
    </div>
  );
};

// Mock Chart component with tooltips and axis
const LineChart = ({ data, options }) => {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, data: null });
  const maxValue = Math.max(...data.datasets[0].data);
  const minValue = Math.min(...data.datasets[0].data);
  const chartWidth = 340;
  const chartHeight = 160;
  const padding = { left: 40, right: 20, top: 20, bottom: 40 };
  
  const handleMouseMove = (event, value, index, date) => {
    const rect = event.currentTarget.closest('svg').getBoundingClientRect();
    const x = padding.left + (index / (data.datasets[0].data.length - 1)) * chartWidth;
    const y = chartHeight + padding.top - ((value - minValue) / (maxValue - minValue)) * chartHeight;
    
    // Convert SVG coordinates to screen coordinates
    const screenX = (x / (chartWidth + padding.left + padding.right)) * rect.width;
    const screenY = (y / (chartHeight + padding.top + padding.bottom)) * rect.height;
    
    setTooltip({
      show: true,
      x: screenX,
      y: screenY,
      data: { value, date: new Date(date).toLocaleDateString() }
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, data: null });
  };

  // Calculate Y-axis ticks
  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push(Math.round(minValue + (maxValue - minValue) * (i / tickCount)));
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"></div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Simulations</span>
        </div>
        <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
          {data.datasets[0].data[data.datasets[0].data.length - 1]}
        </div>
      </div>
      
      <div className="relative h-64">
        <svg viewBox={`0 0 ${chartWidth + padding.left + padding.right} ${chartHeight + padding.top + padding.bottom}`} className="w-full h-full">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight + padding.top}
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-300 dark:text-slate-600"
          />
          
          {/* X-axis */}
          <line
            x1={padding.left}
            y1={chartHeight + padding.top}
            x2={chartWidth + padding.left}
            y2={chartHeight + padding.top}
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-300 dark:text-slate-600"
          />
          
          {/* Y-axis ticks and labels */}
          {yTicks.map((tick, index) => {
            const y = chartHeight + padding.top - (index / (yTicks.length - 1)) * chartHeight;
            return (
              <g key={index}>
                <line
                  x1={padding.left - 5}
                  y1={y}
                  x2={padding.left}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-slate-300 dark:text-slate-600"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-slate-500 dark:fill-slate-400"
                >
                  {tick}
                </text>
              </g>
            );
          })}
          
          {/* Grid lines */}
          {yTicks.map((tick, index) => {
            const y = chartHeight + padding.top - (index / (yTicks.length - 1)) * chartHeight;
            return (
              <line
                key={index}
                x1={padding.left}
                y1={y}
                x2={chartWidth + padding.left}
                y2={y}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-slate-200 dark:text-slate-700"
                strokeDasharray="2,2"
              />
            );
          })}
          
          {/* X-axis labels */}
          {data.labels.map((label, index) => {
            if (index % Math.ceil(data.labels.length / 6) === 0) {
              const x = padding.left + (index / (data.labels.length - 1)) * chartWidth;
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight + padding.top + 20}
                  textAnchor="middle"
                  className="text-xs fill-slate-500 dark:fill-slate-400"
                >
                  {new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              );
            }
            return null;
          })}
          
          {/* Area fill */}
          <polygon
            points={`${padding.left},${chartHeight + padding.top} ${data.datasets[0].data.map((value, index) => {
              const x = padding.left + (index / (data.datasets[0].data.length - 1)) * chartWidth;
              const y = chartHeight + padding.top - ((value - minValue) / (maxValue - minValue)) * chartHeight;
              return `${x},${y}`;
            }).join(' ')} ${chartWidth + padding.left},${chartHeight + padding.top}`}
            fill="url(#areaGradient)"
          />
          
          {/* Data line */}
          <polyline
            points={data.datasets[0].data.map((value, index) => {
              const x = padding.left + (index / (data.datasets[0].data.length - 1)) * chartWidth;
              const y = chartHeight + padding.top - ((value - minValue) / (maxValue - minValue)) * chartHeight;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {data.datasets[0].data.map((value, index) => {
            const x = padding.left + (index / (data.datasets[0].data.length - 1)) * chartWidth;
            const y = chartHeight + padding.top - ((value - minValue) / (maxValue - minValue)) * chartHeight;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="5"
                fill="white"
                stroke="url(#gradient)"
                strokeWidth="2"
                className="drop-shadow-sm cursor-pointer hover:r-6 transition-all"
                onMouseMove={(e) => handleMouseMove(e, value, index, data.labels[index])}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </svg>
        
        {/* Tooltip */}
        {tooltip.show && tooltip.data && (
          <div
            className="absolute z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-xl pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y - 15,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {tooltip.data.value} simulations
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {tooltip.data.date}
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-slate-800"></div>
          </div>
        )}
      </div>
    </div>
  );
};

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 2000);
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

  const currentValue = filtered[filtered.length - 1]?.simulations || 0;
  const previousValue = filtered[filtered.length - 2]?.simulations || 0;
  const change = currentValue - previousValue;
  const percentChange = previousValue > 0 ? ((change / previousValue) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm mt-8 hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 px-8 py-6 dark:bg-slate-900/80 dark:backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xl hover:scale-[1.02] hover:border-violet-300 dark:hover:border-violet-700">
      <div
        className="flex justify-between items-center cursor-pointer mb-6 group"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              Simulation Analytics
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time performance metrics
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isExpanded && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/30 dark:to-cyan-900/30 rounded-full border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {change > 0 ? '+' : ''}{percentChange}%
              </span>
            </div>
          )}
          
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-violet-100 group-hover:to-cyan-100 dark:group-hover:from-violet-900/30 dark:group-hover:to-cyan-900/30 transition-all duration-300">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300" />
            )}
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-out overflow-hidden ${
          isExpanded ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {isExpanded && (
          <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                    {currentValue}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                    {Math.round(filtered.reduce((acc, curr) => acc + curr.simulations, 0) / filtered.length)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Average</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {[7, 14, 30, "all"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setRange(d)}
                    className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-300 ${
                      range === d
                        ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/30 scale-105"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105"
                    }`}
                  >
                    {d === "all" ? "All Time" : `${d}d`}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
              {loading ? (
                <ModernLoader height="h-full" />
              ) : (
                <Suspense fallback={<ModernLoader height="h-full" />}>
                  <LineChart data={chartData} options={{}} />
                </Suspense>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}