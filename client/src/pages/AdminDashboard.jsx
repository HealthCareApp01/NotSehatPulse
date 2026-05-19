import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUnverifiedDoctors, verifyDoctor, markFraudDoctor, clearAdminMessages } from '../store/slices/adminSlice';
import { ShieldCheck, ShieldAlert, XCircle, Stethoscope, Clock, Banknote, UserRound } from 'lucide-react';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { unverifiedDoctors, loading, error, successMessage } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchUnverifiedDoctors());
  }, [dispatch]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearAdminMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  const handleVerify = (id) => {
    dispatch(verifyDoctor(id));
  };

  const handleFraud = (id) => {
    dispatch(markFraudDoctor(id));
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-text flex items-center gap-3">
            Admin Operations <ShieldCheck className="text-primary animate-pulse" size={28} />
          </h1>
          <p className="text-slate-500 mt-2">Manage medical staff verifications and platform security.</p>
        </div>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 text-green-600 p-6 rounded-2xl border border-green-200 font-bold flex items-center gap-3"
          >
            <ShieldCheck size={24} /> {successMessage}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 font-bold flex items-center gap-3"
          >
            <ShieldAlert size={24} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-8 rounded-[40px] border border-secondary shadow-sm">
        <h2 className="text-2xl font-bold text-text mb-8 flex items-center gap-2">
          <UserRound className="text-primary" /> Pending Verifications
          <span className="bg-primary text-white text-sm px-3 py-1 rounded-full ml-2">
            {unverifiedDoctors.length}
          </span>
        </h2>

        {loading && unverifiedDoctors.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : unverifiedDoctors.length === 0 ? (
          <div className="bg-slate-50 text-slate-500 p-20 rounded-[32px] border border-secondary text-center space-y-4">
            <ShieldCheck size={64} className="mx-auto text-primary opacity-50 mb-4" />
            <p className="font-bold text-lg">All caught up!</p>
            <p className="text-sm">There are no doctors pending verification at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {unverifiedDoctors.map((doc) => (
                <motion.div
                  key={doc.user._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
                  className="bg-slate-50 p-6 rounded-3xl border border-secondary hover:border-primary/50 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-4 mb-6 items-start">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-secondary flex items-center justify-center text-primary font-black text-xl uppercase shadow-sm">
                        {doc.user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-text leading-tight">{doc.user.name}</h4>
                        <p className="text-xs text-slate-400 font-bold mt-1">{doc.user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 bg-white p-4 rounded-2xl border border-secondary/50">
                      <div className="flex items-center gap-3 text-sm">
                        <Stethoscope size={16} className="text-primary" />
                        <span className="font-bold text-slate-600">{doc.profile?.specialization || 'Not Specified'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock size={16} className="text-primary" />
                        <span className="font-bold text-slate-600">{doc.profile?.experience || 0} Years Experience</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Banknote size={16} className="text-primary" />
                        <span className="font-bold text-slate-600">₹{doc.profile?.consultationFee || 0} Fee</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleVerify(doc.user._id)}
                      disabled={loading}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <ShieldCheck size={18} /> Verify
                    </button>
                    <button
                      onClick={() => handleFraud(doc.user._id)}
                      disabled={loading}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={18} /> Fraud
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
