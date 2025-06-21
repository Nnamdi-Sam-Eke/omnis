import React, { useEffect, useState, useRef, forwardRef } from 'react';
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
import { ChevronRight, ChevronDown, BarChart3, TrendingUp, RefreshCw } from 'lucide-react';

ChartJS.register(BarElement, CategoryScale, LineElement, LinearScale, Tooltip, Legend);

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse">
    {/* Controls Skeleton */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-32"></div>
        <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-32"></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="h-8 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700 rounded-lg w-20"></div>
        <div className="h-8 bg-gradient-to-r from-purple-200 to-purple-300 dark:from-purple-800 dark:to-purple-700 rounded-lg w-24"></div>
        <div className="h-8 bg-gradient-to-r from-emerald-200 to-emerald-300 dark:from-emerald-800 dark:to-emerald-700 rounded-lg w-28"></div>
      </div>
    </div>
    
    {/* Chart Skeleton */}
    <div className="w-full h-[400px] bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-600/30 to-transparent animate-shimmer"></div>
      {/* Mock chart bars */}
      <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-gradient-to-t from-emerald-300 to-emerald-400 dark:from-emerald-600 dark:to-emerald-500 rounded-t-sm animate-pulse"
            style={{ 
              height: `${Math.random() * 200 + 50}px`, 
              width: '20px',
              animationDelay: `${i * 0.1}s`
            }}
          ></div>
        ))}
      </div>
    </div>
    
    {/* Summary Skeleton */}
    <div className="space-y-2">
      <div className="h-4 bg-gradient-to-r from-emerald-200 to-emerald-300 dark:from-emerald-800 dark:to-emerald-700 rounded w-64"></div>
      <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700 rounded w-48"></div>
    </div>
  </div>
);

