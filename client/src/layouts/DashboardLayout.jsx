import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Search,
  PlusCircle,
  Stethoscope,
  Pill,
  FlaskConical,
  PhoneCall,
  Video
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { logout } from '../store/slices/authSlice';
import { setSearchTerm } from '../store/slices/productSlice';

const SidebarItem = ({ icon, label, path, active }) => (
  <Link to={path}>
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={`p-4 rounded-2xl flex items-center justify-center cursor-pointer transition-all relative group ${active ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary hover:bg-secondary'}`}
    >
      {icon}
      <div className="absolute left-20 bg-text text-white px-3 py-1 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {label}
      </div>
    </motion.div>
  </Link>
);

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { searchTerm } = useSelector((state) => state.products);
  const [incomingCall, setIncomingCall] = React.useState(null);
  const [callTimer, setCallTimer] = React.useState(600); // 10 minutes

  // Web Audio API Ringtone
  const audioCtxRef = React.useRef(null);
  const ringIntervalRef = React.useRef(null);

  const startRinging = React.useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);

    const playRing = () => {
      const playTone = (freq, startOffset, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq; 

        gain.gain.setValueAtTime(0, ctx.currentTime + startOffset);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startOffset + 0.05);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + startOffset + duration - 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + startOffset + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startOffset);
        osc.stop(ctx.currentTime + startOffset + duration);
      };

      // Play a quick digital melody (e.g. 800Hz, 1000Hz, 1200Hz)
      playTone(800, 0, 0.15);
      playTone(1000, 0.2, 0.15);
      playTone(1200, 0.4, 0.4);
      
      playTone(800, 1.0, 0.15);
      playTone(1000, 1.2, 0.15);
      playTone(1200, 1.4, 0.4);
    };

    playRing();
    ringIntervalRef.current = setInterval(playRing, 3500);
  }, []);

  const stopRinging = React.useCallback(() => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'Patient') {
      const socket = io('http://localhost:5000');
      socket.emit('join-user-room', user.id || user._id);
      
      socket.on('incoming-call', (data) => {
        setIncomingCall(data);
        setCallTimer(600);
      });

      return () => socket.disconnect();
    }
  }, [user]);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (incomingCall && callTimer > 0) {
      interval = setInterval(() => setCallTimer(prev => prev - 1), 1000);
    } else if (callTimer === 0 && incomingCall) {
      setIncomingCall(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [incomingCall, callTimer]);

  // Ringing Effect
  useEffect(() => {
    if (incomingCall) {
      startRinging();
    } else {
      stopRinging();
    }
    return () => stopRinging();
  }, [incomingCall, startRinging, stopRinging]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const getDashboardPath = () => {
    if (user?.role === 'Admin') return '/admin-dashboard';
    return user?.role === 'Doctor' ? '/doctor-dashboard' : '/patient-dashboard';
  };

  const getSearchPlaceholder = () => {
    if (location.pathname === '/medicines') return 'Search medicines, brands, or categories...';
    if (location.pathname === '/labs') return 'Search blood tests, checkups, or scans...';
    if (location.pathname === '/find-doctors') return 'Search Doctors, Specialists, etc...';
    if (location.pathname === '/appointments') return 'Search Appointments, Doctors, etc...';
    if (location.pathname === '/chat') return 'Search Chat, Messages, etc...';
    if (location.pathname === '/ai-symptom-checker') return 'Search AI Symptom Checker, etc...';
    return 'Search appointments, doctors, reports...';
  };

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const sidebarItems = [
    { icon: <LayoutDashboard size={24} />, label: 'Dashboard', path: getDashboardPath() },
    ...(user?.role !== 'Admin' ? [
      { icon: <Stethoscope size={24} />, label: 'Doctors', path: '/find-doctors' },
      { icon: <Pill size={24} />, label: 'Pharmacy', path: '/pharmacy' },
      { icon: <FlaskConical size={24} />, label: 'Lab Tests', path: '/labs' },
      { icon: <Calendar size={24} />, label: 'Appointments', path: '/appointments' },
      { icon: <MessageSquare size={24} />, label: 'Chat', path: '/chat' },
      { icon: <PlusCircle size={24} />, label: 'AI Checker', path: '/ai-symptom-checker' },
    ] : [])
  ];


  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="absolute inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center border-4 border-primary">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6 animate-pulse">
              <PhoneCall size={40} />
            </div>
            <h2 className="text-2xl font-black text-text mb-2">Doctor is Calling!</h2>
            <p className="text-slate-500 font-bold mb-6">Join the consultation room now.</p>
            <div className="text-4xl font-black text-rose-500 mb-8 font-mono">
              {Math.floor(callTimer / 60)}:{(callTimer % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex gap-4">
              <button onClick={() => {
                const socket = io('http://localhost:5000');
                socket.emit('call-declined', { roomId: incomingCall.roomId });
                setIncomingCall(null);
                setTimeout(() => socket.disconnect(), 500);
              }} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-200 transition">Decline</button>
              <button onClick={() => {
                navigate(`/consultation/${incomingCall.roomId}?patientId=${user.id || user._id}&apptId=${incomingCall.apptId}`);
                setIncomingCall(null);
              }} className="flex-1 bg-primary text-white font-bold py-3 rounded-2xl hover:bg-primary-dark transition shadow-lg shadow-primary/30 flex justify-center items-center gap-2">
                <Video size={20} /> Join Call
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-24 bg-white border-r border-secondary flex flex-col items-center py-8 gap-8">
        <button
          onClick={() => navigate('/')}
          className="w-12 h-12 bg-primary rounded-2xl flex-shrink-0 flex items-center justify-center medical-gradient"
        >
          <span className="text-white font-black text-xl">H</span>
        </button>

        <div className="flex-1 w-full relative flex flex-col items-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />

          <nav className="flex-1 w-full flex flex-col gap-4 overflow-y-auto no-scrollbar py-4 items-center">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.label}
                {...item}
                active={location.pathname === item.path}
              />
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
        </div>

        <div className="flex flex-col gap-4 flex-shrink-0">
          <SidebarItem icon={<Settings size={24} />} label="Settings" path="/settings" />
          <button
            onClick={handleLogout}
            className="p-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={24} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-secondary flex items-center justify-between px-10">
          {!['/patient-dashboard', '/doctor-dashboard', '/admin-dashboard'].includes(location.pathname) && (
            <div className="flex items-center gap-4 bg-secondary/50 px-6 py-2.5 rounded-2xl w-96 border border-transparent focus-within:border-primary focus-within:bg-white transition-all">
              <Search size={20} className="text-slate-400" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={handleSearch}
                className="bg-transparent outline-none w-full font-medium text-slate-600"
              />
            </div>
          )}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block font-bold text-text">{user?.name || 'User'}</span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{user?.role || 'Patient'}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary flex items-center justify-center bg-secondary">
              <span className="text-primary font-bold">{user?.name?.charAt(0) || 'U'}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
