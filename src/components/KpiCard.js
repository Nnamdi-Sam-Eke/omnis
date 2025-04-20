import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { FiBarChart, FiUser, FiClock, FiSettings } from "react-icons/fi";

const KpiCard = () => {
  const [totalUsers, setTotalUsers] = useState("Loading...");
  const [lastActivity, setLastActivity] = useState("Loading...");
  const [performance, setPerformance] = useState("Measuring...");
  const [systemStatus, setSystemStatus] = useState("Gathering info...");

  useEffect(() => {
    const usersRef = collection(db, "users");

    // Total users
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      setTotalUsers(snapshot.size);
    });

    // Last login
    const q = query(usersRef, orderBy("lastLogin", "desc"), limit(1));
    const unsubscribeLastLogin = onSnapshot(q, (snapshot) => {
      const doc = snapshot.docs[0];
      if (doc && doc.data().lastLogin) {
        const lastLoginDate = new Date(doc.data().lastLogin.toDate());
        const now = new Date();
        const diffMins = Math.floor((now - lastLoginDate) / (1000 * 60));
        if (diffMins < 60) {
          setLastActivity(`${diffMins} mins ago`);
        } else if (diffMins < 1440) {
          setLastActivity(`${Math.floor(diffMins / 60)} hours ago`);
        } else {
          setLastActivity(`${Math.floor(diffMins / 1440)} days ago`);
        }
      } else {
        setLastActivity("No login data");
      }
    });

    // Performance load time
    const { timing } = performance;
    if (timing && timing.loadEventEnd && timing.navigationStart) {
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      if (loadTime < 1000) setPerformance("Excellent");
      else if (loadTime < 3000) setPerformance("Good");
      else if (loadTime < 5000) setPerformance("Fair");
      else setPerformance("Poor");
    } else {
      setPerformance("Unavailable");
    }

    // System status
    const fetchSystemStatus = async () => {
      const online = navigator.onLine ? "Online" : "Offline";
      const cores = navigator.hardwareConcurrency || "N/A";
      let batteryLevel = "Battery: Unknown";

      try {
        const battery = await navigator.getBattery?.();
        if (battery) {
          batteryLevel = `${Math.round(battery.level * 100)}%`;
        }
      } catch (e) {
        console.warn("Battery info not available:", e);
      }

      // Browser name
      const userAgent = navigator.userAgent;
      let browser = "Unknown";
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
    };
  }, []);

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
      value: performance,
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
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="w-full min-h-[120px] bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4"
        >
          <div className={`${card.iconColor} flex-shrink-0`}>
            {card.icon}
          </div>
          <div className="flex flex-col">
            <h3 className="text-base md:text-lg font-semibold">{card.title}</h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 break-words">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiCard;
