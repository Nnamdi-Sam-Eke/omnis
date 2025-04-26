// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./public/index.html",         // ← add this
    "./src/**/*.{js,jsx,ts,tsx}",  // Adjust to your file paths
  ],
  theme: {
    extend: {
      colors: {
        lightBg: '#F7FAFC',
        darkBg: '#0F172A',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in forwards',
        'pulse-slow': 'pulse 3s infinite ease-in-out', // Add the pulse animation here
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        pulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'], // Fix: correctly placed fontFamily here
      },
    },
  },
  plugins: [],
};
// Add any additional plugins or configurations here