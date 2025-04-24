import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  // 1. Initialize state from localStorage (or OS preference)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        return saved === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // 2. Whenever isDarkMode changes, update <html> class and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // 3. Toggle simply flips state
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        transition-all duration-500 ease-in-out
        p-2 rounded-full 
        bg-gray-300 dark:bg-gray-800 
        text-gray-900 dark:text-white 
        hover:text-xl
      "
      aria-label="Toggle theme"
    >
      {isDarkMode ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
