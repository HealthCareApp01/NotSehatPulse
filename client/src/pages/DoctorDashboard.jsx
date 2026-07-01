import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserSuccess } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp,
  Video,
  ChevronRight,
  Settings,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const StatCard = ({ icon, label, value, trend }) => (
  <div className="bg-white p-8 rounded-[32px] border border-secondary shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary">
        {icon}
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-green-500 font-bold text-sm">
          <TrendingUp size={16} />
          {trend}
        </span>
      )}
    </div>
    <span className="text-slate-500 font-medium">{label}</span>
    <h3 className="text-3xl font-black text-text mt-1">{value}</h3>
  </div>
);

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState({
    specialization: '',
    degree: '',
    experience: 0,
    consultationFee: 500,
    subscriptionFee: 999,
    bio: ''
  });
  
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    hoursSpent: 0,
    earnings: 0
  });
  const [chartData, setChartData] = useState([]);

  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Fetch Doctor Profile Information and Appointments
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, apptsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/profile/me', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/appointments/my', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        let fetchedFee = 500;
        if (profileRes.data.success && profileRes.data.data.profile) {
          const p = profileRes.data.data.profile;
          fetchedFee = p.consultationFee || 500;
          setProfile({
            specialization: p.specialization || '',
            degree: p.degree || '',
            experience: p.experience || 0,
            consultationFee: fetchedFee,
            subscriptionFee: p.subscriptionFee || 999,
            bio: p.bio || ''
          });
        }

        if (apptsRes.data.success) {
          const appts = apptsRes.data.data;
          // Ensure we only process appointments where this user is the doctor
          const doctorAppts = appts.filter(a => {
            const docId = typeof a.doctorId === 'object' ? (a.doctorId?._id || a.doctorId?.id) : a.doctorId;
            return docId === user?.id || docId === user?._id;
          });
          setAppointments(doctorAppts);

          // Calculate stats
          const uniquePatients = new Set(doctorAppts.map(a => typeof a.patientId === 'object' ? a.patientId._id : a.patientId));
          const completedAppts = doctorAppts.filter(a => a.status === 'Completed');
          
          setStats({
            totalPatients: uniquePatients.size,
            totalAppointments: doctorAppts.length,
            hoursSpent: Math.round(completedAppts.length * 0.5), // Assuming 30 mins per appointment
            earnings: completedAppts.length * fetchedFee
          });

          // Generate chart data (last 7 days)
          const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d;
          });

          const cData = last7Days.map(date => {
            const dayAppts = doctorAppts.filter(a => {
              const aDate = new Date(a.date);
              return aDate.getDate() === date.getDate() && 
                     aDate.getMonth() === date.getMonth() && 
                     aDate.getFullYear() === date.getFullYear();
            });
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return {
              name: days[date.getDay()],
              appointments: dayAppts.length
            };
          });
          setChartData(cData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    if (token) {
      fetchDashboardData();
    }
  }, [token, user]);

  const formatCurrency = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const markAsConsulted = async (apptId) => {
    try {
      await axios.post(`http://localhost:5000/api/appointments/${apptId}/consulted`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state to reflect the change
      setAppointments(prev => prev.map(a => a._id === apptId ? { ...a, status: 'Completed' } : a));
      
      // Update stats optimistically
      setStats(prev => ({
        ...prev,
        hoursSpent: prev.hoursSpent + 0.5,
        earnings: prev.earnings + profile.consultationFee
      }));
    } catch (err) {
      console.error('Failed to mark appointment as consulted', err);
    }
  };

  return (
    <div className="space-y-10">
      {/* Dashboard Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-text">Welcome back, {user?.name || 'Doctor'}!</h1>
          <p className="text-slate-500 mt-2">Manage your patients, billing, and direct chat subscriptions.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-white border-2 border-secondary px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:border-primary transition-all cursor-pointer"
          >
            <Settings size={20} className="text-primary animate-spin-slow" />
            Edit Profile & Rates
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold medical-gradient shadow-xl shadow-primary/20 transform hover:-translate-y-1 transition-all cursor-pointer"
          >
            Go to Chats
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard icon={<Users size={28} />} label="Total Patients" value={stats.totalPatients.toLocaleString()} />
        <StatCard icon={<Calendar size={28} />} label="Appointments" value={stats.totalAppointments.toLocaleString()} />
        <StatCard icon={<Clock size={28} />} label="Hours Spent" value={stats.hoursSpent} />
        <StatCard icon={<TrendingUp size={28} />} label="Earnings" value={formatCurrency(stats.earnings)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Appointments Analytic Recharts Area */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-secondary shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-text">Appointment Analytics (Last 7 Days)</h3>
            <select className="bg-secondary/50 border-none rounded-xl px-4 py-2 font-bold text-text text-sm outline-none">
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2ECC71" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAF9F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="appointments" stroke="#2ECC71" strokeWidth={4} fillOpacity={1} fill="url(#colorApp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Appointments List */}
        <div className="bg-white p-8 rounded-[40px] border border-secondary shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-text mb-8">Upcoming Appointments</h3>
          <div className="space-y-6 flex-1 overflow-y-auto max-h-[300px] pr-2 no-scrollbar">
            {appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Calendar size={48} className="mb-4 opacity-20" />
                <p>No upcoming appointments</p>
              </div>
            ) : (
              appointments
                .filter(a => a.status === 'Confirmed' || a.status === 'Pending')
                .slice(0, 5)
                .map((apt) => (
                <div key={apt._id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      {apt.patientId?.name ? apt.patientId.name.substring(0, 2).toUpperCase() : 'PT'}
                    </div>
                    <div>
                      <span className="block font-bold text-text group-hover:text-primary transition-colors">{apt.patientId?.name || 'Patient'}</span>
                      <span className="text-xs text-slate-400">{new Date(apt.date).toLocaleDateString()} • {apt.timeSlot}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => markAsConsulted(apt._id)}
                      className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-slate-400 hover:text-green-500 hover:bg-green-50 transition-all cursor-pointer"
                      title="Mark as Consulted"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button 
                      onClick={() => navigate(`/consultation/${apt._id}?patientId=${apt.patientId?._id}&apptId=${apt._id}`)}
                      className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:text-white hover:bg-primary transition-all cursor-pointer"
                      title="Join Video Call"
                    >
                      <Video size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-8 py-4 bg-secondary rounded-2xl font-bold text-primary flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all cursor-pointer" onClick={() => navigate('/appointments')}>
            View All Schedule <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Settings Sliding Overlay Drawer */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end p-4 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white rounded-l-[40px] max-w-md w-full h-full p-8 shadow-2xl relative border-l border-secondary overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-secondary pb-4">
                  <h3 className="text-xl font-bold text-text flex items-center gap-2">
                    <Settings className="text-primary animate-spin-slow" size={24} /> Settings & Rates
                  </h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-text font-bold text-sm cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                 <div className="space-y-4">
                  {/* Profile Picture Uploader */}
                  <div className="flex flex-col items-center justify-center pb-4 border-b border-secondary">
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
                                const res = await axios.put('http://localhost:5000/api/profile/picture', { image: reader.result }, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                if (res.data.success) {
                                  dispatch(updateUserSuccess({ profilePicture: res.data.data.profilePicture }));
                                } else {
                                  alert(res.data.message || 'Failed to upload profile picture');
                                }
                              } catch (err) {
                                console.error(err);
                                const errMsg = err.response?.data?.message || err.message || 'Error uploading picture';
                                alert(`Error uploading picture: ${errMsg}`);
                              }
                            };
                          }}
                        />
                      </label>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Change Profile Picture</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Specialization</label>
                    <input 
                      type="text" 
                      value={profile.specialization}
                      onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                      placeholder="e.g. Cardiologist"
                      className="w-full bg-secondary/50 border border-secondary focus:border-primary outline-none px-4 py-3 rounded-xl font-medium text-sm text-text transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Degree</label>
                    <input 
                      type="text" 
                      value={profile.degree}
                      onChange={(e) => setProfile({...profile, degree: e.target.value})}
                      placeholder="e.g. MBBS, MD"
                      className="w-full bg-secondary/50 border border-secondary focus:border-primary outline-none px-4 py-3 rounded-xl font-medium text-sm text-text transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Experience (Yrs)</label>
                      <input 
                        type="number" 
                        value={profile.experience}
                        onChange={(e) => setProfile({...profile, experience: Number(e.target.value)})}
                        placeholder="e.g. 5"
                        className="w-full bg-secondary/50 border border-secondary focus:border-primary outline-none px-4 py-3 rounded-xl font-medium text-sm text-text transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Consultation Fee (₹)</label>
                      <input 
                        type="number" 
                        value={profile.consultationFee}
                        onChange={(e) => setProfile({...profile, consultationFee: Number(e.target.value)})}
                        placeholder="e.g. 500"
                        className="w-full bg-secondary/50 border border-secondary focus:border-primary outline-none px-4 py-3 rounded-xl font-medium text-sm text-text transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</label>
                    <textarea 
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      placeholder="Share a short bio with patients..."
                      rows={4}
                      className="w-full bg-secondary/50 border border-secondary focus:border-primary outline-none px-4 py-3 rounded-xl font-medium text-sm text-text transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-secondary">
                {settingsSuccess && (
                  <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-xl font-bold text-xs text-center">
                    ✓ Profile & rates successfully updated!
                  </div>
                )}

                <button
                  onClick={async () => {
                    setSavingSettings(true);
                    setSettingsSuccess(false);
                    try {
                      const res = await axios.put('http://localhost:5000/api/profile/me', profile, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      if (res.data.success) {
                        setSettingsSuccess(true);
                        setTimeout(() => setSettingsSuccess(false), 3000);
                      }
                    } catch (err) {
                      console.error('Error saving doctor settings:', err);
                    } finally {
                      setSavingSettings(false);
                    }
                  }}
                  disabled={savingSettings}
                  className="w-full bg-primary disabled:bg-slate-300 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {savingSettings ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Save Updates'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorDashboard;
