import React, { useEffect, useState, lazy, Suspense, useRef } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

const ActivityLogRow = lazy(() => import("../components/ActivityLogRow"));
const ActiveSessionsModal = lazy(() => import("../components/ActiveSessionsModal"));

const ActivityLogPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user?.uid && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchActivityData();
      fetchActiveSessions();
    }
  }, [user?.uid]);

  const fetchActiveSessions = async () => {
    if (!user?.uid) return;
    
    try {
      const sessionsRef = collection(db, "sessions");
      const q = query(sessionsRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        loginTime: doc.data().loginTime?.toDate?.(),
        lastActivity: doc.data().lastActivity?.toDate?.()
      }));

      setActiveSessions(sessions);
    } catch (error) {
      console.error("Error fetching active sessions:", error);
    }
  };

  const fetchActivityData = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const sessionsRef = collection(db, "users", user.uid, "sessions");
      const sessionsSnapshot = await getDocs(sessionsRef);
      const sessionDocs = sessionsSnapshot.docs;

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const activityLogs = [];

        if (userData.lastLogin) {
          activityLogs.push({
            id: "lastLogin",
            activityType: "Last Login",
            description: `You logged into your account`,
            timestamp: userData.lastLogin.toDate(),
          });
        }

        if (userData.profileUpdated) {
          activityLogs.push({
            id: "profileUpdated",
            activityType: "Profile Updated",
            description: `You made changes to your profile `,
            timestamp: userData.profileUpdated.toDate(),
          });
        }

        if (userData.passwordChanged) {
          activityLogs.push({
            id: "passwordChanged",
            activityType: "Password Changed",
            description: `You updated your account password`,
            timestamp: userData.passwordChanged.toDate(),
          });
        }

        if (userData.emailChanged) {
          activityLogs.push({
            id: "emailChanged",
            activityType: "Email Changed",
            description: `You changed your email address`,
            timestamp: userData.emailChanged.toDate(),
          });
        }

        if (userData.accountDeleted) {
          activityLogs.push({
            id: "accountDeleted",
            activityType: "Account Deleted",
            description: `You deleted your account`,
            timestamp: userData.accountDeleted.toDate(),
          });
        }

        if (userData.createdAt) {
          activityLogs.push({
            id: "accountCreated",
            activityType: "Account Created",
            description: `You created your Omnis account`,
            timestamp: userData.createdAt.toDate(),
          });
        }

        if (userData.sessionEnded) {
          activityLogs.push({
            id: "sessionEnded",
            activityType: "Session Ended",
            description: `Your session ended`,
            timestamp: userData.sessionEnded.toDate(),
          });
        }

        if (userData.planUpgraded) {
          activityLogs.push({
            id: "planUpgraded",
            activityType: "Plan Upgraded",
            description: `You upgraded your plan to "${userData.planUpgraded.to || 'a higher tier'}"`,
            timestamp: userData.planUpgraded.timestamp.toDate(),
          });
        }

        if (userData.planDowngraded) {
          activityLogs.push({
            id: "planDowngraded",
            activityType: "Plan Downgraded",
            description: `You downgraded your plan to "${userData.planDowngraded.to || 'a lower tier'}"`,
            timestamp: userData.planDowngraded.timestamp.toDate(),
          });
        }

        if (userData.trialStartedAt && userData.hasUsedSimulationTrial) {
          activityLogs.push({
            id: "trialStarted",
            activityType: "Trial Started",
            description: `You started your 7-day free trial `,
            timestamp: userData.trialStartedAt.toDate(),
          });

          const trialEnd = new Date(userData.trialStartedAt.toDate().getTime() + 7 * 24 * 60 * 60 * 1000);
          if (trialEnd < new Date()) {
            activityLogs.push({
              id: "trialEnded",
              activityType: "Trial Ended",
              description: `Your 7-day free trial ended `,
              timestamp: trialEnd,
            });
          }
        }

        if (userData.paymentFailed) {
          activityLogs.push({
            id: "paymentFailed",
            activityType: "Payment Failed",
            description: `A payment attempt failed. Please update your billing info.`,
            timestamp: userData.paymentFailed.toDate(),
          });
        }

        if (userData.reportDownloaded) {
          activityLogs.push({
            id: "reportDownloaded",
            activityType: "Report Downloaded",
            description: `You downloaded a simulation report `,
            timestamp: userData.reportDownloaded.toDate(),
          });
        }

        if (sessionDocs.length > 1) {
          const mostRecentSession = sessionDocs[sessionDocs.length - 1];
          const sessionData = mostRecentSession.data();
          const sessionTime = sessionData.createdAt?.toDate?.() || new Date();
          
          activityLogs.push({
            id: "multiDeviceLogin",
            activityType: "Multi-Device Login",
            description: `Your account was logged in from multiple devices`,
            timestamp: sessionTime,
          });
        }

        // Handle tier changes (this logic might need adjustment based on your app's requirements)
        if (userData.tier) {
          const currentTier = userData.tier;
          const previousTier = localStorage.getItem("lastKnownTier");

          if (previousTier && previousTier !== currentTier) {
            const upgrade = currentTier === "Pro" && previousTier !== "Pro";
            const downgrade = previousTier === "Pro" && currentTier !== "Pro";

            if (upgrade || downgrade) {
              activityLogs.push({
                id: upgrade ? "tierUpgraded" : "tierDowngraded",
                activityType: upgrade ? "Plan Upgraded" : "Plan Downgraded",
                description: upgrade
                  ? `You upgraded your plan to "${currentTier}"`
                  : `You downgraded from Pro to "${currentTier}"`,
                timestamp: new Date(),
              });
            }
          }

          localStorage.setItem("lastKnownTier", currentTier);
        }

        // Sort logs by timestamp (most recent first)
        const sortedLogs = activityLogs.sort((a, b) => b.timestamp - a.timestamp);
        setLogs(sortedLogs);
      }
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse w-10/12 mx-auto space-y-4 flex flex-col items-center justify-center min-h-screen">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen">
      <div className="flex justify-between items-center mt-6 mb-8">
        <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-300">
          Activity Log
        </h1>
        <button
          onClick={() => setShowSessionsModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          Active Sessions
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr className="bg-blue-100 dark:bg-gray-700">
              <th className="py-2 px-4 text-left text-gray-700 dark:text-gray-300 text-sm font-semibold">Activity</th>
              <th className="py-2 px-4 text-left text-gray-700 dark:text-gray-300 text-sm font-semibold">Description</th>
              <th className="py-2 px-4 text-left text-gray-700 dark:text-gray-300 text-sm font-semibold">Time</th>
            </tr>
          </thead>
          <tbody>
            <Suspense fallback={<tr><td colSpan={3} className="text-center py-8">Loading activity...</td></tr>}>
              {logs.length > 0 ? (
                logs.map(log => (
                  <ActivityLogRow key={log.id} log={log} />
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    No activity logs found
                  </td>
                </tr>
              )}
            </Suspense>
          </tbody>
        </table>
      </div>

      {isLoading && (
        <div className="text-center text-blue-500 py-4">Loading activity...</div>
      )}

      <Suspense fallback={null}>
        <ActiveSessionsModal
          isOpen={showSessionsModal}
          onClose={() => setShowSessionsModal(false)}
          sessions={activeSessions}
          currentSessionId={currentSessionId}
          onTerminateSession={() => {}}
          onRefresh={fetchActiveSessions}
        />
      </Suspense>
    </div>
  );
};

export default ActivityLogPage;