import React from 'react';
import { FiTwitter, FiLinkedin, FiGithub } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer
      className={`
        w-full bg-white dark:bg-slate-950/95 shadow p-2 z-10
        transition-transform rounded-lg border dark:border-white/90 dark:ring-1 dark:ring-white/20 dark:ring-offset-0 duration-300 ease-in-out
      `}
    >
      <div className="flex flex-1 items-center gap-2">
        {/* Left - The Creator */}
        <div className="text-gray-600 text-sm font-semibold">
          The Creator &copy; {new Date().getFullYear()}
        </div>

        {/* Center - Social Links */}
        {/* <div className="flex justify-center gap-2 text-gray-500">
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
        </div> */}

        {/* Right - Links */}
        {/* <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
          <a href="/privacy" className="hover:text-gray-400">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-gray-400">
            Terms of Service
          </a>
          <a href="/contact" className="hover:text-gray-400">
            Contact
          </a>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
