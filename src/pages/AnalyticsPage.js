import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import SkeletonLoader from '../components/SkeletonLoader';
import useAccessControl from '../hooks/useAccessControl';
import UpgradeModal from '../components/UpgradeModal';

// Lazy-loaded components
const AnalyticsCard = lazy(() => import('../components/AnalyticsCard'));
const DashboardCharts = lazy(() => import('../components/DashboardCharts'));
const ScenarioAccuracyChart = lazy(() => import('../components/ScenarioAccuracyChart'));
const CategoryDistributionChart = lazy(() => import('../components/CategoryDistributionChart'));
const NarrativePanel = lazy(() => import('../components/NarrativePanel'));

const AnalyticsPage = () => {
  const [totalTime, setTotalTime] = useState(0);
  const [totalSimulations, setTotalSimulations] = useState(0);
  const [scenarioAccuracy, setScenarioAccuracy] = useState(0);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [narrativeInsights, setNarrativeInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // or however you get user
  const userTier = user?.tier || 'Free';
  console.log("🧪 User tier:", userTier);


  // Access control hook
  const { checkAccess, showUpgradeModal, openModal, closeModal } = useAccessControl(userTier);
  const handleUpgradeClick = () => {
  setLoading(true); // show loading indicator
  openModal();      // then open the modal
  // Optionally, if you have async logic here, handle that and setLoading(false) when done
};
 const handleCloseModal = () => {
  closeModal();
  setLoading(false);
};

const canAccessAnalytics = true; // <-- Force bypass temporarily

  useEffect(() => {
    if (!checkAccess('fullAnalytics')) {
      setLoading(false);
      return; // Don't fetch data if no access
    }

    let isMounted = true; // Cleanup-ready flag

    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [timeSnapshot, simulationsSnapshot, scenariosSnapshot, narrativeSnapshot] = await Promise.all([
          getDocs(collection(db, 'user_analytics')),
          getDocs(collection(db, 'simulations')),
          getDocs(collection(db, 'scenarios')),
          getDocs(collection(db, 'narratives')),
        ]);

        if (!isMounted) return; // Prevent state updates if unmounted

        // Total time
        const timeData = timeSnapshot.docs.map(doc => doc.data().totalTimeSpent || 0);
        setTotalTime(timeData.reduce((acc, curr) => acc + curr, 0));

        // Total simulations
        setTotalSimulations(simulationsSnapshot.docs.length);

        // Scenarios: accuracy + categories
        const accuracyData = scenariosSnapshot.docs.map(doc => doc.data().accuracy || 0);
        setScenarioAccuracy(
          accuracyData.length > 0
            ? accuracyData.reduce((acc, curr) => acc + curr, 0) / accuracyData.length
            : 0
        );

        const categories = scenariosSnapshot.docs.map(doc => doc.data().category);
        const categoryCounts = categories.reduce((acc, category) => {
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        setCategoryDistribution(Object.entries(categoryCounts));

        // Narrative insights
        setNarrativeInsights(narrativeSnapshot.docs.map(doc => doc.data().insight));
      } catch (err) {
        console.error('❌ Error fetching analytics data:', err);
        if (isMounted) setError('Failed to load analytics data. Please try again later.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalyticsData();

    return () => {
      isMounted = false; // Cleanup
    };
  }, [userTier]); // Re-run if userTier changes

  if (!checkAccess('fullAnalytics')) {
    return (
      <div className="p-6 min-h-screen text-center">
        <h2 className="text-xl font-semibold text-red-500 mb-4">
          Access Denied: Upgrade Required</h2>
        <p className="text-xl font-semibold text-red-500 mb-4">Upgrade your subscription to Pro or Enterprise to unlock full analytics features.</p>
<button
  onClick={handleUpgradeClick}
      className="px-4 py-2 bg-blue-600 text-white mt-10 rounded hover:bg-blue-700"
      disabled={loading}
    >
      {loading ? 'Loading...' : 'Upgrade Now'}
    </button>
  

  {showUpgradeModal && (
      <UpgradeModal onClose={handleCloseModal} />
    )}
      </div>
    );
  }

  return (
    <div id="analytics-panel" role="tabpanel" aria-labelledby="analytics-tab" className="p-6 space-y-4 min-h-screen">
      <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300  mt-10 mb-4">User Analytics + Insights</h2>

      {loading ? (
        <SkeletonLoader height="h-[300px]" />
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div title="Total time spent on the platform">
              <Suspense fallback={<SkeletonLoader height="h-[150px]" />}>
                <AnalyticsCard value={totalTime} label="hours" />
              </Suspense>
            </div>
            <div title="Total number of simulations run">
              <Suspense fallback={<SkeletonLoader height="h-[150px]" />}>
                <DashboardCharts total={totalSimulations} />
              </Suspense>
            </div>
          </div>

          <div>
            <Suspense fallback={<SkeletonLoader height="h-[300px]" />}>
              <ScenarioAccuracyChart accuracy={scenarioAccuracy} />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div title="Distribution of scenarios across categories">
              <Suspense fallback={<SkeletonLoader height="h-[250px]" />}>
                <CategoryDistributionChart data={categoryDistribution} />
              </Suspense>
            </div>
            <div title="Narrative insights based on your simulations">
              <Suspense fallback={<SkeletonLoader height="h-[250px]" />}>
                <NarrativePanel insights={narrativeInsights} />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
// This component fetches and displays user analytics data, including total time spent, simulations run, scenario accuracy, category distribution, and narrative insights.
// It uses lazy loading for performance, and includes access control to restrict features based on user subscription tier.