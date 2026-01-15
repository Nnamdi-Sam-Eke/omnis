import React, { useState } from 'react';
import { getFirestore, doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

const ActiveSessionsModal = ({ 
  isOpen, 
  onClose, 
  sessions, 
  currentSessionId, 
  onTerminateSession, 
  onRefresh 
}) => {
  const [terminatedSessions, setTerminatedSessions] = useState(new Set());
  const [isTerminating, setIsTerminating] = useState(null);
  const [isEndingAll, setIsEndingAll] = useState(false);
  const db = getFirestore();

  if (!isOpen) return null;

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
          </svg>
        );
      case 'tablet':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
    }
  };

  const getBrowserIcon = (browser) => {
    const browserName = browser?.toLowerCase();
    if (browserName?.includes('chrome')) return '🌐';
    if (browserName?.includes('firefox')) return '🦊';
    if (browserName?.includes('safari')) return '🧭';
    if (browserName?.includes('edge')) return '📘';
    if (browserName?.includes('opera')) return '🎭';
    return '🌐';
  };

  const getLocationFromIP = (ipAddress) => {
    return ipAddress && ipAddress !== 'Unknown' ? `IP: ${ipAddress}` : 'Location unavailable';
  };

  const isCurrentSession = (sessionId) => {
    return sessionId === currentSessionId;
  };

  const getActivityStatus = (lastActivity) => {
    if (!lastActivity) return { status: 'Unknown', color: 'gray' };
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastActivity) / (1000 * 60));
    
    if (diffInMinutes < 5) return { status: 'Active now', color: 'green' };
    if (diffInMinutes < 30) return { status: 'Recently active', color: 'yellow' };
    return { status: 'Inactive', color: 'red' };
  };

  const handleTerminateSession = async (sessionId, sessionDocId) => {
    setIsTerminating(sessionDocId);
    
    try {
      // Delete the session document from Firestore
      const sessionRef = doc(db, 'sessions', sessionDocId);
      await deleteDoc(sessionRef);
      
      // Also mark as inactive in user's sessions subcollection
      const session = sessions.find(s => s.id === sessionDocId);
      if (session && session.userId) {
        try {
          const userSessionsRef = collection(db, 'users', session.userId, 'sessions');
          const q = query(userSessionsRef, where('sessionId', '==', sessionId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userSessionDoc = querySnapshot.docs[0];
            await updateDoc(userSessionDoc.ref, {
              active: false,
              terminated: true,
              terminatedAt: new Date(),
            });
          }
        } catch (subError) {
          console.error('Error updating user session:', subError);
        }
      }
      
      // Add to terminated sessions set to hide it from UI
      setTerminatedSessions(prev => new Set([...prev, sessionDocId]));
      
      // Call the callback if provided
      if (onTerminateSession && typeof onTerminateSession === 'function') {
        onTerminateSession(sessionId, sessionDocId);
      }
      
      console.log(`✅ Session ${sessionDocId} terminated successfully`);
    } catch (error) {
      console.error('Error terminating session:', error);
      alert('Failed to terminate session. Please try again.');
    } finally {
      setIsTerminating(null);
    }
  };

  const handleEndAllSessions = async () => {
    const nonCurrentSessions = sessions.filter(session => 
      !isCurrentSession(session.sessionId) && !terminatedSessions.has(session.id)
    );

    if (nonCurrentSessions.length === 0) {
      alert('No other sessions to terminate.');
      return;
    }

    if (!window.confirm(`Are you sure you want to end ${nonCurrentSessions.length} session(s)? This will log you out on all other devices.`)) {
      return;
    }

    setIsEndingAll(true);
    
    try {
      // Terminate all non-current sessions
      const terminatePromises = nonCurrentSessions.map(async (session) => {
        try {
          // Delete from main sessions collection
          const sessionRef = doc(db, 'sessions', session.id);
          await deleteDoc(sessionRef);
          
          // Update user's sessions subcollection
          if (session.userId) {
            const userSessionsRef = collection(db, 'users', session.userId, 'sessions');
            const q = query(userSessionsRef, where('sessionId', '==', session.sessionId));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const userSessionDoc = querySnapshot.docs[0];
              await updateDoc(userSessionDoc.ref, {
                active: false,
                terminated: true,
                terminatedAt: new Date(),
              });
            }
          }
          
          return session.id;
        } catch (error) {
          console.error(`Error terminating session ${session.id}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(terminatePromises);
      const successfulTerminations = results.filter(id => id !== null);
      
      // Add all terminated sessions to the set
      setTerminatedSessions(prev => new Set([...prev, ...successfulTerminations]));
      
      // Call callbacks
      if (onTerminateSession && typeof onTerminateSession === 'function') {
        successfulTerminations.forEach(sessionId => {
          const session = nonCurrentSessions.find(s => s.id === sessionId);
          if (session) {
            onTerminateSession(session.sessionId, sessionId);
          }
        });
      }
      
      console.log(`✅ Successfully terminated ${successfulTerminations.length} session(s)`);
      alert(`Successfully ended ${successfulTerminations.length} session(s).`);
    } catch (error) {
      console.error('Error ending all sessions:', error);
      alert('Some sessions could not be terminated. Please try again.');
    } finally {
      setIsEndingAll(false);
    }
  };

  const handleRefresh = () => {
    // Reset terminated sessions and refresh the list
    setTerminatedSessions(new Set());
    if (onRefresh && typeof onRefresh === 'function') {
      onRefresh();
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Filter out terminated sessions
  const activeSessions = sessions.filter(session => !terminatedSessions.has(session.id));
  
  // Check if there are any non-current sessions that can be terminated
  const hasTerminatableSessions = activeSessions.some(session => 
    !isCurrentSession(session.sessionId)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Active Sessions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your active sessions across all devices
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasTerminatableSessions && (
              <button
                onClick={handleEndAllSessions}
                disabled={isEndingAll || isTerminating}
                className={`px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 ${
                  isEndingAll || isTerminating
                    ? 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-50 dark:bg-gray-700'
                    : 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-300 hover:border-red-400 dark:border-red-600 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
              >
                {isEndingAll ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ending All...
                  </div>
                ) : (
                  'End All'
                )}
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={isEndingAll || isTerminating}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh sessions"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={handleClose}
              disabled={isEndingAll}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeSessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Active Sessions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {terminatedSessions.size > 0 
                  ? "All sessions have been terminated." 
                  : "There are currently no active sessions on your account."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((session) => {
                const activityStatus = getActivityStatus(session.lastActivity);
                const isCurrent = isCurrentSession(session.sessionId);
                const isBeingTerminated = isTerminating === session.id || isEndingAll;
                
                return (
                  <div
                    key={session.id}
                    className={`p-4 rounded-lg border transition-all duration-500 ${
                      isBeingTerminated 
                        ? 'opacity-50 transform scale-95' 
                        : 'opacity-100 transform scale-100'
                    } ${
                      isCurrent 
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {/* Device Icon */}
                        <div className={`p-2 rounded-lg ${
                          isCurrent ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {getDeviceIcon(session.deviceInfo?.deviceType)}
                        </div>
                        
                        {/* Session Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {session.deviceInfo?.deviceType || 'Unknown Device'}
                            </h3>
                            {isCurrent && (
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 rounded-full">
                                Current Session
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <span>{getBrowserIcon(session.deviceInfo?.browser)}</span>
                              <span>{session.deviceInfo?.browser || 'Unknown Browser'}</span>
                              <span>•</span>
                              <span>{session.deviceInfo?.os || 'Unknown OS'}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{getLocationFromIP(session.ipAddress)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Signed in {formatTimeAgo(session.loginTime)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                activityStatus.color === 'green' ? 'bg-green-500' :
                                activityStatus.color === 'yellow' ? 'bg-yellow-500' : 'bg-gray-400'
                              }`} />
                              <span>{activityStatus.status}</span>
                              <span>•</span>
                              <span>Last active {formatTimeAgo(session.lastActivity)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      {!isCurrent && (
                        <button
                          onClick={() => handleTerminateSession(session.sessionId, session.id)}
                          disabled={isBeingTerminated}
                          className={`px-3 py-1 text-sm font-medium border rounded-lg transition-all duration-200 ${
                            isBeingTerminated
                              ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-300 hover:border-red-400 dark:border-red-600 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                        >
                          {isBeingTerminated ? (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Ending...
                            </div>
                          ) : (
                            'End Session'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeSessions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''}
                {terminatedSessions.size > 0 && (
                  <span className="ml-2 text-green-600 dark:text-green-400">
                    ({terminatedSessions.size} terminated)
                  </span>
                )}
              </span>
              <span>
                Sessions automatically expire after 1 hour of inactivity
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveSessionsModal;