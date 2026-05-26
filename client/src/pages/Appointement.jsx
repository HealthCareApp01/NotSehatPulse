import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAppointments, markConsulted, requestReschedule, patientReschedule, moveToLast } from '../store/slices/appointmentSlice';
import { Calendar, Clock, Stethoscope, Video, CheckCircle, RefreshCcw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Appointment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointments, loading, error } = useSelector((state) => state.appointments);
  const { user } = useSelector((state) => state.auth);

  const [rescheduleData, setRescheduleData] = useState({ id: null, date: '', timeSlot: '' });

  const rescheduleDates = React.useMemo(() => {
    const dates = [];
    const current = new Date();
    current.setDate(current.getDate() + 1); // Start from tomorrow
    while (dates.length < 6) {
      if (current.getDay() !== 0) { // Skip Sundays
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, []);

  useEffect(() => {
    dispatch(fetchAppointments());

    if (user && user.role === 'Doctor') {
      import('socket.io-client').then(({ io }) => {
        const socket = io('http://localhost:5000');
        socket.emit('join-user-room', user.id || user._id);
        
        socket.on('new-appointment-booked', () => {
          dispatch(fetchAppointments());
        });

        return () => socket.disconnect();
      });
    }
  }, [dispatch, user]);

  const handleAction = async (actionFn, id) => {
    try {
      await dispatch(actionFn(id)).unwrap();
      dispatch(fetchAppointments());
    } catch (err) {
      console.error(err);
      alert('Action failed: ' + err);
    }
  };

  const handlePatientReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.timeSlot) return alert("Please select date and slot");
    try {
      await dispatch(patientReschedule({
        appointmentId: rescheduleData.id,
        newDate: rescheduleData.date,
        newTimeSlot: rescheduleData.timeSlot
      })).unwrap();
      setRescheduleData({ id: null, date: '', timeSlot: '' });
      dispatch(fetchAppointments());
    } catch (err) {
      console.error(err);
      alert('Reschedule failed');
    }
  };

  const startConsultation = () => {
    if (!todayAppointments.length) return alert("No appointments in queue for today.");
    const firstPatient = todayAppointments[0];
    navigate(`/consultation/${user.id || user._id}-${new Date().toISOString().split('T')[0]}?patientId=${firstPatient.patientId._id}&apptId=${firstPatient._id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Completed': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  // Processing arrays
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = appointments.filter(a => {
    const aptDate = new Date(a.date);
    return aptDate >= today && aptDate < tomorrow && a.status === 'Confirmed';
  }).sort((a, b) => {
    if (a.queuePosition && b.queuePosition) return a.queuePosition - b.queuePosition;
    if (a.queuePosition) return 1;
    if (b.queuePosition) return -1;
    return a.timeSlot.localeCompare(b.timeSlot);
  });

  const upcomingAppointments = appointments.filter(a => {
    const aptDate = new Date(a.date);
    return aptDate >= tomorrow || a.status !== 'Confirmed';
  });

  if (loading) return (
    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-secondary shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-text flex items-center gap-3">
            My Appointments <Calendar className="text-primary" size={28} />
          </h1>
          <p className="text-slate-500 mt-2">Manage your scheduled clinical consultations.</p>
        </div>
        {user?.role === 'Doctor' && todayAppointments.length > 0 && (
          <button onClick={startConsultation} className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/30 flex items-center gap-2">
            <Video size={18} /> Start Next Consultation
          </button>
        )}
      </div>

      {user?.role === 'Doctor' ? (
        <div className="space-y-10">
          {/* Today's Queue */}
          <section>
            <h2 className="text-2xl font-black text-text mb-4 flex items-center gap-2">
              <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs uppercase tracking-wider">Live Queue</span>
              Today's Appointments ({todayAppointments.length})
            </h2>
            {todayAppointments.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center text-slate-500 font-medium">No confirmed appointments for today.</div>
            ) : (
              <div className="flex overflow-x-auto gap-6 pb-6 snap-x">
                {todayAppointments.map((appt, idx) => (
                  <div key={appt._id} className="min-w-[320px] max-w-[320px] bg-white p-6 rounded-3xl border border-secondary shadow-sm snap-center flex flex-col justify-between relative overflow-hidden">
                    {idx === 0 && <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Stethoscope size={20} /></div>
                        <div>
                          <h3 className="font-bold text-lg">{appt.patientId?.name}</h3>
                          <p className="text-xs text-slate-400 font-bold flex items-center gap-1"><Clock size={12}/> {appt.timeSlot}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full font-bold text-xs border ${getStatusStyle(appt.status)}`}>{appt.status}</span>
                        {idx === 0 && <span className="px-3 py-1 rounded-full font-bold text-xs border bg-rose-50 border-rose-100 text-rose-600 animate-pulse">Up Next</span>}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                      <button onClick={() => handleAction(markConsulted, appt._id)} className="flex-1 min-w-[80px] bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold py-2 rounded-xl text-sm flex justify-center items-center gap-1 transition">
                        <CheckCircle size={16}/> Done
                      </button>
                      <button onClick={() => handleAction(requestReschedule, appt._id)} className="flex-1 min-w-[80px] bg-amber-50 hover:bg-amber-100 text-amber-600 font-bold py-2 rounded-xl text-sm flex justify-center items-center gap-1 transition" disabled={appt.doctorRequestedReschedule}>
                        <RefreshCcw size={16}/> {appt.doctorRequestedReschedule ? 'Requested' : 'Reschedule'}
                      </button>
                      <button onClick={() => handleAction(moveToLast, appt._id)} className="flex-1 min-w-[80px] bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-2 rounded-xl text-sm flex justify-center items-center gap-1 transition">
                        <ArrowRight size={16}/> Skip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming */}
          <section>
            <h2 className="text-2xl font-black text-text mb-4">Upcoming & Past Appointments</h2>
            <div className="flex overflow-x-auto gap-6 pb-6 snap-x">
              {upcomingAppointments.map((appt) => (
                <div key={appt._id} className="min-w-[300px] bg-white p-5 rounded-3xl border border-secondary shadow-sm snap-center opacity-80 hover:opacity-100 transition-opacity">
                  <h3 className="font-bold text-md">{appt.patientId?.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(appt.date)} • {appt.timeSlot}</p>
                  <span className={`mt-3 inline-block px-3 py-1 rounded-full font-bold text-xs border ${getStatusStyle(appt.status)}`}>{appt.status}</span>
                  {appt.doctorRequestedReschedule && <span className="mt-2 block text-xs font-bold text-amber-600">Pending Patient Reschedule</span>}
                </div>
              ))}
              {upcomingAppointments.length === 0 && <p className="text-slate-500 text-sm">No upcoming appointments.</p>}
            </div>
          </section>
        </div>
      ) : (
        /* Patient View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((appt, idx) => (
            <motion.div key={appt._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className={`p-6 rounded-3xl border shadow-sm transition-all ${appt.doctorRequestedReschedule ? 'bg-amber-50 border-amber-200 shadow-amber-100/50' : 'bg-white border-secondary hover:shadow-md'}`}>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${appt.doctorRequestedReschedule ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-text">Dr. {appt.doctorId?.name}</h3>
                    <p className="text-xs text-slate-500 font-bold">{appt.doctorId?.specialization || 'Specialist'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full font-bold text-xs border ${getStatusStyle(appt.status)}`}>{appt.status}</span>
              </div>

              <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl mb-4">
                <p className="text-sm font-bold flex items-center gap-2"><Calendar size={16} className="text-slate-400" /> {formatDate(appt.date)}</p>
                <p className="text-sm font-bold flex items-center gap-2"><Clock size={16} className="text-slate-400" /> {appt.timeSlot}</p>
              </div>

              {/* Reschedule UI for Patient */}
              {appt.doctorRequestedReschedule && rescheduleData.id !== appt._id && (
                <div className="mt-4 p-4 bg-white rounded-2xl border border-amber-200">
                  <p className="text-xs font-bold text-amber-600 mb-3 flex items-center gap-1.5"><RefreshCcw size={14}/> Doctor requested a reschedule. Please pick a new time.</p>
                  <button onClick={() => setRescheduleData({ id: appt._id, date: '', timeSlot: '' })} className="w-full bg-amber-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-amber-600 transition">
                    Reschedule Now
                  </button>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">If not rescheduled by midnight, it will auto-move to tomorrow.</p>
                </div>
              )}

              {rescheduleData.id === appt._id && (
                <div className="mt-4 p-4 bg-white rounded-2xl border border-primary shadow-lg space-y-3">
                  <h4 className="text-sm font-black text-primary">Select New Date</h4>
                  
                  <div className="flex flex-wrap gap-2">
                    {rescheduleDates.map((dateObj, idx) => {
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const isoDate = dateObj.toISOString();
                      const isSelected = rescheduleData.date === isoDate;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => setRescheduleData({...rescheduleData, date: isoDate, timeSlot: '10:00 AM - 4:00 PM'})}
                          className={`border p-3 rounded-xl flex flex-col items-center min-w-[90px] shadow-sm transition-all ${
                            isSelected
                              ? 'bg-primary/10 border-primary scale-105 cursor-pointer'
                              : 'bg-white border-secondary hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-primary' : 'text-slate-500'}`}>{dayName}, {dateStr}</span>
                          <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">10:00 AM - 4:00 PM</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button onClick={() => setRescheduleData({ id: null, date: '', timeSlot: '' })} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition">Cancel</button>
                    <button onClick={handlePatientReschedule} className="flex-1 bg-primary text-white py-2 rounded-xl text-xs font-bold hover:bg-primary-dark transition shadow-md shadow-primary/20">Confirm</button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {appointments.length === 0 && (
             <div className="col-span-1 md:col-span-2 text-center py-20 text-slate-500">No appointments found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Appointment;