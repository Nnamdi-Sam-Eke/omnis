import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Toaster } from 'react-hot-toast';
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

// Pages
import SplashScreen from './components/SplashScreen';
import Home from './pages/Home';
import PartnerChat from './pages/PartnerChat';
import SavedScenarios from './pages/SavedScenarios';
import UserProfilePage from './pages/UserProfilePage';
import Support from './pages/Support';
import PaymentsPage from './pages/PaymentsPage';
import ResourcesPage from './pages/ResourcesPage';
import Settings from './pages/Settings';
import AnalyticsPage from './pages/AnalyticsPage';
import ScenarioTabs from './pages/ScenarioTabs';
import OmnisDashboard from './pages/OmnisDashboard';
import ActivityLog from './pages/ActivityLog';
import NotificationsPage from './pages/NotificationsPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FeedbackButton from './components/FeedbackButton';
import CreatorsCorner from './Creator\'sCorner';
import Footer from './components/Footer';

import './App.css';
import { OmnisProvider } from './context/OmnisContext';
import { MemoryProvider } from './MemoryContext';
import AuthForm from './components/AuthForm';
import ProfilePage from './components/SimpleProfilePage';
import AccountPage from './pages/ProfilePage';
import { AccountProvider } from './AccountContext';
import StripeProvider from './StripeProvider';
import UpgradeModal from './components/UpgradeModal';


// ✅ PrivateRoute
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return !user ? children : <Navigate to="/dashboard" />;
};

const noLayoutRoutes = ['/login'];

const AppContent = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Sidebar & UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Logout handler
  const handleLogout = () => {
    signOut(auth).catch(error => {
      console.error("Error signing out:", error);
    });
  };

  const hideLayout = noLayoutRoutes.includes(location.pathname);

  // Splash states
  const [initialSplashDone, setInitialSplashDone] = useState(false);
  const [postLoginSplash, setPostLoginSplash] = useState(false);

  // Run splash on initial app load (before login)
  useEffect(() => {
    const timer = setTimeout(() => setInitialSplashDone(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  // Run splash after login
  useEffect(() => {
    if (user) {
      setPostLoginSplash(true);
      const timer = setTimeout(() => {
        setPostLoginSplash(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setPostLoginSplash(false);
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;

  // Splash on first visit (before login)
  if (!initialSplashDone) {
    return <SplashScreen />;
  }

  // If user not logged in, show login page
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<PublicRoute><AuthForm /></PublicRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Splash after login
  if (postLoginSplash) {
    return <SplashScreen />;
  }

  // After all that, show main app UI with layout
  return (
    <div className="scale-75 origin-top-left w-[133.33%]">
      <div className="min-h-full w-full bg-white dark:bg-gray-900">
        <main className="min-h-full w-full pt-16 px-2 bg-white dark:bg-gray-900">
          <AccountProvider>
            <Toaster position="top-right" />

            {/* Header & Sidebar */}
            {!hideLayout && (
              <>
                <Header
                  toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  currentPage={currentPage}
                  isProfileMenuOpen={isProfileMenuOpen}
                  setIsProfileMenuOpen={setIsProfileMenuOpen}
                  setCurrentPage={setCurrentPage}
                  handleLogout={handleLogout}
                />
                <Sidebar
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  handleLogout={handleLogout}
                />
              </>
            )}

            <OmnisProvider>
              <MemoryProvider>
              <StripeProvider>
                <Routes>
                  {/* Public Route */}
                  <Route path="/login" element={<PublicRoute><AuthForm /></PublicRoute>} />

                  {/* Private Routes */}
                  <Route path="/" element={<PrivateRoute><OmnisDashboard /></PrivateRoute>} />
                  <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                  <Route path="/dashboard" element={<PrivateRoute><OmnisDashboard /></PrivateRoute>} />
                  <Route path="/partner-chat" element={<PrivateRoute><PartnerChat /></PrivateRoute>} />
                  <Route path="/saved-scenarios" element={<PrivateRoute><SavedScenarios /></PrivateRoute>} />
                  <Route path="/user-profile" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
                  <Route path="/support" element={<PrivateRoute><Support /></PrivateRoute>} />
                  <Route path="/activity-log" element={<PrivateRoute><ActivityLog /></PrivateRoute>} />
                  <Route path="/resources" element={<PrivateRoute><ResourcesPage /></PrivateRoute>} />
                  <Route path="/new-scenario" element={<PrivateRoute><ScenarioTabs /></PrivateRoute>} />
                  <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                  <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
                  <Route path="/payments" element={<PrivateRoute><PaymentsPage /></PrivateRoute>} />
                  <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
                  <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                </Routes>
              </StripeProvider>
        
{(location.pathname === '/dashboard' || location.pathname === '/') && <UpgradeModal />}


              </MemoryProvider>
            </OmnisProvider>

            {/* Footer & Bottom UI */}
            {!hideLayout && <Footer />}
            {!hideLayout && <CreatorsCorner />}
            {!hideLayout && <FeedbackButton />}

          </AccountProvider>
        </main>
      </div>
    </div>
  );
};

// ✅ Top-Level App with BrowserRouter
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
