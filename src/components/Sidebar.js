import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome, FiGrid, FiMessageCircle, FiPlus, FiBookmark, FiBarChart,
  FiList, FiDatabase, FiHelpCircle, FiSettings, FiUserX, FiLogOut, FiCreditCard
} from 'react-icons/fi';
import { useAuth } from '../AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Tooltip from '../components/Tooltip';
import { useAccounts } from '../AccountContext';
import LogoutSplash from './logoutSplash';

function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const { logout, user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutMessage, setLogoutMessage] = useState('');
  const [showSplash, setShowSplash] = useState(false);
  const sidebarRef = useRef(null);
  const { accounts, activeAccount, setActiveAccount } = useAccounts();
  const [toastMessage, setToastMessage] = useState('');
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const [unreadCount, setUnreadCount] = useState(0);

  const handleAddAccountClick = () => {
    setToastMessage("Feature Coming Soon!");
    setTimeout(() => setToastMessage(""), 4000);
  };

  const switchAccount = async (accountName) => {
    const account = accounts.find(acc => acc.name === accountName);
    if (!account) {
      console.error("Account not found");
      return;
    }
    try {
      await logout();
      await login(account.user.email, account.password);
      setActiveAccount(account.name);
      console.log(`Switched to ${account.user.email}`);
    } catch (error) {
      console.error("Error switching account:", error);
      alert("Failed to switch account. Please try logging in again.");
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    setShowSplash(true);
    setLogoutMessage('Logging out...');
    await delay(2500);
    setLogoutMessage('Redirecting to login page...');
    await delay(2000);
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', icon: <FiHome />, path: '/home' },
    { name: 'Dashboard', icon: <FiGrid />, path: '/dashboard' },
    { name: 'Partner Chat', icon: <FiMessageCircle />, path: '/partner-chat' },
    { name: 'New Scenario', icon: <FiPlus />, path: '/new-scenario' },
    { name: 'Saved Scenarios', icon: <FiBookmark />, path: '/saved-scenarios' },
    { name: 'Analytics', icon: <FiBarChart />, path: '/analytics' },
    { name: 'Activity Log', icon: <FiList />, path: '/activity-log' },
    { name: 'Resources', icon: <FiDatabase />, path: '/resources' },
    { name: 'Payments', icon: <FiCreditCard />, path: '/payments' },
    { name: 'Support', icon: <FiHelpCircle />, path: '/support' },
    { name: 'Settings', icon: <FiSettings />, path: '/settings' },
    { name: 'My Profile', icon: <FiUserX />, path: '/user-profile' }
  ];

  return (
    <>
      {showSplash && <LogoutSplash message={logoutMessage} />}
      <aside
        ref={sidebarRef}
        id="sidebar"
        className={`h-full left-0 w-64 p-4 transition-all fixed inset-y-0 duration-300 z-30 
          bg-gradient-to-r from-blue-600 to-green-500 text-white dark:bg-gray-800 overflow-y-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {toastMessage && (
          <div className="absolute left-1/2 transform -translate-x-1/2 backdrop-blur-lg bg-red-600 text-white py-2 px-6 rounded-md shadow-lg"
            style={{ bottom: '120px', zIndex: 1000 }}>
            {toastMessage}
          </div>
        )}

        <div className="flex flex-col items-center mt-12 mb-6">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="User Avatar"
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg transform transition-transform hover:scale-105"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 animate-pulse" />
          )}
          <h2 className="mt-3 text-lg font-semibold text-center">
            {user?.firstName || 'User'} {user?.lastName || 'Name'}
          </h2>
        </div>

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

        <div className="mt-8 border-t border-white/30 pt-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-2">
            Accounts
          </h4>
          {accounts.map((acc) => (
            <button
              key={acc.name}
              onClick={() => switchAccount(acc.name)}
              className={`block w-full mb-20 text-left px-4 py-2 rounded-lg ${
                acc.name === activeAccount
                  ? 'bg-white/20 text-white font-semibold'
                  : 'hover:bg-white/10'
              }`}
            >
              {acc.user.email}
            </button>
          ))}
          <button
            onClick={handleAddAccountClick}
            aria-disabled="true"
            className="mt-2 block w-full text-left px-4 py-2 z-60 rounded-lg bg-green-600 opacity-80 cursor-not-allowed flex items-center gap-2"
          >
            <span>+ Add Account</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 11V17M12 7h.01M17 21H7a2 2 0 01-2-2V7a2 2 0 012-2h3m4 0h3a2 2 0 012 2v12a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>

        <div className="sm:hidden mt-4 flex bg-gray-300 rounded-xl p-2 justify-around text-sm">
          <ThemeToggle />
          <Tooltip text="Notifications" position="top">
            <Link
              to="/notifications"
              className="cursor-pointer hover:text-blue-200"
              onClick={() => setIsSidebarOpen(false)}
            >
              🔔
             {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
        {unreadCount}
      </span>
    )}
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

        <div className="sm:hidden mt-20">
          <ul>
            <Tooltip text="Log Out" position="top">
              <li
                onClick={handleLogout}
                className="flex items-center space-x-3 py-3 cursor-pointer text-red-600 hover:text-red-500"
              >
                <FiLogOut />
                <span>Log Out</span>
              </li>
            </Tooltip>
          </ul>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
