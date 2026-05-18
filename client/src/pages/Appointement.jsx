import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAppointments } from '../store/slices/appointmentSlice';
import { Calendar, Clock, Stethoscope, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Appointment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointments, loading, error } = useSelector((state) => state.appointments);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Completed':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-text flex items-center gap-3">
            My Appointments <Calendar className="text-primary" size={28} />
          </h1>
          <p className="text-slate-500 mt-2">Manage your scheduled clinical consultations and checkups.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100 font-bold text-center">
          {error}
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border border-secondary text-center shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
            <Calendar size={36} />
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-xl text-text">No Appointments Booked Yet</h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
              You haven't scheduled any consultations. Book an appointment with our verified specialists today!
            </p>
          </div>
          <button
            onClick={() => navigate('/find-doctors')}
            className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center gap-2 mx-auto cursor-pointer"
          >
            Find Doctors <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((appt, idx) => (
            <motion.div
              key={appt._id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-secondary shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              {/* Doctor and Date details */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Stethoscope size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-black text-lg text-text">
                    {user?.role === 'Doctor' ? `Patient: ${appt.patientId?.name}` : `Dr. ${appt.doctorId?.name || 'Verified Specialist'}`}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-300" /> {formatDate(appt.date)}
                  </p>
                  <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-300" /> Slot: <span className="text-primary font-black">{appt.timeSlot}</span>
                  </p>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <span className={`px-4 py-1.5 rounded-full font-bold text-xs border ${getStatusStyle(appt.status)}`}>
                  {appt.status}
                </span>
                
                {user?.role === 'Patient' && (
                  <span className={`px-4 py-1.5 rounded-full font-bold text-xs border ${appt.paymentStatus === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                    Payment: {appt.paymentStatus}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointment;