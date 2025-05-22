import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LineElement,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ChevronRight, ChevronDown } from 'lucide-react';

ChartJS.register(BarElement, CategoryScale, LineElement, LinearScale, Tooltip, Legend);

const UptimeChart = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [totalNetworkTime, setTotalNetworkTime] = useState({ hours: 0, minutes: 0 });
  const [todayTime, setTodayTime] = useState({ hours: 0, minutes: 0 });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);            // collapsed by default
  const [view, setView] = useState('session');            // 'session' or 'day'
  const [chartType, setChartType] = useState('bar');      // 'bar' or 'line'
  const [loading, setLoading] = useState(false);          // loader for charts & stats

  const db = getFirestore();
  const auth = getAuth();

  // start real-time tracking...
  useEffect(() => {
    let intervalId, sessionId;
    const startRealTimeTracking = async (user) => {
      const sessionRef = await addDoc(collection(db, 'users', user.uid, 'sessions'), {
        start: serverTimestamp(),
        duration: 0,
        active: true,
      });
      sessionId = sessionRef.id;
      const sessionDocRef = doc(db, 'users', user.uid, 'sessions', sessionId);
      intervalId = setInterval(async () => {
        const snap = await getDoc(sessionDocRef);
        if (snap.exists()) {
          const current = snap.data().duration || 0;
          await updateDoc(sessionDocRef, {
            duration: current + 60,
            lastUpdated: serverTimestamp(),
          });
        }
      }, 60000);
    };
    const handleExit = async () => {
      clearInterval(intervalId);
      const user = auth.currentUser;
      if (user && sessionId) {
        const sessionDocRef = doc(db, 'users', user.uid, 'sessions', sessionId);
        await updateDoc(sessionDocRef, { active: false });
      }
    };
    onAuthStateChanged(auth, (user) => { if (user) startRealTimeTracking(user); });
    window.addEventListener('beforeunload', handleExit);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleExit);
    };
  }, []);

  // fetch sessions...
  useEffect(() => {
    const fetchSessions = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      let all = [];
      for (const u of usersSnap.docs) {
        const uid = u.id;
        const sq = query(collection(db, 'users', uid, 'sessions'), orderBy('start','asc'));
        const snaps = await getDocs(sq);
        snaps.forEach(s => all.push({ ...s.data(), userId: uid }));
      }
      setSessions(all);
    };
    fetchSessions();
  }, []);

  // recalc times when data or date filters change
  useEffect(() => {
    const calc = () => {
      let tot=0, today=0;
      const now=new Date(), midnight=new Date(); midnight.setHours(0,0,0,0);
      const sDate = startDate ? new Date(startDate) : null;
      const eDate = endDate   ? new Date(endDate  ) : null;
      const filt = sessions.filter(s => {
        if (!s.start) return false;
        const st = s.start.toDate ? s.start.toDate() : new Date(s.start.seconds*1e3);
        const dur = s.duration||0;
        return dur>0 && (!sDate||st>=sDate) && (!eDate||st<=eDate);
      });
      filt.forEach(s => {
        const st = s.start.toDate ? s.start.toDate() : new Date(s.start.seconds*1e3);
        const dur = s.duration||0;
        tot += dur;
        const endT = new Date(st.getTime()+dur*1e3);
        const os = st<midnight?midnight:st, oe = endT>now?now:endT;
        if (oe>os) today += Math.floor((oe-os)/1e3);
      });
      setFilteredSessions(filt);
      setTotalNetworkTime({ hours: Math.floor(tot/3600), minutes: Math.floor((tot%3600)/60) });
      setTodayTime({ hours: Math.floor(today/3600), minutes: Math.floor((today%3600)/60) });
    };
    calc();
  }, [sessions, startDate, endDate]);

  // whenever panel opens, show loader briefly
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const getData = () => {
    const ds = view==='session'
      ? filteredSessions.map(s=> (s.duration||0)/3600)
      : Object.values(filteredSessions.reduce((acc,s)=>{
          const d=(s.start.toDate? s.start.toDate():new Date(s.start.seconds*1e3)).toDateString();
          acc[d]=(acc[d]||0)+(s.duration||0); return acc;
        },{})).map(sec=>sec/3600);
    const labels = view==='session'
      ? filteredSessions.map((_,i)=>`Session ${i+1}`)
      : Object.keys(filteredSessions.reduce((acc,s)=>{
          const d=(s.start.toDate? s.start.toDate():new Date(s.start.seconds*1e3)).toDateString();
          acc[d]=(acc[d]||0)+(s.duration||0); return acc;
        },{}));
    return {
      labels,
      datasets:[{
        label: view==='session'?'Session Duration (hrs)':'Day Duration (hrs)',
        data: ds,
        backgroundColor: chartType==='bar'? '#FF7F50':'transparent',
        borderColor: chartType==='line'? '#DC2626':'transparent',
        fill: chartType==='line',
        tension: chartType==='line'?0.4:0,
        borderWidth: chartType==='line'?2:0,
        pointBackgroundColor: chartType==='line'? '#DC2626':'transparent'
      }]
    };
  };

  const options = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ position:'top', labels:{color:'#555'} } },
    scales:{ x:{ ticks:{color:'#888'}, grid:{display:false} },
             y:{ ticks:{color:'#888'}, grid:{color:'#e5e7eb'}, beginAtZero:true } }
  };

  return (
    <div className="w-full  hover:shadow-blue-500/50 transition px-6 py-6 border p-6 mt-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg transition-all duration-300 ease-in-out">
      <button
        className="w-full text-left mb-4 text-blue-500 dark:text-blue-300 flex justify-between items-center"
        onClick={()=>setIsOpen(o=>!o)}
      >
        <span className="text-lg font-semibold">Uptime Analytics</span>
        {isOpen? <ChevronDown/> : <ChevronRight/>}
      </button>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen?'max-h-[800px] opacity-100':'max-h-0 opacity-0'}`}>
        {/* controls */}
        <div className="flex flex-wrap gap-4 mb-4">
          {['session','day'].map(v=>(
            <button key={v}
              onClick={()=>setView(v)}
              className={`px-4 py-2 rounded-md ${view===v?'bg-blue-500 text-white':'bg-gray-200'}`}
            >{v==='session'?'Session':'Day'} View</button>
          ))}
          {['bar','line'].map(t=>(
            <button key={t}
              onClick={()=>setChartType(t)}
              className={`px-4 py-2 rounded-md text-sm ${chartType===t?'bg-green-500 text-white':'bg-gray-200'}`}
            >{t==='bar'?'Bar':'Line'} Chart</button>
          ))}
        </div>

        {/* chart or loader */}
        <div className="flex-1 min-h-[300px] mb-6">
          {loading
            ? <div className="w-full h-[260px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            : chartType==='bar'
              ? <Bar data={getData()} options={options}/>
              : <Line data={getData()} options={options}/>
          }
        </div>

        {/* stats or loader */}
        <div className="flex flex-col lg:flex-row gap-6">
          {[{label:'Total Network Time',val:totalNetworkTime},
            {label:'Today’s Time', val:todayTime}].map(({label,val},i)=>(
            <div key={i} className="bg-gray-200 dark:bg-gray-700 p-4 rounded-md shadow flex-1 transition-all duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              {loading
                ? <div className="w-2/3 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mt-2"/>
                : <p className="text-2xl font-mono text-black dark:text-white mt-2">
                    {val.hours}h {val.minutes}m
                  </p>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UptimeChart;
