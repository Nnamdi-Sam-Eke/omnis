import React, { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LineElement,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ChevronRight, ChevronDown } from 'lucide-react';

ChartJS.register(BarElement, CategoryScale, LineElement, LinearScale, Tooltip, Legend);

const UptimeChart = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [totalNetworkTime, setTotalNetworkTime] = useState({ hours: 0, minutes: 0 });
  const [todayTime, setTodayTime] = useState({ hours: 0, minutes: 0 });
  const [startDate, setStartDate] = useState(''); // YYYY-MM-DD string
  const [endDate, setEndDate] = useState('');     // YYYY-MM-DD string
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('session'); // 'session' or 'day'
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const db = getFirestore();
  const auth = getAuth();

  const intervalIdRef = useRef(null);
  const sessionIdRef = useRef(null);

  // --- Real-time tracking of current user's session duration ---
  useEffect(() => {
    const startRealTimeTracking = async (user) => {
      try {
        const sessionRef = await addDoc(collection(db, 'users', user.uid, 'sessions'), {
          start: serverTimestamp(),
          duration: 0,
          active: true,
        });
        sessionIdRef.current = sessionRef.id;
        const sessionDocRef = doc(db, 'users', user.uid, 'sessions', sessionIdRef.current);

        intervalIdRef.current = setInterval(async () => {
          try {
            const snap = await getDoc(sessionDocRef);
            if (snap.exists()) {
              const currentDuration = snap.data().duration || 0;
              await updateDoc(sessionDocRef, {
                duration: currentDuration + 60, // increment by 60 seconds (1 min)
                lastUpdated: serverTimestamp(),
              });
            }
          } catch (err) {
            console.error('Error updating session duration:', err);
          }
        }, 60000);
      } catch (err) {
        console.error('Error starting real-time tracking:', err);
      }
    };

    const handleExit = async () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      const user = auth.currentUser;
      if (user && sessionIdRef.current) {
        try {
          const sessionDocRef = doc(db, 'users', user.uid, 'sessions', sessionIdRef.current);
          await updateDoc(sessionDocRef, { active: false });
          sessionIdRef.current = null;
        } catch (err) {
          console.error('Error marking session inactive:', err);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        startRealTimeTracking(user);
      } else {
        handleExit();
      }
    });

    window.addEventListener('beforeunload', handleExit);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      window.removeEventListener('beforeunload', handleExit);
      unsubscribe();
    };
  }, [auth, db]);

  // --- Fetch all user sessions once on mount ---
  useEffect(() => {
    const fetchSessions = async () => {
      setFetching(true);
      setFetchError(null);
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let allSessions = [];

        for (const userDoc of usersSnap.docs) {
          const uid = userDoc.id;
          const sessionsQuery = query(collection(db, 'users', uid, 'sessions'), orderBy('start', 'asc'));
          const sessionsSnap = await getDocs(sessionsQuery);
          sessionsSnap.forEach((sessionDoc) => {
            allSessions.push({ id: sessionDoc.id, ...sessionDoc.data(), userId: uid });
          });
        }

        setSessions(allSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setFetchError('Failed to load sessions.');
      } finally {
        setFetching(false);
      }
    };

    fetchSessions();
  }, [db]);

  // --- Filter sessions by date and calculate total and today times ---
  useEffect(() => {
    const calculateTimes = () => {
      let totalSeconds = 0;
      let todaySeconds = 0;

      const now = new Date();
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);

      const startFilterDate = startDate ? new Date(startDate) : null;
      const endFilterDate = endDate
        ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
        : null;

      // Filter sessions by start time & positive duration
      const filtered = sessions.filter((s) => {
        if (!s.start) return false;

        const startTime = s.start.toDate ? s.start.toDate() : new Date(s.start.seconds * 1000);
        if (startFilterDate && startTime < startFilterDate) return false;
        if (endFilterDate && startTime > endFilterDate) return false;

        return (s.duration || 0) > 0;
      });

      filtered.forEach((s) => {
        const startTime = s.start.toDate ? s.start.toDate() : new Date(s.start.seconds * 1000);
        const duration = s.duration || 0;
        totalSeconds += duration;

        // Calculate overlap with today for partial sessions
        const endTime = new Date(startTime.getTime() + duration * 1000);
        const overlapStart = startTime < midnight ? midnight : startTime;
        const overlapEnd = endTime > now ? now : endTime;

        if (overlapEnd > overlapStart) {
          todaySeconds += Math.floor((overlapEnd - overlapStart) / 1000);
        }
      });

      setFilteredSessions(filtered);
      setTotalNetworkTime({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
      });
      setTodayTime({
        hours: Math.floor(todaySeconds / 3600),
        minutes: Math.floor((todaySeconds % 3600) / 60),
      });
    };

    calculateTimes();
  }, [sessions, startDate, endDate]);

  // --- Loading animation for expand toggle ---
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // --- Generate chart data with numerical date labels sorted chronologically ---
  const getChartData = () => {
    if (view === 'session') {
      return {
        labels: filteredSessions.map((_, idx) => String(idx + 1)),
        datasets: [
          {
            label: 'Session Duration (hrs)',
            data: filteredSessions.map((s) => (s.duration || 0) / 3600),
            backgroundColor: chartType === 'bar' ? '#FF7F50' : 'transparent',
            borderColor: chartType === 'line' ? '#DC2626' : 'transparent',
            fill: chartType === 'line',
            tension: chartType === 'line' ? 0.4 : 0,
            borderWidth: chartType === 'line' ? 2 : 0,
            pointBackgroundColor: chartType === 'line' ? '#DC2626' : 'transparent',
          },
        ],
      };
    } else {
      // Aggregate durations by day (YYYY-MM-DD) and sort ascending
      const dailyAggregates = {};
      filteredSessions.forEach((s) => {
        const date = s.start.toDate ? s.start.toDate() : new Date(s.start.seconds * 1000);
        const dayKey = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        dailyAggregates[dayKey] = (dailyAggregates[dayKey] || 0) + (s.duration || 0);
      });

      // Sort keys ascending
      const sortedDates = Object.keys(dailyAggregates).sort((a, b) => new Date(a) - new Date(b));
      const data = sortedDates.map((date) => dailyAggregates[date] / 3600);

      return {
        labels: sortedDates,
        datasets: [
          {
            label: 'Day Duration (hrs)',
            data,
            backgroundColor: chartType === 'bar' ? '#FF7F50' : 'transparent',
            borderColor: chartType === 'line' ? '#DC2626' : 'transparent',
            fill: chartType === 'line',
            tension: chartType === 'line' ? 0.4 : 0,
            borderWidth: chartType === 'line' ? 2 : 0,
            pointBackgroundColor: chartType === 'line' ? '#DC2626' : 'transparent',
          },
        ],
      };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#555' } },
      tooltip: {
        callbacks: {
          label: function (context) {
            const val = context.parsed.y || context.parsed;
            return `${val.toFixed(2)} hours`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#888',
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
          callback: function (val) {
            // For day view show YYYY-MM-DD, else session index as string
            const label = this.getLabelForValue(val);
            if (view === 'day') {
              // Format YYYY-MM-DD as 'YYYY-MM-DD'
              return label;
            }
            return label;
          },
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#888',
          stepSize: 1,
        },
        grid: { borderDash: [5, 5] },
      },
    },
  };

  return (
    <div className="w-full  hover:shadow-blue-500/50 transition px-6 py-6 border p-6 mt-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg transition-all duration-300 ease-in-out">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between cursor-pointer mb-4"
          >
            <h3 className="text-xl font-semibold text-green-500 dark:text-green-400">
              Uptime Analytics
            </h3>
            {isOpen ? (
              <ChevronDown className="w-5 h-5 text-blue-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-blue-500" />
            )}
          </div>

          <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'flex-1 min-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
          {/* Date range inputs */}
                   {/* Date range filters and controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Start Date:
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="ml-2 border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                />
              </label>
              <label className="text-sm text-gray-600 dark:text-gray-300">
                End Date:
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="ml-2 border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                />
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
                className="px-3 py-1 border rounded bg-blue-100 text-blue-600 text-sm hover:bg-blue-200 dark:bg-gray-700 dark:text-blue-300"
              >
                {chartType === 'bar' ? 'Switch to Line' : 'Switch to Bar'}
              </button>
              <button
                onClick={() => setView(view === 'session' ? 'day' : 'session')}
                className="px-3 py-1 border rounded bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                {view === 'session' ? 'Group by Day' : 'View Sessions'}
              </button>
            </div>
          </div>

          {/* Chart */}
          {fetching ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading sessions...</p>
          ) : fetchError ? (
            <p className="text-red-500 text-sm">{fetchError}</p>
          ) : filteredSessions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No sessions found for the selected range.</p>
          ) : (
            <div className="w-full h-[400px]">
              {chartType === 'bar' ? (
                <Bar data={getChartData()} options={chartOptions} />
              ) : (
                <Line data={getChartData()} options={chartOptions} />
              )}
            </div>
          )}

          {/* Summary */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            <p>
              <strong>Total Network Time:</strong>{' '}
              {totalNetworkTime.hours}h {totalNetworkTime.minutes}m
            </p>
            <p>
              <strong>Today:</strong> {todayTime.hours}h {todayTime.minutes}m
            </p>
          </div>
        </div>
    </div>
  );
};

export default UptimeChart;
