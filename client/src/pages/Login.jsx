import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Stethoscope,
  ChevronRight,
  Mail,
  Lock,
  CheckCircle2,
  Type
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from '../store/slices/authSlice';
import axios from 'axios';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(null); // 'Patient' or 'Doctor' - used for signup
  const [step, setStep] = useState(1); // 1: Role, 2: Details (for signup)

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Doctor') navigate('/doctor-dashboard', { replace: true });
      else navigate('/patient-dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleAuth = async (e) => {
    e?.preventDefault();
    setError('');

    if (isLogin) {
      if (!email || !password) return setError('Email and password required');

      dispatch(loginStart());
      try {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        if (res.data.success) {
          dispatch(loginSuccess({ user: res.data.data.user, token: res.data.data.token }));
          if (res.data.data.user.role === 'Doctor') navigate('/doctor-dashboard', { replace: true });
          else navigate('/patient-dashboard', { replace: true });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
        dispatch(loginFailure(err.response?.data?.message));
      }
    } else {
      // Signup Flow
      if (step === 1) {
        if (!role) return setError('Please select a role');
        setStep(2);
        return;
      }

      if (!name || !email || !password) return setError('All fields required');

      dispatch(loginStart());
      try {
        const res = await axios.post('http://localhost:5000/api/auth/signup', { name, email, password, role });
        if (res.data.success) {
          dispatch(loginSuccess({ user: res.data.data.user, token: res.data.data.token }));
          if (role === 'Doctor') navigate('/doctor-dashboard', { replace: true });
          else navigate('/patient-dashboard', { replace: true });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Signup failed');
        dispatch(loginFailure(err.response?.data?.message));
      }
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
        {/* Progress Bar for Signup */}
        {!isLogin && (
          <div className='flex gap-2 mb-6'>
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'medical-gradient' : 'bg-secondary'}`}
              />
            ))}
          </div>
        )}

        {error && (
          <div className='mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center'>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <AnimatePresence mode='wait'>
            {isLogin ? (
              <motion.div
                key='login'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className='space-y-8'
              >
                <div className='text-center'>
                  <h2 className='text-3xl font-black text-text mb-2'>Welcome Back!</h2>
                  <p className='text-slate-500'>Login to your account</p>
                </div>

                <div className='space-y-4'>
                  <div className='relative'>
                    <Mail className='absolute left-6 top-1/2 -translate-y-1/2 text-slate-400' size={20} />
                    <input
                      type='email'
                      placeholder='Email address'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='w-full bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none rounded-2xl py-5 pl-16 pr-6 font-bold text-lg transition-all'
                    />
                  </div>
                  <div className='relative'>
                    <Lock className='absolute left-6 top-1/2 -translate-y-1/2 text-slate-400' size={20} />
                    <input
                      type='password'
                      placeholder='Password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className='w-full bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none rounded-2xl py-5 pl-16 pr-6 font-bold text-lg transition-all'
                    />
                  </div>
                </div>

                <button
                  type='submit'
                  className='w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors'
                >
                  Login
                </button>

                <p className='text-center text-sm text-slate-500'>
                  Don't have an account?{' '}
                  <button
                    type='button'
                    onClick={() => { setIsLogin(false); setStep(1); setError(''); }}
                    className='text-primary font-bold hover:underline'
                  >
                    Sign up
                  </button>
                </p>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key='signup-step1'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className='space-y-8'
              >
                <div className='text-center'>
                  <h2 className='text-3xl font-black text-text mb-2'>Create Account</h2>
                  <p className='text-slate-500'>How would you like to use HealthCare?</p>
                </div>

                <div className='space-y-4'>
                  <button
                    type='button'
                    onClick={() => setRole('Patient')}
                    className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all group ${role === 'Patient' ? 'border-primary bg-primary/5' : 'border-secondary hover:border-primary/50'}`}
                  >
                    <div className='flex items-center gap-4'>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${role === 'Patient' ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}>
                        <UserIcon size={28} />
                      </div>
                      <div className='text-left'>
                        <h4 className='font-bold text-text'>As a Patient</h4>
                        <p className='text-xs text-slate-500'>Book appointments & consult doctors</p>
                      </div>
                    </div>
                    {role === 'Patient' && <CheckCircle2 className='text-primary' />}
                  </button>

                  <button
                    type='button'
                    onClick={() => setRole('Doctor')}
                    className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all group ${role === 'Doctor' ? 'border-primary bg-primary/5' : 'border-secondary hover:border-primary/50'}`}
                  >
                    <div className='flex items-center gap-4'>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${role === 'Doctor' ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}>
                        <Stethoscope size={28} />
                      </div>
                      <div className='text-left'>
                        <h4 className='font-bold text-text'>As a Doctor</h4>
                        <p className='text-xs text-slate-500'>Manage appointments & patients</p>
                      </div>
                    </div>
                    {role === 'Doctor' && <CheckCircle2 className='text-primary' />}
                  </button>
                </div>

                <button
                  type='button'
                  disabled={!role}
                  onClick={() => handleAuth()}
                  className='w-full bg-text text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-black transition-colors'
                >
                  Continue <ChevronRight size={20} />
                </button>

                <p className='text-center text-sm text-slate-500'>
                  Already have an account?{' '}
                  <button
                    type='button'
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className='text-primary font-bold hover:underline'
                  >
                    Login
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key='signup-step2'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className='space-y-8'
              >
                <div className='text-center'>
                  <h2 className='text-3xl font-black text-text mb-2'>Register</h2>
                  <p className='text-slate-500'>Enter your details to register as a {role}</p>
                </div>

                <div className='space-y-4'>
                  <div className='relative'>
                    <Type className='absolute left-6 top-1/2 -translate-y-1/2 text-slate-400' size={20} />
                    <input
                      type='text'
                      placeholder='Full Name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className='w-full bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none rounded-2xl py-5 pl-16 pr-6 font-bold text-lg transition-all'
                    />
                  </div>
                  <div className='relative'>
                    <Mail className='absolute left-6 top-1/2 -translate-y-1/2 text-slate-400' size={20} />
                    <input
                      type='email'
                      placeholder='Email address'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='w-full bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none rounded-2xl py-5 pl-16 pr-6 font-bold text-lg transition-all'
                    />
                  </div>
                  <div className='relative'>
                    <Lock className='absolute left-6 top-1/2 -translate-y-1/2 text-slate-400' size={20} />
                    <input
                      type='password'
                      placeholder='Create Password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className='w-full bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none rounded-2xl py-5 pl-16 pr-6 font-bold text-lg transition-all'
                    />
                  </div>
                </div>

                <div className='flex gap-4'>
                  <button
                    type='button'
                    onClick={() => setStep(1)}
                    className='flex-1 bg-secondary text-text py-5 rounded-2xl font-bold'
                  >
                    Back
                  </button>
                  <button
                    type='submit'
                    className='flex-[2] bg-primary text-white py-5 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors'
                  >
                    Sign Up
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* Decorative */}
      <div className='hidden lg:block fixed bottom-10 left-10 opacity-20 transform -rotate-12'>
        <Stethoscope size={200} className='text-primary' />
      </div>
    </div>
  );
};

export default Login;
