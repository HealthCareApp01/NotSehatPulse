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
  FlaskConical
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

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


  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const getDashboardPath = () => {
    return user?.role === 'Doctor' ? '/doctor-dashboard' : '/patient-dashboard';
  };

  const sidebarItems = [
    { icon: <LayoutDashboard size={24} />, label: 'Dashboard', path: getDashboardPath() },
    { icon: <Stethoscope size={24} />, label: 'Doctors', path: '/find-doctors' },
    { icon: <Pill size={24} />, label: 'Medicines', path: '/medicines' },
    { icon: <FlaskConical size={24} />, label: 'Lab Tests', path: '/labs' },
    { icon: <Calendar size={24} />, label: 'Appointments', path: '/appointments' },
    { icon: <MessageSquare size={24} />, label: 'Chat', path: '/chat' },
    { icon: <PlusCircle size={24} />, label: 'AI Checker', path: '/ai-symptom-checker' },
  ];


  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
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
