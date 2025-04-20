import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ActivityFeed from './ActivityFeed';
import KpiCard from './KpiCard';
import Charts from './Charts';
import ActionButtons from './ActionButton';
import AnalyticsCard from "./AnalyticsCard";
import DashboardCharts from './DashboardCharts';
import AvgAccuracyChartTabs from './AvgAccuracyCharts';
import SimulationTrendsChart from './SimulationTrendsChart';
import ScenarioAccuracyChart from './ScenarioAccuracyChart';
import CategoryDistributionChart from './CategoryDistributionChart';
import NarrativePanel from './NarrativePanel';

const OmnisDashboard = () => {
  const [userFirstName, setUserFirstName] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Store search query
  const [filteredData, setFilteredData] = useState([]); // Store filtered data (e.g., activities, saved scenarios)
  const [activeTab, setActiveTab] = useState("quickStats"); // State for active tab

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  // Fetch and filter data based on search query
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (searchQuery.trim() === "") {
        setFilteredData([]); // If search is empty, reset the filtered data
        return;
      }
      
      try {
        // Firestore query to filter by name (adjust based on your collection and field structure)
        const q = query(collection(db, "activities"), 
          where("name", ">=", searchQuery), 
          where("name", "<=", searchQuery + "\uf8ff")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => doc.data()); // Extract data from Firestore snapshot
        setFilteredData(data); // Set the filtered data
      } catch (error) {
        console.error("Error fetching filtered data: ", error);
      }
    };

    fetchFilteredData();
  }, [searchQuery, db]);

  // Fetch user's first name from Firestore when component mounts
  useEffect(() => {
    if (user) {
      const fetchUserName = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const docSnapshot = await getDoc(userDocRef);
          if (docSnapshot.exists()) {
            setUserFirstName(docSnapshot.data().firstname); // Ensure "firstname" exists in the Firestore document
          } else {
            console.log('No user document found');
          }
        } catch (error) {
          console.error('Error fetching user name: ', error);
        }
      };

      fetchUserName();
    }
  }, [user, db]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-4 space-y-6">
      {/* Greeting */}
      <h1 className="text-3xl font-semibold text-green-500 mb-6">
        {getGreeting()}, {userFirstName || "there"} 👋
      </h1>

      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-4 justify-center sm:justify-start mb-4 sm:mb-6">
        {["quickStats", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 sm:px-5 sm:py-2 rounded-full font-semibold transition-all ${activeTab === tab ? "bg-blue-500 text-white border border-blue-700" : "bg-gray-300 text-gray-800 hover:bg-green-300"}`}
          >
            {tab === "quickStats" ? "Pilot Dashboard" : "Analytics"}
          </button>
        ))}
      </div>

      {/* Tab Panels with fade effect */}
      <div className="relative grid h-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        {activeTab === "quickStats" && (
          <div
            className={`transition-opacity duration-500 ease-in-out ${activeTab === "quickStats" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            {/* Quick Stats, Activity Log, KPI Metrics */}
            <h1 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mb-4">
              Quick stats, activity log etc...
            </h1>

            {/* Search Bar */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4 w-full sm:w-2/3">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} // Update search query on input change
                    placeholder="Search activities"
                    className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Display filtered data */}
            {filteredData.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Search Results</h2>
                <div className="grid grid-cols-1 gap-6">
                  {filteredData.map((item, index) => (
                    <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p>{item.description}</p> {/* Adjust based on your data structure */}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <KpiCard />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <SimulationTrendsChart />
            </div>

            {/* Activity Feed and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AvgAccuracyChartTabs />
              <Charts />
            </div>

            {/* Recent Activity and Trend Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              <ActivityFeed />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <div className="w-full max-w-xl">
                <ActionButtons />
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div
            className={`transition-opacity duration-500 ease-in-out ${activeTab === "analytics" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            {/* Analytics Section */}
            <h1 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mb-4">
              User Analytics + Insights
            </h1>

            <div className="p-4">
              {/* Example charts and data */}
              <div className="flex flex-col space-y-4">
                <div>
                  <h3 className="font-semibold text-green-500">Total Time Spent</h3>
                  <AnalyticsCard />
                </div>
                <div>
                  <h3 className="font-semibold  text-green-500">Total Simulations</h3>
                  <DashboardCharts />
                </div>
                <div>
                  <h3 className="font-semibold  text-green-500">Narrative Insights</h3>
                  <NarrativePanel />
                </div>
                <div>
                  <h3 className="font-semibold  text-green-500">Scenario Accuracy</h3>
                  <ScenarioAccuracyChart />
                </div>
                <div>
                  <h3 className="font-semibold  text-green-500">Category Distribution</h3>
                  <CategoryDistributionChart />
                </div>
                <div className="mt-16"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OmnisDashboard;
