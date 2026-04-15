import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp,
  Video,
  ChevronRight
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
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-text">Welcome back, Dr. Sarah!</h1>
          <p className="text-slate-500 mt-2">You have 8 appointments scheduled for today.</p>
        </div>
        <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold medical-gradient shadow-xl shadow-primary/20 transform hover:-translate-y-1 transition-all">
          Generate Session Link
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard icon={<Users size={28} />} label="Total Patients" value="1,284" trend="+12.5%" />
        <StatCard icon={<Calendar size={28} />} label="Appointments" value="48" trend="+8.2%" />
        <StatCard icon={<Clock size={28} />} label="Hours Spent" value="240" />
        <StatCard icon={<TrendingUp size={28} />} label="Earnings" value="₹1.2L" trend="+15%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Chart */}
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

        {/* Upcoming Appointments */}
        <div className="bg-white p-8 rounded-[40px] border border-secondary shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-text mb-8">Recent Patients</h3>
          <div className="space-y-6 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    JS
                  </div>
                  <div>
                    <span className="block font-bold text-text group-hover:text-primary transition-colors">John Smith</span>
                    <span className="text-xs text-slate-400">Cardiology • 10:30 AM</span>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                  <Video size={18} />
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 bg-secondary rounded-2xl font-bold text-primary flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all">
            View All Patients <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
