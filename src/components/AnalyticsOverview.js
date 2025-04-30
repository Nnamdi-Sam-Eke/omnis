import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns'; // Import the date adapter for Chart.js
import { motion } from 'framer-motion'; // Animation

// KPI Card Component
const KpiCard = ({ title, value }) => {
  return (
    <motion.div 
      className="kpi-card bg-white p-4 rounded shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className="text-lg font-semibold">{title}</h4>
      <p className="text-2xl font-bold text-green-500">{value}</p>
    </motion.div>
  );
};

const AnalyticsOverview = () => {
  const chartRef = useRef(null); // Chart instance
  const canvasRef = useRef(null); // Canvas DOM ref

  const [data, setData] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalScenarios, setTotalScenarios] = useState(0);
  const [dailyUptime, setDailyUptime] = useState(0);

  const formatUptime = (milliseconds) => {
    const totalMinutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
  
    return `${paddedHours}h ${paddedMinutes}m`;
  };

  useEffect(() => {
    trackSessions();
    fetchData();
    fetchScenariosToday();
    const uptimeInterval = setInterval(updateUptime, 60000); // Update uptime every 60 sec

    return () => {
      clearInterval(uptimeInterval);
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const fetchData = async () => {
    const q = query(
      collection(db, 'sessionDurations'),
      orderBy('date', 'desc'),
      limit(30)
    );
    const querySnapshot = await getDocs(q);

    const chartData = [];
    querySnapshot.forEach((doc) => {
      chartData.push({
        x: doc.data().date.toDate(),
        y: doc.data().duration,
      });
    });

    setData(chartData);
    createTrendChart(chartData);
  };

  const fetchScenariosToday = async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'scenarios'),
      where('date', '>=', startOfDay),
      where('date', '<', endOfDay)
    );
    const querySnapshot = await getDocs(q);
    setTotalScenarios(querySnapshot.size);
  };

  const trackSessions = () => {
    const today = new Date().toISOString().split('T')[0];
    const storedSessionDate = localStorage.getItem('sessionDate');
    const sessionStartTime = localStorage.getItem('sessionStartTime');
    const sessionEndTime = localStorage.getItem('sessionEndTime');
    const sessionCount = parseInt(localStorage.getItem('sessionCount') || '0');

    if (storedSessionDate !== today || !sessionStartTime || sessionEndTime) {
      const startTime = new Date().toISOString();
      localStorage.setItem('sessionStartTime', startTime);
      localStorage.setItem('sessionEndTime', '');
      localStorage.setItem('sessionDate', today);
      localStorage.setItem('sessionCount', (sessionCount + 1).toString());
      setTotalSessions(sessionCount + 1);
      localStorage.setItem('sessionUptime', '0');
      setDailyUptime(0);
    } else {
      setTotalSessions(sessionCount);
    }
  };

  const updateUptime = () => {
    let currentUptime = parseInt(localStorage.getItem('sessionUptime') || '0');
    currentUptime += 60000; // Add 1 minute
    localStorage.setItem('sessionUptime', currentUptime.toString());
    setDailyUptime(currentUptime);
  };

  const endSession = () => {
    const endTime = new Date().toISOString();
    localStorage.setItem('sessionEndTime', endTime);
    setTotalSessions(0);
  };

  const createTrendChart = (chartData) => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Session Duration',
            data: chartData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  };

  return (
    <div className="analytics-overview p-6">
      <div className="kpi-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <KpiCard title="Total Sessions Today" value={totalSessions} />
        <KpiCard title="Total Scenarios Run Today" value={totalScenarios} />
        <KpiCard title="Daily Uptime" value={formatUptime(dailyUptime)} />
      </div>

      <motion.div
        style={{ height: '400px' }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <canvas id="trendChart" ref={canvasRef}></canvas>
      </motion.div>

      <div className="mt-6">
        <button
          onClick={endSession}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          End Session
        </button>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
