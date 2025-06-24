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

function AnalyticsButton() {
  const navigate = useNavigate();
  const actions = [
    {
      label: "📈 View Full Analytics ",
      bgColor: "bg-primary",
      textColor: "text-black",
      hoverColor: "hover:bg-primary/90",
      darkBgColor: "dark:bg-yellow-500",
      darkTextColor: "dark:text-white",
      darkHoverColor: "dark:hover:bg-yellow-500",
      glow: "rgba(59, 130, 246, 0.6)",
      darkGlow: "rgba(202, 138, 4, 0.6)",
      onClick: () => navigate("/analytics"),
    },
  ];

  return (
    <div className="flex justify-center mt-2">
      {actions.map((action, index) => (
        <motion.button
          key={index}
          whileHover={{
            scale: 1.05,
            boxShadow: `0px 0px 12px ${document.documentElement.classList.contains('dark') ? action.darkGlow : action.glow}`,
          }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className={`${action.bgColor} ${action.hoverColor} ${action.textColor} 
                      ${action.darkBgColor} ${action.darkHoverColor} ${action.darkTextColor}
                      rounded-2xl px-6 py-3 text-lg shadow-2xl transition-all`}
        >
          {action.label}
        </motion.button>
      ))}
    </div>
  );
}

// Helper function to merge overlapping time periods
const mergeTimePeriods = (periods) => {
  if (periods.length === 0) return [];
  
  // Sort periods by start time
  const sorted = periods.sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const lastMerged = merged[merged.length - 1];
    
    // If current period overlaps with the last merged period, merge them
    if (current.start <= lastMerged.end) {
      lastMerged.end = Math.max(lastMerged.end, current.end);
    } else {
      // No overlap, add as new period
      merged.push(current);
    }
  }
  
  return merged;
};

// Calculate total uptime from merged periods
const calculateTotalUptime = (mergedPeriods) => {
  return mergedPeriods.reduce((total, period) => {
    return total + (period.end - period.start);
  }, 0);
};

