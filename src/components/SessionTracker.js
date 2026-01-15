// Enhanced Multi-tab Aware Session Tracker with Proper Cleanup
import { useEffect, useRef } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const TAB_ID = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const SESSION_LOCK_KEY = 'activeTabSessionLock';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const LEADERSHIP_TIMEOUT = 45000; // 45 seconds

// Enhanced leadership claiming with atomic-like behavior
const claimLeadership = () => {
  const now = Date.now();
  const lockStr = localStorage.getItem(SESSION_LOCK_KEY);
  
  try {
    const lock = lockStr ? JSON.parse(lockStr) : null;
    
    // No lock exists or lock is expired
    if (!lock || now - lock.timestamp > LEADERSHIP_TIMEOUT) {
      const newLock = { tabId: TAB_ID, timestamp: now };
      localStorage.setItem(SESSION_LOCK_KEY, JSON.stringify(newLock));
      return true;
    }
    
    // This tab already owns the lock
    if (lock.tabId === TAB_ID) {
      // Refresh the timestamp
      localStorage.setItem(
        SESSION_LOCK_KEY,
        JSON.stringify({ tabId: TAB_ID, timestamp: now })
      );
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error claiming leadership:', error);
    return false;
  }
};

// Clean up expired sessions from Firestore
const cleanupExpiredSessions = async (db, userId) => {
  try {
    const sessionsRef = collection(db, 'sessions');
    const now = Date.now();
    const expiryThreshold = new Date(now - SESSION_TIMEOUT);
    
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      where('lastActivity', '<', expiryThreshold)
    );
    
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    
    if (deletePromises.length > 0) {
      console.log(`🧹 Cleaned up ${deletePromises.length} expired session(s)`);
    }
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
};

// Clean up old user sessions (from subcollection)
const cleanupOldUserSessions = async (db, userId) => {
  try {
    const userSessionsRef = collection(db, 'users', userId, 'sessions');
    const querySnapshot = await getDocs(userSessionsRef);
    
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 *60 * 1000);
    
    const deletePromises = querySnapshot.docs
      .filter(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(0);
        return createdAt.getTime() < sevenDaysAgo;
      })
      .map(doc => deleteDoc(doc.ref));
    
    await Promise.all(deletePromises);
    
    if (deletePromises.length > 0) {
      console.log(`🧹 Cleaned up ${deletePromises.length} old user session(s)`);
    }
  } catch (error) {
    console.error('Error cleaning up old user sessions:', error);
  }
};

