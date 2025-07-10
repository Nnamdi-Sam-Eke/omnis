/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightBg: '#F7FAFC',
        darkBg: '#0F172A',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in forwards',
        'pulse-slow': 'pulse 3s infinite ease-in-out',
        'pulse-shadow': 'pulse-shadow 2s infinite',
        'shimmer-wave': 'shimmer 1.6s infinite ease-in-out',  // 👈 added
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
        'pulse-shadow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)' },
        },
        shimmer: {  // 👈 added
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
// This configuration file sets up Tailwind CSS with custom colors, animations, and keyframes.
// It includes dark mode support, extends the theme with custom colors, and defines animations for fading