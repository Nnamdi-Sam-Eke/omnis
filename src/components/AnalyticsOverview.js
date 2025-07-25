// File: AnalyticsOverview.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../AuthContext';

Chart.register(...registerables);

// Reusable KPI card component
const KpiCard = ({ title, value, icon }) => (
  <motion.div
    className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center hover:shadow-2xl transition-shadow"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {icon && <div className="text-4xl mb-2 text-blue-500">{icon}</div>}
    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h4>
    <p className="text-3xl font-bold text-green-500 mt-2">{value}</p>
  </motion.div>
);

// Fix: Merge time periods correctly in SECONDS
const mergeTimePeriods = (periods) => {
  if (periods.length === 0) return [];
  const periodsInSeconds = periods.map(p => ({
    start: Math.floor(p.start / 1000),
    end: Math.floor(p.end / 1000),
  }));
  const sorted = periodsInSeconds.sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    if (current.start <= last.end + 1) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }
  return merged;
};

const calculateTotalUptime = (mergedPeriods) => {
  return mergedPeriods.reduce((total, p) => total + (p.end - p.start), 0);
};

// Next reset indicator component
const NextResetIndicator = () => {
  const [timeUntilReset, setTimeUntilReset] = useState('');
  
  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  useEffect(() => {
    setTimeUntilReset(getTimeUntilMidnight());
    const interval = setInterval(() => {
      setTimeUntilReset(getTimeUntilMidnight());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="text-xs text-gray-400 mt-2 text-center">
      🌙 Auto-reset in: {timeUntilReset}
    </div>
  );
};

export default function AnalyticsOverview() {
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalScenarios, setTotalScenarios] = useState(0);
  const [dailyUptime, setDailyUptime] = useState(0);
  const [uptimeHistory, setUptimeHistory] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [uptimePeriods, setUptimePeriods] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const { user } = useAuth();
  const todayKey = new Date().toISOString().split('T')[0];

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const clearTodaysData = () => {
    localStorage.removeItem(`uptimePeriods_${todayKey}`);
    localStorage.removeItem(`sessionCount_${todayKey}`);
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('sessionActive');
    
    // Reset state
    setTotalSessions(0);
    setTotalScenarios(0);
    setDailyUptime(0);
    setUptimeHistory([]);
    setSessionActive(false);
    setUptimePeriods([]);
    
    // Start fresh session
    startSession();
  };

  const loadLocalUptime = () => {
    const stored = localStorage.getItem(`uptimePeriods_${todayKey}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUptimePeriods(parsed);
        const merged = mergeTimePeriods(parsed);
        const totalSeconds = calculateTotalUptime(merged);
        setDailyUptime(totalSeconds);
        const sessionCount = parseInt(localStorage.getItem(`sessionCount_${todayKey}`) || '0', 10);
        setTotalSessions(sessionCount);
        return parsed;
      } catch (e) {
        console.error('Error loading uptime:', e);
        setUptimePeriods([]);
        return [];
      }
    }
    return [];
  };

  const saveSessionPeriod = (start, end) => {
    const stored = localStorage.getItem(`uptimePeriods_${todayKey}`);
    let periods = [];
    if (stored) {
      try {
        periods = JSON.parse(stored);
      } catch (e) {
        console.error('Parsing error:', e);
      }
    }
    periods.push({ start, end });
    localStorage.setItem(`uptimePeriods_${todayKey}`, JSON.stringify(periods));
    const count = parseInt(localStorage.getItem(`sessionCount_${todayKey}`) || '0', 10);
    localStorage.setItem(`sessionCount_${todayKey}`, (count + 1).toString());
    return periods;
  };

  const startSession = () => {
    if (!sessionActive) {
      localStorage.setItem('sessionStart', Date.now());
      localStorage.setItem('sessionActive', 'true');
      setSessionActive(true);
    }
  };

  // 🌙 AUTOMATIC MIDNIGHT RESET SYSTEM
  useEffect(() => {
    let lastKnownDate = new Date().toISOString().split('T')[0];
    
    const checkForDayChange = () => {
      const currentDate = new Date().toISOString().split('T')[0];
      
      if (currentDate !== lastKnownDate) {
        console.log(`🔄 Day changed from ${lastKnownDate} to ${currentDate}`);
        
        // Clear previous day's data
        localStorage.removeItem(`uptimePeriods_${lastKnownDate}`);
        localStorage.removeItem(`sessionCount_${lastKnownDate}`);
        localStorage.removeItem('sessionStart');
        localStorage.removeItem('sessionActive');
        
        // Reset component state
        setTotalSessions(0);
        setTotalScenarios(0);
        setDailyUptime(0);
        setUptimeHistory([]);
        setSessionActive(false);
        setUptimePeriods([]);
        
        lastKnownDate = currentDate;
        
        // Start fresh session for new day
        setTimeout(() => startSession(), 100);
      }
    };

    // Calculate milliseconds until next midnight
    const getMsUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      return midnight.getTime() - now.getTime();
    };

    // Set up midnight timer
    const scheduleNextMidnightReset = () => {
      const msUntilMidnight = getMsUntilMidnight();
      
      const midnightTimeout = setTimeout(() => {
        console.log('🌅 Midnight reset triggered');
        clearTodaysData();
        scheduleNextMidnightReset(); // Schedule next day
      }, msUntilMidnight);
      
      console.log(`⏰ Midnight reset scheduled in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
      
      return midnightTimeout;
    };

    // Check every minute for day changes (handles edge cases)
    const dayChangeInterval = setInterval(checkForDayChange, 60000);
    
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForDayChange();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial check and schedule
    checkForDayChange();
    const midnightTimeout = scheduleNextMidnightReset();
    
    // Cleanup
    return () => {
      clearInterval(dayChangeInterval);
      clearTimeout(midnightTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Only run once on mount

  useEffect(() => {
    const active = localStorage.getItem('sessionActive') === 'true';
    setSessionActive(active);
    loadLocalUptime();
    if (!active) startSession();
  }, [todayKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionActive) {
        const start = parseInt(localStorage.getItem('sessionStart'), 10);
        if (start) {
          const stored = localStorage.getItem(`uptimePeriods_${todayKey}`);
          let periods = [];
          if (stored) {
            try {
              periods = JSON.parse(stored);
            } catch {}
          }
          const now = Date.now();
          const allPeriods = [...periods, { start, end: now }];
          const merged = mergeTimePeriods(allPeriods);
          const currentUptime = calculateTotalUptime(merged);
          setDailyUptime(currentUptime);
          
          // Update last update time
          setLastUpdateTime(now);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, todayKey]);

  // Enhanced chart update effect - updates every minute
  useEffect(() => {
    const chartInterval = setInterval(() => {
      if (sessionActive) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const uptimeMinutes = Math.floor(dailyUptime / 60);
        
        setUptimeHistory(prev => {
          const newHistory = [...prev, {
            time: timeStr,
            uptime: uptimeMinutes,
            timestamp: now.getTime()
          }];
          
          // Keep only last 60 data points (1 hour of data)
          return newHistory.slice(-60);
        });
      }
    }, 60000); // Update every minute

    return () => clearInterval(chartInterval);
  }, [sessionActive, dailyUptime]);

  useEffect(() => {
    const onHidden = () => {
      if (document.hidden && sessionActive) {
        const start = parseInt(localStorage.getItem('sessionStart'), 10);
        if (start) {
          saveSessionPeriod(start, Date.now());
          localStorage.setItem('sessionActive', 'false');
          setSessionActive(false);
          loadLocalUptime();
        }
      } else if (!document.hidden && !sessionActive) {
        startSession();
      }
    };
    const beforeUnload = () => {
      if (sessionActive) {
        const start = parseInt(localStorage.getItem('sessionStart'), 10);
        if (start) saveSessionPeriod(start, Date.now());
        localStorage.setItem('sessionActive', 'false');
      }
    };

    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [sessionActive, todayKey]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const userId = user.uid;
        const today = new Date();
        const start = new Date(today.setHours(0, 0, 0, 0));
        const end = new Date(today.setHours(23, 59, 59, 999));
        const q = query(
          collection(db, 'userInteractions'),
          where('userId', '==', userId),
          where('action', '==', 'simulate_scenario'),
          where('timestamp', '>=', Timestamp.fromDate(start)),
          where('timestamp', '<=', Timestamp.fromDate(end))
        );
        const snap = await getDocs(q);
        setTotalScenarios(snap.size);
      } catch (e) {
        console.error("Fetch error:", e);
      }
    };
    fetch();
  }, [user]);

  // Modern chart styling with gradient and improved visuals
  const chartData = {
    labels: uptimeHistory.map(e => e.time),
    datasets: [{
      label: 'Uptime (minutes)',
      data: uptimeHistory.map(e => e.uptime),
      borderColor: '#06b6d4',
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;
        
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.1)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.05)');
        return gradient;
      },
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: '#06b6d4',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: '#0891b2',
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 3,
      shadowColor: 'rgba(6, 182, 212, 0.3)',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#6b7280',
          font: {
            size: 14,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#06b6d4',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13,
          weight: '400'
        },
        padding: 12,
        callbacks: {
          title: (context) => `Time: ${context[0].label}`,
          label: (context) => `Uptime: ${context.parsed.y} minutes`,
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          color: '#6b7280',
          font: {
            size: 13,
            weight: '500'
          }
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12
          },
          maxTicksLimit: 10,
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          borderDash: [3, 3],
        },
        border: {
          color: 'rgba(156, 163, 175, 0.2)',
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Minutes',
          color: '#6b7280',
          font: {
            size: 13,
            weight: '500'
          }
        },
        beginAtZero: true,
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12
          },
          callback: (value) => `${value}m`
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          borderDash: [3, 3],
        },
        border: {
          color: 'rgba(156, 163, 175, 0.2)',
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    }
  };

  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <KpiCard title="Total Sessions Today" value={totalSessions} icon={<i className="fas fa-history" />} />
        <KpiCard title="Scenarios Run Today" value={totalScenarios} icon={<i className="fas fa-tasks" />} />
        <KpiCard title="Total Uptime Today" value={formatUptime(dailyUptime)} icon={<i className="fas fa-clock" />} />
      </div>

      <motion.div 
        className="p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              📈 Live Uptime Trend
            </h2>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
          </div>
        </div>
        
        <div className="h-96 relative">
          <Line data={chartData} options={chartOptions} />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            📊 Updates every minute • {uptimeHistory.length} data points • Session: {sessionActive ? '🟢 Active' : '🔴 Inactive'}
          </p>
          <div className="flex justify-center gap-6 text-xs text-gray-400">
            <span>🔄 Auto-refresh: 1min</span>
            <span>📈 Chart history: 1hr</span>
            <span>💾 Data retention: 24hr</span>
          </div>
        </div>
        
        <NextResetIndicator />
      </motion.div>

      <div className="mt-10 text-center">
        <p className="text-gray-500 mb-2">Click to view full analytics</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/analytics')}
          className="px-6 py-3 bg-yellow-400 dark:bg-yellow-500 text-black dark:text-white rounded-xl shadow hover:bg-yellow-500 dark:hover:bg-yellow-600 transition"
        >
          📊 View Full Analytics
        </motion.button>
        <br />
        <button onClick={clearTodaysData} className="mt-4 text-xs underline text-red-500">
          Clear Today's Data (Manual)
        </button>
      </div>
    </div>
  );
}