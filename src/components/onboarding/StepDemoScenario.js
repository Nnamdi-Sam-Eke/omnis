import React from "react";
import { motion } from "framer-motion";

function StepPreviewScenario({ onNext, onBack, onboardingData }) {
  const name = onboardingData.name || "there";
  const fatigueArea = onboardingData.fatigueArea || "your decisions";

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-10">
      {/* Narrative Intro */}
      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
        Imagine a Smarter Way to Decide
      </h2>

      <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed">
        Hi {name}, decision fatigue in <span className="font-semibold text-white">{fatigueArea}</span> is common. 
        <br />
        Omnis will act as your personal twin — analyzing your choices, highlighting risks, and showing optimal paths before you decide.
      </p>

      {/* Visualized Preview (Static / GIF / Illustration) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl max-w-lg text-left space-y-4"
      >
        <p className="text-white/80">
          Picture this: You have a big work decision. Omnis shows you potential outcomes, helps set boundaries, and suggests a balanced approach — all before you even act.
        </p>

        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-500/80 to-emerald-500/80 text-white font-medium shadow-lg">
          Your Optimal Path: <br />
          <span className="font-bold">Decide with clarity, avoid burnout, and maximize your impact.</span>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <div className="flex gap-4 mt-6 justify-center">
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-2 rounded-2xl bg-white/10 text-white font-medium shadow-md hover:bg-white/20 transition-all"
          >
            Back
          </button>
        )}
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-2xl bg-white text-indigo-600 font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default StepPreviewScenario;
