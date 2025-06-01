import React, { useEffect, useState, lazy, Suspense } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

import KpiCard from '../components/KpiCard';
import ActionButtons from '../components/ActionButton';
import CommandPalette from '../components/CommandPalette';
import AchievementsTab from '../components/AchievementsTab';
import SkeletonLoader from '../components/SkeletonLoader'; 
import QuickActions from '../components/QuickActionButtons';
import DiscountBanner from '../components/DiscountBanner';

// Lazy-loaded components
const ActivityFeed = lazy(() => import('../components/ActivityFeed'));
const AnalyticsOverview = lazy(() => import('../components/AnalyticsOverview'));
const SimulationTrendsChart = lazy(() => import('../components/SimulationTrendsChart'));
const TaskPlanner = lazy(() => import('../components/TaskList'));

const OmnisDashboard = () => {
  const [userFirstName, setUserFirstName] = useState(null);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState('quickStats');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDiscountBanner, setShowDiscountBanner] = useState(true);
  const [discountEndDate, setDiscountEndDate] = useState(null);
  const [showBanner, setShowBanner] = useState(true);
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
    const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  
  // Fetch user data and check subscription status
  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        // Check subscription tier
        if (data.subscriptionTier && data.subscriptionTier !== "free") {
          // User upgraded - no banner
          setDiscountEndDate(null);
          setShowBanner(false);
          return;
        }

        if (data.discountAvailableUntil) {
          const discountUntilDate = data.discountAvailableUntil.toDate
            ? data.discountAvailableUntil.toDate()
            : new Date(data.discountAvailableUntil);

          if (discountUntilDate > new Date()) {
            setDiscountEndDate(discountUntilDate);
            setShowBanner(true);
          } else {
            setDiscountEndDate(null);
            setShowBanner(false);
          }
        }
      }
    }

    fetchUserData();
  }, [user]);

  
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (searchQuery.trim() === '') {
        setFilteredData([]);
        return;
      }
      try {
        const q = query(
          collection(db, 'activities'),
          where('name', '>=', searchQuery),
          where('name', '<=', searchQuery + '\uf8ff')
        );
        const querySnapshot = await getDocs(q);
        setFilteredData(querySnapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error('Error fetching filtered data: ', error);
      }
    };
    fetchFilteredData();
  }, [searchQuery, db]);

  useEffect(() => {
    if (user) {
      const fetchUserName = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnapshot = await getDoc(userDocRef);
          if (docSnapshot.exists()) {
            setUserFirstName(docSnapshot.data().firstname);
          }
        } catch (error) {
          console.error('Error fetching user name: ', error);
        }
      };
      fetchUserName();
    }
  }, [user, db]);


  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('dashboard-search')?.focus();
      }
      if (e.altKey && e.key === '1') setActiveTab('quickStats');
      if (e.altKey && e.key === '2') setActiveTab('analytics');
      if (e.altKey && e.key === '3') setActiveTab('achievements');
      if (e.key === 'Escape') document.activeElement.blur();
      if (e.key === '?') setShowShortcuts(prev => !prev);
      if (e.key === 'Enter' && showShortcuts) {
        setShowShortcuts(false);
        document.activeElement.blur();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showShortcuts]);

  
  if (!user) {
    return <p>Please login to see your dashboard.</p>;
  }
  


  const tabLabels = {
    quickStats: 'Pilot Dashboard',
    analytics: 'Analytics',
    achievements: 'Achievements',
  };

  return (
     <>
      {showBanner && discountEndDate && (
        <DiscountBanner
          discountEndDate={discountEndDate}
          onClose={() => setShowBanner(false)}
        />
      )}
    
      <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setCommandPaletteOpen} setActiveTab={setActiveTab} />

      <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-screen pb-24 mt-10 transition-all duration-300">
        <h1 className="text-3xl font-semibold text-green-500 mb-6">
          {getGreeting()}, {userFirstName || 'there'} 👋
        </h1>

        <div
          role="tablist"
          className="flex flex-wrap gap-4 justify-center mt-8 sm:justify-start mb-4 sm:mb-6"
        >
          {Object.keys(tabLabels).map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`${tab}-panel`}
              id={`${tab}-tab`}
              onClick={() => setActiveTab(tab)}
              title={`Go to ${tabLabels[tab]}`}
              className={`px-4 py-2 sm:px-5 sm:py-2 rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === tab
                  ? 'bg-blue-500 text-white border border-blue-700'
                  : 'bg-gray-300 text-gray-800 hover:bg-green-300'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <div className="relative grid h-full grid-cols-1 msm:grid-cols-2 lg:grid-cols-1 gap-6 transition-all">
          {activeTab === 'quickStats' && (
            <div id="quickStats-panel" role="tabpanel" aria-labelledby="quickStats-tab">
              <h2 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mb-4">
                Quick stats, activity logs etc..
              </h2>
              <div className="mb-4 mt-8">
                <input
                  id="dashboard-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activities"
                  title="Search for activities"
                  className="pl-10 pr-4 py-2 w-full sm:w-2/4 border rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {filteredData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Search Results</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {filteredData.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
                        title="Click for more details"
                      >
                        <h4 className="font-bold text-lg">{item.name}</h4>
                        <p>{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Suspense fallback={<SkeletonLoader height="h-40" />}>
                <KpiCard />
              </Suspense>

              <Suspense fallback={<SkeletonLoader height="h-[300px]" />}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <ActivityFeed />
                  <SimulationTrendsChart />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <TaskPlanner />
                  <ActionButtons />
                </div>
              </Suspense>

              <div className="flex justify-center">
                <QuickActions />
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div id="analytics-panel" role="tabpanel" aria-labelledby="analytics-tab">
              <h2 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mb-4">
                Analytics (overview)
              </h2>
              <Suspense fallback={<SkeletonLoader height="h-[300px]" />}>
                <AnalyticsOverview />
              </Suspense>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div id="achievements-panel" role="tabpanel" aria-labelledby="achievements-tab">
              <h2 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mb-4">
                Gamification & Engagement
              </h2>
              <Suspense fallback={<SkeletonLoader height="h-[200px]" />}>
                <AchievementsTab />
              </Suspense>
            </div>
          )}
        </div>

        {showShortcuts && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring






ChatGPT said:
-blue-500 rounded"
onClick={() => setShowShortcuts(false)}
aria-label="Close keyboard shortcuts"
>
✕
</button>
<h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
<ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
<li><kbd className="px-2 py-1 bg-gray-200 rounded">/</kbd>: Focus search</li>
<li><kbd className="px-2 py-1 bg-gray-200 rounded">Alt + 1</kbd>: Quick Stats Tab</li>
<li><kbd className="px-2 py-1 bg-gray-200 rounded">Alt + 2</kbd>: Analytics Tab</li>
<li><kbd className="px-2 py-1 bg-gray-200 rounded">Alt + 3</kbd>: Achievements Tab</li>
<li><kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd>: Blur input / Close modals</li>
<li><kbd className="px-2 py-1 bg-gray-200 rounded">?</kbd>: Toggle this help dialog</li>
<li><kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd>: Close this dialog</li>
<li><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl + K / Cmd + K</kbd>: Open Command Palette</li>
</ul>
</div>
</div>
)}
</div>
</>
);
};

export default OmnisDashboard;