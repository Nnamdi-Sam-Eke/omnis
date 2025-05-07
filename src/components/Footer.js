import React, { useEffect, useState } from 'react';
import { FiTwitter, FiLinkedin, FiGithub } from 'react-icons/fi';

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
        w-full bg-white dark:bg-gray-800 shadow p-6 text-center bottom-0 z-20
      `}
    >
      <p className="text-gray-600 text-sm mb-2">
        <span className="font-semibold">The Creator</span> &copy; {new Date().getFullYear()}
      </p>
      
      <div className="flex justify-center flex-wrap gap-4 mb-3">
        <a href="/privacy" className="text-gray-500 hover:text-gray-400 text-sm">
          Privacy Policy
        </a>
        <a href="/terms" className="text-gray-500 hover:text-gray-400 text-sm">
          Terms of Service
        </a>
        <a href="/contact" className="text-gray-500 hover:text-gray-400 text-sm">
          Contact
        </a>
      </div>

      <div className="flex justify-center gap-6 mt-2">
        <a
          href="https://twitter.com/yourhandle"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition text-xl"
        >
          <FiTwitter />
        </a>
        <a
          href="https://linkedin.com/in/yourhandle"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition text-xl"
        >
          <FiLinkedin />
        </a>
        <a
          href="https://github.com/yourhandle"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition text-xl"
        >
          <FiGithub />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
