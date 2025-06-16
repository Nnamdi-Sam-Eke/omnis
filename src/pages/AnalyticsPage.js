import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import SkeletonLoader from '../components/SkeletonLoader';
import useAccessControl from '../hooks/useAccessControl';
import UpgradeModal from '../components/UpgradeModal';
import { Clock, FlaskConical, Target, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

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
  const { user } = useAuth();
  const userTier = user?.tier || 'Free';

  const { checkAccess, showUpgradeModal, openModal, closeModal } = useAccessControl(userTier);
  const handleUpgradeClick = () => {
    setLoading(true);
    openModal();
  };
  const handleCloseModal = () => {
    closeModal();
    setLoading(false);
  };

  const canAccessAnalytics = true;

  useEffect(() => {
    if (!checkAccess('fullAnalytics')) {
      setLoading(false);
      return;
    }

    let isMounted = true;

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

        if (!isMounted) return;

        const timeData = timeSnapshot.docs.map(doc => doc.data().totalTimeSpent || 0);
        setTotalTime(timeData.reduce((acc, curr) => acc + curr, 0));

        setTotalSimulations(simulationsSnapshot.docs.length);

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
      isMounted = false;
    };
  }, [userTier]);

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
      <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mt-10 mb-6">User Analytics & Insights</h2>

      {loading ? (
        <SkeletonLoader height="h-[300px]" />
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Time Spent</span>
              </div>
              <Suspense fallback={<SkeletonLoader height="h-[150px]" />}>
                <AnalyticsCard value={<CountUp end={totalTime} duration={2} />} label="hours" />
              </Suspense>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-5 h-5 text-indigo-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Simulations</span>
              </div>
              <Suspense fallback={<SkeletonLoader height="h-[150px]" />}>
                <DashboardCharts total={totalSimulations} />
              </Suspense>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Scenario Accuracy</span>
            </div>
            <Suspense fallback={<SkeletonLoader height="h-[300px]" />}>
              <ScenarioAccuracyChart accuracy={scenarioAccuracy} />
            </Suspense>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-5 h-5 text-pink-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Category Distribution</span>
              </div>
              <Suspense fallback={<SkeletonLoader height="h-[250px]" />}>
                <CategoryDistributionChart data={categoryDistribution} />
              </Suspense>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Narrative Insights</span>
              </div>
              <Suspense fallback={<SkeletonLoader height="h-[250px]" />}>
                <NarrativePanel insights={narrativeInsights} />
              </Suspense>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
