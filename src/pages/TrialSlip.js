// src/components/TrialSlip.js
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInMilliseconds } from 'date-fns';
import { X, Clock, Crown, ChevronLeft, ChevronRight } from 'lucide-react';

const TrialSlip = ({ user }) => {
  // Accept user as prop instead of using useAuth hook
  const trialStart = user?.simulationTrialStart?.toDate?.() || null;
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Calculate time left
  useEffect(() => {
    if (!trialStart) return;

    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const updateCountdown = () => {
      const diff = differenceInMilliseconds(trialEnd, new Date());
      if (diff <= 0) return setTimeLeft('Expired');

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m left`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [trialStart]);

  // Debug: Force show component for testing
  const isTrialActive = trialStart && timeLeft !== 'Expired';
  
  // For debugging - you can temporarily enable this to always show the component
  const FORCE_SHOW_FOR_DEBUG = true; // Set to false when testing is done
  
  if (!FORCE_SHOW_FOR_DEBUG && (!isTrialActive || isDismissed)) return null;

  const handleUpgrade = () => {
    // Add your upgrade logic here
    console.log('Upgrade clicked');
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed top-4 right-4 z-[9999] shadow-2xl rounded-xl overflow-hidden transition-all duration-300 ${
          isExpanded ? 'w-80' : 'w-16'
        } bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-800 dark:to-zinc-900 border border-blue-200 dark:border-blue-800`}
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Header bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        
        <div className="relative">
          {isExpanded ? (
            <div className="p-4">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Content */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
                    Free Trial Active
                  </h4>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {FORCE_SHOW_FOR_DEBUG ? "7d 0h 0m left (Demo)" : timeLeft}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleUpgrade}
                    className="w-full text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>

              {/* Collapse button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                title="Collapse"
              >
                <ChevronLeft size={14} />
              </button>
            </div>
          ) : (
            <div className="p-3 flex flex-col items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mb-2">
                <Crown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="writing-mode-vertical text-blue-600 dark:text-blue-300 font-bold text-xs tracking-wide">
                TRIAL
              </div>

              {/* Expand button */}
              <button
                onClick={() => setIsExpanded(true)}
                className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                title="Expand"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
        
        {/* Pulse animation for attention */}
        <div className="absolute inset-0 bg-blue-400 opacity-20 animate-pulse pointer-events-none rounded-xl"></div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrialSlip;