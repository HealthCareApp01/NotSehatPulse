import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Stethoscope,
  ChevronRight,
  Mail,
  Lock,
  CheckCircle2,
  Type,
  X
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from '../store/slices/authSlice';
import axios from 'axios';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      setIsLogin(true);
      setRole(null);
      setStep(1);
      setName('');
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          if (onSuccess) onSuccess();
          onClose();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
        dispatch(loginFailure(err.response?.data?.message));
      }
    } else {
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
          if (onSuccess) onSuccess();
          onClose();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Signup failed');
        dispatch(loginFailure(err.response?.data?.message));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-2xl relative overflow-hidden p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X size={20} />
        </button>

        {!isLogin && (
          <div className="flex gap-2 mb-6 pr-10">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'medical-gradient' : 'bg-secondary'}`}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center mt-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className={!error && isLogin ? 'mt-4' : ''}>
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-black text-text mb-2">Welcome Back!</h2>
                  <p className="text-slate-500">Login to continue</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none rounded-2xl py-4 pl-16 pr-6 font-bold text-lg transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none rounded-2xl py-4 pl-16 pr-6 font-bold text-lg transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
                >
                  Login
                </button>

                <p className="text-center text-sm text-slate-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setStep(1); setError(''); }}
                    className="text-primary font-bold hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="signup-step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-black text-text mb-2">Create Account</h2>
                  <p className="text-slate-500">How would you like to use HealthCare?</p>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setRole('Patient')}
                    className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all group ${role === 'Patient' ? 'border-primary bg-primary/5' : 'border-secondary hover:border-primary/50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${role === 'Patient' ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}>
                        <UserIcon size={24} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-text">As a Patient</h4>
                        <p className="text-xs text-slate-500">Book appointments & consult</p>
                      </div>
                    </div>
                    {role === 'Patient' && <CheckCircle2 className="text-primary" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('Doctor')}
                    className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all group ${role === 'Doctor' ? 'border-primary bg-primary/5' : 'border-secondary hover:border-primary/50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${role === 'Doctor' ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}>
                        <Stethoscope size={24} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-text">As a Doctor</h4>
                        <p className="text-xs text-slate-500">Manage patients</p>
                      </div>
                    </div>
                    {role === 'Doctor' && <CheckCircle2 className="text-primary" />}
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!role}
                  onClick={() => handleAuth()}
                  className="w-full bg-text text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-black transition-colors"
                >
                  Continue <ChevronRight size={20} />
                </button>

                <p className="text-center text-sm text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className="text-primary font-bold hover:underline"
                  >
                    Login
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup-step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-black text-text mb-2">Register</h2>
                  <p className="text-slate-500">Enter your details as a {role}</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Type className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none rounded-2xl py-4 pl-16 pr-6 font-bold text-lg transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none rounded-2xl py-4 pl-16 pr-6 font-bold text-lg transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      placeholder="Create Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none rounded-2xl py-4 pl-16 pr-6 font-bold text-lg transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-secondary text-text py-4 rounded-2xl font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthModal;
