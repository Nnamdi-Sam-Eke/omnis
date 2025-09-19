// src/components/onboarding/StepSplash.js
import React from "react";
import { motion } from "framer-motion";

function StepSplash({ onNext }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 max-w-4xl mx-auto px-6">
      {/* Logo Section */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.1, 0.25, 1],
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        className="relative"
      >
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 shadow-2xl flex items-center justify-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-bl from-transparent to-black/10" />
          
          {/* Logo letter */}
          <span className="text-4xl font-bold text-white relative z-10 tracking-tight">O</span>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-400/20 to-violet-400/20 blur-xl" />
        </div>
      </motion.div>

      {/* Title and Branding */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-6"
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent leading-none">
          Omnis
        </h1>
        
        <div className="space-y-4">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl md:text-2xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto"
          >
            Your AI partner for
            <span className="font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {" "}decisive living
            </span>
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-base md:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto"
          >
            Streamline your decision-making process with intelligent insights and personalized guidance
          </motion.p>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="pt-4"
      >
        <motion.button
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="group relative px-12 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
        >
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Button content */}
          <span className="relative flex items-center gap-3">
            Begin Your Journey
            <svg 
              className="w-5 h-5 transition-transform group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </span>
        </motion.button>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* Subtle background pattern */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-indigo-100/20 to-violet-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-violet-100/20 to-purple-100/20 rounded-full blur-3xl" />
      </motion.div>
    </div>
  );
}

export default StepSplash;