export default function AnalyticsOverview() {
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalScenarios, setTotalScenarios] = useState(0);
  const [dailyUptime, setDailyUptime] = useState(0);
  const [uptimeHistory, setUptimeHistory] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [uptimePeriods, setUptimePeriods] = useState([]);

  const { user } = useAuth();
  const todayKey = new Date().toISOString().split('T')[0];

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const startSession = () => {
    if (!sessionActive) {
      const now = Date.now();
      localStorage.setItem('sessionStart', now);
      localStorage.setItem('sessionActive', 'true');
      setSessionActive(true);
    }
  };

  useEffect(() => {
    const active = localStorage.getItem('sessionActive') === 'true';
    setSessionActive(active);
    
    // Load stored uptime periods for today
    const storedPeriods = localStorage.getItem(`uptimePeriods_${todayKey}`);
    if (storedPeriods) {
      try {
        const periods = JSON.parse(storedPeriods);
        setUptimePeriods(periods);
        
        // Calculate total uptime from stored periods
        const mergedPeriods = mergeTimePeriods(periods);
        const totalSeconds = Math.floor(calculateTotalUptime(mergedPeriods) / 1000);
        setDailyUptime(totalSeconds);
      } catch (e) {
        console.error('Error parsing stored uptime periods:', e);
        setUptimePeriods([]);
      }
    }
    
    if (!active) startSession();
  }, [todayKey]);

  useEffect(() => {
    // Update uptime display every second for real-time tracking
    const uptimeInterval = setInterval(() => {
      if (sessionActive) {
        const startTs = parseInt(localStorage.getItem('sessionStart'), 10);
        if (startTs) {
          // Get stored periods
          const storedPeriods = localStorage.getItem(`uptimePeriods_${todayKey}`);
          let periods = [];
          if (storedPeriods) {
            try {
              periods = JSON.parse(storedPeriods);
            } catch (e) {
              console.error('Error parsing stored periods:', e);
            }
          }
          
          // Add current active session period
          const currentPeriod = { start: startTs, end: Date.now() };
          const allPeriods = [...periods, currentPeriod];
          
          // Merge overlapping periods and calculate total uptime
          const mergedPeriods = mergeTimePeriods(allPeriods);
          const totalMs = calculateTotalUptime(mergedPeriods);
          const totalSeconds = Math.floor(totalMs / 1000);
          
          setDailyUptime(totalSeconds);
        }
      }
    }, 1000);

    // Update chart history every minute
    const chartInterval = setInterval(() => {
      if (sessionActive) {
        setUptimeHistory((prevHist) => [
          ...prevHist,
          { 
            time: new Date().toLocaleTimeString(), 
            uptime: Math.floor(dailyUptime / 60) // show minutes in chart
          },
        ]);
      }
    }, 60000);

    return () => {
      clearInterval(uptimeInterval);
      clearInterval(chartInterval);
    };
  }, [sessionActive, todayKey, dailyUptime]);

  // Handle page visibility changes to properly track uptime
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, end current session
        if (sessionActive) {
          const startTs = parseInt(localStorage.getItem('sessionStart'), 10);
          if (startTs) {
            const endTs = Date.now();
            
            // Save this uptime period
            const storedPeriods = localStorage.getItem(`uptimePeriods_${todayKey}`);
            let periods = [];
            if (storedPeriods) {
              try {
                periods = JSON.parse(storedPeriods);
              } catch (e) {
                console.error('Error parsing stored periods:', e);
              }
            }
            
            periods.push({ start: startTs, end: endTs });
            localStorage.setItem(`uptimePeriods_${todayKey}`, JSON.stringify(periods));
            localStorage.setItem('sessionActive', 'false');
            setSessionActive(false);
          }
        }
      } else {
        // Page is visible again, start new session
        if (!sessionActive) {
          startSession();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also handle beforeunload to save session when page is closed
    const handleBeforeUnload = () => {
      if (sessionActive) {
        const startTs = parseInt(localStorage.getItem('sessionStart'), 10);
        if (startTs) {
          const endTs = Date.now();
          
          const storedPeriods = localStorage.getItem(`uptimePeriods_${todayKey}`);
          let periods = [];
          if (storedPeriods) {
            try {
              periods = JSON.parse(storedPeriods);
            } catch (e) {
              console.error('Error parsing stored periods:', e);
            }
          }
          
          periods.push({ start: startTs, end: endTs });
          localStorage.setItem(`uptimePeriods_${todayKey}`, JSON.stringify(periods));
          localStorage.setItem('sessionActive', 'false');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionActive, todayKey]);

  useEffect(() => {
    const fetchSessionsToday = async () => {
      try {
        console.log("🔍 Starting to fetch today's sessions...");

        if (!user) {
          console.log("❌ User not authenticated yet, waiting...");
          return;
        }

        const userId = user.uid;
        if (!userId) {
          console.log("❌ No user ID found");
          return;
        }

        console.log("✅ Current user ID:", userId);

        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        const sessionsRef = collection(db, 'users', userId, 'sessions');
        const todaySessionsQuery = query(
          sessionsRef,
          where('start', '>=', Timestamp.fromDate(startOfDay)),
          where('start', '<=', Timestamp.fromDate(endOfDay))
        );

        const todaySessionsSnapshot = await getDocs(todaySessionsQuery);
        console.log(`📊 Sessions found for today: ${todaySessionsSnapshot.size}`);

        // Just count sessions, don't sum their durations for uptime
        setTotalSessions(todaySessionsSnapshot.size);

        // Extract time periods from Firebase sessions for more accurate uptime
        const firebasePeriods = [];
        todaySessionsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const startTime = data.start?.toDate?.()?.getTime();
          const duration = Number(data.duration) * 1000; // Convert to milliseconds
          
          if (startTime && !isNaN(duration) && duration > 0) {
            firebasePeriods.push({
              start: startTime,
              end: startTime + duration
            });
          }
        });

        // Merge with locally stored periods
        const storedPeriods = localStorage.getItem(`uptimePeriods_${todayKey}`);
        let localPeriods = [];
        if (storedPeriods) {
          try {
            localPeriods = JSON.parse(storedPeriods);
          } catch (e) {
            console.error('Error parsing stored periods:', e);
          }
        }

        // Combine all periods and calculate true uptime
        const allPeriods = [...firebasePeriods, ...localPeriods];
        if (allPeriods.length > 0) {
          const mergedPeriods = mergeTimePeriods(allPeriods);
          const totalMs = calculateTotalUptime(mergedPeriods);
          const totalSeconds = Math.floor(totalMs / 1000);
          
          setUptimePeriods(mergedPeriods);
          setDailyUptime(totalSeconds);
          
          console.log(`⏰ True uptime for today: ${formatUptime(totalSeconds)} (${totalSeconds} seconds)`);
          console.log(`📊 Based on ${mergedPeriods.length} merged time periods`);
        }

      } catch (err) {
        console.error("❌ Error fetching today's sessions:", err);
        if (err.code === 'permission-denied') {
          console.error("🔒 Firestore permission denied — check your rules.");
        }
      }
    };

    if (user) {
      console.log("🚀 Sessions fetch effect triggered, user ID:", user.uid);
      fetchSessionsToday();
    } else {
      console.log("🚀 Sessions fetch effect triggered, but no user yet");
    }
  }, [user, todayKey]);

  useEffect(() => {
    const fetchScenariosToday = async () => {
      try {
        if (!user) {
          console.log("User not authenticated yet, waiting...");
          return;
        }

        const userId = user.uid;
        if (!userId) {
          console.log("No user ID found");
          return;
        }

        console.log("Current user ID:", userId);

        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        
        console.log("Date range:", { startOfDay, endOfDay });

        const userInteractionsRef = collection(db, 'userInteractions');
        const allUserInteractionsQuery = query(
          userInteractionsRef,
          where('userId', '==', userId)
        );

        const allSnapshot = await getDocs(allUserInteractionsQuery);
        console.log(`Total user interactions found: ${allSnapshot.size}`);
        
        allSnapshot.docs.slice(0, 3).forEach((doc, index) => {
          console.log(`Document ${index}:`, doc.data());
        });

        const todayQuery = query(
          userInteractionsRef,
          where('userId', '==', userId),
          where('action', '==', 'simulate_scenario'),
          where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
          where('timestamp', '<=', Timestamp.fromDate(endOfDay))
        );

        const todaySnapshot = await getDocs(todayQuery);
        console.log(`Scenarios run today: ${todaySnapshot.size}`);
        
        todaySnapshot.docs.forEach((doc, index) => {
          console.log(`Today's scenario ${index}:`, doc.data());
        });

        setTotalScenarios(todaySnapshot.size);
        
      } catch (err) {
        console.error("Error fetching today's scenarios:", err);
        console.error("Error details:", err.message);
      }
    };

    fetchScenariosToday();
  }, [user]);

  const chartData = {
    labels: uptimeHistory.map((e) => e.time),
    datasets: [
      {
        label: 'Uptime (minutes)',
        data: uptimeHistory.map((e) => e.uptime),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#059669',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          color: '#6b7280',
          font: {
            size: 14,
            weight: '600'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#10b981',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13,
          weight: '500'
        },
        padding: 12,
        callbacks: {
          title: function(context) {
            return `Time: ${context[0].label}`;
          },
          label: function(context) {
            return `Uptime: ${context.parsed.y} minutes`;
          }
        }
      },
    },
    scales: {
      x: { 
        title: { 
          display: true, 
          text: 'Time',
          color: '#6b7280',
          font: {
            size: 12,
            weight: '600'
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
      y: { 
        beginAtZero: true, 
        title: { 
          display: true, 
          text: 'Minutes',
          color: '#6b7280',
          font: {
            size: 12,
            weight: '600'
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
    },
    animation: { 
      duration: 1200,
      easing: 'easeOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  return (
    <div className="analytics-overview p-6 bg-gray-50 dark:bg-gray-800 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <KpiCard title="Total Sessions Today" value={totalSessions} icon={<i className="fas fa-history" />} />
        <KpiCard title="Scenarios Run Today" value={totalScenarios} icon={<i className="fas fa-tasks" />} />
        <KpiCard title="Total Uptime Today" value={formatUptime(dailyUptime)} icon={<i className="fas fa-clock" />} />
      </div>

      <motion.div
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            📈  Uptime Trend
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Live Tracking</span>
          </div>
        </div>
        <div className="h-80 relative">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Actual uptime periods • Merges overlapping sessions • Updates every minute
        </div>
      </motion.div>

      <div className="mt-12 text-center text-gray-700 dark:text-gray-400">
        <p className="mb-4 text-lg font-medium">
          Click this button to view the full analytics
        </p>
        <AnalyticsButton />
      </div>
    </div>
  );
}