const UptimeChart = forwardRef(({ onRendered }, ref) => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [totalNetworkTime, setTotalNetworkTime] = useState({ hours: 0, minutes: 0 });
  const [todayTime, setTodayTime] = useState({ hours: 0, minutes: 0 });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('session');
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const db = getFirestore();
  const auth = getAuth();
  const intervalIdRef = useRef(null);
  const sessionIdRef = useRef(null);

useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const t = setTimeout(() => {
        setIsLoading(false);
        onRendered?.(); // ✅ Notify parent once chart is loaded
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isOpen, onRendered]);
  // Notify parent when chart is rendered

  useEffect(() => {
    if (!loading && isOpen && filteredSessions.length > 0 && onRendered) {
      onRendered();
    }
  }, [loading, isOpen, filteredSessions, chartType, view]);


 
  // Format duration from seconds to "Xh Ym" format
  const formatDuration = (hoursFloat) => {
    const hours = Math.floor(hoursFloat);
    const minutes = Math.round((hoursFloat - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  // Enhanced Device detection functions
  const getDeviceType = () => {
    const ua = navigator.userAgent.toLowerCase();
    
    // Check for mobile devices
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      // Distinguish between tablet and phone
      if (/ipad|android(?!.*mobile)|tablet/i.test(ua)) {
        return 'Tablet';
      }
      return 'Mobile';
    }
    
    // Check for desktop/laptop
    if (/windows|macintosh|linux/i.test(ua)) {
      return 'Desktop';
    }
    
    // Fallback based on screen size if user agent detection fails
    if (typeof window !== 'undefined') {
      const screenWidth = window.screen.width;
      if (screenWidth < 768) return 'Mobile';
      if (screenWidth < 1024) return 'Tablet';
      return 'Desktop';
    }
    
    return 'Desktop'; // Default fallback
  };

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      const deviceType = getDeviceType();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      deviceId = `${deviceType}_${timestamp}_${randomString}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  const startRealTimeTracking = async (user) => {
    try {
      const sessionRef = await addDoc(collection(db, 'users', user.uid, 'sessions'), {
        start: serverTimestamp(),
        duration: 0,
        active: true,
        deviceType: getDeviceType(),
        deviceId: getDeviceId(),
      });
      sessionIdRef.current = sessionRef.id;
      const sessionDocRef = doc(db, 'users', user.uid, 'sessions', sessionRef.id);

      let localDuration = 0;

      intervalIdRef.current = setInterval(async () => {
        try {
          localDuration += 60;
          if (localDuration >= 180) {
            const snap = await getDoc(sessionDocRef);
            if (snap.exists()) {
              const currentDuration = snap.data().duration || 0;
              await updateDoc(sessionDocRef, {
                duration: currentDuration + localDuration,
                lastUpdated: serverTimestamp(),
              });
              localDuration = 0;
            }
          }
        } catch (err) {
          console.error('Error updating session duration:', err);
        }
      }, 60000);
    } catch (err) {
      console.error('Error starting real-time tracking:', err);
    }
  };

  // --- Real-time tracking of current user's session duration ---
  useEffect(() => {
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

  // --- Fetch current user's sessions only ---
  const fetchSessions = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    setFetching(true);
    setFetchError(null);
    try {
      const sessionsQuery = query(
        collection(db, 'users', user.uid, 'sessions'),
        orderBy('start', 'asc')
      );
      const sessionsSnap = await getDocs(sessionsQuery);
      const userSessions = sessionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        userId: user.uid,
      }));
      
      setSessions(userSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setFetchError('Failed to load sessions.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [auth]);

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

  // --- Loading animation for expand toggle (3 seconds) ---
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
            backgroundColor: chartType === 'bar' 
              ? 'rgba(16, 185, 129, 0.8)' // emerald-500 with opacity
              : 'transparent',
            borderColor: chartType === 'line' ? '#10b981' : 'transparent', // emerald-500
            fill: chartType === 'line',
            tension: chartType === 'line' ? 0.4 : 0,
            borderWidth: chartType === 'line' ? 3 : 0,
            pointBackgroundColor: chartType === 'line' ? '#10b981' : 'transparent',
            pointBorderColor: chartType === 'line' ? '#ffffff' : 'transparent',
            pointBorderWidth: chartType === 'line' ? 2 : 0,
            pointRadius: chartType === 'line' ? 6 : 0,
            pointHoverRadius: chartType === 'line' ? 8 : 0,
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
            backgroundColor: chartType === 'bar' 
              ? 'rgba(59, 130, 246, 0.8)' // blue-500 with opacity
              : 'transparent',
            borderColor: chartType === 'line' ? '#3b82f6' : 'transparent', // blue-500
            fill: chartType === 'line',
            tension: chartType === 'line' ? 0.4 : 0,
            borderWidth: chartType === 'line' ? 3 : 0,
            pointBackgroundColor: chartType === 'line' ? '#3b82f6' : 'transparent',
            pointBorderColor: chartType === 'line' ? '#ffffff' : 'transparent',
            pointBorderWidth: chartType === 'line' ? 2 : 0,
            pointRadius: chartType === 'line' ? 6 : 0,
            pointHoverRadius: chartType === 'line' ? 8 : 0,
          },
        ],
      };
    }
  };

  // Calculate device breakdown with better device type handling
  const deviceBreakdown = {};
  filteredSessions.forEach((s) => {
    // Use stored deviceType, fallback to detection, then default
    let deviceType = s.deviceType || 'Desktop';
    
    // Normalize device types
    if (deviceType === 'Unknown' || !deviceType) {
      deviceType = 'Desktop';
    }
    
    deviceBreakdown[deviceType] = (deviceBreakdown[deviceType] || 0) + (s.duration || 0);
  });

  // Convert to readable format
  const formattedDeviceBreakdown = Object.entries(deviceBreakdown).map(([type, seconds]) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return { type, time: `${hours}h ${minutes}m` };
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top', 
        labels: { 
          color: '#6b7280', // gray-500
          font: { size: 14, weight: '600' },
          usePointStyle: true,
          pointStyle: 'circle'
        } 
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)', // gray-900 with opacity
        titleColor: '#f3f4f6', // gray-100
        bodyColor: '#f3f4f6', // gray-100
        borderColor: '#6b7280', // gray-500
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const val = context.parsed.y || context.parsed;
            return `🕒 ${formatDuration(val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6b7280', // gray-500
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
          font: { size: 12, weight: '500' },
          callback: function (val) {
            const label = this.getLabelForValue(val);
            if (view === 'day') {
              // Format 'YYYY-MM-DD' as 'MMM DD' (e.g. "Jun 20")
              const date = new Date(label);
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
            }
            return label;
          },
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6b7280', // gray-500
          stepSize: 1,
          font: { size: 12, weight: '500' },
        },
        grid: { 
          color: 'rgba(107, 114, 128, 0.2)', // gray-500 with opacity
          borderDash: [5, 5] 
        },
      },
    },
  };

  return (
    <div ref={ref}className="w-full hover:shadow-2xl shadow-2xl hover:shadow-emerald-400/30 dark:hover:shadow-emerald-500/25 transition-all duration-500 px-6 py-6 border border-gray-200 dark:border-gray-700 mt-8 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 rounded-3xl ">
      {/* Subtle Green Brush Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-transparent to-emerald-100/10 dark:from-emerald-900/10 dark:via-transparent dark:to-emerald-800/5 pointer-events-none rounded-3xl"></div>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-emerald-100/30 via-emerald-50/10 to-transparent dark:from-emerald-800/15 dark:via-emerald-900/5 dark:to-transparent rounded-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-emerald-50/25 via-emerald-100/15 to-transparent dark:from-emerald-900/10 dark:via-emerald-800/8 dark:to-transparent rounded-3xl pointer-events-none"></div>
      
            {/* Content - positioned relative to sit above the brush effect */}
      <div className="relative z-10">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between cursor-pointer mb-4 group"
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            📊 Uptime Analytics
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            {isOpen ? (
              <ChevronDown className='text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors duration-200' size={24} />
            ) : (
              <ChevronRight className='text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors duration-200' size={24} />
            )}
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'flex-1 min-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Date range filters and controls - Fixed responsive layout */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
              {/* Date inputs - Stack on mobile/tablet, side by side on larger screens */}
              <div className="flex flex-col sm:flex-row gap-3 xl:gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="whitespace-nowrap">📅 Start Date:</span>
                  <input
                    type="date"
                    aria-label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-colors duration-200 min-w-0"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="whitespace-nowrap">📅 End Date:</span>
                  <input
                    type="date"
                    aria-label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-colors duration-200 min-w-0"
                  />
                </label>
              </div>

              {/* Control buttons - Wrap on smaller screens, proper spacing */}
              <div className="flex flex-wrap gap-2 justify-start xl:justify-end">
                <button
                  onClick={fetchSessions}
                  disabled={fetching}
                  className="flex items-center gap-1.5 px-3 py-2 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-semibold hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800 dark:hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <RefreshCw size={14} className={`${fetching ? 'animate-spin' : ''} flex-shrink-0`} />
                  <span className="hidden xs:inline">Refresh</span>
                </button>
                
                <button
                  onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
                  className="flex items-center gap-1.5 px-3 py-2 border-2 border-blue-300 dark:border-blue-600 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 text-blue-700 dark:text-blue-300 text-sm font-semibold hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800 dark:hover:to-blue-700 transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                >
                  {chartType === 'bar' ? <TrendingUp size={14} className="flex-shrink-0" /> : <BarChart3 size={14} className="flex-shrink-0" />}
                  <span className="hidden sm:inline">{chartType === 'bar' ? 'Line' : 'Bar'}</span>
                </button>
                
                <button
                  onClick={() => setView(view === 'session' ? 'day' : 'session')}
                  className="flex items-center gap-1.5 px-3 py-2 border-2 border-purple-300 dark:border-purple-600 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 text-purple-700 dark:text-purple-300 text-sm font-semibold hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800 dark:hover:to-purple-700 transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                >
                  <span className="flex-shrink-0">{view === 'session' ? '📊' : '🔍'}</span>
                  <span className="hidden sm:inline">{view === 'session' ? 'By Day' : 'Sessions'}</span>
                </button>
              </div>
            </div>

            {/* Chart */}
            {fetching ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  <p className="text-lg font-medium text-emerald-600 dark:text-emerald-400">Loading sessions...</p>
                </div>
              </div>
            ) : fetchError ? (
              <div className="bg-red-50 dark:bg-red-900/50 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <p className="text-red-600 dark:text-red-400 font-semibold">❌ {fetchError}</p>
                <button
                  onClick={fetchSessions}
                  className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400">📊 No sessions found for the selected range.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Try adjusting your date range or check back later.</p>
              </div>
            ) : (
              <div className="w-full h-[400px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                {chartType === 'bar' ? (
                  <Bar data={getChartData()} options={chartOptions} />
                ) : (
                  <Line data={getChartData()} options={chartOptions} />
                )}
              </div>
            )}

            {/* Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                  🌐 <strong>Total Network Time:</strong>{' '}
                  <span className="text-2xl font-bold">{totalNetworkTime.hours}h {totalNetworkTime.minutes}m</span>
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-blue-800 dark:text-blue-300 font-semibold">
                  ⏰ <strong>Today:</strong>{' '}
                  <span className="text-2xl font-bold">{todayTime.hours}h {todayTime.minutes}m</span>
                </p>
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="mt-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4">
                <p className="text-purple-800 dark:text-purple-300 font-semibold mb-2">
                  📱 <strong>Device Breakdown:</strong>
                </p>
                <div className="flex flex-wrap gap-3">
                  {formattedDeviceBreakdown.map(({ type, time }) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-700 border border-purple-200 dark:border-purple-700 rounded-lg text-sm font-medium text-purple-700 dark:text-purple-300"
                    >
                      <span className="text-lg">
                        {type === 'Mobile' ? '📱' : type === 'Tablet' ? '📱' : type === 'Desktop' ? '🖥️' : '❓'}
                      </span>
                      {type}: <span className="font-bold">{time}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
);

// Add shimmer animation to CSS (you can add this to your global CSS)
const shimmerCSS = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;

export default UptimeChart;