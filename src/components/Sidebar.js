import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiGrid, FiMessageCircle, FiPlus, FiBookmark, FiBarChart, FiList, FiDatabase, FiHelpCircle, FiSettings, FiUserX, FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../AuthContext'; // Import Auth Context
import { useNavigate } from 'react-router-dom'; // For navigation
import ThemeToggle from '../components/ThemeToggle';
import Tooltip from '../components/Tooltip';

function Sidebar({ isSidebarOpen, toggleSidebar, setIsSidebarOpen, setCurrentPage }) {
  const { logout } = useAuth(); // Get the logout function from context
  const navigate = useNavigate();
  const location = useLocation();
  const [localLogoutMessage, setLocalLogoutMessage] = useState("");
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);
  

  const handleLogout = async () => {
    try {
      console.log("Attempting to log out...");
      await logout(); // Log out the user

      setLocalLogoutMessage("You have been logged out successfully.");

      setTimeout(() => {
        navigate("/login"); // Redirect to login page after 2 seconds
      }, 2000);

    } catch (error) {
      console.error("Logout failed:", error.message);
      setLocalLogoutMessage("Logout failed. Please try again.");
    }
  };

  const navItems = [
    { name: 'Home', icon: <FiHome />, path: '/home' },
    { name: 'Dashboard', icon: <FiGrid />, path: '/dashboard' },
    { name: 'Partner Chat', icon: <FiMessageCircle />, path: '/partner-chat' },
    { name: 'New Scenario', icon: <FiPlus />, path: 'new-scenario' },
    { name: 'Saved Scenarios', icon: <FiBookmark />, path: '/saved-scenarios' },
    { name: 'Analytics', icon: <FiBarChart />, path: '/analytics' },
    { name: 'Activity Log', icon: <FiList />, path: '/activity-log' },
    { name: 'Resources', icon: <FiDatabase />, path: '/resources' },
    { name: 'Support', icon: <FiHelpCircle />, path: '/support' },
    { name: 'Settings', icon: <FiSettings />, path: '/settings' },
    { name: 'User Profile', icon: <FiUserX />, path: '/user-profile' }
    
  ];

  return (
    <aside
    ref={sidebarRef}

      id="sidebar"
      className={`h-full left-0 w-64 p-6 transition-all fixed inset-y-0 duration-300 z-30 bg-gradient-to-r from-blue-600 to-green-500 text-white dark:bg-gray-800 overflow-y-auto ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
     <button
  onClick={() => setIsSidebarOpen(false)}
  id="sidebar-button"
  className="ml-auto p-2 rounded bg-white text-green-900 hover:bg-red-100 dark:bg-gray-700 dark:text-white"
>
  ✖
</button>

      <h2 className="text-4xl font-bold mt-2">Menu</h2>
      <ul className="space-y-4">
        {navItems.map(({ name, icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <li key={name}>
              <Link
                to={path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 border-l-4 border-green-400 text-white font-semibold'
                    : 'hover:bg-white/10 hover:scale-[1.02]'
                }`}
              >
                <Tooltip text={name} position="right">
                  <div className="flex items-center gap-4 text-lg">
                    {icon}
                    <span>{name}</span>
                  </div>
                </Tooltip>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Mobile-only icons */}
<div className="sm:hidden mt-2 flex bg-gray-300 rounded-xl p-2 justify-around text-sm">
  <ThemeToggle />
  
  <Tooltip text="Notifications" position="top">
    <Link 
      to="/notifications" 
      className="cursor-pointer hover:text-blue-200"
      onClick={() => setIsSidebarOpen(false)}
    >
      🔔
    </Link>
  </Tooltip>
  
  <Tooltip text="Account" position="top">
    <Link 
      to="/account" 
      className="cursor-pointer hover:text-blue-200"
      onClick={() => setIsSidebarOpen(false)}
    >
      👤
    </Link>
  </Tooltip>
</div>

      {/* Mobile logout */}
      <div className="sm:hidden mt-20">
        <Tooltip text="Log Out" position="top">
          <li
            onClick={handleLogout}
            className="flex items-center space-x-3 py-3 cursor-pointer text-red-600 hover:text-red-500"
          >
            <FiLogOut />
            <span>Log Out</span>
          </li>
        </Tooltip>
      </div>

      {/* Display logout message */}
      {localLogoutMessage && (
        <div className="absolute bottom-0 left-0 right-0 bg-green-100 p-2">
          <p>{localLogoutMessage}</p>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
