import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAppointments } from '../store/slices/appointmentSlice';
import { 
  Search, 
  Calendar, 
  FileText, 
  Activity,
  ArrowRight,
  Clock,
  Video,
  Heart,
  X
} from 'lucide-react';

const formatDate = (dateStr) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (err) {
    return 'Upcoming';
  }
};

const PatientDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments, loading } = useSelector((state) => state.appointments);
  const [dismissedAlerts, setDismissedAlerts] = React.useState(() => {
    try {
      const items = localStorage.getItem('dismissedAlerts');
      return items ? JSON.parse(items) : [];
    } catch {
      return [];
    }
  });

  const dismissAlert = (id) => {
    const updated = [...dismissedAlerts, id];
    setDismissedAlerts(updated);
    localStorage.setItem('dismissedAlerts', JSON.stringify(updated));
  };

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-text">Good Morning, {user?.name?.split(' ')[0] || 'Patient'}!</h1>
          <p className="text-slate-500 mt-2">How are you feeling today?</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white border-2 border-secondary px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:border-primary transition-all">
            <FileText size={20} className="text-primary" />
            My Reports
          </button>
          <button
            onClick={() => navigate('/find-doctors')}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold medical-gradient shadow-xl shadow-primary/20 transform hover:-translate-y-1 transition-all"
          >
            Book Appointment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-10">
          {/* Quick Actions / AI Entry */}
          <div className="bg-text text-white p-10 rounded-[40px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 max-w-lg">
              <h2 className="text-3xl font-black mb-4">Feeling Unwell?</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Describe your symptoms to our <span className="text-primary font-bold">AI Health Assistant</span> and get recommendations for the right specialists.
              </p>
              <button
                onClick={() => navigate('/ai-symptom-checker')}
                className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all"
              >
                Start AI Checkup <ArrowRight size={20} />
              </button>
            </div>
            <div className="absolute bottom-10 right-10 scale-150 opacity-20 transform rotate-12 group-hover:rotate-0 transition-transform hidden md:block">
              <Activity size={120} />
            </div>
          </div>

          {/* Rescheduled Appointments Alerts */}
          {appointments.filter(apt => apt.status === 'Postponed' && !dismissedAlerts.includes(apt._id)).length > 0 && (
            <div className="space-y-4 mb-8">
              {appointments.filter(apt => apt.status === 'Postponed' && !dismissedAlerts.includes(apt._id)).map(apt => (
                <div key={apt._id} className="bg-gradient-to-r from-amber-500/10 to-amber-500/0 border border-amber-500/20 p-6 rounded-[28px] flex items-start gap-4 relative overflow-hidden pr-12">
                  <div className="w-1.5 h-full bg-amber-500 absolute top-0 left-0" />
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                    <Calendar size={20} className="animate-bounce" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="block font-black text-xs text-amber-800 uppercase tracking-widest">Rescheduled Appointment Alert</span>
                    <p className="text-xs font-semibold text-amber-700 leading-relaxed">
                      Your consultation with <span className="font-bold text-amber-900">{apt.doctorId?.name || 'Verified Specialist'}</span> was missed. We have automatically rescheduled it for <span className="font-bold text-amber-900">{formatDate(apt.date)}</span> during the slot <span className="font-bold text-amber-900">{apt.timeSlot.split('(').pop().replace(')', '') || 'Scheduled'}</span>!
                    </p>
                  </div>
                  <button 
                    onClick={() => dismissAlert(apt._id)}
                    className="absolute top-4 right-4 text-amber-600 hover:text-amber-800 hover:bg-amber-500/10 p-1.5 rounded-xl transition-colors cursor-pointer"
                    title="Dismiss alert"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Appointments */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-text">Upcoming Consultations</h2>
              <button className="text-primary font-bold text-sm hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="col-span-full bg-slate-50 text-slate-500 p-10 rounded-[32px] border border-secondary text-center space-y-4">
                  <p className="font-bold text-sm">No upcoming consultations scheduled.</p>
                  <button
                    onClick={() => navigate('/find-doctors')}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors cursor-pointer text-xs"
                  >
                    Find a Doctor
                  </button>
                </div>
              ) : (
                appointments.slice(0, 4).map((apt) => (
                  <div key={apt._id} className="bg-white p-6 rounded-[32px] border border-secondary shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-primary font-bold text-xl uppercase">
                          {apt.doctorId?.name ? apt.doctorId.name.split(' ').pop()[0] : 'D'}
                        </div>
                        <div>
                          <h4 className="font-bold text-text">{apt.doctorId?.name || 'Verified Specialist'}</h4>
                          <p className="text-sm text-slate-400 font-medium">{apt.doctorId?.specialization || 'General Physician'}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mb-8">
                        <div className="flex-1 bg-secondary/50 p-3 rounded-2xl flex items-center gap-2">
                          <Calendar size={16} className="text-primary" />
                          <span className="text-xs font-bold text-text">{formatDate(apt.date)}</span>
                        </div>
                        <div className="flex-1 bg-secondary/50 p-3 rounded-2xl flex items-center gap-2">
                          <Clock size={16} className="text-primary" />
                          <span className="text-xs font-bold text-text truncate max-w-[80px]" title={apt.timeSlot}>{apt.timeSlot || 'Scheduled'}</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/10 cursor-pointer">
                      <Video size={18} /> Join Call
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Mini Section */}
        <div className="space-y-10 focus:ring">
          <div className="bg-white p-8 rounded-[40px] border border-secondary shadow-sm">
            <h3 className="text-xl font-bold text-text mb-8">Health Overview</h3>
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                    <Heart size={24} />
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider">Heart Rate</span>
                    <span className="text-xl font-black text-text">72 bpm</span>
                  </div>
                </div>
                <div className="text-red-500 text-xs font-bold">Normal</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Activity size={24} />
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider">Blood Sugar</span>
                    <span className="text-xl font-black text-text">110 mg/dl</span>
                  </div>
                </div>
                <div className="text-orange-500 text-xs font-bold">Safe</div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/10 shadow-sm relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-xl font-bold text-text mb-2">Order Medicines</h3>
               <p className="text-slate-500 text-sm mb-6">Get medicines delivered to your doorstep in 60 mins.</p>
               <button
                 onClick={() => navigate('/medicines')}
                 className="w-full py-4 bg-white border-2 border-primary text-primary rounded-2xl font-bold hover:bg-primary hover:text-white transition-all"
               >
                 Order Now
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
