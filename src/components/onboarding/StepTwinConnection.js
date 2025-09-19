// src/components/onboarding/StepTwinConnection.js
import React, { useEffect } from "react";
import { motion } from "framer-motion";

function StepTwinConnection({ onNext, onBack, onboardingData, setOnboardingData }) {
  // Prefill local state if needed (optional)
  useEffect(() => {
    if (onboardingData.twinCreated) {
      setOnboardingData({
        ...onboardingData,
        twinCreated: onboardingData.twinCreated,
      });
    }
  }, [onboardingData, setOnboardingData]);

  const handleContinue = () => {
    // Update global onboarding state
    setOnboardingData({
      ...onboardingData,
      twinCreated: true,
    });

    // Move to next step
    onNext();
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 max-w-4xl mx-auto px-6">
      {/* Enhanced Visual Element */}
      <div className="relative">
        {/* Main Orb */}
        <motion.div
          className="relative w-44 h-44 rounded-full bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-700 shadow-2xl"
          animate={{
            scale: [1, 1.02, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Inner layers for depth */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/30 to-white/5 backdrop-blur-sm" />
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
          
          {/* Central icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Animated Rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-indigo-300/30"
          style={{ width: '200px', height: '200px', left: '-28px', top: '-28px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-violet-300/20"
          style={{ width: '240px', height: '240px', left: '-48px', top: '-48px' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />

        {/* Pulsing glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400/20 to-violet-400/20 blur-3xl"
          style={{ width: '280px', height: '280px', left: '-68px', top: '-68px' }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content Section */}
      <div className="space-y-8 max-w-3xl">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent leading-[1.1]"
        >
          Your Digital Twin
          <br />
          <span className="font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Is Ready
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-4"
        >
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto">
            I've analyzed your preferences and created a personalized decision-making model
          </p>
          <p className="text-base text-slate-500 leading-relaxed max-w-xl mx-auto">
            Your AI twin understands your unique perspective and is ready to help you navigate complex decisions with confidence
          </p>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto"
        >
          {[
            { icon: "🧠", title: "Personalized Insights", desc: "Tailored to your thinking patterns" },
            { icon: "⚡", title: "Quick Analysis", desc: "Instant decision support" },
            { icon: "🎯", title: "Goal Alignment", desc: "Decisions that match your values" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + (index * 0.1) }}
              className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/60 text-center"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="text-sm font-semibold text-slate-800 mb-1">{feature.title}</div>
              <div className="text-xs text-slate-600 leading-relaxed">{feature.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
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
            Run First Simulation
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default StepTwinConnection;