const SessionTracker = () => {
  const db = getFirestore();
  const auth = getAuth();

  const heartbeatIntervalRef = useRef(null);
  const sessionIdRef = useRef(null);
  const sessionDocRef = useRef(null);
  const isLeaderRef = useRef(false);
  const lastSaveTimeRef = useRef(Date.now());
  const isMountedRef = useRef(true);

  const startTracking = async (user) => {
    if (!isMountedRef.current) return;
    
    try {
      // Create session in main sessions collection for cross-tab visibility
      const sessionData = {
        userId: user.uid,
        sessionId: TAB_ID,
        loginTime: serverTimestamp(),
        lastActivity: serverTimestamp(),
        active: true,
        deviceInfo: {
          userAgent: navigator.userAgent,
          deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
          browser: getBrowserInfo(),
          os: getOSInfo(),
        },
        ipAddress: await getIPAddress(),
      };

      const sessionRef = await addDoc(collection(db, 'sessions', user.uid, 'sessionData'), sessionData);
      sessionIdRef.current = sessionRef.id;
      sessionDocRef.current = sessionRef;

      // Also create in user's subcollection for historical tracking
      await addDoc(collection(db, 'users', user.uid, 'sessions'), {
        sessionId: TAB_ID,
        createdAt: serverTimestamp(),
        deviceInfo: sessionData.deviceInfo,
        duration: 0,
        active: true,
      });

      console.log(`📡 Session tracking started for user ${user.uid}, tab ${TAB_ID}`);

      // Run cleanup of expired sessions
      await cleanupExpiredSessions(db, user.uid);
      await cleanupOldUserSessions(db, user.uid);

      // Start heartbeat to keep session alive
      startHeartbeat(user);
    } catch (err) {
      console.error('❌ Failed to start session tracking:', err);
    }
  };

  const startHeartbeat = (user) => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(async () => {
      if (!isMountedRef.current || !sessionDocRef.current) return;

      try {
        // Update last activity timestamp (safe: fallback to setDoc if the doc was deleted)
        await safeUpdateDoc(sessionDocRef.current, {
          lastActivity: serverTimestamp(),
          active: true,
        });

        // Calculate duration and update user session if enough time has passed
        const now = Date.now();
        const timeSinceLastSave = now - lastSaveTimeRef.current;
        
        if (timeSinceLastSave >= 60000) { // Save every minute
          const userSessionsRef = collection(db, 'users', user.uid, 'sessions');
          const q = query(userSessionsRef, where('sessionId', '==', TAB_ID));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userSessionDoc = querySnapshot.docs[0];
            const currentData = userSessionDoc.data();
            const currentDuration = currentData.duration || 0;
            const additionalDuration = Math.floor(timeSinceLastSave / 1000);
            
            await updateDoc(userSessionDoc.ref, {
              duration: currentDuration + additionalDuration,
              lastUpdated: serverTimestamp(),
            });
            
            lastSaveTimeRef.current = now;
          }
        }

        // Refresh leadership claim
        if (isLeaderRef.current) {
          claimLeadership();
        }
      } catch (error) {
        console.error('Error updating session heartbeat:', error);
      }
    }, HEARTBEAT_INTERVAL);
  };

  // Safe update helper: try updateDoc, if doc missing then setDoc with merge
  const safeUpdateDoc = async (docRef, data) => {
    try {
      await updateDoc(docRef, data);
    } catch (err) {
      try {
        // fallback: recreate doc with merge to avoid overwriting other fields
        await setDoc(docRef, data, { merge: true });
        console.warn('safeUpdateDoc: update failed, used setDoc with merge as fallback');
      } catch (e) {
        console.error('safeUpdateDoc failed:', e);
        throw e;
      }
    }
  };

  const stopTracking = async () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    const user = auth.currentUser;
    if (user && sessionIdRef.current && sessionDocRef.current) {
      try {
        // Calculate final duration
        const now = Date.now();
        const finalDuration = Math.floor((now - lastSaveTimeRef.current) / 1000);

        // Mark main session as inactive (use safe update)
        await safeUpdateDoc(sessionDocRef.current, {
          active: false,
          lastActivity: serverTimestamp(),
        });

        // Update user session with final duration
        const userSessionsRef = collection(db, 'users', user.uid, 'sessions');
        const q = query(userSessionsRef, where('sessionId', '==', TAB_ID));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userSessionDoc = querySnapshot.docs[0];
          const currentData = userSessionDoc.data();
          const currentDuration = currentData.duration || 0;
          
          await updateDoc(userSessionDoc.ref, {
            duration: currentDuration + finalDuration,
            active: false,
            lastUpdated: serverTimestamp(),
          });
        }

        console.log(`🛑 Session tracking stopped for user ${user.uid}`);
      } catch (err) {
        console.error('❌ Failed to stop session tracking:', err);
      } finally {
        sessionIdRef.current = null;
        sessionDocRef.current = null;
      }
    }

    // Clear leadership if this tab owns it
    const lockStr = localStorage.getItem(SESSION_LOCK_KEY);
    try {
      const lock = lockStr ? JSON.parse(lockStr) : null;
      if (lock && lock.tabId === TAB_ID) {
        localStorage.removeItem(SESSION_LOCK_KEY);
      }
    } catch (error) {
      console.error('Error clearing leadership:', error);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    let user;

    const handleStorageChange = (e) => {
      if (e.key === SESSION_LOCK_KEY) {
        const nowLeader = claimLeadership();
        if (!isLeaderRef.current && nowLeader && user) {
          isLeaderRef.current = true;
          startTracking(user);
        } else if (isLeaderRef.current && !nowLeader) {
          isLeaderRef.current = false;
          stopTracking();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isLeaderRef.current && user) {
        // Tab going to background - save current state
        stopTracking();
      } else if (!document.hidden && user) {
        // Tab coming back to foreground - try to reclaim leadership
        const nowLeader = claimLeadership();
        if (nowLeader) {
          isLeaderRef.current = true;
          startTracking(user);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      user = u;
      if (!user) {
        stopTracking();
        return;
      }

      isLeaderRef.current = claimLeadership();
      if (isLeaderRef.current) {
        startTracking(user);
      }
    });

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeunload', stopTracking);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      stopTracking();
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', stopTracking);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auth, db]);

  return null;
};

// Helper function to get browser info
function getBrowserInfo() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Unknown Browser';
}

// Helper function to get OS info
function getOSInfo() {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown OS';
}

// Helper function to get IP address (using a public API)
async function getIPAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'Unknown';
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return 'Unknown';
  }
}

export default SessionTracker;