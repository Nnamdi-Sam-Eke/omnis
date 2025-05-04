import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  where
} from "firebase/firestore";
import { db } from "../firebase";
import {
  FiBarChart,
  FiUser,
  FiClock,
  FiSettings,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiCheckCircle
} from "react-icons/fi";

const KpiCard = () => {
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(null);
  const [lastActivity, setLastActivity] = useState(null);
  const [performanceStatus, setPerformanceStatus] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [totalSimulations, setTotalSimulations] = useState(null);
  const [activeUsers, setActiveUsers] = useState(null);
  const [avgAccuracy, setAvgAccuracy] = useState(null);
  const [uptime, setUptime] = useState("99.99%");

  // Handles horizontal scrolling for KPI cards
  const scrollCards = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth"
      });
    }
  };

  // Simulating loading state for 2 seconds
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000); // simulate loading
    return () => clearTimeout(timeout);
  }, []);

  // Fetch and set data from Firebase
  useEffect(() => {
    const usersRef = collection(db, "users");
    const simulationsRef = collection(db, "simulations");

    // Total Users
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      setTotalUsers(snapshot.size);
    });

    // Last Activity (Most recent login)
    const q = query(usersRef, orderBy("lastLogin", "desc"), limit(1));
    const unsubscribeLastLogin = onSnapshot(q, (snapshot) => {
      const doc = snapshot.docs[0];
      if (doc && doc.data().lastLogin) {
        const lastLoginDate = new Date(doc.data().lastLogin.toDate());
        const now = new Date();
        const diffMins = Math.floor((now - lastLoginDate) / (1000 * 60));
        if (diffMins < 60) setLastActivity(`${diffMins} mins ago`);
        else if (diffMins < 1440) setLastActivity(`${Math.floor(diffMins / 60)} hours ago`);
        else setLastActivity(`${Math.floor(diffMins / 1440)} days ago`);
      } else {
        setLastActivity("No login data");
      }
    });

    // Total Simulations and Avg. Accuracy
    const unsubscribeSimulations = onSnapshot(simulationsRef, (snapshot) => {
      setTotalSimulations(snapshot.size);

      const accuracies = snapshot.docs
        .map((doc) => doc.data().accuracy)
        .filter((a) => typeof a === "number");
      const average = accuracies.length
        ? (accuracies.reduce((a, b) => a + b, 0) / accuracies.length).toFixed(2) + "%"
        : "N/A";
      setAvgAccuracy(average);
    });

    // Active Users in the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeQuery = query(usersRef, where("lastLogin", ">", yesterday));
    const unsubscribeActiveUsers = onSnapshot(activeQuery, (snapshot) => {
      setActiveUsers(snapshot.size);
    });

    // Performance Status based on page load time
    const { timing } = window.performance;
    if (timing && timing.loadEventEnd && timing.navigationStart) {
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      if (loadTime < 1000) setPerformanceStatus("Excellent");
      else if (loadTime < 3000) setPerformanceStatus("Good");
      else if (loadTime < 5000) setPerformanceStatus("Fair");
      else setPerformanceStatus("Poor");
    } else {
      setPerformanceStatus("Unavailable");
    }

    // System status: Connectivity, Cores, Browser, and Battery
    const fetchSystemStatus = async () => {
      const online = navigator.onLine ? "Online" : "Offline";
      const cores = navigator.hardwareConcurrency || "N/A";
      let batteryLevel = "Battery: Unknown";

      try {
        const battery = await navigator.getBattery?.();
        if (battery) batteryLevel = `${Math.round(battery.level * 100)}%`;
      } catch (e) {
        console.warn("Battery info not available:", e);
      }

      let browser = "Unknown";
      const userAgent = navigator.userAgent;
      if (userAgent.includes("Chrome")) browser = "Chrome";
      else if (userAgent.includes("Firefox")) browser = "Firefox";
      else if (userAgent.includes("Safari")) browser = "Safari";
      else if (userAgent.includes("Edg")) browser = "Edge";

      const systemInfo = `${online} | ${cores} cores | Battery: ${batteryLevel} | ${browser}`;
      setSystemStatus(systemInfo);
    };

    fetchSystemStatus();

    return () => {
      unsubscribeUsers();
      unsubscribeLastLogin();
      unsubscribeSimulations();
      unsubscribeActiveUsers();
    };
  }, []);

  // KPI Cards Layout
  const cards = [
    {
      icon: <FiUser className="text-3xl md:text-4xl" />,
      title: "Total Users",
      value: totalUsers,
      iconColor: "text-blue-500"
    },
    {
      icon: <FiBarChart className="text-3xl md:text-4xl" />,
      title: "Performance",
      value: performanceStatus,
      iconColor: "text-green-500"
    },
    {
      icon: <FiClock className="text-3xl md:text-4xl" />,
      title: "Last Activity",
      value: lastActivity,
      iconColor: "text-yellow-500"
    },
    {
      icon: <FiSettings className="text-3xl md:text-4xl" />,
      title: "System Status",
      value: systemStatus,
      iconColor: "text-red-500"
    },
    {
      icon: <FiActivity className="text-3xl md:text-4xl" />,
      title: "Total Simulations",
      value: totalSimulations,
      iconColor: "text-indigo-500"
    },
    {
      icon: <FiTrendingUp className="text-3xl md:text-4xl" />,
      title: "Active Users",
      value: activeUsers,
      iconColor: "text-teal-500"
    },
    {
      icon: <FiCheckCircle className="text-3xl md:text-4xl" />,
      title: "Avg. Accuracy",
      value: avgAccuracy,
      iconColor: "text-purple-500"
    },
    {
      icon: <FiClock className="text-3xl md:text-4xl" />,
      title: "System Uptime",
      value: uptime,
      iconColor: "text-emerald-500"
    }
  ];

  return (
    <div className="relative mt-8">
      {/* Left scroll button */}
      <button
        onClick={() => scrollCards("left")}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:text-white dark:bg-gray-700 rounded-full p-2 shadow-lg"
      >
        <FiChevronLeft size={24} />
      </button>

      {/* KPI cards */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto space-x-6 scrollbar-hide px-8 py-2"
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className="min-w-[250px] bg-gray-50 dark:bg-gray-800 dark:shadow-lg p-6 rounded-lg shadow-lg flex items-center space-x-4 transition-all hover:scale-105"
          >
            <div className={`${card.iconColor} flex-shrink-0`}>
              {card.icon}
            </div>
            <div className="flex flex-col">
              <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-white">
                {card.title}
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 break-words">
                {loading ? (
                  <span className="inline-block bg-gray-300 dark:bg-gray-700 rounded w-24 h-4 animate-pulse"></span>
                ) : (
                  card.value
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Right scroll button */}
      <button
        onClick={() => scrollCards("right")}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:text-white dark:bg-gray-700 rounded-full p-2 shadow-lg"
      >
        <FiChevronRight size={24} />
      </button>
    </div>
  );
};

export default KpiCard;
