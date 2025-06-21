import React, { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import SkeletonLoader from '../components/SkeletonLoader';
import useAccessControl from '../hooks/useAccessControl';
import UpgradeModal from '../components/UpgradeModal';
import { Clock, FlaskConical, Target, Lightbulb, Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const userTier = user?.tier || 'Free';

  const analyticsCardRef = useRef(null);
  const dashboardChartsRef = useRef(null);
  const scenarioAccuracyChartRef = useRef(null);
  const categoryDistributionChartRef = useRef(null);
  const narrativePanelRef = useRef(null);

  const [chartsReady, setChartsReady] = useState({
    analyticsCard: false,
    dashboardCharts: false,
    scenarioAccuracy: false,
    categoryDistribution: false,
    narrativePanel: false,
  });

  const allChartsReady = Object.values(chartsReady).every(Boolean);

  const { checkAccess, showUpgradeModal, openModal, closeModal } = useAccessControl(userTier);
  
  const handleUpgradeClick = () => {
    setLoading(true);
    openModal();
  };
  
  const handleCloseModal = () => {
    closeModal();
    setLoading(false);
  };

  useEffect(() => {
    if (!checkAccess('fullAnalytics')) return;

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
    return () => { isMounted = false; };
  }, [userTier]);

  const downloadPDF = async () => {
    try {
      setIsDownloading(true);
      
      // Show notification if charts aren't ready
      if (!allChartsReady) {
        alert('Charts are still loading. The PDF will be generated with available data.');
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 30;

      pdf.setFontSize(24);
      pdf.setTextColor(37, 99, 235);
      pdf.text('ANALYTICS REPORT', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;

      pdf.setDrawColor(37, 99, 235);
      pdf.setLineWidth(0.5);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 15;

      const chartRefs = [
        { ref: analyticsCardRef, title: 'Total Time Spent' },
        { ref: dashboardChartsRef, title: 'Total Simulations' },
        { ref: scenarioAccuracyChartRef, title: 'Scenario Accuracy' },
        { ref: categoryDistributionChartRef, title: 'Category Distribution' },
        { ref: narrativePanelRef, title: 'Narrative Insights' }
      ];

      for (let { ref, title } of chartRefs) {
        if (ref.current) {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text(title, 20, yPosition);
          yPosition += 10;

          const canvas = await html2canvas(ref.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            scrollY: -window.scrollY
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (yPosition + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
            pdf.setFontSize(14);
            pdf.text(title, 20, yPosition);
            yPosition += 10;
          }

          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 20;
        }
      }

      pdf.save('analytics-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

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
        {showUpgradeModal && <UpgradeModal onClose={handleCloseModal} />}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-300">User Analytics & Insights</h2>
        
        {/* Enhanced Download Button */}
        <motion.button
          onClick={downloadPDF}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative group flex items-center gap-3 px-6 py-3 
            text-white font-medium rounded-xl
            transition-all duration-300 ease-in-out
            shadow-lg hover:shadow-xl
            ${isDownloading 
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 cursor-wait' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            }
            transform hover:-translate-y-0.5
            border border-blue-500/20
            backdrop-blur-sm
          `}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          
          {/* Button content */}
          <div className="relative flex items-center gap-3">
            {isDownloading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">Generating PDF...</span>
              </>
            ) : (
              <>
                <div className="relative">
                  <Download className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  <FileText className="w-3 h-3 absolute -bottom-1 -right-1 text-white/80" />
                </div>
                <span className="text-sm font-semibold">Export Report</span>
                
                {/* Status indicator */}
                <div className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${allChartsReady 
                    ? 'bg-green-400 shadow-lg shadow-green-400/50' 
                    : 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50'
                  }
                `}></div>
              </>
            )}
          </div>
          
          {/* Tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
            {isDownloading 
              ? 'Please wait...' 
              : allChartsReady 
                ? 'Download complete analytics report' 
                : 'Download available data (some charts still loading)'
            }
          </div>
        </motion.button>
      </div>

      <div id="analytics-panel" className="space-y-6">
        {loading && !error ? (
          <SkeletonLoader height="h-[300px]" />
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Time Spent</span>
                </div>
                <div ref={analyticsCardRef}>
                  <Suspense fallback={<SkeletonLoader height="h-[150px]" />}>
                    <AnalyticsCard
                      value={<CountUp end={totalTime} duration={2} />}
                      label="hours"
                      onRendered={() => setChartsReady(prev => ({ ...prev, analyticsCard: true }))}
                    />
                  </Suspense>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Simulations</span>
                </div>
                <div ref={dashboardChartsRef}>
                  <Suspense fallback={<SkeletonLoader height="h-[150px]" />}>
                    <DashboardCharts
                      total={totalSimulations}
                      onRendered={() => setChartsReady(prev => ({ ...prev, dashboardCharts: true }))}
                    />
                  </Suspense>
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Scenario Accuracy</span>
              </div>
              <div ref={scenarioAccuracyChartRef}>
                <Suspense fallback={<SkeletonLoader height="h-[300px]" />}>
                  <ScenarioAccuracyChart
                    accuracy={scenarioAccuracy}
                    onRendered={() => setChartsReady(prev => ({ ...prev, scenarioAccuracy: true }))}
                  />
                </Suspense>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-5 h-5 text-pink-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Category Distribution</span>
                </div>
                <div ref={categoryDistributionChartRef}>
                  <Suspense fallback={<SkeletonLoader height="h-[250px]" />}>
                    <CategoryDistributionChart
                      data={categoryDistribution}
                      onRendered={() => setChartsReady(prev => ({ ...prev, categoryDistribution: true }))}
                    />
                  </Suspense>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Narrative Insights</span>
                </div>
                <div ref={narrativePanelRef}>
                  <Suspense fallback={<SkeletonLoader height="h-[250px]" />}>
                    <NarrativePanel
                      insights={narrativeInsights}
                      onRendered={() => setChartsReady(prev => ({ ...prev, narrativePanel: true }))}
                    />
                  </Suspense>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;