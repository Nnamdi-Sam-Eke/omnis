import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if the theme is already set in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="transition-all hover:text-xl duration-500 ease-in-out p-2 rounded-full bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white"
    >
      {isDarkMode ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
