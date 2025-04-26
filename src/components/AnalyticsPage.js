import React, { useEffect, useState, lazy, Suspense } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import SkeletonLoader from '../components/SkeletonLoader';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);

      try {
        const timeRef = collection(db, "user_analytics");
        const timeSnapshot = await getDocs(timeRef);
        const timeData = timeSnapshot.docs.map(doc => doc.data().totalTimeSpent || 0);
        setTotalTime(timeData.reduce((acc, curr) => acc + curr, 0));

        const simulationsRef = collection(db, "simulations");
        const simulationsSnapshot = await getDocs(simulationsRef);
        setTotalSimulations(simulationsSnapshot.docs.length);

        const accuracyRef = collection(db, "scenarios");
        const accuracySnapshot = await getDocs(accuracyRef);
        const accuracyData = accuracySnapshot.docs.map(doc => doc.data().accuracy || 0);
        setScenarioAccuracy(accuracyData.length > 0 ? accuracyData.reduce((acc, curr) => acc + curr, 0) / accuracyData.length : 0);

        const categoryRef = collection(db, "scenarios");
        const categorySnapshot = await getDocs(categoryRef);
        const categories = categorySnapshot.docs.map(doc => doc.data().category);
        const categoryCounts = categories.reduce((acc, category) => {
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        setCategoryDistribution(Object.entries(categoryCounts));

        const narrativeRef = collection(db, "narratives");
        const narrativeSnapshot = await getDocs(narrativeRef);
        setNarrativeInsights(narrativeSnapshot.docs.map(doc => doc.data().insight));

      } catch (error) {
        console.error('❌ Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div id="analytics-panel" role="tabpanel" aria-labelledby="analytics-tab">
      <h2 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mb-4">User Analytics + Insights</h2>

      {loading ? (
        <SkeletonLoader height="h-[300px]" />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div title="Total time spent on the platform">
              <h3 className="font-semibold text-green-500">Total Time Spent</h3>
              <Suspense fallback={<SkeletonLoader height="h-[150px]" />}>
                <AnalyticsCard value={totalTime} label="hours" />
              </Suspense>
            </div>
            <div title="Total number of simulations run">
              <h3 className="font-semibold text-green-500">Total Simulations</h3>
              <Suspense fallback={<SkeletonLoader height="h-[150px]" />}>
                <DashboardCharts total={totalSimulations} />
              </Suspense>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-green-500">Scenario Accuracy</h3>
            <Suspense fallback={<SkeletonLoader height="h-[300px]" />}>
              <ScenarioAccuracyChart accuracy={scenarioAccuracy} />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div title="Distribution of scenarios across categories">
              <h3 className="font-semibold text-green-500">Category Distribution</h3>
              <Suspense fallback={<SkeletonLoader height="h-[250px]" />}>
                <CategoryDistributionChart data={categoryDistribution} />
              </Suspense>
            </div>
            <div title="Narrative insights based on your simulations">
              <h3 className="font-semibold text-green-500">Narrative Insights</h3>
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
