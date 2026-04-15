import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut, 
  Search,
  PlusCircle,
  Stethoscope
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const sidebarItems = [
  { icon: <LayoutDashboard size={24} />, label: 'Dashboard', path: '/patient-dashboard' },
  { icon: <Calendar size={24} />, label: 'Appointments', path: '/appointments' },
  { icon: <MessageSquare size={24} />, label: 'Chat', path: '/chat' },
  { icon: <Stethoscope size={24} />, label: 'Pharmacy', path: '/pharmacy' },
  { icon: <PlusCircle size={24} />, label: 'AI Checker', path: '/ai-symptom-checker' },
];

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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-24 bg-white border-r border-secondary flex flex-col items-center py-8 gap-10">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center medical-gradient">
          <span className="text-white font-black text-xl">H</span>
        </div>

        <nav className="flex-1 flex flex-col gap-4">
          {sidebarItems.map((item) => (
            <SidebarItem 
              key={item.label} 
              {...item} 
              active={location.pathname === item.path} 
            />
          ))}
        </nav>

        <div className="flex flex-col gap-4">
          <SidebarItem icon={<Settings size={24} />} label="Settings" path="/settings" />
          <button className="p-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={24} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-secondary flex items-center justify-between px-10">
          <div className="flex items-center gap-4 bg-secondary/50 px-6 py-2.5 rounded-2xl w-96 border border-transparent focus-within:border-primary focus-within:bg-white transition-all">
            <Search size={20} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search appointments, doctors, reports..." 
              className="bg-transparent outline-none w-full font-medium text-slate-600"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block font-bold text-text">Dr. Sarah Johnson</span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Cardiologist</span>
            </div>
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary">
              <img src="https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=100&h=100" alt="Avatar" />
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
