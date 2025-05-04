import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { Toaster } from 'react-hot-toast';
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

// Pages
import Home from './pages/Home';
import PartnerChat from './pages/PartnerChat';
import SavedScenarios from './pages/SavedScenarios';
import UserProfilePage from './pages/UserProfilePage';
import Support from './pages/Support';
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

function AppContent() {
  const [currentPage, setCurrentPage] = useState('');
  const [logoutMessage, setLogoutMessage] = useState("");

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile menu state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const location = useLocation(); // 👈 Get current route

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLogoutMessage("You have been logged out successfully.");
      setTimeout(() => {
        setLogoutMessage("");
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      console.error("❌ Error logging out:", err.message);
    }
  };

  // ❗ Define which routes should NOT show the UI
  const noLayoutRoutes = ['/login', '/'];
  const hideLayout = noLayoutRoutes.includes(location.pathname);

  return (
    <div className="scale-95 lg:scale-75 origin-top-left w-[105.26%] lg:w-[133.33%]">
      <div className="min-h-full w-full bg-white dark:bg-gray-900">
        <main className="min-h-full w-full bg-white dark:bg-gray-900">
          <AuthProvider>
            <Toaster position="top-right" />
            
            {/* ✅ Conditionally show Header & Sidebar */}
            {!hideLayout && (
              <>
                <Header
                  toggleSidebar={toggleSidebar}
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
                <Routes>
                <Route path="/" element={<AuthForm />} />
                  <Route path="/login" element={<AuthForm />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/dashboard" element={<OmnisDashboard />} />
                  <Route path="/partner-chat" element={<PartnerChat />} />
                  <Route path="/saved-scenarios" element={<SavedScenarios />} />
                  <Route path="/user-profile" element={<UserProfilePage />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/activity-log" element={<ActivityLog />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/new-scenario" element={<ScenarioTabs />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path='/profile' element={<ProfilePage />} />
                </Routes>
              </MemoryProvider>
            </OmnisProvider>

             {/* 👇 FOOTER & OTHER BOTTOM ELEMENTS */}
    {!hideLayout && (
      <>
        <Footer />
        <CreatorsCorner />
        <FeedbackButton />
      </>
    )}
          </AuthProvider>
        </main>
        
      </div>
    </div>
  );
}

export default function App() {
  return (
  <AppContent />
    
  );
}
