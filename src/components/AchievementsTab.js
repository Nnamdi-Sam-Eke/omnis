import React from 'react';

const AchievementsTab = ({
  level = 0,
  currentXP = 0,
  maxXP = 500,
  completedScenarios = 0,
  totalTimeSpent = 0, // in minutes
  streakDays = 0
}) => {
  const xpPercentage = (currentXP / maxXP) * 100;
  const nextLevel = level + 1;
  
  // Calculate available badges based on progress
  const availableBadges = [
    { icon: '🎯', label: 'First Steps', color: 'blue', unlocked: completedScenarios >= 1, requirement: 'Complete 1 scenario' },
    { icon: '🏃', label: 'Quick Learner', color: 'green', unlocked: completedScenarios >= 5, requirement: 'Complete 5 scenarios' },
    { icon: '🔥', label: 'On Fire', color: 'red', unlocked: streakDays >= 3, requirement: '3-day streak' },
    { icon: '⭐', label: 'Rising Star', color: 'yellow', unlocked: completedScenarios >= 10, requirement: 'Complete 10 scenarios' },
    { icon: '💪', label: 'Dedicated', color: 'purple', unlocked: totalTimeSpent >= 30, requirement: '30 minutes practiced' },
    { icon: '🎓', label: 'Scholar', color: 'indigo', unlocked: completedScenarios >= 20, requirement: 'Complete 20 scenarios' },
    { icon: '🏆', label: 'Champion', color: 'gold', unlocked: completedScenarios >= 50, requirement: 'Complete 50 scenarios' },
    { icon: '💎', label: 'Master', color: 'cyan', unlocked: completedScenarios >= 100, requirement: 'Complete 100 scenarios' }
  ];

  const unlockedBadges = availableBadges.filter(badge => badge.unlocked);
  const lockedBadges = availableBadges.filter(badge => !badge.unlocked);

  // Milestone achievements
  const milestones = [
    { 
      icon: '🎯', 
      title: 'First Scenario', 
      description: 'Complete your first scenario',
      completed: completedScenarios >= 1,
      progress: Math.min(completedScenarios, 1)
    },
    { 
      icon: '🚀', 
      title: 'Learning Momentum', 
      description: 'Complete 5 scenarios',
      completed: completedScenarios >= 5,
      progress: Math.min(completedScenarios, 5),
      max: 5
    },
    { 
      icon: '⚡', 
      title: 'Practice Streak', 
      description: 'Maintain a 7-day streak',
      completed: streakDays >= 7,
      progress: Math.min(streakDays, 7),
      max: 7
    },
    { 
      icon: '🎓', 
      title: 'Knowledge Builder', 
      description: 'Complete 20 scenarios',
      completed: completedScenarios >= 20,
      progress: Math.min(completedScenarios, 20),
      max: 20
    },
    { 
      icon: '💪', 
      title: 'Time Investment', 
      description: 'Spend 60 minutes practicing',
      completed: totalTimeSpent >= 60,
      progress: Math.min(totalTimeSpent, 60),
      max: 60
    },
    { 
      icon: '🏆', 
      title: 'Scenario Master', 
      description: 'Complete 50 scenarios',
      completed: completedScenarios >= 50,
      progress: Math.min(completedScenarios, 50),
      max: 50
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 font-['Inter',system-ui,sans-serif]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your Achievements
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Track your progress and unlock new milestones</p>
        </div>

        {/* Level Progress */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Level Progress</h2>
            <div className="text-right">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text">
                Level {level}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentXP} / {maxXP} XP
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Progress circle at start */}
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg z-10">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden ml-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${xpPercentage}%` }}
              >
                <div className="h-full bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
              </div>
            </div>
            
            {/* Next level indicator */}
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border-2 border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-400">
              Level {nextLevel}
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Badges</h2>
          
          {/* Unlocked Badges */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">Unlocked ({unlockedBadges.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {unlockedBadges.map((badge, index) => (
                <Badge key={index} badge={badge} unlocked={true} />
              ))}
            </div>
          </div>

          {/* Locked Badges */}
          <div>
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4">Locked ({lockedBadges.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {lockedBadges.map((badge, index) => (
                <Badge key={index} badge={badge} unlocked={false} />
              ))}
            </div>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Milestones</h2>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <MilestoneItem key={index} milestone={milestone} />
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon="📈"
            title="Scenarios Completed"
            value={completedScenarios}
            color="blue"
          />
          <StatCard 
            icon="⏱️"
            title="Time Practiced"
            value={`${totalTimeSpent}m`}
            color="green"
          />
          <StatCard 
            icon="🔥"
            title="Current Streak"
            value={`${streakDays} days`}
            color="orange"
          />
        </div>
      </div>
    </div>
  );
};

const Badge = ({ badge, unlocked }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
    gold: 'from-yellow-400 to-yellow-600',
    cyan: 'from-cyan-500 to-cyan-600'
  };

  return (
    <div className="group relative">
      <div 
        className={`
          flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 cursor-pointer
          ${unlocked 
            ? `bg-gradient-to-br ${colorClasses[badge.color]} shadow-lg hover:shadow-xl hover:scale-110 text-white` 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
          }
        `}
      >
        <span className="text-2xl mb-1 filter">
          {unlocked ? badge.icon : '🔒'}
        </span>
        <span className="text-xs text-center font-medium px-1">
          {badge.label}
        </span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
        {badge.requirement}
      </div>
    </div>
  );
};

const MilestoneItem = ({ milestone }) => {
  const progressPercentage = milestone.max ? (milestone.progress / milestone.max) * 100 : 100;
  
  return (
    <div className={`
      p-4 rounded-2xl border-2 transition-all duration-300
      ${milestone.completed 
        ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600' 
        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
      }
    `}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{milestone.icon}</span>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white">{milestone.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
          </div>
        </div>
        {milestone.completed && (
          <div className="text-green-500 font-bold text-sm">COMPLETED</div>
        )}
      </div>
      
      {milestone.max && (
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                milestone.completed ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {milestone.progress}/{milestone.max}
          </span>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-3xl p-6 border border-white/20 text-center">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClasses[color]} mb-4`}>
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
      <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-200 dark:to-gray-400 bg-clip-text">
        {value}
      </p>
    </div>
  );
};

export default AchievementsTab;