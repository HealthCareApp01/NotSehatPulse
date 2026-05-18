import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, MapPin, X, ShieldCheck, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { setSearchTerm } from '../store/slices/productSlice';

const specialties = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist'];

const getDoctorImage = (specialization) => {
  const spec = (specialization || '').toLowerCase();
  if (spec.includes('cardio')) return 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=300&h=300';
  if (spec.includes('derma')) return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300';
  if (spec.includes('pediat') || spec.includes('child')) return 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300';
  if (spec.includes('neuro')) return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300';
  return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300';
};

const DoctorAvatar = ({ doctor, className }) => {
  const [imgError, setImgError] = useState(false);
  const nameClean = (doctor.userId?.name || '').replace('Dr. ', '');
  const initials = nameClean
    ? nameClean.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'DR';

  if (imgError || !getDoctorImage(doctor.specialization)) {
    return (
      <div className={`bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary text-2xl ${className}`}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={getDoctorImage(doctor.specialization)}
      alt={doctor.userId?.name}
      onError={() => setImgError(true)}
      className={className}
    />
  );
};

const FindDoctors = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { searchTerm } = useSelector((state) => state.products);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [error, setError] = useState('');

  const fetchDoctors = async (queryStr = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/profile/doctors', {
        params: { search: queryStr },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDoctors(response.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  // Run search when typing or changing pills
  useEffect(() => {
    const query = activeSpecialty === 'All' ? searchTerm : activeSpecialty;
    const delayDebounce = setTimeout(() => {
      fetchDoctors(query);
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, activeSpecialty]);

  const handlePillClick = (spec) => {
    setActiveSpecialty(spec);
    // Clear global text search if choosing a specific specialty
    if (spec !== 'All') {
      dispatch(setSearchTerm(''));
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-text flex items-center gap-3">
            Find Verified Doctors <Sparkles className="text-primary animate-pulse" size={28} />
          </h1>
          <p className="text-slate-500 mt-2">Book instant consultations with top rated specialists.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-secondary shadow-sm space-y-6">
        {/* Filter Pills */}

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider mr-2">Specialty:</span>
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => handlePillClick(spec)}
              className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                activeSpecialty === spec
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                  : 'bg-secondary text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-bold text-center">
          {error}
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-slate-50 text-slate-500 p-20 rounded-[40px] border border-secondary text-center">
          <p className="font-bold text-lg">No verified specialists found matching your search.</p>
          <button
            onClick={() => {
              dispatch(setSearchTerm(''));
              setActiveSpecialty('All');
            }}
            className="mt-4 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {doctors.map((doc) => (
              <motion.div
                key={doc._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -8 }}
                onClick={() => setActiveDoctor(doc)}
                className="bg-white rounded-[32px] p-6 shadow-sm border border-secondary hover:shadow-xl hover:shadow-primary/10 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Doctor Card Top Banner/Image */}
                  <div className="relative overflow-hidden rounded-2xl h-44 bg-slate-100">
                    <DoctorAvatar
                      doctor={doc}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-xs font-black shadow-sm">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      {doc.rating || '4.8'}
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg text-text group-hover:text-primary transition-colors">
                        {doc.userId?.name || 'Verified Specialist'}
                      </h3>
                      {doc.verified && <ShieldCheck className="text-primary" size={18} />}
                    </div>
                    <p className="text-primary font-bold text-xs uppercase tracking-wider mt-1">
                      {doc.specialization || 'General Practitioner'}
                    </p>
                    <p className="text-slate-400 font-bold text-xs mt-0.5">
                      {doc.degree || 'MBBS'}
                    </p>
                  </div>

                  {/* Badges / Quick stats */}
                  <div className="flex gap-4 text-xs font-bold text-slate-500 pt-2">
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-slate-400" />
                      <span>{doc.experience || '5+'} Yrs Exp</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={16} className="text-slate-400" />
                      <span>₹{doc.consultationFee || '500'} Fee</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-secondary mt-6 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online Booking</span>
                  <button className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm">
                    View Profile
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Doctor Profile Modal Detail Popup */}
      <AnimatePresence>
        {activeDoctor && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-[40px] max-w-lg w-full overflow-hidden shadow-2xl relative border border-secondary flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveDoctor(null)}
                className="absolute top-6 right-6 bg-secondary/80 hover:bg-slate-200 text-slate-500 hover:text-text w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Top Banner Cover */}
              <div className="h-32 bg-primary/10 w-full" />

              {/* Profile Details Container */}
              <div className="px-8 pb-8 pt-0 relative -mt-16 flex-1 overflow-y-auto space-y-6">
                {/* Profile Header Block */}
                <div className="flex gap-5 items-end">
                  <DoctorAvatar
                    doctor={activeDoctor}
                    className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-slate-100"
                  />
                  <div className="pb-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-text leading-none">
                        {activeDoctor.userId?.name}
                      </h2>
                      {activeDoctor.verified && <ShieldCheck className="text-primary" size={20} />}
                    </div>
                    <p className="text-primary font-bold text-sm tracking-wider uppercase">
                      {activeDoctor.specialization || 'Verified Specialist'}
                    </p>
                    <p className="text-slate-400 font-bold text-xs">
                      {activeDoctor.degree || 'MBBS'}
                    </p>
                  </div>
                </div>

                {/* Stat Cards Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-secondary/30 p-4 rounded-2xl text-center">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Rating</span>
                    <span className="text-lg font-black text-text flex items-center justify-center gap-1 mt-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      {activeDoctor.rating || '4.8'}
                    </span>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-2xl text-center">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Experience</span>
                    <span className="text-lg font-black text-text block mt-1">
                      {activeDoctor.experience || '5+'} Yrs
                    </span>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-2xl text-center">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Fee</span>
                    <span className="text-lg font-black text-text block mt-1">
                      ₹{activeDoctor.consultationFee || '500'}
                    </span>
                  </div>
                </div>

                {/* About/Bio Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">About Doctor</h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border border-secondary">
                    {activeDoctor.bio ||
                      `Experienced specialist dedicated to providing comprehensive and compassionate patient care. Expert in diagnosis, preventative wellness advice, and managing targeted health treatments.`}
                  </p>
                </div>

                {/* Availability Slots */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Weekly Availability</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeDoctor.availability && activeDoctor.availability.length > 0 ? (
                      activeDoctor.availability.map((sched, idx) => (
                        <div key={idx} className="bg-white border border-secondary p-3 rounded-xl flex flex-col items-center min-w-[90px] shadow-sm">
                          <span className="text-[10px] text-primary font-bold uppercase">{sched.day}</span>
                          <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase">
                            {sched.slots && sched.slots.length > 0 ? `${sched.slots[0]}` : '9AM - 5PM'}
                          </span>
                        </div>
                      ))
                    ) : (
                      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                        <div key={day} className="bg-white border border-secondary px-4 py-2.5 rounded-xl flex flex-col items-center min-w-[80px]">
                          <span className="text-[10px] text-primary font-bold uppercase">{day}</span>
                          <span className="text-[9px] text-slate-400 font-bold mt-1">10AM - 4PM</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Booking Button */}
                <button className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5">
                  <Calendar size={18} /> Book Appointment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FindDoctors;