// src/components/onboarding/StepWelcome.js
import React from "react";
import { motion } from "framer-motion";

function StepWelcome({ onNext, onBack }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 max-w-4xl mx-auto px-6">
      {/* Brand Identity */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 shadow-xl flex items-center justify-center relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
          <span className="text-2xl font-bold text-white relative z-10">O</span>
        </div>
      </motion.div>

      {/* Welcome Message */}
      <div className="space-y-8 max-w-3xl">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent leading-[1.1]"
        >
          Welcome to
          <br />
          <span className="font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Omnis
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-6"
        >
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto">
            Your AI-powered decision companion, designed to bring clarity to life's complex choices
          </p>
          
          <div className="space-y-4 text-slate-500 max-w-xl mx-auto">
            <p className="text-base leading-relaxed">
              I analyze your preferences, understand your values, and help you navigate decisions with confidence
            </p>
            <p className="text-base leading-relaxed">
              Think of me as your
              <span className="font-semibold text-indigo-600"> second brain</span> —
              always ready to provide perspective when you need it most
            </p>
          </div>
        </motion.div>

        {/* Key Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-3xl mx-auto"
        >
          {[
            { 
              icon: "🎯", 
              title: "Personalized", 
              desc: "Tailored to your unique decision-making style" 
            },
            { 
              icon: "⚡", 
              title: "Instant Clarity", 
              desc: "Cut through complexity with AI-powered insights" 
            },
            { 
              icon: "🧭", 
              title: "Confident Choices", 
              desc: "Make decisions aligned with your goals and values" 
            }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + (index * 0.1) }}
              className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 text-center hover:bg-white/80 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-3xl mb-3">{benefit.icon}</div>
              <div className="font-semibold text-slate-800 mb-2">{benefit.title}</div>
              <div className="text-sm text-slate-600 leading-relaxed">{benefit.desc}</div>
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
          onClick={onNext}
          className="px-10 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center justify-center gap-2">
            Let's Get Started
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </motion.button>
      </motion.div>

      {/* Subtle background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute top-32 left-16 w-48 h-48 bg-gradient-to-r from-indigo-100/30 to-violet-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-16 w-64 h-64 bg-gradient-to-r from-violet-100/30 to-purple-100/30 rounded-full blur-3xl" />
      </motion.div>
    </div>
  );
}

export default StepWelcome;