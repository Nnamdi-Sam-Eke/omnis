import { useEffect, useRef } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const TAB_ID = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const SESSION_LOCK_KEY = 'activeTabSessionLock';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes
const LEADERSHIP_TIMEOUT = 45000; // 45 seconds

console.log(`🆔 Tab ID created: ${TAB_ID}`);

const claimLeadership = () => {
  const now = Date.now();
  const lockStr = localStorage.getItem(SESSION_LOCK_KEY);
  
  try {
    const lock = lockStr ? JSON.parse(lockStr) : null;
    
    if (!lock || now - lock.timestamp > LEADERSHIP_TIMEOUT) {
      const newLock = { tabId: TAB_ID, timestamp: now };
      localStorage.setItem(SESSION_LOCK_KEY, JSON.stringify(newLock));
      console.log(`👑 Leadership claimed by tab: ${TAB_ID}`);
      return true;
    }
    
    if (lock.tabId === TAB_ID) {
      localStorage.setItem(
        SESSION_LOCK_KEY,
        JSON.stringify({ tabId: TAB_ID, timestamp: now })
      );
      console.log(`🔄 Leadership refreshed for tab: ${TAB_ID}`);
      return true;
    }
    
    console.log(`⏸️ Another tab owns leadership: ${lock.tabId}`);
    return false;
  } catch (error) {
    console.error('❌ Error claiming leadership:', error);
    return false;
  }
};

const cleanupExpiredSessions = async (db, userId) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const q = query(
      sessionsRef,
      where('start', '<', Timestamp.fromDate(oneDayAgo)),
      where('active', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { active: false })
    );
    
    await Promise.all(updatePromises);
    
    if (updatePromises.length > 0) {
      console.log(`🧹 Cleaned up ${updatePromises.length} expired session(s)`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up expired sessions:', error);
  }
};

const cleanupOldUserSessions = async (db, userId) => {
  try {
    const userSessionsRef = collection(db, 'users', userId, 'sessions');
    const querySnapshot = await getDocs(userSessionsRef);
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const deletePromises = querySnapshot.docs
      .filter(doc => {
        const data = doc.data();
        const startTime = data.start?.toDate?.() || new Date(0);
        const isOld = startTime < thirtyDaysAgo;
        const isInactive = data.active === false;
        return isOld && isInactive;
      })
      .map(doc => deleteDoc(doc.ref));
    
    await Promise.all(deletePromises);
    
    if (deletePromises.length > 0) {
      console.log(`🗑️ Deleted ${deletePromises.length} old session(s) (>30 days)`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up old user sessions:', error);
  }
};

const getDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase();
  
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    if (/ipad|android(?!.*mobile)|tablet/i.test(ua)) {
      return 'Tablet';
    }
    return 'Mobile';
  }
  
  if (/windows|macintosh|linux/i.test(ua)) {
    return 'Desktop';
  }
  
  if (typeof window !== 'undefined') {
    const screenWidth = window.screen.width;
    if (screenWidth < 768) return 'Mobile';
    if (screenWidth < 1024) return 'Tablet';
    return 'Desktop';
  }
  
  return 'Desktop';
};

const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    const deviceType = getDeviceType();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    deviceId = `${deviceType}_${timestamp}_${randomString}`;
    localStorage.setItem('deviceId', deviceId);
    console.log(`🔑 New device ID created: ${deviceId}`);
  } else {
    console.log(`🔑 Existing device ID: ${deviceId}`);
  }
  return deviceId;
};

