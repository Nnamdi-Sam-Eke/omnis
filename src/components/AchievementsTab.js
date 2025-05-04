import React from 'react';
import { FaMedal, FaTrophy, FaRocket, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AchievementsTab = ({
  level = 4,
  currentXP = 720,
  maxXP = 1000,
  badges = [],
  challenges = []
}) => {
  const xpPercentage = (currentXP / maxXP) * 100;

  return (
    <div className="p-6 space-y-6 text-gray-900 dark:text-gray-100">
      
      {/* Level + XP Progress */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 transition-colors duration-300">
        <h2 className="text-xl text-green-600 font-bold mb-3">Your Level</h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Level {level}</span>
          <span className="text-sm font-medium text-blue-500">
            {currentXP} / {maxXP} XP
          </span>
        </div>
        <div className="w-full bg-gray-300 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
          <motion.div
            className="bg-blue-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercentage}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Earned Badges */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 transition-colors duration-300">
        <h2 className="text-xl font-bold text-green-600 mb-4">Unlocked Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.length > 0 ? (
            badges.map((badge, index) => (
              <Badge key={index} icon={badge.icon} label={badge.label} color={badge.color} />
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 col-span-full">No badges yet—start earning!</p>
          )}
        </div>
      </div>

      {/* Active Challenges */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 transition-colors duration-300">
        <h2 className="text-xl text-green-600 font-bold mb-4">Active Challenges</h2>
        {challenges.length > 0 ? (
          <ul className="space-y-3 text-sm list-disc list-inside">
            {challenges.map((challenge, index) => (
              <li key={index} aria-label={challenge.label}>
                {challenge.icon} {challenge.label} ({challenge.progress})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No active challenges. Check back later!</p>
        )}
      </div>
    </div>
  );
};

const Badge = ({ icon: Icon, label, color = 'blue' }) => {
  const baseColor = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  }[color] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 3 }}
      className={`flex flex-col items-center justify-center w-24 h-24 rounded-xl shadow transition-all cursor-pointer ${baseColor}`}
    >
      <Icon className="text-3xl mb-1" aria-hidden="true" />
      <span className="text-xs text-center">{label}</span>
    </motion.div>
  );
};

export default AchievementsTab;
