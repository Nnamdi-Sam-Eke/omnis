import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const dummyInsights = [
  { icon: "💡", text: "You’ve improved your risk tolerance by 20% over the past week." },
  { icon: "📈", text: "Scenarios involving supply chains have a higher success rate (78%) than average." },
  { icon: "🧠", text: "Your average decision confidence has increased from 72% to 84%." },
  { icon: "⚖️", text: "You’ve simulated more balanced trade-offs in financial scenarios this month." },
];

const NarrativePanel = () => {
  const storedIsOpen = localStorage.getItem('narrativeIsOpen');
  const [isOpen, setIsOpen] = useState(storedIsOpen !== 'false');
  const [loading, setLoading] = useState(false);

  // Save toggle state in localStorage
  useEffect(() => {
    localStorage.setItem('narrativeIsOpen', isOpen);
  }, [isOpen]);

  // Trigger loading every time it opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div className="w-full  hover:shadow-blue-500/50 transition px-6 py-6 border p-6 mt-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg transition-all mb-12 duration-300 ease-in-out">
      <div
        onClick={() => setIsOpen(prevState => !prevState)}
        className="flex items-center justify-between cursor-pointer mb-4"
      >
        <h2 className="text-xl font-semibold  text-green-500 dark:text-green-500">
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
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-4/5 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Here’s what I’ve learned about your decisions...
            </p>

            <ul className="space-y-4">
              {dummyInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-100">
                  <span className="text-2xl">{insight.icon}</span>
                  <span className="text-sm sm:text-base">{insight.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
              *Omnis AI-generated summaries based on your usage patterns.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NarrativePanel;
