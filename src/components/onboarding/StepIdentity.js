// src/components/onboarding/StepIdentity.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function StepIdentity({ onNext, onBack, onboardingData, setOnboardingData }) {
  const [name, setName] = useState(onboardingData.name || "");
  const [role, setRole] = useState(onboardingData.role || "");
  const [focusedField, setFocusedField] = useState("");

  const roles = [
    { value: "Founder", icon: "🚀", description: "Building the future" },
    { value: "Consultant", icon: "💡", description: "Expert advisor" },
    { value: "Student", icon: "📚", description: "Learning and growing" },
    { value: "Creator", icon: "🎨", description: "Making things happen" },
    { value: "Executive", icon: "👔", description: "Leading organizations" },
    { value: "Developer", icon: "💻", description: "Building solutions" },
    { value: "Designer", icon: "✨", description: "Crafting experiences" },
    { value: "Other", icon: "🌟", description: "Something unique" },
  ];

  // Prefill local state if onboardingData updates (useful for navigating back)
  useEffect(() => {
    setName(onboardingData.name || "");
    setRole(onboardingData.role || "");
  }, [onboardingData]);

  const handleContinue = () => {
    if (!name.trim() || !role.trim()) {
      // Modern toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-6 right-6 bg-rose-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 font-medium border border-rose-400/20 flex items-center gap-2';
      toast.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        Please enter your name and select a role.
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 4000);
      return;
    }

    // Update global onboarding state
    setOnboardingData({
      ...onboardingData,
      name,
      role,
    });

    // Move to next step
    onNext();
  };

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
          Let's Get
          <br />
          <span className="font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Acquainted
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-4"
        >
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed">
            Tell us a bit about yourself to personalize your experience
          </p>
          <p className="text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
            This helps us understand your background and tailor our recommendations
          </p>
        </motion.div>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-lg space-y-8">
        {/* Name Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3"
        >
          <label className="block text-left text-slate-700 font-semibold text-sm uppercase tracking-wide">
            Your Name
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your first name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField("")}
              className={`
                w-full px-5 py-4 rounded-xl bg-white border-2 transition-all duration-300 text-slate-800 placeholder-slate-400 text-lg font-medium focus:outline-none
                ${focusedField === "name" || name
                  ? "border-indigo-400 shadow-lg ring-4 ring-indigo-100"
                  : "border-slate-200 hover:border-slate-300 shadow-sm"
                }
              `}
            />
            {name && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <label className="block text-left text-slate-700 font-semibold text-sm uppercase tracking-wide">
            Your Role
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.map((roleOption, index) => (
              <motion.button
                key={roleOption.value}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.5 + (index * 0.05),
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setRole(roleOption.value)}
                className={`
                  relative p-4 rounded-xl transition-all duration-300 text-left overflow-hidden group border
                  ${role === roleOption.value
                    ? "bg-white border-indigo-200 shadow-lg ring-2 ring-indigo-500/20"
                    : "bg-white/60 border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-md"
                  }
                `}
              >                
                <div className="relative flex items-center gap-3">
                  <div className={`
                    text-2xl p-3 rounded-lg transition-all duration-300
                    ${role === roleOption.value 
                      ? "bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-100" 
                      : "bg-slate-50 group-hover:bg-slate-100"
                    }
                  `}>
                    {roleOption.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`
                      text-slate-800 font-semibold text-sm mb-1 transition-colors
                      ${role === roleOption.value ? "text-slate-800" : "text-slate-700 group-hover:text-slate-800"}
                    `}>
                      {roleOption.value}
                    </div>
                    <div className={`
                      text-xs transition-colors leading-relaxed
                      ${role === roleOption.value ? "text-slate-600" : "text-slate-500 group-hover:text-slate-600"}
                    `}>
                      {roleOption.description}
                    </div>
                  </div>

                  {role === roleOption.value && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
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
            scale: name && role ? 1.02 : 1,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: name && role ? 0.98 : 1 }}
          type="button"
          onClick={handleContinue}
          className={`
            px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 relative overflow-hidden group
            ${name && role 
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white hover:shadow-xl" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }
          `}
          disabled={!name || !role}
        >
          {name && role && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
          <span className="relative flex items-center justify-center gap-2">
            {name ? `Nice to meet you, ${name}!` : "Continue"}
            <svg className={`w-4 h-4 transition-transform ${name && role ? 'group-hover:translate-x-0.5' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default StepIdentity;