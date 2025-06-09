import React, { useState } from 'react';
import { FiUser, FiUsers, FiLogOut } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import favicon from '../images/SVG.svg';
import LogoutSplash from './logoutSplash';

const Header = ({
  toggleSidebar,
  isProfileMenuOpen,
  setIsProfileMenuOpen,
}) => {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(false);
  const navigate = useNavigate();
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const { logout } = useAuth(); // Optional: use if you plan to actually sign out from context
  const [localLogoutMessage, setLocalLogoutMessage] = useState('');

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    setShowSplash(true); // Show splash animation
    await delay(5000);   // Wait for animation (adjust as needed)
    await logout();      // Optional: context logout
    navigate('/login');
  };

  const toTitleCase = (str) => {
    return str
      .replace(/\_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const pageTitle = toTitleCase(
    location.pathname
      .split('/')
      .filter(Boolean)
      .join(' ') || 'Dashboard'
  );

  return (
    <>
      {/* Main header */}
      <div className="fixed top-0 left-0 right-0 z-30 mb-16 px-6 py-4 text-bold flex justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md transition-all duration-300">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded bg-white dark:bg-gray-800 relative"
        >
          <img
            src={favicon}
            alt="Open Sidebar"
            className="w-[30px] h-[30px] object-contain dark:invert"
          />
        </button>

        <h1 className="text-3xl font-bold capitalize text-blue-600 font-poppins dark:text-blue-400">
          Omnis
        </h1>

        <h1 className="text-2xl font-bold capitalize dark:text-white">
          {pageTitle}
        </h1>

        <div className="hidden sm:flex items-center space-x-6">
          <ThemeToggle />
          <Link to="/notifications" className="cursor-pointer hover:text-blue-200">
            🔔
          </Link>

          <div className="relative">
            <span
              className="cursor-pointer profile-trigger hover:text-xl"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            >
              👤
            </span>
            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded shadow-lg p-2 profile-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <FiUser className="dark:text-white" />
                  <span className="dark:text-white">Profile</span>
                </Link>

                <Link
                  to="/account"
                  className="block px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <FiUsers className="dark:text-white" />
                  <span className="dark:text-white">Account</span>
                </Link>

                <div
                  onClick={handleLogout}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200 text-red-900 dark:hover:bg-gray-600 text-red-600 dark:text-red-400 flex items-center space-x-2"
                >
                  <FiLogOut />
                  <span>Log Out</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {localLogoutMessage && (
          <div className="fixed top-4 right-4 p-4 bg-green-200 text-green-800 rounded-md shadow-md z-30">
            {localLogoutMessage}
          </div>
        )}
      </div>

      {/* Render logout animation when logging out */}
      {showSplash && <LogoutSplash />}
    </>
  );
};

export default Header;
