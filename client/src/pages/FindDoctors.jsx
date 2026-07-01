import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, MapPin, X, ShieldCheck, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { setSearchTerm } from '../store/slices/productSlice';
import { bookAppointment, resetBookingSuccess } from '../store/slices/appointmentSlice';
import AuthModal from '../components/AuthModal';
import { io } from 'socket.io-client';

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
  const nameClean = (doctor.userId?.name || '').replace('Dr. ', '');
  const initials = nameClean
    ? nameClean.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'DR';

  if (doctor.userId?.profilePicture) {
    return (
      <img
        src={doctor.userId.profilePicture}
        alt={doctor.userId?.name}
        className={`block object-cover ${className}`}
      />
    );
  }

  if (!getDoctorImage(doctor.specialization)) {
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
      className={`block object-cover object-top ${className}`}
    />
  );
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const FindDoctors = () => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const { searchTerm } = useSelector((state) => state.products);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(-1);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [platformPaymentError, setPlatformPaymentError] = useState('');
  const [platformSubSuccess, setPlatformSubSuccess] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.autoSelectDoctorId && doctors.length > 0) {
      const matched = doctors.find(doc => 
        doc._id === location.state.autoSelectDoctorId || 
        doc.userId?._id === location.state.autoSelectDoctorId
      );
      if (matched) {
        setActiveDoctor(matched);
      }
    }
  }, [doctors, location.state]);

  const { bookingSuccess } = useSelector((state) => state.appointments);

  const upcomingDates = React.useMemo(() => {
    const dates = [];
    const current = new Date();
    while (dates.length < 6) {
      if (current.getDay() !== 0) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, []);

  // Check active subscription on mount
  useEffect(() => {
    const checkSub = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/subscriptions/check/active', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success && response.data.hasActiveSubscription) {
          setHasActiveSubscription(true);
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    };
    if (token) checkSub();
  }, [token]);

  // When a new doctor is clicked, reset the selected slot
  useEffect(() => {
    setSelectedSlotIndex(-1);
  }, [activeDoctor]);

  // Handle successful booking overlay close
  useEffect(() => {
    if (bookingSuccess) {
      const timer = setTimeout(() => {
        setActiveDoctor(null);
        dispatch(resetBookingSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [bookingSuccess, dispatch]);

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

  const handleBook = async () => {
    if (!activeDoctor) return;
    
    if (!isAuthenticated) {
      setPendingAction(() => () => handleBook());
      setShowAuthModal(true);
      return;
    }
    
    setPaymentError('');
    setPaymentLoading(true);
    
    const selectedDate = upcomingDates[selectedSlotIndex] || new Date();
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
    
    let timeSlot = '10:00 AM - 4:00 PM';
    
    if (activeDoctor.availability && activeDoctor.availability.length > 0) {
      const sched = activeDoctor.availability.find(a => a.day === dayName);
      if (sched && sched.slots && sched.slots.length > 0) {
        timeSlot = sched.slots[0];
      }
    }
    
    const formattedSlot = `${dayName} (${timeSlot})`;

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPaymentError('Failed to load Razorpay SDK. Please check your connection.');
        setPaymentLoading(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/appointments/pay/create-order',
        { doctorId: activeDoctor.userId?._id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const { order, keyId } = response.data;

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'heAlthI',
        description: `Consultation Booking - Dr. ${activeDoctor.userId?.name}`,
        image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=300&h=300',
        order_id: order.id,
        handler: async function (paymentResponse) {
          try {
            setPaymentLoading(true);
            await dispatch(bookAppointment({
              doctorId: activeDoctor.userId?._id,
              date: selectedDate,
              timeSlot: formattedSlot,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            })).unwrap();
            
            const socket = window.socketRef || io('http://localhost:5000');
            socket.emit('new-appointment', activeDoctor.userId?._id);
            
          } catch (err) {
            console.error('Booking confirmation failed:', err);
            setPaymentError(err || 'Verification failed. Could not book appointment.');
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: 'Patient Name',
          email: 'patient@example.com'
        },
        theme: {
          color: '#059669'
        },
        modal: {
          ondismiss: function () {
            setPaymentError('Payment cancelled. Appointment booking failed.');
            setPaymentLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (resp) {
        setPaymentError(`Payment failed: ${resp.error.description || 'Reason unknown'}`);
        setPaymentLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error('Error in appointment payment flow:', err);
      setPaymentError(err.response?.data?.message || 'Failed to initiate payment.');
      setPaymentLoading(false);
    }
  };



  const handlePlatformSubscribe = async () => {
    if (!isAuthenticated) {
      setPendingAction(() => () => handlePlatformSubscribe());
      setShowAuthModal(true);
      return;
    }

    setPlatformPaymentError('');
    setPaymentLoading(true);
    
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPlatformPaymentError('Failed to load Razorpay SDK. Please check your connection.');
        setPaymentLoading(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/subscriptions/pay/create-order',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const { order, keyId } = response.data;

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'heAlthI',
        description: `Platform Chat Subscription (All Specialists)`,
        image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=300&h=300',
        order_id: order.id,
        handler: async function (paymentResponse) {
          try {
            setPaymentLoading(true);
            const subRes = await axios.post(
              'http://localhost:5000/api/subscriptions/subscribe',
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            if (subRes.data.success) {
              setPlatformSubSuccess(true);
            } else {
              setPlatformPaymentError('Subscription creation failed on server.');
            }
          } catch (err) {
            console.error('Subscription confirmation failed:', err);
            setPlatformPaymentError(err.response?.data?.message || 'Verification failed. Could not register subscription.');
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: 'Patient Name',
          email: 'patient@example.com'
        },
        theme: {
          color: '#059669'
        },
        modal: {
          ondismiss: function () {
            setPlatformPaymentError('Payment cancelled. Chat subscription booking failed.');
            setPaymentLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (resp) {
        setPlatformPaymentError(`Payment failed: ${resp.error.description || 'Reason unknown'}`);
        setPaymentLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error('Error in subscription payment flow:', err);
      setPlatformPaymentError(err.response?.data?.message || 'Failed to initiate subscription payment.');
      setPaymentLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          if (pendingAction) pendingAction();
          setPendingAction(null);
        }}
      />
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-text flex items-center gap-3">
            Find Verified Doctors <Sparkles className="text-primary animate-pulse" size={28} />
          </h1>
          <p className="text-slate-500 mt-2">Book instant consultations with top rated specialists.</p>
        </div>
      </div>

      {/* Platform Subscription Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-6 rounded-[32px] flex flex-col items-stretch gap-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-black text-primary flex items-center gap-2">
              ✨ Health Chat Plan — ₹299/month
            </h2>
            <p className="text-sm font-medium text-slate-600 mt-2 max-w-xl leading-relaxed">
              Chat with specialists across all departments for minor health queries. 
              Just type your symptoms, and our smart routing automatically assigns the right expert!
            </p>
          </div>
          <button
            onClick={handlePlatformSubscribe}
            disabled={paymentLoading || platformSubSuccess || hasActiveSubscription}
            className={`px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg whitespace-nowrap ${
              (platformSubSuccess || hasActiveSubscription) 
                ? 'bg-emerald-100 text-emerald-700 shadow-none cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-dark text-white shadow-primary/20'
            }`}
          >
            {(platformSubSuccess || hasActiveSubscription) ? 'Subscribed ✓' : 'Subscribe Now →'}
          </button>
        </div>
        {platformPaymentError && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 p-3 rounded-xl font-bold text-xs animate-shake w-full mt-2">
            ⚠️ {platformPaymentError}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-secondary shadow-sm space-y-6">
        {/* Filter Pills */}

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider mr-2">Speciality:</span>
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
                  <div className="relative overflow-hidden rounded-2xl h-44 bg-slate-100 flex items-center justify-center">
                    <DoctorAvatar
                      doctor={doc}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
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
              className="bg-white rounded-[40px] max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl relative border border-secondary flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveDoctor(null)}
                className="absolute top-6 right-6 bg-secondary/80 hover:bg-slate-200 text-slate-500 hover:text-text w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Top Banner Cover */}
              <div className="h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/30 w-full flex-shrink-0" />

              {/* Profile Details Container */}
              <div className="px-8 pb-8 pt-0 relative -mt-14 flex-1 overflow-y-auto space-y-6">
                {/* Profile Header Block */}
                <div className="flex gap-5 items-end">
                  <div className="flex-shrink-0">
                    <DoctorAvatar
                      doctor={activeDoctor}
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg bg-slate-100"
                    />
                  </div>
                  <div className="pb-1 space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-black text-text leading-tight">
                        {activeDoctor.userId?.name}
                      </h2>
                      {activeDoctor.verified && <ShieldCheck className="text-primary flex-shrink-0" size={18} />}
                    </div>
                    <p className="text-primary font-bold text-xs tracking-wider uppercase">
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
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Select Availability Slot</h4>
                  <div className="flex flex-wrap gap-2">
                    {upcomingDates.map((dateObj, idx) => {
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      let timeSlot = '10:00 AM - 4:00 PM';
                      
                      if (activeDoctor.availability && activeDoctor.availability.length > 0) {
                        const sched = activeDoctor.availability.find(a => a.day === dayName);
                        if (sched && sched.slots && sched.slots.length > 0) {
                          timeSlot = sched.slots[0];
                        } else {
                          timeSlot = 'Unavailable';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => timeSlot !== 'Unavailable' && setSelectedSlotIndex(idx)}
                          disabled={timeSlot === 'Unavailable'}
                          className={`border p-3 rounded-xl flex flex-col items-center min-w-[90px] shadow-sm transition-all ${
                            timeSlot === 'Unavailable' ? 'opacity-50 cursor-not-allowed bg-slate-50' : 
                            selectedSlotIndex === idx
                              ? 'bg-primary/10 border-primary scale-105 cursor-pointer'
                              : 'bg-white border-secondary hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          <span className={`text-[10px] font-bold uppercase ${selectedSlotIndex === idx ? 'text-primary' : 'text-slate-500'}`}>{dayName}, {dateStr}</span>
                          <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">
                            {timeSlot}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>



                {/* Error Banner */}
                {paymentError && (
                  <div className="bg-rose-50 text-rose-600 border border-rose-100 p-4 rounded-2xl font-bold text-xs text-center animate-shake">
                    ⚠️ {paymentError}
                  </div>
                )}

                {/* Booking Button */}
                <button
                  onClick={handleBook}
                  disabled={paymentLoading || selectedSlotIndex === -1}
                  className="w-full bg-primary disabled:bg-slate-300 text-white py-4 rounded-2xl font-black text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  {paymentLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Calendar size={18} /> Book Appointment (₹{activeDoctor.consultationFee || 500})
                    </>
                  )}
                </button>
              </div>

              {/* SehatPulse Premium Booking Success Confirmed Overlay */}
              {bookingSuccess ? (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-8 space-y-4 z-50 rounded-[40px] text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary"
                  >
                    <ShieldCheck size={48} />
                  </motion.div>
                  <h3 className="text-2xl font-black text-text">Booking Confirmed!</h3>
                  <p className="text-sm font-medium text-slate-500 max-w-xs">
                    Your appointment is booked. Your shopping cart has been successfully emptied!
                  </p>
                  <div className="w-10 h-1 border-2 border-primary border-t-transparent rounded-full animate-spin mt-4" />
                </div>
              ) : null}

              {/* SehatPulse Premium Subscription Success Confirmed Overlay */}
              {platformSubSuccess ? (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-8 space-y-4 z-50 rounded-[40px] text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary"
                  >
                    <Sparkles size={48} />
                  </motion.div>
                  <h3 className="text-2xl font-black text-text">Health Chat Active!</h3>
                  <p className="text-sm font-medium text-slate-500 max-w-xs">
                    You can now enjoy smart-routed direct chat for minor health queries for the next 30 days!
                  </p>
                  <button
                    onClick={() => {
                      setPlatformSubSuccess(false);
                      setActiveDoctor(null);
                      navigate('/chat');
                    }}
                    className="mt-6 bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer"
                  >
                    Start Chatting Now <Sparkles size={16} />
                  </button>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FindDoctors;