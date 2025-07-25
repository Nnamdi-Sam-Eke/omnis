import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { signOut } from "firebase/auth";
import { auth, db, messaging } from "./firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { onMessage } from "firebase/messaging";

// Pages
import SessionTracker from './components/SessionTracker';
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
import GoodbyePage from './pages/GoodbyePage';

import ErrorBoundary from './components/ErrorBoundary';
import { OmnisProvider } from './context/OmnisContext';
import { MemoryProvider } from './MemoryContext';
import { AccountProvider } from './AccountContext';
import { DiscountProvider, useDiscount } from './context/DiscountContext';
import AuthForm from './components/AuthForm';
import ProfilePage from './components/SimpleProfilePage';
import AccountPage from './pages/ProfilePage';
import StripeProvider from './StripeProvider';
import UpgradeModal from './components/UpgradeModal';
import DiscountBanner from './components/DiscountBanner';
import './App.css';

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const userTier = user?.tier || 'Free';
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [initialSplashDone, setInitialSplashDone] = useState(false);
  const [postLoginSplash, setPostLoginSplash] = useState(false);

  const hideLayout = noLayoutRoutes.includes(location.pathname);
  const { showBanner, discountEndDate, setShowBanner } = useDiscount();

  const handleLogout = () => {
    signOut(auth).catch(error => {
      console.error("Error signing out:", error);
    });
  };

  // ⏫ Upgrade Modal Logic
  useEffect(() => {
    async function checkUpgradeModal() {
      if (!user || !user.uid || !user.tier) return;

      const tier = user.tier.toLowerCase();
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const data = userSnap.data();
      const expiryTimestamp = data.subscriptionExpiry;
      const lastModalTimestamp = data.lastUpgradeModalShown;
      const now = new Date();

      const isFree = tier === 'free';
      const isPro = tier === 'pro';
      const isEnterprise = tier === 'enterprise';

      let isExpired = false;
      if ((isPro || isEnterprise) && expiryTimestamp) {
        const expiryDate = expiryTimestamp.toDate ? expiryTimestamp.toDate() : new Date(expiryTimestamp);
        if (now > expiryDate) isExpired = true;
      }

      if (isFree || isExpired) {
        if (!lastModalTimestamp) {
          setShowUpgradeModal(true);
          await updateDoc(userRef, { lastUpgradeModalShown: Timestamp.now() });
          return;
        }

        const lastShownDate = lastModalTimestamp.toDate ? lastModalTimestamp.toDate() : new Date(lastModalTimestamp);
        const diffInHours = (now - lastShownDate) / (1000 * 60 * 60);

        if (diffInHours >= 2) {
          setShowUpgradeModal(true);
          await updateDoc(userRef, { lastUpgradeModalShown: Timestamp.now() });
        } else {
          setShowUpgradeModal(false);
        }
        return;
      }

      if ((isPro || isEnterprise) && !isExpired) {
        setShowUpgradeModal(false);
        return;
      }

      if (!lastModalTimestamp) {
        setShowUpgradeModal(true);
        await updateDoc(userRef, { lastUpgradeModalShown: Timestamp.now() });
        return;
      }

      const lastShownDate = lastModalTimestamp.toDate ? lastModalTimestamp.toDate() : new Date(lastModalTimestamp);
      const diffInDays = (now - lastShownDate) / (1000 * 60 * 60 * 24);

      if (diffInDays >= 30) {
        setShowUpgradeModal(true);
        await updateDoc(userRef, { lastUpgradeModalShown: Timestamp.now() });
      } else {
        setShowUpgradeModal(false);
      }
    }

    checkUpgradeModal();
  }, [user]);

  // ✅ Handle incoming push notifications
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Push notification received:", payload);

      // Show in-app toast
      toast(payload.notification?.title || "New Notification", {
        description: payload.notification?.body,
      });
    });

    return () => unsubscribe();
  }, []);

  // Splash logic
  useEffect(() => {
    const timer = setTimeout(() => setInitialSplashDone(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) {
      setPostLoginSplash(true);
      const timer = setTimeout(() => setPostLoginSplash(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setPostLoginSplash(false);
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!initialSplashDone) return <SplashScreen />;
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<PublicRoute><AuthForm /></PublicRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }
  if (postLoginSplash) return <SplashScreen />;

  return (
    <div className="scale-75 origin-top-left w-[133.33%]">
      <div className="min-h-screen w-full bg-white dark:bg-gray-900">
        {!hideLayout && showBanner && discountEndDate && (
          <DiscountBanner
            discountEndDate={discountEndDate}
            onClose={() => setShowBanner(false)}
          />
        )}

        <main className="min-h-full w-full pt-16 px-2 bg-white dark:bg-gray-900">
          <AccountProvider>
            {/* ✅ Correct placement */}
            <Toaster position="top-right" />

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
                  <SessionTracker />

                  <Routes>
                    <Route path="/login" element={<PublicRoute><AuthForm /></PublicRoute>} />
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
                    <Route path="/goodbye" element={<GoodbyePage />} />
                  </Routes>

                  {showUpgradeModal && (location.pathname === '/dashboard' || location.pathname === '/') && (
                    <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
                  )}
                </StripeProvider>
              </MemoryProvider>
            </OmnisProvider>

            {!hideLayout && <Footer />}
            {!hideLayout && <CreatorsCorner />}
            {!hideLayout && <FeedbackButton />}
          </AccountProvider>
        </main>
      </div>
    </div>
  );
};

// ✅ Top-Level App
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DiscountProvider>
          <AppContent />
        </DiscountProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
