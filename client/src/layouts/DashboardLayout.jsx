import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  LogOut,
  Search,
  PlusCircle,
  Stethoscope,
  Pill,
  FlaskConical,
  PhoneCall,
  Video,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { logout, updateUserSuccess } from '../store/slices/authSlice';
import { setSearchTerm } from '../store/slices/productSlice';
import { useTheme } from '../contexts/ThemeContext';

const SidebarItem = ({ icon, label, path, active, highlight }) => (
  <Link to={path}>
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={`p-4 rounded-2xl flex items-center justify-center cursor-pointer transition-all relative group ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : highlight ? 'bg-amber-50 text-amber-500 hover:bg-amber-100 border border-amber-200/50' : 'text-slate-400 hover:text-primary hover:bg-secondary'}`}
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
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const { searchTerm } = useSelector((state) => state.products);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [incomingCall, setIncomingCall] = React.useState(null);
  const [callTimer, setCallTimer] = React.useState(600); // 10 minutes
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [showIntakeForm, setShowIntakeForm] = React.useState(false);
  const [intakeData, setIntakeData] = React.useState({
    age: '',
    height: '',
    weight: '',
    disease: '',
    allergy: '',
    medicalHistory: ''
  });
  const [savingIntake, setSavingIntake] = React.useState(false);
  const [showDoctorIntake, setShowDoctorIntake] = React.useState(false);
  const [doctorIntakeData, setDoctorIntakeData] = React.useState({
    experience: '',
    specialization: '',
    consultationFee: ''
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const resData = await response.json();
        if (resData.success) {
          const profile = resData.data.profile;
          if (user?.role === 'Patient') {
            if (profile) {
              setIntakeData({
                age: profile.age !== 'NA' ? profile.age : '',
                height: profile.height !== 'NA' ? profile.height : '',
                weight: profile.weight !== 'NA' ? profile.weight : '',
                disease: profile.disease !== 'NA' ? profile.disease : '',
                allergy: profile.allergy !== 'NA' ? profile.allergy : '',
                medicalHistory: profile.medicalHistory !== 'NA' ? profile.medicalHistory : ''
              });
            }
            if (!profile?.hasFilledProfile) {
              setShowIntakeForm(true);
            }
          } else if (user?.role === 'Doctor') {
            if (profile) {
              setDoctorIntakeData({
                experience: profile.experience || '',
                specialization: profile.specialization || '',
                consultationFee: profile.consultationFee || ''
              });
            }
            if (!profile?.hasFilledProfile) {
              setShowDoctorIntake(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile for intake form:', error);
      }
    };

    if (isAuthenticated && token && (user?.role === 'Patient' || user?.role === 'Doctor')) {
      fetchProfile();
    }
  }, [isAuthenticated, token, user]);

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

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const getDashboardPath = () => {
    if (!isAuthenticated || !user) return '/';
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

  const sidebarItems = isAuthenticated && user ? [
    { icon: <LayoutDashboard size={24} />, label: 'Dashboard', path: getDashboardPath() },
    ...(user?.role !== 'Admin' ? [
      { icon: <Stethoscope size={24} />, label: 'Doctors', path: '/find-doctors' },
      { icon: <Pill size={24} />, label: 'Pharmacy', path: '/pharmacy' },
      { icon: <FlaskConical size={24} />, label: 'Lab Tests', path: '/labs' },
      { icon: <Calendar size={24} />, label: 'Appointments', path: '/appointments' },
      { icon: <MessageSquare size={24} />, label: 'Consultations', path: '/chat?filter=appointment' },
      { icon: <Sparkles size={24} />, label: 'Subscribed Chat', path: '/chat?filter=subscription', highlight: true },
      { icon: <PlusCircle size={24} />, label: 'AI Checker', path: '/ai-symptom-checker' },
    ] : [])
  ] : [
    { icon: <Stethoscope size={24} />, label: 'Doctors', path: '/find-doctors' },
    { icon: <Pill size={24} />, label: 'Pharmacy', path: '/pharmacy' },
    { icon: <FlaskConical size={24} />, label: 'Lab Tests', path: '/labs' },
  ];


  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm px-4">
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm px-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center relative border border-secondary">
            <button 
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-text transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
              <LogOut size={40} />
            </div>
            <h2 className="text-2xl font-black text-text mb-2">Confirm Logout</h2>
            <p className="text-slate-500 font-medium mb-8">Are you sure you want to log out of your account?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout} 
                className="flex-1 bg-rose-500 text-white font-bold py-3 rounded-2xl hover:bg-rose-600 transition shadow-lg shadow-rose-500/30"
              >
                Log Out
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Medical Intake Modal */}
      {showIntakeForm && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center backdrop-blur-sm px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-[40px] shadow-2xl max-w-lg w-full relative border border-secondary"
          >
            <button 
              onClick={() => setShowIntakeForm(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-text transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <PlusCircle size={32} />
              </div>
              <h2 className="text-2xl font-black text-text mb-2">Complete Your Medical Profile</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                Provide your basic health details so our specialists can evaluate and guide you accurately. Omitted fields will automatically save as "NA".
              </p>

              {/* Profile Picture Uploader */}
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all cursor-pointer bg-slate-50 flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-primary">{user?.name?.charAt(0) || 'U'}</span>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onloadend = async () => {
                          try {
                            const res = await fetch('http://localhost:5000/api/profile/picture', {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                              },
                              body: JSON.stringify({ image: reader.result })
                            });
                            const data = await res.json();
                            if (data.success) {
                              dispatch(updateUserSuccess({ profilePicture: data.data.profilePicture }));
                            } else {
                              alert(data.message || 'Failed to upload profile picture');
                            }
                          } catch (err) {
                            console.error(err);
                            alert(`Error uploading picture: ${err.message || 'Network error'}`);
                          }
                        };
                      }}
                    />
                  </label>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Upload profile picture</span>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSavingIntake(true);
              try {
                const response = await fetch('http://localhost:5000/api/profile/me', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    age: intakeData.age || 'NA',
                    height: intakeData.height || 'NA',
                    weight: intakeData.weight || 'NA',
                    disease: intakeData.disease || 'NA',
                    allergy: intakeData.allergy || 'NA',
                    medicalHistory: intakeData.medicalHistory || 'NA'
                  })
                });
                const resData = await response.json();
                if (resData.success) {
                  setShowIntakeForm(false);
                }
              } catch (err) {
                console.error('Error saving medical intake form:', err);
              } finally {
                setSavingIntake(false);
              }
            }} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    value={intakeData.age}
                    onChange={(e) => setIntakeData({ ...intakeData, age: e.target.value })}
                    className="w-full bg-secondary/50 border border-secondary focus:border-primary outline-none px-4 py-2.5 rounded-2xl font-bold text-xs text-text transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Height (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 175"
                    value={intakeData.height}
                    onChange={(e) => setIntakeData({ ...intakeData, height: e.target.value })}
                    className="w-full bg-secondary/50 border border-secondary focus:border-primary outline-none px-4 py-2.5 rounded-2xl font-bold text-xs text-text transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={intakeData.weight}
                    onChange={(e) => setIntakeData({ ...intakeData, weight: e.target.value })}
                    className="w-full bg-secondary/50 border border-secondary focus:border-primary outline-none px-4 py-2.5 rounded-2xl font-bold text-xs text-text transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Diseases / Illnesses</label>
                <input
                  type="text"
                  placeholder="e.g. Diabetes, Hypertension, None"
                  value={intakeData.disease}
                  onChange={(e) => setIntakeData({ ...intakeData, disease: e.target.value })}
                  className="w-full bg-secondary/50 border border-secondary focus:border-primary outline-none px-4 py-2.5 rounded-2xl font-bold text-xs text-text transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts, None"
                  value={intakeData.allergy}
                  onChange={(e) => setIntakeData({ ...intakeData, allergy: e.target.value })}
                  className="w-full bg-secondary/50 border border-secondary focus:border-primary outline-none px-4 py-2.5 rounded-2xl font-bold text-xs text-text transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Other Medical History</label>
                <textarea
                  placeholder="Describe past surgeries, conditions, or general health notes..."
                  value={intakeData.medicalHistory}
                  onChange={(e) => setIntakeData({ ...intakeData, medicalHistory: e.target.value })}
                  rows={2}
                  className="w-full bg-secondary/50 border border-secondary focus:border-primary outline-none px-4 py-2.5 rounded-2xl font-medium text-xs text-text transition-all resize-none"
                />
              </div>

              <div className="flex pt-4">
                <button
                  type="submit"
                  disabled={savingIntake}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl hover:bg-primary-dark text-xs transition shadow-lg shadow-primary/20 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {savingIntake ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Doctor Intake Form */}
      {showDoctorIntake && (
        <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto border border-secondary">
            <button 
              onClick={() => setShowDoctorIntake(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-text transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 mx-auto">
              <Stethoscope size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Complete Your Profile</h2>
            <p className="text-center text-slate-500 text-sm mb-6">Please fill in these mandatory details to start accepting appointments.</p>

            {/* Profile Picture Uploader */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all cursor-pointer bg-slate-50 flex items-center justify-center">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-primary">{user?.name?.charAt(0) || 'U'}</span>
                )}
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onloadend = async () => {
                        try {
                          const res = await fetch('http://localhost:5000/api/profile/picture', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({ image: reader.result })
                          });
                          const data = await res.json();
                          if (data.success) {
                            dispatch(updateUserSuccess({ profilePicture: data.data.profilePicture }));
                          } else {
                            alert(data.message || 'Failed to upload profile picture');
                          }
                        } catch (err) {
                          console.error(err);
                          alert(`Error uploading picture: ${err.message || 'Network error'}`);
                        }
                      };
                    }}
                  />
                </label>
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Upload profile picture</span>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSavingIntake(true);
              try {
                const response = await fetch('http://localhost:5000/api/profile/me', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    experience: Number(doctorIntakeData.experience) || 0,
                    specialization: doctorIntakeData.specialization || 'General Physician',
                    consultationFee: Number(doctorIntakeData.consultationFee) || 500
                  })
                });
                const resData = await response.json();
                if (resData.success) {
                  setShowDoctorIntake(false);
                }
              } catch (err) {
                console.error('Error saving doctor profile:', err);
              } finally {
                setSavingIntake(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={doctorIntakeData.experience}
                  onChange={e => setDoctorIntakeData({...doctorIntakeData, experience: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  placeholder="e.g. 5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Specialization</label>
                <input
                  type="text"
                  required
                  value={doctorIntakeData.specialization}
                  onChange={e => setDoctorIntakeData({...doctorIntakeData, specialization: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  placeholder="e.g. Cardiologist"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Consultation Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={doctorIntakeData.consultationFee}
                  onChange={e => setDoctorIntakeData({...doctorIntakeData, consultationFee: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  placeholder="e.g. 500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={savingIntake}
                  className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 text-sm transition shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2"
                >
                  {savingIntake ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Save Profile & Continue'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-24 bg-white border-r border-secondary flex flex-col items-center py-8 gap-8">
        <button
          onClick={() => navigate('/')}
          className="w-12 h-12 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center border border-secondary shadow-sm hover:scale-105 transition-all overflow-hidden"
        >
          <img src="https://res.cloudinary.com/uwv2e0xt/image/upload/v1782896157/healthcare_assets/blqjvr5f2jt2juacc1ii.jpg" alt="Logo" className="w-full h-full object-cover" />
        </button>

        <div className="flex-1 w-full relative flex flex-col items-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />

          <nav className="flex-1 w-full flex flex-col gap-4 overflow-y-auto no-scrollbar py-4 items-center">
            {sidebarItems.map((item, index) => {
              const [basePath, queryStr] = item.path.split('?');
              const isActive = location.pathname === basePath && (queryStr ? location.search.includes(queryStr) : true);
              return (
                <SidebarItem
                  key={index}
                  {...item}
                  active={isActive}
                />
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
        </div>

        <div className="flex flex-col gap-4 flex-shrink-0">
          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className="theme-toggle-btn p-4 rounded-2xl text-slate-400 hover:text-primary hover:bg-secondary transition-all"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <motion.div
              key={isDarkMode ? 'sun' : 'moon'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </motion.div>
          </motion.button>
          {isAuthenticated && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={24} />
            </button>
          )}
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
            {/* Dark Mode Toggle in Header */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="theme-toggle-btn w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:bg-secondary transition-all border border-transparent hover:border-secondary"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              <motion.div
                key={isDarkMode ? 'sun-header' : 'moon-header'}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </motion.div>
            </motion.button>
            {isAuthenticated ? (
              <>
                <div className="text-right">
                  <span className="block font-bold text-text">{user?.name || 'User'}</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{user?.role || 'Patient'}</span>
                </div>
                <button 
                  onClick={() => {
                    if (user?.role === 'Doctor') setShowDoctorIntake(true);
                    else if (user?.role === 'Patient') setShowIntakeForm(true);
                  }}
                  className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary flex items-center justify-center bg-secondary cursor-pointer hover:shadow-lg hover:shadow-primary/20 transition-all group"
                  title="Edit Medical Profile"
                >
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-bold group-hover:scale-110 transition-transform">{user?.name?.charAt(0) || 'U'}</span>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all cursor-pointer"
              >
                Login / Sign up
              </button>
            )}
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
