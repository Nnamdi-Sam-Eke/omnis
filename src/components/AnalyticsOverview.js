import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

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

export default function AnalyticsOverview() {
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalScenarios, setTotalScenarios] = useState(0);
  const [dailyUptime, setDailyUptime] = useState(0);
  const [uptimeHistory, setUptimeHistory] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);

  const todayKey = new Date().toISOString().split('T')[0];

  const formatUptime = (ms) => {
    const mins = Math.floor(ms / 60000);
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}h ${m}m`;
  };

  // Start session logic
  const startSession = () => {
    if (!sessionActive) {
      const now = Date.now();
      localStorage.setItem('sessionStart', now);
      localStorage.setItem('sessionActive', 'true');
      setSessionActive(true);
    }
  };

  // End session logic
  const endSession = () => {
    const startTs = parseInt(localStorage.getItem('sessionStart'), 10);
    if (startTs) {
      const elapsed = Date.now() - startTs;
      const prev = parseInt(localStorage.getItem(`dailyUptime_${todayKey}`), 10) || 0;
      const total = prev + elapsed;
      localStorage.setItem(`dailyUptime_${todayKey}`, total);
      setDailyUptime(total);
    }
    localStorage.removeItem('sessionStart');
    localStorage.setItem('sessionActive', 'false');
    setSessionActive(false);
  };

  // Mount: restore session and uptime
  useEffect(() => {
    const active = localStorage.getItem('sessionActive') === 'true';
    setSessionActive(active);
    const storedUptime = parseInt(localStorage.getItem(`dailyUptime_${todayKey}`), 10) || 0;
    setDailyUptime(storedUptime);
    if (!active) startSession();

    window.addEventListener('beforeunload', endSession);
    return () => {
      endSession();
      window.removeEventListener('beforeunload', endSession);
    };
  }, []);

  // Tick every minute to update uptime
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionActive) {
        const startTs = parseInt(localStorage.getItem('sessionStart'), 10);
        if (startTs) {
          const elapsed = Date.now() - startTs;
          const prev = parseInt(localStorage.getItem(`dailyUptime_${todayKey}`), 10) || 0;
          const total = prev + elapsed;
          setDailyUptime(total);
          setUptimeHistory((prevHist) => [
            ...prevHist,
            { time: new Date().toLocaleTimeString(), uptime: Math.floor(total / 60000) },
          ]);
          localStorage.setItem(`dailyUptime_${todayKey}`, total);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [sessionActive]);

  // Load total sessions (for demo, using localStorage)
  useEffect(() => {
    const sessions = parseInt(localStorage.getItem('sessionCount') || '0', 10);
    setTotalSessions(sessions);
  }, []);

  // Fetch today's scenarios from Firestore
  useEffect(() => {
    const fetchScenarios = async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'scenarios'),
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay)
      );
      const snapshot = await getDocs(q);
      setTotalScenarios(snapshot.size);
    };

    fetchScenarios();
  }, []);

  const chartData = {
    labels: uptimeHistory.map((e) => e.time),
    datasets: [
      {
        label: 'Uptime (minutes)',
        data: uptimeHistory.map((e) => e.uptime),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { title: { display: true, text: 'Time' } },
      y: { beginAtZero: true, title: { display: true, text: 'Minutes' } },
    },
    animation: { duration: 800 },
  };

  return (
    <div className="analytics-overview p-6 bg-gray-50 dark:bg-gray-800 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <KpiCard title="Total Sessions Today" value={totalSessions} icon={<i className="fas fa-history" />} />
        <KpiCard title="Scenarios Run Today" value={totalScenarios} icon={<i className="fas fa-tasks" />} />
        <KpiCard title="Daily Uptime" value={formatUptime(dailyUptime)} icon={<i className="fas fa-clock" />} />
      </div>

      <motion.div
        className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Uptime Trend</h3>
        <Line data={chartData} options={chartOptions} />
      </motion.div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={endSession}
          className="px-5 py-3 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition transform hover:scale-105"
        >
          End Session
        </button>
      </div>
    </div>
  );
}
