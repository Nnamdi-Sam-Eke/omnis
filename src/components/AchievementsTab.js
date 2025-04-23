import React from 'react';
import { FaMedal, FaTrophy, FaRocket, FaChartLine } from 'react-icons/fa';

const AchievementsTab = () => {
  return (
    <div className="p-6 space-y-6">
      
      {/* Level + XP Progress */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Your Level</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm">Level 4</p>
          <p className="text-sm text-blue-500">720 / 1000 XP</p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded mt-2">
          <div className="bg-blue-500 h-2 rounded w-[72%] transition-all duration-500"></div>
        </div>
      </div>

      {/* Earned Badges */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Unlocked Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge icon={<FaRocket />} label="First Simulation" />
          <Badge icon={<FaTrophy />} label="10 Simulations" />
          <Badge icon={<FaChartLine />} label="Analyst Mode" />
          <Badge icon={<FaMedal />} label="Early User" />
        </div>
      </div>

      {/* Active Quests */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Active Challenges</h2>
        <ul className="space-y-2 text-sm">
          <li>🔥 Run 3 simulations today (1/3)</li>
          <li>📊 Use Analytics tab 5 times this week (4/5)</li>
          <li>💬 Leave feedback via Omnis bot (0/1)</li>
        </ul>
      </div>
    </div>
  );
};

const Badge = ({ icon, label }) => (
  <div className="flex flex-col items-center justify-center w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-700 dark:text-blue-300 shadow">
    <div className="text-2xl mb-1">{icon}</div>
    <span className="text-xs text-center">{label}</span>
  </div>
);

export default AchievementsTab;
