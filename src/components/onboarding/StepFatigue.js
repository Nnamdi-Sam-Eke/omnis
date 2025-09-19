// src/components/onboarding/StepFatigue.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function StepFatigue({ onNext, onBack, onboardingData, setOnboardingData }) {
  const [fatigueArea, setFatigueArea] = useState(onboardingData.fatigueArea || "");

  const options = [
    { 
      value: "Work & career", 
      icon: "💼",
      description: "Workplace decisions and career choices"
    },
    { 
      value: "Finances", 
      icon: "💰",
      description: "Money management and investments"
    },
    { 
      value: "Health & lifestyle", 
      icon: "🏃‍♀️",
      description: "Wellness and daily routine choices"
    },
    { 
      value: "Relationships", 
      icon: "👥",
      description: "Social connections and personal bonds"
    },
    { 
      value: "Other", 
      icon: "✨",
      description: "Something else entirely"
    },
  ];

  const handleContinue = () => {
    if (!fatigueArea) {
      // Modern toast-style alert replacement
      const alertDiv = document.createElement('div');
      alertDiv.className = 'fixed top-6 right-6 bg-rose-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 font-medium border border-rose-400/20';
      alertDiv.textContent = 'Please select where you feel decision fatigue most.';
      document.body.appendChild(alertDiv);
      setTimeout(() => document.body.removeChild(alertDiv), 3000);
      return;
    }

    // Update global onboarding state
    setOnboardingData({
      ...onboardingData,
      fatigueArea,
    });

    // Move to next step
    onNext();
  };

  // Prefill local state if onboardingData updates (optional)
  useEffect(() => {
    setFatigueArea(onboardingData.fatigueArea || "");
  }, [onboardingData]);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-10 max-w-4xl mx-auto px-6">
      {/* Header Section */}
      <div className="space-y-6 max-w-3xl">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent leading-[1.1]"
        >
          Where Do You Experience
          <br />
          <span className="font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Decision Fatigue?
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-4"
        >
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed">
            Understanding your primary challenge area helps us personalize your experience
          </p>
          <p className="text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Select the area where you feel most overwhelmed by daily decisions
          </p>
        </motion.div>
      </div>

      {/* Enhanced Options Grid */}
      <div className="w-full max-w-3xl">
        <div className="grid gap-3 sm:gap-4">
          {options.map((option, index) => (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3 + (index * 0.1),
                ease: [0.25, 0.1, 0.25, 1]
              }}
              whileHover={{ 
                scale: 1.01,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => setFatigueArea(option.value)}
              className={`
                relative p-5 sm:p-6 rounded-2xl transition-all duration-300 font-medium text-left overflow-hidden group border
                ${fatigueArea === option.value
                  ? "bg-white text-slate-800 shadow-xl border-indigo-200 ring-2 ring-indigo-500/20"
                  : "bg-white/50 backdrop-blur-sm text-slate-700 hover:bg-white/80 border-slate-200/60 hover:border-slate-300 hover:shadow-lg"
                }
              `}
            >              
              <div className="relative flex items-center gap-4 sm:gap-5">
                {/* Icon */}
                <div className={`
                  text-2xl sm:text-3xl p-3 sm:p-4 rounded-xl transition-all duration-300
                  ${fatigueArea === option.value 
                    ? "bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-100" 
                    : "bg-slate-50 group-hover:bg-slate-100"
                  }
                `}>
                  <span className="block w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                    {option.icon}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`
                    text-base sm:text-lg font-semibold mb-1 transition-colors
                    ${fatigueArea === option.value ? "text-slate-800" : "text-slate-700 group-hover:text-slate-800"}
                  `}>
                    {option.value}
                  </div>
                  <div className={`
                    text-sm transition-colors leading-relaxed
                    ${fatigueArea === option.value ? "text-slate-600" : "text-slate-500 group-hover:text-slate-600"}
                  `}>
                    {option.description}
                  </div>
                </div>

                {/* Selection indicator */}
                {fatigueArea === option.value && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 w-full max-w-md"
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-700 font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:bg-slate-50"
          >
            Previous Step
          </button>
        )}
        <motion.button
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleContinue}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center justify-center gap-2">
            Continue
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default StepFatigue;