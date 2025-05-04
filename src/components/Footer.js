import React, { useEffect, useState } from 'react';

const Footer = () => {
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 1;
      setShowFooter(isAtBottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer
      className={`
        transition-all duration-700 ease-in-out
        transform ${showFooter ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        w-full bg-white dark:bg-gray-800 shadow p-4 text-center bottom-0 z-20
      `}
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
// This code defines a Footer component that appears at the bottom of the page when the user scrolls to the bottom. It includes links to privacy policy, terms of service, and contact information. The footer has a smooth transition effect when it appears and disappears.
// The footer is styled with Tailwind CSS classes for a clean and modern look. The component uses React hooks to manage the visibility of the footer based on the scroll position of the window.