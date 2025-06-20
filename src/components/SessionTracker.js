// Multi-tab Aware Session Tracker
import { useEffect, useRef } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const TAB_ID = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const SESSION_LOCK_KEY = 'activeTabSessionLock';

const claimLeadership = () => {
  const now = Date.now();
  const lock = JSON.parse(localStorage.getItem(SESSION_LOCK_KEY));
  if (!lock || now - lock.timestamp > 15000) {
    localStorage.setItem(
      SESSION_LOCK_KEY,
      JSON.stringify({ tabId: TAB_ID, timestamp: now })
    );
    return true;
  }
  return lock.tabId === TAB_ID;
};

const SessionTracker = () => {
  const db = getFirestore();
  const auth = getAuth();

  const intervalRef = useRef(null);
  const sessionIdRef = useRef(null);
  const sessionDocRef = useRef(null);
  const localDurationRef = useRef(0);
  const isLeaderRef = useRef(false);

  const startTracking = async (user) => {
    try {
      const sessionRef = await addDoc(collection(db, 'users', user.uid, 'sessions'), {
        start: serverTimestamp(),
        duration: 0,
        active: true,
        deviceInfo: navigator.userAgent,
        deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      });

      sessionIdRef.current = sessionRef.id;
      sessionDocRef.current = doc(db, 'users', user.uid, 'sessions', sessionRef.id);
      localDurationRef.current = 0;

      console.log(`📡 Session tracking started for user ${user.uid}`);

      intervalRef.current = setInterval(async () => {
        localDurationRef.current += 60;

        if (localDurationRef.current >= 180) {
          const snap = await getDoc(sessionDocRef.current);
          if (snap.exists()) {
            const currentDuration = snap.data().duration || 0;
            await updateDoc(sessionDocRef.current, {
              duration: currentDuration + localDurationRef.current,
              lastUpdated: serverTimestamp(),
            });
            localDurationRef.current = 0;
          }
        }
      }, 60000);
    } catch (err) {
      console.error('❌ Failed to start session tracking:', err);
    }
  };

  const stopTracking = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const user = auth.currentUser;
    if (user && sessionIdRef.current) {
      try {
        const snap = await getDoc(sessionDocRef.current);
        if (snap.exists()) {
          const currentDuration = snap.data().duration || 0;
          await updateDoc(sessionDocRef.current, {
            duration: currentDuration + localDurationRef.current,
            active: false,
            lastUpdated: serverTimestamp(),
          });
          console.log(`🛑 Session tracking stopped for user ${user.uid}`);
        }
      } catch (err) {
        console.error('❌ Failed to stop session tracking:', err);
      } finally {
        sessionIdRef.current = null;
      }
    }
  };

  useEffect(() => {
    let user;

    const handleStorageChange = () => {
      const nowLeader = claimLeadership();
      if (!isLeaderRef.current && nowLeader) {
        isLeaderRef.current = true;
        startTracking(user);
      } else if (isLeaderRef.current && !nowLeader) {
        isLeaderRef.current = false;
        stopTracking();
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      user = u;
      if (!user) return stopTracking();

      isLeaderRef.current = claimLeadership();
      if (isLeaderRef.current) startTracking(user);

      window.addEventListener('storage', handleStorageChange);
    });

    window.addEventListener('beforeunload', stopTracking);

    return () => {
      stopTracking();
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', stopTracking);
    };
  }, [auth, db]);

  return null;
};

export default SessionTracker;