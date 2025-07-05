import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Toaster } from 'react-hot-toast';
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";




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
import GoodbyePage from './pages/GoodbyePage'; // adjust path accordingly


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

  // Sidebar & UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const userTier = user?.tier || 'Free';
  console.log("🧪 User tier:", userTier);


  // Logout handler
  const handleLogout = () => {
    signOut(auth).catch(error => {
      console.error("Error signing out:", error);
    });
  };

  const hideLayout = noLayoutRoutes.includes(location.pathname);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  // Splash states
  const [initialSplashDone, setInitialSplashDone] = useState(false);
  const [postLoginSplash, setPostLoginSplash] = useState(false);

useEffect(() => {
  async function checkUpgradeModal() {
    if (!user || !user.uid || !user.tier) {
      console.log('⏳ Waiting for user or tier...');
      return;
    }

    const tier = user.tier.toLowerCase(); // 'free', 'pro', 'enterprise'
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn('❌ User document not found.');
      return;
    }

    const data = userSnap.data();
    const expiryTimestamp = data.subscriptionExpiry;
    const lastModalTimestamp = data.lastUpgradeModalShown;
    const now = new Date();

    const isFree = tier === 'free';
    const isPro = tier === 'pro';
    const isEnterprise = tier === 'enterprise';

    // Handle expiration check
    let isExpired = false;
    if ((isPro || isEnterprise) && expiryTimestamp) {
      const expiryDate = expiryTimestamp.toDate ? expiryTimestamp.toDate() : new Date(expiryTimestamp);
      if (now > expiryDate) {
        isExpired = true;
        console.log('🔔 Subscription expired.');
      }
    }

    // Show modal only if:
    // 1. Free tier
    // 2. Expired Pro or Enterprise
    // 3. It's been >=30 days since last shown (for other tiers)
    if (isFree) {
      // For free users, show if never shown before in >=2 hours
      if (!lastModalTimestamp) {
        console.log('✅ Showing upgrade modal for Free user');
      console.log('✅ Showing upgrade modal for Free or Expired user');
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


    if (isExpired) {
      console.log('✅ Showing upgrade modal for Free or Expired user');
      setShowUpgradeModal(true);
      await updateDoc(userRef, { lastUpgradeModalShown: Timestamp.now() });
      return;
    }

    // Do NOT show modal if active Pro or Enterprise
    if ((isPro || isEnterprise) && !isExpired) {
      console.log('✅ Active Pro/Enterprise user – skipping modal');
      setShowUpgradeModal(false);
      return;
    }

    // Other case – show if last shown >= 30 days ago
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

  // Use discount context inside AppContent
  const { showBanner, discountEndDate, setShowBanner } = useDiscount();

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

  <Toaster position="top-right" reverseOrder={false} />




  // ...

  // After all that, show main app UI with layout
  return (
  <div className="scale-75 origin-top-left w-[133.33%]">
    <div className="min-h-screen w-full bg-white dark:bg-gray-900">

      {/* Show banner everywhere except no-layout routes like /login */}
      {!hideLayout && showBanner && discountEndDate && (
        <DiscountBanner
          discountEndDate={discountEndDate}
          onClose={() => setShowBanner(false)}
        />
      )}

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
                {/* Session Tracker */}
                <SessionTracker />

                {/* Main Routes */}
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
                  <Route path="/goodbye" element={<GoodbyePage />} />
                </Routes>

                {showUpgradeModal && (location.pathname === '/dashboard' || location.pathname === '/') && (
  <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
)}

              </StripeProvider>
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
}


// ✅ Top-Level App with BrowserRouter and DiscountProvider added
export default function App() {
  return (

    <AuthProvider>
      <DiscountProvider>
        <AppContent />
      </DiscountProvider>
    </AuthProvider>

  );
}