const SessionTracker = () => {
  const db = getFirestore();
  const auth = getAuth();

  const heartbeatIntervalRef = useRef(null);
  const sessionIdRef = useRef(null);
  const sessionDocRef = useRef(null);
  const isLeaderRef = useRef(false);
  const sessionStartTimeRef = useRef(null);
  const isMountedRef = useRef(true);
  const isTrackingRef = useRef(false);

  const startTracking = async (user) => {
    if (!isMountedRef.current) {
      console.log('⚠️ Component unmounted, skipping tracking start');
      return;
    }
    
    if (isTrackingRef.current) {
      console.log('⚠️ Already tracking, skipping duplicate start');
      return;
    }
    
    console.log(`🚀 Starting session tracking for user: ${user.uid}`);
    isTrackingRef.current = true;
    
    try {
      sessionStartTimeRef.current = Date.now();
      
      const sessionData = {
        sessionId: TAB_ID,
        start: serverTimestamp(),
        duration: 0,
        active: true,
        deviceType: getDeviceType(),
        deviceId: getDeviceId(),
        lastUpdated: serverTimestamp(),
      };

      const sessionRef = await addDoc(
        collection(db, 'users', user.uid, 'sessions'),
        sessionData
      );
      
      sessionIdRef.current = sessionRef.id;
      sessionDocRef.current = sessionRef;

      console.log(`✅ Session created: ${sessionRef.id}`);
      console.log(`📍 Path: users/${user.uid}/sessions/${sessionRef.id}`);

      await cleanupExpiredSessions(db, user.uid);
      await cleanupOldUserSessions(db, user.uid);

      startHeartbeat(user);
    } catch (err) {
      console.error('❌ Failed to start session tracking:', err);
      isTrackingRef.current = false;
    }
  };

  const startHeartbeat = (user) => {
    if (heartbeatIntervalRef.current) {
      console.log('🔄 Clearing existing heartbeat');
      clearInterval(heartbeatIntervalRef.current);
    }

    console.log('💓 Starting heartbeat (30s interval)');

    heartbeatIntervalRef.current = setInterval(async () => {
      if (!isMountedRef.current || !sessionDocRef.current || !sessionStartTimeRef.current) {
        console.log('⚠️ Heartbeat skipped: component unmounted or no session');
        return;
      }

      try {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - sessionStartTimeRef.current) / 1000);

        await safeUpdateDoc(sessionDocRef.current, {
          duration: elapsedSeconds,
          lastUpdated: serverTimestamp(),
          active: true,
        });

        console.log(`💓 Heartbeat: ${elapsedSeconds}s (${Math.floor(elapsedSeconds/60)}m ${elapsedSeconds%60}s)`);

        if (isLeaderRef.current) {
          claimLeadership();
        }
      } catch (error) {
        console.error('❌ Heartbeat error:', error);
      }
    }, HEARTBEAT_INTERVAL);
  };

  const safeUpdateDoc = async (docRef, data) => {
    try {
      await updateDoc(docRef, data);
    } catch (err) {
      try {
        await setDoc(docRef, data, { merge: true });
        console.warn('⚠️ Used setDoc fallback');
      } catch (e) {
        console.error('❌ safeUpdateDoc failed:', e);
        throw e;
      }
    }
  };

  const stopTracking = async () => {
    if (!isTrackingRef.current) {
      console.log('⏸️ Not tracking, skipping stop');
      return;
    }

    console.log('🛑 Stopping session tracking');

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
      console.log('💓 Heartbeat stopped');
    }

    const user = auth.currentUser;
    if (user && sessionIdRef.current && sessionDocRef.current && sessionStartTimeRef.current) {
      try {
        const now = Date.now();
        const finalDuration = Math.floor((now - sessionStartTimeRef.current) / 1000);

        await safeUpdateDoc(sessionDocRef.current, {
          duration: finalDuration,
          active: false,
          lastUpdated: serverTimestamp(),
        });

        console.log(`✅ Session stopped: ${sessionIdRef.current}`);
        console.log(`⏱️ Final duration: ${finalDuration}s (${Math.floor(finalDuration/60)}m ${finalDuration%60}s)`);
      } catch (err) {
        console.error('❌ Failed to stop session:', err);
      } finally {
        sessionIdRef.current = null;
        sessionDocRef.current = null;
        sessionStartTimeRef.current = null;
        isTrackingRef.current = false;
      }
    }

    const lockStr = localStorage.getItem(SESSION_LOCK_KEY);
    try {
      const lock = lockStr ? JSON.parse(lockStr) : null;
      if (lock && lock.tabId === TAB_ID) {
        localStorage.removeItem(SESSION_LOCK_KEY);
        console.log('👑 Leadership released');
      }
    } catch (error) {
      console.error('❌ Error clearing leadership:', error);
    }
  };

  useEffect(() => {
    console.log('🔧 SessionTracker mounted');
    isMountedRef.current = true;
    let user;

    const handleStorageChange = (e) => {
      if (e.key === SESSION_LOCK_KEY) {
        console.log('🔔 Leadership change detected');
        const nowLeader = claimLeadership();
        if (!isLeaderRef.current && nowLeader && user && !isTrackingRef.current) {
          console.log('🎖️ Became leader, starting tracking');
          isLeaderRef.current = true;
          startTracking(user);
        } else if (isLeaderRef.current && !nowLeader) {
          console.log('👋 Lost leadership, stopping tracking');
          isLeaderRef.current = false;
          stopTracking();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ Tab hidden');
        if (isLeaderRef.current && user) {
          stopTracking();
        }
      } else {
        console.log('👁️ Tab visible');
        if (user && !isTrackingRef.current) {
          const nowLeader = claimLeadership();
          if (nowLeader) {
            isLeaderRef.current = true;
            startTracking(user);
          }
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        console.log(`👤 User authenticated: ${u.uid}`);
        user = u;
        
        if (!isTrackingRef.current) {
          isLeaderRef.current = claimLeadership();
          if (isLeaderRef.current) {
            console.log('✅ Initial leadership claimed');
            startTracking(user);
          } else {
            console.log('⏸️ Another tab is leader');
          }
        } else {
          console.log('⚠️ Already tracking, skipping auth state start');
        }
      } else {
        console.log('👤 User signed out');
        user = null;
        stopTracking();
      }
    });

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeunload', stopTracking);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('🔧 SessionTracker unmounting');
      isMountedRef.current = false;
      stopTracking();
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', stopTracking);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // ✅ Empty dependency array - run once

  return null;
};

export default SessionTracker;