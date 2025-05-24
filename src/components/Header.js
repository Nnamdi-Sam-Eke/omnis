import React, { useState } from 'react';
import { FiUser, FiUsers, FiLogOut } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Simplify imports
import { useAuth } from '../AuthContext';  // Make sure your AuthContext is set up properly
import favicon from '../images/SVG.svg'; // Import your favicon image


const Header = ({
  toggleSidebar,
  isProfileMenuOpen,
  setIsProfileMenuOpen,

}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get the logout function from context
  const [localLogoutMessage, setLocalLogoutMessage] = useState("");  // State for logout message

  const handleLogout = async () => {
    try {
      console.log("Attempting to log out...");
      await logout(); // Log out the user

      setLocalLogoutMessage("You have been logged out successfully.");  // Show success message

      setTimeout(() => {
        navigate("/login"); // Redirect to login page after 2 seconds
      }, 2000);
    } catch (error) {
      console.error("Logout failed:", error.message);
      setLocalLogoutMessage("Logout failed. Please try again.");  // Show failure message
    }
  };

  // Utility to convert text to title case
  const toTitleCase = (str) => {
    return str
      .replace(/\_/g, ' ')  // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase());  // Capitalize first letter of each word
  };

  const pageTitle = toTitleCase(
    location.pathname
      .split('/')
      .filter(Boolean)
      .join(' ') || 'Dashboard'
  );

  return (
    <div
  className="fixed top-0 left-0 right-0 z-30 px-6 py-4 text-bold flex justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md transition-all duration-300"
> <button
  onClick={toggleSidebar}
  className="p-2 rounded relative"
>
  <img
    src={favicon}
    alt="Open Sidebar"
    className="w-[30px] h-[30px] object-contain dark:invert"
  />
</button>



      {/* Omnis logo */}
      <h1 className="text-3xl font-bold capitalize text-blue-600 font-poppins dark:text-blue-400">
        Omnis
      </h1>

      <h1 className="text-2xl font-bold capitalize dark:text-white">{pageTitle}</h1>

      {/* Desktop icons */}
      <div className="hidden sm:flex items-center space-x-6">
        <ThemeToggle />
        <Link 
          to="/notifications" 
          className="cursor-pointer hover:text-blue-200"
        >
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
              onClick={(e) => e.stopPropagation()} // Prevent click propagation to close the menu
            >
              <Link
                to="/profile"
                className="block px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <FiUser className="dark:text-white" />
                <span className="dark:text-white" >Profile</span>
              </Link>

              <Link
                to="/account"
                className="block px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <FiUsers className="dark:text-white"  />
                <span className="dark:text-white" >Account</span>
              </Link>

              <div
                onClick={() => {
                  handleLogout();
                  setIsProfileMenuOpen(false);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200 text-red-900 dark:hover:bg-gray-600 text-red-600 dark:text-red-400 flex items-center space-x-2"
              >
                <FiLogOut />
                <span>Log Out</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Display logout message if it exists */}
      {localLogoutMessage && (
        <div className="fixed top-4 right-4 p-4 bg-green-200 text-green-800 rounded-md shadow-md z-30">
          {localLogoutMessage}
        </div>
      )}
    </div>
  );
};

export default Header;
