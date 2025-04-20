import React from 'react';

const Footer = () => {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-800 shadow p-4 transition-all duration-300 text-white text-center z-50"
    >
      <p className="text-gray-600 text-sm">
        <span className="font-semibold">The Creator</span> &copy; {new Date().getFullYear()}
      </p>
      <div className="mt-1">
        <a href="/privacy" className="text-gray-500 hover:text-gray-400 text-sm mx-2">
          Privacy Policy
        </a>
        <a href="/terms" className="text-gray-500 hover:text-gray-400 text-sm mx-2">
          Terms of Service
        </a>
        <a href="/contact" className="text-gray-500 hover:text-gray-200 text-sm mx-2">
          Contact
        </a>
      </div>
    </footer>
  );
};

export default Footer;
