import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Stethoscope,
  ChevronRight,
  Phone,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from '../store/slices/authSlice';
import axios from 'axios';

const Login = () => {
  const [role, setRole] = useState(null); // 'Patient' or 'Doctor'
  const [step, setStep] = useState(1); // 1: Role, 2: Phone, 3: OTP
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNext = async () => {
    setError('');
    try {
      if (step === 1 && role) setStep(2);
      else if (step === 2 && phone.length >= 10) {
        // Send OTP via Backend
        await axios.post('http://localhost:5000/api/auth/send-otp', { phone });
        setStep(3);
      } else if (step === 3 && otp.length === 6) {
        dispatch(loginStart());
        const res = await axios.post(
          'http://localhost:5000/api/auth/verify-otp',
          {
            phone,
            otp,
            role,
            name: `Dummy ${role}`, // Hack for quick registration
          },
        );

        if (res.data.success) {
          dispatch(
            loginSuccess({
              user: res.data.data.user,
              token: res.data.data.token,
            }),
          );
          if (role === 'Doctor') navigate('/doctor-dashboard');
          else navigate('/patient-dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      dispatch(loginFailure(err.response?.data?.message));
    }
  };

  return (
    <div className='min-h-screen bg-secondary/30 flex items-center justify-center p-4'>
      <div className='absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(46,204,113,0.1),transparent)]' />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-primary/5 p-10 relative overflow-hidden'
      >
        {/* Progress Bar */}
        <div className='flex gap-2 mb-6'>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'medical-gradient' : 'bg-secondary'}`}
            />
          ))}
        </div>

        {error && (
          <div className='mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center'>
            {error}
          </div>
        )}

        <AnimatePresence mode='wait'>
          {step === 1 && (
            <motion.div
              key='step1'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='space-y-8'
            >
              <div className='text-center'>
                <h2 className='text-3xl font-black text-text mb-2'>Welcome!</h2>
                <p className='text-slate-500'>
                  How would you like to use HealthCare?
                </p>
              </div>

              <div className='space-y-4'>
                <button
                  onClick={() => setRole('Patient')}
                  className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all group ${role === 'Patient' ? 'border-primary bg-primary/5' : 'border-secondary hover:border-primary/50'}`}
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${role === 'Patient' ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}
                    >
                      <User size={28} />
                    </div>
                    <div className='text-left'>
                      <h4 className='font-bold text-text'>As a Patient</h4>
                      <p className='text-xs text-slate-500'>
                        Book appointments & consult doctors
                      </p>
                    </div>
                  </div>
                  {role === 'Patient' && (
                    <CheckCircle2 className='text-primary' />
                  )}
                </button>

                <button
                  onClick={() => setRole('Doctor')}
                  className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all group ${role === 'Doctor' ? 'border-primary bg-primary/5' : 'border-secondary hover:border-primary/50'}`}
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${role === 'Doctor' ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}
                    >
                      <Stethoscope size={28} />
                    </div>
                    <div className='text-left'>
                      <h4 className='font-bold text-text'>As a Doctor</h4>
                      <p className='text-xs text-slate-500'>
                        Manage appointments & patients
                      </p>
                    </div>
                  </div>
                  {role === 'Doctor' && (
                    <CheckCircle2 className='text-primary' />
                  )}
                </button>
              </div>

              <button
                disabled={!role}
                onClick={handleNext}
                className='w-full bg-text text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-black transition-colors'
              >
                Continue <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key='step2'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='space-y-8'
            >
              <div className='text-center'>
                <h2 className='text-3xl font-black text-text mb-2'>Register</h2>
                <p className='text-slate-500'>
                  Please enter your phone number to proceed.
                </p>
              </div>

              <div className='space-y-6'>
                <div className='relative'>
                  <Phone
                    className='absolute left-6 top-1/2 -translate-y-1/2 text-slate-400'
                    size={20}
                  />
                  <input
                    type='tel'
                    placeholder='Enter phone number'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className='w-full bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none rounded-2xl py-5 pl-16 pr-6 font-bold text-lg transition-all'
                  />
                </div>
              </div>

              <div className='flex gap-4'>
                <button
                  onClick={() => setStep(1)}
                  className='flex-1 bg-secondary text-text py-5 rounded-2xl font-bold'
                >
                  Back
                </button>
                <button
                  disabled={phone.length < 10}
                  onClick={handleNext}
                  className='flex-[2] bg-primary text-white py-5 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors'
                >
                  Send OTP
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key='step3'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='space-y-8'
            >
              <div className='text-center'>
                <h2 className='text-3xl font-black text-text mb-2'>
                  Verify OTP
                </h2>
                <p className='text-slate-500'>
                  We've sent a code to{' '}
                  <span className='font-bold text-text'>+{phone}</span>
                </p>
              </div>

              <div className='space-y-6'>
                <div className='relative'>
                  <Lock
                    className='absolute left-6 top-1/2 -translate-y-1/2 text-slate-400'
                    size={20}
                  />
                  <input
                    type='text'
                    maxLength={6}
                    placeholder='Enter 6-digit code'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className='w-full bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none rounded-2xl py-5 pl-16 pr-6 font-black text-2xl tracking-[1em] text-center'
                  />
                </div>
                <button className='text-primary font-bold text-sm hover:underline block mx-auto'>
                  Resend Code in 00:54
                </button>
                <div className='text-center mt-2 p-2 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200'>
                  MVP Mode: Use dummy OTP <strong>123456</strong>
                </div>
              </div>

              <div className='flex gap-4'>
                <button
                  onClick={() => setStep(2)}
                  className='flex-1 bg-secondary text-text py-5 rounded-2xl font-bold'
                >
                  Back
                </button>
                <button
                  disabled={otp.length < 6}
                  onClick={handleNext}
                  className='flex-[2] bg-primary text-white py-5 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors'
                >
                  Verify & Enter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Decorative */}
      <div className='hidden lg:block fixed bottom-10 left-10 opacity-20 transform -rotate-12'>
        <Stethoscope size={200} className='text-primary' />
      </div>
    </div>
  );
};

export default Login;
