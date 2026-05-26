import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
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
  Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Mon', appointments: 12 },
  { name: 'Tue', appointments: 19 },
  { name: 'Wed', appointments: 15 },
  { name: 'Thu', appointments: 22 },
  { name: 'Fri', appointments: 30 },
  { name: 'Sat', appointments: 10 },
  { name: 'Sun', appointments: 5 },
];

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
  const { user, token } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState({
    specialization: '',
    degree: '',
    experience: 0,
    consultationFee: 500,
    subscriptionFee: 999,
    bio: ''
  });
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Fetch Doctor Profile Information
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.data.profile) {
          setProfile({
            specialization: res.data.data.profile.specialization || '',
            degree: res.data.data.profile.degree || '',
            experience: res.data.data.profile.experience || 0,
            consultationFee: res.data.data.profile.consultationFee || 500,
            subscriptionFee: res.data.data.profile.subscriptionFee || 999,
            bio: res.data.data.profile.bio || ''
          });
        }
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token]);

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
        <StatCard icon={<Users size={28} />} label="Total Patients" value="1,284" trend="+12.5%" />
        <StatCard icon={<Calendar size={28} />} label="Appointments" value="48" trend="+8.2%" />
        <StatCard icon={<Clock size={28} />} label="Hours Spent" value="240" />
        <StatCard icon={<TrendingUp size={28} />} label="Earnings" value="₹1.2L" trend="+15%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Appointments Analytic Recharts Area */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-secondary shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-text">Appointment Analytics</h3>
            <select className="bg-secondary/50 border-none rounded-xl px-4 py-2 font-bold text-text text-sm outline-none">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2ECC71" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAF9F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="appointments" stroke="#2ECC71" strokeWidth={4} fillOpacity={1} fill="url(#colorApp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Patients List */}
        <div className="bg-white p-8 rounded-[40px] border border-secondary shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-text mb-8">Recent Patients</h3>
          <div className="space-y-6 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/chat')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    JS
                  </div>
                  <div>
                    <span className="block font-bold text-text group-hover:text-primary transition-colors">John Smith</span>
                    <span className="text-xs text-slate-400">Cardiology • 10:30 AM</span>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer">
                  <Video size={18} />
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 bg-secondary rounded-2xl font-bold text-primary flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all cursor-pointer" onClick={() => navigate('/chat')}>
            View All Patients <ChevronRight size={18} />
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
