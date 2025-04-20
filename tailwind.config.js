/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Ensure 'class' mode is enabled
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      }
    }
    ,
  },
  plugins: [],
};
