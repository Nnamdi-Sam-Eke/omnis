// src/components/onboarding/ProgressIndicator.js
import React from "react";

function ProgressIndicator({ total, current }) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress bar container */}
      <div className="relative">
        {/* Background track */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          {/* Active progress fill */}
          <div 
            className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-700 ease-out shadow-lg"
            style={{ 
              width: `${((current + 1) / total) * 100}%`,
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
            }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-between items-center mt-4">
          {Array.from({ length: total }).map((_, idx) => {
            const isActive = idx === current;
            const isCompleted = idx < current;
            
            return (
              <div key={idx} className="relative flex flex-col items-center">
                {/* Step circle */}
                <div
                  className={`
                    relative w-4 h-4 rounded-full transition-all duration-500 ease-out
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-400 to-purple-400 scale-125 shadow-lg' 
                      : isCompleted 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-400 scale-110' 
                        : 'bg-white/20 backdrop-blur-sm'
                    }
                  `}
                  style={{
                    boxShadow: isActive 
                      ? '0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.3)' 
                      : isCompleted 
                        ? '0 0 15px rgba(34, 197, 94, 0.4)'
                        : 'none'
                  }}
                >
                  {/* Inner glow for active step */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
                  )}
                  
                  {/* Checkmark for completed steps */}
                  {isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg 
                        className="w-2.5 h-2.5 text-white" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Step number/label */}
                <div 
                  className={`
                    mt-3 text-xs font-medium transition-all duration-300
                    ${isActive 
                      ? 'text-white scale-110' 
                      : isCompleted 
                        ? 'text-emerald-300' 
                        : 'text-white/50'
                    }
                  `}
                >
                  {idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress text */}
      <div className="text-center mt-6">
        <div className="text-white/80 text-sm font-medium">
          Step {current + 1} of {total}
        </div>
        <div className="text-white/60 text-xs mt-1">
          {Math.round(((current + 1) / total) * 100)}% Complete
        </div>
      </div>
    </div>
  );
}

export default ProgressIndicator;