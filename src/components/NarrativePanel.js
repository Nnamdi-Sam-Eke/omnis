// NarrativePanel.js
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const dummyInsights = [
  {
    icon: "💡",
    text: "You’ve improved your risk tolerance by 20% over the past week.",
  },
  {
    icon: "📈",
    text: "Scenarios involving supply chains have a higher success rate (78%) than average.",
  },
  {
    icon: "🧠",
    text: "Your average decision confidence has increased from 72% to 84%.",
  },
  {
    icon: "⚖️",
    text: "You’ve simulated more balanced trade-offs in financial scenarios this month.",
  },
];

const NarrativePanel = () => {
  const storedIsOpen = localStorage.getItem('isOpen');
  const [isOpen, setIsOpen] = useState(storedIsOpen === 'false' ? false : true);
  
    
    useEffect(() => {
      localStorage.setItem('isOpen', isOpen);
    }, [isOpen]);

  return (
    <div className="w-full md:w-10/12 border bg-white mt-8 dark:bg-gray-900 p-6 rounded-2xl shadow-lg">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer mb-4"
      >
     <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-4">
        Narrative Insights from Omnis
      </h2>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-blue-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-blue-500" />
        )}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-gray-600 dark:text-gray-300 mb-4">
        Here’s what I’ve learned about your decisions...
    </p>

      <ul className="space-y-4">
        {dummyInsights.map((insight, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-gray-700 dark:text-gray-100"
          >
            <span className="text-2xl">{insight.icon}</span>
            <span className="text-sm sm:text-base">{insight.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
        *Omnis AI-generated summaries based on your usage patterns.
      </div>
      </div>
    </div>
  );
};

export default NarrativePanel;
